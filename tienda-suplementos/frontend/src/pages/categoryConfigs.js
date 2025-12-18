// Configuración de categorías: permite personalizar hero/estilos sin crear 8 páginas duplicadas.
// Puedes añadir más props como colores, CTA, descripciones, etc.

import { R2_ASSETS } from '../config/r2Assets';


export const CATEGORY_META = {
  'Proteínas': {
    hero: {
      type: 'image',
      src: R2_ASSETS.categoryHeroes.proteinas,
      height: 'calc(100vh - 36px)',
      overlay: 'bg-black/20',
    }
  },
  'Creatina': {
    hero: {
      type: 'image',
      src: R2_ASSETS.categoryHeroes.creatina,
      height: 'calc(100vh - 36px)',
      overlay: 'bg-black/20',
    }
  },
  'Pre-Workout': {
    hero: {
      type: 'image',
      src: R2_ASSETS.categoryHeroes.preentrenos,
      height: 'calc(100vh - 36px)',
      overlay: 'bg-black/20',
    }
  },
  'Aminoácidos': {
    hero: {
      type: 'image',
      src: R2_ASSETS.categoryHeroes.aminoacidos,
      height: 'calc(100vh - 36px)',
      overlay: 'bg-black/20',
    },
  
  },
   'Vitaminas': {
    hero: {
      type: 'image',
      src: R2_ASSETS.categoryHeroes.vitaminas,
      height: 'calc(100vh - 36px)',
      overlay: 'bg-black/20',
    },
  },  
  
  // Nuevas categorías (taxonomía 2025)
  'Pre-entrenos y Quemadores': {
    hero: { type: 'image', src: R2_ASSETS.categoryHeroes.preentrenos, height: 'calc(100vh - 36px)', overlay: 'bg-black/20' }
  },
  'Creatinas': {
    hero: { type: 'image', src: R2_ASSETS.categoryHeroes.creatina, height: 'calc(100vh - 36px)', overlay: 'bg-black/20' }
  },
  'Aminoácidos y Recuperadores': {
    hero: { type: 'image', src: R2_ASSETS.categoryHeroes.aminoacidos, height: 'calc(100vh - 36px)', overlay: 'bg-black/20' }
  },
  'Salud y Bienestar': {
    hero: { type: 'image', src: R2_ASSETS.categoryHeroes.vitaminas, height: 'calc(100vh - 36px)', overlay: 'bg-black/20' }
  },
  'Rendimiento hormonal': {
    hero: { type: 'image', src: R2_ASSETS.categoryHeroes.creatina, height: 'calc(100vh - 36px)', overlay: 'bg-black/20' }
  },
  'Alimentacion saludable y alta en proteina': {
    hero: { type: 'image', src: R2_ASSETS.categoryHeroes.comidas, height: 'calc(100vh - 36px)', overlay: 'bg-black/20' }
  },
  'Comida': {
    hero: { type: 'image', src: R2_ASSETS.categoryHeroes.comidas, height: 'calc(100vh - 36px)', overlay: 'bg-black/20' }
  },
};

export default CATEGORY_META;
