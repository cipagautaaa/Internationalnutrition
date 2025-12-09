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

const pillBase = 'px-4 py-2 rounded-full text-sm font-medium border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700';
const gradientPanel = 'bg-white border border-gray-200 rounded-3xl shadow-lg';

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

	// Todas las siguientes variables dependen de product existente
	const detailHeader = (
		<div className="space-y-3">
			<div className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-[11px] tracking-[0.3em] uppercase text-red-700">
				<Sparkles className="w-4 h-4" />
				<span>Rendimiento premium</span>
			</div>
			<h1 className="text-3xl sm:text-4xl font-black leading-tight text-gray-900">{product.name}</h1>
			<div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gray-500">
				<span>{product.category}</span>
				{product.rating > 0 && <span className="text-amber-600">★ {product.rating.toFixed(1)}</span>}
			</div>
		</div>
	);

	const priceStack = (
		<div className="space-y-2">
			<div className="flex items-baseline gap-3">
				<span className="text-4xl font-black text-gray-900">${formatPrice(displayPrice || 0)}</span>
				{displayOriginalPrice && (
					<span className="text-base text-gray-400 line-through">${formatPrice(displayOriginalPrice)}</span>
				)}
			</div>
			{savings && (
				<p className="text-sm text-emerald-600 font-semibold">Ahorra ${formatPrice(savings)} pesos</p>
			)}
			{selectedSize && !selectedSize.__isBase && (
				<p className="text-xs text-gray-600">Precio aplicado para {selectedSize.size}</p>
			)}
			<p className="text-xs text-gray-600">Impuestos incluidos · Envío gratis desde $0</p>
		</div>
	);

	const sizeSelector = sizeOptions.length > 0 && (
		<div className="space-y-2">
			<p className="text-xs font-medium tracking-wide text-gray-600">TAMAÑO</p>
			<div className="flex flex-wrap gap-2">
				{sizeOptions.map((o) => {
					const active = (o._id === 'BASE' && selectedSizeId === 'BASE') || String(o._id) === String(selectedSizeId);
					const disabled = o.inStock === false;
					return (
						<button
							key={o._id}
							disabled={disabled}
							onClick={() => setSelectedSizeId(o._id)}
							className={`${pillBase} ${active ? 'bg-red-700 text-white border-red-700' : 'bg-white text-gray-700 border-gray-300 hover:border-red-700'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
						>
							{o.size}
						</button>
					);
				})}
			</div>
		</div>
	);

	const flavorSelector = flavors.length > 0 && (
		<div className="space-y-2">
			<p className="text-xs font-medium tracking-wide text-gray-600">SABOR</p>
			<div className="flex flex-wrap gap-2">
				{flavors.map((f) => {
					const active = f === selectedFlavor;
					return (
						<button
							key={f}
							onClick={() => setSelectedFlavor(f)}
							className={`${pillBase} ${active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'}`}
						>
							{f}
						</button>
					);
				})}
			</div>
		</div>
	);

	const quantitySelector = !isAdmin && (
		<div className="flex items-center gap-4">
			<div className="flex items-center rounded-full bg-white border border-gray-300 overflow-hidden">
				<button onClick={() => adjustQty(-1)} className="w-11 h-11 text-xl font-bold text-gray-700 hover:bg-gray-100" aria-label="Disminuir">−</button>
				<div className="w-14 text-center font-semibold text-gray-900">{quantity}</div>
				<button onClick={() => adjustQty(1)} className="w-11 h-11 text-xl font-bold text-gray-700 hover:bg-gray-100" aria-label="Aumentar">+</button>
			</div>
			<p className="text-xs text-gray-600">Cantidad</p>
		</div>
	);

	const actionButtons = !isAdmin && (
		<div className="flex flex-col sm:flex-row gap-4 pt-2">
			<button
				onClick={handleAdd}
				disabled={!canAdd}
				className={`flex-1 h-14 rounded-2xl text-sm font-black tracking-wide uppercase shadow-lg transition-all ${
					canAdd ? 'bg-red-700 text-white hover:bg-red-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
				}`}
			>
				Agregar al carrito — ${formatPrice(displayPrice || 0)}
			</button>
			<button
				onClick={handleBuyNow}
				disabled={!canAdd}
				className={`flex-1 h-14 rounded-2xl text-sm font-semibold uppercase border-2 border-gray-900 shadow-inner transition-all ${
					canAdd ? 'bg-white text-gray-900 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
				}`}
			>
				Comprar ahora
			</button>
		</div>
	);

	const renderInfoCards = (wrapperClass) => (
		<div className={wrapperClass}>
			<div className={`${gradientPanel} p-4 flex items-center justify-between`}>
				<div>
					<p className="text-xs text-gray-500">Entrega aproximada</p>
					<p className="text-sm font-semibold text-gray-900">Nov 29 - Dic 02</p>
				</div>
				<Clock className="w-5 h-5 text-gray-400" />
			</div>
			{infoRows.map((row) => (
				<div key={row.title} className={`${gradientPanel} p-4 flex items-center justify-between`}>
					<div>
						<p className="text-sm font-semibold text-gray-900">{row.title}</p>
						<p className="text-xs text-gray-600">{row.description}</p>
					</div>
					<row.icon className="w-5 h-5 text-gray-400" />
				</div>
			))}
		</div>
	);

	const descriptionPanel = (
		<div className={`${gradientPanel} p-5`}>
			<h3 className="text-sm font-semibold mb-2 text-gray-900">Ingredientes clave</h3>
			<p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
		</div>
	);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="lg:hidden">
				<div className="max-w-xl mx-auto px-4 pt-28 pb-32 space-y-6">
					<div className="rounded-[32px] border border-gray-200 bg-white shadow-xl overflow-hidden">
						<div className="bg-gradient-to-b from-gray-50 to-white px-6 py-10 flex items-center justify-center">
							<img src={displayImage} alt={product.name} className="max-h-[360px] object-contain drop-shadow-2xl" />
						</div>
						<div className="px-6 pb-6 space-y-4">
							<div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-gray-500">
								<span>{product.category}</span>
								<span>+1.500 envíos</span>
							</div>
							<h1 className="text-2xl font-black text-gray-900">{product.name}</h1>
							<div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
								{priceStack}
							</div>
						</div>
					</div>

					<div className="rounded-3xl bg-white border border-gray-200 p-5 space-y-5 shadow-lg">
						{sizeSelector}
						{flavorSelector}
						{quantitySelector}
					</div>

					{descriptionPanel}

					{renderInfoCards('space-y-3')}

					<div className="text-center text-xs text-gray-500">
						<p>¿Necesitas acompañamiento? Escríbenos al WhatsApp flotante para recibir asesoría personalizada.</p>
					</div>
				</div>
				{!isAdmin && (
					<div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3 space-y-3 shadow-[0_-10px_35px_rgba(0,0,0,0.08)]">
						<button
							onClick={handleAdd}
							disabled={!canAdd}
							className={`w-full h-12 rounded-2xl text-sm font-black uppercase tracking-wide ${
								canAdd ? 'bg-red-700 text-white' : 'bg-gray-200 text-gray-400'
							}`}
						>
							Agregar al carrito — ${formatPrice(displayPrice || 0)}
						</button>
						<button
							onClick={handleBuyNow}
							disabled={!canAdd}
							className={`w-full h-12 rounded-2xl text-sm font-semibold uppercase border-2 border-gray-900 ${
								canAdd ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-400'
							}`}
						>
							Comprar ahora
						</button>
					</div>
				)}
			</div>

			<div className="hidden lg:block">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
					<div className="mb-10 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.35em] text-gray-500">
						<span>{product.category}</span>
						<span>+1.500 envíos realizados en Colombia</span>
					</div>

					<div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-start">
						<div className="space-y-6">
							<div className={`${gradientPanel} p-6`}>
								<div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl h-[520px] flex items-center justify-center">
									<img src={displayImage} alt={product.name} className="max-h-full object-contain drop-shadow-2xl" />
								</div>
							</div>
							{descriptionPanel}
						</div>

						<div className="space-y-6">
							{detailHeader}
							{priceStack}
							{sizeSelector}
							{flavorSelector}
							{quantitySelector}
							{actionButtons}
							{renderInfoCards('grid gap-3')}
							<div className="text-center text-xs text-gray-500 pt-4">
								<p>¿Necesitas acompañamiento? Escríbenos al WhatsApp flotante para recibir asesoría personalizada.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

