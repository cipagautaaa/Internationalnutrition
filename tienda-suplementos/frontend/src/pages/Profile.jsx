import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  LogOut,
  MapPin,
  PenSquare,
  ShoppingBag,
  ShoppingCart,
  UserCircle,
  XCircle,
} from 'lucide-react';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const cardBase = 'rounded-[32px] border border-white/10 bg-[#0b0b0b]/90 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur';
const labelBase = 'flex items-center gap-2 text-xs tracking-[0.35em] uppercase text-white/50 mb-3';
const inputBase = 'w-full rounded-2xl border border-white/10 bg-[#131313] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-red-500/70';

const regions = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá',
  'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare',
  'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo',
  'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima',
  'Valle del Cauca', 'Vaupés', 'Vichada',
];

export default function Profile() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingShipping, setEditingShipping] = useState(false);

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    phoneNumber: '',
    street: '',
    addressLine2: '',
    city: '',
    region: '',
    zipCode: '',
    country: 'Colombia',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile');

      if (response.data.success) {
        const userData = response.data.user;
        setProfile(userData);
        setProfileForm({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
        });

        const shipping = userData.shippingInfo || {};
        setShippingForm({
          fullName: shipping.fullName || '',
          phoneNumber: shipping.phoneNumber || '',
          street: shipping.street || '',
          addressLine2: shipping.addressLine2 || '',
          city: shipping.city || '',
          region: shipping.region || '',
          zipCode: shipping.zipCode || '',
          country: shipping.country || 'Colombia',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setAlert({ show: true, message: 'Error cargando el perfil', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await api.put('/users/profile', profileForm);
      if (response.data.success) {
        setProfile(response.data.user);
        setEditing(false);
        setAlert({ show: true, message: 'Perfil actualizado', type: 'success' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlert({
        show: true,
        message: error.response?.data?.message || 'No pudimos guardar los cambios',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await api.put('/users/shipping-info', shippingForm);
      if (response.data.success) {
        setProfile((prev) => ({
          ...prev,
          shippingInfo: response.data.shippingInfo,
        }));
        setEditingShipping(false);
        setAlert({ show: true, message: 'Dirección actualizada', type: 'success' });
      }
    } catch (error) {
      console.error('Error updating shipping info:', error);
      setAlert({
        show: true,
        message: error.response?.data?.message || 'No pudimos guardar la dirección',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const quickActions = [
    {
      label: 'Mis pedidos',
      hint: 'Historial completo',
      icon: ShoppingBag,
      action: () => navigate('/orders'),
    },
    {
      label: 'Ver productos',
      hint: 'Explorar catálogo',
      icon: ShoppingBag,
      action: () => navigate('/products'),
    },
    {
      label: 'Mi carrito',
      hint: 'Resumen de compra',
      icon: ShoppingCart,
      action: () => navigate('/cart'),
    },
  ];

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full border-4 border-white/10 border-t-red-500 animate-spin" />
          <p className="text-xs tracking-[0.4em] uppercase text-white/40">Cargando perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-20 px-4 sm:px-6 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <Alert
          show={alert.show}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'info' })}
        />

        <section className={`${cardBase} flex flex-col gap-6 md:flex-row md:items-center`}>
          <div className="flex flex-1 items-center gap-5">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-b from-red-600 to-red-900 flex items-center justify-center shadow-[0_20px_45px_rgba(255,0,63,0.5)]">
                <UserCircle className="h-12 w-12" />
              </div>
              {profile?.isEmailVerified && (
                <span className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1.5">
                  <CheckCircle className="h-4 w-4" />
                </span>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-white/50 mb-1">Perfil</p>
              <h1 className="text-3xl font-black">
                {profile?.firstName && profile?.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : 'Mi perfil'}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.35em] text-white/50">
                {profile?.email && <span className="text-white/70">{profile.email}</span>}
                {joinDate && (
                  <span className="rounded-full border border-white/10 px-3 py-1">
                    Miembro · {joinDate}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm uppercase tracking-[0.35em] ${
                profile?.isEmailVerified
                  ? 'border-emerald-500/40 text-emerald-400'
                  : 'border-amber-500/40 text-amber-300'
              }`}
            >
              {profile?.isEmailVerified ? 'Email verificado' : 'Verificación pendiente'}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] hover:bg-red-500"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className={cardBase}>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/40">Datos</p>
                  <h2 className="text-2xl font-black">Información personal</h2>
                </div>
                <button
                  onClick={() => setEditing((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70 hover:text-white"
                >
                  {editing ? (
                    <>
                      <XCircle className="h-4 w-4" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <PenSquare className="h-4 w-4" />
                      Editar
                    </>
                  )}
                </button>
              </div>

              {editing ? (
                <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelBase}>Nombre</label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                        className={inputBase}
                        placeholder="Nombre"
                        required
                      />
                    </div>
                    <div>
                      <label className={labelBase}>Apellido</label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                        className={inputBase}
                        placeholder="Apellido"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelBase}>Teléfono</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className={inputBase}
                      placeholder="+57 300 123 4567"
                      required
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-2xl bg-red-600/90 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] hover:bg-red-600 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {saving ? 'Guardando' : 'Guardar cambios'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-6 py-3 text-sm uppercase tracking-[0.35em] text-white/60 hover:text-white"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">Email</p>
                    <p className="text-lg font-semibold">{profile?.email}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/40">Nombre</p>
                      <p className="text-lg font-semibold">{profile?.firstName || 'No especificado'}</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/40">Apellido</p>
                      <p className="text-lg font-semibold">{profile?.lastName || 'No especificado'}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">Teléfono</p>
                    <p className="text-lg font-semibold">{profile?.phone || 'No especificado'}</p>
                  </div>
                </div>
              )}
            </section>

            <section className={cardBase}>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/40">Direcciones</p>
                  <h2 className="text-2xl font-black">Información de envío</h2>
                </div>
                <button
                  onClick={() => setEditingShipping((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70 hover:text-white"
                >
                  {editingShipping ? (
                    <>
                      <XCircle className="h-4 w-4" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <PenSquare className="h-4 w-4" />
                      Editar
                    </>
                  )}
                </button>
              </div>

              {editingShipping ? (
                <form onSubmit={handleShippingSubmit} className="mt-6 space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelBase}>Nombre completo</label>
                      <input
                        type="text"
                        value={shippingForm.fullName}
                        onChange={(e) => setShippingForm((prev) => ({ ...prev, fullName: e.target.value }))}
                        className={inputBase}
                        placeholder="Nombre de quien recibe"
                        required
                      />
                    </div>
                    <div>
                      <label className={labelBase}>Teléfono</label>
                      <input
                        type="tel"
                        value={shippingForm.phoneNumber}
                        onChange={(e) => setShippingForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                        className={inputBase}
                        placeholder="+57 300 123 4567"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelBase}>Dirección principal</label>
                    <input
                      type="text"
                      value={shippingForm.street}
                      onChange={(e) => setShippingForm((prev) => ({ ...prev, street: e.target.value }))}
                      className={inputBase}
                      placeholder="Calle 123 #45-67"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelBase}>Complemento</label>
                    <input
                      type="text"
                      value={shippingForm.addressLine2}
                      onChange={(e) => setShippingForm((prev) => ({ ...prev, addressLine2: e.target.value }))}
                      className={inputBase}
                      placeholder="Apartamento, torre, referencia"
                    />
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelBase}>Ciudad</label>
                      <input
                        type="text"
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm((prev) => ({ ...prev, city: e.target.value }))}
                        className={inputBase}
                        placeholder="Bogotá"
                        required
                      />
                    </div>
                    <div>
                      <label className={labelBase}>Departamento</label>
                      <select
                        value={shippingForm.region}
                        onChange={(e) => setShippingForm((prev) => ({ ...prev, region: e.target.value }))}
                        className={`${inputBase} bg-[#131313]`}
                        required
                      >
                        <option value="">Selecciona un departamento</option>
                        {regions.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelBase}>Código postal</label>
                      <input
                        type="text"
                        value={shippingForm.zipCode}
                        onChange={(e) => setShippingForm((prev) => ({ ...prev, zipCode: e.target.value }))}
                        className={inputBase}
                        placeholder="110111"
                      />
                    </div>
                    <div>
                      <label className={labelBase}>País</label>
                      <input
                        type="text"
                        value={shippingForm.country}
                        onChange={(e) => setShippingForm((prev) => ({ ...prev, country: e.target.value }))}
                        className={inputBase}
                        placeholder="Colombia"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-2xl bg-red-600/90 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] hover:bg-red-600 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {saving ? 'Guardando' : 'Guardar información'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingShipping(false)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-6 py-3 text-sm uppercase tracking-[0.35em] text-white/60 hover:text-white"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-6 space-y-5">
                  {profile?.shippingInfo?.fullName ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Nombre completo</p>
                          <p className="text-lg font-semibold">{profile.shippingInfo.fullName}</p>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Teléfono</p>
                          <p className="text-lg font-semibold">{profile.shippingInfo.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#080808] p-5">
                        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
                          <MapPin className="h-4 w-4" /> Dirección completa
                        </div>
                        <p className="text-lg font-semibold">{profile.shippingInfo.street}</p>
                        {profile.shippingInfo.addressLine2 && (
                          <p className="text-sm text-white/70">{profile.shippingInfo.addressLine2}</p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
                          {[profile.shippingInfo.city, profile.shippingInfo.region, profile.shippingInfo.zipCode ? `CP ${profile.shippingInfo.zipCode}` : null, profile.shippingInfo.country || 'Colombia']
                            .filter(Boolean)
                            .map((pill) => (
                              <span key={pill} className="rounded-full border border-white/10 px-3 py-1">
                                {pill}
                              </span>
                            ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-10 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-white/20">
                        <MapPin className="h-6 w-6 text-white/40" />
                      </div>
                      <p className="text-sm text-white/60">Aún no has registrado una dirección de envío.</p>
                      <button
                        onClick={() => setEditingShipping(true)}
                        className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-xs uppercase tracking-[0.35em] text-white hover:bg-white/5"
                      >
                        <MapPin className="h-4 w-4" />
                        Agregar información
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className={cardBase}>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Accesos</p>
              <div className="mt-4 space-y-3">
                {quickActions.map(({ label, hint, icon: Icon, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/0 px-4 py-3 text-left transition hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-base font-semibold">{label}</p>
                        <p className="text-xs text-white/50">{hint}</p>
                      </div>
                    </div>
                    <svg className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </section>

            <section className={`${cardBase} bg-gradient-to-br from-[#111111] to-[#070707]`}>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Actividad</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-3xl font-black">0</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/50">Pedidos</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-3xl font-black">$0</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/50">Total</p>
                </div>
              </div>
            </section>

            <section className={cardBase}>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Soporte</p>
              <h3 className="mt-3 text-2xl font-black">¿Necesitas ayuda?</h3>
              <p className="mt-2 text-sm text-white/60">Escríbenos y te guiamos en minutos.</p>
              <button
                onClick={() => navigate('/contact')}
                className="mt-6 w-full rounded-2xl border border-white/10 px-5 py-3 text-sm uppercase tracking-[0.35em] text-white hover:bg-white/5"
              >
                Contactar soporte
              </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
