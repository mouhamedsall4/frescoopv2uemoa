import { describe, it, expect } from 'vitest';
import {
  normalizeStore,
  dedupeOrders,
  preservePrivateUserFields,
  mergeIncomingStore,
  mergeNotificationsPreservingRead,
  mergeLoansByDecision,
} from '../../backend/lib.js';

const emptyStore = {
  users: [],
  products: [],
  dossiers: [],
  attestations: [],
  transactions: [],
  proofs: [],
  hubs: [],
  activityProofs: [],
  orders: [],
  messages: [],
  notifications: [],
  lots: [],
  buyerOrders: [],
  reservations: [],
  paymentRecords: [],
  consentRecords: [],
  auditLogs: [],
  loans: [],
  loanRepayments: [],
  surveyLeads: [],
};

describe('normalizeStore', () => {
  it('returns correct structure from empty input', () => {
    const result = normalizeStore({}, emptyStore);
    expect(Object.keys(result).sort()).toEqual(Object.keys(emptyStore).sort());
    Object.values(result).forEach((v) => expect(Array.isArray(v)).toBe(true));
  });

  it('preserves valid arrays', () => {
    const input = { users: [{ id: 'u1' }], products: [{ id: 'p1' }] };
    const result = normalizeStore(input, emptyStore);
    expect(result.users).toHaveLength(1);
    expect(result.products).toHaveLength(1);
  });

  it('replaces non-array values with empty arrays', () => {
    const input = { users: 'not-an-array', products: 42 };
    const result = normalizeStore(input, emptyStore);
    expect(result.users).toEqual([]);
    expect(result.products).toEqual([]);
  });

  it('handles null input gracefully', () => {
    const result = normalizeStore(null, emptyStore);
    expect(result.users).toEqual([]);
  });
});

describe('dedupeOrders', () => {
  it('removes duplicate orders', () => {
    const order = {
      id: 'ord-1',
      createdAt: '2026-05-01',
      productId: 'prod-1',
      sellerId: 'seller-1',
      clientId: 'client-1',
      quantity: 5,
      unit: 'kg',
      unitPrice: 500,
      totalPrice: 2500,
      status: 'Nouvelle',
      paymentStatus: '',
      message: '',
    };
    const result = dedupeOrders([order, { ...order, id: 'ord-2' }]);
    expect(result).toHaveLength(1);
  });

  it('keeps orders with different data', () => {
    const order1 = { id: 'ord-1', createdAt: '2026-05-01', productId: 'p1', sellerId: 's1', clientId: 'c1', quantity: 5, status: 'Nouvelle' };
    const order2 = { id: 'ord-2', createdAt: '2026-05-01', productId: 'p2', sellerId: 's1', clientId: 'c1', quantity: 5, status: 'Nouvelle' };
    const result = dedupeOrders([order1, order2]);
    expect(result).toHaveLength(2);
  });

  it('handles empty/invalid input', () => {
    expect(dedupeOrders([])).toEqual([]);
    expect(dedupeOrders(null)).toEqual([]);
    expect(dedupeOrders([null, undefined])).toEqual([]);
  });
});

describe('preservePrivateUserFields', () => {
  it('preserves passwordHash from current store when incoming has none', () => {
    const current = { users: [{ id: 'u1', email: 'a@b.com', passwordHash: 'secret123' }] };
    const incoming = { users: [{ id: 'u1', email: 'a@b.com' }] };
    const result = preservePrivateUserFields(incoming, current);
    expect(result.users[0].passwordHash).toBe('secret123');
  });

  it('allows explicit passwordHash from incoming (admin creation)', () => {
    const current = { users: [{ id: 'u1', email: 'a@b.com', passwordHash: 'old' }] };
    const incoming = { users: [{ id: 'u1', email: 'a@b.com', passwordHash: 'new' }] };
    const result = preservePrivateUserFields(incoming, current);
    expect(result.users[0].passwordHash).toBe('new');
  });

  it('handles new users not in current store', () => {
    const current = { users: [] };
    const incoming = { users: [{ id: 'u-new', email: 'new@b.com', passwordHash: 'hash' }] };
    const result = preservePrivateUserFields(incoming, current);
    expect(result.users[0].passwordHash).toBe('hash');
  });

  it('matches by email when id differs', () => {
    const current = { users: [{ id: 'u1', email: 'Test@B.com', passwordHash: 'secret' }] };
    const incoming = { users: [{ id: 'u1-different', email: 'test@b.com' }] };
    const result = preservePrivateUserFields(incoming, current);
    expect(result.users[0].passwordHash).toBe('secret');
  });
});

