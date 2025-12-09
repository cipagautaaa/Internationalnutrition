import ProductList from '../../components/ProductList';
import FAQSection from '../../components/FAQSection';
import { FAQ_DATA } from '../../data/faqData';
// Importa desde pages/categoryConfigs.js (al mismo nivel de pages/)
import { CATEGORY_META } from '../categoryConfigs';

// title: nombre mostrado en UI
// apiCategory: nombre canónico que existe en BD para filtrar en la API
export default function CategoryPageBase({ title, apiCategory }) {
  const meta = title && CATEGORY_META ? CATEGORY_META[title] : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero condicional si existe configuración */}
      {meta && meta.hero ? (
        <section
          className="relative w-full bg-black z-0"
          style={{ height: meta.hero.height || 'calc(100vh - 36px)' }}
        >
          {meta.hero.type === 'image' && meta.hero.src && (
            <img
              src={meta.hero.src}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {meta.hero.overlay ? (
            <div className={`absolute inset-0 ${meta.hero.overlay}`} />
          ) : null}
          
          {/* Texto superpuesto */}
          <div className="absolute inset-0 flex items-center justify-center text-white text-center z-10">
            <div className="px-4">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">{title}</h1>
              <p className="text-xl md:text-2xl max-w-2xl mx-auto">
                Explora nuestro catálogo de {title?.toLowerCase?.()}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* Contenido principal */}
      <div className="pt-36 md:pt-40 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-gray-600">Explora nuestro catálogo de {title?.toLowerCase?.()}</p>
        </div>
        <ProductList category={apiCategory || title} />
        <LegacyCategoryFAQ title={title} />
      </div>
    </div>
  );
}

function mapTitleToFAQGroup(title) {
  if (!title) return null;
  switch (title) {
    case 'Alimentacion saludable y alta en proteina':
    case 'Comida':
    case 'Comidas con proteína':
      return 'comidasProteina';
    default:
      return null;
  }
}

function LegacyCategoryFAQ({ title }) {
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
