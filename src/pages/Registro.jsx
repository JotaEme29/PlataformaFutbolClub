// src/pages/Registro.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Registro.css';

function Registro() {
  const navigate = useNavigate();
  const { registrarUsuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // Paso del wizard

  // Datos del formulario
  const [formData, setFormData] = useState({
    // Paso 1: Datos del usuario
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Paso 2: Datos del club
    nombreClub: '',
    ciudad: '',
    pais: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarPaso1 = () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }
    if (!formData.apellido.trim()) {
      setError('El apellido es obligatorio');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El correo electrónico es obligatorio');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (validarPaso1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombreClub.trim()) {
      setError('El nombre del club es obligatorio');
      return;
    }
    if (!formData.ciudad.trim() || !formData.pais.trim()) {
      setError('La ciudad y el país son obligatorios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await registrarUsuario(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-card">
        <div className="registro-header">
          <h1>Crear Cuenta</h1>
          <p className="subtitle">Gestiona tu club de fútbol profesionalmente</p>
        </div>

        {/* Indicador de pasos */}
        <div className="steps-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Datos Personales</div>
          </div>
          <div className="step-divider"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Datos del Club</div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* PASO 1: Datos Personales */}
          {step === 1 && (
            <div className="form-step">
              <h3>Tus Datos</h3>
              
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="nombre">Nombre *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="apellido">Apellido *</label>
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="email">Correo Electrónico *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="password">Contraseña *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button 
                type="button" 
                className="btn-primary"
                onClick={handleNextStep}
              >
                Siguiente
              </button>
            </div>
          )}

          {/* PASO 2: Datos del Club */}
          {step === 2 && (
            <div className="form-step">
              <h3>Datos del Club</h3>
              
              <div className="input-group">
                <label htmlFor="nombreClub">Nombre del Club *</label>
                <input
                  type="text"
                  id="nombreClub"
                  name="nombreClub"
                  value={formData.nombreClub}
                  onChange={handleChange}
                  placeholder="Ej: Club Deportivo Los Leones"
                  required
                  autoFocus
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="ciudad">Ciudad *</label>
                  <input
                    type="text"
                    id="ciudad"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="pais">País *</label>
                  <input
                    type="text"
                    id="pais"
                    name="pais"
                    value={formData.pais}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="info-box">
                <p>ℹ️ Serás el <strong>Administrador</strong> del club y podrás invitar a otros usuarios después.</p>
              </div>

              <div className="button-group">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Atrás
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="registro-footer">
          <p>¿Ya tienes cuenta? <Link to="/login">Inicia Sesión</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Registro;
