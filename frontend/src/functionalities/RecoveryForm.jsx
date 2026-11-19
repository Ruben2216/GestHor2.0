import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/RecoveryForm.css';
import { crearSolicitudRecuperacion } from '../services/solicitudRecuperacionService';
import { solicitarCodigoRecuperacion, restablecerConCodigo } from '../services/passwordRecoveryService';
import { useToast } from '../components/ui/NotificacionFlotante';
import usePageTitle from "../hooks/usePageTitle";

const RecoveryForm = () => {
  usePageTitle("Ayuda");
  const navigate = useNavigate();
  const [mode, setMode] = useState('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    registeredEmail: '',
    requestReason: '',
    code: '',
    newPassword: '',
  });

  const { notify } = useToast();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'code' ? value.replace(/\D/g, '').slice(0, 6) : value,
    }));
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'admin') {
        await crearSolicitudRecuperacion(formData.registeredEmail, formData.requestReason);
        notify({ type: 'success', message: 'Solicitud enviada. El administrador dará respuesta en un máximo de 24 horas hábiles.' });
        navigate('/login');
      } else if (mode === 'request') {
        await solicitarCodigoRecuperacion(formData.registeredEmail);
        setMode('verify');
        notify({ type: 'success', message: 'Si el correo está registrado, recibirás un código de recuperación.' });
      } else {
        await restablecerConCodigo({
          email: formData.registeredEmail,
          code: formData.code,
          newPassword: formData.newPassword,
        });
        notify({ type: 'success', message: 'Contraseña restablecida. Ya puedes iniciar sesión.' });
        navigate('/login');
      }
    } catch (err) {
      const mensaje = err.response?.data?.message
        || err.response?.data?.mensaje
        || 'No se pudo completar la solicitud. Intenta nuevamente.';
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
          <h2 className="card-title">
            {mode === 'admin' ? 'Contactar Administrador' : mode === 'verify' ? 'Verificar código' : 'Recuperar contraseña'}
          </h2>
          <p className="card-subtitle">
            {mode === 'admin'
              ? 'Complete los campos para enviar una solicitud al administrador'
              : mode === 'verify'
                ? 'Ingresa el código enviado a tu correo y elige una contraseña nueva'
                : 'Te enviaremos un código de 6 dígitos a tu correo registrado'}
          </p>

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
                readOnly={mode === 'verify'}
              />
            </div>

            {mode === 'admin' && (
              <>
                <div className="form-group">
                  <label htmlFor="requestReason">Motivo de la solicitud</label>
                  <textarea
                    id="requestReason"
                    name="requestReason"
                    value={formData.requestReason}
                    onChange={handleChange}
                    placeholder="Explique brevemente en qué lo puede ayudar el administrador..."
                    rows="3"
                    required
                    className="textarea-input"
                  />
                </div>
                <p className="important-note">
                  El administrador recibirá tu solicitud y responderá en un máximo de 24 horas hábiles.
                </p>
              </>
            )}

            {mode === 'verify' && (
              <>
                <div className="form-group">
                  <label htmlFor="code">Código de recuperación</label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    autoComplete="one-time-code"
                    placeholder="123456"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newPassword">Nueva contraseña</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <p className="important-note">
                  El código vence en 24 horas y solo puede usarse una vez.
                </p>
              </>
            )}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading
                ? 'Procesando...'
                : mode === 'admin'
                  ? 'Enviar solicitud'
                  : mode === 'verify'
                    ? 'Restablecer contraseña'
                    : 'Enviar código'}
            </button>
          </form>

          <div className="back-link-container">
            {mode === 'verify' ? (
              <button
                type="button"
                className="back-link"
                onClick={() => {
                  setMode('request');
                  setFormData((previous) => ({ ...previous, code: '', newPassword: '' }));
                  setError('');
                }}
              >
                Usar otro correo
              </button>
            ) : mode === 'admin' ? (
              <button type="button" className="back-link" onClick={() => setMode('request')}>
                Recuperar contraseña con código
              </button>
            ) : (
              <button type="button" className="back-link" onClick={() => setMode('admin')}>
                ¿Prefieres contactar al administrador?
              </button>
            )}
          </div>

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