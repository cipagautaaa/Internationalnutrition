import { useState, useEffect, useRef } from 'react';

/**
 * Componente de video con carga diferida (lazy loading)
 * Solo carga el video cuando entra en el viewport
 * Muestra un poster/thumbnail mientras tanto
 */
export default function LazyVideo({ 
  src, 
  poster, 
  className = '', 
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  rootMargin = '200px', // Pre-cargar 200px antes de entrar al viewport
  ...props 
}) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  // Intersection Observer para detectar cuando el video entra en viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(container);
          }
        });
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  // Intentar reproducir cuando el video carga
  useEffect(() => {
    if (!isInView || !videoRef.current) return;

    const video = videoRef.current;
    
    const handleCanPlay = () => {
      setIsLoaded(true);
      if (autoPlay) {
        video.play().catch(() => {
          // En algunos navegadores autoplay puede fallar, asegurar muted
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    };

    const handleError = () => {
      setHasError(true);
      console.warn('Error loading video:', src);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [isInView, autoPlay, src]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Poster/Thumbnail - siempre visible hasta que el video cargue */}
      {poster && (!isLoaded || hasError) && (
        <img
          src={poster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* Indicador de carga */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Video - solo se renderiza cuando está en viewport */}
      {isInView && !hasError && (
        <video
          ref={videoRef}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          preload="metadata"
          {...props}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
