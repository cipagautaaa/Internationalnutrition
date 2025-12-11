import React, { useState } from 'react';
import { MapPin, Clock, Phone, MessageCircle, Navigation, Star, Store, Mail } from 'lucide-react';
import Footer from './fotterPrueba';
import tiendaTunja from '../assets/images/tiendatunja.jpg';
import entradaTunja from '../assets/images/entradatunja.jpg';
import tiendaDuitama from '../assets/images/tiendaduitama.jpg';
import entradaDuitama from '../assets/images/entradaduitama.jpg';
import { getWhatsappUrl } from '../utils/whatsapp';

const Locations = () => {
  const [selectedLocation, setSelectedLocation] = useState(0);
  
  const locations = [
    {
      id: 1,
      name: "INTERNATIONAL NUTRITION - Tunja",
      city: "Tunja",
      address: "Cra 10 #22-70-Local 101, Tunja, Boyacá",
      phone: "573006851794",
      whatsapp: "573006851794",
      email: "internationalnutritioncol@gmail.com",
      coordinates: { lat: 5.53565843789193, lng: -73.36111820444094 },
      hours: {
        weekdays: "Lunes - Viernes: 9:00 AM - 1:00 PM y 3:00 PM - 8:00 PM",
        saturday: "Sábado: 9:00 AM - 1:00 PM y 3:00 PM - 8:00 PM",
        sunday: "Domingo y festivos: 10:00 AM - 5:00 PM"
      },
      isOpen: true,
      rating: 4.9,
      images: {
        store: tiendaTunja,
        entrance: entradaTunja
      }
    },
    {
      id: 2,
      name: "INTERNATIONAL NUTRITION - Duitama",
      city: "Duitama",
      address: "Avenida Circunvalar 12-20, Duitama, Boyacá",
      phone: "573006851794",
      whatsapp: "573006851794",
      email: "internationalnutritioncol@gmail.com",
      coordinates: { lat: 5.816389219276386, lng: -73.02995133558204 },
      hours: {
        weekdays: "Lunes - Viernes: 9:00 AM - 1:00 PM y 3:00 PM - 8:00 PM",
        saturday: "Sábado: 9:00 AM - 1:00 PM y 3:00 PM - 8:00 PM",
        sunday: "Domingo y festivos: 10:00 AM - 5:00 PM"
      },
      isOpen: true,
      rating: 4.9,
      images: {
        store: tiendaDuitama,
        entrance: entradaDuitama
      }
    }
  ];

  const getDayName = (dayKey) => {
    const days = {
      weekdays: 'Lunes - Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo y festivos'
    };
    return days[dayKey];
  };

  const currentLocation = locations[selectedLocation] || locations[0];

  // Verificar que tengamos una ubicación válida
  if (!currentLocation) {
    return <div>Error: No se encontró la ubicación</div>;
  }

  const openWhatsApp = () => {
    const message = 'Hola, me interesa conocer más sobre sus productos.';
    window.open(getWhatsappUrl(message, currentLocation.whatsapp), '_blank');
  };

  const openMaps = () => {
    const { lat, lng } = currentLocation.coordinates;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  const callPhone = () => {
    window.open(`tel:${currentLocation.phone}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header minimalista */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Nuestras Tiendas
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Visítanos en cualquiera de nuestras sedes en Boyacá
          </p>
        </div>

        {/* Selector de tiendas - Tabs más notorios */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
            <p className="text-center text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Selecciona tu ciudad
            </p>
            <div className="grid grid-cols-2 gap-4">
              {locations.map((loc, index) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(index)}
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                    selectedLocation === index 
                      ? 'bg-red-600 text-white shadow-lg scale-105 transform' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
                  }`}
                >
                  {loc.city}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sección 1: Imagen entrada + Info básica */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Imagen de la entrada */}
          <div className="relative group overflow-hidden rounded-2xl shadow-lg bg-gray-100 order-2 lg:order-1">
            <div className="aspect-[4/3]">
              <img 
                src={currentLocation.images.entrance}
                alt={`Entrada de ${currentLocation.name}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white font-medium text-lg">Entrada principal</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información básica - Solo dirección */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-300 p-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{currentLocation.name}</h2>
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1 text-gray-700 font-medium">{currentLocation.rating}</span>
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                    Abierto
                  </span>
                </div>
              </div>

              {/* Solo Dirección con descripción */}
              <div className="flex items-start gap-3">
                <MapPin className="h-6 w-6 text-gray-900 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Dirección</p>
                  <p className="text-gray-900 font-medium text-lg mb-3">{currentLocation.address}</p>
                  <p className="text-gray-600 leading-relaxed">
                    Visítanos en nuestra tienda física para recibir asesoramiento personalizado 
                    y encontrar los mejores suplementos para alcanzar tus objetivos de fitness y salud.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 2: Información de contacto y Horarios */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          
          {/* Contacto */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-300 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Contacto</h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">Teléfono</p>
                  <a href={`tel:${currentLocation.phone}`} className="text-gray-900 hover:text-blue-600 transition-colors font-medium">
                    {currentLocation.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                  <a href={`mailto:${currentLocation.email}`} className="text-gray-900 hover:text-blue-600 transition-colors text-sm break-all">
                    {currentLocation.email}
                  </a>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={openWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  <MessageCircle className="h-5 w-5" />
                  Contactar por WhatsApp
                </button>
              </div>

              <div>
                <button
                  onClick={callPhone}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  <Phone className="h-5 w-5" />
                  Llamar ahora
                </button>
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-300 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-6 w-6 text-gray-900" />
              <h3 className="text-xl font-bold text-gray-900">Horarios</h3>
            </div>
            
            <div className="space-y-3">
              {Object.entries(currentLocation.hours).map(([day, hours]) => (
                <div key={day} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600 font-medium">
                    {getDayName(day)}
                  </span>
                  <span className="text-gray-900 font-medium">
                    {hours.split(': ')[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sección 3: Imagen interior en ancho completo */}
        <div className="mb-16">
          <div className="relative group overflow-hidden rounded-2xl shadow-lg bg-gray-100">
            <img 
              src={currentLocation.images.store}
              alt={`Interior de ${currentLocation.name}`}
              className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-white font-medium text-xl">Interior de la tienda</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa en ancho completo */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Navigation className="h-6 w-6" />
                Cómo llegar
              </h3>
            </div>
            <div className="relative">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3975.2!2d${currentLocation.coordinates.lng}!3d${currentLocation.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e6a42b6c0a3e3e3%3A0x1234567890!2s${encodeURIComponent(currentLocation.address)}!5e0!3m2!1ses!2sco!4v1234567890123!5m2!1ses!2sco`}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de INT Suplementos"
                className="w-full"
              ></iframe>
              <button
                onClick={openMaps}
                className="absolute bottom-6 right-6 bg-white hover:bg-gray-50 shadow-lg rounded-lg px-5 py-3 text-gray-900 font-medium flex items-center gap-2 border border-gray-200 transition-all duration-200 hover:shadow-xl"
              >
                <Navigation className="h-5 w-5" />
                Abrir en Google Maps
              </button>
            </div>
          </div>
        </div>

        {/* CTA final minimalista */}
        <div className="bg-gray-900 rounded-2xl p-12 text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Necesitas asesoramiento?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Nuestro equipo de expertos está listo para ayudarte a alcanzar tus objetivos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={openWhatsApp}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Contactar por WhatsApp
            </button>
            <button
              onClick={callPhone}
              className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Phone className="h-5 w-5" />
              Llamar ahora
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Locations;