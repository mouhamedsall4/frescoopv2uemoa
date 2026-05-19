import { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api, loadToken } from './src/api';
import { colors, shadow } from './src/theme';
import { cacheStore, getCachedStore, cacheUser, getCachedUser, clearCache } from './src/offlineStore';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import MarketScreen from './src/screens/MarketScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import ScoreScreen from './src/screens/ScoreScreen';
import HeaderMenu from './src/components/HeaderMenu';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function getTabsForRole(role) {
  switch (role) {
    case 'agriculteur':
      return [
        { name: 'Accueil', icon: 'home', component: 'home' },
        { name: 'Produits', icon: 'leaf', component: 'products' },
        { name: 'Marche', icon: 'storefront', component: 'market' },
        { name: 'Commandes', icon: 'receipt', component: 'orders' },
        { name: 'Profil', icon: 'person', component: 'profile' },
      ];
    case 'client':
      return [
        { name: 'Accueil', icon: 'home', component: 'home' },
        { name: 'Marche', icon: 'storefront', component: 'market' },
        { name: 'Commandes', icon: 'receipt', component: 'orders' },
        { name: 'Profil', icon: 'person', component: 'profile' },
      ];
    case 'acheteurB2B':
      return [
        { name: 'Accueil', icon: 'home', component: 'home' },
        { name: 'Marche', icon: 'storefront', component: 'market' },
        { name: 'Commandes', icon: 'receipt', component: 'orders' },
        { name: 'Lots', icon: 'cube', component: 'lots' },
        { name: 'Profil', icon: 'person', component: 'profile' },
      ];
    case 'agentTerrain':
      return [
        { name: 'Accueil', icon: 'home', component: 'home' },
        { name: 'Agriculteurs', icon: 'people', component: 'farmers' },
        { name: 'Commandes', icon: 'receipt', component: 'orders' },
        { name: 'Verification', icon: 'shield-checkmark', component: 'verification' },
        { name: 'Profil', icon: 'person', component: 'profile' },
      ];
    case 'partenaire':
      return [
        { name: 'Accueil', icon: 'home', component: 'home' },
        { name: 'Dossiers', icon: 'document-text', component: 'dossiers' },
        { name: 'Impact', icon: 'analytics', component: 'impact' },
        { name: 'Profil', icon: 'person', component: 'profile' },
      ];
    case 'admin':
      return [
        { name: 'Accueil', icon: 'home', component: 'home' },
        { name: 'Utilisateurs', icon: 'people', component: 'farmers' },
        { name: 'Produits', icon: 'leaf', component: 'products' },
        { name: 'Dossiers', icon: 'document-text', component: 'dossiers' },
        { name: 'Profil', icon: 'person', component: 'profile' },
      ];
    default:
      return [
        { name: 'Accueil', icon: 'home', component: 'home' },
        { name: 'Marche', icon: 'storefront', component: 'market' },
        { name: 'Commandes', icon: 'receipt', component: 'orders' },
        { name: 'Profil', icon: 'person', component: 'profile' },
      ];
  }
}

function HomeTabs({ user, store, onRefresh, onLogout, navigation }) {
  const tabs = getTabsForRole(user.role);

  const screenForComponent = (comp) => {
    switch (comp) {
      case 'home': return () => <HomeScreen user={user} store={store} onRefresh={onRefresh} navigation={navigation} />;
      case 'market': return () => <MarketScreen user={user} store={store} onRefresh={onRefresh} navigation={navigation} />;
      case 'products': return () => <ProductsScreen user={user} store={store} onRefresh={onRefresh} navigation={navigation} />;
      case 'orders': return () => <OrdersScreen user={user} store={store} onRefresh={onRefresh} />;
      case 'profile': return () => <ProfileScreen user={user} store={store} onLogout={onLogout} />;
      case 'farmers': return () => <FarmersScreen user={user} store={store} />;
      case 'dossiers': return () => <DossiersScreen user={user} store={store} />;
      case 'lots': return () => <LotsScreen user={user} store={store} />;
      case 'verification': return () => <VerificationScreen user={user} store={store} />;
      case 'impact': return () => <ImpactScreen user={user} store={store} />;
      default: return () => <HomeScreen user={user} store={store} onRefresh={onRefresh} navigation={navigation} />;
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          const tab = tabs.find(t => t.name === route.name);
          const iconName = focused ? tab.icon : `${tab.icon}-outline`;
          return <Ionicons name={iconName} size={21} color={color} />;
        },
        tabBarActiveTintColor: colors.green700,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: { paddingVertical: 4 },
        headerStyle: styles.header,
        headerTintColor: colors.white,
        headerTitle: () => (
          <View style={styles.headerLogoRow}>
            <View style={styles.headerLogo}>
              <Text style={styles.headerLogoText}>F</Text>
            </View>
            <Text style={styles.headerBrand}>FresCoop</Text>
          </View>
        ),
        headerRight: () => (
          <HeaderMenu role={user.role} navigation={navigation} />
        ),
      })}
    >
      {tabs.map(tab => (
        <Tab.Screen key={tab.name} name={tab.name}>
          {screenForComponent(tab.component)}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
}

function FarmersScreen({ user, store }) {
  const farmers = (store?.users || []).filter(u => u.role === 'agriculteur');
  return (
    <View style={{ flex: 1, backgroundColor: colors.gray50, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.gray800, marginBottom: 16 }}>Agriculteurs ({farmers.length})</Text>
      {farmers.map(f => (
        <View key={f.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: colors.white, borderRadius: 12, marginBottom: 8, ...shadow.sm }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.green850, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.white, fontWeight: '900', fontSize: 16 }}>{f.name?.[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.gray800 }}>{f.name}</Text>
            <Text style={{ fontSize: 12, color: colors.gray500 }}>{f.region || 'Non renseignée'} — Niv. {f.verificationLevel || 0}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.gray400} />
        </View>
      ))}
    </View>
  );
}

