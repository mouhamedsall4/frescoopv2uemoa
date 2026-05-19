import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { clearToken } from '../api';

export default function ProfileScreen({ user, store, onLogout }) {
  const dossiers = (store?.dossiers || []).filter(d => d.userId === user.id);
  const validDossiers = dossiers.filter(d => d.status === 'Valide');
  const proofs = (store?.activityProofs || []).filter(p => p.userId === user.id);
  const orders = (store?.orders || []).filter(o => o.sellerId === user.id);
  const totalRevenue = orders.filter(o => o.status === 'Livree').reduce((s, o) => s + Number(o.totalAmount || o.total || 0), 0);

  function handleLogout() {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: async () => { await clearToken(); onLogout(); } },
    ]);
  }

  const verLevel = user.verificationLevel || 0;
  const verLabels = ['Non vérifié', 'Email vérifié', 'CNI vérifiée', 'Agent validé'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.badges}>
          <View style={styles.roleBadge}>
            <Ionicons name="leaf" size={12} color={colors.green700} />
            <Text style={styles.roleText}>{user.role === 'agriculteur' ? 'Agriculteur' : user.role}</Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: verLevel >= 2 ? colors.green100 : '#fef3c7' }]}>
            <Ionicons name={verLevel >= 2 ? 'shield-checkmark' : 'shield-outline'} size={12} color={verLevel >= 2 ? colors.green700 : '#d97706'} />
            <Text style={[styles.roleText, { color: verLevel >= 2 ? colors.green700 : '#d97706' }]}>{verLabels[verLevel]}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        <InfoRow icon="call-outline" label="Téléphone" value={user.phone || 'Non renseigné'} />
        <InfoRow icon="location-outline" label="Région" value={user.region || 'Non renseignée'} />
        <InfoRow icon="people-outline" label="Organisation" value={user.organization || 'Indépendant'} />
        <InfoRow icon="calendar-outline" label="Inscrit le" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '--'} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dossier bancaire</Text>
        <View style={styles.dossierGrid}>
          <DossierStat icon="document-text" value={dossiers.length} label="Dossiers" color={colors.blue500} />
          <DossierStat icon="checkmark-circle" value={validDossiers.length} label="Validés" color={colors.green600} />
          <DossierStat icon="camera" value={proofs.length} label="Preuves" color={colors.orange500} />
          <DossierStat icon="cash" value={`${(totalRevenue / 1000).toFixed(0)}K`} label="Revenus" color={colors.green800} />
        </View>

        <View style={styles.verSection}>
          <Text style={styles.verTitle}>Niveau de vérification</Text>
          <View style={styles.verSteps}>
            {[1, 2, 3].map(level => (
              <View key={level} style={styles.verStep}>
                <View style={[styles.verDot, verLevel >= level && styles.verDotActive]}>
                  {verLevel >= level && <Ionicons name="checkmark" size={10} color={colors.white} />}
                </View>
                <Text style={[styles.verStepLabel, verLevel >= level && { color: colors.green700 }]}>
                  {level === 1 ? 'Email' : level === 2 ? 'CNI' : 'Agent'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paramètres</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={20} color={colors.gray600} />
          <Text style={styles.menuText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.gray400} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.gray600} />
          <Text style={styles.menuText}>Sécurité</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.gray400} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={20} color={colors.gray600} />
          <Text style={styles.menuText}>Aide</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.gray400} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.red500} />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.gray400} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function DossierStat({ icon, value, label, color }) {
  return (
    <View style={styles.dossierCard}>
      <Ionicons name={icon + '-outline'} size={20} color={color} />
      <Text style={[styles.dossierNumber, { color }]}>{value}</Text>
      <Text style={styles.dossierLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  header: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.green800, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: 28, fontWeight: '900', color: colors.white },
  name: { fontSize: 20, fontWeight: '900', color: colors.gray800 },
  email: { fontSize: 13, color: colors.gray500, marginTop: 4, fontWeight: '500' },
  badges: { flexDirection: 'row', gap: 8, marginTop: spacing.md },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, backgroundColor: colors.green100 },
  roleText: { fontSize: 11, fontWeight: '700', color: colors.green700, textTransform: 'capitalize' },
  section: { margin: spacing.lg, marginBottom: 0, padding: spacing.lg, backgroundColor: colors.white, borderRadius: radius.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.gray800, marginBottom: spacing.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray100, gap: 10 },
  infoLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.gray500 },
  infoValue: { fontSize: 13, fontWeight: '700', color: colors.gray800 },
  dossierGrid: { flexDirection: 'row', gap: spacing.sm },
  dossierCard: { flex: 1, alignItems: 'center', padding: spacing.md, backgroundColor: colors.gray50, borderRadius: radius.sm, gap: 2 },
  dossierNumber: { fontSize: 18, fontWeight: '900' },
  dossierLabel: { fontSize: 10, fontWeight: '700', color: colors.gray500 },
  verSection: { marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.gray100 },
  verTitle: { fontSize: 13, fontWeight: '700', color: colors.gray600, marginBottom: spacing.md },
  verSteps: { flexDirection: 'row', justifyContent: 'space-around' },
  verStep: { alignItems: 'center', gap: 4 },
  verDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.gray200, justifyContent: 'center', alignItems: 'center' },
  verDotActive: { backgroundColor: colors.green600 },
  verStepLabel: { fontSize: 11, fontWeight: '600', color: colors.gray400 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  menuText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.gray800 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: spacing.lg, padding: spacing.lg, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.red500 },
  logoutText: { fontSize: 15, fontWeight: '800', color: colors.red500 },
});
