import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, radius } from '../theme';
import { clearToken } from '../api';

export default function ProfileScreen({ user, store, onLogout }) {
  const dossiers = (store?.dossiers || []).filter(d => d.userId === user.id);
  const validDossiers = dossiers.filter(d => d.status === 'Valide');
  const proofs = (store?.activityProofs || []).filter(p => p.userId === user.id);

  function handleLogout() {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: async () => { await clearToken(); onLogout(); } },
    ]);
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user.role === 'agriculteur' ? 'Agriculteur' : user.role}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        <InfoRow label="Téléphone" value={user.phone || 'Non renseigné'} />
        <InfoRow label="Région" value={user.region || 'Non renseignée'} />
        <InfoRow label="Organisation" value={user.organization || 'Indépendant'} />
        <InfoRow label="Statut" value={user.status || 'Actif'} />
        <InfoRow label="Inscrit le" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dossier bancaire</Text>
        <View style={styles.dossierGrid}>
          <View style={styles.dossierCard}>
            <Text style={styles.dossierNumber}>{dossiers.length}</Text>
            <Text style={styles.dossierLabel}>Dossiers</Text>
          </View>
          <View style={styles.dossierCard}>
            <Text style={[styles.dossierNumber, { color: colors.green600 }]}>{validDossiers.length}</Text>
            <Text style={styles.dossierLabel}>Validés</Text>
          </View>
          <View style={styles.dossierCard}>
            <Text style={styles.dossierNumber}>{proofs.length}</Text>
            <Text style={styles.dossierLabel}>Preuves</Text>
          </View>
        </View>
        <View style={styles.verificationRow}>
          <Text style={styles.verLabel}>Niveau de vérification</Text>
          <View style={styles.verDots}>
            {[1, 2, 3].map(level => (
              <View key={level} style={[styles.verDot, (user.verificationLevel || 0) >= level && styles.verDotActive]} />
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  header: { alignItems: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.green800, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: 28, fontWeight: '900', color: colors.white },
  name: { fontSize: 20, fontWeight: '900', color: colors.gray800 },
  email: { fontSize: 14, color: colors.gray500, marginTop: 4, fontWeight: '500' },
  roleBadge: { marginTop: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: colors.green100 },
  roleText: { fontSize: 12, fontWeight: '800', color: colors.green700, textTransform: 'capitalize' },
  section: { margin: spacing.lg, padding: spacing.lg, backgroundColor: colors.white, borderRadius: radius.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.gray800, marginBottom: spacing.lg },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  infoLabel: { fontSize: 13, fontWeight: '600', color: colors.gray500 },
  infoValue: { fontSize: 13, fontWeight: '700', color: colors.gray800 },
  dossierGrid: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  dossierCard: { flex: 1, alignItems: 'center', padding: spacing.md, backgroundColor: colors.gray50, borderRadius: radius.sm },
  dossierNumber: { fontSize: 22, fontWeight: '900', color: colors.gray800 },
  dossierLabel: { fontSize: 11, fontWeight: '700', color: colors.gray500, marginTop: 2 },
  verificationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray100 },
  verLabel: { fontSize: 13, fontWeight: '600', color: colors.gray600 },
  verDots: { flexDirection: 'row', gap: 6 },
  verDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.gray200 },
  verDotActive: { backgroundColor: colors.green600 },
  logoutBtn: { margin: spacing.lg, padding: spacing.lg, backgroundColor: colors.white, borderRadius: radius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.red500 },
  logoutText: { fontSize: 15, fontWeight: '800', color: colors.red500 },
});
