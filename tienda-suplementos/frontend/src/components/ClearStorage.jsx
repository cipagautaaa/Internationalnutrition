import { useEffect } from 'react';

/**
 * Componente de utilidad para limpiar el localStorage
 * Presiona Ctrl+Shift+L para limpiar todas las sesiones
 */
const ClearStorage = () => {
  useEffect(() => {
    // Limpiar sesiones de admin al cargar (por seguridad)
    const cleanAdminSession = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          if (userData && userData.role === 'admin') {
            console.log('🧹 Limpiando sesión de admin del localStorage por seguridad...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch {
          // Ignorar errores de parsing
        }
      }
    };

    cleanAdminSession();

    const handleKeyPress = (e) => {
      // Ctrl+Shift+L para limpiar localStorage
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        console.log('🧹 Limpiando localStorage...');
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return null; // Este componente no renderiza nada
};

export default ClearStorage;
