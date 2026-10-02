import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/RecoveryForm.css';
import { crearSolicitudRecuperacion } from '../services/solicitudRecuperacionService';
import { useToast } from '../components/ui/NotificacionFlotante';
import usePageTitle from "../hooks/usePageTitle";

const RecoveryForm = () => {
  usePageTitle("Ayuda");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    registeredEmail: '',
    requestReason: '',
  });

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { notify } = useToast();
    
    try {
      await crearSolicitudRecuperacion(
        formData.registeredEmail,
        formData.requestReason
      );
      notify({ type: 'success', message: 'Solicitud de recuperación enviada exitosamente. El administrador dará respuesta en un máximo de 24 horas hábiles.' });
      navigate('/login');
    } catch (err) {
      const mensaje = err.response?.data?.mensaje || 'Error al enviar la solicitud. Por favor, intente nuevamente.';
      setError(mensaje);
      notify({ type: 'error', message: mensaje });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recovery-container">
      {/* Columna de Información Lateral */}
      <div className="info-column">
        <h1 className="system-title">SISTEMA DE HORARIOS</h1>
        <p className="system-subtitle">Gestión escolar · UNACH</p>
        
      </div>

      {/* Tarjeta del Formulario */}
      <div className="form-card-wrapper">
        <div className="form-card">
          <h2 className="card-title">Contactar Administrador</h2>
          <p className="card-subtitle">Complete los siguientes campos para enviar su solicitud</p>

          <form onSubmit={handleSubmit} className="recovery-form">
            {error && (
              <div style={{ 
                padding: '10px', 
                marginBottom: '15px', 
                backgroundColor: '#fee', 
                border: '1px solid #fcc',
                borderRadius: '8px',
                color: '#c33'
              }}>
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="registeredEmail">Correo Electrónico Registrado</label>
              <input
                type="email"
                id="registeredEmail"
                name="registeredEmail"
                value={formData.registeredEmail}
                onChange={handleChange}
                placeholder="correo123@unach.mx"
                required
              />
            </div>

            {/* Campo: Motivo de la solicitud */}
            <div className="form-group">
              <label htmlFor="requestReason">Motivo de la solicitud</label>
              <textarea
                id="requestReason"
                name="requestReason"
                value={formData.requestReason}
                onChange={handleChange}
                placeholder="Explique brevemente en que lo puede ayudar el administrador..."
                rows="3" // Ajusta la altura
                required
                className="textarea-input"
              ></textarea>
            </div>

            {/* Mensaje Importante */}
            <p className="important-note">
              Importante: Su solicitud será enviada al administrador del sistema. Recibirá una respuesta en su correo en un plazo máximo de 24 horas hábiles.
            </p>

            {/* Botón de Enviar */}
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </form>

          {/* Enlace de Volver */}
          <div className="back-link-container">
            <Link to="/login" className="back-link">
              &lt; Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoveryForm;