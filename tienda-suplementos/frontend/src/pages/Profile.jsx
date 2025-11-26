import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Alert from '../components/Alert';

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Alert 
          show={alert.show} 
          message={alert.message} 
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'info' })}
        />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y de envío</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Información básica */}
          <div className="lg:col-span-2 space-y-6">
            {/* Perfil básico */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Información Personal</h2>
                <button
                  onClick={() => setEditing(!editing)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {editing ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              {editing ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm(prev => ({
                          ...prev,
                          firstName: e.target.value
                        }))}
                        className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido
                      </label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm(prev => ({
                          ...prev,
                          lastName: e.target.value
                        }))}
                        className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        phone: e.target.value
                      }))}
                      className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <p className="font-medium">{profile?.email}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Nombre:</span>
                      <p className="font-medium">{profile?.firstName || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Apellido:</span>
                      <p className="font-medium">{profile?.lastName || 'No especificado'}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Teléfono:</span>
                    <p className="font-medium">{profile?.phone || 'No especificado'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Información de envío */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Información de Envío</h2>
                <button
                  onClick={() => setEditingShipping(!editingShipping)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {editingShipping ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              {editingShipping ? (
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        value={shippingForm.fullName}
                        onChange={(e) => setShippingForm(prev => ({
                          ...prev,
                          fullName: e.target.value
                        }))}
                        className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={shippingForm.phoneNumber}
                        onChange={(e) => setShippingForm(prev => ({
                          ...prev,
                          phoneNumber: e.target.value
                        }))}
                        className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      value={shippingForm.street}
                      onChange={(e) => setShippingForm(prev => ({
                        ...prev,
                        street: e.target.value
                      }))}
                      className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Calle, número, barrio"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complemento de dirección
                    </label>
                    <input
                      type="text"
                      value={shippingForm.addressLine2}
                      onChange={(e) => setShippingForm(prev => ({
                        ...prev,
                        addressLine2: e.target.value
                      }))}
                      className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Apartamento, piso, etc. (opcional)"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm(prev => ({
                          ...prev,
                          city: e.target.value
                        }))}
                        className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Departamento *
                      </label>
                      <select
                        value={shippingForm.region}
                        onChange={(e) => setShippingForm(prev => ({
                          ...prev,
                          region: e.target.value
                        }))}
                        className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Seleccionar departamento</option>
                        {regions.map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código postal
                      </label>
                      <input
                        type="text"
                        value={shippingForm.zipCode}
                        onChange={(e) => setShippingForm(prev => ({
                          ...prev,
                          zipCode: e.target.value
                        }))}
                        className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        País
                      </label>
                      <input
                        type="text"
                        value={shippingForm.country}
                        onChange={(e) => setShippingForm(prev => ({
                          ...prev,
                          country: e.target.value
                        }))}
                        className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : 'Guardar Información de Envío'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingShipping(false)}
                      className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {profile?.shippingInfo?.fullName ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Nombre completo:</span>
                          <p className="font-medium">{profile.shippingInfo.fullName}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Teléfono:</span>
                          <p className="font-medium">{profile.shippingInfo.phoneNumber}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Dirección:</span>
                        <p className="font-medium">{profile.shippingInfo.street}</p>
                        {profile.shippingInfo.addressLine2 && (
                          <p className="text-gray-600">{profile.shippingInfo.addressLine2}</p>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Ciudad:</span>
                          <p className="font-medium">{profile.shippingInfo.city}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Departamento:</span>
                          <p className="font-medium">{profile.shippingInfo.region}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-4">📍</div>
                      <p className="text-gray-600 mb-4">No has configurado tu información de envío</p>
                      <button
                        onClick={() => setEditingShipping(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Accesos Rápidos</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                >
                  <span className="text-blue-600 mr-3">📦</span>
                  <span>Mis Pedidos</span>
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                >
                  <span className="text-green-600 mr-3">🛍️</span>
                  <span>Ver Productos</span>
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                >
                  <span className="text-purple-600 mr-3">🛒</span>
                  <span>Mi Carrito</span>
                </button>
              </div>
            </div>

            {/* Información de cuenta */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Información de Cuenta</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Email verificado:</span>
                  <p className={`font-medium ${profile?.isEmailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {profile?.isEmailVerified ? 'Sí' : 'Pendiente'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Miembro desde:</span>
                  <p className="font-medium">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('es-CO') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Cerrar sesión */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <button
                onClick={handleLogout}
                className="w-full bg-red-700 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}