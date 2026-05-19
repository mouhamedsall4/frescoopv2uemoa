import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors, spacing, radius } from '../theme';

export default function NotificationsScreen({ user, store }) {
  const notifications = (store?.notifications || [])
    .filter(n => n.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  function formatTime(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}j`;
  }

  function renderNotification({ item }) {
    return (
      <View style={[styles.card, !item.read && styles.cardUnread]}>
        <View style={[styles.dot, !item.read && styles.dotActive]} />
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{item.title || item.message}</Text>
          {item.body ? <Text style={styles.body} numberOfLines={3}>{item.body}</Text> : null}
          <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
        </View>
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
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptyText}>Vos notifications apparaîtront ici.</Text>
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
  cardUnread: { backgroundColor: '#f0fdf4' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gray200, marginTop: 6 },
  dotActive: { backgroundColor: colors.green600 },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: colors.gray800, lineHeight: 20 },
  body: { fontSize: 13, color: colors.gray500, marginTop: 4, lineHeight: 18 },
  time: { fontSize: 11, color: colors.gray400, marginTop: 6, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.gray800 },
  emptyText: { fontSize: 13, color: colors.gray500, textAlign: 'center', marginTop: spacing.sm },
});
