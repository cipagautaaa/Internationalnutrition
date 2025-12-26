import { useState, useEffect } from 'react';
import axios from '../../utils/axios';

export default function DiscountCodesPanel() {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [form, setForm] = useState({
    code: '',
    productDiscount: 0,
    comboDiscount: 0,
    isActive: true,
    description: '',
    maxUses: '',
    expiresAt: ''
  });

  // Fetch discount codes
  const fetchDiscountCodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/discount-codes');
      if (response.data.success) {
        setDiscountCodes(response.data.discountCodes);
      }
    } catch (err) {
      console.error('Error fetching discount codes:', err);
      setError('Error al cargar los códigos de descuento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountCodes();
  }, []);

  // Reset form
  const resetForm = () => {
    setForm({
      code: '',
      productDiscount: 0,
      comboDiscount: 0,
      isActive: true,
      description: '',
      maxUses: '',
      expiresAt: ''
    });
    setEditingCode(null);
    setFormError('');
  };

  // Open form for new code
  const handleNewCode = () => {
    resetForm();
    setShowForm(true);
  };

  // Open form for editing
  const handleEdit = (code) => {
    setForm({
      code: code.code,
      productDiscount: code.productDiscount,
      comboDiscount: code.comboDiscount,
      isActive: code.isActive,
      description: code.description || '',
      maxUses: code.maxUses || '',
      expiresAt: code.expiresAt ? new Date(code.expiresAt).toISOString().slice(0, 16) : ''
    });
    setEditingCode(code);
    setShowForm(true);
    setFormError('');
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    setSuccessMessage('');

    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        productDiscount: Number(form.productDiscount) || 0,
        comboDiscount: Number(form.comboDiscount) || 0,
        isActive: form.isActive,
        description: form.description.trim(),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null
      };

      let response;
      if (editingCode) {
        response = await axios.put(`/discount-codes/${editingCode._id}`, payload);
      } else {
        response = await axios.post('/discount-codes', payload);
      }

      if (response.data.success) {
        setSuccessMessage(editingCode ? 'Código actualizado exitosamente' : 'Código creado exitosamente');
        setShowForm(false);
        resetForm();
        fetchDiscountCodes();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error saving discount code:', err);
      setFormError(err.response?.data?.message || 'Error al guardar el código');
    } finally {
      setSaving(false);
    }
  };

  // Delete code
  const handleDelete = async (code) => {
    if (!window.confirm(`¿Estás seguro de eliminar el código "${code.code}"?`)) {
      return;
    }

    try {
      const response = await axios.delete(`/discount-codes/${code._id}`);
      if (response.data.success) {
        setSuccessMessage('Código eliminado exitosamente');
        fetchDiscountCodes();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error deleting discount code:', err);
      setError(err.response?.data?.message || 'Error al eliminar el código');
    }
  };

  // Toggle active status
  const handleToggle = async (code) => {
    try {
      const response = await axios.patch(`/discount-codes/${code._id}/toggle`);
      if (response.data.success) {
        setSuccessMessage(`Código ${response.data.discountCode.isActive ? 'activado' : 'desactivado'}`);
        fetchDiscountCodes();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error toggling discount code:', err);
      setError(err.response?.data?.message || 'Error al cambiar el estado');
    }
  };

  // Get status badge
  const getStatusBadge = (code) => {
    if (!code.isActive) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-600">Inactivo</span>;
    }
    if (code.expiresAt && new Date() > new Date(code.expiresAt)) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-100 text-red-700">Expirado</span>;
    }
    if (code.maxUses !== null && code.usageCount >= code.maxUses) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-100 text-orange-700">Agotado</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-700">Activo</span>;
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Códigos de Descuento</h2>
          <p className="text-xs text-gray-500">Crea, edita y gestiona los códigos de descuento para la tienda.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleNewCode}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 text-xs font-medium text-white transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo código
          </button>
          <button
            type="button"
            onClick={fetchDiscountCodes}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#d9cbb6] bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-[#fdf8f1] disabled:opacity-60"
          >
            Refrescar
          </button>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCode ? 'Editar código de descuento' : 'Nuevo código de descuento'}
                </h3>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Code name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="Ej: INTSUPPS20"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">El código se convertirá a mayúsculas automáticamente.</p>
                </div>

                {/* Discounts */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descuento productos (%)
                    </label>
                    <input
                      type="number"
                      value={form.productDiscount}
                      onChange={(e) => setForm({ ...form, productDiscount: e.target.value })}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descuento combos (%)
                    </label>
                    <input
                      type="number"
                      value={form.comboDiscount}
                      onChange={(e) => setForm({ ...form, comboDiscount: e.target.value })}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (opcional)
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Ej: Promoción de navidad 2025"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  />
                </div>

                {/* Max uses and expiration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Máximo de usos
                    </label>
                    <input
                      type="number"
                      value={form.maxUses}
                      onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                      min="1"
                      placeholder="Sin límite"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">Dejar vacío = sin límite</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de expiración
                    </label>
                    <input
                      type="datetime-local"
                      value={form.expiresAt}
                      onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">Dejar vacío = sin expiración</p>
                  </div>
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Código activo
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); resetForm(); }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                  >
                    {saving ? 'Guardando...' : editingCode ? 'Actualizar' : 'Crear código'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Codes table */}
      <div className="overflow-hidden rounded-2xl border border-[#eadfcd] bg-white">
        {loading ? (
          <div className="px-4 py-4 text-sm text-gray-500">Cargando códigos de descuento...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#faf4eb] text-left text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2">Código</th>
                  <th className="px-3 py-2">Productos</th>
                  <th className="px-3 py-2">Combos</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Usos</th>
                  <th className="px-3 py-2">Descripción</th>
                  <th className="px-3 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {discountCodes.map((code) => (
                  <tr key={code._id} className="border-b border-[#f1e7d6] text-xs last:border-b-0 hover:bg-[#fff8f0]">
                    <td className="px-3 py-2 font-mono font-semibold text-gray-900">{code.code}</td>
                    <td className="px-3 py-2">
                      <span className="text-green-700 font-medium">{code.productDiscount}%</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-blue-700 font-medium">{code.comboDiscount}%</span>
                    </td>
                    <td className="px-3 py-2">{getStatusBadge(code)}</td>
                    <td className="px-3 py-2 text-gray-600">
                      {code.usageCount}{code.maxUses ? ` / ${code.maxUses}` : ''}
                    </td>
                    <td className="px-3 py-2 text-gray-500 max-w-[150px] truncate">
                      {code.description || '-'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggle(code)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            code.isActive
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={code.isActive ? 'Desactivar' : 'Activar'}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d={code.isActive 
                                ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" 
                                : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              }
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(code)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(code)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {discountCodes.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="px-3 py-6 text-center text-gray-500">
                      No hay códigos de descuento. Crea el primero haciendo clic en "Nuevo código".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
