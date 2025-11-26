import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Checkout from '../components/Checkout';

const CheckoutPage = () => {
  const { user, loading, isAuthenticated } = useAuth();

  console.log('📦 CheckoutPage render - loading:', loading, 'user:', user?.email, 'isAuthenticated:', isAuthenticated);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.warn('⚠️ No user in checkout, redirecting to login');
    return <Navigate to="/login" replace state={{ from: '/checkout' }} />;
  }

  console.log('✅ User authenticated in checkout:', user.email);
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Checkout />
    </div>
  );
};

export default CheckoutPage;