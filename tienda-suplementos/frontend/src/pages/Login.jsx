
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import headerImg from '../assets/images/logo-largo-int-removebg-preview.png';

// Este componente ahora representa el REGISTRO (sign in) con verificación de código
export default function Login() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'code' | 'admin-pin'
  const [message, setMessage] = useState(null);
  const { login, verifyCode, verifyAdminPin, resendCode, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Si venimos redirigidos desde LoginSimple con email y paso de código
  useEffect(() => {
    const st = location.state;
    if (st?.email) {
      setEmail(st.email);
    }
    if (st?.step === 'code') {
      setStep('code');
    }
  }, [location.state]);

  // Limpiar mensajes cuando cambia el step
  useEffect(() => {
    setMessage(null);
    setPin('');
  }, [step]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const result = await login(email);
    if (result.success && result.adminPinRequired) {
      // Admin necesita ingresar PIN
      setMessage({ type: 'success', text: 'Ingresa tu PIN de administrador.' });
      setStep('admin-pin');
    } else if (result.success && result.requiresVerification) {
      setMessage({ type: 'success', text: 'Código enviado. Revisa tu correo.' });
      setStep('code');
    } else if (result.success && !result.requiresVerification) {
      // Si ya estaba verificado, simplemente loguea
      setMessage({ type: 'success', text: 'Cuenta ya verificada. Sesión iniciada.' });
      // Volver a checkout si viene de ahí, sino al inicio
      const redirectPath = location.state?.from || '/';
      setTimeout(() => navigate(redirectPath), 800);
    } else {
      setMessage({ type: 'error', text: result.error || 'Error enviando código.' });
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const result = await verifyCode(email, code.trim());
    if (result.success) {
      setMessage({ type: 'success', text: '¡Registro verificado e inicio de sesión exitoso!' });
      // Volver a checkout si viene de ahí, sino al inicio
      const redirectPath = location.state?.from || '/';
      setTimeout(() => navigate(redirectPath), 1000);
    } else {
      setMessage({ type: 'error', text: result.error || 'Código inválido.' });
    }
  };

  const handleResend = async () => {
    setMessage(null);
    try {
      const r = await resendCode(email);
      if (r.success) {
        setMessage({ type: 'success', text: 'Nuevo código enviado.' });
      } else {
        setMessage({ type: 'error', text: r.error || 'No se pudo reenviar.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error reenviando.' });
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const inputPin = pin.trim();
    
    console.log('🔐 PIN Submit:', inputPin);
    
    const result = await verifyAdminPin(inputPin);
    console.log('🔐 PIN Response:', result);
    
    if (result.success) {
      console.log('✅ PIN correcto, navegando...');
      setMessage({ type: 'success', text: '¡PIN correcto! Iniciando sesión...', timestamp: Date.now() });
      setTimeout(() => navigate('/admin'), 1000);
    } else {
      console.log('❌ PIN fallido:', result.error);
      setPin('');
      setMessage({ type: 'error', text: result.error || 'PIN inválido o bloqueado.', timestamp: Date.now() });
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
              Únete a la mejor
              <span className="block text-red-500">comunidad fitness</span>
            </h2>
            <p className="text-gray-300 text-lg">
              {step === 'email' ? 'Crea tu cuenta y accede a productos premium' : 
               step === 'code' ? 'Verifica tu identidad para continuar' : 
               'Acceso exclusivo para administradores'}
            </p>
          </div>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-gray-200">Envío gratis desde $0</span>
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
              {step === 'email' ? 'Crear cuenta' : step === 'code' ? 'Verificar código' : 'Acceso admin'}
            </h1>
            <p className="text-gray-600">
              {step === 'email' ? 'Ingresa tu correo para comenzar' : 
               step === 'code' ? 'Revisa tu bandeja de entrada' : 
               'Ingresa tu PIN de seguridad'}
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

          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
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
              <button
                type="submit"
                disabled={loading || !email}
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
                    Enviando...
                  </span>
                ) : 'Continuar →'}
              </button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-5">
              <div>
                <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
                  Código de verificación
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-4 text-2xl font-bold tracking-[0.5em] text-center focus:border-red-600 focus:ring-4 focus:ring-red-100 transition-all"
                  placeholder="• • • • • •"
                  required
                />
                <p className="mt-2 text-xs text-gray-500 text-center">Revisa tu correo {email}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <button type="button" onClick={handleResend} disabled={loading} className="font-semibold text-red-600 hover:text-red-700 disabled:text-gray-400 transition">
                  ↻ Reenviar código
                </button>
                <button type="button" onClick={() => setStep('email')} className="text-gray-600 hover:text-gray-800 transition">
                  ← Cambiar email
                </button>
              </div>
              <button
                type="submit"
                disabled={loading || code.length < 4}
                className={`w-full rounded-xl px-4 py-3.5 text-white font-bold text-base transition-all transform ${
                  loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {loading ? 'Verificando...' : 'Verificar y continuar ✓'}
              </button>
            </form>
          )}

          {step === 'admin-pin' && (
            <form onSubmit={handlePinSubmit} className="space-y-5">
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
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    minLength={4}
                    maxLength={10}
                    className="w-full rounded-xl border-2 border-gray-200 pl-12 pr-4 py-3.5 text-xl font-bold tracking-[0.5em] text-center focus:border-gray-900 focus:ring-4 focus:ring-gray-200 transition-all"
                    placeholder="••••"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 text-center">PIN de 4 a 10 dígitos</p>
              </div>
              <div className="flex justify-center text-sm">
                <button type="button" onClick={() => { setStep('email'); setPin(''); setEmail(''); }} className="font-semibold text-gray-600 hover:text-gray-800 transition">
                  ← Cambiar cuenta
                </button>
              </div>
              <button
                type="submit"
                disabled={loading || pin.length < 4}
                className={`w-full rounded-xl px-4 py-3.5 text-white font-bold text-base transition-all transform ${
                  loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {loading ? 'Verificando...' : 'Acceder al panel 🔒'}
              </button>
            </form>
          )}

          <div className="pt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <button className="font-bold text-red-600 hover:text-red-700 transition" onClick={() => navigate('/login')}>
                Inicia sesión →
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}