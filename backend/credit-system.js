// FresCoop Credit & Repayment System
// 4 layers of security: instant deduction, progressive rate, solidarity caution, guarantee fund

const PROGRESSIVE_RATES = [
  { max: 75000, rate: 0 },      // < 75K: pause, minimum vital protected
  { max: 150000, rate: 0.15 },  // 75K-150K: light rate
  { max: 300000, rate: 0.25 },  // 150K-300K: normal repayment
  { max: Infinity, rate: 0.30 },// > 300K: accelerated
];

const GUARANTEE_FUND_RATE = 0.02; // 2% of each transaction goes to guarantee fund
const SOLIDARITY_GROUP_SIZE = 5;
const MAX_LOAN_DURATION_MONTHS = 12;

export function calculateDeductionRate(monthlyRevenue) {
  for (const bracket of PROGRESSIVE_RATES) {
    if (monthlyRevenue <= bracket.max) return bracket.rate;
  }
  return 0.30;
}

export function processPayment(amount, seller, store) {
  const loan = getActiveLoan(seller.id, store);
  if (!loan) {
    return { sellerReceives: amount, deducted: 0, guaranteeFund: 0 };
  }

  const rate = calculateDeductionRate(getMonthlyRevenue(seller.id, store));
  const deducted = Math.round(amount * rate);
  const guaranteeFund = Math.round(amount * GUARANTEE_FUND_RATE);
  const sellerReceives = amount - deducted - guaranteeFund;

  return {
    sellerReceives,
    deducted,
    guaranteeFund,
    rate,
    loanId: loan.id,
    remainingBalance: loan.remainingBalance - deducted,
  };
}

export function getActiveLoan(userId, store) {
  const loans = store.loans || [];
  return loans.find(l => l.userId === userId && l.status === 'active' && l.remainingBalance > 0);
}

export function getMonthlyRevenue(userId, store) {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 3600 * 1000;
  const payments = (store.payments || []).filter(
    p => p.sellerId === userId && p.status === 'Paye' && new Date(p.createdAt).getTime() > thirtyDaysAgo
  );
  return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
}

export function createLoan(userId, amount, store) {
  const id = `loan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const loan = {
    id,
    userId,
    amount,
    remainingBalance: amount,
    status: 'active',
    deductions: [],
    createdAt: new Date().toISOString(),
    estimatedRepaymentMonths: null,
  };

  if (!store.loans) store.loans = [];
  store.loans.push(loan);

  if (!store.guaranteeFund) store.guaranteeFund = { balance: 0, transactions: [] };

  return loan;
}

export function applyDeduction(loanId, amount, paymentId, store) {
  const loan = (store.loans || []).find(l => l.id === loanId);
  if (!loan) return null;

  loan.remainingBalance = Math.max(0, loan.remainingBalance - amount);
  loan.deductions.push({
    amount,
    paymentId,
    date: new Date().toISOString(),
    remainingAfter: loan.remainingBalance,
  });

  if (loan.remainingBalance <= 0) {
    loan.status = 'repaid';
    loan.repaidAt = new Date().toISOString();
  }

  return loan;
}

export function addToGuaranteeFund(amount, paymentId, store) {
  if (!store.guaranteeFund) store.guaranteeFund = { balance: 0, transactions: [] };
  store.guaranteeFund.balance += amount;
  store.guaranteeFund.transactions.push({
    amount,
    paymentId,
    date: new Date().toISOString(),
  });
}

export function getSolidarityGroup(userId, store) {
  const groups = store.solidarityGroups || [];
  return groups.find(g => g.members.includes(userId));
}

export function createSolidarityGroup(memberIds, store) {
  if (memberIds.length !== SOLIDARITY_GROUP_SIZE) {
    throw new Error(`Un groupe solidaire doit avoir exactement ${SOLIDARITY_GROUP_SIZE} membres`);
  }
  const id = `group_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const group = {
    id,
    members: memberIds,
    createdAt: new Date().toISOString(),
    status: 'active',
  };

  if (!store.solidarityGroups) store.solidarityGroups = [];
  store.solidarityGroups.push(group);
  return group;
}

export function getLoanSummary(userId, store) {
  const loan = getActiveLoan(userId, store);
  if (!loan) return null;

  const monthlyRevenue = getMonthlyRevenue(userId, store);
  const rate = calculateDeductionRate(monthlyRevenue);
  const monthlyDeduction = monthlyRevenue * rate;
  const monthsRemaining = monthlyDeduction > 0
    ? Math.ceil(loan.remainingBalance / monthlyDeduction)
    : null;

  return {
    loanId: loan.id,
    originalAmount: loan.amount,
    remainingBalance: loan.remainingBalance,
    percentRepaid: Math.round((1 - loan.remainingBalance / loan.amount) * 100),
    currentRate: rate,
    monthlyRevenue,
    estimatedMonthsRemaining: monthsRemaining,
    totalDeducted: loan.deductions.reduce((s, d) => s + d.amount, 0),
    deductionCount: loan.deductions.length,
    group: getSolidarityGroup(userId, store),
  };
}

export function getCreditSystemStats(store) {
  const loans = store.loans || [];
  const active = loans.filter(l => l.status === 'active');
  const repaid = loans.filter(l => l.status === 'repaid');
  const defaulted = loans.filter(l => l.status === 'defaulted');
  const fund = store.guaranteeFund || { balance: 0 };

  return {
    totalLoans: loans.length,
    activeLoans: active.length,
    repaidLoans: repaid.length,
    defaultedLoans: defaulted.length,
    totalLent: loans.reduce((s, l) => s + l.amount, 0),
    totalRepaid: repaid.reduce((s, l) => s + l.amount, 0),
    defaultRate: loans.length > 0 ? (defaulted.length / loans.length * 100).toFixed(1) + '%' : '0%',
    guaranteeFundBalance: fund.balance,
    avgRepaymentMonths: repaid.length > 0
      ? (repaid.reduce((s, l) => {
          const start = new Date(l.createdAt).getTime();
          const end = new Date(l.repaidAt).getTime();
          return s + (end - start) / (30 * 24 * 3600 * 1000);
        }, 0) / repaid.length).toFixed(1)
      : null,
  };
}
