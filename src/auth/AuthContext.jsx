import { createContext, useContext, useEffect, useState } from 'react';
import { API_URL, TOKEN_KEY } from '@/api/config';
import { apolloClient } from '@/api/apollo';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-login al montar la app: si hay token guardado, lo validamos con /auth/me
 // 1. En el useEffect del auto-login
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setTimeout(() => setLoading(false), 2000); // Espera 1 seg antes de echarte al login
      return;
    }

    // Ejecuta el fetch y el delay de 1 seg al mismo tiempo
    Promise.all([
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        if (!res.ok) throw new Error('Token inválido');
        return res.json();
      }),
      new Promise(resolve => setTimeout(resolve, 2000))
    ])
      .then(([u]) => setUser(u))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // 2. En la función login
  const login = async (email, password) => {
    // Ejecuta la petición al backend y el delay en paralelo
    const [res] = await Promise.all([
      fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }),
      new Promise(resolve => setTimeout(resolve, 1000))
    ]);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Credenciales inválidas');
    }

    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
  localStorage.removeItem(TOKEN_KEY);
  setUser(null);
  try {
    await apolloClient.clearStore();
  } catch {
    // silencioso
  }
};

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser,setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

const refreshUser = async () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Token inválido');
    const u = await res.json();
    setUser(u);
    return u;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    return null;
  }
};