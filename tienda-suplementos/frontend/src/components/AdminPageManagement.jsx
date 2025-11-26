import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Dumbbell, TrendingUp, Activity, Package } from 'lucide-react';

const AdminPageManagement = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Catálogo',
      icon: Package,
      description: 'Gestionar categorías de productos',
      path: '/admin/catalog',
    },
    {
      title: 'Accesorios',
      icon: Dumbbell,
      description: 'Gestionar accesorios y subcategorías',
      path: '/admin/accessories',
    },
    {
      title: 'Combos',
      icon: TrendingUp,
      description: 'Ver combos de volumen y definición',
      path: '/admin/combos',
      subcategories: [
        { name: 'Volumen', path: '/admin/combos/volumen' },
        { name: 'Definición', path: '/admin/combos/definición' }
      ]
    },
    {
      title: 'Inicio',
      icon: ShoppingBag,
      description: 'Ir a la página de inicio',
      path: '/',
    }
  ];

  return (
    <div className="container mx-auto px-6 py-8 mt-8">
      <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Administración de Página</h2>
        <p className="text-gray-600">Navega por las diferentes secciones de la tienda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          
          if (section.subcategories) {
            // Tarjeta con subcategorías (Combos)
            return (
              <div
                key={section.path}
                className="bg-white border-2 border-gray-200 rounded-lg p-6 transition-all duration-200 hover:border-red-700 hover:shadow-lg"
              >
              <div className="flex flex-col space-y-4">
                <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
                  <Icon size={24} className="text-red-700" />
                </div>                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {section.description}
                    </p>
                  </div>

                  {/* Subcategorías */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                    {section.subcategories.map((sub) => (
                      <button
                        key={sub.path}
                        onClick={() => navigate(sub.path)}
                        className="flex items-center justify-between text-sm font-medium text-red-700 hover:text-red-700 transition-colors p-2 rounded hover:bg-red-700"
                      >
                        <span>Administrar {sub.name}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          }
          
          // Tarjeta normal sin subcategorías
          return (
            <button
              key={section.path}
              onClick={() => navigate(section.path)}
              className="group bg-white border-2 border-gray-200 rounded-lg p-6 text-left transition-all duration-200 hover:border-red-700 hover:shadow-lg"
            >
              <div className="flex flex-col space-y-4">
                <div className="w-12 h-12 rounded-lg bg-red-50 group-hover:bg-red-700 flex items-center justify-center transition-colors">
                  <Icon size={24} className="text-red-700 group-hover:text-white transition-colors" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-red-700 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {section.description}
                  </p>
                </div>

                <div className="flex items-center text-red-700 font-semibold text-sm pt-2 border-t border-gray-100 group-hover:text-red-700 transition-colors">
                  <span>Administrar</span>
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPageManagement;
