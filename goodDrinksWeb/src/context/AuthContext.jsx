
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import { useNavigate } from 'react-router-dom';
import api, { setUnauthorizedHandler } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // CERRAR SESIÓN
  // ============================================================
  const logout = useCallback((redirect = true) => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('user');
    localStorage.removeItem('token');

    delete api.defaults.headers.common.Authorization;

    if (redirect) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // ============================================================
  // INICIAR SESIÓN
  // ============================================================
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

    // Guardar los datos de la sesión.
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);

    // Configurar el token para las peticiones siguientes.
    api.defaults.headers.common.Authorization = `Bearer ${authToken}`;

    // Actualizar el estado de React.
    setUser(userData);
    setToken(authToken);
  }, []);

  // ============================================================
  // RESTAURAR SESIÓN Y CONTROLAR ERRORES DE AUTENTICACIÓN
  // ============================================================
  useEffect(() => {
    // Si Axios recibe un 401, cerrar la sesión.
    setUnauthorizedHandler(logout);

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        if (
          !parsedUser ||
          typeof parsedUser !== 'object' ||
          Array.isArray(parsedUser)
        ) {
          throw new Error('Los datos del usuario guardado no son válidos.');
        }

        setUser(parsedUser);
        setToken(storedToken);

        api.defaults.headers.common.Authorization =
          `Bearer ${storedToken}`;
      } catch (error) {
        console.error(
          'No se pudo restaurar la sesión guardada:',
          error
        );

        logout();
      }
    } else {
      // Limpiar credenciales incompletas sin redirigir.
      setUser(null);
      setToken(null);

      localStorage.removeItem('user');
      localStorage.removeItem('token');

      delete api.defaults.headers.common.Authorization;
    }

    setLoading(false);

    // Desregistrar el manejador cuando se desmonte el contexto.
    return () => {
      setUnauthorizedHandler(null);
    };
  }, [logout]);

  // ============================================================
  // VALORES DISPONIBLES PARA TODA LA APLICACIÓN
  // ============================================================
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

// ============================================================
// HOOK PARA ACCEDER A LA AUTENTICACIÓN
// ============================================================
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return context;
}
