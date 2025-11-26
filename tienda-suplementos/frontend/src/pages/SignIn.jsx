
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import headerImg from '../assets/images/logo-largo-int.png';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const { signIn, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const result = await signIn(email);
      if (result.success) {
        setMessage({ type: 'success', text: '¡Registro exitoso! Revisa tu correo para verificar.' });
        setTimeout(() => navigate('/verify-email'), 1000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al registrarse.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error al registrarse.' });
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '3rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <img src={headerImg} alt="Marca" style={{ width: '140px', height: 'auto', objectFit: 'contain', borderRadius: '6px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }} />
      </div>
      <h1 style={{ margin: '0 0 1.5rem 0', color: '#333', fontWeight: 800, fontSize: '1.8rem', textAlign: 'center' }}>
        Regístrate con tu correo electrónico
      </h1>
      {message && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          borderRadius: '4px',
          backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b'
        }}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: '#444', fontSize: '1.2rem', fontWeight: 700 }}>
            Ingresa tu Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1.125rem' }}
            placeholder="ejemplo@correo.com"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '0.75rem', backgroundColor: loading ? '#9ca3af' : '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Cargando...' : 'Registrarse'}
        </button>
      </form>
      <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '1rem' }}>
        ¿Tienes una cuenta?{' '}
        <button style={{ color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }} onClick={() => navigate('/login')}>
          Inicia sesión
        </button>
      </div>
    </div>
  );
}
