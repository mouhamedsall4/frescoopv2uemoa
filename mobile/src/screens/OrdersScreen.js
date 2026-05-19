import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { colors, spacing, radius } from '../theme';

const statusColors = {
  'Nouvelle': { bg: '#dbeafe', text: '#1d4ed8' },
  'Confirmee': { bg: '#dcfce7', text: '#16a34a' },
  'En preparation': { bg: '#fef3c7', text: '#d97706' },
  'Livree': { bg: '#d1fae5', text: '#047857' },
  'Annulee': { bg: '#fee2e2', text: '#dc2626' },
  'Paiement en attente': { bg: '#f3e8ff', text: '#7c3aed' },
};

export default function OrdersScreen({ user, store, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);
  const orders = (store?.orders || []).filter(o => o.sellerId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function renderOrder({ item }) {
    const sc = statusColors[item.status] || statusColors['Nouvelle'];
    const buyer = (store?.users || []).find(u => u.id === item.buyerId);
    const total = Number(item.totalAmount || item.total || 0);

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.orderId}>#{item.id?.slice(-6)}</Text>
            <Text style={styles.buyer}>{buyer?.name || 'Acheteur'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.cardBottom}>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          <Text style={styles.amount}>{total.toLocaleString()} FCFA</Text>
        </View>
        {item.items && item.items.length > 0 && (
          <View style={styles.items}>
            {item.items.slice(0, 3).map((it, i) => (
              <Text key={i} style={styles.itemText}>{it.quantity || 1}x {it.productName || it.name || 'Produit'}</Text>
            ))}
            {item.items.length > 3 && <Text style={styles.itemText}>+{item.items.length - 3} autres</Text>}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.green700]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Aucune commande</Text>
            <Text style={styles.emptyText}>Vos commandes apparaîtront ici quand des acheteurs passeront commande.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  list: { padding: spacing.lg, gap: spacing.md },
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 15, fontWeight: '900', color: colors.gray800 },
  buyer: { fontSize: 13, color: colors.gray500, fontWeight: '600', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  statusText: { fontSize: 11, fontWeight: '800' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray100 },
  date: { fontSize: 12, color: colors.gray400, fontWeight: '600' },
  amount: { fontSize: 15, fontWeight: '900', color: colors.green800 },
  items: { marginTop: spacing.sm },
  itemText: { fontSize: 12, color: colors.gray500, lineHeight: 18 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.gray800 },
  emptyText: { fontSize: 13, color: colors.gray500, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.xxxl, lineHeight: 20 },
});
