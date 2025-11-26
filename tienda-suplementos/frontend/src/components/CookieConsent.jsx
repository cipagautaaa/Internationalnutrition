import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya ha aceptado las cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookiesAccepted', 'false');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Utilizamos cookies 🍪</h3>
            <p className="text-sm text-gray-600">
              Utilizamos cookies propias y de terceros para mejorar nuestros servicios, personalizar tu experiencia 
              y analizar el uso de nuestro sitio web. Puedes obtener más información en nuestra{' '}
              <a href="/politica-cookies" className="text-primary-600 hover:text-primary-700 underline">
                Política de Cookies
              </a>.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={declineCookies}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Rechazar
            </button>
            <button
              onClick={acceptCookies}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              Aceptar cookies
            </button>
            <button
              onClick={declineCookies}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Cerrar banner de cookies"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;