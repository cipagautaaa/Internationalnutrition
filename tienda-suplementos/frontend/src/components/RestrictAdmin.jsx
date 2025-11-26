import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente que previene el acceso de administradores a rutas de compra
 * Si el usuario es admin, lo redirige al panel de administración
 */
const RestrictAdmin = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // Si es admin, redirigir al panel de productos
  if (isAdmin) {
    return <Navigate to="/admin/products" replace />;
  }

  // Si no es admin, renderizar el contenido normalmente
  return children;
};

export default RestrictAdmin;
