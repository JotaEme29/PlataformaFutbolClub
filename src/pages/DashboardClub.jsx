// src/pages/DashboardClub.jsx - DASHBOARD PRINCIPAL PARA PLATAFORMA FÚTBOL 2.0

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ClubManagement from '../components/ClubManagement';
import GestionJugadores from '../components/GestionJugadores';
import GestionEventos from '../components/GestionEventos';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';

function DashboardClub() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('resumen');
  const [clubStats, setClubStats] = useState({
    totalEquipos: 0,
    totalJugadores: 0,
    proximosEventos: 0,
    partidosEsteMes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.clubId) {
      loadClubStats();
    }
  }, [currentUser]);

  const loadClubStats = async () => {
    try {
      setLoading(true);
      
      // Obtener estadísticas del club
      const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
      const equiposSnapshot = await getDocs(equiposRef);
      const equipos = equiposSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Contar jugadores totales
      let totalJugadores = 0;
      equipos.forEach(equipo => {
        totalJugadores += equipo.jugadores?.length || 0;
      });

      setClubStats({
        totalEquipos: equipos.length,
        totalJugadores,
        proximosEventos: 0, // TODO: Implementar cuando tengamos eventos
        partidosEsteMes: 0  // TODO: Implementar cuando tengamos partidos
      });
      
    } catch (error) {
      console.error('Error al cargar estadísticas del club:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'resumen':
        return (
          <div className="dashboard-overview">
            <div className="welcome-section">
              <h2>Bienvenido, {currentUser?.nombre} {currentUser?.apellido}</h2>
              <p>Administrador de {currentUser?.club?.nombre}</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-content">
                  <h3>{clubStats.totalEquipos}</h3>
                  <p>Equipos Registrados</p>
                  <span className="stat-limit">Máximo: 12</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>{clubStats.totalJugadores}</h3>
                  <p>Jugadores Totales</p>
                  <span className="stat-detail">En todos los equipos</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <h3>{clubStats.proximosEventos}</h3>
                  <p>Próximos Eventos</p>
                  <span className="stat-detail">Esta semana</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⚽</div>
                <div className="stat-content">
                  <h3>{clubStats.partidosEsteMes}</h3>
                  <p>Partidos Este Mes</p>
                  <span className="stat-detail">Todos los equipos</span>
                </div>
              </div>
            </div>

            <div className="club-info-section">
              <h3>Información del Club</h3>
              <div className="club-details">
                <div className="detail-item">
                  <strong>Nombre:</strong> {currentUser?.club?.nombre}
                </div>
                <div className="detail-item">
                  <strong>Ubicación:</strong> {currentUser?.club?.ciudad}, {currentUser?.club?.pais}
                </div>
                <div className="detail-item">
                  <strong>Teléfono:</strong> {currentUser?.club?.telefono || 'No especificado'}
                </div>
                <div className="detail-item">
                  <strong>Fecha de Creación:</strong> {
                    currentUser?.club?.fechaCreacion 
                      ? new Date(currentUser.club.fechaCreacion.seconds * 1000).toLocaleDateString()
                      : 'No disponible'
                  }
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Acciones Rápidas</h3>
              <div className="actions-grid">
                <button 
                  className="action-btn"
                  onClick={() => setActiveTab('gestion')}
                >
                  <span className="action-icon">⚙️</span>
                  Gestionar Equipos
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setActiveTab('jugadores')}
                >
                  <span className="action-icon">👤</span>
                  Gestionar Jugadores
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setActiveTab('eventos')}
                >
                  <span className="action-icon">📋</span>
                  Programar Evento
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setActiveTab('estadisticas')}
                >
                  <span className="action-icon">📊</span>
                  Ver Estadísticas
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'gestion':
        return <ClubManagement />;
      
      case 'jugadores':
        return <GestionJugadores />;
      
      case 'eventos':
        return <GestionEventos />;
      
      case 'estadisticas':
        return <EstadisticasAnalisis />;
      
      case 'action-logger':
        return <ActionLogger />;
      
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  return (
    <div className="dashboard-club">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Plataforma Fútbol 2.0</h1>
            <span className="club-name">{currentUser?.club?.nombre}</span>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span>{currentUser?.nombre} {currentUser?.apellido}</span>
              <span className="user-role">Administrador</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'resumen' ? 'active' : ''}`}
            onClick={() => setActiveTab('resumen')}
          >
            📊 Resumen
          </button>
          <button 
            className={`nav-tab ${activeTab === 'gestion' ? 'active' : ''}`}
            onClick={() => setActiveTab('gestion')}
          >
            ⚙️ Gestión
          </button>
          <button 
            className={`nav-tab ${activeTab === 'jugadores' ? 'active' : ''}`}
            onClick={() => setActiveTab('jugadores')}
          >
            👥 Jugadores
          </button>
          <button 
            className={`nav-tab ${activeTab === 'eventos' ? 'active' : ''}`}
            onClick={() => setActiveTab('eventos')}
          >
            📅 Eventos
          </button>
            <button 
              className={`nav-item ${activeSection === 'estadisticas' ? 'active' : ''}`}
              onClick={() => setActiveSection('estadisticas')}
            >
              📊 Estadísticas
            </button>
            <button 
              className={`nav-item ${activeSection === 'action-logger' ? 'active' : ''}`}
              onClick={() => setActiveSection('action-logger')}
            >
              🎥 Action Logger
            </button>
        </div>
      </nav>

      <main className="dashboard-content">
        {renderTabContent()}
      </main>
    </div>
  );
}

export default DashboardClub;
