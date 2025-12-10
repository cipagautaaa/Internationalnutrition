import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import headerImg from '../assets/images/logo-largo-int-removebg-preview.png';

export default function LoginSimple() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState(location.state?.mode || 'login'); // login | forgot | reset
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const { login, loading, pendingAdminPin, verifyAdminPin, error, clearError, requestPasswordReset, resetPassword } = useAuth();
  const [pin, setPin] = useState('');
  const [pinMessage, setPinMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    clearError?.();
    const result = await login(email, password);
    if (result.success && result.adminPinRequired) {
      setMessage({ type: 'info', text: 'Ingresa tu PIN de administrador' });
      return;
    }
    if (result.success && !result.requiresVerification) {
      setMessage({ type: 'success', text: 'Inicio de sesión exitoso' });
      setTimeout(() => navigate('/'), 800);
    } else if (result.requiresVerification) {
      setMessage({ type: 'error', text: 'Verifica tu correo antes de iniciar sesión. Te enviamos un código.' });
    } else if (result.error) {
      setMessage({ type: 'error', text: result.error });
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setMessage(null);
    const res = await requestPasswordReset(email);
    if (res.success) {
      setMode('reset');
      setMessage({ type: 'success', text: 'Enviamos un código a tu correo.' });
    } else {
      setMessage({ type: 'error', text: res.error || 'No pudimos enviar el código.' });
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage(null);
    const res = await resetPassword(email, code, newPassword);
    if (res.success) {
      setMessage({ type: 'success', text: 'Contraseña actualizada. Inicia sesión.' });
      setMode('login');
      setPassword('');
      setCode('');
      setNewPassword('');
    } else {
      setMessage({ type: 'error', text: res.error || 'No pudimos actualizar la contraseña.' });
    }
  };

  const handleVerifyPin = async (e) => {
    e.preventDefault();
    setPinMessage(null);
    const res = await verifyAdminPin(pin);
    if (res.success) {
      setPinMessage({ type: 'success', text: 'PIN correcto. Redirigiendo al panel de administración...' });
      setTimeout(() => navigate('/admin/products'), 600);
    } else {
      setPinMessage({ type: 'error', text: res.error || 'PIN inválido' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 relative z-10 overflow-hidden rounded-3xl shadow-2xl">
        {/* Columna izquierda - Información */}
        <div className="hidden md:flex flex-col justify-center text-white bg-gradient-to-br from-gray-900 via-red-900/30 to-gray-900 space-y-6 p-10">
          <div className="space-y-4">
            <div className="inline-block">
              <img src={headerImg} alt="INT Suplementos" className="h-12 brightness-0 invert" />
            </div>
            <h2 className="text-4xl font-bold leading-tight">
              Bienvenido de vuelta
              <span className="block text-red-500">a tu cuenta</span>
            </h2>
            <p className="text-gray-300 text-lg">
              {!pendingAdminPin ? 'Ingresa tu correo para acceder a' : 'Verifica tu identidad como administrador'}
            </p>
          </div>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-gray-200">productos de la mejor calidad</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-gray-200">Historial de compras</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-gray-200">Ofertas exclusivas</span>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formulario */}
        <div className="bg-white rounded-r-3xl shadow-2xl p-8 sm:p-10 space-y-6 relative">
          {/* Botón cerrar */}
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <div className="md:hidden flex justify-center mb-4">
            <img src={headerImg} alt="Marca" className="h-10" />
          </div>
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {!pendingAdminPin ? (mode === 'login' ? 'Iniciar sesión' : mode === 'forgot' ? 'Recuperar acceso' : 'Restablecer contraseña') : 'Verificación admin'}
            </h1>
            <p className="text-gray-600">
              {!pendingAdminPin ? 'Accede a tu cuenta con tu correo' : 'Ingresa tu PIN de seguridad'}
            </p>
          </div>

          {message && (
            <div className={`rounded-xl px-4 py-3.5 text-sm font-medium flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : message.type === 'info'
                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
              )}
              <span>{message.text}</span>
            </div>
          )}

          {!pendingAdminPin && (
            <>
              {mode === 'login' && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                        </svg>
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border-2 border-gray-200 pl-12 pr-4 py-3.5 text-base focus:border-red-600 focus:ring-4 focus:ring-red-100 transition-all"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0-1.105-.895-2-2-2s-2 .895-2 2 2 5 2 5 2-3.895 2-5z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border-2 border-gray-200 pl-12 pr-4 py-3.5 text-base focus:border-red-600 focus:ring-4 focus:ring-red-100 transition-all"
                        placeholder="Ingresa tu contraseña"
                        required
                      />
                    </div>
                    <div className="mt-2 text-right text-sm">
                      <button type="button" className="text-red-600 hover:text-red-700 font-semibold" onClick={() => setMode('forgot')}>
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className={`w-full rounded-xl px-4 py-3.5 text-white font-bold text-base transition-all transform ${
                      loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cargando...
                      </span>
                    ) : 'Iniciar sesión →'}
                  </button>
                </form>
              )}

              {mode === 'forgot' && (
                <form onSubmit={handleForgot} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Correo registrado</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-base focus:border-red-600 focus:ring-4 focus:ring-red-100 transition-all"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className={`w-full rounded-xl px-4 py-3.5 text-white font-bold text-base transition-all transform ${
                      loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {loading ? 'Enviando...' : 'Enviar código'}
                  </button>
                  <div className="text-center text-sm">
                    <button type="button" className="text-gray-600 hover:text-gray-800" onClick={() => setMode('login')}>
                      ← Volver a iniciar sesión
                    </button>
                  </div>
                </form>
              )}

              {mode === 'reset' && (
                <form onSubmit={handleReset} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Correo</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-base focus:border-red-600 focus:ring-4 focus:ring-red-100 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Código</label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-base focus:border-red-600 focus:ring-4 focus:ring-red-100 transition-all text-center tracking-[0.4em]"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nueva contraseña</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-base focus:border-red-600 focus:ring-4 focus:ring-red-100 transition-all"
                      placeholder="Mínimo 8 caracteres, mayúscula, minúscula y número"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !email || code.length !== 6 || newPassword.length < 8}
                    className={`w-full rounded-xl px-4 py-3.5 text-white font-bold text-base transition-all transform ${
                      loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {loading ? 'Actualizando...' : 'Guardar nueva contraseña'}
                  </button>
                  <div className="text-center text-sm">
                    <button type="button" className="text-gray-600 hover:text-gray-800" onClick={() => setMode('login')}>
                      ← Volver a iniciar sesión
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-4 text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes una cuenta?{' '}
                  <Link to="/sign-in" className="font-bold text-red-600 hover:text-red-700 transition">
                    Regístrate →
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* Paso 2: PIN Admin */}
          {pendingAdminPin && (
            <form onSubmit={handleVerifyPin} className="space-y-5">
              <div>
                <label htmlFor="pin" className="block text-sm font-semibold text-gray-700 mb-2">
                  PIN de administrador
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="pin"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g,''))}
                    className="w-full rounded-xl border-2 border-gray-200 pl-12 pr-4 py-3.5 text-xl font-bold tracking-[0.5em] text-center focus:border-gray-900 focus:ring-4 focus:ring-gray-200 transition-all"
                    placeholder="••••"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 text-center">PIN de 4 a 10 dígitos</p>
              </div>
              
              {pinMessage && (
                <div className={`rounded-xl px-4 py-3.5 text-sm font-medium flex items-center gap-3 ${
                  pinMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {pinMessage.type === 'success' ? (
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                    </svg>
                  )}
                  {pinMessage.text}
                </div>
              )}
              
              {error && (
                <div className="rounded-xl px-4 py-3.5 text-sm font-medium flex items-center gap-3 bg-red-50 text-red-800 border border-red-200">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                  </svg>
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading || pin.length < 4}
                className={`w-full rounded-xl px-4 py-3.5 text-white font-bold text-base transition-all transform ${
                  loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {loading ? 'Validando...' : 'Acceder al panel 🔒'}
              </button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setPin(''); setPinMessage(null); }}
                  className="text-sm font-semibold text-gray-600 hover:text-gray-800 transition"
                >
                  ← Reintentar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
