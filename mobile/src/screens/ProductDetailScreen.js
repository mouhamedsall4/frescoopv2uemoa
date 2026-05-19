import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { api } from '../api';
import ProductImage from '../components/ProductImage';

export default function ProductDetailScreen({ product, store, user, onRefresh }) {
  const [quantity, setQuantity] = useState('1');
  const [ordering, setOrdering] = useState(false);

  if (!product) {
    return (
      <View style={styles.empty}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.gray400} />
        <Text style={styles.emptyText}>Produit introuvable</Text>
      </View>
    );
  }

  const seller = (store?.users || []).find(u => u.id === product.sellerId);
  const isOwner = product.sellerId === user.id;
  const qty = Math.max(1, Number(quantity) || 1);
  const total = qty * (product.price || 0);

  async function handleOrder() {
    Alert.alert(
      'Confirmer la commande',
      `${qty} ${product.unit || 'kg'} de ${product.name}\nTotal : ${total.toLocaleString()} FCFA`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setOrdering(true);
            try {
              await api.createOrder({
                productId: product.id,
                sellerId: product.sellerId,
                buyerId: user.id,
                quantity: qty,
                totalAmount: total,
              });
              Alert.alert('Commande envoyée', 'Le vendeur a été notifié. Suivez votre commande dans l\'onglet Commandes.');
              onRefresh();
            } catch (err) {
              Alert.alert('Erreur', err.message || 'Impossible de passer la commande.');
            } finally {
              setOrdering(false);
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageWrap}>
        <ProductImage imageUrl={product.imageUrl} images={product.images} image={product.image} category={product.category} name={product.name} size="large" />
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category || 'Produit'}</Text>
          </View>
          {product.quantityAvailable != null && (
            <Text style={styles.stockInfo}>
              <Ionicons name="cube-outline" size={12} color={colors.gray500} /> {product.quantityAvailable} {product.unit || 'kg'} dispo
            </Text>
          )}
        </View>

        <Text style={styles.name}>{product.name}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{Number(product.price || 0).toLocaleString()} FCFA</Text>
          {product.unit && <Text style={styles.unit}>/ {product.unit}</Text>}
        </View>

        {product.description ? <Text style={styles.description}>{product.description}</Text> : null}

        <View style={styles.sellerCard}>
          <View style={styles.sellerAvatar}>
            <Text style={styles.sellerAvatarText}>{seller?.name?.[0]?.toUpperCase() || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sellerName}>{seller?.name || 'Vendeur'}</Text>
            <Text style={styles.sellerRegion}>
              <Ionicons name="location-outline" size={11} color={colors.gray400} /> {seller?.region || 'UEMOA'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.gray400} />
        </View>

        {!isOwner && (
          <View style={styles.orderSection}>
            <Text style={styles.orderLabel}>Quantité ({product.unit || 'kg'})</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(String(Math.max(1, qty - 1)))}>
                <Ionicons name="remove" size={20} color={colors.green700} />
              </TouchableOpacity>
              <TextInput
                style={styles.qtyInput}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(String(qty + 1))}>
                <Ionicons name="add" size={20} color={colors.green700} />
              </TouchableOpacity>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>{total.toLocaleString()} FCFA</Text>
            </View>
            <TouchableOpacity style={[styles.orderBtn, ordering && { opacity: 0.7 }]} onPress={handleOrder} disabled={ordering}>
              <Ionicons name="cart" size={20} color={colors.white} />
              <Text style={styles.orderBtnText}>Commander</Text>
            </TouchableOpacity>
          </View>
        )}

        {isOwner && (
          <View style={styles.ownerBadge}>
            <Ionicons name="checkmark-circle" size={18} color={colors.green700} />
            <Text style={styles.ownerText}>C'est votre produit</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  imageWrap: { width: '100%', height: 260 },
  body: { padding: spacing.xl },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  categoryBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full, backgroundColor: colors.green100 },
  categoryText: { fontSize: 12, fontWeight: '700', color: colors.green700 },
  stockInfo: { fontSize: 12, color: colors.gray500, fontWeight: '500' },
  name: { fontSize: 24, fontWeight: '900', color: colors.gray800, marginBottom: spacing.sm },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: spacing.md },
  price: { fontSize: 24, fontWeight: '900', color: colors.green800 },
  unit: { fontSize: 14, color: colors.gray400 },
  description: { fontSize: 14, color: colors.gray600, lineHeight: 22, marginBottom: spacing.xl, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray100 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.lg, backgroundColor: colors.gray50, borderRadius: radius.md, marginBottom: spacing.xl },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.green800, justifyContent: 'center', alignItems: 'center' },
  sellerAvatarText: { fontSize: 18, fontWeight: '900', color: colors.white },
  sellerName: { fontSize: 15, fontWeight: '700', color: colors.gray800 },
  sellerRegion: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  orderSection: { backgroundColor: colors.gray50, borderRadius: radius.md, padding: spacing.lg },
  orderLabel: { fontSize: 13, fontWeight: '700', color: colors.gray600, marginBottom: spacing.sm },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  qtyBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.green100, justifyContent: 'center', alignItems: 'center' },
  qtyInput: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: colors.gray800, backgroundColor: colors.white, borderRadius: radius.sm, paddingVertical: 10, borderWidth: 1, borderColor: colors.gray200 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray200 },
  totalLabel: { fontSize: 14, fontWeight: '600', color: colors.gray500 },
  totalPrice: { fontSize: 20, fontWeight: '900', color: colors.green800 },
  orderBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.green700, paddingVertical: 16, borderRadius: radius.sm, marginTop: spacing.lg },
  orderBtnText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  ownerBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: spacing.lg, backgroundColor: colors.green50, borderRadius: radius.md },
  ownerText: { fontSize: 14, fontWeight: '600', color: colors.green700 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: spacing.md },
  emptyText: { fontSize: 16, color: colors.gray500 },
});
