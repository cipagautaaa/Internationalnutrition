import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Alert from './Alert';

const WompiPaymentSimple = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Obtener datos desde location.state o desde sessionStorage como fallback
  const getPaymentData = () => {
    const stateData = location.state;
    if (stateData && stateData.wompiData && stateData.orderId) {
      // Guardar en sessionStorage para persistencia
      sessionStorage.setItem('wompiPaymentData', JSON.stringify(stateData));
      return stateData;
    }
    
    // Intentar recuperar desde sessionStorage
    const savedData = sessionStorage.getItem('wompiPaymentData');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error('Error parsing saved payment data:', error);
      }
    }
    
    return null;
  };

  const paymentData = getPaymentData();
  const { wompiData, orderId } = paymentData || {};

  useEffect(() => {
    console.log('🔍 WompiPaymentSimple - Datos recibidos:', { wompiData, orderId });
    console.log('🔍 Location state:', location.state);
    console.log('🔍 SessionStorage data:', sessionStorage.getItem('wompiPaymentData'));
    
    if (!wompiData || !orderId) {
      console.error('❌ Datos faltantes para el pago');
      // Dar más tiempo para que los datos lleguen o se recuperen
      const timer = setTimeout(() => {
        const currentData = getPaymentData();
        if (!currentData || !currentData.wompiData || !currentData.orderId) {
          setAlert({
            show: true,
            message: 'No se encontraron datos de pago válidos. Redirigiendo al checkout...',
            type: 'error'
          });
          // Redirigir al checkout después de un delay
          setTimeout(() => {
            navigate('/checkout');
          }, 2000);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }

    // Si tenemos datos, cargar el script
    setLoading(true);
    loadWompiScript();
  }, [wompiData, orderId, location.state]);

  const loadWompiScript = () => {
    // Verificar si ya existe el script
    if (document.querySelector('script[src*="checkout.wompi.co"]')) {
      console.log('✅ Script de Wompi ya está cargado');
      setScriptLoaded(true);
      setLoading(false);
      initializeWidget();
      return;
    }

    console.log('📦 Cargando script de Wompi...');
    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ Script de Wompi cargado exitosamente');
      setScriptLoaded(true);
      setLoading(false);
      
      // Esperar un poco más para que el widget esté disponible
      setTimeout(() => {
        initializeWidget();
      }, 800);
    };
    
    script.onerror = (error) => {
      console.error('❌ Error cargando script de Wompi:', error);
      setLoading(false);
      setAlert({
        show: true,
        message: 'Error cargando el sistema de pagos. Verifique su conexión a internet.',
        type: 'error'
      });
    };

    document.head.appendChild(script);
  };

  const initializeWidget = () => {
    console.log('🎯 Inicializando widget de Wompi...');
    console.log('📋 Datos del widget:', wompiData);

    if (!window.WidgetCheckout) {
      console.error('❌ WidgetCheckout no está disponible, reintentando...');
      // Reintentar después de un breve delay en lugar de mostrar error inmediatamente
      setTimeout(() => {
        if (window.WidgetCheckout) {
          initializeWidget();
        } else {
          setAlert({
            show: true,
            message: 'Sistema de pagos no disponible. Intente recargar la página.',
            type: 'error'
          });
        }
      }, 1000);
      return;
    }

    // Depurar qué está disponible en WidgetCheckout
    console.log('🔍 WidgetCheckout object:', window.WidgetCheckout);
    console.log('🔍 WidgetCheckout prototype:', Object.getOwnPropertyNames(window.WidgetCheckout.prototype));

      try {
      // Usar fallback a la clave pública del build (Vite) si el backend no la proporcionó
      const publicKeyUsed = wompiData?.publicKey || import.meta.env.VITE_WOMPI_PUBLIC_KEY;
      console.log('🔑 Public key usada para el widget:', publicKeyUsed);

      // Validar datos requeridos
      if (!publicKeyUsed || !wompiData?.signature || !wompiData?.reference || !wompiData?.amountInCents) {
        throw new Error('Datos de transacción incompletos (falta publicKey/signature/reference/amount)');
      }

      // Función de callback para manejar la respuesta del pago
      const handlePaymentResponse = (result) => {
        console.log('🎉 Respuesta del pago:', result);
        
        if (result && result.transaction) {
          if (result.transaction.status === 'APPROVED') {
            console.log('✅ Pago aprobado');
            clearCart();
            // Limpiar datos de pago guardados
            sessionStorage.removeItem('wompiPaymentData');
            navigate(`/payment-success?orderId=${orderId}&transactionId=${result.transaction.id}`);
          } else if (result.transaction.status === 'DECLINED') {
            console.log('❌ Pago rechazado');
            navigate(`/payment-failure?orderId=${orderId}&error=${result.transaction.status_message || 'Pago rechazado'}`);
          } else {
            console.log('⏳ Pago pendiente:', result.transaction.status);
          }
        }
      };

      const config = {
        currency: wompiData.currency || 'COP',
        amountInCents: parseInt(wompiData.amountInCents),
        reference: wompiData.reference,
        publicKey: publicKeyUsed,
        signature: {
          integrity: wompiData.signature
        }
      };

      console.log('⚙️ Configuración final del widget:', config);

      const checkout = new window.WidgetCheckout(config);
      
      // Depurar el objeto checkout creado
      console.log('🔍 Checkout instance:', checkout);
      console.log('🔍 Checkout methods:', Object.getOwnPropertyNames(checkout));
      console.log('🔍 Checkout prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(checkout)));
      
      // Renderizar el widget usando los métodos disponibles
      // Evitar renderPurchaseButton ya que tiene errores internos
      // Usar directamente el método open() que es más estable
      
      const container = document.getElementById('wompi-widget-container');
      if (container && typeof checkout.open === 'function') {
        // Crear un botón personalizado que abra el widget
        container.innerHTML = `
          <div class="text-center">
            <button id="wompi-pay-button" class="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg shadow-lg">
              💳 Pagar ${(wompiData.amountInCents / 100).toLocaleString()} COP
            </button>
            <p class="text-sm text-gray-600 mt-3">
              <svg class="w-4 h-4 inline mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
              Pago seguro con Wompi
            </p>
          </div>
        `;
        
        const button = document.getElementById('wompi-pay-button');
        if (button) {
          button.addEventListener('click', () => {
            console.log('🚀 Abriendo widget de pago...');
            try {
              // Llamar al método open del widget con la función de callback
              checkout.open(handlePaymentResponse);
            } catch (openError) {
              console.error('❌ Error al abrir widget:', openError);
              setAlert({
                show: true,
                message: 'Error abriendo el sistema de pagos. Intente nuevamente.',
                type: 'error'
              });
            }
          });
          
          console.log('✅ Botón personalizado de pago creado');
        }
      } else {
        throw new Error('No se pudo crear la interfaz de pago');
      }

    } catch (error) {
      console.error('❌ Error inicializando widget:', error);
      setAlert({
        show: true,
        message: `Error inicializando el sistema de pagos: ${error.message}`,
        type: 'error'
      });
    }
  };

  const handleBack = () => {
    navigate('/checkout');
  };

  // Mostrar pantalla de carga si no hay datos iniciales
  if (!paymentData) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de pago...</p>
          <p className="text-sm text-gray-500 mt-2">Si esta pantalla persiste, será redirigido al checkout automáticamente.</p>
        </div>
      </div>
    );
  }

  if (!wompiData || !orderId) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert 
          show={true} 
          message="No se encontraron datos de pago válidos"
          type="error"
          onClose={() => navigate('/checkout')}
        />
        <div className="text-center mt-6">
          <button
            onClick={handleBack}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Volver al Checkout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Alert 
        show={alert.show} 
        message={alert.message} 
        type={alert.type}
        onClose={() => setAlert({ show: false, message: '', type: 'info' })}
      />

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Finalizar Pago</h1>
          <p className="text-gray-600">Complete su pago de forma segura con Wompi</p>
        </div>

        {/* Resumen del pedido */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
          <div className="flex justify-between items-center text-lg">
            <span>Total a pagar:</span>
            <span className="font-bold text-blue-600">
              ${(wompiData.amountInCents / 100).toLocaleString()} COP
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Referencia: {wompiData.reference}
          </div>
        </div>

        {/* Widget de Wompi */}
        <div className="mb-8">
          <div id="wompi-widget-container" className="min-h-[400px] border rounded-lg p-4">
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando sistema de pagos...</p>
                </div>
              </div>
            )}
            
            {!loading && !scriptLoaded && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-red-700 mb-4">Error cargando el sistema de pagos</p>
                  <button 
                    onClick={loadWompiScript}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botón de cancelar */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Volver al Checkout
          </button>
          
          <div className="text-sm text-gray-600 flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Pago 100% seguro
          </div>
        </div>
      </div>
    </div>
  );
};

export default WompiPaymentSimple;