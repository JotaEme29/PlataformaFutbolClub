// src/pages/Registro.jsx - VERSIÓN REDISEÑADA

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Registro.css';

function Registro() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup(email, password);
      navigate('/dashboard'); // Redirige al dashboard tras un registro exitoso
    } catch (err) {
      setError('Error al crear la cuenta. Puede que el email ya esté en uso.');
      console.error(err);
    }
  };

  return (
    <div className="register-container">
      <div className="register-brand">
        <div className="brand-title">Únete a la plataforma</div>
        <div className="brand-claim">Organiza tu club con precisión y estilo deportivo.</div>
      </div>
      <div className="register-box">
        <div className="register-card">
          <h2>Crear una Cuenta</h2>
          <p className="sub">Comienza gratis</p>

          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="label" htmlFor="email">Correo electrónico</label>
              <div className="input-wrap">
                <span className="input-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M22 6l-10 7L2 6"/></svg>
                </span>
                <input className="input"
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <label className="label" htmlFor="password">Contraseña</label>
              <div className="input-wrap">
                <span className="input-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input className="input"
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-auth-primary">Registrarse</button>
          </form>

          <div className="register-footer">
            <p>
              ¿Ya tienes cuenta? <Link to="/login">Inicia Sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registro;
