import { useState } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    const allowedEmails = ['guiniote@gmail.com', 'nm.schmidt5533@gmail.com'];
    
    try {
      const result = await signInWithPopup(auth, provider);
      if (!import.meta.env.DEV && !allowedEmails.includes(result.user.email)) {
        setError('Tu correo no tiene permisos para acceder a esta aplicación.');
        // App.jsx will handle the actual signout
      }
    } catch (err) {
      console.error(err);
      setError('Hubo un error al intentar iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Calculadora de Alquileres</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Inicia sesión para continuar</p>
        
        {error && <div className="error-text form-group" style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px' }}>{error}</div>}
        
        <button 
          onClick={handleLogin} 
          disabled={loading}
          style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }}
        >
          {loading ? 'Cargando...' : 'Ingresar con Google'}
        </button>
      </div>
    </div>
  );
}
