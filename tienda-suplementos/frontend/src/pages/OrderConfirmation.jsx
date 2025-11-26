import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        if (response.data.success) {
          setOrder(response.data.order);
        } else {
          setError('Orden no encontrada');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Error al cargar la orden');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando información de tu orden...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Orden no encontrada</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/products" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">¡Orden Confirmada!</h1>
            <p className="text-gray-600">Tu pedido ha sido recibido y está siendo procesado</p>
          </div>

          {/* Información de la orden */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Detalles básicos */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Detalles de la Orden</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Número de Orden:</span>
                  <p className="font-medium">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Fecha:</span>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total:</span>
                  <p className="font-medium text-xl text-green-600">${order.totalAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Estado del Pago:</span>
                  <span className={`px-3 py-1 rounded-full text-sm ml-2 ${
                    order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.paymentStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-700 text-red-700'
                  }`}>
                    {order.paymentStatus === 'pending' ? 'Pendiente' : 
                     order.paymentStatus === 'approved' ? 'Pagado' : 'Rechazado'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Estado del Pedido:</span>
                  <span className={`px-3 py-1 rounded-full text-sm ml-2 ${
                    order.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    'bg-red-700 text-red-700'
                  }`}>
                    {order.status === 'pending' ? 'Pendiente' :
                     order.status === 'processing' ? 'Procesando' :
                     order.status === 'shipped' ? 'Enviado' :
                     order.status === 'delivered' ? 'Entregado' : 'Cancelado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Método de pago */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Método de Pago</h3>
              
              {order.paymentMethod === 'transferencia' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-700 mb-3">
                    Realiza la transferencia con los siguientes datos:
                  </p>
                  <div className="bg-white rounded p-4 border space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Banco:</span>
                      <span className="font-medium">Banco Ejemplo</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CBU:</span>
                      <span className="font-medium font-mono">1234567890123456789012</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Alias:</span>
                      <span className="font-medium">TIENDA.SUPLEMENTOS</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Titular:</span>
                      <span className="font-medium">Tienda Suplementos SRL</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Importe:</span>
                      <span>${order.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    * Incluye como referencia el número de orden: #{order._id.slice(-8).toUpperCase()}
                  </p>
                </div>
              )}

              {order.paymentMethod === 'efectivo' && (
                <div>
                  <p className="text-sm text-gray-700">
                    Pagarás en efectivo cuando recibas tu pedido.
                  </p>
                  <div className="bg-white rounded p-4 border mt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Monto a pagar:</span>
                      <span className="text-green-600">${order.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    * Ten el monto exacto listo para la entrega
                  </p>
                </div>
              )}

              {(order.paymentMethod === 'wompi' || order.paymentMethod === 'wompi_card') && (
                <div>
                  <p className="text-sm text-gray-700">
                    Pago procesado a través de Wompi
                  </p>
                  {order.wompiTransactionId && (
                    <div className="bg-white rounded p-4 border mt-3">
                      <div className="flex justify-between text-sm">
                        <span>ID de Transacción:</span>
                        <span className="font-mono">{order.wompiTransactionId}</span>
                      </div>
                      {order.wompiReference && (
                        <div className="flex justify-between text-sm mt-2">
                          <span>Referencia:</span>
                          <span className="font-mono">{order.wompiReference}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Productos */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4">Productos Pedidos</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product?.name || 'Producto'}</h4>
                      <p className="text-sm text-gray-600">
                        Precio unitario: ${item.price?.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center px-4">
                      <span className="text-sm text-gray-600">Cantidad</span>
                      <p className="font-medium">{item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">Subtotal</span>
                      <p className="font-medium">${(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">${order.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dirección de envío */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4">Dirección de Envío</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              {order.shippingAddress ? (
                <div className="text-gray-700">
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  <p>CP: {order.shippingAddress.zipCode}, {order.shippingAddress.country}</p>
                </div>
              ) : (
                <p className="text-gray-500">No especificada</p>
              )}
            </div>
          </div>

          {/* Información importante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-800 mb-3">📧 Información Importante</h3>
            <ul className="space-y-2 text-blue-700 text-sm">
              <li>• Te enviamos un email de confirmación con todos los detalles</li>
              <li>• Te contactaremos para coordinar el envío una vez confirmado el pago</li>
              <li>• Puedes seguir el estado de tu pedido en tu perfil</li>
              <li>• El tiempo de procesamiento es de 1-2 días hábiles</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/profile"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
            >
              Ver Mis Pedidos
            </Link>
            
            <Link
              to="/products"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
            >
              Continuar Comprando
            </Link>
          </div>

          {/* Soporte */}
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-gray-500 text-sm">
              ¿Necesitas ayuda con tu pedido? 
              <a 
                href="https://wa.me/1234567890" 
                className="text-blue-600 hover:text-blue-800 ml-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contáctanos por WhatsApp
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;