import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function ScoreRing({ score, size = 80, color = colors.green600 }) {
  const strokeWidth = 6;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = (score / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: 'rgba(255,255,255,0.15)' }]} />
      <View style={[styles.ring, {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: color,
        borderTopColor: score >= 75 ? color : 'transparent',
        borderRightColor: score >= 50 ? color : 'transparent',
        borderBottomColor: score >= 25 ? color : 'transparent',
        borderLeftColor: score > 0 ? color : 'transparent',
        transform: [{ rotate: '-90deg' }],
      }]} />
      <View style={styles.center}>
        <Text style={[styles.scoreText, { color: colors.white, fontSize: size * 0.28 }]}>{score}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  ring: { position: 'absolute' },
  center: { justifyContent: 'center', alignItems: 'center' },
  scoreText: { fontWeight: '900' },
});
