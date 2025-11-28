import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import { useState, useMemo, useEffect } from 'react';
import { Truck, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';

// Nueva página de detalle totalmente integrada con backend
// Características:
// - Fetch /products/:id
// - Selector de tamaños (variants + base)
// - Selector de sabores
// - Control de cantidad
// - Botones "Agregar al carrito" y "Comprar ahora"
// - Layout similar a e-commerce moderno (imagen grande izquierda, info derecha)

const pillBase = 'px-4 py-2 rounded-full text-sm font-medium border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8B1A]';
const gradientPanel = 'bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-[0_20px_70px_rgba(3,4,16,0.65)]';

const infoRows = [
	{
		title: '¿Cuánto tarda el envío?',
		description: 'Envíos nacionales entre 24 y 72 horas hábiles.',
		icon: Truck,
	},
	{
		title: '¿Listos para consumir?',
		description: 'Incluimos guía express y recomendación de consumo.',
		icon: Sparkles,
	},
	{
		title: 'Garantía y autenticidad',
		description: 'Sellos intactos, soporte por WhatsApp y seguimiento.',
		icon: ShieldCheck,
	},
];

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
	const displayOriginalPrice = selectedSize?.originalPrice ?? product?.originalPrice;
	const discountPercentage = displayOriginalPrice && displayOriginalPrice > displayPrice
		? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
		: null;
	const savings = displayOriginalPrice && displayOriginalPrice > displayPrice
		? displayOriginalPrice - displayPrice
		: null;
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
		<div className="min-h-screen bg-[#050507] text-white">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
				<div className="mb-10 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.35em] text-white/60">
					<span>{product.category}</span>
					<span>+1.500 envíos realizados en Colombia</span>
				</div>

				<div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-start">
					<div className="space-y-6">
						<div className={`${gradientPanel} p-6`}>
							<div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl h-[520px] flex items-center justify-center">
								<img src={displayImage} alt={product.name} className="max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.45)]" />
							</div>
						</div>
						<div className={`${gradientPanel} p-5`}>
							<h3 className="text-sm font-semibold mb-2">Ingredientes clave</h3>
							<p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{product.description}</p>
						</div>
					</div>

					<div className="space-y-6">
						<div className="space-y-3">
							<div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] tracking-[0.3em] uppercase text-white/70">
								<Sparkles className="w-4 h-4" />
								<span>Rendimiento premium</span>
							</div>
							<h1 className="text-3xl sm:text-4xl font-black leading-tight">{product.name}</h1>
							<div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
								<span>{product.category}</span>
								{product.rating > 0 && <span>★ {product.rating.toFixed(1)}</span>}
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex items-baseline gap-3">
								<span className="text-4xl font-black text-white">${formatPrice(displayPrice || 0)}</span>
								{displayOriginalPrice && (
									<span className="text-base text-white/40 line-through">${formatPrice(displayOriginalPrice)}</span>
								)}
							</div>
							{savings && (
								<p className="text-sm text-emerald-300 font-semibold">Ahorra ${formatPrice(savings)} pesos</p>
							)}
							{selectedSize && !selectedSize.__isBase && (
								<p className="text-xs text-white/60">Precio aplicado para {selectedSize.size}</p>
							)}
							<p className="text-xs text-white/60">Impuestos incluidos · Envío gratis desde $0</p>
						</div>

						{sizeOptions.length > 0 && (
							<div className="space-y-2">
								<p className="text-xs font-medium tracking-wide text-white/60">TAMAÑO</p>
								<div className="flex flex-wrap gap-2">
									{sizeOptions.map((o) => {
										const active = (o._id === 'BASE' && selectedSizeId === 'BASE') || String(o._id) === String(selectedSizeId);
										const disabled = o.inStock === false;
										return (
											<button
												key={o._id}
												disabled={disabled}
												onClick={() => setSelectedSizeId(o._id)}
												className={`${pillBase} ${active ? 'bg-[#FF8B1A] text-black border-transparent' : 'bg-white/5 text-white border-white/10 hover:border-white/30'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
											>
												{o.size}
											</button>
										);
									})}
								</div>
							</div>
						)}

						{flavors.length > 0 && (
							<div className="space-y-2">
								<p className="text-xs font-medium tracking-wide text-white/60">SABOR</p>
								<div className="flex flex-wrap gap-2">
									{flavors.map((f) => {
										const active = f === selectedFlavor;
										return (
											<button
												key={f}
												onClick={() => setSelectedFlavor(f)}
												className={`${pillBase} ${active ? 'bg-white text-black border-white' : 'bg-white/5 text-white border-white/10 hover:border-white/30'}`}
											>
												{f}
											</button>
										);
									})}
								</div>
							</div>
						)}

						{!isAdmin && (
							<div className="flex items-center gap-4">
								<div className="flex items-center rounded-full bg-white/5 border border-white/10 overflow-hidden">
									<button onClick={() => adjustQty(-1)} className="w-11 h-11 text-xl font-bold hover:bg-white/5" aria-label="Disminuir">−</button>
									<div className="w-14 text-center font-semibold">{quantity}</div>
									<button onClick={() => adjustQty(1)} className="w-11 h-11 text-xl font-bold hover:bg-white/5" aria-label="Aumentar">+</button>
								</div>
								<p className="text-xs text-white/60">Cantidad</p>
							</div>
						)}

						{!isAdmin && (
							<div className="flex flex-col sm:flex-row gap-4 pt-2">
								<button
									onClick={handleAdd}
									disabled={!canAdd}
									className={`flex-1 h-14 rounded-2xl text-sm font-black tracking-wide uppercase shadow-lg transition-all ${
										canAdd ? 'bg-[#FF8B1A] text-black hover:translate-y-[1px]' : 'bg-white/10 text-white/40 cursor-not-allowed'
									}`}
								>
									Agregar al carrito — ${formatPrice(displayPrice || 0)}
								</button>
								<button
									onClick={handleBuyNow}
									disabled={!canAdd}
									className={`flex-1 h-14 rounded-2xl text-sm font-semibold uppercase border border-white/40 shadow-inner transition-all ${
										canAdd ? 'bg-white text-black hover:bg-white/90' : 'bg-white/5 text-white/40 cursor-not-allowed'
									}`}
								>
									Comprar ahora
								</button>
							</div>
						)}

						<div className="grid gap-3">
							<div className={`${gradientPanel} p-4 flex items-center justify-between`}>
								<div>
									<p className="text-xs text-white/50">Entrega aproximada</p>
									<p className="text-sm font-semibold">Nov 29 - Dic 02</p>
								</div>
								<Clock className="w-5 h-5 text-white/60" />
							</div>
							{infoRows.map((row) => (
								<div key={row.title} className={`${gradientPanel} p-4 flex items-center justify-between`}>
									<div>
										<p className="text-sm font-semibold">{row.title}</p>
										<p className="text-xs text-white/60">{row.description}</p>
									</div>
									<row.icon className="w-5 h-5 text-white/60" />
								</div>
							))}
						</div>

						<div className="text-center text-xs text-white/40 pt-4">
							<p>¿Necesitas acompañamiento? Escríbenos al WhatsApp flotante para recibir asesoría personalizada.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

