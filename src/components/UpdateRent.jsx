import { useState, useEffect } from 'react';
import { db, CONTRACTS_COLLECTION } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

export default function UpdateRent({ user }) {
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [selectedContract, setSelectedContract] = useState(null);
  
  const [indices, setIndices] = useState([]);
  const [result, setResult] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [contractHistory, setContractHistory] = useState([]);
  const [updateMonthStart, setUpdateMonthStart] = useState('');
  const [updateMonthEnd, setUpdateMonthEnd] = useState('');

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, CONTRACTS_COLLECTION), where('ownerEmail', '==', user.email));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(d => d.activo !== false); // Exclude logically deleted contracts
        setContracts(data);
      } catch (err) {
        console.error("Firebase fetch error:", err);
        setError(`Error al cargar los contratos: ${err.message || "Error desconocido"}`);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, [user.email]);

  const handleSelect = async (e) => {
    const id = e.target.value;
    setSelectedContractId(id);
    const contract = contracts.find(c => c.id === id);
    setSelectedContract(contract);
    setResult(null);
    setSuccess('');
    setError('');
    
    setUpdateMonthStart('');
    setUpdateMonthEnd('');

    if (contract) {
      // Create an array of N empty strings where N is updateFrequency
      setIndices(Array(contract.updateFrequency).fill(''));
      
      try {
        const historyQ = query(collection(db, CONTRACTS_COLLECTION, id, 'updatesHistory'));
        const historySnapshot = await getDocs(historyQ);
        setContractHistory(historySnapshot.docs.map(d => d.data()));
      } catch (err) {
        console.error("Error fetching history", err);
        setContractHistory([]);
      }
    } else {
      setIndices([]);
      setContractHistory([]);
    }
  };

  const handleIndexChange = (index, value) => {
    const newIndices = [...indices];
    newIndices[index] = value;
    setIndices(newIndices);
  };

  const validateUpdatePeriod = () => {
    if (!updateMonthStart || !updateMonthEnd) {
      return "Debes indicar el período (mes de inicio y fin) para esta actualización.";
    }
    
    // YYYY-MM a Date
    const startPeriod = new Date(updateMonthStart + "-02"); 
    const endPeriod = new Date(updateMonthEnd + "-02"); 
    
    if (endPeriod < startPeriod) {
      return "El mes de fin no puede ser anterior al de inicio.";
    }

    const contractStart = new Date(selectedContract.startDate + "T00:00:00");
    const contractEnd = new Date(selectedContract.endDate + "T00:00:00");
    
    const contractStartMonth = new Date(contractStart.getFullYear(), contractStart.getMonth(), 1);
    const contractEndMonth = new Date(contractEnd.getFullYear(), contractEnd.getMonth(), 1);
    const updateStartMonth = new Date(startPeriod.getFullYear(), startPeriod.getMonth(), 1);
    const updateEndMonth = new Date(endPeriod.getFullYear(), endPeriod.getMonth(), 1);

    if (updateStartMonth < contractStartMonth || updateEndMonth > contractEndMonth) {
      return "El período de actualización debe estar dentro de la vigencia del contrato.";
    }

    const firstAllowedMonth = new Date(contractStartMonth);
    firstAllowedMonth.setMonth(firstAllowedMonth.getMonth() + selectedContract.updateFrequency);

    if (updateStartMonth < firstAllowedMonth) {
      return `Los primeros ${selectedContract.updateFrequency} meses del contrato no pueden ser parte de una actualización de monto.`;
    }

    for (let history of contractHistory) {
      if (!history.periodStart || !history.periodEnd) continue;
      
      const histStart = new Date(history.periodStart + "-02");
      const histEnd = new Date(history.periodEnd + "-02");
      
      const hsMonth = new Date(histStart.getFullYear(), histStart.getMonth(), 1);
      const heMonth = new Date(histEnd.getFullYear(), histEnd.getMonth(), 1);

      if (updateStartMonth <= heMonth && hsMonth <= updateEndMonth) {
         return `El período elegido se superpone con un alquiler ya actualizado (${history.periodStart} al ${history.periodEnd}).`;
      }
    }

    return null;
  };

  const calculateUpdate = () => {
    if (indices.some(val => val === '')) {
      setError("Por favor, ingresa todos los índices mensuales.");
      return;
    }
    setError('');
    
    const periodError = validateUpdatePeriod();
    if (periodError) {
      setError(periodError);
      return;
    }

    let newRent = selectedContract.currentRent;
    indices.forEach(indexVal => {
      const percentage = Number(indexVal);
      newRent = newRent * (percentage / 100 + 1);
    });

    const oldDeposit = selectedContract.currentRent * selectedContract.depositMultiplier;
    const newDeposit = newRent * selectedContract.depositMultiplier;

    setResult({
      oldRent: selectedContract.currentRent,
      newRent: parseFloat(newRent.toFixed(2)),
      oldDeposit: parseFloat(oldDeposit.toFixed(2)),
      newDeposit: parseFloat(newDeposit.toFixed(2)),
      diffDeposit: parseFloat((newDeposit - oldDeposit).toFixed(2)),
      appliedIndices: indices.map(Number)
    });
  };

  const handleSave = async () => {
    if (!result || !selectedContract) return;
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const contractRef = doc(db, CONTRACTS_COLLECTION, selectedContract.id);
      
      // Actualizar el contrato principal
      await updateDoc(contractRef, {
        currentRent: result.newRent
      });

      // Guardar en el historial de actualizaciones
      await addDoc(collection(contractRef, 'updatesHistory'), {
        date: serverTimestamp(),
        oldRent: result.oldRent,
        newRent: result.newRent,
        oldDeposit: result.oldDeposit,
        newDeposit: result.newDeposit,
        appliedIndices: result.appliedIndices,
        periodStart: updateMonthStart,
        periodEnd: updateMonthEnd,
        updatedBy: user.email
      });

      setSuccess("¡Actualización guardada con éxito!");
      
      // Actualizar el estado local para reflejar el cambio
      const updatedContract = { ...selectedContract, currentRent: result.newRent };
      setSelectedContract(updatedContract);
      setContracts(contracts.map(c => c.id === updatedContract.id ? updatedContract : c));
      
      // Resetear inputs post guardado para evitar doble guardado accidental
      setIndices(Array(updatedContract.updateFrequency).fill(''));
      setResult(null);
      
    } catch (err) {
      console.error(err);
      setError("Error al guardar la actualización en la base de datos.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Calcular y Actualizar Alquiler</h2>
      
      {error && <div className="error-text mb-4" style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px', color: 'var(--danger)' }}>{error}</div>}
      {success && <div className="success-text mb-4" style={{ padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '8px', color: 'var(--success)' }}>{success}</div>}
      
      <div className="form-group">
        <label>Seleccionar Contrato</label>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Cargando contratos de la base de datos...</p>
        ) : contracts.length === 0 ? (
          <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px', color: '#b45309' }}>
            {error ? "No se pudieron cargar los contratos." : "No hay contratos cargados para este usuario. Por favor, crea uno primero en la pestaña 'Nuevo Contrato'."}
          </div>
        ) : (
          <select value={selectedContractId} onChange={handleSelect}>
            <option value="">-- Elige un contrato --</option>
            {contracts.map(c => (
              <option key={c.id} value={c.id}>
                {c.property} - {c.tenant} (Actual: ${c.currentRent})
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedContract && (
        <div className="animate-fade-in" style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Detalles del Contrato: {selectedContract.property}</h3>
          <p><strong>Inquilino:</strong> {selectedContract.tenant}</p>
          <p><strong>Alquiler Actual:</strong> ${selectedContract.currentRent}</p>
          <p><strong>Frecuencia:</strong> {selectedContract.updateFrequency} meses ({selectedContract.indexType})</p>
          <p><strong>Depósito Acordado:</strong> {selectedContract.depositMultiplier === 1 ? 'Un mes' : selectedContract.depositMultiplier === 1.5 ? 'Un mes y medio' : selectedContract.depositMultiplier === 2 ? 'Dos meses' : `${selectedContract.depositMultiplier} meses`}</p>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <label style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Período a Actualizar</label>
            <div className="grid">
              <div className="form-group">
                <label style={{ fontSize: '0.9rem' }}>Desde (Mes y Año)</label>
                <input 
                  type="month" 
                  value={updateMonthStart} 
                  onChange={(e) => setUpdateMonthStart(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.9rem' }}>Hasta (Mes y Año)</label>
                <input 
                  type="month" 
                  value={updateMonthEnd} 
                  onChange={(e) => setUpdateMonthEnd(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ color: 'var(--primary)', fontWeight: '600' }}>Ingresa la inflación de cada mes (%)</label>
            <div className="grid" style={{ marginTop: '0.5rem' }}>
              {indices.map((val, idx) => (
                <div key={idx}>
                  <label style={{ fontSize: '0.9rem' }}>Mes {idx + 1}</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={val} 
                    onChange={(e) => handleIndexChange(idx, e.target.value)}
                    placeholder="Ej: 4.5"
                  />
                </div>
              ))}
            </div>
            
            <button 
              onClick={calculateUpdate} 
              style={{ marginTop: '1.5rem', width: '100%', backgroundColor: 'var(--success)' }}
            >
              Calcular Resultados
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="animate-fade-in" style={{ marginTop: '2rem', borderTop: '2px dashed var(--border)', paddingTop: '1.5rem' }}>
          <h3>Resultado del Cálculo</h3>
          
          <div className="grid">
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--text-muted)' }}>Alquiler Actual</p>
              <h4 style={{ fontSize: '1.25rem' }}>${result.oldRent}</h4>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid var(--primary)' }}>
              <p style={{ color: 'var(--primary)' }}>Alquiler Nuevo</p>
              <h4 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>${result.newRent}</h4>
            </div>
          </div>

          <div className="grid" style={{ marginTop: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--text-muted)' }}>Depósito Viejo</p>
              <h4>${result.oldDeposit}</h4>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid var(--success)' }}>
              <p style={{ color: 'var(--success)' }}>Depósito Nuevo</p>
              <h4 style={{ color: 'var(--success)' }}>${result.newDeposit}</h4>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#fdf4ff', borderRadius: '8px', border: '1px solid #d946ef' }}>
              <p style={{ color: '#d946ef' }}>Diferencia Depósito</p>
              <h4 style={{ color: '#d946ef' }}>${result.diffDeposit}</h4>
            </div>
          </div>

          <button 
            onClick={handleSave} 
            disabled={saving}
            style={{ width: '100%', marginTop: '2rem', fontSize: '1.2rem', padding: '1rem' }}
          >
            {saving ? 'Guardando en Base de Datos...' : 'Confirmar y Guardar Actualización'}
          </button>
        </div>
      )}
    </div>
  );
}
