import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';
import Alert from './Alert';

const EmailLogin = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // 'email' o 'code'
  const [code, setCode] = useState('');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const { sendCode, verifyCode, resendCode, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    try {
      setAlert({ show: false, type: '', message: '' });
      const result = await sendCode(email);
      if (result.success) {
        setAlert({
          show: true,
          type: 'success',
          message: '¡Código enviado! Revisa tu correo electrónico.'
        });
        setStep('code');
      }
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: error.message || 'Error al enviar el código'
      });
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      setAlert({ show: false, type: '', message: '' });
      const result = await verifyCode(email, code);
      if (result.success) {
        setAlert({
          show: true,
          type: 'success',
          message: '¡Verificación exitosa!'
        });
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: error.message || 'Error al verificar el código'
      });
    }
  };

  const handleResendCode = async () => {
    const result = await resendCode(email);
    if (result.success) {
      // Mostrar mensaje de éxito
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setCode('');
    clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <Mail className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 'email' ? 'Ingresa tu email' : 'Verifica tu código'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'email' 
              ? 'Te enviaremos un código de verificación'
              : `Código enviado a ${email}`
            }
          </p>
        </div>
        
        {step === 'email' ? (
          <form className="mt-8 space-y-6" onSubmit={handleSendCode}>
            {error && (
              <div className="bg-red-700 border border-red-700 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) clearError();
                  }}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Código'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyCode}>
            {error && (
              <div className="bg-red-700 border border-red-700 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Código de Verificación
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (error) clearError();
                  }}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-center text-2xl tracking-widest sm:text-sm"
                  placeholder="000000"
                  maxLength="6"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Ingresa el código de 6 dígitos que recibiste por email
              </p>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : 'Verificar Código'}
              </button>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="flex items-center text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reenviar Código
                </button>
                
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="text-sm text-gray-600 hover:text-gray-500"
                >
                  Cambiar Email
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmailLogin;
