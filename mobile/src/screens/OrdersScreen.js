import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';

const statusConfig = {
  'Nouvelle': { bg: '#dbeafe', text: '#1d4ed8', icon: 'time-outline' },
  'Confirmee': { bg: '#dcfce7', text: '#16a34a', icon: 'checkmark-circle-outline' },
  'En preparation': { bg: '#fef3c7', text: '#d97706', icon: 'construct-outline' },
  'Livree': { bg: '#d1fae5', text: '#047857', icon: 'checkmark-done-circle-outline' },
  'Annulee': { bg: '#fee2e2', text: '#dc2626', icon: 'close-circle-outline' },
  'Paiement en attente': { bg: '#f3e8ff', text: '#7c3aed', icon: 'wallet-outline' },
};

export default function OrdersScreen({ user, store, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const usersMap = useMemo(() => {
    const map = {};
    for (const u of (store?.users || [])) { map[u.id] = u; }
    return map;
  }, [store?.users]);

  const allOrders = useMemo(() =>
    (store?.orders || [])
      .filter(o => o.sellerId === user.id || o.buyerId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [store?.orders, user.id]
  );

  const orders = useMemo(() => {
    if (filter === 'all') return allOrders;
    if (filter === 'active') return allOrders.filter(o => !['Livree', 'Annulee'].includes(o.status));
    return allOrders.filter(o => o.status === 'Livree');
  }, [allOrders, filter]);

  const activeCount = useMemo(() => allOrders.filter(o => !['Livree', 'Annulee'].includes(o.status)).length, [allOrders]);

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

  function formatTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  function renderOrder({ item }) {
    const sc = statusConfig[item.status] || statusConfig['Nouvelle'];
    const isSeller = item.sellerId === user.id;
    const otherUser = usersMap[isSeller ? item.buyerId : (item.sellerId || item.ownerId)];
    const total = Number(item.totalAmount || item.total || 0);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.roleTag, { backgroundColor: isSeller ? colors.green100 : '#dbeafe' }]}>
              <Text style={[styles.roleTagText, { color: isSeller ? colors.green700 : '#1d4ed8' }]}>
                {isSeller ? 'Vente' : 'Achat'}
              </Text>
            </View>
            <Text style={styles.orderId}>#{item.id?.slice(-6)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Ionicons name={sc.icon} size={12} color={sc.text} />
            <Text style={[styles.statusText, { color: sc.text }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.personRow}>
            <Ionicons name={isSeller ? 'person-outline' : 'storefront-outline'} size={14} color={colors.gray400} />
            <Text style={styles.personName}>{otherUser?.name || (isSeller ? 'Acheteur' : 'Vendeur')}</Text>
          </View>
          {item.items && item.items.length > 0 && (
            <View style={styles.itemsList}>
              {item.items.slice(0, 2).map((it, i) => (
                <Text key={i} style={styles.itemText}>{it.quantity || 1}x {it.productName || it.name || 'Produit'}</Text>
              ))}
              {item.items.length > 2 && <Text style={styles.itemText}>+{item.items.length - 2} autre(s)</Text>}
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.date}>{formatDate(item.createdAt)} à {formatTime(item.createdAt)}</Text>
            {item.updatedAt && item.updatedAt !== item.createdAt && (
              <Text style={styles.dateUpdate}>Maj: {formatDate(item.updatedAt)} {formatTime(item.updatedAt)}</Text>
            )}
          </View>
          <Text style={styles.amount}>{total.toLocaleString()} FCFA</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {[['all', 'Toutes'], ['active', 'En cours'], ['done', 'Terminées']].map(([key, label]) => (
          <TouchableOpacity key={key} style={[styles.filterBtn, filter === key && styles.filterBtnActive]} onPress={() => setFilter(key)}>
            <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>{label}</Text>
            {key === 'active' && activeCount > 0 && (
              <View style={styles.filterDot} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.green700]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={colors.gray300} />
            <Text style={styles.emptyTitle}>Aucune commande</Text>
            <Text style={styles.emptyText}>Vos commandes (ventes et achats) apparaîtront ici.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  filterRow: { flexDirection: 'row', padding: spacing.lg, paddingBottom: 0, gap: spacing.sm },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200, flexDirection: 'row', alignItems: 'center', gap: 4 },
  filterBtnActive: { backgroundColor: colors.green700, borderColor: colors.green700 },
  filterText: { fontSize: 13, fontWeight: '700', color: colors.gray500 },
  filterTextActive: { color: colors.white },
  filterDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.orange500 },
  list: { padding: spacing.lg, gap: spacing.md },
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  roleTagText: { fontSize: 10, fontWeight: '800' },
  orderId: { fontSize: 13, fontWeight: '800', color: colors.gray800 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardBody: { marginTop: spacing.md },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  personName: { fontSize: 13, fontWeight: '600', color: colors.gray600 },
  itemsList: { marginTop: spacing.sm, paddingLeft: 20 },
  itemText: { fontSize: 12, color: colors.gray500, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray100 },
  date: { fontSize: 12, color: colors.gray400, fontWeight: '600' },
  dateUpdate: { fontSize: 10, color: colors.gray300, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '900', color: colors.green800 },
  empty: { alignItems: 'center', paddingVertical: 80, gap: spacing.md },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.gray800 },
  emptyText: { fontSize: 13, color: colors.gray500, textAlign: 'center', lineHeight: 20, paddingHorizontal: spacing.xxxl },
});
