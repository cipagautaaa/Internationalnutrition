import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getWhatsappUrl } from '../utils/whatsapp';
import logoImg from '../assets/images/Captura_de_pantalla_2025-08-09_192459-removebg-preview.png';
import { 
  FREE_SHIPPING_THRESHOLD, 
  MINIMUM_ORDER_AMOUNT,
  hasFreeShipping, 
  getShippingCost,
  COLOMBIA_DEPARTMENTS 
} from '../utils/shippingCalculator';

const WompiCheckout = () => {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDocumentLabel = (type) => {
    const labels = {
      CC: 'Cédula',
      CE: 'Cédula de extranjería',
      NIT: 'NIT',
      TI: 'Tarjeta de identidad',
      PP: 'Pasaporte',
      DNI: 'DNI',
      OTRO: 'Documento'
    };
    return labels[(type || '').toUpperCase()] || 'Documento';
  };

  // Estados para el formulario
  const [customerData, setCustomerData] = useState({
    fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    phoneNumber: user?.phone || '',
    legalId: '',
    legalIdType: 'CC'
  });

  const [shippingAddress, setShippingAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    region: '',
    country: 'CO',
    postalCode: '',
    phoneNumber: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('wompi');
  const [loading, setLoading] = useState(false);
  // Descuento
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState({
    applied: false,
    code: '',
    productDiscount: 0,
    comboDiscount: 0,
    totalDiscount: 0,
    productSubtotal: 0,
    comboSubtotal: 0,
    productPercent: 0,
    comboPercent: 0,
  });
  const [discountLoading, setDiscountLoading] = useState(false);
  const [message, setMessage] = useState('');
  // const [loadingProfile, setLoadingProfile] = useState(true); // eliminado por no usarse en UI
  const [errors, setErrors] = useState({});

  // Cargar datos del perfil al montar el componente (solo si hay usuario autenticado)
  useEffect(() => {
    // Solo intentar cargar perfil si hay un usuario autenticado
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    // No intentar cargar si no hay usuario
    if (!user) return;
    
    try {
      const response = await api.get('/users/profile');
      
      if (response.data.success) {
        const profile = response.data.user;
        
        // Actualizar datos del cliente
        setCustomerData(prev => ({
          ...prev,
          fullName: profile.firstName && profile.lastName 
            ? `${profile.firstName} ${profile.lastName}` 
            : prev.fullName,
          email: profile.email || prev.email,
          phoneNumber: profile.phone || prev.phoneNumber,
          legalId: profile.legalId || prev.legalId,
          legalIdType: profile.legalIdType || prev.legalIdType
        }));

        // Actualizar dirección de envío desde shippingInfo si existe
        if (profile.shippingInfo && profile.shippingInfo.fullName) {
          setShippingAddress({
            addressLine1: profile.shippingInfo.street || '',
            addressLine2: profile.shippingInfo.addressLine2 || '',
            city: profile.shippingInfo.city || '',
            region: profile.shippingInfo.region || '',
            country: profile.shippingInfo.country || 'CO',
            postalCode: profile.shippingInfo.zipCode || '',
            phoneNumber: profile.shippingInfo.phoneNumber || profile.phone || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // No mostrar error, solo usar datos por defecto
    } finally {
      // no-op
    }
  };

  // Validación de formulario simplificada
  const validateForm = () => {
    const newErrors = {};
    
    if (!customerData.fullName) newErrors.fullName = 'Nombre completo es requerido';
    if (!customerData.email) newErrors.email = 'Email es requerido';
    if (!customerData.phoneNumber) newErrors.phoneNumber = 'Teléfono es requerido';
    if (!customerData.legalId) newErrors.legalId = 'Documento es requerido';
    
    if (!shippingAddress.addressLine1) newErrors.addressLine1 = 'Dirección es requerida';
    if (!shippingAddress.city) newErrors.city = 'Ciudad es requerida';
    if (!shippingAddress.region) newErrors.region = 'Departamento es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTransferencia = () => {
    // Preparar mensaje para WhatsApp
    const productosTexto = items.map(item => 
      `• ${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toLocaleString('es-CO')}${item.isCombo ? ' [Combo]' : ''}`
    ).join('\n');
    
    // Usar porcentajes dinámicos del código de descuento aplicado
    const prodDisc = discount.applied ? Math.round(productSubtotal * (discount.productPercent / 100)) : 0;
    const combDisc = discount.applied ? Math.round(comboSubtotal * (discount.comboPercent / 100)) : 0;
    const discountAmountTransf = prodDisc + combDisc;
    const shippingForTransf = isFreeShipping ? 0 : shippingCost;
    const totalFinalTransf = Math.max(0, subtotal - discountAmountTransf) + shippingForTransf;
    
    const envioTexto = isFreeShipping 
      ? '🎁 Envío: GRATIS' 
      : `🚚 Envío (${shippingAddress.region || 'Colombia'}): $${shippingForTransf.toLocaleString('es-CO')}`;

    // Construir texto de descuento con porcentajes dinámicos
    let descuentoTexto = '';
    if (discount.applied) {
      const partes = [];
      if (discount.productPercent > 0 && prodDisc > 0) partes.push(`Productos -${discount.productPercent}%: -$${prodDisc.toLocaleString('es-CO')}`);
      if (discount.comboPercent > 0 && combDisc > 0) partes.push(`Combos -${discount.comboPercent}%: -$${combDisc.toLocaleString('es-CO')}`);
      if (partes.length > 0) {
        descuentoTexto = `\n(Código ${discount.code}: ${partes.join(' / ')})`;
      }
    }
    
    const mensaje = `¡Hola! 👋

Quiero realizar una compra por transferencia bancaria:

*📋 DATOS DEL PEDIDO:*
${productosTexto}
${envioTexto}

*💰 Total: $${totalFinalTransf.toLocaleString('es-CO')} COP*${descuentoTexto}

*📦 DATOS DE ENVÍO:*
• Nombre: ${customerData.fullName}
• Teléfono: ${customerData.phoneNumber}
• Email: ${customerData.email}
• ${getDocumentLabel(customerData.legalIdType)}: ${customerData.legalId}
• Dirección: ${shippingAddress.addressLine1}${shippingAddress.addressLine2 ? ', ' + shippingAddress.addressLine2 : ''}
• Ciudad: ${shippingAddress.city}, ${shippingAddress.region}

Por favor envíame los datos bancarios para realizar la transferencia. ¡Gracias! 🙏`;

    // Crear URL de WhatsApp usando el helper
    const whatsappURL = getWhatsappUrl(mensaje);
    
    // Abrir WhatsApp
    window.open(whatsappURL, '_blank');
    
    // Limpiar carrito después de enviar mensaje
    setTimeout(() => {
      clearCart();
      navigate('/products');
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Si es transferencia, redirigir a WhatsApp
    if (paymentMethod === 'transferencia') {
      handleTransferencia();
      return;
    }
    
    setLoading(true);
    
    try {
      const productDiscountCalc = discount.applied ? productDiscount : 0;
      const comboDiscountCalc = discount.applied ? comboDiscount : 0;
      const discountAmountCalc = productDiscountCalc + comboDiscountCalc;
      // Calcular envío para este envío
      const shippingForOrder = isFreeShipping ? 0 : shippingCost;
      const totalFinal = subtotalAfterDiscount + shippingForOrder;
      
      // Preparar datos para la transacción Wompi
      const transactionData = {
        items: items.map(item => ({
          productId: item._id || item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name
        })),
        customerData,
        shippingAddress,
        subtotal,
        productSubtotal,
        comboSubtotal,
        shippingCost: shippingForOrder,
        isFreeShipping,
        total: totalFinal,
        discount: discount.applied
          ? {
              code: discount.code,
              productDiscount: productDiscountCalc,
              comboDiscount: comboDiscountCalc,
              totalDiscount: discountAmountCalc,
              productSubtotal,
              comboSubtotal,
            }
          : null,
        reference: `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentMethod: 'wompi' // Siempre wompi para pagos online
      };

      console.log('🚀 Enviando datos a Wompi:', transactionData);

      // Llamar al backend para crear la transacción
      const response = await api.post('/payments/create-wompi-transaction', transactionData);

      if (response.data.success) {
        const { wompiData, orderId } = response.data;
        
        console.log('✅ Transacción creada exitosamente:', wompiData);
        console.log('✅ Orden ID:', orderId);
        
        if (wompiData && wompiData.reference) {
          console.log('🚀 Iniciando widget de Wompi...');
          
          // Redirigir al componente WompiPayment con los datos
          navigate('/wompi-payment', { 
            state: { 
              wompiData: wompiData,
              orderId: orderId 
            }
          });
          
        } else {
          console.warn('⚠️ wompiData incompleto:', wompiData);
          alert(`¡Orden creada exitosamente!\nID: ${orderId}\nProcede al pago manualmente.`);
        }
        
      } else {
        throw new Error(response.data.message || 'Error creando transacción');
      }
      
    } catch (error) {
      console.error('❌ Error procesando pago:', error);
      alert(`Error: ${error.response?.data?.message || error.message || 'Error procesando el pago'}`);
    } finally {
      setLoading(false);
    }
  };

  const regions = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 
    'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 
    'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 
    'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 
    'Valle del Cauca', 'Vaupés', 'Vichada'
  ];

  // Helpers de totales
  const itemsWithFlags = Array.isArray(items) ? items : [];
  const productItems = itemsWithFlags.filter((item) => !item.isCombo);
  const comboItems = itemsWithFlags.filter((item) => item.isCombo);

  const productSubtotal = productItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const comboSubtotal = comboItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = productSubtotal + comboSubtotal;
  const hasProductItems = productSubtotal > 0;
  const hasComboItems = comboSubtotal > 0;

  // Cálculo de descuentos - usando porcentajes dinámicos del código aplicado
  const productDiscount = discount.applied ? Math.round(productSubtotal * (discount.productPercent / 100)) : 0;
  const comboDiscount = discount.applied ? Math.round(comboSubtotal * (discount.comboPercent / 100)) : 0;
  const discountAmount = productDiscount + comboDiscount;
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);

  // Cálculo de envío basado en subtotal CON descuento aplicado
  const wouldHaveFreeShippingWithoutDiscount = hasFreeShipping(subtotal);
  const isFreeShipping = hasFreeShipping(subtotalAfterDiscount);
  const lostFreeShippingDueToDiscount = discount.applied && wouldHaveFreeShippingWithoutDiscount && !isFreeShipping;
  const shippingCost = isFreeShipping ? 0 : getShippingCost(shippingAddress.region);
  const amountNeededForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotalAfterDiscount;

  const totalConDescuento = subtotalAfterDiscount + shippingCost;

  // Helper para renderizar el bloque de código de descuento sin remounts que quiten el foco
  const renderDiscountCodeSection = () => {
    const applyDiscount = async () => {
      if (discount.applied) {
        setMessage('Ya tienes un código aplicado. Quita el actual para usar otro.');
        return;
      }

      const code = discountCode.trim().toUpperCase();
      if (!code) {
        setMessage('Ingresa un código.');
        return;
      }

      setDiscountLoading(true);
      setMessage('');

      try {
        // Validar código contra la API
        const response = await api.post('/discount-codes/validate', { code });
        
        if (response.data.success) {
          const { productDiscount: prodPercent, comboDiscount: combPercent } = response.data.discountCode;
          
          const prodDisc = Math.round(productSubtotal * (prodPercent / 100));
          const combDisc = Math.round(comboSubtotal * (combPercent / 100));

          setDiscount({
            applied: true,
            code: response.data.discountCode.code,
            productDiscount: prodDisc,
            comboDiscount: combDisc,
            totalDiscount: prodDisc + combDisc,
            productSubtotal,
            comboSubtotal,
            productPercent: prodPercent,
            comboPercent: combPercent,
          });
          setMessage('¡Descuento aplicado exitosamente!');
        }
      } catch (err) {
        console.error('Error validando código:', err);
        setMessage(err.response?.data?.message || 'Código inválido o expirado.');
      } finally {
        setDiscountLoading(false);
      }
    };

    const removeDiscount = () => {
      setDiscount({
        applied: false,
        code: '',
        productDiscount: 0,
        comboDiscount: 0,
        totalDiscount: 0,
        productSubtotal: 0,
        comboSubtotal: 0,
        productPercent: 0,
        comboPercent: 0,
      });
      setDiscountCode('');
      setMessage('');
    };

    return (
      <div className="mb-6 pb-6 border-b border-gray-300">
        <div className="flex gap-2">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="Código de descuento"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={discount.applied || discountLoading}
          />
          {discount.applied ? (
            <button type="button" onClick={removeDiscount} className="px-4 py-3 border rounded-md text-gray-700 hover:bg-gray-50">
              Quitar
            </button>
          ) : (
            <button 
              type="button" 
              onClick={applyDiscount} 
              disabled={discountLoading || discount.applied}
              className="px-4 py-3 bg-gray-900 text-white rounded-md hover:bg-black disabled:opacity-60"
            >
              {discountLoading ? 'Validando...' : 'Aplicar'}
            </button>
          )}
        </div>
        {message && <p className={`text-sm mt-2 ${discount.applied ? 'text-green-600' : 'text-gray-600'}`}>{message}</p>}
        {discount.applied && (
          <p className="text-sm mt-2 text-green-700">
            Código "{discount.code}" aplicado. 
            {discount.productPercent > 0 && ` Productos -${discount.productPercent}%`}
            {discount.productPercent > 0 && discount.comboPercent > 0 && ','}
            {discount.comboPercent > 0 && ` Combos -${discount.comboPercent}%`}
            .
          </p>
        )}
      </div>
    );
  };

  const renderTotalsSection = () => (
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-gray-700">
        <span>Subtotal productos</span>
        <span>${productSubtotal.toLocaleString('es-CO')}</span>
      </div>
      <div className="flex justify-between text-sm text-gray-700">
        <span>Subtotal combos</span>
        <span>${comboSubtotal.toLocaleString('es-CO')}</span>
      </div>
      {discount.applied && hasProductItems && discount.productPercent > 0 && (
        <div className="flex justify-between text-sm text-green-700">
          <span>Descuento productos ({discount.productPercent}%)</span>
          <span>- ${productDiscount.toLocaleString('es-CO')}</span>
        </div>
      )}
      {discount.applied && hasComboItems && discount.comboPercent > 0 && (
        <div className="flex justify-between text-sm text-green-700">
          <span>Descuento combos ({discount.comboPercent}%)</span>
          <span>- ${comboDiscount.toLocaleString('es-CO')}</span>
        </div>
      )}
      {/* Costo de envío */}
      <div className="flex justify-between text-sm text-gray-700">
        <span>Envío {shippingAddress.region ? `(${shippingAddress.region})` : ''}</span>
        {isFreeShipping ? (
          <span className="text-green-600 font-medium">¡GRATIS!</span>
        ) : (
          <span>${shippingCost.toLocaleString('es-CO')}</span>
        )}
      </div>
      {/* Alerta cuando el descuento hizo perder el envío gratis */}
      {lostFreeShippingDueToDiscount && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg space-y-2">
          <p className="font-semibold">⚠️ El descuento redujo tu pedido por debajo de ${FREE_SHIPPING_THRESHOLD.toLocaleString('es-CO')}</p>
          <p>El mínimo para envío gratis es de <strong>${FREE_SHIPPING_THRESHOLD.toLocaleString('es-CO')}</strong>. Al aplicar el descuento, tu subtotal bajó a <strong>${subtotalAfterDiscount.toLocaleString('es-CO')}</strong>.</p>
          <p>Tienes dos opciones:</p>
          <ul className="list-disc list-inside ml-2">
            <li>Agregar <strong>${amountNeededForFreeShipping.toLocaleString('es-CO')}</strong> más en productos para mantener el envío gratis + el descuento.</li>
            <li>Quitar el descuento y conservar el envío gratis.</li>
          </ul>
        </div>
      )}
      {!isFreeShipping && !lostFreeShippingDueToDiscount && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          💡 Agrega ${amountNeededForFreeShipping.toLocaleString('es-CO')} más para obtener envío gratis
        </div>
      )}
      <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-200">
        <span>Total</span>
        <span>${totalConDescuento.toLocaleString('es-CO')} COP</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con logo centrado */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center">
          <img src={logoImg} alt="INT Suplementos" className="h-10 object-contain" />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Si el carrito está vacío, mostrar mensaje dentro del layout */}
        {(!items || items.length === 0) ? (
          <div className="max-w-4xl mx-auto p-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Carrito Vacío</h1>
              <p className="text-gray-600 mb-6">No tienes productos en tu carrito.</p>
              <a href="/products" className="bg-blue-600 text-white px-6 py-3 rounded-lg">
                Ver Productos
              </a>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-80px)]">
          {/* Columna izquierda - Formulario */}
          <div className="bg-white lg:border-r border-gray-200">
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-8">
              
              {/* Datos del Cliente */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Contacto</h2>
                  <a href="/login" className="text-sm text-blue-600 hover:text-blue-700 underline">Iniciar sesión</a>
                </div>
                
                <div className="space-y-3">
                  <input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                    placeholder="Correo electrónico"
                    className={`w-full px-4 py-3 border rounded-md ${errors.email ? 'border-red-7000' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>
              </div>

              {/* Dirección de Envío */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Entrega</h2>
                
                <div className="space-y-3">
                  {/* País */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">País / Región</label>
                    <select
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-base"
                    >
                      <option value="CO">Colombia</option>
                    </select>
                  </div>

                  {/* Nombre y apellidos */}
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={customerData.fullName.split(' ')[0] || ''}
                      onChange={(e) => {
                        const lastName = customerData.fullName.split(' ').slice(1).join(' ');
                        setCustomerData({ ...customerData, fullName: `${e.target.value} ${lastName}`.trim() });
                      }}
                      placeholder="Nombre"
                      className="px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <input
                      type="text"
                      value={customerData.fullName.split(' ').slice(1).join(' ')}
                      onChange={(e) => {
                        const firstName = customerData.fullName.split(' ')[0];
                        setCustomerData({ ...customerData, fullName: `${firstName} ${e.target.value}`.trim() });
                      }}
                      placeholder="Apellidos"
                      className="px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Documento */}
                  <div className="grid grid-cols-3 gap-3">
                    <select
                      value={customerData.legalIdType}
                      onChange={(e) => setCustomerData({...customerData, legalIdType: e.target.value})}
                      className="px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="CC">CC</option>
                      <option value="CE">CE</option>
                      <option value="NIT">NIT</option>
                      <option value="PP">Pasaporte</option>
                    </select>
                    <input
                      type="text"
                      value={customerData.legalId}
                      onChange={(e) => setCustomerData({...customerData, legalId: e.target.value})}
                      placeholder="Número de Documento"
                      className="col-span-2 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Teléfono */}
                  <input
                    type="tel"
                    value={customerData.phoneNumber}
                    onChange={(e) => setCustomerData({...customerData, phoneNumber: e.target.value})}
                    placeholder="Teléfono"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />

                  {/* Dirección */}
                  <input
                    type="text"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => setShippingAddress({...shippingAddress, addressLine1: e.target.value})}
                    placeholder="Dirección"
                    className={`w-full px-4 py-3 border rounded-md ${errors.addressLine1 ? 'border-red-7000' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />

                  {/* Complemento */}
                  <input
                    type="text"
                    value={shippingAddress.addressLine2}
                    onChange={(e) => setShippingAddress({...shippingAddress, addressLine2: e.target.value})}
                    placeholder="Casa, apartamento, etc. (opcional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  {/* Ciudad, Departamento, CP */}
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                      placeholder="Ciudad"
                      className={`px-4 py-3 border rounded-md ${errors.city ? 'border-red-7000' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                    <select
                      value={shippingAddress.region}
                      onChange={(e) => setShippingAddress({...shippingAddress, region: e.target.value})}
                      className={`px-4 py-3 border rounded-md ${errors.region ? 'border-red-7000' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white`}
                      required
                    >
                      <option value="">Departamento</option>
                      {regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                      placeholder="Código postal (opcional)"
                      className="px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Método de Pago (simple) */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Método de Pago</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wompi"
                      checked={paymentMethod === 'wompi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-4 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Pagar con Wompi</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            💳 <span className="text-xs">Tarjetas</span>
                          </span>
                          <span className="flex items-center gap-1">
                            🏦 <span className="text-xs">PSE</span>
                          </span>
                          <span className="flex items-center gap-1">
                            📱 <span className="text-xs">Nequi</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 mt-1">🔐 Pago seguro procesado por Wompi</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transferencia"
                      checked={paymentMethod === 'transferencia'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-4 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Transferencia Bancaria</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Te enviaremos los datos bancarios por WhatsApp
                      </div>
                      <div className="text-xs text-green-600 mt-1">💬 Contacto directo vía WhatsApp</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Botón de Envío */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-md text-base font-semibold transition-colors disabled:opacity-50 ${
                  paymentMethod === 'transferencia'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading 
                  ? 'Procesando...' 
                  : paymentMethod === 'transferencia'
                    ? `Enviar por WhatsApp - $${totalConDescuento.toLocaleString('es-CO')}`
                    : `Proceder al pago - $${totalConDescuento.toLocaleString('es-CO')}`
                }
              </button>
            </form>
          </div>

          {/* Resumen de la orden - columna derecha estilo IMN */}
          <div className="bg-gray-50">
            <div className="max-w-xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                {/* Productos */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-300">
                  {items.map((item) => (
                    <div key={item._key || item.id} className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <img src={item.image || '/placeholder.png'} alt={item.name} className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 bg-white" />
                        <div className="absolute -top-2 -right-2 bg-gray-700 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">{item.quantity}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">{item.name}</p>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">${(item.price * item.quantity).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</div>
                    </div>
                  ))}
                </div>

                {/* Código de descuento */}
                {renderDiscountCodeSection()}

                {/* Totales */}
                {renderTotalsSection()}

                {/* Mensaje seguridad */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600">
                  <span>🔒 Pago seguro procesado por Wompi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default WompiCheckout;