import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { colors, spacing, radius } from '../theme';
import { api, saveToken } from '../api';

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Email et mot de passe requis');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Nom requis');
      return;
    }
    setLoading(true);
    try {
      let res;
      if (mode === 'login') {
        res = await api.login(email.trim(), password);
      } else {
        res = await api.register({ name: name.trim(), email: email.trim(), password, phone: phone.trim(), role: 'agriculteur' });
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
          <Text style={styles.subtitle}>Votre score de bancabilité en poche</Text>
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
              <Text style={styles.label}>Nom complet</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Amadou Diallo" autoCapitalize="words" />
              <Text style={styles.label}>Téléphone</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+221 77 000 00 00" keyboardType="phone-pad" />
            </>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="votre@email.com" keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••" secureTextEntry />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{mode === 'login' ? 'Se connecter' : "S'inscrire"}</Text>}
          </TouchableOpacity>
        </View>
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
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 },
  tabs: { flexDirection: 'row', marginBottom: spacing.xl, backgroundColor: colors.gray100, borderRadius: radius.full, padding: 4 },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderRadius: radius.full },
  tabActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '700', color: colors.gray500 },
  tabTextActive: { color: colors.green800 },
  label: { fontSize: 13, fontWeight: '700', color: colors.gray600, marginBottom: spacing.xs, marginTop: spacing.lg },
  input: { borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: 15, backgroundColor: colors.gray50 },
  btn: { marginTop: spacing.xl, backgroundColor: colors.green700, paddingVertical: 15, borderRadius: radius.sm, alignItems: 'center' },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  error: { color: colors.red500, fontSize: 13, marginTop: spacing.md, textAlign: 'center', fontWeight: '600' },
});
