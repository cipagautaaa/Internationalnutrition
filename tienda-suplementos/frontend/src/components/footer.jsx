import nutritionImg from '../assets/images/10889482858.svg';

// Footer global con columnas de enlaces y la imagen grande colocada debajo de los textos.
// La imagen se ubica al final para priorizar contenido textual/SEO y mantener la versión
// solicitada (imagen NO arriba).
export default function Footer() {
  const year = new Date().getFullYear();
  return (
  <footer className="bg-gray-50 border-t border-gray-200 mt-24 text-sm text-gray-600">
      {/* Contenido textual dentro del ancho máximo */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-gray-900 font-semibold mb-4 text-base">Empresa</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-red-700 transition-colors">Quiénes somos</a></li>
              <li><a href="#" className="hover:text-red-700 transition-colors">Equipo</a></li>
              <li><a href="#" className="hover:text-red-700 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-red-700 transition-colors">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold mb-4 text-base">Soporte</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-red-700 transition-colors">Centro de ayuda</a></li>
              <li><a href="#" className="hover:text-red-700 transition-colors">Envíos y devoluciones</a></li>
              <li><a href="#" className="hover:text-red-700 transition-colors">Garantías</a></li>
              <li><a href="#" className="hover:text-red-700 transition-colors">Estado del pedido</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold mb-4 text-base">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-red-700 transition-colors">Privacidad</a></li>
              <li><a href="#" className="hover:text-red-700 transition-colors">Términos</a></li>
              <li><a href="#" className="hover:text-red-700 transition-colors">Cookies</a></li>
              <li><a href="#" className="hover:text-red-700 transition-colors">Licencias</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold mb-4 text-base">Categorías</h3>
            <ul className="space-y-2">
              <li><a href="/products/proteinas" className="hover:text-red-700 transition-colors">Proteínas</a></li>
              <li><a href="/products/creatina" className="hover:text-red-700 transition-colors">Creatina</a></li>
              <li><a href="/products/aminoacidos" className="hover:text-red-700 transition-colors">Aminoácidos</a></li>
              <li><a href="/products/vitaminas" className="hover:text-red-700 transition-colors">Vitaminas</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold mb-4 text-base">Síguenos</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-red-700 transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-red-700 transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-red-700 transition-colors">TikTok</a></li>
              <li><a href="#" className="hover:text-red-700 transition-colors">WhatsApp</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-10 pb-8 border-t border-gray-200 mt-12">
          <p className="text-xs text-gray-500">© {year} INT SUPLEMENTOS. Todos los derechos reservados.</p>
          <p className="text-xs text-gray-400">Desarrollado con <span className="text-red-7000">❤</span> para tu rendimiento.</p>
        </div>
      </div>
      {/* Imagen final full-bleed al fondo del footer */}
      <div className="w-full">
        <div className="relative w-full overflow-hidden border-t border-gray-200 bg-white">
          <img
            src={nutritionImg}
            alt="Nutrición"
            className="w-full max-h-[460px] object-contain md:object-cover object-center select-none"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            loading="lazy"
          />
        </div>
      </div>
    </footer>
  );
}