function DossiersScreen({ user, store }) {
  const dossiers = store?.dossiers || [];
  const filtered = user.role === 'admin' || user.role === 'partenaire' ? dossiers : dossiers.filter(d => d.userId === user.id || d.ownerId === user.id);
  return (
    <View style={{ flex: 1, backgroundColor: colors.gray50, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.gray800, marginBottom: 16 }}>Dossiers bancaires ({filtered.length})</Text>
      {filtered.length === 0 && (
        <View style={{ alignItems: 'center', paddingVertical: 60, gap: 12 }}>
          <Ionicons name="document-text-outline" size={48} color={colors.gray300} />
          <Text style={{ fontSize: 14, color: colors.gray500, textAlign: 'center' }}>Aucun dossier bancaire disponible</Text>
        </View>
      )}
      {filtered.map(d => {
        const owner = (store?.users || []).find(u => u.id === (d.userId || d.ownerId));
        return (
          <View key={d.id} style={{ padding: 14, backgroundColor: colors.white, borderRadius: 12, marginBottom: 8, ...shadow.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.gray800 }}>#{d.id?.slice(-6)}</Text>
              <View style={{ backgroundColor: d.status === 'Valide' ? colors.green100 : '#fef3c7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: d.status === 'Valide' ? colors.green700 : '#d97706' }}>{d.status}</Text>
              </View>
            </View>
            {owner && <Text style={{ fontSize: 12, color: colors.gray500, marginTop: 4 }}>{owner.name} - {owner.region || 'UEMOA'}</Text>}
            <Text style={{ fontSize: 12, color: colors.gray500, marginTop: 2 }}>Score: {d.score || '--'}/100</Text>
          </View>
        );
      })}
    </View>
  );
}

function LotsScreen({ user, store }) {
  const orders = (store?.orders || []).filter(o => {
    if (user.role === 'acheteurB2B') return o.buyerId === user.id || o.clientId === user.id;
    return o.sellerId === user.id || o.ownerId === user.id;
  });
  const lots = orders.filter(o => (o.quantity || 0) >= 10 || (o.totalAmount || 0) >= 100000);
  return (
    <View style={{ flex: 1, backgroundColor: colors.gray50, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.gray800, marginBottom: 4 }}>Lots & Achats en gros</Text>
      <Text style={{ fontSize: 12, color: colors.gray500, marginBottom: 16 }}>Commandes de volume important</Text>
      {lots.length === 0 && (
        <View style={{ alignItems: 'center', paddingVertical: 60, gap: 12 }}>
          <Ionicons name="cube-outline" size={48} color={colors.gray300} />
          <Text style={{ fontSize: 14, color: colors.gray500, textAlign: 'center' }}>Aucun lot en cours</Text>
        </View>
      )}
      {lots.map(o => (
        <View key={o.id} style={{ padding: 14, backgroundColor: colors.white, borderRadius: 12, marginBottom: 8, ...shadow.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.gray800 }}>Lot #{o.id?.slice(-6)}</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.green700 }}>{Number(o.totalAmount || 0).toLocaleString()} F</Text>
          </View>
          <Text style={{ fontSize: 12, color: colors.gray500, marginTop: 4 }}>{o.status} - Qte: {o.quantity || '?'}</Text>
        </View>
      ))}
    </View>
  );
}

function VerificationScreen({ user, store }) {
  const farmers = (store?.users || []).filter(u => u.role === 'agriculteur');
  const unverified = farmers.filter(f => (f.verificationLevel || 0) < 2);
  const verified = farmers.filter(f => (f.verificationLevel || 0) >= 2);
  return (
    <View style={{ flex: 1, backgroundColor: colors.gray50, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.gray800, marginBottom: 4 }}>Verifications</Text>
      <Text style={{ fontSize: 12, color: colors.gray500, marginBottom: 16 }}>Identites a verifier et valider</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <View style={{ flex: 1, padding: 12, backgroundColor: '#fef3c7', borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#d97706' }}>{unverified.length}</Text>
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#d97706' }}>En attente</Text>
        </View>
        <View style={{ flex: 1, padding: 12, backgroundColor: colors.green100, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '900', color: colors.green700 }}>{verified.length}</Text>
          <Text style={{ fontSize: 10, fontWeight: '700', color: colors.green700 }}>Verifies</Text>
        </View>
      </View>
      {unverified.map(f => (
        <View key={f.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: colors.white, borderRadius: 12, marginBottom: 8, ...shadow.sm }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fef3c7', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="shield-outline" size={18} color="#d97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.gray800 }}>{f.name}</Text>
            <Text style={{ fontSize: 12, color: colors.gray500 }}>{f.region || 'Non renseignee'} - Niveau {f.verificationLevel || 0}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.gray400} />
        </View>
      ))}
    </View>
  );
}

function ImpactScreen({ user, store }) {
  const farmers = (store?.users || []).filter(u => u.role === 'agriculteur');
  const products = store?.products || [];
  const orders = store?.orders || [];
  const completedOrders = orders.filter(o => o.status === 'Livree');
  const totalVolume = completedOrders.reduce((s, o) => s + Number(o.totalAmount || o.total || 0), 0);
  const bancables = farmers.filter(f => (f.verificationLevel || 0) >= 2).length;
  return (
    <View style={{ flex: 1, backgroundColor: colors.gray50, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.gray800, marginBottom: 4 }}>Impact & Indicateurs</Text>
      <Text style={{ fontSize: 12, color: colors.gray500, marginBottom: 16 }}>Suivi de l'inclusion financiere</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <View style={{ width: '47%', padding: 16, backgroundColor: colors.white, borderRadius: 12, alignItems: 'center', ...shadow.sm }}>
          <Ionicons name="people-outline" size={24} color={colors.green700} />
          <Text style={{ fontSize: 22, fontWeight: '900', color: colors.green700, marginTop: 4 }}>{farmers.length}</Text>
          <Text style={{ fontSize: 10, fontWeight: '700', color: colors.gray500 }}>Agriculteurs</Text>
        </View>
        <View style={{ width: '47%', padding: 16, backgroundColor: colors.white, borderRadius: 12, alignItems: 'center', ...shadow.sm }}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#2563eb" />
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#2563eb', marginTop: 4 }}>{bancables}</Text>
          <Text style={{ fontSize: 10, fontWeight: '700', color: colors.gray500 }}>Bancables</Text>
        </View>
        <View style={{ width: '47%', padding: 16, backgroundColor: colors.white, borderRadius: 12, alignItems: 'center', ...shadow.sm }}>
          <Ionicons name="leaf-outline" size={24} color="#d97706" />
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#d97706', marginTop: 4 }}>{products.length}</Text>
          <Text style={{ fontSize: 10, fontWeight: '700', color: colors.gray500 }}>Produits</Text>
        </View>
        <View style={{ width: '47%', padding: 16, backgroundColor: colors.white, borderRadius: 12, alignItems: 'center', ...shadow.sm }}>
          <Ionicons name="cash-outline" size={24} color={colors.green800} />
          <Text style={{ fontSize: 22, fontWeight: '900', color: colors.green800, marginTop: 4 }}>{(totalVolume / 1000000).toFixed(1)}M</Text>
          <Text style={{ fontSize: 10, fontWeight: '700', color: colors.gray500 }}>Volume FCFA</Text>
        </View>
      </View>
      <View style={{ marginTop: 16, padding: 16, backgroundColor: colors.white, borderRadius: 12, ...shadow.sm }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.gray800, marginBottom: 8 }}>Commandes completees</Text>
        <Text style={{ fontSize: 28, fontWeight: '900', color: colors.green700 }}>{completedOrders.length}</Text>
        <Text style={{ fontSize: 11, color: colors.gray500 }}>sur {orders.length} commandes totales</Text>
      </View>
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const fetchStore = useCallback(async () => {
    try {
      const data = await api.getStore();
      setStore(data);
      cacheStore(data);
    } catch {
      const cached = await getCachedStore();
      if (cached && !store) setStore(cached);
    }
  }, []);

  const handleLogin = useCallback(async (loggedUser) => {
    setUser(loggedUser);
    cacheUser(loggedUser);
    await fetchStore();
  }, [fetchStore]);

  const handleLogout = useCallback(() => {
    setUser(null);
    setStore(null);
    clearCache();
  }, []);

  useEffect(() => {
    (async () => {
      const token = await loadToken();
      if (token) {
        try {
          const res = await api.me();
          const u = res.user || res;
          setUser(u);
          cacheUser(u);
          await fetchStore();
        } catch {
          const cachedUser = await getCachedUser();
          if (cachedUser) {
            setUser(cachedUser);
            const cachedData = await getCachedStore();
            if (cachedData) setStore(cachedData);
          } else {
            setUser(null);
          }
        }
      }
      setLoading(false);
    })();
  }, [fetchStore]);

  if (loading) {
    return (
      <View style={styles.splash}>
        <View style={styles.splashLogo}>
          <Text style={styles.splashLogoText}>F</Text>
        </View>
        <Text style={styles.splashBrand}>FresCoop</Text>
        <Text style={styles.splashTagline}>De l'invisible au finançable</Text>
        <ActivityIndicator size="small" color={colors.green500} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={colors.green950} />
        <LoginScreen onLogin={handleLogin} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.green950} />
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color={colors.white} />
          <Text style={styles.offlineText}>Mode hors ligne</Text>
        </View>
      )}
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main">
            {({ navigation }) => (
              <HomeTabs
                user={user}
                store={store}
                onRefresh={fetchStore}
                onLogout={handleLogout}
                navigation={navigation}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="AddProduct"
            options={{
              headerShown: true,
              title: 'Nouveau produit',
              headerStyle: styles.header,
              headerTintColor: colors.white,
              headerTitleStyle: styles.headerTitleText,
              animation: 'slide_from_bottom',
            }}
          >
            {({ navigation }) => (
              <AddProductScreen user={user} onDone={() => { fetchStore(); navigation.goBack(); }} />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="Notifications"
            options={{
              headerShown: true,
              title: 'Notifications',
              headerStyle: styles.header,
              headerTintColor: colors.white,
              headerTitleStyle: styles.headerTitleText,
            }}
          >
            {() => <NotificationsScreen user={user} store={store} />}
          </Stack.Screen>
          <Stack.Screen
            name="ProductDetail"
            options={{
              headerShown: true,
              title: '',
              headerStyle: { ...styles.header, backgroundColor: 'transparent' },
              headerTintColor: colors.white,
              headerTransparent: true,
            }}
          >
            {({ route }) => <ProductDetailScreen product={route.params?.product} store={store} user={user} onRefresh={fetchStore} />}
          </Stack.Screen>
          <Stack.Screen
            name="Score"
            options={{
              headerShown: true,
              title: 'Mon Score',
              headerStyle: styles.header,
              headerTintColor: colors.white,
              headerTitleStyle: styles.headerTitleText,
            }}
          >
            {() => <ScoreScreen user={user} store={store} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.green950 },
  splashLogo: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 2, borderColor: colors.green500, justifyContent: 'center', alignItems: 'center' },
  splashLogoText: { fontSize: 32, fontWeight: '900', color: colors.green500 },
  splashBrand: { fontSize: 28, fontWeight: '900', color: colors.white, marginTop: 12 },
  splashTagline: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: '500' },
  tabBar: { backgroundColor: colors.white, borderTopWidth: 0, height: 62, paddingBottom: 8, paddingTop: 4, ...shadow.md },
  tabLabel: { fontSize: 10, fontWeight: '700' },
  header: { backgroundColor: colors.green950, elevation: 0, shadowOpacity: 0 },
  headerTitleText: { fontWeight: '800', fontSize: 17, color: colors.white },
  headerLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerLogo: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1.5, borderColor: colors.green500, justifyContent: 'center', alignItems: 'center' },
  headerLogoText: { fontSize: 14, fontWeight: '900', color: colors.green500 },
  headerBrand: { fontSize: 17, fontWeight: '900', color: colors.white },
  offlineBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.orange500, paddingVertical: 6 },
  offlineText: { fontSize: 12, fontWeight: '700', color: colors.white },
});
