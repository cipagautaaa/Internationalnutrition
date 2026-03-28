import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext();

const AUTH_LAST_ACTIVITY_KEY = 'auth_last_activity_at';
const IDLE_TIMEOUT_MINUTES = Number(import.meta.env.VITE_AUTH_IDLE_TIMEOUT_MINUTES || 30);
const IDLE_TIMEOUT_MS = Math.max(5, IDLE_TIMEOUT_MINUTES) * 60 * 1000;

const clearPersistedAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem(AUTH_LAST_ACTIVITY_KEY);
};

const touchAuthActivity = () => {
  localStorage.setItem(AUTH_LAST_ACTIVITY_KEY, String(Date.now()));
};

const hasIdleSessionExpired = () => {
  const lastActivity = Number(localStorage.getItem(AUTH_LAST_ACTIVITY_KEY) || 0);
  if (!lastActivity) return false;
  return (Date.now() - lastActivity) > IDLE_TIMEOUT_MS;
};

const authReducer = (state, action) => {
  console.log('🔄 Reducer:', action.type, 'User:', action.payload?.user?.email);
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token || state.token,
        isAuthenticated: true,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'VERIFY_START':
      return { ...state, loading: true, error: null };
    case 'VERIFY_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token || state.token,
        isAuthenticated: true,
        error: null
      };
    case 'ADMIN_PIN_PENDING':
      return {
        ...state,
        loading: false,
        pendingAdminPin: true,
        tempToken: action.payload.tempToken,
        user: action.payload.user,
        isAuthenticated: false,
        error: null
      };
    case 'ADMIN_PIN_SUCCESS':
      return {
        ...state,
        loading: false,
        pendingAdminPin: false,
        tempToken: null,
        token: action.payload.token, // Guardar en memoria (NO en localStorage)
        user: action.payload.user,
        isAuthenticated: true,
        error: null
      };
    case 'VERIFY_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'STOP_LOADING':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    email: null,
    loading: false,
  error: null,
  pendingAdminPin: false,
  tempToken: null
  });

  // Configurar axios con token
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Configurar axios con token desde localStorage (para usuarios normales)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [state.token]);

  // Restaurar sesión verificando el token realmente (evita estado "logueado" falso)
  useEffect(() => {
    const boot = async () => {
      console.log('🔄 Boot iniciando...');
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('📦 Token en localStorage:', token ? token.substring(0, 20) + '...' : 'NO EXISTE');
      console.log('📦 User en localStorage:', savedUser ? JSON.parse(savedUser).email : 'NO EXISTE');
      
      if (savedUser) {
        try {
          JSON.parse(savedUser);
        } catch {
          // JSON inválido, limpiar
          console.error('❌ JSON inválido en localStorage');
          clearPersistedAuth();
          return;
        }
      }
      
      if (!token) {
        console.log('⚠️ No hay token, saltando boot');
        return; // no token => no intento
      }

      // Cerrar sesión si excede el tiempo de inactividad configurado
      if (hasIdleSessionExpired()) {
        console.log('⏱️ Sesión expirada por inactividad en boot');
        clearPersistedAuth();
        dispatch({ type: 'LOGOUT' });
        return;
      }

      try {
        // Intentar perfil para validar token
        console.log('🔍 Validando token con /auth/profile...');
        const res = await axios.get('/auth/profile');
        console.log('✅ /auth/profile exitoso, user:', res.data?.data?.email);
        if (res.data?.success && res.data.data?.email) {
          const user = {
            id: res.data.data._id,
            email: res.data.data.email,
            firstName: res.data.data.firstName,
            lastName: res.data.data.lastName,
            role: res.data.data.role,
            isEmailVerified: res.data.data.isEmailVerified
          };
          localStorage.setItem('user', JSON.stringify(user));
          touchAuthActivity();
          console.log('✅ Boot success, user restaurado:', user.email);
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        } else {
          console.error('❌ /auth/profile retornó datos inválidos');
          clearPersistedAuth();
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        // Si hay error de red, no forzar logout para evitar cerrar sesión por fallos temporales.
        if (!error.response) {
          console.warn('⚠️ /auth/profile sin respuesta del servidor, manteniendo sesión local temporalmente');
          if (savedUser) {
            try {
              const user = JSON.parse(savedUser);
              dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
            } catch {
              clearPersistedAuth();
              dispatch({ type: 'LOGOUT' });
            }
          }
          return;
        }

        // Token inválido/autorización fallida -> limpiar
        console.error('❌ /auth/profile falló:', error.response?.status, error.message);
        clearPersistedAuth();
        dispatch({ type: 'LOGOUT' });
      }
    };
    boot();
  }, []);

  // Persistencia por actividad: mantener sesión entre recargas y cerrar por inactividad real
  useEffect(() => {
    if (!state.isAuthenticated || !state.token) return;

    const events = ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'];
    let lastWriteAt = 0;

    const onActivity = () => {
      const now = Date.now();
      // Throttle para evitar demasiadas escrituras en localStorage
      if (now - lastWriteAt < 10_000) return;
      lastWriteAt = now;
      touchAuthActivity();
    };

    const intervalId = setInterval(() => {
      if (hasIdleSessionExpired()) {
        console.log('⏱️ Logout automático por inactividad');
        clearPersistedAuth();
        delete axios.defaults.headers.common['Authorization'];
        dispatch({ type: 'LOGOUT' });
      }
    }, 60_000);

    events.forEach((eventName) => window.addEventListener(eventName, onActivity, { passive: true }));
    document.addEventListener('visibilitychange', onActivity);
    touchAuthActivity();

    return () => {
      clearInterval(intervalId);
      events.forEach((eventName) => window.removeEventListener(eventName, onActivity));
      document.removeEventListener('visibilitychange', onActivity);
    };
  }, [state.isAuthenticated, state.token]);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await axios.post('/auth/login', { email, password });
      const data = response.data.data;

      if (data.step === 'ADMIN_PIN_REQUIRED') {
        dispatch({ type: 'ADMIN_PIN_PENDING', payload: { tempToken: data.tempToken, user: data.user } });
        return { success: true, adminPinRequired: true };
      }

      const { token, user } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      touchAuthActivity();
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      return { success: true, requiresVerification: false };
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      if (status === 403 && data?.data?.step === 'VERIFY_EMAIL') {
        return { success: false, requiresVerification: true, email };
      }
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: data?.message || error.message || 'Error de conexión'
      });
      return { success: false, error: data?.message || error.message || 'Error de conexión' };
    }
  };

  const register = async (payload) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      await axios.post('/auth/send-code', payload);
      dispatch({ type: 'CLEAR_ERROR' });
      dispatch({ type: 'STOP_LOADING' });
      return { success: true, email: payload.email };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error de conexión';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      return { success: false, error: message };
    }
  };

  const verifyCode = async (email, code) => {
    dispatch({ type: 'VERIFY_START' });
    try {
      const response = await axios.post('/auth/verify-code', { email, code });
      const data = response.data.data;
      console.log('🔐 verifyCode response:', data);
      if (data.step === 'ADMIN_PIN_REQUIRED') {
        dispatch({ type: 'ADMIN_PIN_PENDING', payload: { tempToken: data.tempToken, user: data.user } });
        return { success: true, adminPinRequired: true };
      } else {
        const { token, user } = data;
        console.log('✅ Non-admin user verified:', user);
        console.log('💾 Guardando token y user en localStorage');
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        touchAuthActivity();
        console.log('✅ Token guardado:', token.substring(0, 20) + '...');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('✅ Authorization header establecido');
        dispatch({ type: 'VERIFY_SUCCESS', payload: { user, token } });
        console.log('✅ VERIFY_SUCCESS despachado');
        return { success: true };
      }
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Error de conexión';
      console.error('❌ Error en verifyCode:', message);
      dispatch({ type: 'VERIFY_FAILURE', payload: message });
      return { success: false, error: message };
    }
  };

  const verifyAdminPin = async (pin) => {
    if (!state.tempToken) return { success: false, error: 'No hay sesión temporal' };
    dispatch({ type: 'VERIFY_START' });
    try {
      const response = await axios.post('/auth/admin/verify-pin', { tempToken: state.tempToken, pin });
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      touchAuthActivity();
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      dispatch({ type: 'ADMIN_PIN_SUCCESS', payload: { token, user } });
      return { success: true };
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Error verificando PIN';
      dispatch({ type: 'VERIFY_FAILURE', payload: message });
      return { success: false, error: message };
    }
  };


  const resendCode = async (email) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      await axios.post('/auth/resend-code', { email });
      dispatch({ type: 'CLEAR_ERROR' });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error de conexión';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      return { success: false, error: message };
    }
  };

  const logout = () => {
    clearPersistedAuth();
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  };

  const requestPasswordReset = async (email) => {
    try {
      await axios.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error solicitando código' };
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    try {
      await axios.post('/auth/reset-password', { email, code, newPassword });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error restableciendo contraseña' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.post('/auth/change-password', { currentPassword, newPassword });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error cambiando contraseña' };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      verifyCode,
      verifyAdminPin,
      resendCode,
      requestPasswordReset,
      resetPassword,
      changePassword,
      logout,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
