import axios from 'axios';

// Configura la URL base de la API desde Vite env o fallback
// Normalizar: agregar /api si no está presente
const rawApi = import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_URL || 'http://localhost:5000';
const API_URL = rawApi.endsWith('/api') ? rawApi : rawApi.replace(/\/$/, '') + '/api';

axios.defaults.baseURL = API_URL;

// Configura los headers por defecto
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Interceptor para agregar el token de autenticación en cada petición
axios.interceptors.request.use(
  (config) => {
    // Primero verificar si ya hay Authorization header (para admin en memoria)
    const existingAuth = axios.defaults.headers.common['Authorization'];
    if (existingAuth) {
      config.headers.Authorization = existingAuth;
      return config;
    }
    
    // Si no, intentar obtener de localStorage (usuarios normales)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;
