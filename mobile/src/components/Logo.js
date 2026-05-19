import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function Logo({ size = 'medium' }) {
  const s = size === 'large' ? 64 : size === 'small' ? 36 : 48;
  const fontSize = s * 0.5;
  const nameFontSize = size === 'large' ? 28 : size === 'small' ? 16 : 20;

  return (
    <View style={styles.container}>
      <View style={[styles.circle, { width: s, height: s, borderRadius: s / 2 }]}>
        <Text style={[styles.letter, { fontSize }]}>F</Text>
        <View style={[styles.leaf, { top: s * 0.12, right: s * 0.15 }]} />
      </View>
      <View>
        <Text style={[styles.name, { fontSize: nameFontSize }]}>FresCoop</Text>
        {size === 'large' && <Text style={styles.tagline}>Vendre. Tracer. Prouver.</Text>}
      </View>
    </View>
  );
}

export function LogoMark({ size = 48 }) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.letter, { fontSize: size * 0.5 }]}>F</Text>
      <View style={[styles.leaf, { top: size * 0.12, right: size * 0.15 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  circle: { backgroundColor: colors.green950, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  letter: { fontWeight: '900', color: colors.white, marginLeft: -1 },
  leaf: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green500 },
  name: { fontWeight: '900', color: colors.green950, letterSpacing: -0.3 },
  tagline: { fontSize: 11, color: colors.gray500, fontWeight: '600', marginTop: 1 },
});
