import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadow } from '../theme';

export default function ScoreScreen({ user, store }) {
  const products = (store?.products || []).filter(p => p.sellerId === user.id);
  const orders = (store?.orders || []).filter(o => o.sellerId === user.id);
  const completedOrders = orders.filter(o => o.status === 'Livree');
  const payments = (store?.payments || []).filter(p => p.userId === user.id || orders.some(o => o.id === p.orderId));
  const dossiers = (store?.dossiers || []).filter(d => d.userId === user.id);
  const validDossiers = dossiers.filter(d => d.status === 'Valide');
  const proofs = (store?.activityProofs || []).filter(p => p.userId === user.id);
  const verifiedProofs = proofs.filter(p => p.status === 'verified');
  const monthsActive = Math.min(6, Math.ceil((Date.now() - new Date(user.createdAt).getTime()) / (30 * 24 * 3600 * 1000)));

  const criteria = [
    { label: 'Profil complet', points: (user.name && user.email && user.phone && user.region) ? 8 : (user.name && user.email) ? 4 : 0, max: 8, icon: 'person', tip: 'Remplissez tous les champs de votre profil' },
    { label: 'Identité vérifiée', points: user.verificationLevel >= 2 ? 10 : user.verificationLevel === 1 ? 5 : 0, max: 10, icon: 'shield-checkmark', tip: 'Faites vérifier votre CNI par un agent' },
    { label: 'Produits publiés', points: Math.min(10, products.length * 3), max: 10, icon: 'leaf', tip: 'Publiez au moins 3 produits' },
    { label: 'Commandes reçues', points: Math.min(12, orders.length * 2), max: 12, icon: 'receipt', tip: 'Recevez des commandes d\'acheteurs' },
    { label: 'Livraisons effectuées', points: Math.min(15, completedOrders.length * 3), max: 15, icon: 'checkmark-done', tip: 'Livrez vos commandes à temps' },
    { label: 'Paiements reçus', points: Math.min(12, payments.filter(p => p.status === 'Paye').length * 3), max: 12, icon: 'wallet', tip: 'Recevez vos paiements' },
    { label: 'Ancienneté', points: Math.min(8, monthsActive * 2), max: 8, icon: 'calendar', tip: 'Restez actif chaque mois' },
    { label: 'Régularité', points: Math.min(8, Math.floor(orders.length / Math.max(1, monthsActive)) * 3), max: 8, icon: 'trending-up', tip: 'Maintenez un flux régulier' },
    { label: 'Dossiers validés', points: Math.min(7, validDossiers.length * 4), max: 7, icon: 'document-text', tip: 'Constituez votre dossier bancaire' },
    { label: 'Preuves vérifiées', points: Math.min(5, verifiedProofs.length * 2), max: 5, icon: 'camera', tip: 'Ajoutez des preuves d\'activité' },
  ];

  const score = Math.min(100, criteria.reduce((sum, c) => sum + c.points, 0));
  const maxScore = criteria.reduce((sum, c) => sum + c.max, 0);
  const scoreColor = score >= 60 ? colors.green600 : score >= 40 ? colors.orange500 : colors.red500;
  const scoreLabel = score >= 60 ? 'Bancable' : score >= 40 ? 'En progression' : 'Débutant';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.scoreCard}>
        <View style={styles.scoreCircle}>
          <Text style={[styles.scoreNum, { color: scoreColor }]}>{score}</Text>
          <Text style={styles.scoreMax}>/{maxScore}</Text>
        </View>
        <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>
        <Text style={styles.scoreDesc}>
          {score >= 60 ? 'Vous pouvez demander un crédit !' : 'Continuez votre activité pour augmenter votre score.'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détail des critères</Text>
        {criteria.map(c => {
          const pct = (c.points / c.max) * 100;
          const done = c.points >= c.max;
          return (
            <View key={c.label} style={styles.criteriaCard}>
              <View style={[styles.criteriaIcon, { backgroundColor: done ? colors.green100 : colors.gray100 }]}>
                <Ionicons name={`${c.icon}-outline`} size={18} color={done ? colors.green700 : colors.gray400} />
              </View>
              <View style={styles.criteriaBody}>
                <View style={styles.criteriaHeader}>
                  <Text style={[styles.criteriaLabel, done && { color: colors.green700 }]}>{c.label}</Text>
                  <Text style={[styles.criteriaScore, done && { color: colors.green700 }]}>{c.points}/{c.max}</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: done ? colors.green500 : pct > 0 ? colors.orange500 : colors.gray200 }]} />
                </View>
                {!done && <Text style={styles.tip}>{c.tip}</Text>}
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  scoreCard: { alignItems: 'center', padding: spacing.xxxl, backgroundColor: colors.white, marginBottom: spacing.md },
  scoreCircle: { flexDirection: 'row', alignItems: 'baseline' },
  scoreNum: { fontSize: 56, fontWeight: '900' },
  scoreMax: { fontSize: 20, color: colors.gray400, fontWeight: '700' },
  scoreLabel: { fontSize: 16, fontWeight: '800', marginTop: spacing.sm },
  scoreDesc: { fontSize: 13, color: colors.gray500, marginTop: spacing.xs, textAlign: 'center' },
  section: { padding: spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.gray800, marginBottom: spacing.lg },
  criteriaCard: { flexDirection: 'row', gap: 12, marginBottom: spacing.md, padding: spacing.md, backgroundColor: colors.white, borderRadius: radius.sm, ...shadow.sm },
  criteriaIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  criteriaBody: { flex: 1 },
  criteriaHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  criteriaLabel: { fontSize: 13, fontWeight: '700', color: colors.gray800 },
  criteriaScore: { fontSize: 12, fontWeight: '800', color: colors.gray500 },
  progressBg: { height: 4, borderRadius: 2, backgroundColor: colors.gray100, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  tip: { fontSize: 11, color: colors.gray400, marginTop: 3 },
});
