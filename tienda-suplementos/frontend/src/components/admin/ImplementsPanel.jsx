import { useEffect, useMemo, useState } from 'react';
import axios from '../../utils/axios';
import { uploadImplementImage } from '../../services/api';

const emptyImplement = { name: '', size: '', price: '', originalPrice: '', image: '', sizes: [], isActive: true };

const mapImplement = (item) => ({
  id: item.id || item._id,
  name: item.name || '',
  size: item.size || '',
  sizes: item.sizes || [],
  price: item.price || 0,
  originalPrice: item.originalPrice || '',
  image: item.image || '',
  isActive: item.isActive !== false,
  createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : null,
});

const ImplementsPanel = () => {
  const [implementsList, setImplementsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState(emptyImplement);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const loadImplements = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get('/implements?includeInactive=true');
      const items = Array.isArray(data?.data) ? data.data.map(mapImplement) : [];
      setImplementsList(items);
    } catch (err) {
      console.error('Error loading implements', err);
      setError(err.response?.data?.message || 'No se pudieron cargar los implementos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImplements();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return implementsList;
    }
    const term = search.trim().toLowerCase();
    return implementsList.filter((item) =>
      item.name.toLowerCase().includes(term) || item.size.toLowerCase().includes(term)
    );
  }, [implementsList, search]);

  const resetForm = () => {
    setForm(emptyImplement);
    setEditing(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona una imagen válida.');
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);
      const result = await uploadImplementImage(file);
      if (result.imageUrl) {
        setForm((prev) => ({ ...prev, image: result.imageUrl }));
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Error al subir la imagen.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('El nombre del implemento es obligatorio.');
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      setError('El precio es obligatorio y debe ser mayor a 0.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const payload = {
        name: form.name.trim(),
        size: form.size.trim(),
        price: parseFloat(form.price),
        isActive: form.isActive,
      };
      if (form.originalPrice && parseFloat(form.originalPrice) > 0) {
        payload.originalPrice = parseFloat(form.originalPrice);
      }
      if (form.image && form.image.trim()) {
        payload.image = form.image.trim();
      }
      if (Array.isArray(form.sizes) && form.sizes.length > 0) {
        payload.sizes = form.sizes;
      }
      if (editing) {
        await axios.put(`/implements/${editing.id}`, payload);
      } else {
        await axios.post('/implements', payload);
      }
      await loadImplements();
      resetForm();
    } catch (err) {
      console.error('Error saving implement', err);
      setError(err.response?.data?.message || 'No se pudo guardar el implemento.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({ 
      name: item.name, 
      size: item.size,
      sizes: item.sizes || [],
      price: item.price || '', 
      originalPrice: item.originalPrice || '',
      image: item.image || '',
      isActive: item.isActive 
    });
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Eliminar el implemento "${item.name}"?`)) {
      return;
    }
    try {
      await axios.delete(`/implements/${item.id}`);
      await loadImplements();
      if (editing?.id === item.id) {
        resetForm();
      }
    } catch (err) {
      console.error('Error deleting implement', err);
      setError(err.response?.data?.message || 'No se pudo eliminar el implemento.');
    }
  };

  return (
    <section className="space-y-6 mt-12">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Panel de Implementos</h2>
          <p className="text-sm text-gray-600">Gestiona implementos y tallas disponibles.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar implementos..."
            className="w-full sm:w-64 h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
          />
          <button
            onClick={loadImplements}
            disabled={loading}
            className="text-xs px-3 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50"
          >
            Refrescar
          </button>
        </div>
      </header>

      {error && (
        <div className="text-sm text-red-700 bg-red-700 border border-red-700 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {editing ? 'Editar implemento' : 'Nuevo implemento'}
          </h3>

          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Nombre
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700"
              placeholder="Cuerda de salto"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Talla / Medida
            <input
              type="text"
              value={form.size}
              onChange={(e) => setForm((prev) => ({ ...prev, size: e.target.value }))}
              className="h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700"
              placeholder="Única, S, M, L, etc."
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Precio *
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                className="h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700"
                placeholder="0.00"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Precio Original
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.originalPrice}
                onChange={(e) => setForm((prev) => ({ ...prev, originalPrice: e.target.value }))}
                className="h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700"
                placeholder="0.00"
              />
            </label>
          </div>

          {/* Imagen */}
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span>Imagen del Implemento</span>
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
              <label 
                htmlFor="imageUpload" 
                className="flex-1 h-10 px-3 rounded-lg border border-gray-300 flex items-center cursor-pointer hover:bg-gray-50 disabled:opacity-50"
              >
                {uploadingImage ? 'Subiendo...' : form.image ? '✓ Imagen subida' : 'Seleccionar imagen'}
              </label>
            </div>
            {form.image && (
              <div className="flex items-center gap-2">
                <img src={form.image} alt="preview" className="w-12 h-12 rounded object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                  className="text-xs text-red-700 hover:underline"
                >
                  Remover
                </button>
              </div>
            )}
          </label>

          {/* Tallas */}
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span>Tallas Disponibles (S, M, L, XL)</span>
            <div className="flex flex-wrap gap-2">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    const updated = form.sizes.includes(size)
                      ? form.sizes.filter((s) => s !== size)
                      : [...form.sizes, size];
                    setForm((prev) => ({ ...prev, sizes: updated }));
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    form.sizes.includes(size)
                      ? 'bg-red-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-500">
              Seleccionadas: {form.sizes.length > 0 ? form.sizes.join(', ') : 'ninguna'}
            </span>
          </label>

          <label className="inline-flex items-center gap-3 text-sm text-gray-700 select-none">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4"
            />
            Mostrar en la tienda
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-700 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60"
            >
              {saving ? 'Guardando…' : editing ? 'Actualizar' : 'Crear'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Talla</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Visible</th>
                  <th className="p-3">Creado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-500">
                      Cargando implementos...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-400 text-sm">
                      {search ? 'Sin coincidencias para la búsqueda.' : 'No hay implementos registrados aún.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{item.name}</td>
                      <td className="p-3 text-gray-600">{item.size || '—'}</td>
                      <td className="p-3 text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">${item.price}</span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <>
                              <span className="text-xs text-gray-400 line-through">${item.originalPrice}</span>
                              <span className="text-xs bg-red-700 text-red-700 font-semibold px-1.5 py-0.5 rounded">
                                -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          {item.isActive ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-400">{item.createdAt || '—'}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="text-xs px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="text-xs px-3 py-1 rounded bg-red-700 text-red-700 hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImplementsPanel;
