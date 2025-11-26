import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';

const AdminCatalogView = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: 'Proteínas',
      path: '/admin/products?category=Proteínas',
      count: 5,
      icon: '🥤',
      color: 'bg-red-700 border-red-700'
    },
    {
      name: 'Pre-entrenos y Quemadores',
      path: '/admin/products?category=Pre-entrenos y Quemadores',
      count: 1,
      icon: '⚡',
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      name: 'Creatinas',
      path: '/admin/products?category=Creatinas',
      count: 3,
      icon: '💪',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      name: 'Aminoácidos y Recuperadores',
      path: '/admin/products?category=Aminoácidos y Recuperadores',
      count: 1,
      icon: '🧪',
      color: 'bg-green-50 border-green-200'
    },
    {
      name: 'Salud y Bienestar',
      path: '/admin/products?category=Salud y Bienestar',
      count: 2,
      icon: '❤️',
      color: 'bg-pink-50 border-pink-200'
    },
    {
      name: 'Comidas con proteína',
      path: '/admin/products?category=Comidas con proteína',
      count: 0,
      icon: '🍽️',
      color: 'bg-orange-50 border-orange-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 md:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con estilo del nuevo diseño */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <button
            onClick={() => navigate('/admin/products')}
            className="text-sm text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={18} />
            Volver al Panel
          </button>
          
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-red-700 tracking-wide uppercase">Panel de Categorías</p>
            <h1 className="text-3xl font-bold text-gray-900">Gestiona el catálogo por categorías</h1>
            <p className="text-gray-600">Selecciona una categoría para gestionar sus productos.</p>
          </div>
        </div>

        {/* Categories Grid con nuevo estilo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <button
              key={category.path}
              onClick={() => navigate(category.path)}
              className={`${category.color} border-2 rounded-xl p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-red-7000`}
            >
              <div className="flex flex-col space-y-4">
                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full text-3xl shadow-sm">
                  {category.icon}
                </div>

                {/* Category Info */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {category.count} {category.count === 1 ? 'producto' : 'productos'}
                  </p>
                </div>

                {/* Stock Indicator */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${category.count > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs font-medium text-gray-700">
                    {category.count}
                  </span>
                </div>

                {/* Action Link */}
                <div className="mt-auto">
                  <span className="text-red-700 hover:text-red-700 font-semibold text-sm flex items-center gap-1">
                    Ver Productos
                    <span>→</span>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminCatalogView;
