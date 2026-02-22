import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allowedEmails = ['guiniote@gmail.com', 'nm.schmidt5533@gmail.com'];
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && !allowedEmails.includes(currentUser.email)) {
        await signOut(auth);
        setUser(null);
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem' }}>
        Cargando...
      </div>
    );
  }

  return (
    <>
      {user && (
        <header className="header">
          <div className="logo">Calculadora de Alquileres</div>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user.email}</span>
            <button className="danger" onClick={handleLogout} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
              Salir
            </button>
          </div>
        </header>
      )}
      <main>
        {user ? <Dashboard user={user} /> : <Login />}
      </main>
    </>
  );
}

export default App;
