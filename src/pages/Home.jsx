// src/pages/Home.jsx - PÁGINA DE INICIO PARA SELECCIÓN DE VERSIÓN

import { Link } from 'react-router-dom';
import '../styles/home.css'; // Importamos los nuevos estilos

function Home() {
  return (
    <div className="home-container">
      {/* La superposición oscura para mejorar la legibilidad del texto */}
      <div className="home-overlay"></div>
      
      {/* El contenido principal centrado */}
      <div className="home-content">
        <div className="logo-placeholder">⚽</div>
        <h1 className="home-title">Plataforma Fútbol 2.0</h1>
        <p className="home-subtitle">
          La experiencia definitiva en gestión de clubes.
          <br />
          Estrategia, análisis y rendimiento en un solo lugar.
        </p>
        <div className="home-actions">
          <Link to="/login" className="btn btn-primary">
            Iniciar Sesión
          </Link>
          <Link to="/registro-club" className="btn btn-secondary">
            Registrar mi Club
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
