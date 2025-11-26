import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

/**
 * Layout para administradores
 * - No muestra la tienda normal (Header, TextCarrousel, Footer, etc.)
 * - Solo muestra el contenido de administración
 * - Redirige al panel de admin si intenta acceder a rutas de tienda
 */
const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  

  // Ya no bloqueamos navegación a rutas públicas.

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple para admin */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
            <p className="text-sm text-gray-600">Bienvenido, {user?.name || 'Admin'}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Contenido de administración */}
      <main className="min-h-[calc(100vh-73px)]">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
