import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Autorisez l\'accès aux photos pour ajouter une image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Autorisez l\'accès à la caméra.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  function handleImagePress() {
    Alert.alert('Photo du produit', 'Choisissez une option', [
      { text: 'Prendre une photo', onPress: takePhoto },
      { text: 'Galerie', onPress: pickImage },
      { text: 'Annuler', style: 'cancel' },
    ]);
  }

  async function handleSubmit() {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Champs requis', 'Le nom et le prix sont obligatoires.');
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
        imageUrl: imageUri || null,
        sellerId: user.id,
        ownerId: user.id,
        status: 'Publie',
      });
      Alert.alert('Produit publié', 'Votre produit est maintenant visible sur le marché.', [{ text: 'OK', onPress: onDone }]);
    } catch (err) {
      Alert.alert('Erreur', err.message || 'Impossible d\'ajouter le produit.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.imagePicker} onPress={handleImagePress} activeOpacity={0.7}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={32} color={colors.gray400} />
              <Text style={styles.imageText}>Ajouter une photo</Text>
            </View>
          )}
          {imageUri && (
            <TouchableOpacity style={styles.imageRemove} onPress={() => setImageUri(null)}>
              <Ionicons name="close-circle" size={24} color={colors.red500} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Nom du produit *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: Mil, Tomates, Mangues..." placeholderTextColor={colors.gray400} />

        <Text style={styles.label}>Catégorie</Text>
        <View style={styles.chips}>
          {categories.map(cat => (
            <TouchableOpacity key={cat} style={[styles.chip, category === cat && styles.chipActive]} onPress={() => setCategory(cat)}>
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Prix (FCFA) *</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="500" keyboardType="numeric" placeholderTextColor={colors.gray400} />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Quantité</Text>
            <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} placeholder="100" keyboardType="numeric" placeholderTextColor={colors.gray400} />
          </View>
        </View>

        <Text style={styles.label}>Unité</Text>
        <View style={styles.chips}>
          {units.map(u => (
            <TouchableOpacity key={u} style={[styles.chip, unit === u && styles.chipActive]} onPress={() => setUnit(u)}>
              <Text style={[styles.chipText, unit === u && styles.chipTextActive]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} placeholder="Décrivez votre produit..." placeholderTextColor={colors.gray400} multiline numberOfLines={3} textAlignVertical="top" />

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <View style={styles.btnContent}>
              <Ionicons name="checkmark-circle" size={20} color={colors.white} />
              <Text style={styles.btnText}>Publier le produit</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  scroll: { padding: spacing.xl, paddingBottom: 40 },
  imagePicker: { width: '100%', height: 180, borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.lg, borderWidth: 2, borderColor: colors.gray200, borderStyle: 'dashed' },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.gray50, gap: 8 },
  imageText: { fontSize: 13, fontWeight: '600', color: colors.gray400 },
  imageRemove: { position: 'absolute', top: 8, right: 8 },
  label: { fontSize: 13, fontWeight: '700', color: colors.gray600, marginBottom: spacing.xs, marginTop: spacing.lg },
  input: { borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: 13, fontSize: 15, backgroundColor: colors.white, color: colors.gray800 },
  textarea: { height: 80, paddingTop: 13 },
  row: { flexDirection: 'row', gap: spacing.md },
  halfField: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200 },
  chipActive: { backgroundColor: colors.green100, borderColor: colors.green700 },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.gray500 },
  chipTextActive: { color: colors.green700 },
  btn: { marginTop: spacing.xxl, backgroundColor: colors.green700, paddingVertical: 16, borderRadius: radius.sm, alignItems: 'center' },
  btnDisabled: { opacity: 0.7 },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '800' },
});
