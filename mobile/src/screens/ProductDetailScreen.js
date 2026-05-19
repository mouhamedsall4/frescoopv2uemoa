import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, radius } from '../theme';
import { api } from '../api';

export default function ProductDetailScreen({ product, store, user, onRefresh }) {
  if (!product) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Produit introuvable</Text>
      </View>
    );
  }

  const seller = (store?.users || []).find(u => u.id === product.sellerId);
  const isOwner = product.sellerId === user.id;

  async function handleOrder() {
    Alert.alert(
      'Commander',
      `Voulez-vous commander ${product.name} à ${Number(product.price).toLocaleString()} FCFA/${product.unit || 'kg'} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Commander',
          onPress: async () => {
            try {
              await api.createOrder({
                productId: product.id,
                sellerId: product.sellerId,
                buyerId: user.id,
                quantity: 1,
                totalAmount: product.price,
              });
              Alert.alert('Succès', 'Commande passée avec succès !');
              onRefresh();
            } catch (err) {
              Alert.alert('Erreur', err.message || 'Impossible de passer la commande.');
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container}>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.imageText}>{product.name?.[0] || '?'}</Text>
        </View>
      )}

      <View style={styles.body}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{product.category || 'Produit'}</Text>
        </View>

        <Text style={styles.name}>{product.name}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{Number(product.price || 0).toLocaleString()} FCFA</Text>
          {product.unit && <Text style={styles.unit}>/ {product.unit}</Text>}
        </View>

        {product.quantityAvailable != null && (
          <Text style={styles.stock}>{product.quantityAvailable} {product.unit || 'kg'} disponibles</Text>
        )}

        {product.description ? <Text style={styles.description}>{product.description}</Text> : null}

        <View style={styles.sellerCard}>
          <View style={styles.sellerAvatar}>
            <Text style={styles.sellerAvatarText}>{seller?.name?.[0] || '?'}</Text>
          </View>
          <View>
            <Text style={styles.sellerName}>{seller?.name || 'Vendeur'}</Text>
            <Text style={styles.sellerRegion}>{seller?.region || 'UEMOA'}</Text>
          </View>
        </View>

        {!isOwner && (
          <TouchableOpacity style={styles.orderBtn} onPress={handleOrder}>
            <Text style={styles.orderBtnText}>Commander ce produit</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  image: { width: '100%', height: 240 },
  imagePlaceholder: { backgroundColor: colors.green100, justifyContent: 'center', alignItems: 'center' },
  imageText: { fontSize: 64, fontWeight: '900', color: colors.green700 },
  body: { padding: spacing.xl },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full, backgroundColor: colors.green100, marginBottom: spacing.md },
  categoryText: { fontSize: 12, fontWeight: '700', color: colors.green700 },
  name: { fontSize: 24, fontWeight: '900', color: colors.gray800, marginBottom: spacing.sm },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: spacing.sm },
  price: { fontSize: 22, fontWeight: '900', color: colors.green800 },
  unit: { fontSize: 14, color: colors.gray400 },
  stock: { fontSize: 13, color: colors.gray500, marginBottom: spacing.lg },
  description: { fontSize: 14, color: colors.gray600, lineHeight: 22, marginBottom: spacing.xl },
  sellerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.lg, backgroundColor: colors.gray50, borderRadius: radius.md, marginBottom: spacing.xl },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.green800, justifyContent: 'center', alignItems: 'center' },
  sellerAvatarText: { fontSize: 18, fontWeight: '900', color: colors.white },
  sellerName: { fontSize: 15, fontWeight: '700', color: colors.gray800 },
  sellerRegion: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  orderBtn: { backgroundColor: colors.green700, paddingVertical: 16, borderRadius: radius.sm, alignItems: 'center' },
  orderBtnText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: colors.gray500 },
});
