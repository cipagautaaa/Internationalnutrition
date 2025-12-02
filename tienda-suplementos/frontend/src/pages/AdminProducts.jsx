import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import ProductForm from '../components/admin/ProductForm';
import AdminPageManagement from '../components/AdminPageManagement';
import ImplementsPanel from '../components/admin/ImplementsPanel';

// Taxonomía 2025 (7 categorías, nombres de visualización)
const ALL_CATEGORIES = [
  'proteínas',
  'Pre-entrenos y Quemadores',
  'Creatinas',
  'Aminoácidos y Recuperadores',
  'Salud y Bienestar',
  'Comidas con proteína',
  'Implementos'
];

// Normalización de categorías del backend (legacy -> nuevas visibles)
const normalizeCategory = (raw) => {
  const c = (raw || '').trim();
  const map = {
    // Legacy principales
    'Pre-Workout': 'Pre-entrenos y Quemadores',
    'Pre-entrenos y Energía': 'Pre-entrenos y Quemadores',
    'Aminoácidos': 'Aminoácidos y Recuperadores',
    'Vitaminas': 'Salud y Bienestar',
    'Para la salud': 'Salud y Bienestar',
    'Comida': 'Comidas con proteína',
    'Creatina': 'Creatinas',
    // Ya nuevas (case-insensitive)
    'proteínas': 'proteínas',
    'Proteínas': 'proteínas',
    'PROTEÍNAS': 'proteínas',
    'Pre-entrenos y Quemadores': 'Pre-entrenos y Quemadores',
    'Pre-entrenos y quemadores': 'Pre-entrenos y Quemadores',
    'Creatinas': 'Creatinas',
    'creatinas': 'Creatinas',
    'Aminoácidos y Recuperadores': 'Aminoácidos y Recuperadores',
    'Aminoácidos y recuperadores': 'Aminoácidos y Recuperadores',
    'Salud y Bienestar': 'Salud y Bienestar',
    'Salud y bienestar': 'Salud y Bienestar',
    'Comidas con proteína': 'Comidas con proteína',
    'Comidas con Proteína': 'Comidas con proteína',
    'Implementos': 'Implementos',
    'implementos': 'Implementos',
  };
  return map[c] || c || 'Sin categoría';
};

