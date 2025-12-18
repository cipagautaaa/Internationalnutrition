import axios from 'axios';

// Normalize API URL: allow VITE_API_BASE_URL or VITE_API_URL to be either with or without the trailing `/api`.
// If not provided, default to http://localhost:5000 and append /api.
const rawApi = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = rawApi.endsWith('/api') ? rawApi : rawApi.replace(/\/$/, '') + '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // No sobrescribir Content-Type si ya está configurado (importante para multipart/form-data)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo redirigir a login si realmente es un error de autenticación
    // y no estamos en una ruta de login/registro
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/verify-email')) {
        // Dar tiempo para que se muestre el mensaje de error antes de redirigir
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 1500);
      }
    }
    return Promise.reject(error);
  }
);

// Función para subir imágenes
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    // Intentar obtener token de localStorage (usuarios normales)
    let token = localStorage.getItem('token');
    
    // Si no hay token en localStorage, intentar obtener del header (admins)
    if (!token) {
      const authHeader = axios.defaults.headers.common['Authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remover 'Bearer ' del inicio
      }
    }
    
    if (!token) {
      throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
    }
    
    const response = await api.post('/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error al subir imagen:', error);
    if (error.response?.status === 401) {
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    const errorMsg = error.response?.data?.message || error.message || '';
    if (errorMsg.toLowerCase().includes('r2') || errorMsg.toLowerCase().includes('cloudflare')) {
      throw new Error('El servicio de imágenes no está disponible. Intenta de nuevo en unos minutos o usa una URL externa (ej: imgbb.com, imgur.com).');
    }
    throw error;
  }
};

// Función para subir imágenes de implementos
export const uploadImplementImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    // Intentar obtener token de localStorage (usuarios normales)
    let token = localStorage.getItem('token');
    
    // Si no hay token en localStorage, intentar obtener del header (admins)
    if (!token) {
      const authHeader = axios.defaults.headers.common['Authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remover 'Bearer ' del inicio
      }
    }
    
    if (!token) {
      throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
    }
    
    const response = await api.post('/implements/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error al subir imagen:', error);
    if (error.response?.status === 401) {
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    const errorMsg = error.response?.data?.message || error.message || '';
    if (errorMsg.toLowerCase().includes('r2') || errorMsg.toLowerCase().includes('cloudflare')) {
      throw new Error('El servicio de imágenes no está disponible. Intenta de nuevo en unos minutos o usa una URL externa (ej: imgbb.com, imgur.com).');
    }
    throw error;
  }
};

export default api;
