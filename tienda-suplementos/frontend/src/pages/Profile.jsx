import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Alert from '../components/Alert';
import { 
  UserCircle, 
  MapPin, 
  ShoppingBag, 
  ShoppingCart,
  LogOut,
  PenSquare,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Home,
  Building,
  Globe
} from 'lucide-react';

export default function Profile() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  
  // Datos del perfil
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingShipping, setEditingShipping] = useState(false);
  
  // Formulario de perfil básico
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });
  
  // Formulario de información de envío
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    phoneNumber: '',
    street: '',
    addressLine2: '',
    city: '',
    region: '',
    zipCode: '',
    country: 'Colombia'
  });

  const regions = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 
    'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 
    'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 
    'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 
    'Valle del Cauca', 'Vaupés', 'Vichada'
  ];

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
        
        // Llenar formulario de perfil básico
        setProfileForm({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || ''
        });
        
        // Llenar formulario de información de envío
        const shipping = userData.shippingInfo || {};
        setShippingForm({
          fullName: shipping.fullName || '',
          phoneNumber: shipping.phoneNumber || '',
          street: shipping.street || '',
          addressLine2: shipping.addressLine2 || '',
          city: shipping.city || '',
          region: shipping.region || '',
          zipCode: shipping.zipCode || '',
          country: shipping.country || 'Colombia'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setAlert({
        show: true,
        message: 'Error cargando el perfil',
        type: 'error'
      });
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
        setAlert({
          show: true,
          message: 'Perfil actualizado exitosamente',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlert({
        show: true,
        message: error.response?.data?.message || 'Error actualizando el perfil',
        type: 'error'
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
        setProfile(prev => ({
          ...prev,
          shippingInfo: response.data.shippingInfo
        }));
        setEditingShipping(false);
        setAlert({
          show: true,
          message: 'Información de envío actualizada exitosamente',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error updating shipping info:', error);
      setAlert({
        show: true,
        message: error.response?.data?.message || 'Error actualizando la información de envío',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <UserCircle className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-gray-600 mt-6 text-lg font-medium">Cargando tu perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Alert 
          show={alert.show} 
          message={alert.message} 
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'info' })}
        />

        {/* Header con avatar */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                <UserCircle className="w-16 h-16 text-white" />
              </div>
              {profile?.isEmailVerified && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 shadow-lg">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {profile?.firstName && profile?.lastName 
                  ? `${profile.firstName} ${profile.lastName}`
                  : 'Mi Perfil'}
              </h1>
              <p className="text-gray-600 mb-3 flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" />
                {profile?.email}
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  profile?.isEmailVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile?.isEmailVerified ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Email verificado
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-1" />
                      Verificación pendiente
                    </>
                  )}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <Clock className="w-4 h-4 mr-1" />
                  Miembro desde {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Información básica */}
          <div className="lg:col-span-2 space-y-6">
            {/* Perfil básico */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Información Personal</h2>
                </div>
                <button
                  onClick={() => setEditing(!editing)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    editing 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  {editing ? (
                    <>
                      <XCircle className="w-5 h-5" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <PenSquare className="w-5 h-5" />
                      Editar
                    </>
                  )}
                </button>
              </div>

              {editing ? (
                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm(prev => ({
                          ...prev,
                          firstName: e.target.value
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Ingresa tu nombre"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Apellido
                      </label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm(prev => ({
                          ...prev,
                          lastName: e.target.value
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Ingresa tu apellido"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        phone: e.target.value
                      }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Ej: +57 300 123 4567"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
                    >
                      <XCircle className="w-5 h-5" />
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-700">Email</span>
                    </div>
                    <p className="font-medium text-gray-900 text-lg">{profile?.email}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <span className="text-sm font-semibold text-gray-600 block mb-2">Nombre</span>
                      <p className="font-medium text-gray-900 text-lg">{profile?.firstName || 'No especificado'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <span className="text-sm font-semibold text-gray-600 block mb-2">Apellido</span>
                      <p className="font-medium text-gray-900 text-lg">{profile?.lastName || 'No especificado'}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-600">Teléfono</span>
                    </div>
                    <p className="font-medium text-gray-900 text-lg">{profile?.phone || 'No especificado'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Información de envío */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Información de Envío</h2>
                </div>
                <button
                  onClick={() => setEditingShipping(!editingShipping)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    editingShipping 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {editingShipping ? (
                    <>
                      <XCircle className="w-5 h-5" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <PenSquare className="w-5 h-5" />
                      Editar
                    </>
                  )}
                </button>
              </div>

              {editingShipping ? (
                <form onSubmit={handleShippingSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <UserCircle className="w-4 h-4" />
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        value={shippingForm.fullName}
                        onChange={(e) => setShippingForm(prev => ({
                          ...prev,
                          fullName: e.target.value
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="Nombre de quien recibe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={shippingForm.phoneNumber}
                        onChange={(e) => setShippingForm(prev => ({
                          ...prev,
                          phoneNumber: e.target.value
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="+57 300 123 4567"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Dirección principal *
                    </label>
                    <input
                      type="text"
                      value={shippingForm.street}
                      onChange={(e) => setShippingForm(prev => ({
                        ...prev,
                        street: e.target.value
                      }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Calle 123 #45-67, Barrio Centro"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Complemento de dirección
                    </label>
                    <input
                      type="text"
                      value={shippingForm.addressLine2}
                      onChange={(e) => setShippingForm(prev => ({
                        ...prev,
                        addressLine2: e.target.value
                      }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Apartamento 301, Torre A (opcional)"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm(prev => ({
                          ...prev,
                          city: e.target.value
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="Ej: Bogotá"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Departamento *
                      </label>
                      <select
                        value={shippingForm.region}
                        onChange={(e) => setShippingForm(prev => ({
                          ...prev,
                          region: e.target.value
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                        required
                      >
                        <option value="">Seleccionar departamento</option>
                        {regions.map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Código postal
                      </label>
                      <input
                        type="text"
                        value={shippingForm.zipCode}
                        onChange={(e) => setShippingForm(prev => ({
                          ...prev,
                          zipCode: e.target.value
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="110111"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        País *
                      </label>
                      <input
                        type="text"
                        value={shippingForm.country}
                        onChange={(e) => setShippingForm(prev => ({
                          ...prev,
                          country: e.target.value
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="Colombia"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {saving ? 'Guardando...' : 'Guardar Información'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingShipping(false)}
                      className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
                    >
                      <XCircle className="w-5 h-5" />
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5">
                  {profile?.shippingInfo?.fullName ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <UserCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-semibold text-gray-700">Nombre completo</span>
                          </div>
                          <p className="font-medium text-gray-900 text-lg">{profile.shippingInfo.fullName}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Phone className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-semibold text-gray-700">Teléfono</span>
                          </div>
                          <p className="font-medium text-gray-900 text-lg">{profile.shippingInfo.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="w-6 h-6 text-purple-600" />
                          <span className="text-sm font-semibold text-gray-700">Dirección completa</span>
                        </div>
                        <p className="font-medium text-gray-900 text-base mb-1">{profile.shippingInfo.street}</p>
                        {profile.shippingInfo.addressLine2 && (
                          <p className="text-gray-600 text-sm">{profile.shippingInfo.addressLine2}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                            {profile.shippingInfo.city}
                          </span>
                          <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                            {profile.shippingInfo.region}
                          </span>
                          {profile.shippingInfo.zipCode && (
                            <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                              CP: {profile.shippingInfo.zipCode}
                            </span>
                          )}
                          <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                            {profile.shippingInfo.country || 'Colombia'}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                        <MapPin className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Sin dirección de envío</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">Agrega tu información de envío para facilitar tus compras futuras</p>
                      <button
                        onClick={() => setEditingShipping(true)}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <MapPin className="w-5 h-5" />
                        Agregar Información de Envío
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Accesos rápidos */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-purple-600" />
                </div>
                Accesos Rápidos
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full group p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all duration-200 flex items-center justify-between border-2 border-transparent hover:border-blue-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-blue-700">Mis Pedidos</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="w-full group p-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 rounded-xl transition-all duration-200 flex items-center justify-between border-2 border-transparent hover:border-green-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <ShoppingBag className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-green-700">Ver Productos</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full group p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 rounded-xl transition-all duration-200 flex items-center justify-between border-2 border-transparent hover:border-purple-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <ShoppingCart className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-purple-700">Mi Carrito</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Estadísticas de usuario (nueva sección) */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                Tu Actividad
              </h3>
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">0</div>
                  <div className="text-sm opacity-90">Pedidos realizados</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">$0</div>
                  <div className="text-sm opacity-90">Total comprado</div>
                </div>
              </div>
            </div>

            {/* Ayuda y soporte */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">¿Necesitas ayuda?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Estamos aquí para ayudarte con cualquier pregunta o problema que tengas.
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Contactar Soporte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}