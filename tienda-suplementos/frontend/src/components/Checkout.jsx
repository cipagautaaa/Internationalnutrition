import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tag } from 'lucide-react';
import api from '../services/api';
import Alert from './Alert';

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  // Estados del formulario
  const [shippingData, setShippingData] = useState({
    fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    legalId: user?.legalId || '',
    legalIdType: user?.legalIdType || 'CC',
    street: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Colombia'
  });

  const [paymentMethod, setPaymentMethod] = useState('wompi');

  // Validar formulario
  const validateForm = () => {
    const required = ['street', 'city', 'state', 'zipCode'];
    for (const field of required) {
      if (!shippingData[field].trim()) {
        setAlert({
          show: true,
          message: `El campo ${field} es requerido`,
          type: 'error'
        });
        return false;
      }
    }
    return true;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Procesar pago
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (items.length === 0) {
      setAlert({
        show: true,
        message: 'El carrito está vacío',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    setAlert({ show: false, message: '', type: 'info' });

    try {
      // Preparar datos de la orden
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: shippingData,
        paymentMethod,
        totalAmount: getTotalPrice()
      };

      if (paymentMethod === 'wompi') {
        // Crear transacción con Wompi
        const response = await api.post('/payments/create-wompi-transaction', {
          ...orderData,
          customerData: {
            email: user.email,
            fullName: `${user.firstName} ${user.lastName}`,
            phoneNumber: user.phoneNumber || '',
            legalId: user.legalId || '',
            legalIdType: user.legalIdType || 'CC'
          }
        });
        
        if (response.data.success) {
          // Guardar datos de la orden para usar después
          localStorage.setItem('pendingOrderId', response.data.orderId);
          
          // Redirigir a página de pago con Wompi Gateway (nuevo componente)
          navigate('/wompi-gateway-payment', { 
            state: { 
              orderId: response.data.orderId,
              total: total,
              customerEmail: user?.email || ''
            }
          });
        } else {
          throw new Error(response.data.message || 'Error al procesar el pago');
        }
      } else {
        // Para otros métodos de pago (transferencia, efectivo)
        const response = await api.post('/orders/create', orderData);
        
        if (response.data.success) {
          clearCart();
          navigate(`/order-confirmation/${response.data.orderId}`);
        } else {
          throw new Error(response.data.message || 'Error al crear la orden');
        }
      }

    } catch (error) {
      console.error('Error en checkout:', error);
      setAlert({
        show: true,
        message: error.response?.data?.message || error.message || 'Error al procesar la orden',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">Agrega algunos productos antes de finalizar tu compra.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Ver Productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Header con Trust Signals */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Lock className="w-8 h-8 text-green-600" />
              Checkout Seguro
            </h1>
            <p className="text-gray-600 mt-2">Tus datos están 100% protegidos con encriptación SSL</p>
          </div>
          
          {/* Indicadores de confianza */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-semibold">Compra Protegida</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200">
              <TruckIcon className="w-5 h-5" />
              <span className="text-sm font-semibold">Envío Gratis</span>
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-red-700 text-white flex items-center justify-center font-bold">1</div>
            <span className="ml-2 text-sm font-medium">Información</span>
          </div>
          <div className="w-16 h-1 bg-gray-300 mx-2"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">2</div>
            <span className="ml-2 text-sm font-medium text-gray-500">Pago</span>
          </div>
          <div className="w-16 h-1 bg-gray-300 mx-2"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">3</div>
            <span className="ml-2 text-sm font-medium text-gray-500">Confirmación</span>
          </div>
        </div>
      </div>
      
      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'info' })}
        />
      )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8 items-start">
        {/* Formulario de datos */}
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-700 rounded-full flex items-center justify-center">
                <TruckIcon className="w-6 h-6 text-red-700" />
              </div>
              <h2 className="text-xl font-bold">Información de Envío</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  name="street"
                  value={shippingData.street}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Av. Corrientes 1234"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingData.city}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Bogotá"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provincia *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingData.state}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Cundinamarca"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingData.zipCode}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 1001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={shippingData.country}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                    readOnly
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Método de pago */}
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold">Método de Pago Seguro</h2>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="wompi"
                  checked={paymentMethod === 'wompi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3 text-blue-600"
                />
                <div className="flex items-center">
                  <img 
                    src="https://uploads-ssl.webflow.com/6408f1840a6edf5ad1ca06f8/640963a0dd4c3e50c3f57da3_wompi-logo.svg" 
                    alt="Wompi"
                    className="h-8 mr-3"
                  />
                  <div>
                    <div className="font-medium">Wompi</div>
                    <div className="text-sm text-gray-600">Tarjetas y PSE</div>
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
                  className="mr-3 text-blue-600"
                />
                <div>
                  <div className="font-medium">Transferencia Bancaria</div>
                  <div className="text-sm text-gray-600">Te enviaremos los datos por email</div>
                </div>
              </label>

              <label className="flex items-center cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="efectivo"
                  checked={paymentMethod === 'efectivo'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3 text-blue-600"
                />
                <div>
                  <div className="font-medium">Pago en Efectivo</div>
                  <div className="text-sm text-gray-600">Al momento de la entrega</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Resumen de la orden - Sticky */}
        <div className="lg:col-span-1 order-1 lg:order-2 w-full">
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100 lg:sticky lg:top-28">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-red-700" />
              Resumen de tu Orden
            </h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-3 pb-3 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-1">Cantidad: {item.quantity}</div>
                  </div>
                  <div className="font-bold text-red-700">
                    ${(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 mb-6 py-4 border-y-2 border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">${getTotalPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío:</span>
                <span className="font-semibold text-green-600">GRATIS</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-3xl font-black text-red-700">${getTotalPrice().toLocaleString()}</span>
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-red-700 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="w-5 h-5" />
                  Proceder al Pago Seguro
                </span>
              )}
            </button>

            {/* Trust signals finales */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Pago 100% seguro y encriptado</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Garantía de devolución 30 días</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <TruckIcon className="w-4 h-4 text-green-600" />
                <span>Envío gratis en 24-48h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;