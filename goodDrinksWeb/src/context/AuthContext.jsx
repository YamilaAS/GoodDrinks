
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import api, { setUnauthorizedHandler } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('user');
    localStorage.removeItem('token');

    delete api.defaults.headers.common.Authorization;
  }, []);

  const login = useCallback((data, explicitToken) => {
    // Admite login(userData, token) y login({ user, token }).
    const userData = explicitToken
      ? data
      : (data.user || data);

    const authToken =
      explicitToken ||
      data.token ||
      localStorage.getItem('token');

    if (!authToken || !userData) {
      throw new Error('No se recibió un usuario o token válido.');
    }

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);

    api.defaults.headers.common.Authorization = `Bearer ${authToken}`;

    setUser(userData);
    setToken(authToken);
  }, []);

  // Restaurar la sesión y registrar el manejador de 401.
  useEffect(() => {
    setUnauthorizedHandler(logout);

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        if (!parsedUser || typeof parsedUser !== 'object' || Array.isArray(parsedUser)) {
          throw new Error('Los datos del usuario guardado no son válidos.');
        }

        setUser(parsedUser);
        setToken(storedToken);

        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
      } catch (error) {
        console.error('No se pudo restaurar la sesión guardada:', error);
        logout();
      }
    } else {
      // Evitar conservar una sesión incompleta.
      logout();
    }

    setLoading(false);

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return context;
}
