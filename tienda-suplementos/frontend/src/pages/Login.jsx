
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import headerImg from '../assets/images/logo-largo-int-removebg-preview.png';

// Este componente ahora representa el REGISTRO (sign in) con verificación de código
export default function Login() {
  const location = useLocation();
  const [form, setForm] = useState({
    fullName: '',
    email: location.state?.email || '',
    phone: '',
    birthDate: '',
    password: ''
  });
  const [code, setCode] = useState('');
  const [step, setStep] = useState(location.state?.step === 'code' ? 'code' : 'form'); // 'form' | 'code' | 'success'
  const [message, setMessage] = useState(null);
  const { register, verifyCode, resendCode, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMessage(null);
  }, [step]);

  const isPasswordStrong = (pwd) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd || '');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!isPasswordStrong(form.password)) {
      setMessage({ type: 'error', text: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.' });
      return;
    }
    const result = await register(form);
    if (result.success) {
      setMessage({ type: 'success', text: '¡Genial! Te enviamos un código de verificación. Revisa spam/promociones.' });
      setStep('code');
    } else {
      setMessage({ type: 'error', text: result.error || 'No pudimos enviar el código.' });
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const result = await verifyCode(form.email, code.trim());
    if (result.success) {
      setMessage({ type: 'success', text: '¡Listo! Cuenta verificada y sesión iniciada.' });
      setStep('success');
    } else {
      setMessage({ type: 'error', text: result.error || 'Código inválido.' });
    }
  };

  const handleResend = async () => {
    setMessage(null);
    try {
      const r = await resendCode(form.email);
      if (r.success) {
        setMessage({ type: 'success', text: 'Nuevo código enviado. Revisa spam/promociones.' });
      } else {
        setMessage({ type: 'error', text: r.error || 'No se pudo reenviar.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error reenviando.' });
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 relative z-10 overflow-hidden rounded-3xl shadow-2xl max-h-[calc(100vh-1.5rem)] md:max-h-none">
        {/* Columna izquierda - Información */}
        <div className="hidden md:flex flex-col justify-center text-white bg-gradient-to-br from-gray-900 via-red-900/30 to-gray-900 space-y-6 p-10">
          <div className="space-y-4">
            <div className="inline-block">
              <img src={headerImg} alt="INT Suplementos" className="h-12 brightness-0 invert" />
            </div>
            <h2 className="text-4xl font-bold leading-tight">
              Únete a la mejor
              <span className="block text-red-500">comunidad fitness</span>
            </h2>
            <p className="text-gray-300 text-lg">
              {step === 'form' ? 'Crea tu cuenta y accede a productos premium' : 
               step === 'code' ? 'Verifica tu identidad para continuar' : 
               '¡Activa tu 20% OFF con el código INTSUPPS20!'}
            </p>
          </div>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-gray-200">Envío gratis desde $80.000</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-gray-200">Productos 100% originales</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-gray-200">Garantía de 30 días</span>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formulario */}
        <div className="bg-white rounded-3xl md:rounded-r-3xl shadow-2xl p-6 sm:p-8 space-y-5 relative max-h-full overflow-y-auto">
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
              {step === 'form' ? 'Crear cuenta' : step === 'code' ? 'Verifica tu correo' : '¡Descuento listo!'}
            </h1>
            <p className="text-gray-600">
              {step === 'form' ? 'Completa tus datos para crear tu cuenta' : 
               step === 'code' ? 'Revisa tu bandeja de entrada (incluye spam/promociones)' : 
               'Usa tu código exclusivo en tu próxima compra'}
            </p>
          </div>
          {message && (
            <div
              key={message.timestamp}
              className={`rounded-xl px-4 py-3.5 text-sm font-medium flex items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                </svg>
              )}
              {message.text}
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleRegister} className="space-y-4 pb-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre completo</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-red-600 focus:ring-4 focus:ring-red-100 transition-all"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Celular</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-red-600 focus:ring-4 focus:ring-red-100 transition-all"
                    placeholder="3001234567"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-red-600 focus:ring-4 focus:ring-red-100 transition-all"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cumpleaños</label>
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, birthDate: e.target.value }))}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-red-600 focus:ring-4 focus:ring-red-100 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-base focus:border-red-600 focus:ring-4 focus:ring-red-100 transition-all"
                  placeholder="Mínimo 8 caracteres, mayúscula, minúscula y número"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !form.fullName || !form.email || !form.phone || !form.birthDate || !form.password}
                className={`w-full rounded-xl px-4 py-3 text-white font-bold text-base transition-all transform ${
                  loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {loading ? 'Enviando código...' : 'Crear cuenta y recibir código →'}
              </button>

              <p className="text-sm text-gray-500 text-center">
                ¿Ya tienes cuenta?{' '}
                <button className="font-bold text-red-600 hover:text-red-700" onClick={() => navigate('/login')}>
                  Inicia sesión
                </button>
              </p>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-5 pb-2">
              <div>
                <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
                  Código de verificación
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-4 text-2xl font-bold tracking-[0.35em] text-center focus:border-red-600 focus:ring-4 focus:ring-red-100 transition-all"
                  placeholder="• • • • • •"
                  required
                />
                <p className="mt-2 text-xs text-gray-500 text-center">Revisa tu correo {form.email}. Si no lo ves, mira en Spam o Promociones.</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <button type="button" onClick={handleResend} disabled={loading} className="font-semibold text-red-600 hover:text-red-700 disabled:text-gray-400 transition">
                  ↻ Reenviar código
                </button>
                <button type="button" onClick={() => setStep('form')} className="text-gray-600 hover:text-gray-800 transition">
                  ← Editar datos
                </button>
              </div>
              <button
                type="submit"
                disabled={loading || code.length < 4}
                className={`w-full rounded-xl px-4 py-3 text-white font-bold text-base transition-all transform ${
                  loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {loading ? 'Verificando...' : 'Verificar y finalizar ✓'}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="space-y-6 text-center">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-5">
                <p className="text-sm font-semibold text-emerald-700">¡Registro completado!</p>
                <p className="text-lg font-bold text-emerald-900 mt-2">Tu código: INTSUPPS20</p>
                <p className="text-sm text-emerald-800">Cópialo y pégalo al finalizar tu compra.</p>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
                  onClick={() => navigator.clipboard?.writeText('INTSUPPS20')}
                >
                  Copiar código
                </button>
              </div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full rounded-xl px-4 py-3.5 text-white font-bold text-base transition-all transform bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                Ir a comprar →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}