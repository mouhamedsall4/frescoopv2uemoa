import { View, Image, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const defaultProduct = require('../../assets/default-product.jpg');
const defaultAgriculture = require('../../assets/default-agriculture.jpg');

const categoryConfig = {
  'Céréales': { icon: 'nutrition', color: '#d97706', bg: '#fef3c7' },
  'Légumes': { icon: 'leaf', color: '#16a34a', bg: '#dcfce7' },
  'Fruits': { icon: 'nutrition', color: '#ea580c', bg: '#ffedd5' },
  'Tubercules': { icon: 'earth', color: '#7c3aed', bg: '#f3e8ff' },
  'Oléagineux': { icon: 'water', color: '#0891b2', bg: '#cffafe' },
  'Maraîchage': { icon: 'leaf', color: '#059669', bg: '#d1fae5' },
  'Transformation': { icon: 'flask', color: '#db2777', bg: '#fce7f3' },
  'Élevage': { icon: 'paw', color: '#4f46e5', bg: '#e0e7ff' },
  'Autres': { icon: 'basket', color: '#6b7280', bg: '#f3f4f6' },
};

function extractImageUrl(imageUrl, images, image) {
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl && typeof imageUrl === 'object' && imageUrl.dataUrl) return imageUrl.dataUrl;
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    if (typeof first === 'string') return first;
    if (first?.url) return first.url;
    if (first?.dataUrl) return first.dataUrl;
  }
  if (image && typeof image === 'string') {
    if (image.startsWith('http') || image.startsWith('data:')) return image;
  }
  if (image && typeof image === 'object' && image.dataUrl) return image.dataUrl;
  return null;
}

export default function ProductImage({ imageUrl, images, image, category, name, style, size = 'medium' }) {
  const url = extractImageUrl(imageUrl, images, image);

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={[styles.image, style]}
        resizeMode="cover"
        defaultSource={defaultProduct}
      />
    );
  }

  const config = categoryConfig[category] || categoryConfig['Autres'];
  const iconSize = size === 'large' ? 40 : size === 'small' ? 22 : 30;

  return (
    <View style={[styles.placeholder, { backgroundColor: config.bg }, style]}>
      <Image source={defaultProduct} style={styles.bgImage} blurRadius={3} />
      <View style={styles.overlay}>
        <View style={[styles.iconCircle, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon} size={iconSize} color={config.color} />
        </View>
        {size !== 'small' && name && (
          <Text style={[styles.label, { color: config.color }]} numberOfLines={1}>{name}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%', backgroundColor: colors.gray100 },
  placeholder: { width: '100%', height: '100%', overflow: 'hidden' },
  bgImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.15 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 6 },
  iconCircle: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 11, fontWeight: '700', textAlign: 'center', paddingHorizontal: 8 },
});
