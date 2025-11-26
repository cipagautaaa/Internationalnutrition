import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatPrice } from '../utils/formatPrice';

const PaymentPending = () => {
  const [searchParams] = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPaymentInfo = async () => {
      try {
        const paymentId = searchParams.get('payment_id');
        const externalReference = searchParams.get('external_reference');
        
        if (paymentId) {
          const response = await api.get(`/payments/status/${paymentId}`);
          setPaymentInfo(response.data);
        } else if (externalReference) {
          // Para pagos pendientes por transferencia o efectivo
          const response = await api.get(`/orders/${externalReference}`);
          setPaymentInfo(response.data);
        }
      } catch (error) {
        console.error('Error obteniendo información del pago:', error);
      } finally {
        setLoading(false);
      }
    };

    getPaymentInfo();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verificando el estado del pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {/* Icono de pendiente */}
          <div className="w-16 h-16 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Título principal */}
          <h1 className="text-3xl font-bold text-yellow-600 mb-4">
            Pago Pendiente
          </h1>

          <p className="text-gray-600 text-lg mb-6">
            Tu pago está siendo procesado
          </p>

          {/* Información del pago */}
          {paymentInfo && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-lg mb-4 text-yellow-800">Estado del Pago</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID de Transacción:</span>
                  <span className="font-medium">{paymentInfo.id || 'Generando...'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Método de Pago:</span>
                  <span className="font-medium capitalize">
                    {getPaymentMethodName(paymentInfo.payment_method_id || paymentInfo.paymentMethod)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-medium">
                    ${formatPrice(paymentInfo.transaction_amount || paymentInfo.totalAmount)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    Pendiente
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Información específica según método de pago */}
          <div className="space-y-4 mb-6">
            {/* Para pagos con tarjeta */}
            {paymentInfo?.payment_method_id && paymentInfo.payment_method_id.startsWith('credit_card') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Pago con Tarjeta de Crédito</h4>
                <p className="text-blue-700 text-sm">
                  Tu pago está siendo procesado por el banco. Esto puede tomar algunos minutos.
                  Te notificaremos cuando se complete.
                </p>
              </div>
            )}

            {/* Para efectivo (Rapipago, Pago Fácil, etc.) */}
            {paymentInfo?.payment_method_id && (paymentInfo.payment_method_id === 'rapipago' || paymentInfo.payment_method_id === 'pagofacil') && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Pago en Efectivo</h4>
                <p className="text-green-700 text-sm mb-3">
                  Puedes pagar en efectivo en cualquier sucursal de {paymentInfo.payment_method_id === 'rapipago' ? 'Rapipago' : 'Pago Fácil'}.
                </p>
                <div className="bg-white rounded p-3 border">
                  <p className="text-sm font-medium">Código de Pago:</p>
                  <p className="text-lg font-mono font-bold text-green-800">
                    {paymentInfo.coupon_code || 'Se enviará por email'}
                  </p>
                </div>
              </div>
            )}

            {/* Para transferencia bancaria */}
            {paymentInfo?.paymentMethod === 'transferencia' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Transferencia Bancaria</h4>
                <p className="text-purple-700 text-sm mb-3">
                  Te enviamos los datos bancarios a tu email. Realiza la transferencia con los siguientes datos:
                </p>
                <div className="bg-white rounded p-3 border space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Banco:</span>
                    <span className="font-medium">Banco Ejemplo</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CBU:</span>
                    <span className="font-medium">1234567890123456789012</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alias:</span>
                    <span className="font-medium">TIENDA.SUPLEMENTOS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Titular:</span>
                    <span className="font-medium">Tienda Suplementos SRL</span>
                  </div>
                </div>
              </div>
            )}

            {/* Para pago en efectivo al recibir */}
            {paymentInfo?.paymentMethod === 'efectivo' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">Pago en Efectivo</h4>
                <p className="text-orange-700 text-sm">
                  Pagarás en efectivo cuando recibas tu pedido. Te contactaremos para coordinar la entrega.
                </p>
              </div>
            )}
          </div>

          {/* Próximos pasos */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-lg mb-4">Próximos Pasos:</h3>
            <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
              <li>Te enviaremos un email de confirmación</li>
              <li>Procesaremos tu pedido una vez confirmado el pago</li>
              <li>Te contactaremos para coordinar el envío</li>
              <li>Recibirás un código de seguimiento</li>
            </ol>
          </div>

          {/* Tiempo estimado */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>⏱️ Tiempo de Procesamiento:</strong><br/>
              • Tarjetas: 5-10 minutos<br/>
              • Efectivo: Hasta 48hs después del pago<br/>
              • Transferencia: Hasta 24hs después de acreditar
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/profile"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Ver Mis Pedidos
            </Link>
            
            <Link
              to="/products"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Seguir Comprando
            </Link>
          </div>

          {/* Soporte */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-gray-500 text-sm">
              ¿Necesitas ayuda con tu pago? 
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

// Función para mostrar nombres amigables de métodos de pago
const getPaymentMethodName = (paymentMethodId) => {
  const methods = {
    'credit_card': 'Tarjeta de Crédito',
    'debit_card': 'Tarjeta de Débito',
    'rapipago': 'Rapipago',
    'pagofacil': 'Pago Fácil',
    'transferencia': 'Transferencia Bancaria',
    'efectivo': 'Efectivo contra entrega'
  };
  
  return methods[paymentMethodId] || paymentMethodId || 'No especificado';
};

export default PaymentPending;