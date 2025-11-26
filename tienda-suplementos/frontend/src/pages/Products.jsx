import { ResponsiveLayoutWithSidebar, ResponsiveSection, ResponsiveGrid } from '../components/ResponsiveLayout';
import ProductList from '../components/ProductList';
import { useLocation, useParams } from 'react-router-dom';
import { CATEGORY_META } from './categoryConfigs';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import FAQSection from '../components/FAQSection';
import { FAQ_DATA, mapCategoryToFAQGroup } from '../data/faqData';

// Mapeo de slugs a las categorías originales (rollback)
const CATEGORY_SLUG_MAP = {
	// Nueva taxonomía (visibles)
	proteinas: 'Proteínas',
	'proteinas-limpias': 'Proteínas Limpias',
	'proteinas-hipercaloricas': 'Proteínas Hipercalóricas',
	'pre-entrenos': 'Pre-entrenos y Quemadores',
	energia: 'Pre-entrenos y Quemadores',
	preworkout: 'Pre-Workout', // alias legacy al fusionado
	creatinas: 'Creatinas',
	creatina: 'Creatina', // legacy
	aminoacidos: 'Aminoácidos y Recuperadores',
	recuperadores: 'Aminoácidos y Recuperadores',
	salud: 'Salud y Bienestar',
	bienestar: 'Salud y Bienestar',
	comidas: 'Comidas con proteína',
	comida: 'Comida', // legacy
	// Aliases adicionales y compatibilidad
	proteina: 'Proteínas', // tolera singular
	'pre-workout': 'Pre-Workout', // legacy
	'pre-workouts': 'Pre-Workout', // legacy
	vitaminas: 'Vitaminas', // legacy
	otros: 'Otros' // legacy
};

// Mapeo a la taxonomía canónica del backend (evita discrepancias entre
// nombres para mostrar y los valores almacenados en la BD)
const BACKEND_CATEGORY_MAP = {
	'Proteínas': 'Proteínas',
	'Proteínas Limpias': 'Proteínas',
	'Proteínas Hipercalóricas': 'Proteínas',
	'Creatina': 'Creatinas',
	'Creatinas': 'Creatinas',
	'Pre-Workout': 'Pre-entrenos y Quemadores',
	'Pre-entrenos y Quemadores': 'Pre-entrenos y Quemadores',
	'Aminoácidos': 'Aminoácidos y Recuperadores',
	'Aminoácidos y Recuperadores': 'Aminoácidos y Recuperadores',
	'Vitaminas': 'Salud y Bienestar',
	'Salud y Bienestar': 'Salud y Bienestar',
	'Rendimiento hormonal': 'Salud y Bienestar',
	'Complementos': 'Salud y Bienestar',
	'Comidas con proteína': 'Comidas con proteína',
	'Comida': 'Comidas con proteína'
};

function useQuery() {
  const { search } = useLocation();
  return Object.fromEntries(new URLSearchParams(search));
}

export default function Products() {
	const query = useQuery();
	const { category: categoryParam } = useParams();
	// Prioridad simple: slug en ruta > query param ?category > alias legacy ?cat
	const categoryQuery = query.category || query.cat;
	let rawCategory = categoryParam || categoryQuery || undefined;

	let normalizedCategory;
	if (rawCategory) {
		const slug = decodeURIComponent(rawCategory).trim().toLowerCase();
		normalizedCategory = CATEGORY_SLUG_MAP[slug];
	}

  // category que usaremos para las llamadas a la API (coincidente con BD)
  const apiCategory = normalizedCategory ? (BACKEND_CATEGORY_MAP[normalizedCategory] || normalizedCategory) : undefined;

	const search = query.q || undefined;

	const meta = normalizedCategory ? CATEGORY_META[normalizedCategory] : undefined;

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero condicional basado en configuración de categoría */}
			{meta?.hero && (
				<section
					className="relative w-full bg-black z-0"
					style={{ height: meta.hero.height || 'calc(100vh - 36px)' }}
				>
					{meta.hero.type === 'image' && (
						<img src={meta.hero.src} alt={normalizedCategory} className="absolute inset-0 w-full h-full object-cover" />
					)}
					{meta.hero.overlay && <div className={`absolute inset-0 ${meta.hero.overlay}`} />}
				</section>
			)}

			<div className="pt-28 sm:pt-36 md:pt-40 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-10 sm:mb-12">
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{normalizedCategory || 'Todos los Productos'}</h1>
										<p className="mt-2 text-sm sm:text-base text-gray-600">{search ? `Resultados para "${search}"` : 'Explora nuestro catálogo completo'}</p>
				</div>
				{/* Pasamos apiCategory (valor canónico) para que la API reciba la taxonomía correcta,
				   y dejamos el título mostrado como `normalizedCategory` */}
				<ProductList category={apiCategory} search={search} />

					{/* FAQ al final de la página de categoría */}
					{normalizedCategory && <FAQMount normalizedCategory={normalizedCategory} />}
			</div>
		</div>
	);
}

		function FAQMount({ normalizedCategory }) {
			// En 'Proteínas' general mostramos dos secciones: Limpias + Hipercalóricas
			if (normalizedCategory === 'Proteínas') {
				const limpias = FAQ_DATA.proteinasLimpias;
				const hiper = FAQ_DATA.proteinasHipercaloricas;
				return (
					<div className="mt-12 space-y-12">
						{limpias?.items?.length > 0 && (
							<FAQSection title={limpias.title} items={limpias.items} />
						)}
						{hiper?.items?.length > 0 && (
							<FAQSection title={hiper.title} items={hiper.items} />
						)}
					</div>
				);
			}
			const groupKey = mapCategoryToFAQGroup(normalizedCategory);
			if (!groupKey) return null;
			const data = FAQ_DATA[groupKey];
			if (!data || !data.items || data.items.length === 0) return null;
			return (
				<div className="mt-12">
					<FAQSection title={data.title} items={data.items} />
				</div>
			);
		}

