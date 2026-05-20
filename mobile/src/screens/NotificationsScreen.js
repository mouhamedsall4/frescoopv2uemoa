import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';

const notifIcons = {
  order: { name: 'receipt', color: '#1d4ed8', bg: '#dbeafe' },
  payment: { name: 'wallet', color: '#16a34a', bg: '#dcfce7' },
  score: { name: 'trending-up', color: '#7c3aed', bg: '#f3e8ff' },
  'loan-decision': { name: 'cash', color: '#0891b2', bg: '#cffafe' },
  'loan-tranche-unlocked': { name: 'lock-open', color: '#16a34a', bg: '#dcfce7' },
  'loan-tranche-rejected': { name: 'close-circle', color: '#dc2626', bg: '#fee2e2' },
  'loan-request': { name: 'document-text', color: '#d97706', bg: '#fef3c7' },
  'loan-status-update': { name: 'sync', color: '#2563eb', bg: '#dbeafe' },
  system: { name: 'information-circle', color: '#6b7280', bg: '#f3f4f6' },
};

export default function NotificationsScreen({ user, store }) {
  const notifications = (store?.notifications || [])
    .filter(n =>
      n.recipientId === user.id
      || (n.recipientRole && n.recipientRole === user.role)
      || (Array.isArray(n.recipientRoles) && n.recipientRoles.includes(user.role))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  function formatTime(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `il y a ${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours}h`;
    return `il y a ${Math.floor(hours / 24)}j`;
  }

  function renderNotification({ item }) {
    const config = notifIcons[item.type] || notifIcons.system;
    return (
      <View style={[styles.card, !item.read && styles.cardUnread]}>
        <View style={[styles.iconWrap, { backgroundColor: config.bg }]}>
          <Ionicons name={config.name + '-outline'} size={20} color={config.color} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{item.title || item.message}</Text>
          {item.body ? <Text style={styles.body} numberOfLines={3}>{item.body}</Text> : null}
          <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.gray200} />
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptyText}>Vos notifications de commandes, paiements et score apparaîtront ici.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  list: { padding: spacing.lg, gap: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: spacing.lg, backgroundColor: colors.white, borderRadius: radius.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  cardUnread: { backgroundColor: '#f0fdf4', borderLeftWidth: 3, borderLeftColor: colors.green600 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: colors.gray800, lineHeight: 20 },
  body: { fontSize: 13, color: colors.gray500, marginTop: 4, lineHeight: 18 },
  time: { fontSize: 11, color: colors.gray400, marginTop: 6, fontWeight: '600' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green600, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 80, gap: spacing.md },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.gray800 },
  emptyText: { fontSize: 13, color: colors.gray500, textAlign: 'center', lineHeight: 20, paddingHorizontal: spacing.xxxl },
});
