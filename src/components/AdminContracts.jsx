import { useState, useEffect } from 'react';
import { db, CONTRACTS_COLLECTION } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function AdminContracts({ user }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingContract, setEditingContract] = useState(null);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, CONTRACTS_COLLECTION), where('ownerEmail', '==', user.email));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(d => d.activo !== false); // Sólo los activos
      setContracts(data);
    } catch (err) {
      console.error(err);
      setError(`Error al cargar los contratos: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [user.email]);

  const handleDelete = async (id, propertyName) => {
    if (!window.confirm(`¿Estás seguro que deseas borrar el contrato de "${propertyName}"?`)) return;
    
    setError('');
    setSuccess('');
    
    try {
      const contractRef = doc(db, CONTRACTS_COLLECTION, id);
      await updateDoc(contractRef, { activo: false });
      setSuccess(`Contrato borrado exitosamente.`);
      setContracts(contracts.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      setError(`Error al intentar borrar el contrato: ${err.message || 'Error desconocido'}`);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingContract(prev => ({ ...prev, [name]: value }));
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const contractRef = doc(db, CONTRACTS_COLLECTION, editingContract.id);
      await updateDoc(contractRef, {
        property: editingContract.property,
        tenant: editingContract.tenant,
        startDate: editingContract.startDate,
        endDate: editingContract.endDate,
        updateFrequency: Number(editingContract.updateFrequency),
        indexType: editingContract.indexType,
        depositMultiplier: Number(editingContract.depositMultiplier),
        initialRent: Number(editingContract.initialRent),
        currentRent: Number(editingContract.currentRent)
      });
      
      setSuccess("¡Contrato actualizado correctamente!");
      setEditingContract(null);
      fetchContracts();
    } catch (err) {
      console.error(err);
      setError(`Ocurrió un error al guardar los cambios: ${err.message || 'Error desconocido'}`);
    }
  };

  if (editingContract) {
    return (
      <div className="card animate-fade-in">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Editar Contrato</h2>
        <form onSubmit={submitEdit} className="grid">
          <div className="form-group">
            <label>Propiedad</label>
            <input type="text" name="property" value={editingContract.property} onChange={handleEditChange} required />
          </div>
          <div className="form-group">
            <label>Inquilino</label>
            <input type="text" name="tenant" value={editingContract.tenant} onChange={handleEditChange} required />
          </div>
          <div className="form-group">
            <label>Fecha de Inicio</label>
            <input type="date" name="startDate" value={editingContract.startDate} onChange={handleEditChange} required />
          </div>
          <div className="form-group">
            <label>Fecha de Fin</label>
            <input type="date" name="endDate" value={editingContract.endDate} onChange={handleEditChange} required />
          </div>
          <div className="form-group">
            <label>Monto Inicial ($)</label>
            <input type="number" name="initialRent" value={editingContract.initialRent} onChange={handleEditChange} step="0.01" required />
          </div>
          <div className="form-group">
            <label>Alquiler Actual / Cobrado ($) - (Modificar solo en caso de error)</label>
            <input type="number" name="currentRent" value={editingContract.currentRent} onChange={handleEditChange} step="0.01" required />
          </div>
          <div className="form-group">
            <label>Frecuencia de Actualización</label>
            <select name="updateFrequency" value={editingContract.updateFrequency} onChange={handleEditChange} required>
              <option value="2">2 Meses</option>
              <option value="3">3 Meses</option>
              <option value="4">4 Meses</option>
              <option value="6">6 Meses</option>
              <option value="12">12 Meses</option>
            </select>
          </div>
          <div className="form-group">
            <label>Índice a Utilizar</label>
            <select name="indexType" value={editingContract.indexType} onChange={handleEditChange}>
              <option value="ICL">ICL</option>
              <option value="IPC">IPC</option>
              <option value="Casa Propia">Casa Propia</option>
              <option value="Fijo">Fijo / Acuerdo entre partes</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" style={{ flex: 1, backgroundColor: 'var(--success)' }}>Guardar Cambios</button>
            <button type="button" onClick={() => setEditingContract(null)} style={{ flex: 1, backgroundColor: 'var(--text-muted)' }}>Cancelar</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Contratos Activos</h2>
      
      {error && <div className="error-text mb-4" style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px', color: 'var(--danger)' }}>{error}</div>}
      {success && <div className="success-text mb-4" style={{ padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '8px', color: 'var(--success)' }}>{success}</div>}
      
      {loading ? (
        <p>Cargando contratos...</p>
      ) : contracts.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No hay contratos cargados o todos han sido borrados.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {contracts.map(c => (
            <div key={c.id} style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg)' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{c.property}</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Inquilino: {c.tenant} | Vigencia: {c.startDate} a {c.endDate}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setEditingContract(c)} style={{ padding: '0.5rem 1rem' }}>Editar</button>
                <button onClick={() => handleDelete(c.id, c.property)} className="danger" style={{ padding: '0.5rem 1rem' }}>Borrar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
