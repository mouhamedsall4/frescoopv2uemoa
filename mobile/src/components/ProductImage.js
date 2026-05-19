import { View, Image, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const categoryIcons = {
  'Céréales': 'nutrition',
  'Légumes': 'leaf',
  'Fruits': 'nutrition',
  'Tubercules': 'earth',
  'Oléagineux': 'water',
  'Maraîchage': 'leaf',
  'Transformation': 'flask',
  'Élevage': 'paw',
};

const categoryColors = {
  'Céréales': '#f59e0b',
  'Légumes': '#10b981',
  'Fruits': '#f97316',
  'Tubercules': '#8b5cf6',
  'Oléagineux': '#06b6d4',
  'Maraîchage': '#22c55e',
  'Transformation': '#ec4899',
  'Élevage': '#6366f1',
};

export default function ProductImage({ imageUrl, category, name, style, size = 'medium' }) {
  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={[styles.image, style]} resizeMode="cover" />;
  }

  const icon = categoryIcons[category] || 'leaf';
  const bgColor = categoryColors[category] || colors.green600;
  const iconSize = size === 'large' ? 48 : size === 'small' ? 20 : 28;

  return (
    <View style={[styles.placeholder, { backgroundColor: bgColor + '15' }, style]}>
      <Ionicons name={icon} size={iconSize} color={bgColor} />
      {size !== 'small' && (
        <Text style={[styles.placeholderName, { color: bgColor }]} numberOfLines={1}>
          {name || category || 'Produit'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
  placeholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', gap: 6 },
  placeholderName: { fontSize: 11, fontWeight: '700', textAlign: 'center', paddingHorizontal: 8 },
});
