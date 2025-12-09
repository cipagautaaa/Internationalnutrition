import { useEffect } from 'react';
import ProductList from '../../components/ProductList';
import FAQSection from '../../components/FAQSection';
import { FAQ_DATA } from '../../data/faqData';

const CategoryPageBase = ({ 
  title, 
  apiCategory, 
  hero, 
  description,
  pageTitle,
  showVariants = false,
  children 
}) => {
  
  // SEO: Cambiar el título de la página
  useEffect(() => {
    if (pageTitle) {
      document.title = pageTitle;
    }
    return () => {
      document.title = 'Tienda Suplementos'; // título por defecto
    };
  }, [pageTitle]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero personalizable */}
      {hero && (
        <section
          className="relative w-full bg-black z-0"
          style={{ height: hero.height || 'calc(100vh - 36px)' }}
        >
          {hero.type === 'image' && hero.src && (
            <img 
              src={hero.src} 
              alt={title} 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          )}
          {hero.overlay && (
            <div className={`absolute inset-0 ${hero.overlay}`} />
          )}
          
          {/* Contenido superpuesto en el hero */}
          {hero.content && (
            <div className="relative z-10 flex items-center justify-center h-full">
              <div className="text-center text-white px-4">
                {hero.content}
              </div>
            </div>
          )}
        </section>
      )}

      <div className={`pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${hero ? 'pt-10 sm:pt-12' : 'pt-28 sm:pt-36 md:pt-40'}`}>
        {/* Título y descripción */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{title}</h1>
          {description && (
            <div className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              {description}
            </div>
          )}
        </div>

        {/* Contenido personalizable antes de los productos */}
        {children}

        {/* Lista de productos filtrada por categoría */}
        <ProductList category={apiCategory} showVariants={showVariants} />

        {/* Sección de Preguntas Frecuentes */}
        <CategoryFAQ title={title} />
      </div>
    </div>
  );
};

export default CategoryPageBase;

// Determina grupo FAQ basado en título de página
function mapTitleToFAQGroup(title) {
  if (!title) return null;
  switch (title) {
    case 'Proteínas Limpias':
      return 'proteinasLimpias';
    case 'Proteínas Hipercalóricas':
      return 'proteinasHipercaloricas';
    case 'Creatina':
    case 'Creatinas':
      return 'creatina';
    case 'Pre-entrenos y Quemadores':
    case 'Pre-entrenos y Energía':
    case 'Pre-Workout':
      return 'preEntrenosQuemadores';
    case 'Aminoácidos':
    case 'Aminoácidos y Recuperadores':
      return 'aminoacidos';
    case 'Alimentacion saludable y alta en proteina':
    case 'Comida':
      return 'comidasProteina';
    case 'Salud y Bienestar':
    case 'Vitaminas':
    case 'Rendimiento hormonal':
    case 'Complementos':
      return 'saludBienestar';
    default:
      return null;
  }
}

function CategoryFAQ({ title }) {
  // Caso especial: página general de Proteínas muestra ambos grupos
  if (title === 'Proteínas') {
    // Combinar ambas listas en una sola sección extensa
    const limpias = FAQ_DATA.proteinasLimpias?.items || [];
    const hiper = FAQ_DATA.proteinasHipercaloricas?.items || [];
    const combined = [...limpias, ...hiper];
    return (
      <div className="mt-16">
        <FAQSection title="Preguntas Frecuentes sobre Proteínas (Limpias e Hipercalóricas)" items={combined} />
      </div>
    );
  }
  const groupKey = mapTitleToFAQGroup(title);
  if (!groupKey) return null;
  const data = FAQ_DATA[groupKey];
  if (!data || !data.items || data.items.length === 0) return null;
  return (
    <div className="mt-16">
      <FAQSection title={data.title} items={data.items} />
    </div>
  );
}