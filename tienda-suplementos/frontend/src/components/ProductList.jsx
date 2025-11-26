import ProductCard from './ProductCard';
import CategoryTypeTabs from './CategoryTypeTabs';
import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';

// Props opcionales: category, search, showVariants (si true expande cada variante como tarjeta independiente)
const ProductList = ({ category, search, showVariants = false }) => {
	const [products, setProducts] = useState([]);
	const [filteredProducts, setFilteredProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	// Determinar si esta categoría usa pestañas de tipo/subcategoría
	const proteinCategories = ['Proteínas', 'Proteinas', 'Proteina'];
	const creatineCategories = ['Creatina', 'Creatinas'];
	const preworkoutCategories = ['Pre-entrenos y Quemadores'];
	const healthWellnessCategories = ['Salud y Bienestar'];
	const showTypeTabs = proteinCategories.includes(category) || creatineCategories.includes(category) || preworkoutCategories.includes(category) || healthWellnessCategories.includes(category);

	// Importante: TODOS los hooks deben llamarse en el mismo orden en cada render
	// Calculamos displayProducts con useMemo ANTES de cualquier return condicional
	const displayProducts = useMemo(
		() => (showTypeTabs ? filteredProducts : products),
		[showTypeTabs, filteredProducts, products]
	);

	useEffect(() => {
		let cancelled = false;
		const fetchProducts = async () => {
			setLoading(true);
			setError('');
			try {
				const params = {};
				if (category) {
					params.category = category;
					params.limit = 200; // ampliar límite al filtrar por categoría
				}
				if (search) params.search = search;
				const res = await api.get('/products', { params });
				if (!cancelled) {
					const serverData = Array.isArray(res.data?.data) ? res.data.data : [];
					const aggregated = serverData.filter(Boolean).map(p => ({ id: p._id, ...p }));
					let expanded = aggregated;
					if (showVariants) {
						const variantCards = [];
						for (const base of aggregated) {
							variantCards.push(base);
							if (Array.isArray(base.variants)) {
								for (const v of base.variants) {
									variantCards.push({
										id: v._id || `${base.id}-v-${v.size}`,
										_variantParentId: base.id,
										name: base.name + (v.size ? ` ${v.size}` : ''),
										category: base.category,
										tipo: base.tipo,
										price: v.price,
										originalPrice: v.originalPrice,
										size: v.size,
										image: v.image || base.image,
										inStock: v.inStock !== false,
										variants: [],
									});
								}
							}
						}
						expanded = variantCards;
					}
					setProducts((expanded || []).filter(Boolean));
					if (category !== 'Proteínas' && category !== 'Creatina' && category !== 'Creatinas' && category !== 'Pre-entrenos y Quemadores' && category !== 'Salud y Bienestar') {
						setFilteredProducts((expanded || []).filter(Boolean));
					}
				}
			} catch (e) {
				if (!cancelled) setError('Error cargando productos');
			} finally {
				if (!cancelled) setLoading(false);
			}
		};
		fetchProducts();
		return () => { cancelled = true; };
	}, [category, search, showVariants]);

	// Salidas tempranas (después de definir todos los hooks)
	if (loading) return <p className="text-gray-400">Cargando productos...</p>;
	if (error) return <p className="text-red-7000">{error}</p>;
	if (!products.length) return <p className="text-gray-400">No hay productos.</p>;

	// Separar proteínas limpias y veganas para mostrar con divisor
	const isProteinsCategory = proteinCategories.includes(category);
	const shouldSeparateVegan = isProteinsCategory && filteredProducts.some(p => {
		const tipo = p.tipo || p.productType || p.type || '';
		return tipo.toLowerCase().includes('vegan');
	});

	const limpias = shouldSeparateVegan ? displayProducts.filter(p => {
		const tipo = p.tipo || p.productType || p.type || '';
		return !tipo.toLowerCase().includes('vegan');
	}) : [];

	const veganas = shouldSeparateVegan ? displayProducts.filter(p => {
		const tipo = p.tipo || p.productType || p.type || '';
		return tipo.toLowerCase().includes('vegan');
	}) : [];

	return (
		<div className="w-full">
			{showTypeTabs && (
				<CategoryTypeTabs
					category={category}
					products={products}
					onFilteredProducts={setFilteredProducts}
				/>
			)}
			{displayProducts.length === 0 ? (
				<p className="text-gray-400 text-center py-8">No hay productos de este tipo.</p>
			) : shouldSeparateVegan ? (
				<>
					{/* Sección de Proteínas Limpias */}
					{limpias.length > 0 && (
										<div className="mb-12">
											<div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5 lg:gap-6">
								{limpias.filter(Boolean).map(product => (
									<ProductCard key={product.id || product._id} product={product} />
								))}
							</div>
						</div>
					)}

					{/* Separador Visual para Proteínas Veganas */}
					{veganas.length > 0 && (
						<>
							<div id="vegan-proteins-section" className="mb-12 mt-16 scroll-mt-32">
								<div className="text-center py-8 bg-gradient-to-r from-red-50 via-white to-red-50 rounded-2xl shadow-lg">
									<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
										¿Deseas algo diferente?
									</h2>
									<p className="text-xl text-gray-700 font-medium">
										Escoge <span className="text-red-700 font-bold">Vegana</span>
									</p>
									<div className="mt-4 flex items-center justify-center gap-4">
										<div className="h-1 bg-gradient-to-r from-transparent via-red-700 to-red-700 w-24 rounded-full"></div>
										<span className="text-4xl">🌱</span>
										<div className="h-1 bg-gradient-to-l from-transparent via-red-700 to-red-700 w-24 rounded-full"></div>
									</div>
								</div>
							</div>
											<div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5 lg:gap-6">
								{veganas.filter(Boolean).map(product => (
									<ProductCard key={product.id || product._id} product={product} />
								))}
							</div>
						</>
					)}
				</>
			) : (
								<div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5 lg:gap-6">
					{displayProducts.filter(Boolean).map(product => (
						<ProductCard key={product.id || product._id} product={product} />
					))}
				</div>
			)}
		</div>
	);
};

export default ProductList;

