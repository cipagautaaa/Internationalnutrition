import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Lock,
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

const cardBase = 'rounded-2xl sm:rounded-[32px] border border-gray-200 bg-white p-4 sm:p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur';
const labelBase = 'flex items-center gap-2 text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.35em] uppercase text-gray-500 mb-2 sm:mb-3';
const inputBase = 'w-full rounded-xl sm:rounded-2xl border border-gray-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500';

const regions = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá',
  'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare',
  'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo',
  'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima',
  'Valle del Cauca', 'Vaupés', 'Vichada',
];

export default function Profile() {
  const { isAuthenticated, logout, changePassword } = useAuth();
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
    legalId: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [changingPassword, setChangingPassword] = useState(false);

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
  }, [isAuthenticated, navigate]);

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
          legalId: userData.legalId || '',
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setAlert({ show: true, message: 'Completa los campos de contraseña', type: 'error' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setAlert({ show: true, message: 'Las contraseñas nuevas no coinciden', type: 'error' });
      return;
    }

    try {
      setChangingPassword(true);
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (result.success) {
        setAlert({ show: true, message: 'Contraseña actualizada con éxito', type: 'success' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      } else {
        setAlert({ show: true, message: result.error || 'No pudimos cambiar la contraseña', type: 'error' });
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      setAlert({ show: true, message: 'No pudimos cambiar la contraseña', type: 'error' });
    } finally {
      setChangingPassword(false);
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
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full border-4 border-gray-200 border-t-red-500 animate-spin" />
          <p className="text-xs tracking-[0.4em] uppercase text-gray-500">Cargando perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4 sm:px-6 text-gray-900">
      <div className="mx-auto max-w-6xl space-y-8">
        <Alert
          show={alert.show}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'info' })}
        />

        <section className={`${cardBase} flex flex-col gap-4 sm:gap-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
            <div className="relative flex-shrink-0 self-start sm:self-center">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-b from-red-500 to-red-700 flex items-center justify-center shadow-[0_20px_45px_rgba(255,0,63,0.25)]">
                <UserCircle className="h-9 w-9 sm:h-12 sm:w-12" />
              </div>
              {profile?.isEmailVerified && (
                <span className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1 sm:p-1.5">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] sm:tracking-[0.5em] text-gray-500 mb-1">Perfil</p>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 truncate">
                {profile?.firstName && profile?.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : 'Mi perfil'}
              </h1>
              <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.35em] text-gray-500">
                {profile?.email && <span className="text-gray-700 truncate max-w-[200px] sm:max-w-none">{profile.email}</span>}
                {joinDate && (
                  <span className="rounded-full border border-gray-200 bg-gray-100 px-2 sm:px-3 py-0.5 sm:py-1 text-gray-700 w-fit">
                    Miembro · {joinDate}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <span
              className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.35em] ${
                profile?.isEmailVerified
                  ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                  : 'border-amber-200 text-amber-700 bg-amber-50'
              }`}
            >
              {profile?.isEmailVerified ? 'Email verificado' : 'Verificación pendiente'}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-red-600 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] sm:tracking-[0.35em] text-white hover:bg-red-500"
            >
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Salir
            </button>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className={cardBase}>
              <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-b border-gray-100 pb-4 sm:pb-6">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-gray-400">Datos</p>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">Información personal</h2>
                </div>
                <button
                  onClick={() => setEditing((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-gray-200 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.35em] text-gray-700 hover:bg-gray-50 flex-shrink-0"
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
                  <div>
                    <label className={labelBase}>Número de documento</label>
                    <input
                      type="text"
                      value={profileForm.legalId}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, legalId: e.target.value }))}
                      className={inputBase}
                      placeholder="Cédula / NIT"
                      inputMode="numeric"
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
                      className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-6 py-3 text-sm uppercase tracking-[0.35em] text-gray-700 hover:bg-gray-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Email</p>
                    <p className="text-lg font-semibold text-gray-900">{profile?.email}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Nombre</p>
                      <p className="text-lg font-semibold text-gray-900">{profile?.firstName || 'No especificado'}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Apellido</p>
                      <p className="text-lg font-semibold text-gray-900">{profile?.lastName || 'No especificado'}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Teléfono</p>
                    <p className="text-lg font-semibold text-gray-900">{profile?.phone || 'No especificado'}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Número de documento</p>
                    <p className="text-lg font-semibold text-gray-900">{profile?.legalId || 'No especificado'}</p>
                  </div>
                </div>
              )}
            </section>

            <section className={cardBase}>
              <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-b border-gray-100 pb-4 sm:pb-6">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-gray-400">Direcciones</p>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">Información de envío</h2>
                </div>
                <button
                  onClick={() => setEditingShipping((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-gray-200 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.35em] text-gray-700 hover:bg-gray-50 flex-shrink-0"
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
                        className={`${inputBase} bg-white`}
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
                      className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-6 py-3 text-sm uppercase tracking-[0.35em] text-gray-700 hover:bg-gray-50"
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
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Nombre completo</p>
                          <p className="text-lg font-semibold text-gray-900">{profile.shippingInfo.fullName}</p>
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Teléfono</p>
                          <p className="text-lg font-semibold text-gray-900">{profile.shippingInfo.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="rounded-[28px] border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5">
                        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gray-500">
                          <MapPin className="h-4 w-4" /> Dirección completa
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{profile.shippingInfo.street}</p>
                        {profile.shippingInfo.addressLine2 && (
                          <p className="text-sm text-gray-700">{profile.shippingInfo.addressLine2}</p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-gray-600">
                          {[profile.shippingInfo.city, profile.shippingInfo.region, profile.shippingInfo.zipCode ? `CP ${profile.shippingInfo.zipCode}` : null, profile.shippingInfo.country || 'Colombia']
                            .filter(Boolean)
                            .map((pill) => (
                              <span key={pill} className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-gray-700">
                                {pill}
                              </span>
                            ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-10 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-gray-200">
                        <MapPin className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">Aún no has registrado una dirección de envío.</p>
                      <button
                        onClick={() => setEditingShipping(true)}
                        className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 text-xs uppercase tracking-[0.35em] text-gray-800 hover:bg-gray-50"
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

          <aside className="space-y-4 sm:space-y-6">
            <section className={cardBase}>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-gray-400">Accesos</p>
              <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                {quickActions.map(({ label, hint, icon, action }) => {
                  const Icon = icon;
                  return (
                    <button
                      key={label}
                      onClick={action}
                      className="flex w-full items-center justify-between rounded-xl sm:rounded-2xl border border-gray-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-left transition hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-100">
                          {Icon ? <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-800" /> : null}
                        </span>
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-gray-900">{label}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">{hint}</p>
                        </div>
                      </div>
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={`${cardBase} bg-gradient-to-br from-white to-gray-50`}>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-gray-400">Actividad</p>
              <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-4">
                <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
                  <p className="text-2xl sm:text-3xl font-black text-gray-900">0</p>
                  <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-gray-500">Pedidos</p>
                </div>
                <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
                  <p className="text-2xl sm:text-3xl font-black text-gray-900">$0</p>
                  <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-gray-500">Total</p>
                </div>
              </div>
            </section>

            <section className={cardBase}>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-gray-400">Soporte</p>
              <h3 className="mt-2 sm:mt-3 text-lg sm:text-xl md:text-2xl font-black text-gray-900">¿Necesitas ayuda?</h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-600">Escríbenos y te guiamos en minutos.</p>
              <button
                onClick={() => navigate('/contact')}
                className="mt-4 sm:mt-6 w-full rounded-xl sm:rounded-2xl border border-gray-200 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.35em] text-gray-800 hover:bg-gray-50"
              >
                Contactar soporte
              </button>
            </section>

            <section className={cardBase}>
              <div className="flex items-center justify-between gap-3 sm:gap-4 border-b border-gray-100 pb-4 sm:pb-6">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-gray-400">Seguridad</p>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">Contraseña</h2>
                </div>
                <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-gray-200 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.35em] text-gray-700 flex-shrink-0">
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                  Protegida
                </span>
              </div>

              <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className={labelBase}>Contraseña actual</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    className={inputBase}
                    placeholder="Ingresa tu contraseña actual"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelBase}>Nueva contraseña</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className={inputBase}
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelBase}>Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmNewPassword: e.target.value }))}
                    className={inputBase}
                    placeholder="Repite tu nueva contraseña"
                    required
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600/90 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {changingPassword ? 'Guardando' : 'Actualizar contraseña'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/login', { state: { mode: 'forgot' } })}
                    className="text-sm font-semibold text-red-600 hover:text-red-700 text-left"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </form>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
