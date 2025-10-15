// src/pages/Home.jsx - PÁGINA DE INICIO PARA SELECCIÓN DE VERSIÓN

import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Plataforma Fútbol</h1>
        <p className="hero-subtitle">
          La solución completa para la gestión de equipos y clubes de fútbol
        </p>
      </div>

      <div className="version-selector">
        <h2>Elige tu experiencia</h2>
        
        <div className="version-options">
          <div className="version-card">
            <div className="version-header">
              <h3>Plataforma Fútbol 1.0</h3>
              <span className="version-badge legacy">Clásica</span>
            </div>
            
            <div className="version-features">
              <h4>Características:</h4>
              <ul>
                <li>✅ Gestión de un equipo individual</li>
                <li>✅ Registro y seguimiento de jugadores</li>
                <li>✅ Organización de eventos y partidos</li>
                <li>✅ Estadísticas básicas del equipo</li>
                <li>✅ Sistema de evaluación de jugadores</li>
              </ul>
            </div>
            
            <div className="version-ideal">
              <strong>Ideal para:</strong>
              <p>Entrenadores que gestionan un solo equipo y buscan una solución simple y directa.</p>
            </div>
            
            <div className="version-actions">
              <Link to="/login" className="btn-secondary">
                Iniciar Sesión
              </Link>
              <Link to="/signup" className="btn-outline">
                Registrar Equipo
              </Link>
            </div>
          </div>

          <div className="version-card featured">
            <div className="version-header">
              <h3>Plataforma Fútbol 2.0</h3>
              <span className="version-badge new">¡Nuevo!</span>
            </div>
            
            <div className="version-features">
              <h4>Características:</h4>
              <ul>
                <li>🏆 Gestión completa de clubes</li>
                <li>📊 Estructura jerárquica: Club → Categorías → Equipos</li>
                <li>👥 Hasta 12 equipos por club</li>
                <li>⚽ Soporte para múltiples formatos (5, 7, 8, 9, 11 jugadores)</li>
                <li>🎯 Roles diferenciados (Admin, Entrenador, Asistente)</li>
                <li>📈 Estadísticas avanzadas y análisis</li>
                <li>🔮 Preparado para GPS y video (próximamente)</li>
              </ul>
            </div>
            
            <div className="version-ideal">
              <strong>Ideal para:</strong>
              <p>Clubes deportivos que manejan múltiples equipos y categorías, buscando una gestión profesional e integral.</p>
            </div>
            
            <div className="version-actions">
              <Link to="/login" className="btn-secondary">
                Iniciar Sesión
              </Link>
              <Link to="/registro-club" className="btn-primary">
                Registrar Club
              </Link>
            </div>
          </div>
        </div>

        <div className="migration-info">
          <div className="info-card">
            <h4>¿Ya tienes una cuenta en la versión 1.0?</h4>
            <p>
              No te preocupes, tu información está segura. Puedes seguir usando la versión clásica 
              o contactarnos para migrar tu equipo a un club en la versión 2.0.
            </p>
            <Link to="/login" className="btn-link">
              Acceder a mi cuenta existente →
            </Link>
          </div>
        </div>
      </div>

      <div className="features-comparison">
        <h2>Comparación de Funcionalidades</h2>
        
        <div className="comparison-table">
          <div className="comparison-header">
            <div className="feature-column">Funcionalidad</div>
            <div className="version-column">Versión 1.0</div>
            <div className="version-column">Versión 2.0</div>
          </div>
          
          <div className="comparison-row">
            <div className="feature-column">Gestión de equipos</div>
            <div className="version-column">1 equipo</div>
            <div className="version-column">Hasta 12 equipos</div>
          </div>
          
          <div className="comparison-row">
            <div className="feature-column">Formatos de juego</div>
            <div className="version-column">Fútbol 11</div>
            <div className="version-column">5, 7, 8, 9, 11 jugadores</div>
          </div>
          
          <div className="comparison-row">
            <div className="feature-column">Estructura organizacional</div>
            <div className="version-column">Equipo individual</div>
            <div className="version-column">Club → Categorías → Equipos</div>
          </div>
          
          <div className="comparison-row">
            <div className="feature-column">Roles de usuario</div>
            <div className="version-column">Admin, Entrenador, Jugador</div>
            <div className="version-column">Admin Club, Entrenador, Asistente, Jugador</div>
          </div>
          
          <div className="comparison-row">
            <div className="feature-column">Límite de jugadores</div>
            <div className="version-column">Sin límite específico</div>
            <div className="version-column">Según formato (10-25 jugadores)</div>
          </div>
          
          <div className="comparison-row">
            <div className="feature-column">Estadísticas</div>
            <div className="version-column">Básicas</div>
            <div className="version-column">Avanzadas + Análisis</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
