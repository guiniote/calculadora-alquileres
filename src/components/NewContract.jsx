import { useState } from 'react';
import { db, CONTRACTS_COLLECTION } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function NewContract({ user }) {
  const [formData, setFormData] = useState({
    property: '',
    tenant: '',
    startDate: '',
    endDate: '',
    updateFrequency: 3,
    indexType: 'ICL',
    depositMultiplier: 1.5,
    initialRent: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Strict regex to block special chars and avoid injections
  const sanitizeString = (str) => {
    return str.replace(/[<>=%&|#]/g, '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'property' || name === 'tenant') {
      setFormData(prev => ({ ...prev, [name]: sanitizeString(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.property.trim() || !formData.tenant.trim() || !formData.startDate || !formData.endDate || !formData.initialRent) {
      return "Faltan completar campos obligatorios.";
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      return "La fecha de fin debe ser posterior a la fecha de inicio.";
    }
    if (formData.updateFrequency < 1 || formData.updateFrequency > 12) {
      return "La frecuencia de actualización debe ser entre 1 y 12 meses.";
    }
    if (formData.initialRent <= 0) {
      return "El monto del alquiler inicial debe ser mayor a 0.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const contractData = {
        property: formData.property.trim(),
        tenant: formData.tenant.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        updateFrequency: Number(formData.updateFrequency),
        indexType: formData.indexType,
        depositMultiplier: Number(formData.depositMultiplier),
        initialRent: Number(formData.initialRent),
        currentRent: Number(formData.initialRent),
        ownerEmail: user.email,
        activo: true,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, CONTRACTS_COLLECTION), contractData);
      
      setSuccess("¡Contrato guardado exitosamente!");
      setFormData({
        property: '',
        tenant: '',
        startDate: '',
        endDate: '',
        updateFrequency: 3,
        indexType: 'ICL',
        depositMultiplier: 1.5,
        initialRent: ''
      });
    } catch (err) {
      console.error(err);
      setError("Hubo un error al guardar el contrato. Verifica tus permisos de red.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Dar de Alta un Contrato</h2>
      
      {error && <div className="error-text mb-4" style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px', color: 'var(--danger)' }}>{error}</div>}
      {success && <div className="success-text mb-4" style={{ padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '8px', color: 'var(--success)' }}>{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="grid">
          <div className="form-group">
            <label>Propiedad</label>
            <input type="text" name="property" value={formData.property} onChange={handleChange} placeholder="Ej: Depto Cabildo" required />
          </div>
          <div className="form-group">
            <label>Inquilino</label>
            <input type="text" name="tenant" value={formData.tenant} onChange={handleChange} placeholder="Ej: Juan Pérez" required />
          </div>
        </div>

        <div className="grid">
          <div className="form-group">
            <label>Fecha de Inicio del Contrato</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Fecha de Fin del Contrato</label>
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
          </div>
        </div>

        <div className="grid">
          <div className="form-group">
            <label>Monto Inicial ($)</label>
            <input type="number" name="initialRent" value={formData.initialRent} onChange={handleChange} placeholder="Ej: 500000" min="1" step="0.01" required />
          </div>
          <div className="form-group">
            <label>Depósito de Garantía</label>
            <select name="depositMultiplier" value={formData.depositMultiplier} onChange={handleChange}>
              <option value="1">Un mes</option>
              <option value="1.5">Un mes y medio</option>
              <option value="2">Dos meses</option>
            </select>
          </div>
        </div>

        <div className="grid">
          <div className="form-group">
            <label>Frecuencia de Actualización</label>
            <select name="updateFrequency" value={formData.updateFrequency} onChange={handleChange} required>
              <option value="2">2 Meses</option>
              <option value="3">3 Meses</option>
              <option value="4">4 Meses</option>
              <option value="6">6 Meses</option>
              <option value="12">12 Meses</option>
            </select>
          </div>
          <div className="form-group">
            <label>Índice a Utilizar</label>
            <select name="indexType" value={formData.indexType} onChange={handleChange}>
              <option value="ICL">ICL (Índice para Contratos de Locación)</option>
              <option value="IPC">IPC (Inflación INDEC)</option>
              <option value="Casa Propia">Casa Propia</option>
              <option value="Fijo">Fijo / Acuerdo entre partes</option>
            </select>
          </div>
        </div>

        <button type="submit" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Nuevo Contrato'}
        </button>
      </form>
    </div>
  );
}
