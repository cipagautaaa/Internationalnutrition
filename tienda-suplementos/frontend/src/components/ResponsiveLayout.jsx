import React from 'react';

const ResponsiveLayout = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Grid responsivo con sidebar opcional */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Contenido principal */}
            <div className="lg:col-span-12">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Variante con sidebar
export const ResponsiveLayoutWithSidebar = ({ children, sidebar, className = '' }) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar en dispositivos grandes */}
            <div className="hidden lg:block lg:col-span-3">
              {sidebar}
            </div>
            
            {/* Contenido principal */}
            <div className="lg:col-span-9">
              {/* Sidebar móvil */}
              <div className="lg:hidden mb-6">
                {sidebar}
              </div>
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Grid responsivo para listas de productos o tarjetas
export const ResponsiveGrid = ({ children, columns = { sm: 2, md: 3, lg: 4 } }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} gap-4 sm:gap-6 lg:gap-8`}>
      {children}
    </div>
  );
};

// Contenedor para secciones responsivas
export const ResponsiveSection = ({ children, className = '' }) => {
  return (
    <section className={`py-6 sm:py-8 lg:py-12 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
};

// Contenedor para formularios responsivos
export const ResponsiveForm = ({ children, className = '' }) => {
  return (
    <div className={`max-w-md mx-auto space-y-6 ${className}`}>
      {children}
    </div>
  );
};

// Botón responsivo
export const ResponsiveButton = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`w-full sm:w-auto px-4 py-2 text-sm sm:text-base rounded-lg transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Tarjeta responsiva
export const ResponsiveCard = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveLayout;