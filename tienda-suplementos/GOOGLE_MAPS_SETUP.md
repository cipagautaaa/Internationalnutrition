# 🗺️ CONFIGURACIÓN DE GOOGLE MAPS API

## 📋 Pasos para Configurar Google Maps

### 1. **Obtener API Key de Google Maps**

#### **Paso 1: Ir a Google Cloud Console**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Crea un nuevo proyecto o selecciona uno existente

#### **Paso 2: Habilitar APIs**
1. Ve a "APIs y servicios" → "Biblioteca"
2. Busca y habilita estas APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Places API** (opcional, para autocompletado)

#### **Paso 3: Crear API Key**
1. Ve a "APIs y servicios" → "Credenciales"
2. Haz clic en "Crear credenciales" → "Clave de API"
3. Copia la API Key generada

#### **Paso 4: Restringir API Key (IMPORTANTE)**
1. Haz clic en tu API Key para editarla
2. En "Restricciones de aplicación":
   - Selecciona "Referentes HTTP (sitios web)"
   - Agrega estos dominios:
     ```
     localhost:5173/*
     tu-dominio.com/*
     ```
3. En "Restricciones de API":
   - Selecciona "Restringir clave"
   - Marca solo las APIs que habilitaste

### 2. **Configurar en tu Proyecto**

#### **Actualizar el Componente Locations.jsx**
Reemplaza esta línea en el archivo `Locations.jsx`:
```javascript
script.src = `https://maps.googleapis.com/maps/api/js?key=TU_API_KEY_AQUI&callback=initMap`;
```

Por:
```javascript
script.src = `https://maps.googleapis.com/maps/api/js?key=TU_API_KEY_REAL&callback=initMap`;
```

#### **Variables de Entorno (Opcional pero Recomendado)**
1. Crea un archivo `.env.local` en el frontend:
```
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

2. Actualiza el componente para usar la variable:
```javascript
script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&callback=initMap`;
```

### 3. **Personalizar Ubicaciones**

#### **Editar Datos de Ubicaciones**
En el archivo `Locations.jsx`, busca el array `locations` y actualiza con tus datos reales:

```javascript
const locations = [
  {
    id: 1,
    name: "Tu Sucursal Principal",
    address: "Tu dirección real",
    phone: "+54 11 tu-telefono",
    whatsapp: "+54911tu-whatsapp",
    coordinates: { lat: tu_latitud, lng: tu_longitud }, // Usa Google Maps para obtener coordenadas
    hours: {
      monday: "9:00 - 20:00",
      // ... actualiza todos los horarios
    },
    isOpen: true, // Cambia según el horario actual
    rating: 4.8,
    features: ["Parking", "WiFi", "AC"] // Personaliza características
  }
  // Agrega más ubicaciones según necesites
];
```

#### **Obtener Coordenadas**
1. Ve a [Google Maps](https://maps.google.com)
2. Busca tu dirección
3. Haz clic derecho en el marcador
4. Selecciona las coordenadas que aparecen
5. Copia lat y lng al código

### 4. **Funcionalidades Implementadas**

#### **✅ Características Incluidas:**
- **Mapa interactivo** con estilo personalizado oscuro
- **Marcadores personalizados** con tu paleta de colores
- **Cards de ubicaciones** con información completa
- **Botones de acción**:
  - "Ir" → Abre Google Maps con direcciones
  - "WhatsApp" → Abre chat directo
- **Estados dinámicos** (Abierto/Cerrado)
- **Horarios completos** para cada sucursal
- **Responsive design** para móviles
- **Animaciones suaves** y efectos hover

#### **🎨 Diseño Personalizado:**
- **Paleta rojo/negro/blanco** aplicada
- **Estilo oscuro** en el mapa
- **Marcadores personalizados** con tu branding
- **Cards elegantes** con efectos de hover
- **Iconos de Lucide React** consistentes

### 5. **Costos de Google Maps**

#### **💰 Precios Aproximados (2024):**
- **Primeras 28,000 cargas**: GRATIS por mes
- **Cargas adicionales**: ~$7 USD por cada 1000 cargas
- **Para tienda pequeña/mediana**: Usualmente GRATIS

#### **💡 Tips para Ahorrar:**
- Restricta tu API Key a tus dominios
- Usa caché del navegador
- Evita recargas innecesarias del mapa

### 6. **Testing y Deployment**

#### **🧪 Para Probar Localmente:**
1. Agrega tu API Key al código
2. Ejecuta `npm run dev`
3. Ve a `http://localhost:5173/ubicaciones`

#### **🚀 Para Producción:**
1. Actualiza restricciones de API Key con tu dominio real
2. Configura variables de entorno en tu hosting
3. Prueba todas las funcionalidades

### 7. **Troubleshooting**

#### **❌ Error "Google is not defined":**
- Verifica que la API Key sea correcta
- Checa que las APIs estén habilitadas

#### **❌ Mapa no se muestra:**
- Revisa las restricciones de dominios
- Verifica la consola del navegador

#### **❌ Marcadores no aparecen:**
- Checa las coordenadas (lat, lng)
- Verifica que estén dentro del zoom del mapa

---

## 🎯 **¡Ya está listo!**

Una vez configurado, tendrás una sección de ubicaciones profesional con:
- ✅ Mapa interactivo elegante
- ✅ Información completa de sucursales  
- ✅ Integración con WhatsApp y Google Maps
- ✅ Diseño responsive y moderno
- ✅ Paleta de colores consistente

¿Necesitas ayuda con algún paso específico? ¡Avísame! 🚀