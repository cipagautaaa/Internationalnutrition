import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { formatPrice } from '../utils/formatPrice';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const paymentId = searchParams.get('payment_id');
        const merchantOrderId = searchParams.get('merchant_order_id');
        const externalReference = searchParams.get('external_reference');

        if (paymentId) {
          // Verificar el pago con el backend
          const response = await api.get(`/payments/verify/${paymentId}`);
          if (response.data.success) {
            setOrder(response.data.order);
          }
        } else if (externalReference) {
          // Para otros métodos de pago, buscar la orden por referencia
          const response = await api.get(`/orders/${externalReference}`);
          if (response.data.success) {
            setOrder(response.data.order);
          }
        }
      } catch (error) {
        console.error('Error verificando pago:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {/* Icono de éxito */}
          <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Título principal */}
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            ¡Pago Exitoso!
          </h1>

          <p className="text-gray-600 text-lg mb-6">
            Tu compra se ha procesado correctamente
          </p>

          {/* Información de la orden */}
          {order && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-lg mb-4">Detalles de tu Orden</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Número de Orden:</span>
                  <span className="font-medium">#{order._id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pagado:</span>
                  <span className="font-medium">${formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Método de Pago:</span>
                  <span className="font-medium capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {order.paymentStatus === 'approved' ? 'Pagado' : 'Procesando'}
                  </span>
                </div>
              </div>

              {/* Productos */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Productos:</h4>
                <div className="space-y-2">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.product?.name || 'Producto'} × {item.quantity}</span>
                      <span>${formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dirección de envío */}
              {order.shippingAddress && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-2">Dirección de Envío:</h4>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.street}<br/>
                    {order.shippingAddress.city}, {order.shippingAddress.state}<br/>
                    CP: {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>📧 Te enviamos un email de confirmación</strong><br/>
              Revisa tu bandeja de entrada para más detalles sobre tu pedido.
            </p>
          </div>

          {/* Información de entrega */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>🚚 Información de Envío</strong><br/>
              Tu pedido será procesado en 1-2 días hábiles. Te contactaremos para coordinar la entrega.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/orders"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Ver Mis Pedidos
            </Link>
            
            <Link
              to="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Continuar Comprando
            </Link>
            
            <Link
              to="/profile"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Mi Perfil
            </Link>
          </div>

          {/* Soporte */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-gray-500 text-sm">
              ¿Necesitas ayuda? 
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

export default PaymentSuccess;