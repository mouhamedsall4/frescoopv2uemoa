import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { colors, spacing, radius } from '../theme';
import { api } from '../api';
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
    { label: 'Profil complet', points: (user.name && user.email && user.phone && user.region) ? 8 : (user.name && user.email) ? 4 : 0, max: 8 },
    { label: 'Identité vérifiée', points: user.verificationLevel >= 2 ? 10 : user.verificationLevel === 1 ? 5 : 0, max: 10 },
    { label: 'Produits publiés', points: Math.min(10, products.length * 3), max: 10 },
    { label: 'Commandes reçues', points: Math.min(12, orders.length * 2), max: 12 },
    { label: 'Livraisons effectuées', points: Math.min(15, completedOrders.length * 3), max: 15 },
    { label: 'Paiements reçus', points: Math.min(12, payments.filter(p => p.status === 'Paye').length * 3), max: 12 },
    { label: 'Ancienneté', points: Math.min(8, monthsActive * 2), max: 8 },
    { label: 'Régularité activité', points: Math.min(8, Math.floor(orders.length / Math.max(1, monthsActive)) * 3), max: 8 },
    { label: 'Dossiers validés', points: Math.min(7, validDossiers.length * 4), max: 7 },
    { label: 'Preuves vérifiées', points: Math.min(5, verifiedProofs.length * 2), max: 5 },
    { label: 'Diversité produits', points: Math.min(5, new Set(products.map(p => p.category)).size * 2), max: 5 },
    { label: 'Zéro litige', points: payments.filter(p => p.status === 'Litige').length === 0 ? 5 : 0, max: 5 },
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

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.green700]} />}>
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.role}>{user.role === 'agriculteur' ? 'Agriculteur' : user.role}</Text>
          </View>
          <ScoreRing score={score} size={80} color={scoreColor} />
        </View>
        <View style={styles.scoreBadge}>
          <View style={[styles.badge, { backgroundColor: scoreColor + '18' }]}>
            <Text style={[styles.badgeText, { color: scoreColor }]}>{scoreLabel} — {score}/100</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{products.length}</Text>
          <Text style={styles.statLabel}>Produits</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>Commandes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedOrders.length}</Text>
          <Text style={styles.statLabel}>Livrées</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, pendingOrders.length > 0 && { color: colors.orange500 }]}>{pendingOrders.length}</Text>
          <Text style={styles.statLabel}>En cours</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détail du score</Text>
        {criteria.map((c) => (
          <View key={c.label} style={styles.criteriaRow}>
            <Text style={styles.criteriaLabel}>{c.label}</Text>
            <View style={styles.criteriaBar}>
              <View style={[styles.criteriaFill, { width: `${(c.points / c.max) * 100}%`, backgroundColor: c.points >= c.max ? colors.green500 : c.points > 0 ? colors.orange500 : colors.gray200 }]} />
            </View>
            <Text style={styles.criteriaPoints}>{c.points}/{c.max}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  heroCard: { margin: spacing.lg, padding: spacing.xl, backgroundColor: colors.green800, borderRadius: radius.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  userName: { fontSize: 22, fontWeight: '900', color: colors.white, marginTop: 2 },
  role: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginTop: 4, textTransform: 'capitalize' },
  scoreBadge: { marginTop: spacing.lg },
  badge: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full },
  badgeText: { fontSize: 13, fontWeight: '800' },
  statsRow: { flexDirection: 'row', marginHorizontal: spacing.lg, gap: spacing.sm },
  statCard: { flex: 1, backgroundColor: colors.white, padding: spacing.lg, borderRadius: radius.md, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statNumber: { fontSize: 22, fontWeight: '900', color: colors.green800 },
  statLabel: { fontSize: 11, fontWeight: '700', color: colors.gray500, marginTop: 2 },
  section: { margin: spacing.lg, padding: spacing.lg, backgroundColor: colors.white, borderRadius: radius.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.gray800, marginBottom: spacing.lg },
  criteriaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  criteriaLabel: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.gray600 },
  criteriaBar: { width: 60, height: 6, borderRadius: 3, backgroundColor: colors.gray100, overflow: 'hidden' },
  criteriaFill: { height: '100%', borderRadius: 3 },
  criteriaPoints: { fontSize: 11, fontWeight: '800', color: colors.gray500, width: 32, textAlign: 'right' },
});
