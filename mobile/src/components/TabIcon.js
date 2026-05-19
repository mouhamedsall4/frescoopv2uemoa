import { Ionicons } from '@expo/vector-icons';

const iconMap = {
  Accueil: 'home',
  Marché: 'storefront',
  Produits: 'leaf',
  Commandes: 'receipt',
  Profil: 'person',
};

export default function TabIcon({ name, focused, color }) {
  const iconName = iconMap[name] || 'ellipse';
  return <Ionicons name={focused ? iconName : `${iconName}-outline`} size={22} color={color} />;
}
