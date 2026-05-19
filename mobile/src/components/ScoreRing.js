import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function ScoreRing({ score, size = 80, color = colors.green600 }) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, borderColor: color, borderWidth: 6 }]}>
      <Text style={[styles.scoreText, { color: colors.white, fontSize: size * 0.3 }]}>{score}</Text>
      <Text style={[styles.label, { color: 'rgba(255,255,255,0.7)' }]}>/100</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  scoreText: { fontWeight: '900', lineHeight: 30 },
  label: { fontSize: 10, fontWeight: '700', marginTop: -2 },
});