describe('server merge helpers', () => {
  it('preserves orders created on the server when a stale client PUT omits them', () => {
    const incoming = { orders: [{ id: 'ord-local', status: 'Nouvelle' }], notifications: [], activityProofs: [], messages: [], loans: [] };
    const current = { orders: [{ id: 'ord-server', status: 'Paiement en attente' }], notifications: [], activityProofs: [], messages: [], loans: [] };
    const result = mergeIncomingStore(incoming, current);
    expect(result.orders.map((order) => order.id)).toEqual(['ord-server', 'ord-local']);
  });

  it('preserves automatic loan repayments from the server during stale client PUTs', () => {
    const incoming = { loanRepayments: [], notifications: [], activityProofs: [], messages: [], orders: [], loans: [] };
    const current = {
      loanRepayments: [{ id: 'repay-server', loanId: 'loan-1', amount: 15000, type: 'sale_deduction' }],
      notifications: [],
      activityProofs: [],
      messages: [],
      orders: [],
      loans: [],
    };
    const result = mergeIncomingStore(incoming, current);
    expect(result.loanRepayments).toHaveLength(1);
    expect(result.loanRepayments[0].id).toBe('repay-server');
  });

  it('keeps notification read state when either client or server has marked it read', () => {
    const serverRead = mergeNotificationsPreservingRead(
      [{ id: 'ntf-1', read: false, readAt: '' }],
      [{ id: 'ntf-1', read: true, readAt: '2026-05-20T10:00:00.000Z' }],
    );
    expect(serverRead[0]).toMatchObject({ read: true, readAt: '2026-05-20T10:00:00.000Z' });

    const clientRead = mergeNotificationsPreservingRead(
      [{ id: 'ntf-2', read: true, readAt: '2026-05-20T11:00:00.000Z' }],
      [{ id: 'ntf-2', read: false, readAt: '' }],
    );
    expect(clientRead[0]).toMatchObject({ read: true, readAt: '2026-05-20T11:00:00.000Z' });
  });

  it('keeps the loan with the most recent decision timestamp', () => {
    const result = mergeLoansByDecision(
      [{ id: 'loan-1', status: 'En attente' }],
      [{ id: 'loan-1', status: 'Refusé', decidedAt: '2026-05-20T10:00:00.000Z' }],
    );
    expect(result[0].status).toBe('Refusé');
  });

  it('allows a partner to approve after a refusal when the new decision is newer', () => {
    const result = mergeLoansByDecision(
      [{ id: 'loan-1', status: 'Approuvé', decidedAt: '2026-05-20T12:00:00.000Z' }],
      [{ id: 'loan-1', status: 'Refusé', decidedAt: '2026-05-20T10:00:00.000Z' }],
    );
    expect(result[0].status).toBe('Approuvé');
  });

  it('allows a newer reset to pending to survive a stale refused server copy', () => {
    const result = mergeLoansByDecision(
      [{ id: 'loan-1', status: 'En attente', statusUpdatedAt: '2026-05-20T12:00:00.000Z' }],
      [{ id: 'loan-1', status: 'Refusé', decidedAt: '2026-05-20T10:00:00.000Z' }],
    );
    expect(result[0].status).toBe('En attente');
  });
});
