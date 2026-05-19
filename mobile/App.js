import { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { api, loadToken, getToken } from './src/api';
import { colors } from './src/theme';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import MarketScreen from './src/screens/MarketScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';

import TabIcon from './src/components/TabIcon';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeTabs({ user, store, onRefresh, onLogout, navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
        tabBarActiveTintColor: colors.green700,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: styles.header,
        headerTintColor: colors.white,
        headerTitleStyle: styles.headerTitle,
      })}
    >
      <Tab.Screen name="Accueil" options={{ title: 'Accueil' }}>
        {() => <HomeScreen user={user} store={store} onRefresh={onRefresh} />}
      </Tab.Screen>
      <Tab.Screen name="Marché" options={{ title: 'Marché' }}>
        {() => <MarketScreen user={user} store={store} onRefresh={onRefresh} navigation={navigation} />}
      </Tab.Screen>
      <Tab.Screen name="Produits" options={{ title: 'Mes Produits' }}>
        {() => <ProductsScreen user={user} store={store} onRefresh={onRefresh} navigation={navigation} />}
      </Tab.Screen>
      <Tab.Screen name="Commandes" options={{ title: 'Commandes' }}>
        {() => <OrdersScreen user={user} store={store} onRefresh={onRefresh} />}
      </Tab.Screen>
      <Tab.Screen name="Profil" options={{ title: 'Profil' }}>
        {() => <ProfileScreen user={user} store={store} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStore = useCallback(async () => {
    try {
      const data = await api.getStore();
      setStore(data);
    } catch {}
  }, []);

  const handleLogin = useCallback(async (loggedUser) => {
    setUser(loggedUser);
    await fetchStore();
  }, [fetchStore]);

  const handleLogout = useCallback(() => {
    setUser(null);
    setStore(null);
  }, []);

  useEffect(() => {
    (async () => {
      const token = await loadToken();
      if (token) {
        try {
          const res = await api.me();
          setUser(res.user || res);
          await fetchStore();
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    })();
  }, [fetchStore]);

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.green500} />
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={colors.green800} />
        <LoginScreen onLogin={handleLogin} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.green800} />
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
              title: 'Ajouter un produit',
              headerStyle: styles.header,
              headerTintColor: colors.white,
              headerTitleStyle: styles.headerTitle,
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
              headerTitleStyle: styles.headerTitle,
            }}
          >
            {() => <NotificationsScreen user={user} store={store} />}
          </Stack.Screen>
          <Stack.Screen
            name="ProductDetail"
            options={{
              headerShown: true,
              title: 'Détail produit',
              headerStyle: styles.header,
              headerTintColor: colors.white,
              headerTitleStyle: styles.headerTitle,
            }}
          >
            {({ route }) => <ProductDetailScreen product={route.params?.product} store={store} user={user} onRefresh={fetchStore} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.green800,
  },
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  header: {
    backgroundColor: colors.green800,
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 17,
  },
});
