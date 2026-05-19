import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';

function getMenuItems(role) {
  const base = [
    { key: 'notifications', icon: 'notifications-outline', label: 'Notifications', nav: 'Notifications' },
  ];

  switch (role) {
    case 'agriculteur':
      return [
        { key: 'add', icon: 'add-circle-outline', label: 'Ajouter un produit', nav: 'AddProduct' },
        { key: 'score', icon: 'analytics-outline', label: 'Score détaillé', nav: 'Score' },
        ...base,
      ];
    case 'agentTerrain':
      return [
        { key: 'verify', icon: 'shield-checkmark-outline', label: 'Vérifications', nav: null },
        ...base,
      ];
    case 'admin':
      return [
        { key: 'users', icon: 'people-outline', label: 'Gestion utilisateurs', nav: null },
        { key: 'stats', icon: 'bar-chart-outline', label: 'Statistiques', nav: null },
        ...base,
      ];
    default:
      return base;
  }
}

export default function HeaderMenu({ role, navigation }) {
  const [visible, setVisible] = useState(false);
  const items = getMenuItems(role);

  function handlePress(item) {
    setVisible(false);
    if (item.nav) {
      navigation.navigate(item.nav);
    }
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconBtn}>
        <Ionicons name="notifications-outline" size={20} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setVisible(true)} style={styles.iconBtn}>
        <Ionicons name="ellipsis-vertical" size={20} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View style={styles.menu}>
            {items.map(item => (
              <TouchableOpacity key={item.key} style={styles.menuItem} onPress={() => handlePress(item)}>
                <Ionicons name={item.icon} size={20} color={colors.gray700} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 12 },
  iconBtn: { padding: 4 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 60, paddingRight: 16 },
  menu: { backgroundColor: colors.white, borderRadius: radius.md, paddingVertical: 8, minWidth: 200, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: colors.gray800 },
});
