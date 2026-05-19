import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Image, TouchableOpacity, TextInput } from 'react-native';
import { colors, spacing, radius } from '../theme';

export default function MarketScreen({ user, store, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const products = (store?.products || [])
    .filter(p => p.status === 'Publie' && p.sellerId !== user.id)
    .filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  function renderProduct({ item }) {
    const seller = (store?.users || []).find(u => u.id === item.sellerId);
    return (
      <View style={styles.card}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imgPlaceholder]}>
            <Text style={styles.imgText}>🌾</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.seller}>{seller?.name || 'Vendeur'} • {item.category || ''}</Text>
          <View style={styles.row}>
            <Text style={styles.price}>{Number(item.price || 0).toLocaleString()} FCFA</Text>
            {item.unit && <Text style={styles.unit}>/ {item.unit}</Text>}
          </View>
          {item.quantityAvailable != null && (
            <Text style={styles.stock}>{item.quantityAvailable} {item.unit || 'kg'} disponibles</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit..."
          placeholderTextColor={colors.gray400}
          value={search}
          onChangeText={setSearch}
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
            <Text style={styles.emptyIcon}>🏪</Text>
            <Text style={styles.emptyTitle}>Marché vide</Text>
            <Text style={styles.emptyText}>Aucun produit disponible pour le moment.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  searchBox: { padding: spacing.lg, paddingBottom: 0 },
  searchInput: { backgroundColor: colors.white, borderRadius: radius.full, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.gray200, fontWeight: '600' },
  list: { padding: spacing.lg, gap: spacing.md },
  columns: { gap: spacing.md },
  card: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  image: { width: '100%', height: 110 },
  imgPlaceholder: { backgroundColor: colors.green50, justifyContent: 'center', alignItems: 'center' },
  imgText: { fontSize: 32 },
  cardBody: { padding: spacing.md },
  name: { fontSize: 14, fontWeight: '800', color: colors.gray800 },
  seller: { fontSize: 11, color: colors.gray500, marginTop: 2, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: spacing.sm },
  price: { fontSize: 14, fontWeight: '900', color: colors.green800 },
  unit: { fontSize: 11, color: colors.gray400 },
  stock: { fontSize: 11, color: colors.gray400, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.gray800 },
  emptyText: { fontSize: 13, color: colors.gray500, textAlign: 'center', marginTop: spacing.sm },
});
