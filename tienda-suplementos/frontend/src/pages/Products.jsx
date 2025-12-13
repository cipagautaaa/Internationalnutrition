import { ResponsiveLayoutWithSidebar, ResponsiveSection, ResponsiveGrid } from '../components/ResponsiveLayout';
import ProductList from '../components/ProductList';
import ProductCard from '../components/ProductCard';
import ImplementCard from '../components/ImplementCard';
import { useLocation, useParams } from 'react-router-dom';
import { CATEGORY_META } from './categoryConfigs';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import FAQSection from '../components/FAQSection';
import { FAQ_DATA, mapCategoryToFAQGroup } from '../data/faqData';
import api from '../services/api';

// Mapeo de slugs a las categorías originales (rollback)
const CATEGORY_SLUG_MAP = {
	// Nueva taxonomía (visibles)
	proteinas: 'Proteínas',
	'proteinas-limpias': 'Proteínas Limpias',
	'proteinas-hipercaloricas': 'Proteínas Hipercalóricas',
	'pre-entrenos': 'Pre-entrenos y Energía',
	energia: 'Pre-entrenos y Energía',
	preworkout: 'Pre-entrenos y Energía', // Mapeo directo a BD
	creatinas: 'Creatinas',
	creatina: 'Creatina', // legacy
	aminoacidos: 'Aminoácidos y Recuperadores',
	recuperadores: 'Aminoácidos y Recuperadores',
	salud: 'Salud y Bienestar',
	bienestar: 'Salud y Bienestar',
	comidas: 'Alimentacion saludable y alta en proteina',
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
	'Pre-Workout': 'Pre-entrenos y Energía',
	'Pre-entrenos y Quemadores': 'Pre-entrenos y Energía',
	'Pre-entrenos y Energía': 'Pre-entrenos y Energía',
	'Aminoácidos': 'Aminoácidos y Recuperadores',
	'Aminoácidos y Recuperadores': 'Aminoácidos y Recuperadores',
	'Vitaminas': 'Salud y Bienestar',
	'Salud y Bienestar': 'Salud y Bienestar',
	'Rendimiento hormonal': 'Salud y Bienestar',
	'Complementos': 'Salud y Bienestar',
	'Alimentacion saludable y alta en proteina': 'Alimentacion saludable y alta en proteina',
	'Comida': 'Alimentacion saludable y alta en proteina'
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
		console.log('🔍 Products.jsx - slug:', slug, '→ normalizedCategory:', normalizedCategory);
	}

  // category que usaremos para las llamadas a la API (coincidente con BD)
  const apiCategory = normalizedCategory ? (BACKEND_CATEGORY_MAP[normalizedCategory] || normalizedCategory) : undefined;
  console.log('🎯 Products.jsx - apiCategory final:', apiCategory);

	const search = query.q || undefined;

	const meta = normalizedCategory ? CATEGORY_META[normalizedCategory] : undefined;
	const showAllCatalog = !normalizedCategory && !search;

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
				{/* Si no hay categoría ni búsqueda, mostramos TODO el catálogo por secciones (suplementos + Wargo + combos) */}
				{showAllCatalog ? (
					<AllCatalogSections />
				) : (
					<>
						{/* Pasamos apiCategory (valor canónico) para que la API reciba la taxonomía correcta,
						   y dejamos el título mostrado como `normalizedCategory` */}
						<ProductList category={apiCategory} search={search} />

						{/* FAQ al final de la página de categoría */}
						{normalizedCategory && <FAQMount normalizedCategory={normalizedCategory} />}
					</>
				)}
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

		// Catálogo completo (todas las categorías de suplementos + Wargo + combos)
		const SUPPLEMENT_ORDER = [
			'Proteínas',
			'Pre-entrenos y Quemadores',
			'Creatinas',
			'Aminoácidos y Recuperadores',
			'Salud y Bienestar',
			'Alimentacion saludable y alta en proteina'
		];

		function AllCatalogSections() {
			const [supplements, setSupplements] = useState([]);
			const [implementsList, setImplementsList] = useState([]);
			const [combos, setCombos] = useState([]);
			const [loading, setLoading] = useState(true);
			const [error, setError] = useState('');

			useEffect(() => {
				let cancelled = false;
				const fetchAll = async () => {
					setLoading(true);
					setError('');
					try {
						const [prodRes, implRes, comboRes] = await Promise.all([
							api.get('/products', { params: { limit: 2000, includeInactive: false } }),
							api.get('/implements'),
							api.get('/combos')
						]);

						if (cancelled) return;

						const prodData = Array.isArray(prodRes.data?.data) ? prodRes.data.data : [];
						setSupplements(prodData.map(p => ({ id: p._id, ...p })).filter(Boolean));

						const implData = implRes.data?.data ?? implRes.data ?? [];
						setImplementsList(Array.isArray(implData) ? implData : []);

						const comboRaw = comboRes.data?.data ?? comboRes.data ?? [];
						const comboData = Array.isArray(comboRaw) ? comboRaw : [];
						setCombos(comboData.map(c => ({ ...c, id: c._id || c.id, category: c.category || 'Combo' }))); 
					} catch (e) {
						if (!cancelled) setError('No pudimos cargar el catálogo completo.');
					} finally {
						if (!cancelled) setLoading(false);
					}
				};

				fetchAll();
				return () => {
					cancelled = true;
				};
			}, []);

			const groupedSupplements = useMemo(() => {
				const buckets = new Map();
				supplements.forEach(p => {
					const cat = p.category || 'Sin categoría';
					if (!buckets.has(cat)) buckets.set(cat, []);
					buckets.get(cat).push(p);
				});
				const ordered = SUPPLEMENT_ORDER.filter(cat => buckets.has(cat)).map(cat => [cat, buckets.get(cat)]);
				const rest = Array.from(buckets.entries())
					.filter(([cat]) => !SUPPLEMENT_ORDER.includes(cat))
					.sort((a, b) => a[0].localeCompare(b[0]));
				return [...ordered, ...rest];
			}, [supplements]);

			const groupedCombos = useMemo(() => {
				const buckets = new Map();
				combos.forEach(c => {
					const cat = c.category || 'Combos';
					if (!buckets.has(cat)) buckets.set(cat, []);
					buckets.get(cat).push(c);
				});
				const order = ['Volumen', 'Definición', 'Combos'];
				const ordered = order.filter(cat => buckets.has(cat)).map(cat => [cat, buckets.get(cat)]);
				const rest = Array.from(buckets.entries())
					.filter(([cat]) => !order.includes(cat))
					.sort((a, b) => a[0].localeCompare(b[0]));
				return [...ordered, ...rest];
			}, [combos]);

			if (loading) return <p className="text-gray-400 text-center">Cargando catálogo completo...</p>;
			if (error) return <p className="text-red-700 text-center">{error}</p>;

			return (
				<div className="space-y-14">
					{/* Suplementos */}
					<section className="space-y-10">
						{groupedSupplements.map(([cat, items]) => (
							<div key={cat} className="space-y-4">
								<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">{cat}</h2>
								<div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5 lg:gap-6">
									{items.filter(Boolean).map(product => (
										<ProductCard key={product.id || product._id} product={product} />
									))}
								</div>
							</div>
						))}
					</section>

					{/* Wargo y accesorios */}
					<section className="space-y-4">
						<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">Wargo y accesorios para gym</h2>
						{implementsList.length === 0 ? (
							<p className="text-gray-500">No hay Wargo y accesorios disponibles.</p>
						) : (
							<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{implementsList.filter(Boolean).map(item => (
									<ImplementCard key={item.id || item._id} implement={item} />
								))}
							</div>
						)}
					</section>

					{/* Combos */}
					<section className="space-y-8">
						<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">Combos</h2>
						{groupedCombos.map(([cat, items]) => (
							<div key={cat} className="space-y-4">
								<p className="text-lg font-semibold text-gray-800">{cat}</p>
								<div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5 lg:gap-6">
									{items.filter(Boolean).map(combo => (
										<ProductCard key={combo.id || combo._id} product={combo} isCombo />
									))}
								</div>
							</div>
						))}
					</section>
				</div>
			);
		}

