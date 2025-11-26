import React, { useState, useEffect } from 'react';

const whatsappNumber = '573006851794'; // Reemplaza con tu número
const defaultMessage = '¡Hola! Necesito asesoría.';

const WhatsappFloatButton = () => {
  const [showMessage, setShowMessage] = useState(false);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  // Abrir automáticamente después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    setShowMessage(!showMessage);
  };

  const handleWhatsappClick = () => {
    window.open(whatsappUrl, '_blank');
    setShowMessage(false);
  };

  const handleCloseMessage = () => {
    setShowMessage(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
      {/* Mensaje popup */}
      {showMessage && (
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '0',
            backgroundColor: '#25D366',
            color: 'white',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            width: '280px',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {/* Botón cerrar */}
          <button
            onClick={handleCloseMessage}
            style={{
              position: 'absolute',
              top: '10px',
              right: '15px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
          
          {/* Encabezado */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="white">
                <path d="M26.6 5.4C23.7 2.5 19.9 1 16 1 7.7 1 1 7.7 1 16c0 2.6.7 5.2 2 7.4L1 31l7.9-2.1c2.1 1.2 4.5 1.8 7.1 1.8 8.3 0 15-6.7 15-15 0-4-1.5-7.8-4.4-10.4zM16 28.4c-2.2 0-4.4-.6-6.3-1.7l-.5-.3-4.8 1.3 1.3-4.7-.3-.5c-1.2-1.9-1.8-4.1-1.8-6.4 0-6.8 5.5-12.3 12.3-12.3 3.3 0 6.4 1.3 8.7 3.6 2.3 2.3 3.6 5.4 3.6 8.7.1 6.8-5.4 12.3-12.2 12.3zm6.7-9.2c-.4-.2-2.2-1.1-2.5-1.2-.3-.1-.6-.2-.8.2-.3.4-1 1.2-1.2 1.5-.2.3-.4.3-.8.1-.4-.2-1.6-.6-3.1-1.9-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.6.1-.2.1-.5 0-.7-.1-.2-.8-2-1.1-2.7-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.5-.3.4-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.3 2.6 4 6.3 5.6.9.4 1.6.6 2.1.8.9.3 1.7.2 2.3.1.7-.1 2.2-.9 2.5-1.8.3-.9.3-1.6.2-1.8-.1-.2-.4-.3-.8-.5z"/>
              </svg>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>¡Escríbenos por WhatsApp!</span>
            </div>
            <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.4' }}>
              ¡Hola! ¿tienes dudas? ¿ necesitas consejos? contactanos para recibir asesoría            </p>
          </div>

          <p style={{ fontSize: '12px', color: '#e8f5e8', margin: '0 0 15px 0' }}>
          Normalmente respondemos en minutos.
          </p>

          {/* Miembro del equipo */}
          <div
            onClick={handleWhatsappClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '12px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Asesor de Ventas</div>
              <div style={{ fontSize: '12px', opacity: '0.8' }}>¡Realiza tu pedido por WhatsApp!</div>
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              👨‍💼
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </div>

          {/* Flecha apuntando al botón */}
          <div
            style={{
              position: 'absolute',
              bottom: '-8px',
              right: '20px',
              width: '0',
              height: '0',
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #25D366',
            }}
          />
        </div>
      )}

      {/* Botón principal */}
      <button
        onClick={handleClick}
        style={{
          backgroundColor: '#25D366',
          color: 'white',
          borderRadius: '50%',
          boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          width: '56px',
          height: '56px',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.4)';
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M26.6 5.4C23.7 2.5 19.9 1 16 1 7.7 1 1 7.7 1 16c0 2.6.7 5.2 2 7.4L1 31l7.9-2.1c2.1 1.2 4.5 1.8 7.1 1.8 8.3 0 15-6.7 15-15 0-4-1.5-7.8-4.4-10.4zM16 28.4c-2.2 0-4.4-.6-6.3-1.7l-.5-.3-4.8 1.3 1.3-4.7-.3-.5c-1.2-1.9-1.8-4.1-1.8-6.4 0-6.8 5.5-12.3 12.3-12.3 3.3 0 6.4 1.3 8.7 3.6 2.3 2.3 3.6 5.4 3.6 8.7.1 6.8-5.4 12.3-12.2 12.3zm6.7-9.2c-.4-.2-2.2-1.1-2.5-1.2-.3-.1-.6-.2-.8.2-.3.4-1 1.2-1.2 1.5-.2.3-.4.3-.8.1-.4-.2-1.6-.6-3.1-1.9-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.6.1-.2.1-.5 0-.7-.1-.2-.8-2-1.1-2.7-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.5-.3.4-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.3 2.6 4 6.3 5.6.9.4 1.6.6 2.1.8.9.3 1.7.2 2.3.1.7-.1 2.2-.9 2.5-1.8.3-.9.3-1.6.2-1.8-.1-.2-.4-.3-.8-.5z" fill="white"/>
        </svg>
      </button>
    </div>
  );
};

export default WhatsappFloatButton;