import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, radius } from '../theme';

export default function ProductsScreen({ user, store, onRefresh, navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const products = (store?.products || []).filter(p => p.sellerId === user.id);
  const parentNav = navigation?.getParent?.() || navigation;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  function renderProduct({ item }) {
    return (
      <View style={styles.card}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>{item.name?.[0] || '?'}</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category || 'Produit'}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.price}>{Number(item.price || 0).toLocaleString()} FCFA</Text>
            <View style={[styles.statusBadge, item.status === 'Publie' ? styles.statusActive : styles.statusDraft]}>
              <Text style={[styles.statusText, item.status === 'Publie' ? styles.statusTextActive : styles.statusTextDraft]}>{item.status || 'Brouillon'}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.green700]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🌾</Text>
            <Text style={styles.emptyTitle}>Aucun produit</Text>
            <Text style={styles.emptyText}>Publiez votre premier produit pour augmenter votre score.</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => parentNav?.navigate?.('AddProduct')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  list: { padding: spacing.lg, gap: spacing.md },
  card: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: radius.md, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  image: { width: 90, height: 90 },
  imagePlaceholder: { backgroundColor: colors.green100, justifyContent: 'center', alignItems: 'center' },
  imagePlaceholderText: { fontSize: 28, fontWeight: '900', color: colors.green700 },
  cardBody: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  productName: { fontSize: 15, fontWeight: '800', color: colors.gray800 },
  productCategory: { fontSize: 12, color: colors.gray500, marginTop: 2, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  price: { fontSize: 14, fontWeight: '900', color: colors.green800 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  statusActive: { backgroundColor: colors.green100 },
  statusDraft: { backgroundColor: colors.gray100 },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextActive: { color: colors.green700 },
  statusTextDraft: { color: colors.gray500 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.gray800 },
  emptyText: { fontSize: 13, color: colors.gray500, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.xxxl, lineHeight: 20 },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.green700, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  fabText: { fontSize: 28, fontWeight: '700', color: colors.white, marginTop: -2 },
});
