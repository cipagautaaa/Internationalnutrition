import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, Loader, CheckCircle2, RefreshCcw, Shield } from 'lucide-react';
import Alert from '../components/Alert';

// Login por email + código + posible PIN admin
const EmailLogin = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'code' | 'admin-pin'
  const [emailError, setEmailError] = useState('');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const { login, verifyCode, verifyAdminPin, resendCode, loading } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (value) => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? '' : 'Por favor ingresa un email válido';
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setAlert({ show: false, type: '', message: '' });
    const validation = validateEmail(email);
    if (validation) {
      setEmailError(validation);
      return;
    }
    const result = await login(email);
    if (result.success && result.adminPinRequired) {
      // Flujo: admin verificado previamente (isEmailVerified true) pero requiere PIN
      setAlert({ show: true, type: 'info', message: 'Introduce tu PIN de administrador.' });
      setStep('admin-pin');
      return;
    }
    if (result.success && result.requiresVerification) {
      setAlert({ show: true, type: 'success', message: 'Código enviado a tu correo.' });
      setStep('code');
    } else if (result.success) {
      setAlert({ show: true, type: 'success', message: 'Inicio de sesión exitoso.' });
      setTimeout(() => navigate('/'), 800);
    } else {
      setAlert({ show: true, type: 'error', message: result.error || 'Error al iniciar sesión' });
    }
  };

  const handleSubmitCode = async (e) => {
    e.preventDefault();
    setAlert({ show: false, type: '', message: '' });
    if (!code.trim()) {
      setAlert({ show: true, type: 'error', message: 'Ingresa el código enviado a tu email.' });
      return;
    }
    const result = await verifyCode(email, code.trim());
    if (result.success && result.adminPinRequired) {
      setAlert({ show: true, type: 'info', message: 'Introduce tu PIN de administrador.' });
      setStep('admin-pin');
      return;
    }
    if (result.success) {
      setAlert({ show: true, type: 'success', message: '¡Verificación exitosa!' });
      setTimeout(() => navigate('/'), 1000);
    } else {
      setAlert({ show: true, type: 'error', message: result.error || 'Código inválido' });
    }
  };

  const handleSubmitPin = async (e) => {
    e.preventDefault();
    setAlert({ show: false, type: '', message: '' });
    if (!pin || pin.length < 4) {
      setAlert({ show: true, type: 'error', message: 'PIN mínimo 4 dígitos.' });
      return;
    }
    const res = await verifyAdminPin(pin);
    if (res.success) {
      setAlert({ show: true, type: 'success', message: 'PIN correcto. Sesión iniciada.' });
      setTimeout(() => navigate('/'), 600);
    } else {
      setAlert({ show: true, type: 'error', message: res.error || 'PIN incorrecto' });
    }
  };

  const handleResend = async () => {
    setAlert({ show: false, type: '', message: '' });
    const result = await resendCode(email);
    if (result.success) {
      setAlert({ show: true, type: 'success', message: 'Nuevo código enviado.' });
    } else {
      setAlert({ show: true, type: 'error', message: result.error || 'No se pudo reenviar el código.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {alert.show && (
          <Alert type={alert.type} message={alert.message} />
        )}
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            {step === 'email' && 'Iniciar Sesión'}
            {step === 'code' && 'Verificar Código'}
            {step === 'admin-pin' && 'PIN Administrador'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'email' && 'Ingresa tu email para continuar'}
            {step === 'code' && 'Revisa tu correo y escribe el código'}
            {step === 'admin-pin' && 'Introduce tu PIN para completar el acceso'}
          </p>
        </div>

        {step === 'email' && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmitEmail}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border ${emailError ? 'border-red-7000' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                    placeholder="tu@email.com"
                    value={email}
                    onChange={handleEmailChange}
                  />
                </div>
                {emailError && <p className="mt-1 text-sm text-red-700">{emailError}</p>}
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading || emailError || !email}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {loading ? (
                    <Loader className="h-5 w-5 text-primary-200 animate-spin" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-primary-200 group-hover:text-white" />
                  )}
                </span>
                {loading ? 'Procesando...' : 'Continuar'}
              </button>
            </div>
          </form>
        )}

        {step === 'code' && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmitCode}>
            <div className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  maxLength={6}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm tracking-widest text-center"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={handleResend} className="flex items-center gap-1 text-primary-600 hover:underline disabled:opacity-50" disabled={loading}>
                  <RefreshCcw className="h-4 w-4" /> Reenviar código
                </button>
                <button type="button" onClick={() => setStep('email')} className="text-gray-500 hover:underline">
                  Cambiar email
                </button>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading || code.length < 4}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {loading ? (
                    <Loader className="h-5 w-5 text-green-200 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-200 group-hover:text-white" />
                  )}
                </span>
                {loading ? 'Verificando...' : 'Verificar Código'}
              </button>
            </div>
          </form>
        )}

        {step === 'admin-pin' && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmitPin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">PIN Administrador</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="pin"
                    name="pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm tracking-widest text-center"
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Introduce tu PIN (4-10 dígitos). Este paso sólo aparece para administradores.</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => { setPin(''); }} className="text-gray-500 hover:underline">
                  Limpiar
                </button>
                <button type="button" onClick={() => setStep('email')} className="text-gray-500 hover:underline">
                  Volver
                </button>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading || pin.length < 4}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {loading ? (
                    <Loader className="h-5 w-5 text-indigo-200 animate-spin" />
                  ) : (
                    <Shield className="h-5 w-5 text-indigo-200 group-hover:text-white" />
                  )}
                </span>
                {loading ? 'Validando...' : 'Verificar PIN'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <button
            type="button"
            className="text-primary-600 hover:underline font-semibold"
            onClick={() => navigate('/login')}
          >
            Ir a Login simple
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailLogin;
