import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import axios from '../utils/axios';

// TODO: separar en subcomponentes si crece más

export default function Profile() {
  const { isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [addresses, setAddresses] = useState([]);
  const [addrDraft, setAddrDraft] = useState({ street: '', city: '', state: '', zipCode: '', country: '' });
  const [showCompleteHint, setShowCompleteHint] = useState(false);

  // PIN admin management states
  const [pinSectionOpen, setPinSectionOpen] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinMessage, setPinMessage] = useState(null);
  const [pinError, setPinError] = useState(null);
  const [pinForm, setPinForm] = useState({ pin: '', oldPin: '', newPin: '', confirmPin: '' });
  const [pinStatus, setPinStatus] = useState({ enabled: false, attempts: 0, lockedUntil: null });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/auth/profile');
      setProfile(data.data);
      setForm({
        firstName: data.data.firstName || '',
        lastName: data.data.lastName || '',
        phone: data.data.phone || ''
      });
      setAddresses(data.data.addresses || []);
      setPinStatus({
        enabled: !!data.data.adminPinEnabled,
        attempts: data.data.adminPinAttempts || 0,
        lockedUntil: data.data.adminPinLockedUntil || null
      });
      const incomplete = !data.data.firstName || !data.data.lastName || !data.data.phone;
      if (incomplete) {
        setShowCompleteHint(true);
        setEditing(true);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Error cargando perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchProfile();
  }, [isAuthenticated]);

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const addAddress = () => {
    if (!addrDraft.street || !addrDraft.city) return;
    setAddresses(prev => [...prev, { ...addrDraft, isDefault: prev.length === 0 }]);
    setAddrDraft({ street: '', city: '', state: '', zipCode: '', country: '' });
  };

  const removeAddress = (idx) => {
    setAddresses(prev => prev.filter((_, i) => i !== idx));
  };

  const setDefaultAddress = (idx) => {
    setAddresses(prev => prev.map((a, i) => ({ ...a, isDefault: i === idx })));
  };

  const saveProfile = async () => {
    setSaving(true); setError(null); setMessage(null);
    try {
      await axios.put('/api/auth/profile', { ...form, addresses });
      setMessage('Perfil actualizado');
      setEditing(false);
      if (form.firstName && form.lastName && form.phone) {
        setShowCompleteHint(false);
      }
      fetchProfile();
    } catch (e) {
      // Log detallado para depuración: URL, método, status y body de respuesta
      try {
        console.error('Error updating profile:', {
          message: e.message,
          url: e.config?.url,
          method: e.config?.method,
          status: e.response?.status,
          responseData: e.response?.data
        });
      } catch (logErr) {
        console.error('Error logging update failure', logErr);
      }

      setError(e.response?.data?.message || `Error guardando (${e.response?.status || e.code || 'unknown'})`);
    } finally {
      setSaving(false);
    }
  };

  // Helpers PIN
  const remainingLockMs = pinStatus.lockedUntil ? (new Date(pinStatus.lockedUntil).getTime() - Date.now()) : 0;
  const remainingLockMin = remainingLockMs > 0 ? Math.ceil(remainingLockMs / 60000) : 0;

  const handleSetPin = async () => {
    setPinError(null); setPinMessage(null); setPinLoading(true);
    if (!/^\d{4,10}$/.test(pinForm.pin)) { setPinError('PIN debe tener 4-10 dígitos'); setPinLoading(false); return; }
    try {
      await axios.post('/api/auth/admin/set-pin', { pin: pinForm.pin });
      setPinMessage('PIN configurado');
      setPinForm({ pin: '', oldPin: '', newPin: '', confirmPin: '' });
      fetchProfile();
    } catch (e) {
      setPinError(e.response?.data?.message || 'Error configurando PIN');
    } finally { setPinLoading(false); }
  };

  const handleChangePin = async () => {
    setPinError(null); setPinMessage(null); setPinLoading(true);
    if (!pinForm.oldPin || !pinForm.newPin || !pinForm.confirmPin) { setPinError('Completa todos los campos'); setPinLoading(false); return; }
    if (pinForm.newPin !== pinForm.confirmPin) { setPinError('La confirmación no coincide'); setPinLoading(false); return; }
    if (!/^\d{4,10}$/.test(pinForm.newPin)) { setPinError('Nuevo PIN inválido'); setPinLoading(false); return; }
    try {
      await axios.post('/api/auth/admin/change-pin', { oldPin: pinForm.oldPin, newPin: pinForm.newPin });
      setPinMessage('PIN actualizado');
      setPinForm({ pin: '', oldPin: '', newPin: '', confirmPin: '' });
      fetchProfile();
    } catch (e) {
      setPinError(e.response?.data?.message || 'Error cambiando PIN');
    } finally { setPinLoading(false); }
  };

  const handleDisablePin = async () => {
    if (!pinForm.pin) { setPinError('Ingresa tu PIN actual para deshabilitar'); return; }
    setPinLoading(true); setPinError(null); setPinMessage(null);
    try {
      await axios.post('/api/auth/admin/disable-pin', { pin: pinForm.pin });
      setPinMessage('PIN deshabilitado');
      setPinForm({ pin: '', oldPin: '', newPin: '', confirmPin: '' });
      fetchProfile();
    } catch (e) {
      setPinError(e.response?.data?.message || 'Error deshabilitando PIN');
    } finally { setPinLoading(false); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-sm text-gray-600 bg-white/60 px-4 py-2 rounded">Debes iniciar sesión para ver tu perfil.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>
        <button onClick={logout} className="text-sm text-red-700 hover:underline">Cerrar sesión</button>
      </header>

      {loading && <p className="text-sm text-gray-500">Cargando...</p>}
      {error && <div className="text-sm text-red-700 bg-red-700 border border-red-700 px-3 py-2 rounded">{error}</div>}
      {message && <div className="text-sm text-primary-600 bg-primary-50 border border-primary-200 px-3 py-2 rounded">{message}</div>}
      {!loading && showCompleteHint && (
        <div className="flex items-center gap-3 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded shadow-sm">
          <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-pulse" aria-hidden="true" />
          <p className="m-0">Completa tus datos personales</p>
          <button onClick={() => setEditing(true)} className="ml-auto text-[11px] font-medium text-amber-700 underline hover:no-underline">Editar ahora</button>
        </div>
      )}

      {!loading && profile && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Datos Básicos */}
          <section className="lg:col-span-2 bg-white rounded-lg shadow p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Datos personales</h2>
              <button onClick={() => setEditing(e => !e)} className="text-xs text-indigo-600 hover:underline">
                {editing ? 'Cancelar' : 'Editar'}
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500">Email</label>
                <p className="text-sm font-mono break-all">{profile.email}</p>
                {profile.isEmailVerified ? (
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-primary-100 text-primary-700">Verificado</span>
                ) : (
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-700">No verificado</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nombres</label>
                  <input disabled={!editing} name="firstName" value={form.firstName} onChange={onChange} className="w-full border rounded px-2 py-1 text-sm disabled:bg-gray-100"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Apellidos</label>
                  <input disabled={!editing} name="lastName" value={form.lastName} onChange={onChange} className="w-full border rounded px-2 py-1 text-sm disabled:bg-gray-100"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
                <input disabled={!editing} name="phone" value={form.phone} onChange={onChange} className="w-full border rounded px-2 py-1 text-sm disabled:bg-gray-100"/>
              </div>
            </div>
            {editing && (
              <div className="flex justify-end gap-2 pt-2">
                <button disabled={saving} onClick={() => { setEditing(false); setForm({ firstName: profile.firstName||'', lastName: profile.lastName||'', phone: profile.phone||'' }); }} className="text-xs px-3 py-1 rounded border">Reset</button>
                <button disabled={saving} onClick={saveProfile} className="text-xs px-4 py-1 rounded bg-indigo-600 text-white disabled:opacity-50">{saving? 'Guardando...' : 'Guardar'}</button>
              </div>
            )}
          </section>

          {/* Direcciones */}
          <section className="bg-white rounded-lg shadow p-5 space-y-4">
            <h2 className="font-semibold text-lg">Direcciones</h2>
            <ul className="space-y-3 max-h-64 overflow-auto pr-1">
              {addresses.length === 0 && <li className="text-xs text-gray-500">Sin direcciones</li>}
              {addresses.map((addr, i) => (
                <li key={i} className="border rounded p-2 relative group text-xs space-y-0.5 bg-gray-50">
                  <p className="font-medium">{addr.street}</p>
                  <p className="text-[10px] text-gray-600">{addr.city} {addr.state} {addr.zipCode} {addr.country}</p>
                  <div className="flex justify-between items-center mt-1">
                    <button onClick={() => setDefaultAddress(i)} className={`text-[10px] px-2 py-0.5 rounded ${addr.isDefault? 'bg-primary-600 text-white':'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{addr.isDefault? 'Default':'Hacer default'}</button>
                    <button onClick={() => removeAddress(i)} className="text-[10px] text-red-700 hover:underline">Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-2 pt-2 border-t">
              <input placeholder="Calle" value={addrDraft.street} onChange={e=>setAddrDraft(d=>({...d,street:e.target.value}))} className="w-full border rounded px-2 py-1 text-xs"/>
              <input placeholder="Ciudad" value={addrDraft.city} onChange={e=>setAddrDraft(d=>({...d,city:e.target.value}))} className="w-full border rounded px-2 py-1 text-xs"/>
              <div className="grid grid-cols-3 gap-2">
                <input placeholder="Estado" value={addrDraft.state} onChange={e=>setAddrDraft(d=>({...d,state:e.target.value}))} className="border rounded px-2 py-1 text-xs"/>
                <input placeholder="CP" value={addrDraft.zipCode} onChange={e=>setAddrDraft(d=>({...d,zipCode:e.target.value}))} className="border rounded px-2 py-1 text-xs"/>
                <input placeholder="País" value={addrDraft.country} onChange={e=>setAddrDraft(d=>({...d,country:e.target.value}))} className="border rounded px-2 py-1 text-xs"/>
              </div>
              <button onClick={addAddress} className="w-full text-[11px] bg-indigo-600 text-white rounded py-1 hover:bg-indigo-500">Añadir dirección</button>
            </div>
          </section>
        </div>
      )}

      {/* PIN Admin Section (solo visible si role admin) */}
      {!loading && profile?.role === 'admin' && (
        <section className="bg-white rounded-lg shadow p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Seguridad Administrador (PIN)</h2>
            <button onClick={() => setPinSectionOpen(o => !o)} className="text-xs text-indigo-600 underline">{pinSectionOpen ? 'Ocultar' : 'Mostrar'}</button>
          </div>
          {pinSectionOpen && (
            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <span className={`px-2 py-0.5 rounded ${pinStatus.enabled ? 'bg-primary-100 text-primary-700':'bg-gray-200 text-gray-600'}`}>{pinStatus.enabled ? 'PIN habilitado':'PIN no configurado'}</span>
                {pinStatus.lockedUntil && remainingLockMs > 0 && (
                  <span className="px-2 py-0.5 rounded bg-red-700 text-red-700">Bloqueado {remainingLockMin}m</span>
                )}
                {!pinStatus.lockedUntil && pinStatus.enabled && (
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">Intentos fallidos: {pinStatus.attempts}</span>
                )}
              </div>

              {pinError && <div className="text-xs text-red-700 bg-red-700 border border-red-700 px-2 py-1 rounded">{pinError}</div>}
              {pinMessage && <div className="text-xs text-primary-600 bg-primary-50 border border-primary-200 px-2 py-1 rounded">{pinMessage}</div>}

              {!pinStatus.enabled && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">Configura un PIN numérico para requerir un segundo paso al iniciar sesión como admin.</p>
                  <input maxLength={10} placeholder="Nuevo PIN (4-10 dígitos)" value={pinForm.pin} onChange={e=>setPinForm(f=>({...f,pin:e.target.value.replace(/[^0-9]/g,'')}))} className="border rounded px-2 py-1 text-xs"/>
                  <button disabled={pinLoading} onClick={handleSetPin} className="text-xs px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50">{pinLoading? 'Guardando...' : 'Guardar PIN'}</button>
                </div>
              )}

              {pinStatus.enabled && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Cambiar PIN */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Cambiar PIN</h3>
                    <input placeholder="PIN actual" maxLength={10} value={pinForm.oldPin} onChange={e=>setPinForm(f=>({...f,oldPin:e.target.value.replace(/[^0-9]/g,'')}))} className="border rounded px-2 py-1 text-xs"/>
                    <input placeholder="Nuevo PIN" maxLength={10} value={pinForm.newPin} onChange={e=>setPinForm(f=>({...f,newPin:e.target.value.replace(/[^0-9]/g,'')}))} className="border rounded px-2 py-1 text-xs"/>
                    <input placeholder="Confirmar nuevo PIN" maxLength={10} value={pinForm.confirmPin} onChange={e=>setPinForm(f=>({...f,confirmPin:e.target.value.replace(/[^0-9]/g,'')}))} className="border rounded px-2 py-1 text-xs"/>
                    <button disabled={pinLoading} onClick={handleChangePin} className="text-xs px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50">{pinLoading? 'Actualizando...' : 'Actualizar'}</button>
                  </div>
                  {/* Deshabilitar PIN */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Deshabilitar PIN</h3>
                    <input placeholder="PIN actual" maxLength={10} value={pinForm.pin} onChange={e=>setPinForm(f=>({...f,pin:e.target.value.replace(/[^0-9]/g,'')}))} className="border rounded px-2 py-1 text-xs"/>
                    <button disabled={pinLoading} onClick={handleDisablePin} className="text-xs px-3 py-1 bg-red-700 text-white rounded disabled:opacity-50">{pinLoading? 'Procesando...' : 'Deshabilitar'}</button>
                    <p className="text-[10px] text-gray-500">Deshabilitar elimina el segundo factor hasta que configures uno nuevo.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

