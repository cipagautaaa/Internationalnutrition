import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Alert from '../components/Alert';
import { formatPrice } from '../utils/formatPrice';

const Orders = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchOrders(currentPage);
  }, [isAuthenticated, currentPage]);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/my-orders?page=${page}&limit=10`);
      
      if (response.data.success) {
        setOrders(response.data.orders);
        setPagination(response.data.pagination);
      } else {
        setAlert({
          show: true,
          message: 'Error cargando las órdenes',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Error conectando con el servidor';
      
      if (error.response) {
        // El servidor respondió con un código de error
        if (error.response.status === 401) {
          errorMessage = 'Sesión expirada. Por favor inicia sesión nuevamente.';
        } else if (error.response.status === 403) {
          errorMessage = 'No tienes permisos para acceder a esta información.';
        } else if (error.response.status === 404) {
          errorMessage = 'El servicio de pedidos no está disponible.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      }
      
      setAlert({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-700 text-red-700'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'failed': 'bg-red-700 text-red-700',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const translateStatus = (status) => {
    const translations = {
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado',
      'paid': 'Pagado',
      'failed': 'Fallido'
    };
    return translations[status] || status;
  };

  const viewOrderDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus pedidos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Alert 
          show={alert.show} 
          message={alert.message} 
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'info' })}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mis Pedidos</h1>
          <p className="text-gray-600">Revisa el estado de tus compras</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">No tienes pedidos aún</h2>
            <p className="text-gray-600 mb-6">¡Explora nuestros productos y haz tu primera compra!</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Ver Productos
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  {/* Header del pedido */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Pedido #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Realizado el {formatDate(order.createdAt)}
                      </p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {translateStatus(order.status)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {translateStatus(order.paymentStatus)}
                      </span>
                    </div>
                  </div>

                  {/* Información del pedido */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="font-semibold text-lg text-green-600">
                        ${formatPrice(order.totalAmount)} COP
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Método de pago</p>
                      <p className="font-medium capitalize">
                        {order.paymentMethod === 'wompi' ? 'Tarjeta (Wompi)' : order.paymentMethod}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Productos</p>
                      <p className="font-medium">{order.items.length} artículo(s)</p>
                    </div>
                  </div>

                  {/* Productos */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.product.image ? (
                              <img 
                                src={item.product.image} 
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-400 text-xs">Sin imagen</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              Cant: {item.quantity} × ${item.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          +{order.items.length - 3} producto(s) más
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      {order.shippingAddress && (
                        <span>Envío a: {order.shippingAddress.city}, {order.shippingAddress.region}</span>
                      )}
                    </div>
                    <button
                      onClick={() => viewOrderDetails(order.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Paginación */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                    }`}
                  >
                    Anterior
                  </button>
                  
                  {[...Array(pagination.pages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      currentPage === pagination.pages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                    }`}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;