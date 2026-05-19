import { View, Text, StyleSheet } from 'react-native';

const icons = {
  Accueil: '🏠',
  Marché: '🏪',
  Produits: '🌾',
  Commandes: '📦',
  Profil: '👤',
};

export default function TabIcon({ name, focused, color }) {
  return (
    <View style={styles.container}>
      <Text style={[styles.icon, { opacity: focused ? 1 : 0.6 }]}>{icons[name] || '•'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22 },
});
