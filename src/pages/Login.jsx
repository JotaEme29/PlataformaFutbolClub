// src/pages/Login.jsx - VERSIÓN REDISEÑADA

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard-club'); // Redirige al dashboard-club tras un login exitoso
    } catch (err) {
      setError('Error al iniciar sesión. Comprueba tu email y contraseña.');
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-brand">
        <span className="brand-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          Plataforma Fútbol 2.0
        </span>
        <div className="brand-title">Gestión profesional para clubes</div>
        <div className="brand-claim">Análisis, rendimiento y organización en una sola plataforma.</div>
      </div>
      <div className="auth-box">
        <div className="auth-card">
          <h2>Iniciar Sesión</h2>
          <p className="sub">Bienvenido de nuevo</p>

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
            <button type="submit" className="btn-auth-primary">Iniciar Sesión</button>
          </form>

          <div className="auth-footer">
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
            <p>
              ¿No tienes cuenta? <Link to="/registro-club">Regístrate</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
