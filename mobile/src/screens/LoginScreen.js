import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { api, saveToken } from '../api';

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
    if (!email.trim() || !password.trim()) {
      setError('Email et mot de passe requis');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Le nom est requis');
      return;
    }
    setLoading(true);
    try {
      let res;
      if (mode === 'login') {
        res = await api.login(email.trim(), password);
      } else {
        res = await api.register({ name: name.trim(), email: email.trim(), password, phone: phone.trim(), region: region.trim(), role: 'agriculteur' });
      }
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
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>F</Text>
          </View>
          <Text style={styles.title}>FresCoop</Text>
          <Text style={styles.subtitle}>De l'invisible au finançable</Text>
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
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={18} color={colors.gray400} />
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nom complet" placeholderTextColor={colors.gray400} autoCapitalize="words" />
              </View>
              <View style={styles.inputRow}>
                <Ionicons name="call-outline" size={18} color={colors.gray400} />
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+221 77 000 00 00" placeholderTextColor={colors.gray400} keyboardType="phone-pad" />
              </View>
              <View style={styles.inputRow}>
                <Ionicons name="location-outline" size={18} color={colors.gray400} />
                <TextInput style={styles.input} value={region} onChangeText={setRegion} placeholder="Région (ex: Casamance)" placeholderTextColor={colors.gray400} />
              </View>
            </>
          )}

          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={18} color={colors.gray400} />
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="votre@email.com" placeholderTextColor={colors.gray400} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.gray400} />
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mot de passe" placeholderTextColor={colors.gray400} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.gray400} />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={16} color={colors.red500} />
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <View style={styles.btnContent}>
                <Ionicons name={mode === 'login' ? 'log-in-outline' : 'person-add-outline'} size={20} color={colors.white} />
                <Text style={styles.btnText}>{mode === 'login' ? 'Se connecter' : "S'inscrire"}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Hackathon GIM-UEMOA 2026</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.green800 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing.xxxl },
  logoCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  logoText: { fontSize: 28, fontWeight: '900', color: colors.green800 },
  title: { fontSize: 28, fontWeight: '900', color: colors.white, marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 },
  tabs: { flexDirection: 'row', marginBottom: spacing.xl, backgroundColor: colors.gray100, borderRadius: radius.full, padding: 4 },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderRadius: radius.full },
  tabActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '700', color: colors.gray500 },
  tabTextActive: { color: colors.green800 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.sm, paddingHorizontal: spacing.md, marginTop: spacing.md, backgroundColor: colors.gray50 },
  input: { flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 15, color: colors.gray800 },
  btn: { marginTop: spacing.xl, backgroundColor: colors.green700, paddingVertical: 15, borderRadius: radius.sm, alignItems: 'center' },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md, paddingHorizontal: 4 },
  error: { color: colors.red500, fontSize: 13, fontWeight: '600', flex: 1 },
  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: spacing.xxl, fontWeight: '600' },
});
