import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import Alert from './Alert';

const WompiPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [widgetLoaded, setWidgetLoaded] = useState(false);

  const { wompiData, orderId } = location.state || {};

  useEffect(() => {
    console.log('🔍 WompiPayment - Datos recibidos:', { wompiData, orderId });
    
    if (!wompiData || !orderId) {
      console.error('❌ Datos faltantes:', { wompiData, orderId });
      navigate('/checkout');
      return;
    }

    // Cargar el widget de Wompi
    loadWompiWidget();
  }, [wompiData, orderId, navigate]);

  const loadWompiWidget = () => {
    // Verificar si el script ya está cargado
    if (window.WidgetCheckout) {
      initializeWidget();
      return;
    }

    // Cargar script de Wompi
    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Script de Wompi cargado exitosamente');
      setWidgetLoaded(true);
      setTimeout(() => {
        initializeWidget();
      }, 100); // Pequeño delay para asegurar que el widget esté listo
    };
    script.onerror = (error) => {
      console.error('❌ Error cargando script de Wompi:', error);
      setAlert({
        show: true,
        message: 'Error cargando el sistema de pagos de Wompi',
        type: 'error'
      });
    };

    document.head.appendChild(script);
  };

  const initializeWidget = () => {
    console.log('🎯 Inicializando widget con datos:', wompiData);
    
    if (!window.WidgetCheckout || !wompiData) {
      console.error('❌ WidgetCheckout no disponible o datos faltantes:', { 
        WidgetCheckout: !!window.WidgetCheckout, 
        wompiData 
      });
      return;
    }

    try {
      // Configuración básica del widget según documentación de Wompi
      const widgetConfig = {
        currency: wompiData.currency || 'COP',
        amountInCents: wompiData.amountInCents,
        reference: wompiData.reference,
        publicKey: wompiData.publicKey,
        signature: {
          integrity: wompiData.signature
        }
      };
      
      console.log('⚙️ Configuración del widget:', widgetConfig);
      
      const checkout = new window.WidgetCheckout(widgetConfig);

      // Renderizar el widget sin configuraciones adicionales por ahora
      checkout.render({
        containerId: 'wompi-container'
      });

      console.log('✅ Widget renderizado exitosamente');

      // Escuchar eventos del widget (opcional por ahora)
      if (checkout.open) {
        checkout.open((result) => {
          console.log('🎉 Resultado del pago:', result);
          
          if (result.transaction && result.transaction.status === 'APPROVED') {
            // Pago exitoso
            clearCart();
            localStorage.removeItem('pendingOrderId');
            navigate(`/payment-success?orderId=${orderId}&transactionId=${result.transaction.id}`);
          } else if (result.transaction && result.transaction.status === 'DECLINED') {
            // Pago rechazado
            navigate(`/payment-failure?orderId=${orderId}&error=${result.transaction.status_message || 'Pago rechazado'}`);
          }
        });
      }

    } catch (error) {
      console.error('❌ Error inicializando widget Wompi:', error);
      console.error('📋 Detalles del error:', {
        message: error.message,
        stack: error.stack,
        wompiData,
        orderId
      });
      setAlert({
        show: true,
        message: `Error inicializando el sistema de pagos: ${error.message}`,
        type: 'error'
      });
    }
  };

  const handleCancel = () => {
    if (confirm('¿Estás seguro de que quieres cancelar el pago?')) {
      navigate('/checkout');
    }
  };

  if (!wompiData || !orderId) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Error</h2>
          <p className="text-gray-600 mb-6">No se encontraron datos de pago.</p>
          <button
            onClick={() => navigate('/checkout')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
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

        {/* Contenedor del widget de Wompi */}
        <div className="mb-8">
          <div id="wompi-container" className="min-h-[400px] flex items-center justify-center">
            {!widgetLoaded && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando sistema de pagos...</p>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between">
          <button
            onClick={handleCancel}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Cancelar
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

export default WompiPayment;