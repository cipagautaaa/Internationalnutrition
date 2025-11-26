import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const TestCartPage = () => {
  const { items, addToCart, removeFromCart, clearCart, getTotalPrice } = useCart();

  // Productos de prueba
  const testProducts = [
    {
      id: 1,
      name: "Proteína Whey",
      price: 15000,
      image: "https://via.placeholder.com/200x200?text=Proteina",
      inStock: true
    },
    {
      id: 2,
      name: "Creatina Monohidrato",
      price: 8000,
      image: "https://via.placeholder.com/200x200?text=Creatina",
      inStock: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Prueba del Carrito</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Productos para agregar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Productos de Prueba</h2>
            <div className="space-y-4">
              {testProducts.map(product => (
                <div key={product.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-primary-600 font-semibold">${product.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Contenido del carrito */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Carrito ({items.length} items)</h2>
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-red-700 hover:text-red-700 text-sm"
                >
                  Vaciar carrito
                </button>
              )}
            </div>
            
            {items.length === 0 ? (
              <p className="text-gray-500">El carrito está vacío</p>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">${(item.price * item.quantity).toLocaleString()}</span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-700 hover:text-red-700 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold text-primary-600">
                      ${getTotalPrice().toLocaleString()}
                    </span>
                  </div>
                  
                  <Link
                    to="/checkout"
                    className="w-full bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-900 transition-colors block text-center"
                  >
                    Ir a Checkout
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Debug info */}
        <div className="mt-8 bg-gray-800 text-white p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Estado del carrito (Debug):</h3>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(items, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TestCartPage;