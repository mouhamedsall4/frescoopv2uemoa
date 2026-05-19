import AsyncStorage from '@react-native-async-storage/async-storage';

const STORE_KEY = '@frescoop_store_cache';
const USER_KEY = '@frescoop_user_cache';

export async function cacheStore(store) {
  try {
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {}
}

export async function getCachedStore() {
  try {
    const data = await AsyncStorage.getItem(STORE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function cacheUser(user) {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {}
}

export async function getCachedUser() {
  try {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function clearCache() {
  try {
    await AsyncStorage.multiRemove([STORE_KEY, USER_KEY]);
  } catch {}
}
