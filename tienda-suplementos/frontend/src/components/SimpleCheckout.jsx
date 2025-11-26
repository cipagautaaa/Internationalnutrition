import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SimpleCheckout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // Dejar por defecto el formulario embebido (Bricks)
  const [paymentMethod, setPaymentMethod] = useState('card_api');

  // Número de WhatsApp (puedes cambiarlo por el tuyo)
  const WHATSAPP_NUMBER = '573006851794'; // Reemplaza con tu número real

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto p-6 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-6">Agrega algunos productos antes de finalizar tu compra.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Ver Productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);

    if (paymentMethod === 'transferencia') {
      // Crear mensaje para WhatsApp con los detalles de la orden
      const orderDetails = items.map(item => 
        `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`
      ).join('\n');
      
      const message = encodeURIComponent(
        `¡Hola! Quiero realizar una compra por transferencia bancaria 💰\n\n` +
        `👤 Cliente: ${user.firstName} ${user.lastName}\n` +
        `📧 Email: ${user.email}\n\n` +
        `🛒 PRODUCTOS:\n${orderDetails}\n\n` +
        `💵 TOTAL: $${getTotalPrice().toLocaleString()}\n\n` +
        `Por favor, envíame los datos bancarios para realizar la transferencia. ¡Gracias!`
      );
      
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
      window.open(whatsappUrl, '_blank');
      
      // Limpiar carrito después de enviar mensaje
      setTimeout(() => {
        clearCart();
        setLoading(false);
        alert('Te hemos redirigido a WhatsApp. ¡Esperamos tu mensaje!');
        navigate('/');
      }, 1000);

  } else if (paymentMethod === 'efectivo') {
      // Crear mensaje para WhatsApp para pago en efectivo
      const orderDetails = items.map(item => 
        `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`
      ).join('\n');
      
      const message = encodeURIComponent(
        `¡Hola! Quiero realizar una compra con pago en efectivo 💵\n\n` +
        `👤 Cliente: ${user.firstName} ${user.lastName}\n` +
        `📧 Email: ${user.email}\n\n` +
        `🛒 PRODUCTOS:\n${orderDetails}\n\n` +
        `💵 TOTAL: $${getTotalPrice().toLocaleString()}\n\n` +
        `Pagaré en efectivo al recibir el pedido. Por favor, coordina la entrega conmigo. ¡Gracias!`
      );
      
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
      window.open(whatsappUrl, '_blank');
      
      // Limpiar carrito después de enviar mensaje
      setTimeout(() => {
        clearCart();
        setLoading(false);
        alert('Te hemos redirigido a WhatsApp para coordinar la entrega. ¡Esperamos tu mensaje!');
        navigate('/');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información del usuario y método de pago */}
          <div className="space-y-6">
            {/* Información del usuario */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Información del Usuario</h2>
              {user ? (
                <div className="space-y-3">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Nombre:</strong> {user.firstName} {user.lastName}</p>
                </div>
              ) : (
                <p className="text-red-700">Debes iniciar sesión para continuar</p>
              )}
            </div>

            {/* Método de pago */}
            {user && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Método de Pago</h2>
                
                <div className="space-y-3">
                  {/* Dejar sólo Tarjeta en el sitio (API) visible */}
                  <label className="flex items-center cursor-pointer p-3 border border-gray-200 rounded-lg bg-blue-50 hover:bg-blue-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card_api"
                      checked={paymentMethod === 'card_api'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 text-primary-600"
                    />
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                          <line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Tarjeta en el sitio (API)</div>
                        <div className="text-sm text-gray-600">Formulario embebido con Wompi</div>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transferencia"
                      checked={paymentMethod === 'transferencia'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 text-primary-600"
                    />
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Transferencia Bancaria</div>
                        <div className="text-sm text-gray-600">Contactar por WhatsApp</div>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="efectivo"
                      checked={paymentMethod === 'efectivo'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 text-primary-600"
                    />
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Pago en Efectivo</div>
                        <div className="text-sm text-gray-600">Al momento de la entrega</div>
                      </div>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'transferencia' && (
                  <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                    <p className="text-sm text-primary-700">
                      <strong>📱 WhatsApp:</strong> Te redirigiremos a WhatsApp donde te enviaremos los datos bancarios para realizar la transferencia.
                    </p>
                  </div>
                )}

                {paymentMethod === 'card_api' && (
                  <div className="mt-4 p-3 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">💳 Pago con Tarjeta</h3>
                      <p className="text-blue-700 mb-4">
                        Para una mejor experiencia de pago, ahora usamos Wompi - procesador de pagos especializado en Colombia.
                      </p>
                      <button
                        onClick={() => navigate('/wompi-checkout')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Continuar con Wompi 🚀
                      </button>
                      <p className="text-xs text-blue-600 mt-2">
                        Acepta tarjetas de crédito y débito, PSE y más métodos de pago
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'efectivo' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      <strong>🚚 Entrega:</strong> Coordinaremos contigo la entrega y pagarás en efectivo al recibir tu pedido.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resumen de la orden */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Resumen de tu Orden</h2>
            
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">Cantidad: {item.quantity}</div>
                  </div>
                  <div className="font-medium">
                    ${(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
              
              <hr className="border-gray-200" />
              
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total:</span>
                <span className="text-primary-600">${getTotalPrice().toLocaleString()}</span>
              </div>

              {user && (
                <>
                  {/* Botón de redirección a Wompi oculto */}

                  {/* Mensaje del formulario embebido removido */}
                  {paymentMethod === 'card_api' && (
                    <p className="text-center text-sm text-gray-600">Completa los datos y presiona "Pagar ahora" en el formulario</p>
                  )}

                  {paymentMethod === 'transferencia' && (
                    <button
                      onClick={handleCheckout}
                      disabled={loading}
                      className="w-full bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Contactando por WhatsApp...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.087"/>
                          </svg>
                          Contactar por WhatsApp - $${getTotalPrice().toLocaleString()}
                        </div>
                      )}
                    </button>
                  )}

                  {paymentMethod === 'efectivo' && (
                    <button
                      onClick={handleCheckout}
                      disabled={loading}
                      className="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Coordinando entrega...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.087"/>
                          </svg>
                          Coordinar Entrega - $${getTotalPrice().toLocaleString()}
                        </div>
                      )}
                    </button>
                  )}
                </>
              )}
              
              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Iniciar Sesión para Continuar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCheckout;