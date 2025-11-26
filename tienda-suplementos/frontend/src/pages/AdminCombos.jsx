import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';

export default function AdminCombos() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Normalizar categoría
  const categoryName = category === 'volumen' ? 'Volumen' : 'Definición';

  const emptyCombo = {
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: categoryName,
    image: '',
    inStock: true,
    featured: false,
    products: []
  };

  const [form, setForm] = useState(emptyCombo);

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/combos?category=${categoryName}`);
      setCombos(data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Error cargando combos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Si no hay categoría, no hacer nada (mostrar selector)
    if (!category) {
      setLoading(false);
      return;
    }
    
    // Validar categoría
    if (category !== 'volumen' && category !== 'definición' && category !== 'definicion') {
      navigate('/admin/combos');
      return;
    }
    
    // Solo hacer fetch si está autenticado
    if (isAuthenticated && user?.role === 'admin') {
      fetchCombos();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, isAuthenticated, user]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyCombo);
    setModalOpen(true);
  };

  const openEdit = (combo) => {
    setEditing(combo);
    setForm({
      name: combo.name || '',
      description: combo.description || '',
      price: combo.price || '',
      originalPrice: combo.originalPrice || '',
      category: combo.category,
      image: combo.image || '',
      inStock: combo.inStock !== false,
      featured: combo.featured || false,
      products: combo.products || []
    });
    setModalOpen(true);
  };

  const saveCombo = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('category', categoryName);
      formData.append('inStock', form.inStock);
      formData.append('featured', form.featured);
      
      if (form.originalPrice) formData.append('originalPrice', form.originalPrice);
      if (form.products && form.products.length > 0) {
        formData.append('products', JSON.stringify(form.products));
      }
      
      // Si hay una imagen nueva seleccionada
      if (form.imageFile) {
        console.log('📸 Enviando imagen:', form.imageFile.name);
        formData.append('image', form.imageFile);
      }

      console.log('📤 Enviando FormData:', {
        name: form.name,
        hasImage: !!form.imageFile,
        isEditing: !!editing
      });

      if (editing) {
        const response = await axios.put(`/combos/${editing._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('✅ Combo actualizado:', response.data);
      } else {
        const response = await axios.post('/combos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('✅ Combo creado:', response.data);
      }

      setModalOpen(false);
      fetchCombos();
    } catch (err) {
      console.error('❌ Error guardando combo:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Error guardando combo');
    } finally {
      setSaving(false);
    }
  };

  const deleteCombo = async (combo) => {
    if (!confirm('¿Eliminar este combo definitivamente?')) return;
    try {
      await axios.delete(`/combos/${combo._id}`);
      setCombos(cs => cs.filter(c => c._id !== combo._id));
    } catch (e) {
      alert('Error eliminando: ' + (e.response?.data?.message || 'intenta de nuevo'));
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="pt-24 md:pt-28 p-6 max-w-6xl mx-auto">
        <div className="text-center text-sm text-red-700 bg-red-700 border border-red-700 rounded-lg px-4 py-3">
          Acceso restringido. Debes ser administrador para acceder a esta página.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-24 md:pt-28 p-6 max-w-6xl mx-auto">
        <p className="text-sm text-gray-500">Cargando combos...</p>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-28 p-6 max-w-7xl mx-auto space-y-6">
      {/* Header con estilo del panel principal */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="text-sm text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1 transition-colors"
        >
          ← Volver al Panel
        </button>
        
        <div className="flex flex-col gap-2 mb-6">
          <p className="text-xs font-semibold text-red-700 tracking-wide uppercase">Panel de Combos</p>
          <h1 className="text-3xl font-bold text-gray-900">Gestiona combos de {categoryName}</h1>
          <p className="text-gray-600">
            Crea y administra paquetes especiales para tus clientes
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={fetchCombos}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:border-blue-600 hover:text-blue-700 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refrescar datos
          </button>
          
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo combo
          </button>
          {/* Buscador de combos */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar combo por nombre..."
            className="ml-auto w-64 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-700 focus:outline-none text-sm"
            style={{ minWidth: 220 }}
          />
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Cargando combos...</p>}
      {error && <div className="text-sm text-red-700 bg-red-700 border border-red-700 px-3 py-2 rounded-lg">{error}</div>}

      {!loading && combos.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">No hay combos de {categoryName} aún</p>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Crear Primer Combo
          </button>
        </div>
      )}

      {/* Lista de combos filtrados */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {combos
          .filter(combo =>
            search.trim() === "" ||
            combo.name.toLowerCase().includes(search.trim().toLowerCase())
          )
          .map(combo => (
          <div key={combo._id} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-red-700 hover:shadow-lg transition-all duration-200">
            <div className="relative h-48 bg-gray-100">
              {combo.image && (
                <img
                  src={combo.image}
                  alt={combo.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Error cargando imagen:', combo.image);
                    e.target.style.display = 'none';
                  }}
                />
              )}
              {!combo.inStock && (
                <div className="absolute top-2 right-2 bg-red-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  Sin Stock
                </div>
              )}
              {combo.featured && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  Destacado
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1 text-gray-900">{combo.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{combo.description}</p>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold text-red-700">${combo.price}</span>
                {combo.originalPrice && combo.originalPrice > combo.price && (() => {
                  const pct = Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100);
                  return (
                    <>
                      <span className="text-sm text-gray-400 line-through">${combo.originalPrice}</span>
                      <span className="text-xs bg-red-700 text-red-700 font-semibold px-2 py-0.5 rounded">-{pct}%</span>
                    </>
                  );
                })()}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(combo)}
                  className="flex-1 px-3 py-2 bg-white border-2 border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:border-red-700 hover:text-red-700 transition-all"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteCombo(combo)}
                  className="flex-1 px-3 py-2 bg-red-700 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de creación/edición */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900">{editing ? 'Editar Combo' : 'Nuevo Combo'}</h2>
            
            <form onSubmit={saveCombo} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-700 focus:outline-none transition-all"
                  placeholder="Ej: Combo Ganancia Muscular"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción *</label>
                <textarea
                  required
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-700 focus:outline-none transition-all"
                  placeholder="Describe los beneficios del combo..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Precio *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-700 focus:outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Original</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.originalPrice}
                    onChange={e => setForm({ ...form, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-700 focus:outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Imagen</label>
                
                {/* Zona de arrastrar y soltar */}
                <div
                  onDragOver={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActive(true);
                  }}
                  onDragLeave={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActive(false);
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setForm({ ...form, imageFile: e.dataTransfer.files[0] });
                    }
                  }}
                  className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg px-4 py-6 mb-3 transition-all ${
                    dragActive
                      ? 'border-red-700 bg-red-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  {form.imageFile ? (
                    <div className="text-center">
                      <svg className="w-10 h-10 mx-auto mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-semibold text-green-700">{form.imageFile.name}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        Arrastra una imagen aquí
                      </p>
                    </div>
                  )}
                </div>

                {/* Botón de selección tradicional */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setForm({ ...form, imageFile: e.target.files[0] });
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-700 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-700 file:text-white hover:file:bg-red-800 file:cursor-pointer"
                />
                
                {editing && form.image && !form.imageFile && (
                  <p className="text-xs text-gray-500 mt-2">Imagen actual: {form.image.split('/').pop()}</p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-red-700 transition-all">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={e => setForm({ ...form, inStock: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-red-700 focus:ring-2 focus:ring-red-700"
                    style={{ accentColor: '#b91c1c' }}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-800">Hay stock disponible</span>
                    <p className="text-xs text-gray-500">El combo está disponible para la venta</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-red-700 transition-all">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={e => setForm({ ...form, featured: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-red-700 focus:ring-2 focus:ring-red-700"
                    style={{ accentColor: '#b91c1c' }}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-800">Combo destacado</span>
                    <p className="text-xs text-gray-500">Aparecerá en la sección destacados</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar Combo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
