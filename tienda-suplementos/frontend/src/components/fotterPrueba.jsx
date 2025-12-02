import React from 'react';
import { Instagram, MessageCircle, Mail, Phone, MapPin, Clock, Shield, Truck, Award, Tiktok } from 'lucide-react';
import { getWhatsappUrl } from '../utils/whatsapp';
// Importamos el SVG correcto solicitado
import logoImage from '../assets/images/image.png';
// Icono adicional (corrige la ruta al archivo existente en /images)
import icono from '../assets/images/Captura_de_pantalla_2025-08-09_192459-removebg-preview.png';       

const Footer = () => {
  const whatsappLink = getWhatsappUrl('Hola, necesito más información sobre International Nutrition.');
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-black to-red-950 text-white overflow-hidden">
      {/* Patrón de fondo animado */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 50px,
            rgba(220, 38, 38, 0.1) 50px,
            rgba(220, 38, 38, 0.1) 100px
          )`,
          animation: 'slidePattern 20s linear infinite'
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header del footer */}
        <div className="text-center mb-12">
          <div className="inline-flex flex-col items-center space-y-4 mb-6">
            {/* Logo PNG solicitado */}
            <div className="transform hover:scale-105 transition-all duration-300">
              <img
                src={logoImage}
                alt="Logo"
                className="max-h-24 sm:max-h-28 lg:max-h-32 w-auto object-contain mx-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
                loading="lazy"
              />
            </div>
            {/* Texto complementario */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <img 
                  src={icono} 
                  alt="Icono" 
                  className="h-10 w-10 object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.55)] hover:drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] transition-all duration-300" 
                  loading="lazy"
                />
                <span className="text-red-700 font-semibold">Tu aliado en el fitness</span>
              </div>
            </div>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
            Productos de calidad, asesoramiento experto y resultados garantizados para alcanzar tus objetivos.
          </p>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Columna 1: Empresa */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-700 border-b border-red-700 pb-2">
              Empresa
            </h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-red-700 transition-colors duration-300 flex items-center space-x-2">
                <span className="w-1 h-1 bg-red-7000 rounded-full"></span>
                <span>Quiénes Somos</span>
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-red-700 transition-colors duration-300 flex items-center space-x-2">
                <span className="w-1 h-1 bg-red-7000 rounded-full"></span>
                <span>Nuestro Equipo</span>
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-red-700 transition-colors duration-300 flex items-center space-x-2">
                <span className="w-1 h-1 bg-red-7000 rounded-full"></span>
                <span>Blog y Noticias</span>
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-red-700 transition-colors duration-300 flex items-center space-x-2">
                <span className="w-1 h-1 bg-red-7000 rounded-full"></span>
                <span>Oportunidades</span>
              </a></li>
            </ul>
          </div>

          {/* Columna 2: Soporte */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-700 border-b border-red-700 pb-2">
              Soporte
            </h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-red-700 transition-colors duration-300 flex items-center space-x-2">
                <span className="w-1 h-1 bg-red-7000 rounded-full"></span>
                <span>Centro de Ayuda</span>
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-red-700 transition-colors duration-300 flex items-center space-x-2">
                <span className="w-1 h-1 bg-red-7000 rounded-full"></span>
                <span>Envíos y Entregas</span>
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-red-700 transition-colors duration-300 flex items-center space-x-2">
                <span className="w-1 h-1 bg-red-7000 rounded-full"></span>
                <span>Garantías y Devoluciones</span>
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-red-700 transition-colors duration-300 flex items-center space-x-2">
                <span className="w-1 h-1 bg-red-7000 rounded-full"></span>
                <span>Preguntas Frecuentes</span>
              </a></li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-700 border-b border-red-700 pb-2">
              Contacto
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-red-7000 mt-1 flex-shrink-0" />
                <p className="text-gray-300 text-sm">Cra 10 #22-70-Local 101, Tunja, Boyacá</p>
                <p className="text-gray-300 text-sm">Avenida Circunvalar 12-20, Duitama, Boyacá</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-red-7000 flex-shrink-0" />
                <a href="tel:+573006851794" className="text-gray-300 hover:text-red-700 transition-colors text-sm">
                  +57 300 685 1794
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-red-7000 flex-shrink-0" />
                <a href="mailto:internationalnutritioncol@gmail.com" className="text-gray-300 hover:text-red-700 transition-colors text-sm">
                  internationalnutritioncol@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-red-7000 flex-shrink-0" />
                <p className="text-gray-300 text-sm">Lun - Vie: 8:30 AM - 8:00 PM</p>
              </div>
            </div>
          </div>

          {/* Columna 4: Redes Sociales y Garantías */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-red-700 border-b border-red-700 pb-2 mb-4">
                Síguenos
              </h3>
              <div className="flex space-x-4">
                <a
                  href="https://www.tiktok.com/@int.supps?_r=1&_t=ZS-91s4lxW5aon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-900 hover:bg-gray-800 p-2 rounded transition-all duration-300 transform hover:scale-110"
                  aria-label="TikTok"
                >
                  <Tiktok className="h-6 w-6 text-white" />
                </a>
                <a
                  href="https://www.instagram.com/int.supps?igsh=MWo5ajB1cTVzMGo2eQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-2 rounded transition-all duration-300 transform hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="h-6 w-6 text-white" />
                </a>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 p-2 rounded transition-all duration-300 transform hover:scale-110" aria-label="WhatsApp">
                  <MessageCircle className="h-6 w-6 text-white" />
                </a>
              </div>
            </div>

            {/* Garantías */}
            <div>
              <h4 className="text-sm font-bold text-red-700 mb-3">Garantías</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Shield className="h-3 w-3 text-red-7000" />
                  <span>Productos Originales</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Truck className="h-3 w-3 text-red-7000" />
                  <span>Envío Gratis desde $100k</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Award className="h-3 w-3 text-red-7000" />
                  <span>Calidad Garantizada</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Separador y copyright */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} INTERNATIONAL NUTRITION. Todos los derechos reservados.
              </p>
            
            </div>
            <div className="flex space-x-6 text-xs text-gray-400">
              <a href="#" className="hover:text-red-700 transition-colors">Política de Privacidad</a>
              <a href="#" className="hover:text-red-700 transition-colors">Términos de Servicio</a>
              <a href="#" className="hover:text-red-700 transition-colors">Política de Cookies</a>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS en JS para las animaciones */}
      <style jsx>{`
        @keyframes slidePattern {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100px); }
        }
      `}</style>
    </footer>
  );
};

export default Footer;