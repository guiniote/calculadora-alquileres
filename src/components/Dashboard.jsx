import { useState } from 'react';
import NewContract from './NewContract';
import UpdateRent from './UpdateRent';
import AdminContracts from './AdminContracts';

export default function Dashboard({ user }) {
  const [activeTab, setActiveTab] = useState('update');

  return (
    <div className="container animate-fade-in">
      <div className="flex gap-4 mb-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('update')}
          style={{ 
            backgroundColor: activeTab === 'update' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'update' ? 'white' : 'var(--text-muted)'
          }}
        >
          Actualizar Alquiler
        </button>
        <button 
          onClick={() => setActiveTab('new')}
          style={{ 
            backgroundColor: activeTab === 'new' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'new' ? 'white' : 'var(--text-muted)'
          }}
        >
          Nuevo Contrato
        </button>
        <button 
          onClick={() => setActiveTab('admin')}
          style={{ 
            backgroundColor: activeTab === 'admin' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'admin' ? 'white' : 'var(--text-muted)'
          }}
        >
          Administrar Contratos
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {activeTab === 'update' && <UpdateRent user={user} />}
        {activeTab === 'new' && <NewContract user={user} />}
        {activeTab === 'admin' && <AdminContracts user={user} />}
      </div>
    </div>
  );
}
