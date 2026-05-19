import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import ProductImage from '../components/ProductImage';

export default function ProductsScreen({ user, store, onRefresh, navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const products = (store?.products || []).filter(p => p.sellerId === user.id);
  const parentNav = navigation?.getParent?.() || navigation;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  const published = products.filter(p => p.status === 'Publie').length;
  const draft = products.length - published;

  function renderProduct({ item }) {
    return (
      <TouchableOpacity style={styles.card} onPress={() => parentNav?.navigate?.('ProductDetail', { product: item })} activeOpacity={0.7}>
        <View style={styles.imageWrap}>
          <ProductImage imageUrl={item.imageUrl} category={item.category} name={item.name} size="small" />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category || 'Produit'}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.price}>{Number(item.price || 0).toLocaleString()} F/{item.unit || 'kg'}</Text>
            <View style={[styles.statusBadge, item.status === 'Publie' ? styles.statusActive : styles.statusDraft]}>
              <Text style={[styles.statusText, item.status === 'Publie' ? styles.statusTextActive : styles.statusTextDraft]}>
                {item.status === 'Publie' ? 'En ligne' : 'Brouillon'}
              </Text>
            </View>
          </View>
          {item.quantityAvailable != null && (
            <Text style={styles.stock}>{item.quantityAvailable} {item.unit || 'kg'} en stock</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {products.length > 0 && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{products.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.green600 }]}>{published}</Text>
            <Text style={styles.statLabel}>En ligne</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.gray400 }]}>{draft}</Text>
            <Text style={styles.statLabel}>Brouillon</Text>
          </View>
        </View>
      )}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.green700]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="leaf-outline" size={48} color={colors.gray300} />
            <Text style={styles.emptyTitle}>Aucun produit</Text>
            <Text style={styles.emptyText}>Publiez votre premier produit pour commencer à construire votre score de bancabilité.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => parentNav?.navigate?.('AddProduct')}>
              <Ionicons name="add" size={18} color={colors.white} />
              <Text style={styles.emptyBtnText}>Ajouter un produit</Text>
            </TouchableOpacity>
          </View>
        }
      />
      {products.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => parentNav?.navigate?.('AddProduct')}>
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  statsBar: { flexDirection: 'row', backgroundColor: colors.white, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.gray100, gap: spacing.xl },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '900', color: colors.gray800 },
  statLabel: { fontSize: 11, fontWeight: '600', color: colors.gray500, marginTop: 2 },
  list: { padding: spacing.lg, gap: spacing.md },
  card: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: radius.md, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  imageWrap: { width: 90, height: 100 },
  cardBody: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  productName: { fontSize: 15, fontWeight: '800', color: colors.gray800 },
  productCategory: { fontSize: 12, color: colors.gray500, marginTop: 2, fontWeight: '500' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  price: { fontSize: 14, fontWeight: '900', color: colors.green800 },
  stock: { fontSize: 11, color: colors.gray400, marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  statusActive: { backgroundColor: colors.green100 },
  statusDraft: { backgroundColor: colors.gray100 },
  statusText: { fontSize: 10, fontWeight: '700' },
  statusTextActive: { color: colors.green700 },
  statusTextDraft: { color: colors.gray500 },
  empty: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.gray800 },
  emptyText: { fontSize: 13, color: colors.gray500, textAlign: 'center', lineHeight: 20 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.green700, paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.sm, marginTop: spacing.md },
  emptyBtnText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.green700, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
});
