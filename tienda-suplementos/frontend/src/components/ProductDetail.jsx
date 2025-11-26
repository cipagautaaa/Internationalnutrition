import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import { useState, useMemo, useEffect } from 'react';

// Nueva página de detalle totalmente integrada con backend
// Características:
// - Fetch /products/:id
// - Selector de tamaños (variants + base)
// - Selector de sabores
// - Control de cantidad
// - Botones "Agregar al carrito" y "Comprar ahora"
// - Layout similar a e-commerce moderno (imagen grande izquierda, info derecha)

const pillBase = 'px-4 py-2 rounded-full text-sm font-medium border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';

export default function ProductDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { addToCart } = useCart();
	const { isAuthenticated, user } = useAuth();
	const isAdmin = isAuthenticated && user?.role === 'admin';

	const [product, setProduct] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedSizeId, setSelectedSizeId] = useState(null);
	const [selectedFlavor, setSelectedFlavor] = useState(null);
	const [quantity, setQuantity] = useState(1);

	useEffect(() => {
		let active = true;
		const fetchOne = async () => {
			try {
				setLoading(true); setError(null);
				const { data } = await axios.get(`/products/${id}`);
				if (!active) return;
				const prod = data.data || data.product || data;
				setProduct(prod);
				// Pre-selecciones
				// Tamaño base + variantes
				if (prod) {
					const variantCandidates = [];
					if (prod.size) {
						variantCandidates.push({ _id: 'BASE', inStock: prod.inStock !== false });
					}
					if (Array.isArray(prod.variants)) {
						prod.variants.forEach(v => {
							if (v && v.size) {
								variantCandidates.push({ _id: v._id, inStock: v.inStock !== false });
							}
						});
					}
					if (variantCandidates.length > 0) {
						const firstAvailable = variantCandidates.find(opt => opt.inStock !== false) || variantCandidates[0];
						setSelectedSizeId(firstAvailable ? String(firstAvailable._id) : null);
					} else {
						setSelectedSizeId(null);
					}
					if (Array.isArray(prod.flavors) && prod.flavors.length) {
						setSelectedFlavor(prod.flavors[0]);
					} else {
						setSelectedFlavor(null);
					}
					setQuantity(1);
				}
			} catch (e) {
				if (!active) return;
				setError(e.response?.data?.message || 'No se pudo cargar el producto');
			} finally {
				if (active) setLoading(false);
			}
		};
		fetchOne();
		return () => { active = false; };
	}, [id]);

	const sizeOptions = useMemo(() => {
		if (!product) return [];
		const opts = [];
		if (product.size) {
			opts.push({ _id: 'BASE', size: product.size, price: product.price, image: product.image, inStock: product.inStock !== false, __isBase: true });
		}
		if (Array.isArray(product.variants)) {
			product.variants.forEach(v => {
				if (v && v.size) {
					opts.push({ ...v, inStock: v.inStock !== false });
				}
			});
		}
		return opts;
	}, [product]);

	const flavors = useMemo(() => Array.isArray(product?.flavors) ? product.flavors : [], [product]);

	const selectedSize = useMemo(() => {
		if (!sizeOptions.length) return null;
		if (selectedSizeId === 'BASE') return sizeOptions.find(o => o._id === 'BASE');
		return sizeOptions.find(o => String(o._id) === String(selectedSizeId)) || sizeOptions[0];
	}, [sizeOptions, selectedSizeId]);

	const displayPrice = selectedSize ? selectedSize.price : product?.price;
	const displayImage = selectedSize && selectedSize.image ? selectedSize.image : product?.image;
	const variantAvailable = selectedSize ? selectedSize.inStock !== false : true;
	const canAdd = product && product.isActive !== false && product.inStock !== false && variantAvailable;

	const adjustQty = (delta) => {
		setQuantity(q => {
			let next = q + delta;
			if (next < 1) next = 1;
			return next;
		});
	};

	const handleAdd = () => {
		if (!canAdd) return;
		const item = {
			...product,
			price: displayPrice,
			image: displayImage,
			variantId: selectedSize && !selectedSize.__isBase ? selectedSize._id : null,
			size: selectedSize ? selectedSize.size : (product.size || null),
			flavor: selectedFlavor,
			quantity
		};
		addToCart(item);
	};

	const handleBuyNow = () => {
		handleAdd();
		navigate('/checkout');
	};

	if (loading) {
		return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Cargando producto...</div>;
	}
	if (error) {
		return <div className="min-h-screen flex items-center justify-center text-center p-6">
			<div>
				<p className="text-red-700 font-medium mb-3">{error}</p>
				<Link to="/products" className="text-indigo-600 underline text-sm">Volver</Link>
			</div>
		</div>;
	}
	if (!product) {
		return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">No encontrado</div>;
	}

	return (
		<div className="pt-24 sm:pt-28 pb-12 sm:pb-16 bg-white">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
					{/* Columna imágenes */}
					<div className="space-y-4">
						<div className="aspect-[4/5] sm:aspect-square w-full bg-gray-50 border rounded-xl flex items-center justify-center overflow-hidden">
							<img src={displayImage} alt={product.name} className="w-full h-full object-contain" />
						</div>
						{/* Miniaturas (placeholder futuro para múltiples imágenes) */}
						<div className="flex gap-3 overflow-x-auto pb-2">
							{displayImage && (
								<button className="border-2 border-indigo-500 rounded-lg p-1 bg-white h-20 w-20 flex items-center justify-center">
									<img src={displayImage} alt="thumb" className="object-contain max-h-full" />
								</button>
							)}
						</div>
					</div>

					{/* Columna info */}
					<div className="space-y-6">
						<div className="space-y-2">
							  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>
							<div className="flex items-center gap-2">
								<span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded">{product.category}</span>
								{product.rating > 0 && <span className="text-amber-600 text-xs font-medium">★ {product.rating.toFixed(1)}</span>}
							</div>
						</div>

						<div className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
							{product.description}
						</div>

						<div>
							<div className="flex items-baseline gap-3 mb-1">
								<span className="text-3xl font-bold text-gray-900">${displayPrice}</span>
								{product?.originalPrice && product.originalPrice > displayPrice && (
									<>
										<span className="text-base text-gray-400 line-through">${product.originalPrice}</span>
										<span className="text-sm font-semibold text-green-600">
											-{Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100)}%
										</span>
									</>
								)}
							</div>
							{selectedSize && !selectedSize.__isBase && product.size && (
								<p className="text-xs text-gray-500">Precio para tamaño {selectedSize.size}</p>
							)}
						</div>

						{/* Selector tamaños */}
						{sizeOptions.length > 0 && (
							<div className="space-y-2">
								<p className="text-xs font-medium tracking-wide text-gray-600">TAMAÑO</p>
								<div className="flex flex-wrap gap-2">
									{sizeOptions.map(o => {
										const active = (o._id === 'BASE' && selectedSizeId === 'BASE') || String(o._id) === String(selectedSizeId);
										const disabled = o.inStock === false;
										return (
											<button
												key={o._id}
												disabled={disabled}
												onClick={() => setSelectedSizeId(o._id)}
												className={`${pillBase} ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
											>
												{o.size}
											</button>
										);
									})}
								</div>
							</div>
						)}

						{/* Selector sabores */}
						{flavors.length > 0 && (
							<div className="space-y-2">
								<p className="text-xs font-medium tracking-wide text-gray-600">SABOR</p>
								<div className="flex flex-wrap gap-2">
									{flavors.map(f => {
										const active = f === selectedFlavor;
										return (
											<button
												key={f}
												onClick={() => setSelectedFlavor(f)}
												className={`${pillBase} ${active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'}`}
											>
												{f}
											</button>
										);
									})}
								</div>
							</div>
						)}

						{/* Cantidad */}
						{!isAdmin && (
							<div className="flex items-center gap-4">
								<div className="flex items-center border rounded-full overflow-hidden">
									<button onClick={() => adjustQty(-1)} className="w-10 h-10 flex items-center justify-center text-lg font-medium hover:bg-gray-100" aria-label="Disminuir">−</button>
									<div className="w-12 text-center font-semibold">{quantity}</div>
									<button onClick={() => adjustQty(1)} className="w-10 h-10 flex items-center justify-center text-lg font-medium hover:bg-gray-100" aria-label="Aumentar">+</button>
								</div>
							</div>
						)}

						{/* Botones acción - Ocultar si es admin */}
						{!isAdmin && (
							<div className="flex flex-col sm:flex-row gap-4 pt-2">
								<button
									onClick={handleAdd}
									disabled={!canAdd}
									className={`flex-1 h-12 rounded-full text-sm font-semibold tracking-wide transition shadow ${canAdd ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
								>
									Agregar al carrito
								</button>
								<button
									onClick={handleBuyNow}
									disabled={!canAdd}
									className={`flex-1 h-12 rounded-full text-sm font-semibold tracking-wide transition shadow ${canAdd ? 'bg-gray-900 hover:bg-black text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
								>
									Comprar ahora
								</button>
							</div>
						)}

						<div className="pt-4 border-t text-xs text-gray-500 leading-relaxed">
							<p>Ingredientes clave (placeholder): Proteína aislada de suero. Personaliza este bloque agregando campos en el modelo (ej: ingredients, highlights).</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

