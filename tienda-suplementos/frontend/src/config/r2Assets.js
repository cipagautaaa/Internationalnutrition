// Rutas centralizadas para assets servidos desde Cloudflare R2
const R2_BASE = 'https://pub-6737b83783eb40a5b8ef162f94b4e30c.r2.dev';

export const R2_ASSETS = {
  images: {
    foto2: `${R2_BASE}/imagenes/foto2.jpg`,
    fotoLocal: `${R2_BASE}/imagenes/fotolocal.jpg`,
  },
  categoryHeroes: {
    proteinas: `${R2_BASE}/categorias/proteinas.png`,
    creatina: `${R2_BASE}/categorias/creatinas.png`,
    preentrenos: `${R2_BASE}/categorias/preentrenos.png`,
    aminoacidos: `${R2_BASE}/categorias/aminoacidos.png`,
    vitaminas: `${R2_BASE}/categorias/vitaminas.png`,
    comidas: `${R2_BASE}/categorias/comidas.png`,
  },
};

export default R2_BASE;