// Normaliza strings quitando acentos y respetando solo minúsculas para comparaciones consistentes
const normalizeText = (value) => {
  if (value === undefined || value === null) return '';
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

const HEALTH_TYPES = ['Multivitamínicos', 'Precursores de testosterona', 'Suplementos para la salud'];
const HEALTH_CATEGORY_KEYS = ['Salud y Bienestar', 'salud y bienestar', 'Vitaminas', 'Para la salud', 'Complementos', 'Rendimiento hormonal'];
const HEALTH_TESTO_TERMS = ['testo', 'tribu', 'zma', 'andro', 'mascul', 'alpha', 'booster'];
const HEALTH_MULTIVIT_TERMS = ['multivit', 'vitamin'];
const HEALTH_SUPP_TERMS = ['suplement', 'salud', 'omega', 'magnes', 'miner', 'colageno', 'adaptog', 'immune', 'probio', 'bienestar', 'wellness'];

// Tipos/Subcategorías por categoría (soporta nuevas y legacy)
const CATEGORY_TYPES = {
  // Proteínas
  'proteínas': ['Proteínas limpias', 'Proteínas hipercalóricas', 'Proteínas veganas'],
  'Proteínas': ['Proteínas limpias', 'Proteínas hipercalóricas', 'Proteínas veganas'],
  // Creatinas (nuevas y legacy)
  'Creatinas': ['Monohidratadas', 'HCL'],
  'Creatina': ['Monohidratadas', 'HCL'],
  'creatina': ['Monohidratadas', 'HCL'],
  'creatinas': ['Monohidratadas', 'HCL'],
  // Pre-entrenos y Quemadores
  'Pre-entrenos y Quemadores': ['Pre-entrenos', 'Quemadores de grasa'],
  'pre-entrenos y quemadores': ['Pre-entrenos', 'Quemadores de grasa'],
  'Pre-entrenos y Energía': ['Pre-entrenos', 'Quemadores de grasa'],
  'Pre-Workout': ['Pre-entrenos', 'Quemadores de grasa'],
  // Aminoácidos y Recuperadores
  'Aminoácidos y Recuperadores': ['BCAA y EAA', 'Glutamina'],
  'Aminoácidos': ['BCAA y EAA', 'Glutamina'],
  'aminoácidos y recuperadores': ['BCAA y EAA', 'Glutamina'],
  // Salud y Bienestar
  'Salud y Bienestar': HEALTH_TYPES,
  'salud y bienestar': HEALTH_TYPES,
  'Vitaminas': HEALTH_TYPES,
  'Para la salud': HEALTH_TYPES,
  'Complementos': HEALTH_TYPES,
  'Rendimiento hormonal': HEALTH_TYPES,
  // Comidas con proteína
  'Comidas con proteína': ['Pancakes y mezclas', 'Barras y galletas proteicas', 'Snacks funcionales'],
  'Comida': ['Pancakes y mezclas', 'Barras y galletas proteicas', 'Snacks funcionales']
};

const CATEGORY_TYPES_LOOKUP = Object.entries(CATEGORY_TYPES).reduce((acc, [key, value]) => {
  acc[normalizeText(key)] = value;
  return acc;
}, {});

const HEALTH_CATEGORY_KEY_SET = new Set(HEALTH_CATEGORY_KEYS.map(normalizeText));
const includesAny = (text, terms) => {
  if (!text) return false;
  return terms.some(term => text.includes(term));
};
const canonicalizeHealthType = (rawType, productName = '') => {
  const normalizedType = normalizeText(rawType);
  if (includesAny(normalizedType, HEALTH_MULTIVIT_TERMS)) return 'Multivitamínicos';
  if (includesAny(normalizedType, HEALTH_TESTO_TERMS)) return 'Precursores de testosterona';
  if (includesAny(normalizedType, HEALTH_SUPP_TERMS)) return 'Suplementos para la salud';

  const normalizedName = normalizeText(productName);
  if (includesAny(normalizedName, HEALTH_MULTIVIT_TERMS)) return 'Multivitamínicos';
  if (includesAny(normalizedName, HEALTH_TESTO_TERMS)) return 'Precursores de testosterona';
  if (includesAny(normalizedName, HEALTH_SUPP_TERMS)) return 'Suplementos para la salud';

  if (normalizedType || normalizedName) return 'Suplementos para la salud';
  return '';
};

const getCategoryTypes = (category) => CATEGORY_TYPES_LOOKUP[normalizeText(category)] || null;

// Página administración de productos con selección previa de categoría
export default function AdminProducts() {
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Resumen por categoría desde backend (nuevo endpoint)
  const [catSummary, setCatSummary] = useState(null);
  const [catSummaryLoading, setCatSummaryLoading] = useState(false);
  const [catSummaryError, setCatSummaryError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // producto en edición
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); // nueva: categoría elegida
  const [selectedType, setSelectedType] = useState(null); // subcategoría/tipo elegido
  const [search, setSearch] = useState('');
  const [showImplements, setShowImplements] = useState(false);
  // Usuarios
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [showUsers, setShowUsers] = useState(false);

  // Combos
  const [combos, setCombos] = useState([]);
  const [combosLoading, setCombosLoading] = useState(false);
  const [combosError, setCombosError] = useState(null);

  const emptyProduct = {
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'proteínas',
    tipo: '',
    image: '',
    inStock: true,
    isActive: true,
    size: '',
    baseSize: '',
    variants: [],
    flavors: []
  };
  const [form, setForm] = useState(emptyProduct);
  const PANEL_WRAPPER = 'pt-24 md:pt-28 px-4 sm:px-6 lg:px-8 pb-16';
  const PANEL_CARD_CONTAINER = 'max-w-6xl mx-auto';
  const PANEL_CARD_SURFACE = 'bg-white/95 backdrop-blur-sm border border-[#e6d9c7] shadow-[0_32px_70px_-36px_rgba(30,41,59,0.45)] rounded-3xl px-6 md:px-10 py-8';
  const ACTION_BUTTON = {
    create: 'inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all duration-200',
    edit: 'inline-flex items-center gap-2 px-3.5 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all duration-200',
    delete: 'inline-flex items-center gap-2 px-3.5 h-9 rounded-lg bg-red-700 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-all duration-200',
    toggleOn: 'inline-flex items-center gap-2 px-3.5 h-9 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-all duration-200',
    toggleOff: 'inline-flex items-center gap-2 px-3.5 h-9 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-semibold transition-all duration-200'
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.get('/products?includeInactive=true&limit=2000&flat=true', { headers });
      setProducts(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      setError(e.response?.data?.message || 'Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  const fetchCategorySummary = async () => {
    try {
      setCatSummaryLoading(true);
      setCatSummaryError(null);
      // Incluir el token en headers (importante para admin en memoria)
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.get('/products/admin/category-summary', { headers });
      setCatSummary(Array.isArray(data?.data) ? data.data : null);
    } catch (e) {
      setCatSummaryError(e.response?.data?.message || 'No se pudo obtener el resumen de categorías');
      setCatSummary(null);
    } finally {
      setCatSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCategorySummary();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const { data } = await axios.get('/users?limit=2000');
      setUsers(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      setUsersError(e.response?.data?.message || 'Error cargando usuarios');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (showUsers && users.length === 0 && !usersLoading) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUsers]);

  const fetchCombos = async () => {
    try {
      setCombosLoading(true);
      setCombosError(null);
      const { data } = await axios.get('/combos');
      setCombos(Array.isArray(data) ? data : []);
    } catch (e) {
      setCombosError(e.response?.data?.message || 'Error cargando combos');
    } finally {
      setCombosLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, []);

  const categories = useMemo(() => {
    const map = new Map();
    const register = (rawCategory) => {
      if (!rawCategory) return;
      const display = normalizeCategory(rawCategory);
      const key = normalizeText(display);
      if (key && !map.has(key)) {
        map.set(key, display);
      }
    };

    if (Array.isArray(catSummary) && catSummary.length > 0) {
      catSummary.forEach(row => register(row.category));
    } else {
      products.forEach(p => register(p.category));
    }

    ALL_CATEGORIES.forEach(register);

    return ALL_CATEGORIES
      .filter(cat => map.has(normalizeText(cat)))
      .map(cat => map.get(normalizeText(cat)) || cat);
  }, [products, catSummary]);

  const getProductType = (product) => {
    const normalizedCategoryName = normalizeCategory(product?.category);
    const typesForCategory = getCategoryTypes(normalizedCategoryName);
    const rawType = (product?.tipo || '').trim();
    const isHealthCategory = HEALTH_CATEGORY_KEY_SET.has(normalizeText(product?.category)) || HEALTH_CATEGORY_KEY_SET.has(normalizeText(normalizedCategoryName));
    const inferredHealthType = isHealthCategory ? canonicalizeHealthType(rawType, product?.name) : '';
    const effectiveType = inferredHealthType || rawType;

    if (effectiveType) {
      if (typesForCategory?.length) {
        const match = typesForCategory.find(option => normalizeText(option) === normalizeText(effectiveType));
        if (match) {
          return match;
        }
      }
      return effectiveType;
    }

    if (typesForCategory?.length) {
      return typesForCategory[0];
    }

    return '';
  };

  const handleCategorySelect = (category) => {
    if (category === 'Implementos') {
      setShowImplements(true);
      return;
    }
    setSelectedCategory(category);
    setSelectedType(null);
    setSearch('');
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  const backToCategories = () => {
    setSelectedCategory(null);
    setSelectedType(null);
    setSearch('');
  };

  const backToTypes = () => {
    setSelectedType(null);
    setSearch('');
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyProduct,
      category: selectedCategory || emptyProduct.category,
      tipo: selectedType || ''
    });
    setModalOpen(true);
  };

  const openEdit = async (product) => {
    console.log('?? Abriendo editor con producto:', product);
    console.log('?? Variantes del producto desde lista:', product?.variants);
    
    try {
      // CRÍTICO: Cargar el producto completo con TODAS sus variantes desde el backend
      // porque la lista puede estar en modo "flat" donde cada variante es un item separado
      const { data } = await axios.get(`/products/${product._id}`);
      const fullProduct = data?.data || product;
      console.log('?? Producto completo desde API:', fullProduct);
      console.log('?? Variantes completas desde API:', fullProduct?.variants);
      setEditing(fullProduct);
      setForm({
        name: fullProduct?.name || '',
        description: fullProduct?.description || '',
        price: fullProduct?.price ?? '',
        tipo: fullProduct?.tipo || '',  // Usar directamente el tipo del producto, no getProductType
        image: fullProduct?.image || '',
        inStock: fullProduct?.inStock !== false,
        isActive: fullProduct?.isActive ?? true,
        size: fullProduct?.size || '',
        baseSize: fullProduct?.baseSize || '',
        // CRÍTICO: Usar las variantes del producto completo cargado desde la API
        variants: Array.isArray(fullProduct?.variants) 
          ? fullProduct.variants.map(v => ({
              _id: v._id,
              name: v.name || '',
              description: v.description || '',
              price: v.price ?? 0,
              originalPrice: v.originalPrice ?? '',
              size: v.size || '',
              image: v.image || '',
              inStock: v.inStock !== false
            }))
          : [],
        flavors: Array.isArray(fullProduct?.flavors) ? fullProduct.flavors : []
      });
      
      console.log('? Form inicializado con', fullProduct?.variants?.length || 0, 'variantes');
      
      setModalOpen(true);
    } catch (error) {
      console.error('Error cargando producto completo:', error);
      setError('Error al cargar el producto para editar');
    }
  };

  const normalizedSelectedCategory = useMemo(() => normalizeText(selectedCategory), [selectedCategory]);
  const normalizedSelectedType = useMemo(() => normalizeText(selectedType), [selectedType]);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategory) {
      list = list.filter(p => normalizeText(normalizeCategory(p.category)) === normalizedSelectedCategory);
    }
    if (selectedType) {
      list = list.filter(p => normalizeText(getProductType(p)) === normalizedSelectedType);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q));
    }
    return list;
  }, [products, selectedCategory, selectedType, search, normalizedSelectedCategory, normalizedSelectedType]);

  const saveProduct = async (payload) => {
    try {
      setSaving(true);
      setError(null);
      if (editing) {
        await axios.put(`/products/${editing._id}`, payload);
      } else {
        await axios.post('/products', payload);
      }
      setModalOpen(false);
      await fetchProducts();
      await fetchCategorySummary();
    } catch (e) {
      setError(e.response?.data?.message || 'Error guardando producto');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (product) => {
    try {
      await axios.put(`/products/${product._id}`, { isActive: !product.isActive });
      setProducts(prev => prev.map(p => (p._id === product._id ? { ...p, isActive: !product.isActive } : p)));
    } catch (e) {
      alert(e.response?.data?.message || 'Error cambiando estado');
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm('¿Eliminar este producto definitivamente? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      await axios.delete(`/products/${product._id}`);
      setProducts(prev => prev.filter(p => p._id !== product._id));
      await fetchCategorySummary();
    } catch (e) {
      alert(e.response?.data?.message || 'Error eliminando producto');
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return <div className="p-8 text-center text-sm text-red-700">Acceso restringido.</div>;
  }

  if (showImplements) {
    return (
      <div className={PANEL_WRAPPER}>
        <div className="max-w-7xl mx-auto space-y-8">
          <div className={`${PANEL_CARD_SURFACE} space-y-6`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Panel de implementos</p>
                <h1 className="text-3xl font-bold text-gray-900">Gestiona implementos y tallas</h1>
                <p className="text-sm text-gray-600">Crea, actualiza o desactiva implementos disponibles en la tienda.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowImplements(false)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d9cbb6] bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-[#fdf8f1]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al catalogo
              </button>
            </div>
            <div className="border border-[#eadfcd] rounded-3xl bg-white/95 px-4 py-6 md:px-6">
              <ImplementsPanel />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!selectedCategory) {
    const categoriesLoading = loading || catSummaryLoading;
    return (
      <div className={PANEL_WRAPPER}>
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Botón de perfil de administrador */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin/profile')}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-700 hover:bg-slate-800 text-white px-4 text-sm font-medium shadow-sm transition-all duration-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Perfil de Administrador
            </button>
          </div>

          <div className={`${PANEL_CARD_SURFACE} space-y-10`}>
            <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Panel de Productos</p>
                <h1 className="text-3xl font-bold text-gray-900">Gestiona el catálogo por categorías</h1>
                <p className="text-sm text-gray-600">Explora las familias de productos, verifica su salud y crea nuevos listados en segundos.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => { fetchProducts(); fetchCategorySummary(); }}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d9cbb6] bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-[#fdf8f1]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582M20 20v-5h-.581M5.5 9A7.5 7.5 0 0118 6.88M18.5 15A7.5 7.5 0 016 17.12" />
                  </svg>
                  Refrescar datos
                </button>
               
                
              </div>
            </header>

            {categoriesLoading && (
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[#eadfcd] bg-white/60 px-4 py-3 text-sm text-gray-500">
                <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v2m0 12v2m8-8h-2M6 12H4m15.364-7.364l-1.414 1.414M8.05 17.95l-1.414 1.414M18.364 18.364l-1.414-1.414M7.05 7.05L5.636 5.636" />
                </svg>
                Cargando categorías...
              </div>
            )}

            {(error || catSummaryError) && (
              <div className="rounded-2xl border border-red-700 bg-red-700 px-4 py-3 text-sm text-red-700">
                {error || catSummaryError}
              </div>
            )}

            {!categoriesLoading && categories.length === 0 && (
              <div className="rounded-2xl border border-[#eadfcd] bg-white/70 px-4 py-6 text-center text-sm text-gray-500">
                No hay productos aún. Crea tu primer producto para comenzar.
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map(cat => {
                // Si hay resumen, sumar filas que mapeen a la misma categoría normalizada
                let total = 0, activos = 0, inactivos = 0, sinStock = 0;
                if (Array.isArray(catSummary) && catSummary.length > 0) {
                  const rows = catSummary.filter(r => normalizeCategory(r.category) === cat);
                  if (rows.length > 0) {
                    total = rows.reduce((s, r) => s + (r.total || 0), 0);
                    activos = rows.reduce((s, r) => s + (r.active || 0), 0);
                    inactivos = rows.reduce((s, r) => s + (r.inactive || 0), 0);
                    sinStock = rows.reduce((s, r) => s + (r.outOfStock || 0), 0);
                  } else {
                    total = products.filter(p => normalizeCategory(p.category) === cat).length;
                    activos = products.filter(p => normalizeCategory(p.category) === cat && p.isActive).length;
                    inactivos = total - activos;
                    sinStock = products.filter(p => normalizeCategory(p.category) === cat && p.inStock === false).length;
                  }
                } else {
                  total = products.filter(p => normalizeCategory(p.category) === cat).length;
                  activos = products.filter(p => normalizeCategory(p.category) === cat && p.isActive).length;
                  inactivos = total - activos;
                  sinStock = products.filter(p => normalizeCategory(p.category) === cat && p.inStock === false).length;
                }
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className="group relative flex flex-col rounded-2xl border-2 border-[#eadfcd] bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-red-7000 hover:shadow-lg"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-red-700">{cat}</h3>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {total} producto{total !== 1 ? 's' : ''}
                          {total > 0 && (
                            <span>
                              {' · '}{activos} activo{activos !== 1 ? 's' : ''}
                              {sinStock > 0 && ` · ${sinStock} sin stock`}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 transition-colors group-hover:bg-red-700">
                        <svg className="h-6 w-6 text-red-700 transition-colors group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                    </div>

                    <div className="mb-3 flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-gray-700">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        {activos}
                      </span>
                      {inactivos > 0 && (
                        <span className="flex items-center gap-1.5 font-medium text-gray-700">
                          <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                          {inactivos}
                        </span>
                      )}
                      {sinStock > 0 && (
                        <span className="flex items-center gap-1.5 font-medium text-gray-700">
                          <span className="h-2 w-2 rounded-full bg-red-7000"></span>
                          {sinStock}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto border-t border-gray-100 pt-3">
                      <span className="flex items-center gap-1 text-sm font-semibold text-red-700 transition-colors group-hover:text-red-700">
                        Gestionar categoría
                        <svg className="h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Usuarios registrados</h2>
                  <p className="text-xs text-gray-500">Solo lectura. No se permite editar ni eliminar desde aquí.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUsers(v => !v)}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#d9cbb6] bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-[#fdf8f1]"
                  >
                    {showUsers ? 'Ocultar' : 'Mostrar'}
                  </button>
                  {showUsers && (
                    <button
                      type="button"
                      onClick={fetchUsers}
                      disabled={usersLoading}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#d9cbb6] bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-[#fdf8f1] disabled:opacity-60"
                    >
                      Refrescar
                    </button>
                  )}
                </div>
              </div>
              {showUsers && (
                <div className="overflow-hidden rounded-2xl border border-[#eadfcd] bg-white">
                  {usersError && (
                    <div className="border-b border-red-700 bg-red-700 px-4 py-3 text-xs text-red-700">{usersError}</div>
                  )}
                  {usersLoading ? (
                    <div className="px-4 py-4 text-sm text-gray-500">Cargando usuarios...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-[#faf4eb] text-left text-xs uppercase tracking-wide text-slate-600">
                          <tr>
                            <th className="px-3 py-2">Email</th>
                            <th className="px-3 py-2">Nombre</th>
                            <th className="px-3 py-2">Rol</th>
                            <th className="px-3 py-2">Verificado</th>
                            <th className="px-3 py-2">Último login</th>
                            <th className="px-3 py-2">Creado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u => {
                            const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || '-';
                            return (
                              <tr key={u._id || u.id} className="border-b border-[#f1e7d6] text-xs last:border-b-0 hover:bg-[#fff8f0]">
                                <td className="px-3 py-2 font-mono">{u.email}</td>
                                <td className="px-3 py-2">{fullName}</td>
                                <td className="px-3 py-2">
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-[#f1e7d6] text-slate-700'}`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className="px-3 py-2">{u.isEmailVerified ? 'Sí' : 'No'}</td>
                                <td className="px-3 py-2 text-[10px] text-gray-500">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '-'}</td>
                                <td className="px-3 py-2 text-[10px] text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                              </tr>
                            );
                          })}
                          {users.length === 0 && !usersLoading && !usersError && (
                            <tr>
                              <td colSpan="6" className="px-3 py-4 text-center text-xs text-gray-500">Sin usuarios</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </section>

            <div className="rounded-2xl border border-[#eadfcd] bg-white/95 p-5 shadow-sm">
              <AdminPageManagement />
            </div>

            <section className="space-y-6">
              <header className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-gray-900">Panel de combos</h2>
                <p className="text-sm text-gray-600">Gestiona los combos de Volumen y Definición.</p>
              </header>

              {combosLoading && <p className="text-sm text-gray-500">Cargando combos...</p>}
              {combosError && (
                <div className="rounded-2xl border border-red-700 bg-red-700 px-4 py-3 text-sm text-red-700">{combosError}</div>
              )}

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 max-w-3xl">
                {/* Combos de Volumen */}
                <button
                  type="button"
                  onClick={() => navigate('/admin/combos/volumen')}
                  className="group relative flex flex-col rounded-2xl border-2 border-[#eadfcd] bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-red-7000 hover:shadow-lg"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-red-700">Combos de Volumen</h3>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {combos.filter(c => c.category === 'Volumen').length} combo{combos.filter(c => c.category === 'Volumen').length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 transition-colors group-hover:bg-red-700">
                      <svg className="h-6 w-6 text-red-700 transition-colors group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  </div>

                  <div className="mb-3 flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-gray-700">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      {combos.filter(c => c.category === 'Volumen' && c.inStock).length} disponibles
                    </span>
                    {combos.filter(c => c.category === 'Volumen' && !c.inStock).length > 0 && (
                      <span className="flex items-center gap-1.5 font-medium text-gray-700">
                        <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                        {combos.filter(c => c.category === 'Volumen' && !c.inStock).length} sin stock
                      </span>
                    )}
                  </div>

                  <div className="mt-auto border-t border-gray-100 pt-3">
                    <span className="flex items-center gap-1 text-sm font-semibold text-red-700 transition-colors group-hover:text-red-700">
                      Administrar Volumen
                      <svg className="h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </button>

                {/* Combos de Definición */}
                <button
                  type="button"
                  onClick={() => navigate('/admin/combos/definicion')}
                  className="group relative flex flex-col rounded-2xl border-2 border-[#eadfcd] bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-red-7000 hover:shadow-lg"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-red-700">Combos de Definición</h3>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {combos.filter(c => c.category === 'Definición').length} combo{combos.filter(c => c.category === 'Definición').length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 transition-colors group-hover:bg-red-700">
                      <svg className="h-6 w-6 text-red-700 transition-colors group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>

                  <div className="mb-3 flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-gray-700">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      {combos.filter(c => c.category === 'Definición' && c.inStock).length} disponibles
                    </span>
                    {combos.filter(c => c.category === 'Definición' && !c.inStock).length > 0 && (
                      <span className="flex items-center gap-1.5 font-medium text-gray-700">
                        <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                        {combos.filter(c => c.category === 'Definición' && !c.inStock).length} sin stock
                      </span>
                    )}
                  </div>

                  <div className="mt-auto border-t border-gray-100 pt-3">
                    <span className="flex items-center gap-1 text-sm font-semibold text-red-700 transition-colors group-hover:text-red-700">
                      Administrar Definición
                      <svg className="h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  // Vista 2: Selección de tipo/subcategoría (solo para proteínas y Creatina)
  const categoryHasTypes = getCategoryTypes(selectedCategory);
  if (categoryHasTypes && !selectedType) {
    const normalizedSelectedCategoryKey = normalizeText(selectedCategory);
    const productsInCategory = products.filter(
      p => normalizeText(normalizeCategory(p.category)) === normalizedSelectedCategoryKey
    );

    return (
      <div className={PANEL_WRAPPER}>
        <div className="max-w-7xl mx-auto space-y-12">
          <div className={`${PANEL_CARD_SURFACE} space-y-8`}>
            <header className="space-y-6">
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <button
                  type="button"
                  onClick={backToCategories}
                  className="inline-flex items-center gap-2 rounded-full border border-[#eadfcd] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-[#fdf8f1]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  categorías
                </button>
                <svg className="h-4 w-4 text-[#d9cbb6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span className="rounded-full bg-red-700 px-3 py-1.5 text-xs font-semibold text-white">{selectedCategory}</span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{selectedCategory}</h1>
                  <p className="text-sm text-gray-600">Selecciona un tipo para gestionar sus productos.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                 
                </div>
              </div>
            </header>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categoryHasTypes.map(tipo => {
                const normalizedTypeKey = normalizeText(tipo);
                const matchesType = (product) => normalizeText(getProductType(product)) === normalizedTypeKey;
                const total = productsInCategory.filter(matchesType).length;
                const activos = productsInCategory.filter(p => matchesType(p) && p.isActive).length;
                const inactivos = total - activos;
                const sinStock = productsInCategory.filter(p => matchesType(p) && p.inStock === false).length;

                return (
                  <button
                    key={tipo}
                    onClick={() => handleTypeSelect(tipo)}
                    className="group relative flex flex-col rounded-2xl border-2 border-[#eadfcd] bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-red-7000 hover:shadow-lg"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-red-700">{tipo}</h3>
                        <p className="mt-0.5 text-sm text-gray-500">{total} producto{total !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 transition-colors group-hover:bg-red-700">
                        <svg className="h-6 w-6 text-red-700 transition-colors group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                    </div>

                    <div className="mb-3 flex items-center gap-3 text-xs font-medium text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        {activos}
                      </span>
                      {inactivos > 0 && (
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                          {inactivos}
                        </span>
                      )}
                      {sinStock > 0 && (
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-red-7000"></span>
                          {sinStock}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto border-t border-gray-100 pt-3">
                      <span className="flex items-center gap-1 text-sm font-semibold text-red-700 transition-colors group-hover:text-red-700">
                        Gestionar tipo
                        <svg className="h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {modalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 shadow-2xl p-4">
                <div className="relative max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-[#eadfcd] bg-white p-6">
                  <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                  <ProductForm
                    initialValue={form}
                    saving={saving}
                    editingMode={!!editing}
                    categoryLocked={!editing}
                    onCancel={() => setModalOpen(false)}
                    onSave={saveProduct}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vista 3: Tabla filtrada por categoría y tipo seleccionados
  return (
    <div className={PANEL_WRAPPER}>
      <div className="max-w-7xl mx-auto space-y-10">
        <div className={`${PANEL_CARD_SURFACE} space-y-8`}>
          <header className="space-y-6">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <button
                type="button"
                onClick={backToCategories}
                className="inline-flex items-center gap-2 rounded-full border border-[#eadfcd] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-[#fdf8f1]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                categorías
              </button>
              {categoryHasTypes && (
                <>
                  <svg className="h-4 w-4 text-[#d9cbb6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  <button
                    type="button"
                    onClick={backToTypes}
                    className="inline-flex items-center gap-2 rounded-full border border-[#eadfcd] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-[#fdf8f1]"
                  >
                    {selectedCategory}
                  </button>
                </>
              )}
              <svg className="h-4 w-4 text-[#d9cbb6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              <span className="rounded-full bg-red-700 px-3 py-1.5 text-xs font-semibold text-white">
                {selectedType || selectedCategory}
              </span>
            </nav>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {selectedCategory}
                  {selectedType && <span className="text-red-700"> · {selectedType}</span>}
                </h1>
                <span className="inline-flex items-center gap-2 rounded-full bg-red-700 px-3 py-1 text-sm font-semibold text-red-700">
                  {filteredProducts.length} {filteredProducts.length !== 1 ? 'productos' : 'producto'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-72">
                  <input
                    id="admin_search_field"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full h-10 rounded-lg border border-[#e2d6c4] bg-white pl-10 pr-10 text-sm text-slate-700 focus:border-red-7000 focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                  <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-700"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => (categoryHasTypes ? backToTypes() : backToCategories())}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d9cbb6] bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-[#fdf8f1]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {categoryHasTypes ? selectedCategory : 'categorías'}
                </button>
                <button
                  type="button"
                  onClick={openCreate}
                  className={`${ACTION_BUTTON.create} justify-center`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo producto
                </button>
              </div>
            </div>
          </header>

          {error && (
            <div className="rounded-2xl border border-red-700 bg-red-700 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-700 border-t-red-600"></div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#eadfcd] bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gradient-to-r from-[#fff4ea] to-[#fbe9dd] text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Producto</th>
                      <th className="px-4 py-3">Precio</th>
                      <th className="px-4 py-3">Disponibilidad</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1e6d4]">
                    {filteredProducts.map(product => (
                      <tr key={product._id} className={product.isActive ? 'hover:bg-[#fff8f0]' : 'opacity-70 hover:bg-[#f7f2ea]'}>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-semibold text-gray-900">{product.name}</span>
                            {(!product.variants || product.variants.length === 0) && product.baseSize && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                                </svg>
                                Base: {product.baseSize}
                              </span>
                            )}
                            {product.image && (
                              <span className="flex max-w-xs items-center gap-1 truncate text-xs text-gray-500">
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {product.image}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top font-semibold text-red-700">
                          ${product.price}
                          {product.originalPrice && product.originalPrice !== product.price && (
                            <span className="ml-2 text-xs text-gray-400 line-through">${product.originalPrice}</span>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${product.inStock !== false ? 'bg-green-100 text-green-700' : 'bg-red-700 text-red-700'}`}>
                            {product.inStock !== false ? (
                              <>
                                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Disponible
                              </>
                            ) : (
                              <>
                                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                Sin stock
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                            {product.isActive ? (
                              <>
                                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Activo
                              </>
                            ) : (
                              <>
                                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                </svg>
                                Inactivo
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(product)}
                              className={`${ACTION_BUTTON.edit} justify-center`}
                              title="Editar producto"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleActive(product)}
                              className={`${product.isActive ? ACTION_BUTTON.toggleOn : ACTION_BUTTON.toggleOff} justify-center`}
                              title={product.isActive ? 'Desactivar producto' : 'Activar producto'}
                            >
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                              </svg>
                              {product.isActive ? 'Desactivar' : 'Activar'}
                            </button>
                            {product.isActive && (
                              <button
                                type="button"
                                onClick={() => deleteProduct(product)}
                                className={`${ACTION_BUTTON.delete} justify-center`}
                                title="Eliminar producto definitivamente"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Eliminar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && !loading && (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-600">
                          <div className="flex flex-col items-center gap-3">
                            <svg className="h-16 w-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <span>No hay productos en esta vista.</span>
                            <button type="button" onClick={openCreate} className="text-sm font-semibold text-red-700 hover:text-red-700">
                              + Agregar producto
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-[#eadfcd] bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <ProductForm
              initialValue={form}
              saving={saving}
              editingMode={!!editing}
              categoryLocked={Boolean(selectedCategory) && !editing}
              onCancel={() => setModalOpen(false)}
              onSave={saveProduct}
            />
          </div>
        </div>
      )}
    </div>
  );
}

