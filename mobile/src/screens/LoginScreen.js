import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadow } from '../theme';
import { api, saveToken } from '../api';

const { width } = Dimensions.get('window');

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit() {
    setError('');
    if (!email.trim() || !password.trim()) { setError('Email et mot de passe requis'); return; }
    if (mode === 'register' && !name.trim()) { setError('Le nom est requis'); return; }
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await api.login(email.trim(), password)
        : await api.register({ name: name.trim(), email: email.trim(), password, phone: phone.trim(), region: region.trim(), role: 'agriculteur' });
      await saveToken(res.token);
      onLogin(res.user);
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoLetter}>F</Text>
            </View>
          </View>
          <Text style={styles.brandName}>FresCoop</Text>
          <Text style={styles.tagline}>De l'invisible au finançable.{'\n'}En 90 jours.</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}><Text style={styles.statNum}>80%</Text><Text style={styles.statLabel}>exclus du crédit</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.stat}><Text style={styles.statNum}>90j</Text><Text style={styles.statLabel}>pour être bancable</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.stat}><Text style={styles.statNum}>0 FCFA</Text><Text style={styles.statLabel}>pour l'agriculteur</Text></View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, mode === 'login' && styles.tabActive]} onPress={() => setMode('login')}>
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Connexion</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, mode === 'register' && styles.tabActive]} onPress={() => setMode('register')}>
              <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Inscription</Text>
            </TouchableOpacity>
          </View>

          {mode === 'register' && (
            <>
              <InputField icon="person-outline" value={name} onChangeText={setName} placeholder="Nom complet" autoCapitalize="words" />
              <InputField icon="call-outline" value={phone} onChangeText={setPhone} placeholder="+221 77 000 00 00" keyboardType="phone-pad" />
              <InputField icon="location-outline" value={region} onChangeText={setRegion} placeholder="Région (ex: Casamance)" />
            </>
          )}

          <InputField icon="mail-outline" value={email} onChangeText={setEmail} placeholder="votre@email.com" keyboardType="email-address" autoCapitalize="none" />

          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.gray400} />
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mot de passe" placeholderTextColor={colors.gray400} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.gray400} />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={15} color={colors.red500} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color={colors.white} /> : (
              <Text style={styles.btnText}>{mode === 'login' ? 'Se connecter' : "Créer mon compte"}</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Hackathon Filières Agricoles GIM-UEMOA 2026</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({ icon, ...props }) {
  return (
    <View style={styles.inputRow}>
      <Ionicons name={icon} size={18} color={colors.gray400} />
      <TextInput style={styles.input} placeholderTextColor={colors.gray400} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.green950 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  hero: { alignItems: 'center', marginBottom: spacing.xxxl, paddingTop: spacing.huge },
  logoRow: { marginBottom: spacing.md },
  logoCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.green500 },
  logoLetter: { fontSize: 24, fontWeight: '900', color: colors.green500 },
  brandName: { fontSize: 32, fontWeight: '900', color: colors.white, letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: '500', textAlign: 'center', lineHeight: 22, marginTop: spacing.sm },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xxl, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 16, fontWeight: '900', color: colors.green500 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.1)' },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xxl, ...shadow.lg },
  tabs: { flexDirection: 'row', backgroundColor: colors.gray100, borderRadius: radius.full, padding: 3, marginBottom: spacing.xl },
  tab: { flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: radius.full },
  tabActive: { backgroundColor: colors.white, ...shadow.sm },
  tabText: { fontSize: 14, fontWeight: '700', color: colors.gray400 },
  tabTextActive: { color: colors.green850 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.gray50, borderRadius: radius.sm, paddingHorizontal: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: colors.gray100 },
  input: { flex: 1, paddingVertical: 14, paddingHorizontal: 10, fontSize: 15, color: colors.gray800 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md },
  errorText: { color: colors.red500, fontSize: 13, fontWeight: '600', flex: 1 },
  btn: { marginTop: spacing.xxl, backgroundColor: colors.green700, paddingVertical: 16, borderRadius: radius.sm, alignItems: 'center' },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: spacing.xxl, fontWeight: '600' },
});
