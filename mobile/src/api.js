import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://frescoop-api.onrender.com';

let authToken = null;

export async function loadToken() {
  try {
    authToken = await SecureStore.getItemAsync('frescoop_token');
  } catch {
    authToken = null;
  }
  return authToken;
}

export async function saveToken(token) {
  authToken = token;
  try {
    await SecureStore.setItemAsync('frescoop_token', token);
  } catch {}
}

export async function clearToken() {
  authToken = null;
  try {
    await SecureStore.deleteItemAsync('frescoop_token');
  } catch {}
}

export function getToken() {
  return authToken;
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const timeout = options.timeout || 15000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_URL}${path}`, { ...options, headers, signal: controller.signal });
    clearTimeout(timer);
    if (res.status === 304) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
    return data;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('Délai de connexion dépassé');
    throw err;
  }
}

export const api = {
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/api/auth/me'),
  getStore: (version) => request(`/api/store${version ? `?v=${version}` : ''}`),
  updateStore: (patch) => request('/api/store', { method: 'PUT', body: JSON.stringify(patch) }),
  addProduct: (product) => request('/api/products', { method: 'POST', body: JSON.stringify(product) }),
  createOrder: (order) => request('/api/orders', { method: 'POST', body: JSON.stringify(order) }),
};
