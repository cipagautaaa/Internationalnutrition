import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Alert from '../components/Alert';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchOrderDetails();
  }, [orderId, isAuthenticated]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        setAlert({
          show: true,
          message: 'Orden no encontrada',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setAlert({
        show: true,
        message: 'Error cargando los detalles de la orden',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando detalles del pedido...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Alert 
            show={true}
            message="Pedido no encontrado"
            type="error"
            onClose={() => navigate('/orders')}
          />
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/orders')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver a Mis Pedidos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Alert 
          show={alert.show} 
          message={alert.message} 
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'info' })}
        />

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center"
          >
            ← Volver a Mis Pedidos
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Pedido #{order.orderNumber}
              </h1>
              <p className="text-gray-600">
                Realizado el {formatDate(order.createdAt)}
              </p>
            </div>
            
            <div className="flex flex-col gap-2 mt-4 md:mt-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {translateStatus(order.status)}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                {translateStatus(order.paymentStatus)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Productos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Productos</h2>
              
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">Sin imagen</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.product.name}</h3>
                      {item.product.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {item.product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">
                          Cantidad: {item.quantity}
                        </span>
                        <span className="font-semibold">
                          ${item.price.toLocaleString()} COP
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        ${item.total.toLocaleString()} COP
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total del Pedido:</span>
                  <span className="text-green-600">
                    ${order.totalAmount.toLocaleString()} COP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información lateral */}
          <div className="space-y-6">
            {/* Información de pago */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Información de Pago</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Método de pago:</span>
                  <p className="font-medium capitalize">
                    {order.paymentMethod === 'wompi' ? 'Tarjeta (Wompi)' : order.paymentMethod}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Estado del pago:</span>
                  <p className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {translateStatus(order.paymentStatus)}
                  </p>
                </div>

                {order.wompiReference && (
                  <div>
                    <span className="text-sm text-gray-600">Referencia Wompi:</span>
                    <p className="font-mono text-sm">{order.wompiReference}</p>
                  </div>
                )}

                {order.wompiTransactionId && (
                  <div>
                    <span className="text-sm text-gray-600">ID de Transacción:</span>
                    <p className="font-mono text-sm">{order.wompiTransactionId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Dirección de envío */}
            {order.shippingAddress && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Dirección de Envío</h3>
                
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.street}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                  {order.shippingAddress.zipCode && (
                    <p>{order.shippingAddress.zipCode}</p>
                  )}
                  <p className="font-medium mt-2">
                    Tel: {order.shippingAddress.phoneNumber}
                  </p>
                </div>
              </div>
            )}

            {/* Fechas importantes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Fechas</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Pedido realizado:</span>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
                
                <div>
                  <span className="text-gray-600">Última actualización:</span>
                  <p className="font-medium">{formatDate(order.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;