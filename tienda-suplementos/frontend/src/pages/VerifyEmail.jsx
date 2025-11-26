import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { Check, Loader, RefreshCw } from 'lucide-react';

const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [resendCooldown, setResendCooldown] = useState(0);
  const { verifyCode, resendCode, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Recuperar email de location.state o de localStorage
  const [email, setEmail] = useState(() => location.state?.email || localStorage.getItem('pendingEmail') || '');

  // Si el email cambia (por navegación), actualizar localStorage
  useEffect(() => {
    if (email) {
      localStorage.setItem('pendingEmail', email);
    }
  }, [email]);

  useEffect(() => {
    if (!email) {
      setAlert({ show: true, type: 'error', message: 'No se encontró el email. Por favor inicia sesión de nuevo.' });
      setTimeout(() => {
        localStorage.removeItem('pendingEmail');
        navigate('/email-login');
      }, 2000);
    }
  }, [email, navigate]);

  // Cooldown para reenvío
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
        if (!email) {
          setAlert({ show: true, type: 'error', message: 'No se encontró el email. Por favor inicia sesión de nuevo.' });
          localStorage.removeItem('pendingEmail');
          return;
        }
        if (code.length !== 6) {
          setAlert({
            show: true,
            type: 'error',
            message: 'El código debe tener 6 dígitos'
          });
          return;
        }

        setAlert({ show: false, type: '', message: '' });
        let finished = false;
        // Timeout de seguridad para nunca dejar loading atascado
        const timeout = setTimeout(() => {
          if (!finished) {
            setAlert({ show: true, type: 'error', message: 'Tiempo de espera agotado. Intenta de nuevo.' });
          }
        }, 10000);
        try {
          let result = await Promise.race([
            verifyCode(email, code),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 9000))
          ]);
          finished = true;
          clearTimeout(timeout);
          if (result && result.success) {
            localStorage.removeItem('pendingEmail');
            setAlert({
              show: true,
              type: 'success',
              message: '¡Email verificado correctamente!'
            });
            setTimeout(() => {
              navigate('/');
            }, 1500);
          } else {
            setAlert({
              show: true,
              type: 'error',
              message: (result && result.error) || 'Código inválido, expirado o error de red'
            });
          }
        } catch (error) {
          finished = true;
          clearTimeout(timeout);
          setAlert({
            show: true,
            type: 'error',
            message: error?.message || 'Error de red o del servidor'
          });
        }
  };

  const handleResendCode = async () => {
    try {
      setAlert({ show: false, type: '', message: '' });
      const result = await resendCode(email);
      if (result.success) {
        setAlert({
          show: true,
          type: 'success',
          message: '¡Nuevo código enviado! Revisa tu correo electrónico.'
        });
        setResendCooldown(60); // 60 segundos de cooldown
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: result.error || 'Error al reenviar el código'
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: error.message || 'Error al reenviar el código'
      });
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  if (!email) {
    return null; // No renderizar nada si no hay email (se redirigirá a /login)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {alert.show && <Alert type={alert.type} message={alert.message} />}
        
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verifica tu email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hemos enviado un código de verificación a {email}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="verification-code" className="sr-only">
                Código de verificación
              </label>
              <input
                id="verification-code"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                placeholder="123456"
                value={code}
                onChange={handleCodeChange}
                autoComplete="one-time-code"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || code.length !== 6 || !email}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {loading ? (
                  <Loader className="h-5 w-5 text-primary-500 animate-spin" />
                ) : (
                  <Check className="h-5 w-5 text-primary-500 group-hover:text-primary-400" />
                )}
              </span>
              {loading ? 'Verificando...' : 'Verificar código'}
            </button>
            {/* Depuración: mostrar email y código */}
            <div style={{fontSize: '12px', color: '#888', marginTop: 8}}>
              <strong>Debug:</strong> email: {email || 'N/A'} | código: {code}
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              ¿No recibiste el código?
            </p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || loading}
              className="font-medium text-primary-600 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {resendCooldown > 0 
                ? `Reenviar en ${resendCooldown}s` 
                : 'Reenviar código'
              }
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('pendingEmail');
                navigate('/email-login');
              }}
              className="block w-full text-sm font-medium text-gray-600 hover:text-gray-500"
            >
              Cambiar email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
