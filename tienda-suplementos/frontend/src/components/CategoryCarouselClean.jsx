import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import creatinasImg from '../assets/images/creatinas.jpg';
import proteinasImg from '../assets/images/proteinas.jpg';
import preentrenosImg from '../assets/images/preentrenos.jpg';
import aminoacidosImg from '../assets/images/aminos.jpg';

// 6 categorías
const BASE = [
  { id: 1, name: 'Proteínas', image: proteinasImg, link: '/products/proteinas' },
  { id: 2, name: 'Pre-entrenos y Quemadores', image: preentrenosImg, link: '/products/preworkout' },
  { id: 3, name: 'Creatinas', image: creatinasImg, link: '/products/creatina' },
  { id: 4, name: 'Aminoácidos y Recuperadores', image: aminoacidosImg, link: '/products/aminoacidos' },
  { id: 5, name: 'Salud y Bienestar', image: proteinasImg, link: '/products/salud' },
  { id: 6, name: 'Comidas con proteína', image: proteinasImg, link: '/products/comida' }
];

export default function CategoryCarouselClean() {
  const ref = useRef(null);
  const [adjusting, setAdjusting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const desktopItems = useMemo(() => [...BASE, ...BASE, ...BASE], []);
  const items = isMobile ? BASE : desktopItems;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Centrar scroll inicial
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const itemWidth = 240;
    el.scrollLeft = isMobile ? 0 : BASE.length * itemWidth;
  }, [isMobile]);

  // Autoscroll suave y continuo
  useEffect(() => {
    const el = ref.current;
    if (!el || isPaused || isMobile) return;

    const scrollSpeed = 1; // Pixels por frame (ajusta para velocidad)
    let animationFrameId;

    const autoScroll = () => {
      if (!adjusting && !isPaused) {
        el.scrollLeft += scrollSpeed;
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [adjusting, isPaused, isMobile]);

  const onScroll = () => {
    if (isMobile) return;
    const el = ref.current;
    if (!el || adjusting) return;
    const itemWidth = 240;
    const section = BASE.length * itemWidth;
    if (el.scrollLeft >= section * 2 - 100) {
      setAdjusting(true);
      el.scrollLeft = section;
      setTimeout(() => setAdjusting(false), 50);
    } else if (el.scrollLeft <= 100) {
      setAdjusting(true);
      el.scrollLeft = section;
      setTimeout(() => setAdjusting(false), 50);
    }
  };

  const nudge = (dir) => {
    const el = ref.current;
    if (!el) return;
    const amount = 300;
    const left = dir === 'left' ? el.scrollLeft - amount : el.scrollLeft + amount;
    el.scrollTo({ left, behavior: 'smooth' });
  };

  return (
    <div className="w-full py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left mb-6">
        <h2 id="categories-title" className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 text-gray-900 tracking-tight">Categorías</h2>
        <p className="text-base sm:text-xl text-gray-600 font-light">Explora por categoría y encuentra lo que necesitas</p>
      </div>

      <div className="relative w-full">
        <div 
          ref={ref} 
          onScroll={onScroll}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className={`flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-6 lg:px-8 ${
            isMobile ? 'snap-x snap-mandatory touch-pan-x' : ''
          }`} 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((cat, idx) => (
            <Link key={`${cat.id}-${idx}`} to={cat.link} className={`flex-shrink-0 ${isMobile ? 'w-44' : 'w-40 sm:w-48'} group cursor-pointer snap-center`}>
              <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-[3/4]">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-100" loading="lazy" />
                {/* Gradiente y texto superpuesto */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2">
                  <h3 className="text-white font-bold text-sm drop-shadow-sm">{cat.name}</h3>
                  <p className="text-[11px] text-white/90">Click para ver más</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
