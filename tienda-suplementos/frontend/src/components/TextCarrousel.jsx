import React, { useRef, useEffect, useMemo } from 'react';

// Mensajes base del carrusel
const ITEMS = [
  { id: 'envio', text: 'Tu envío es gratis desde $0', icon: 'truck', color: 'text-red-700' },
  { id: 'ahorro', text: 'Compra más, ahorra más', icon: 'bag', color: 'text-white' },
  { id: 'combos', text: 'Combos imperdibles HOY', icon: 'lock', color: 'text-red-700' }
];

const Icon = ({ name, className }) => {
  switch (name) {
    case 'truck':
      return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V5a1 1 0 011-1h5a1 1 0 011 1v12m-7 0h7m-7 0a2 2 0 11-4 0m11 0a2 2 0 11-4 0"/></svg>;
    case 'bag':
      return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="2" strokeWidth="2"/><path d="M2 11h20" strokeWidth="2"/></svg>;
    case 'lock':
      return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="2"/><path d="M7 11V7a5 5 0 0110 0v4" strokeWidth="2"/></svg>;
    default:
      return null;
  }
};

// Carrusel infinito controlado por JS para evitar depender de ancho exacto en CSS.
const TextCarrousel = ({ speed = 40 }) => {
  // speed = pixeles por segundo
  const trackRef = useRef(null);
  const reqRef = useRef(null);
  const offsetRef = useRef(0);
  const halfWidthRef = useRef(0);

  const duplicated = useMemo(() => {
    // Crear múltiples copias para asegurar bucle infinito
    const multipleCopies = [];
    for (let i = 0; i < 4; i++) {
      multipleCopies.push(...ITEMS);
    }
    return multipleCopies;
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Calcular mitad del ancho (porque duplicamos el contenido varias veces)
    const computeHalf = () => {
      // Con 4 copias, necesitamos resetear cada 1/4 del contenido total
      const singleSetWidth = track.scrollWidth / 4;
      halfWidthRef.current = singleSetWidth;
    };
    computeHalf();
    // Re-calcular después de un breve delay para asegurar renderizado completo
    setTimeout(computeHalf, 100);
    window.addEventListener('resize', computeHalf);

    let lastTs = performance.now();
    const step = (ts) => {
      const dt = (ts - lastTs) / 1000; // segundos
      lastTs = ts;
      
      // Avanzar según velocidad
      offsetRef.current += speed * dt;
      
      // Resetear cuando completamos un ciclo de los elementos base
      if (offsetRef.current >= halfWidthRef.current) {
        offsetRef.current = offsetRef.current % halfWidthRef.current;
      }
      
      track.style.transform = `translateX(-${offsetRef.current}px)`;
      reqRef.current = requestAnimationFrame(step);
    };
    reqRef.current = requestAnimationFrame(step);

    return () => {
      window.removeEventListener('resize', computeHalf);
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [speed]);

  return (
    <section
      id="carrusel-superior"
      className="w-full overflow-hidden select-none relative z-40 transition-all duration-300"
      style={{
        backgroundColor: 'rgb(111, 32, 32)',
        borderBottom: '2px solid rgb(111, 32, 32)'
      }}
    >
      <div className="flex items-center h-9">
        <div className="w-full overflow-hidden relative">
          <ul
            ref={trackRef}
            className="flex gap-16 whitespace-nowrap will-change-transform"
            style={{ paddingLeft: '1rem' }}
          >
            {duplicated.map((item, idx) => (
              <li key={item.id + '-' + idx} className="flex items-center gap-2">
                <Icon name={item.icon} className={`w-4 h-4 ${item.color}`} />
                <span className="text-xs text-white font-bold">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default TextCarrousel;
