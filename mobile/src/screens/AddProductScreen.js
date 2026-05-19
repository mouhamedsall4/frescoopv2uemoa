import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { colors, spacing, radius } from '../theme';
import { api } from '../api';

const categories = ['Céréales', 'Légumes', 'Fruits', 'Tubercules', 'Oléagineux', 'Autres'];
const units = ['kg', 'tonne', 'sac', 'panier', 'unité'];

export default function AddProductScreen({ user, onDone }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Erreur', 'Le nom et le prix sont requis.');
      return;
    }
    setLoading(true);
    try {
      await api.addProduct({
        name: name.trim(),
        category: category || 'Autres',
        price: Number(price),
        unit,
        quantityAvailable: Number(quantity) || null,
        description: description.trim(),
        sellerId: user.id,
        status: 'Publie',
      });
      Alert.alert('Succès', 'Produit ajouté avec succès !', [{ text: 'OK', onPress: onDone }]);
    } catch (err) {
      Alert.alert('Erreur', err.message || 'Impossible d\'ajouter le produit.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Nom du produit *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: Mil, Tomates, Mangues..." />

        <Text style={styles.label}>Catégorie</Text>
        <View style={styles.chips}>
          {categories.map(cat => (
            <TouchableOpacity key={cat} style={[styles.chip, category === cat && styles.chipActive]} onPress={() => setCategory(cat)}>
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Prix (FCFA) *</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="500" keyboardType="numeric" />

        <Text style={styles.label}>Unité</Text>
        <View style={styles.chips}>
          {units.map(u => (
            <TouchableOpacity key={u} style={[styles.chip, unit === u && styles.chipActive]} onPress={() => setUnit(u)}>
              <Text style={[styles.chipText, unit === u && styles.chipTextActive]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Quantité disponible</Text>
        <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} placeholder="100" keyboardType="numeric" />

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} placeholder="Description du produit..." multiline numberOfLines={4} textAlignVertical="top" />

        <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Publier le produit</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  scroll: { padding: spacing.xl, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '700', color: colors.gray600, marginBottom: spacing.xs, marginTop: spacing.lg },
  input: { borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: 14, fontSize: 15, backgroundColor: colors.white },
  textarea: { height: 100, paddingTop: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.gray100, borderWidth: 1, borderColor: colors.gray200 },
  chipActive: { backgroundColor: colors.green100, borderColor: colors.green700 },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.gray500 },
  chipTextActive: { color: colors.green700 },
  btn: { marginTop: spacing.xxl, backgroundColor: colors.green700, paddingVertical: 16, borderRadius: radius.sm, alignItems: 'center' },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '800' },
});
