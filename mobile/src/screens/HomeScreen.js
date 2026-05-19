import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import ScoreRing from '../components/ScoreRing';

function buildBancabiliteScore(user, store) {
  if (!user || !store) return { score: 0, criteria: [] };
  const products = (store.products || []).filter(p => p.sellerId === user.id);
  const orders = (store.orders || []).filter(o => o.sellerId === user.id);
  const completedOrders = orders.filter(o => o.status === 'Livree');
  const payments = (store.payments || []).filter(p => p.userId === user.id || orders.some(o => o.id === p.orderId));
  const dossiers = (store.dossiers || []).filter(d => d.userId === user.id);
  const validDossiers = dossiers.filter(d => d.status === 'Valide');
  const proofs = (store.activityProofs || []).filter(p => p.userId === user.id);
  const verifiedProofs = proofs.filter(p => p.status === 'verified');
  const monthsActive = Math.min(6, Math.ceil((Date.now() - new Date(user.createdAt).getTime()) / (30 * 24 * 3600 * 1000)));

  const criteria = [
    { label: 'Profil complet', points: (user.name && user.email && user.phone && user.region) ? 8 : (user.name && user.email) ? 4 : 0, max: 8, icon: 'person' },
    { label: 'Identité vérifiée', points: user.verificationLevel >= 2 ? 10 : user.verificationLevel === 1 ? 5 : 0, max: 10, icon: 'shield-checkmark' },
    { label: 'Produits publiés', points: Math.min(10, products.length * 3), max: 10, icon: 'leaf' },
    { label: 'Commandes reçues', points: Math.min(12, orders.length * 2), max: 12, icon: 'receipt' },
    { label: 'Livraisons effectuées', points: Math.min(15, completedOrders.length * 3), max: 15, icon: 'checkmark-done' },
    { label: 'Paiements reçus', points: Math.min(12, payments.filter(p => p.status === 'Paye').length * 3), max: 12, icon: 'wallet' },
    { label: 'Ancienneté', points: Math.min(8, monthsActive * 2), max: 8, icon: 'calendar' },
    { label: 'Régularité', points: Math.min(8, Math.floor(orders.length / Math.max(1, monthsActive)) * 3), max: 8, icon: 'trending-up' },
    { label: 'Dossiers validés', points: Math.min(7, validDossiers.length * 4), max: 7, icon: 'document-text' },
    { label: 'Preuves vérifiées', points: Math.min(5, verifiedProofs.length * 2), max: 5, icon: 'camera' },
    { label: 'Diversité produits', points: Math.min(5, new Set(products.map(p => p.category)).size * 2), max: 5, icon: 'grid' },
    { label: 'Zéro litige', points: payments.filter(p => p.status === 'Litige').length === 0 ? 5 : 0, max: 5, icon: 'happy' },
  ];

  const score = Math.min(100, criteria.reduce((sum, c) => sum + c.points, 0));
  return { score, criteria };
}

export default function HomeScreen({ user, store, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);
  const { score, criteria } = buildBancabiliteScore(user, store);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  const scoreColor = score >= 60 ? colors.green600 : score >= 40 ? colors.orange500 : colors.red500;
  const scoreLabel = score >= 60 ? 'Bancable' : score >= 40 ? 'En progression' : 'Débutant';

  const products = (store?.products || []).filter(p => p.sellerId === user.id);
  const orders = (store?.orders || []).filter(o => o.sellerId === user.id);
  const completedOrders = orders.filter(o => o.status === 'Livree');
  const pendingOrders = orders.filter(o => o.status !== 'Livree' && o.status !== 'Annulee');
  const totalRevenue = orders.filter(o => o.status === 'Livree').reduce((sum, o) => sum + Number(o.totalAmount || o.total || 0), 0);

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.green700]} />}>
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={[styles.badge, { backgroundColor: scoreColor + '25' }]}>
              <View style={[styles.badgeDot, { backgroundColor: scoreColor }]} />
              <Text style={[styles.badgeText, { color: scoreColor }]}>{scoreLabel}</Text>
            </View>
          </View>
          <ScoreRing score={score} size={80} color={scoreColor} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatCard icon="leaf" label="Produits" value={products.length} color={colors.green700} />
        <StatCard icon="receipt" label="Commandes" value={orders.length} color={colors.blue500} />
        <StatCard icon="checkmark-done" label="Livrées" value={completedOrders.length} color={colors.green600} />
        <StatCard icon="time" label="En cours" value={pendingOrders.length} color={pendingOrders.length > 0 ? colors.orange500 : colors.gray400} />
      </View>

      {totalRevenue > 0 && (
        <View style={styles.revenueCard}>
          <Ionicons name="trending-up" size={20} color={colors.green700} />
          <View>
            <Text style={styles.revenueLabel}>Revenus totaux</Text>
            <Text style={styles.revenueValue}>{totalRevenue.toLocaleString()} FCFA</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Score de bancabilité</Text>
        <Text style={styles.sectionSubtitle}>Complétez ces critères pour devenir finançable</Text>
        {criteria.map((c) => (
          <View key={c.label} style={styles.criteriaRow}>
            <Ionicons name={c.icon + '-outline'} size={16} color={c.points >= c.max ? colors.green600 : colors.gray400} />
            <Text style={[styles.criteriaLabel, c.points >= c.max && { color: colors.green700 }]}>{c.label}</Text>
            <View style={styles.criteriaBar}>
              <View style={[styles.criteriaFill, { width: `${(c.points / c.max) * 100}%`, backgroundColor: c.points >= c.max ? colors.green500 : c.points > 0 ? colors.orange500 : colors.gray200 }]} />
            </View>
            <Text style={[styles.criteriaPoints, c.points >= c.max && { color: colors.green600 }]}>{c.points}/{c.max}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon + '-outline'} size={18} color={color} />
      <Text style={[styles.statNumber, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  heroCard: { margin: spacing.lg, padding: spacing.xl, backgroundColor: colors.green800, borderRadius: radius.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  userName: { fontSize: 22, fontWeight: '900', color: colors.white, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, marginTop: spacing.md },
  badgeDot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: '800' },
  statsRow: { flexDirection: 'row', marginHorizontal: spacing.lg, gap: spacing.sm },
  statCard: { flex: 1, backgroundColor: colors.white, padding: spacing.md, borderRadius: radius.md, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, gap: 2 },
  statNumber: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 10, fontWeight: '700', color: colors.gray500 },
  revenueCard: { flexDirection: 'row', alignItems: 'center', gap: 12, margin: spacing.lg, marginBottom: 0, padding: spacing.lg, backgroundColor: colors.green50, borderRadius: radius.md, borderWidth: 1, borderColor: colors.green100 },
  revenueLabel: { fontSize: 12, color: colors.gray500, fontWeight: '600' },
  revenueValue: { fontSize: 18, fontWeight: '900', color: colors.green800 },
  section: { margin: spacing.lg, padding: spacing.lg, backgroundColor: colors.white, borderRadius: radius.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.gray800 },
  sectionSubtitle: { fontSize: 12, color: colors.gray400, marginTop: 2, marginBottom: spacing.lg },
  criteriaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  criteriaLabel: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.gray600 },
  criteriaBar: { width: 50, height: 5, borderRadius: 3, backgroundColor: colors.gray100, overflow: 'hidden' },
  criteriaFill: { height: '100%', borderRadius: 3 },
  criteriaPoints: { fontSize: 11, fontWeight: '800', color: colors.gray400, width: 30, textAlign: 'right' },
});
