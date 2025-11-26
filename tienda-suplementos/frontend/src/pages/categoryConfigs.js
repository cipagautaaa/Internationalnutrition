// Configuración de categorías: permite personalizar hero/estilos sin crear 8 páginas duplicadas.
// Puedes añadir más props como colores, CTA, descripciones, etc.

import proteinasImg from '../assets/images/proteinas.jpg';
import creatinasImg from '../assets/images/creatinas.jpg';
import preentrenosImg from '../assets/images/preentrenos.jpg';
import aminoacidosImg from '../assets/images/aminos.jpg';
import vitaminasImg from '../assets/images/vitaminas.jpg';
import comidasImg from '../assets/images/comidas.jpg';


export const CATEGORY_META = {
  'Proteínas': {
    hero: {
      type: 'image',
      src: proteinasImg,
      height: 'calc(100vh - 36px)', // misma altura que el video de Home
      overlay: 'bg-black/20',
    }
  },
  'Creatina': {
    hero: {
      type: 'image',
      src: creatinasImg,
      height: 'calc(100vh - 36px)',
      overlay: 'bg-black/20',
    }
  },
  'Pre-Workout': {
    hero: {
      type: 'image',
      src: preentrenosImg,
      height: 'calc(100vh - 36px)',
      overlay: 'bg-black/20',
    }
  },
  'Aminoácidos': {
    hero: {
      type: 'image',
      src: aminoacidosImg,
      height: 'calc(100vh - 36px)',
      overlay: 'bg-black/20',
    },
  
  },
   'Vitaminas': {
    hero: {
      type: 'image',
      src: vitaminasImg,
      height: 'calc(100vh - 36px)',
      overlay: 'bg-black/20',
    },
  },  
  
  // Nuevas categorías (taxonomía 2025)
  'Pre-entrenos y Quemadores': {
    hero: { type: 'image', src: preentrenosImg, height: 'calc(100vh - 36px)', overlay: 'bg-black/20' }
  },
  'Creatinas': {
    hero: { type: 'image', src: creatinasImg, height: 'calc(100vh - 36px)', overlay: 'bg-black/20' }
  },
  'Aminoácidos y Recuperadores': {
    hero: { type: 'image', src: aminoacidosImg, height: 'calc(100vh - 36px)', overlay: 'bg-black/20' }
  },
  'Salud y Bienestar': {
    hero: { type: 'image', src: vitaminasImg, height: 'calc(100vh - 36px)', overlay: 'bg-black/20' }
  },
  'Rendimiento hormonal': {
    hero: { type: 'image', src: creatinasImg, height: 'calc(100vh - 36px)', overlay: 'bg-black/20' }
  },
  'Comidas con proteína': {
    hero: { type: 'image', src: comidasImg, height: 'calc(100vh - 36px)', overlay: 'bg-black/20' }
  },
  'Comida': {
    hero: { type: 'image', src: comidasImg, height: 'calc(100vh - 36px)', overlay: 'bg-black/20' }
  },
};

export default CATEGORY_META;
