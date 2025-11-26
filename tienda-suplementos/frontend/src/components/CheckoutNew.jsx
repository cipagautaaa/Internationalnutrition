import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tag, ShoppingCart } from 'lucide-react';
import api from '../services/api';
import Alert from './Alert';
import logoImg from '../assets/images/Captura_de_pantalla_2025-08-09_192459-removebg-preview.png';
import { formatPrice } from '../utils/formatPrice';

const CheckoutNew = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  // Estados del formulario
  const [contactData, setContactData] = useState({
    email: user?.email || '',
  });

  const [shippingData, setShippingData] = useState({
    fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    phone: user?.phoneNumber || '',
    legalIdType: user?.legalIdType || 'CC',
    legalId: user?.legalId || '',
    street: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Colombia'
  });

  // Calcular totales
  const subtotal = getTotalPrice();
  const discount = discountApplied ? (subtotal * discountApplied.percentage) / 100 : 0;
  const total = subtotal - discount;

  // Manejar aplicación de código de descuento
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setApplyingDiscount(true);
    try {
      // TODO: Aquí irá la llamada al backend para validar el código
      // Por ahora simulamos respuesta
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulación: códigos de ejemplo
      const validCodes = {
        'BIENVENIDA10': { percentage: 10, name: 'Bienvenida 10%' },
        'VERANO20': { percentage: 20, name: 'Verano 20%' },
      };

      if (validCodes[discountCode.toUpperCase()]) {
        setDiscountApplied(validCodes[discountCode.toUpperCase()]);
        setAlert({
          show: true,
          message: '¡Código de descuento aplicado correctamente!',
          type: 'success'
        });
      } else {
        setAlert({
          show: true,
          message: 'Código de descuento no válido',
          type: 'error'
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        message: 'Error al aplicar el descuento',
        type: 'error'
      });
    } finally {
      setApplyingDiscount(false);
    }
  };

  // Validar formulario
  const validateForm = () => {
    if (!contactData.email.trim()) {
      setAlert({ show: true, message: 'El email es requerido', type: 'error' });
      return false;
    }
    if (!shippingData.fullName.trim()) {
      setAlert({ show: true, message: 'El nombre completo es requerido', type: 'error' });
      return false;
    }
    if (!shippingData.phone.trim()) {
      setAlert({ show: true, message: 'El teléfono es requerido', type: 'error' });
      return false;
    }
    if (!shippingData.legalId.trim()) {
      setAlert({ show: true, message: 'El número de documento es requerido', type: 'error' });
      return false;
    }
    if (!shippingData.street.trim()) {
      setAlert({ show: true, message: 'La dirección es requerida', type: 'error' });
      return false;
    }
    if (!shippingData.city.trim()) {
      setAlert({ show: true, message: 'La ciudad es requerida', type: 'error' });
      return false;
    }
    if (!shippingData.state.trim()) {
      setAlert({ show: true, message: 'El departamento es requerido', type: 'error' });
      return false;
    }
    return true;
  };

  // Procesar pago
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (items.length === 0) {
      setAlert({ show: true, message: 'El carrito está vacío', type: 'error' });
      return;
    }

    setLoading(true);
    setAlert({ show: false, message: '', type: 'info' });

    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: shippingData,
        paymentMethod: 'wompi',
        totalAmount: total,
        discountCode: discountApplied ? discountCode : null
      };

      const response = await api.post('/payments/create-wompi-transaction', {
        ...orderData,
        customerData: {
          email: contactData.email,
          fullName: shippingData.fullName,
          phoneNumber: shippingData.phone,
          legalId: shippingData.legalId,
          legalIdType: shippingData.legalIdType
        }
      });
      
      if (response.data.success) {
        localStorage.setItem('pendingOrderId', response.data.orderId);
        navigate('/wompi-payment', { 
          state: { 
            wompiData: response.data.wompiData,
            orderId: response.data.orderId 
          }
        });
      } else {
        throw new Error(response.data.message || 'Error al procesar el pago');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">Agrega productos para continuar con tu compra</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-red-700 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Ver Productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con Logo */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center">
          <img 
            src={logoImg} 
            alt="INT Suplementos" 
            className="h-10"
          />
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-[1400px] mx-auto">
        {alert.show && (
          <div className="px-4 sm:px-6 lg:px-12 pt-6">
            <Alert
              message={alert.message}
              type={alert.type}
              onClose={() => setAlert({ show: false, message: '', type: 'info' })}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-80px)]">
          {/* Columna Izquierda - Formulario */}
          <div className="bg-white lg:border-r border-gray-200">
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-8">
              {/* Contacto */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Contacto</h2>
                  {!user && (
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="text-sm text-blue-600 hover:text-blue-700 underline"
                    >
                      Iniciar sesión
                    </button>
                  )}
                </div>
                <input
                  type="email"
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  placeholder="Correo electrónico"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  required
                />
              </div>

              {/* Entrega */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Entrega</h2>
                
                <div className="space-y-3">
                  {/* País */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">País / Región</label>
                    <select
                      value={shippingData.country}
                      onChange={(e) => setShippingData({ ...shippingData, country: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-base"
                    >
                      <option value="Colombia">Colombia</option>
                    </select>
                  </div>

                  {/* Nombre y Apellidos */}
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={shippingData.fullName.split(' ')[0] || ''}
                      onChange={(e) => {
                        const lastName = shippingData.fullName.split(' ').slice(1).join(' ');
                        setShippingData({ ...shippingData, fullName: `${e.target.value} ${lastName}`.trim() });
                      }}
                      placeholder="Nombre"
                      className="px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      required
                    />
                    <input
                      type="text"
                      value={shippingData.fullName.split(' ').slice(1).join(' ')}
                      onChange={(e) => {
                        const firstName = shippingData.fullName.split(' ')[0];
                        setShippingData({ ...shippingData, fullName: `${firstName} ${e.target.value}`.trim() });
                      }}
                      placeholder="Apellidos"
                      className="px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      required
                    />
                  </div>

                  {/* Documento */}
                  <div className="grid grid-cols-3 gap-3">
                    <select
                      value={shippingData.legalIdType}
                      onChange={(e) => setShippingData({ ...shippingData, legalIdType: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                    >
                      <option value="CC">CC</option>
                      <option value="CE">CE</option>
                      <option value="NIT">NIT</option>
                      <option value="passport">Pasaporte</option>
                    </select>
                    <input
                      type="text"
                      value={shippingData.legalId}
                      onChange={(e) => setShippingData({ ...shippingData, legalId: e.target.value })}
                      placeholder="Número de Documento"
                      className="col-span-2 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      required
                    />
                  </div>

                  {/* Teléfono */}
                  <input
                    type="tel"
                    value={shippingData.phone}
                    onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                    placeholder="Teléfono"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    required
                  />

                  {/* Dirección */}
                  <input
                    type="text"
                    value={shippingData.street}
                    onChange={(e) => setShippingData({ ...shippingData, street: e.target.value })}
                    placeholder="Dirección"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    required
                  />

                  {/* Complemento */}
                  <input
                    type="text"
                    value={shippingData.addressLine2}
                    onChange={(e) => setShippingData({ ...shippingData, addressLine2: e.target.value })}
                    placeholder="Casa, apartamento, etc. (opcional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />

                  {/* Ciudad, Estado, CP */}
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={shippingData.city}
                      onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      placeholder="Ciudad"
                      className="px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      required
                    />
                    <select
                      value={shippingData.state}
                      onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                      required
                    >
                      <option value="">Departamento</option>
                      <option value="Boyacá">Boyacá</option>
                      <option value="Cundinamarca">Cundinamarca</option>
                      <option value="Antioquia">Antioquia</option>
                      <option value="Valle del Cauca">Valle del Cauca</option>
                      <option value="Santander">Santander</option>
                      <option value="Atlántico">Atlántico</option>
                    </select>
                    <input
                      type="text"
                      value={shippingData.zipCode}
                      onChange={(e) => setShippingData({ ...shippingData, zipCode: e.target.value })}
                      placeholder="Código postal"
                      className="px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-md font-semibold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {loading ? 'Procesando...' : 'Continuar al pago'}
              </button>
            </form>
          </div>

          {/* Columna Derecha - Resumen */}
          <div className="bg-gray-50 lg:bg-gray-50">
            <div className="max-w-xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
              {/* Productos */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-300">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 bg-white"
                      />
                      <div className="absolute -top-2 -right-2 bg-gray-700 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">{item.name}</p>
                      {item.selectedFlavor && (
                        <p className="text-xs text-gray-600">{item.selectedFlavor}</p>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      ${formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Código de descuento */}
              <div className="mb-6 pb-6 border-b border-gray-300">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Código de descuento"
                    disabled={discountApplied}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    disabled={applyingDiscount || discountApplied || !discountCode.trim()}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                  >
                    {applyingDiscount ? '...' : discountApplied ? '✓' : 'Aplicar'}
                  </button>
                </div>
                {discountApplied && (
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-green-700 font-medium flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {discountApplied.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountApplied(null);
                        setDiscountCode('');
                      }}
                      className="text-blue-600 hover:text-blue-700 underline text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>

              {/* Totales */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Subtotal · {items.length} {items.length === 1 ? 'artículo' : 'artículos'}</span>
                  <span className="font-medium text-gray-900">
                    ${formatPrice(subtotal)}
                  </span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Descuento ({discountApplied.percentage}%)</span>
                    <span className="font-medium text-green-700">
                      -${formatPrice(discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-700 flex items-center gap-1">
                    Envío
                    <span className="text-xs text-gray-500">ⓘ</span>
                  </span>
                  <span className="font-medium text-gray-900">GRATIS</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-baseline pt-6 border-t-2 border-gray-300 mb-6">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <div className="text-right">
                  <div className="text-xs text-gray-600 mb-1">COP</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${formatPrice(total)}
                  </div>
                </div>
              </div>

              {/* Info de seguridad */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mb-4">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>🔒 Pago seguro procesado por Wompi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutNew;
