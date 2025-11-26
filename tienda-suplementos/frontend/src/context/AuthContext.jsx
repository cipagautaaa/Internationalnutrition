import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext();

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
        isAuthenticated: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
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
      
      // Si hay un usuario guardado y es admin, NO restaurar sesión (por seguridad)
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          if (userData && userData.role === 'admin') {
            // Limpiar cualquier token de admin que pueda estar guardado
            console.log('🔐 Admin user detectado, limpiando sesión por seguridad');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return;
          }
        } catch {
          // JSON inválido, limpiar
          console.error('❌ JSON inválido en localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }
      }
      
      if (!token) {
        console.log('⚠️ No hay token, saltando boot');
        return; // no token => no intento
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
          // Verificar nuevamente que no sea admin (por seguridad extra)
          if (user.role === 'admin') {
            console.log('🔐 Admin detectado en boot, limpiando');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({ type: 'LOGOUT' });
            return;
          }
          localStorage.setItem('user', JSON.stringify(user));
          console.log('✅ Boot success, user restaurado:', user.email);
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });
        } else {
          console.error('❌ /auth/profile retornó datos inválidos');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        // Token inválido -> limpiar
        console.error('❌ /auth/profile falló:', error.response?.status, error.message);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
      }
    };
    boot();
  }, []);

  const login = async (email) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      console.log('🔐 login() iniciando con email:', email);
      const response = await axios.post('/auth/login', { email });
      console.log('✅ login response:', response.data);
      debugger; // PAUSA AQUÍ para que veas los logs
      if (response.data.success) {
        const data = response.data.data;
        console.log('📊 data:', data);
        if (data.step === 'ADMIN_PIN_REQUIRED') {
          console.log('🔑 Admin PIN required');
          dispatch({ type: 'ADMIN_PIN_PENDING', payload: { tempToken: data.tempToken, user: data.user } });
          return { success: true, adminPinRequired: true };
        } else {
          const { token, user } = data;
          console.log('👤 Non-admin user:', user);
          console.log('👤 user.email:', user?.email);
          console.log('👤 user.role:', user?.role);
          console.log('👤 user.id:', user?.id);
          // Solo guardar token en localStorage si NO es admin
          // Los admins deben autenticarse cada vez (por seguridad)
          if (user && user.role !== 'admin') {
            console.log('💾 Guardando token y user en localStorage');
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            console.log('✅ Token en localStorage:', localStorage.getItem('token')?.substring(0, 20) + '...');
            console.log('✅ User en localStorage:', localStorage.getItem('user'));
          }
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('✅ Despachando LOGIN_SUCCESS con user:', user);
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });
          console.log('✅ LOGIN_SUCCESS despachado. Estado debería actualizar en breve.');
          return { success: true, requiresVerification: false };
        }
      }
    } catch (error) {
      console.error('❌ Error en login:', error.response?.status, error.message);
      if (error.response?.status === 401) {
        // Usuario no verificado, intentar enviar código
        try {
          console.log('📧 Usuario no verificado, enviando código...');
          await axios.post('/auth/send-code', { email });
          dispatch({ type: 'LOGIN_FAILURE', payload: null }); // Reinicia loading
          return { success: true, requiresVerification: true };
        } catch (sendError) {
          dispatch({
            type: 'LOGIN_FAILURE',
            payload: sendError.response?.data?.message || 'Error al enviar código'
          });
          return { success: false, error: sendError.response?.data?.message || 'Error al enviar código' };
        }
      }
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.message || error.message || 'Error de conexión'
      });
      return { success: false, error: error.response?.data?.message || error.message || 'Error de conexión' };
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
        // Solo guardar token si NO es admin
        if (user && user.role !== 'admin') {
          console.log('💾 Guardando token y user en localStorage');
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          console.log('✅ Token guardado:', token.substring(0, 20) + '...');
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('✅ Authorization header establecido');
        dispatch({ type: 'VERIFY_SUCCESS', payload: { user } });
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
      // NO guardar token de admin en localStorage (por seguridad)
      // El admin debe autenticarse en cada sesión
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      verifyCode,
      verifyAdminPin,
      resendCode,
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
