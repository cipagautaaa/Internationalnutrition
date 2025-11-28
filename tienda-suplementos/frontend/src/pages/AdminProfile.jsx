import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

export default function AdminProfile() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated || user?.role !== 'admin') {
    return <div className="p-8 text-center text-sm text-red-700">Acceso restringido.</div>;
  }

  const handleChangePIN = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPin !== confirmPin) {
      setMessage({ type: 'error', text: 'Los PINs no coinciden' });
      return;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setMessage({ type: 'error', text: 'El PIN debe tener exactamente 4 dígitos' });
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post('/auth/admin/change-pin', {
        oldPin: currentPin,
        newPin
      });
      setMessage({ type: 'success', text: data?.message || 'PIN actualizado correctamente' });
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al cambiar el PIN' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 md:pt-28 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al panel
          </button>
        </div>

        <div className="bg-white/95 backdrop-blur-sm border border-[#e6d9c7] shadow-[0_32px_70px_-36px_rgba(30,41,59,0.45)] rounded-3xl px-6 md:px-10 py-8 space-y-8">
          <header>
            <h1 className="text-3xl font-bold text-gray-900">Perfil de Administrador</h1>
            <p className="text-sm text-gray-600 mt-2">Gestiona tu configuración de administrador</p>
          </header>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de cuenta</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium text-gray-700 w-24">Email:</span>
                <span className="text-gray-600">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium text-gray-700 w-24">Nombre:</span>
                <span className="text-gray-600">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium text-gray-700 w-24">Rol:</span>
                <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                  Administrador
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cambiar PIN de Administrador</h2>
            <p className="text-sm text-gray-600 mb-6">
              Actualiza tu PIN de 4 dígitos para acceder a funciones administrativas
            </p>

            <form onSubmit={handleChangePIN} className="space-y-4">
              <div>
                <label htmlFor="currentPin" className="block text-sm font-medium text-gray-700 mb-1">
                  PIN Actual
                </label>
                <input
                  type="password"
                  id="currentPin"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  maxLength="4"
                  pattern="\d{4}"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  placeholder="••••"
                />
              </div>

              <div>
                <label htmlFor="newPin" className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo PIN
                </label>
                <input
                  type="password"
                  id="newPin"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  maxLength="4"
                  pattern="\d{4}"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  placeholder="••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nuevo PIN
                </label>
                <input
                  type="password"
                  id="confirmPin"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  maxLength="4"
                  pattern="\d{4}"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  placeholder="••••"
                />
              </div>

              {message.text && (
                <div className={`rounded-lg px-4 py-3 text-sm ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-red-700 hover:bg-red-700 text-white text-sm font-semibold shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Actualizando...' : 'Actualizar PIN'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPin('');
                    setNewPin('');
                    setConfirmPin('');
                    setMessage({ type: '', text: '' });
                  }}
                  className="inline-flex items-center gap-2 px-4 h-10 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
