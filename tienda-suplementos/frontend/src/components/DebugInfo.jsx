import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const DebugInfo = () => {
  const { items, getTotalPrice } = useCart();
  const { user } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg max-w-sm z-50 text-xs">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <div>
        <strong>Usuario:</strong> {user ? user.email : 'No autenticado'}
      </div>
      <div>
        <strong>Items en carrito:</strong> {items.length}
      </div>
      <div>
        <strong>Total:</strong> ${getTotalPrice()}
      </div>
      <div className="mt-2">
        <strong>Items:</strong>
        <pre>{JSON.stringify(items, null, 2)}</pre>
      </div>
    </div>
  );
};

export default DebugInfo;