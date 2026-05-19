import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import ProductImage from '../components/ProductImage';

const CATEGORIES = ['Tous', 'Céréales', 'Légumes', 'Fruits', 'Tubercules', 'Oléagineux', 'Autres'];

export default function MarketScreen({ user, store, onRefresh, navigation }) {
  const parentNav = navigation?.getParent?.() || navigation;
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Tous');

  const products = (store?.products || [])
    .filter(p => p.status === 'Publie' && p.sellerId !== user.id)
    .filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()))
    .filter(p => selectedCat === 'Tous' || p.category === selectedCat);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  function renderProduct({ item }) {
    const seller = (store?.users || []).find(u => u.id === item.sellerId);
    return (
      <TouchableOpacity style={styles.card} onPress={() => parentNav?.navigate?.('ProductDetail', { product: item })} activeOpacity={0.7}>
        <View style={styles.imageWrap}>
          <ProductImage imageUrl={item.imageUrl} images={item.images} image={item.image} category={item.category} name={item.name} size="medium" />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.seller} numberOfLines={1}>
            <Ionicons name="person-outline" size={10} color={colors.gray400} /> {seller?.name || 'Vendeur'} — {item.region || seller?.region || ''}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{Number(item.price || 0).toLocaleString()} F</Text>
            {item.unit && <Text style={styles.unit}>/{item.unit}</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            placeholderTextColor={colors.gray400}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.gray400} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={c => c}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              style={[styles.filterChip, selectedCat === cat && styles.filterChipActive]}
              onPress={() => setSelectedCat(cat)}
            >
              <Text style={[styles.filterText, selectedCat === cat && styles.filterTextActive]}>{cat}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.green700]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="storefront-outline" size={48} color={colors.gray300} />
            <Text style={styles.emptyTitle}>Aucun produit disponible</Text>
            <Text style={styles.emptyText}>Les produits publiés par les autres agriculteurs apparaîtront ici.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  searchRow: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: 10, borderWidth: 1, borderColor: colors.gray200, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.gray800 },
  filterRow: { paddingTop: spacing.md },
  filterList: { paddingHorizontal: spacing.lg, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200 },
  filterChipActive: { backgroundColor: colors.green700, borderColor: colors.green700 },
  filterText: { fontSize: 12, fontWeight: '700', color: colors.gray500 },
  filterTextActive: { color: colors.white },
  list: { padding: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  columns: { gap: spacing.md },
  card: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  imageWrap: { width: '100%', height: 120 },
  cardBody: { padding: spacing.md },
  name: { fontSize: 14, fontWeight: '800', color: colors.gray800 },
  seller: { fontSize: 11, color: colors.gray500, marginTop: 3, fontWeight: '500' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.sm },
  price: { fontSize: 15, fontWeight: '900', color: colors.green800 },
  unit: { fontSize: 11, color: colors.gray400, marginLeft: 2 },
  empty: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.gray800 },
  emptyText: { fontSize: 13, color: colors.gray500, textAlign: 'center', lineHeight: 20 },
  gray300: '#d1d5db',
});
