import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Resetea el scroll al top cada vez que cambia el pathname
export default function ScrollToTop({ smooth = false }) {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      const options = smooth
        ? { top: 0, left: 0, behavior: 'smooth' }
        : { top: 0, left: 0 };
      window.scrollTo(options);
    } catch {
      // fallback por si el navegador no soporta scroll options
      window.scrollTo(0, 0);
    }
  }, [pathname, smooth]);

  return null;
}
