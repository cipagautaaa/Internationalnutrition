import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from '../utils/axios';

/**
 * Componente de pago para Wompi Gateway (no Checkout)
 * Este componente es para cuentas de Wompi configuradas en modo Gateway
 */
const WompiGatewayPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardData, setCardData] = useState({
    number: '',
    cvc: '',
    exp_month: '',
    exp_year: '',
    card_holder: ''
  });

  // Obtener datos del pago desde location.state
  const paymentData = location.state || {};
  const { orderId, total, customerEmail } = paymentData;

  useEffect(() => {
    if (!orderId || !total) {
      setError('Datos de pago incompletos. Redirigiendo al checkout...');
      setTimeout(() => navigate('/checkout'), 2000);
    }
  }, [orderId, total, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Tokenizar la tarjeta con Wompi
      const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY;
      
      const tokenResponse = await fetch('https://production.wompi.co/v1/tokens/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicKey}`
        },
        body: JSON.stringify({
          number: cardData.number.replace(/\s/g, ''),
          cvc: cardData.cvc,
          exp_month: cardData.exp_month,
          exp_year: cardData.exp_year,
          card_holder: cardData.card_holder
        })
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.status === 'error' || !tokenData.data?.id) {
        throw new Error(tokenData.error?.messages?.join(', ') || 'Error al tokenizar la tarjeta');
      }

      const cardToken = tokenData.data.id;

      // 2. Crear la transacción en el backend
      const paymentResponse = await axios.post('/payments/wompi-gateway-transaction', {
        orderId,
        cardToken,
        installments: 1,
        customerEmail: customerEmail || cardData.card_holder
      });

      if (paymentResponse.data.success) {
        // Limpiar carrito y redirigir a éxito
        clearCart();
        navigate('/payment-success', {
          state: {
            orderId,
            transactionId: paymentResponse.data.transactionId
          }
        });
      } else {
        throw new Error(paymentResponse.data.message || 'Error procesando el pago');
      }

    } catch (err) {
      console.error('Error en el pago:', err);
      setError(err.response?.data?.message || err.message || 'Error procesando el pago');
    } finally {
      setLoading(false);
    }
  };

  if (!orderId || !total) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pago Seguro</h2>
          
          {/* Resumen del pago */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total a pagar:</span>
              <span className="text-2xl font-bold text-gray-900">
                ${total?.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Orden: {orderId}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Número de tarjeta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de tarjeta
              </label>
              <input
                type="text"
                name="number"
                value={formatCardNumber(cardData.number)}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, '');
                  if (value.length <= 16 && /^\d*$/.test(value)) {
                    handleInputChange({ target: { name: 'number', value } });
                  }
                }}
                placeholder="1234 5678 9012 3456"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                maxLength="19"
              />
            </div>

            {/* Nombre en la tarjeta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre en la tarjeta
              </label>
              <input
                type="text"
                name="card_holder"
                value={cardData.card_holder}
                onChange={handleInputChange}
                placeholder="JUAN PEREZ"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent uppercase"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Mes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mes
                </label>
                <input
                  type="text"
                  name="exp_month"
                  value={cardData.exp_month}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 2 && /^\d*$/.test(value)) {
                      const month = parseInt(value) || 0;
                      if (month <= 12) {
                        handleInputChange(e);
                      }
                    }
                  }}
                  placeholder="MM"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  maxLength="2"
                />
              </div>

              {/* Año */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <input
                  type="text"
                  name="exp_year"
                  value={cardData.exp_year}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 2 && /^\d*$/.test(value)) {
                      handleInputChange(e);
                    }
                  }}
                  placeholder="AA"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  maxLength="2"
                />
              </div>

              {/* CVC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVC
                </label>
                <input
                  type="text"
                  name="cvc"
                  value={cardData.cvc}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 4 && /^\d*$/.test(value)) {
                      handleInputChange(e);
                    }
                  }}
                  placeholder="123"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  maxLength="4"
                />
              </div>
            </div>

            {/* Botón de pago */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-700 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                `Pagar $${total?.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors mt-2"
            >
              Volver al Checkout
            </button>
          </form>

          {/* Información de seguridad */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Pago seguro procesado por Wompi</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WompiGatewayPayment;
