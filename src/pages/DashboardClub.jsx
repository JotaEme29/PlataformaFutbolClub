// src/pages/DashboardClub.jsx - DASHBOARD PRINCIPAL PARA PLATAFORMA FÚTBOL 2.0

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ClubManagement from '../components/ClubManagement';
import GestionJugadores from '../components/GestionJugadores';
import EstadisticasAnalisis from '../components/EstadisticasAnalisis'; // Importación añadida
import ActionLogger from '../components/ActionLogger'; // Importación añadida
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
import './DashboardClub.css'; // Importar el nuevo CSS

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
      
      const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
      const equiposSnapshot = await getDocs(equiposRef);
      const equipos = equiposSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      let totalJugadores = 0;
      let proximosEventos = 0;
      let partidosEsteMes = 0;

      const hoy = new Date();
      const inicioSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 1));
      const finSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 7));
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

      for (const equipo of equipos) {
        totalJugadores += equipo.jugadores?.length || 0;

        const eventosRef = collection(db, 'clubes', currentUser.clubId, 'equipos', equipo.id, 'eventos');
        const eventosSnapshot = await getDocs(eventosRef);

        eventosSnapshot.forEach(doc => {
          const evento = doc.data();
          const fechaEvento = new Date(evento.fecha);

          if (fechaEvento >= inicioSemana && fechaEvento <= finSemana) {
            proximosEventos++;
          }

          if (evento.tipo === 'Partido' && fechaEvento >= inicioMes && fechaEvento <= finMes) {
            partidosEsteMes++;
          }
        });
      }

      setClubStats({
        totalEquipos: equipos.length,
        totalJugadores,
        proximosEventos,
        partidosEsteMes
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
            <div className="stats-grid-modern">
              <div className="stat-card-modern">
                <h3>{clubStats.totalEquipos}</h3>
                <p>Equipos Registrados</p>
              </div>
              <div className="stat-card-modern">
                <h3>{clubStats.totalJugadores}</h3>
                <p>Jugadores Totales</p>
              </div>
              <div className="stat-card-modern">
                <h3>{clubStats.proximosEventos}</h3>
                <p>Próximos Eventos</p>
              </div>
              <div className="stat-card-modern">
                <h3>{clubStats.partidosEsteMes}</h3>
                <p>Partidos Este Mes</p>
              </div>
            </div>

            <div className="info-card-modern">
              <h3>Información del Club</h3>
              <p><strong>Nombre:</strong> {currentUser?.club?.nombre}</p>
              <p><strong>Ubicación:</strong> {currentUser?.club?.ciudad}, {currentUser?.club?.pais}</p>
              <p><strong>Teléfono:</strong> {currentUser?.club?.telefono || 'No especificado'}</p>
              <p><strong>Fecha de Creación:</strong> {
                currentUser?.club?.fechaCreacion 
                  ? new Date(currentUser.club.fechaCreacion.seconds * 1000).toLocaleDateString()
                  : 'No disponible'
              }</p>
            </div>

            <div className="info-card-modern">
              <h3>Acciones Rápidas</h3>
              <div className="actions-grid-modern">
                <button className="action-btn-modern" onClick={() => setActiveTab('gestion')}>
                  Gestionar Equipos
                </button>
                <button className="action-btn-modern" onClick={() => setActiveTab('jugadores')}>
                  Gestionar Jugadores
                </button>
                <button className="action-btn-modern" onClick={() => setActiveTab('eventos')}>
                  Programar Evento
                </button>
                <button className="action-btn-modern" onClick={() => setActiveTab('estadisticas')}>
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
    <div className="dashboard-club-modern">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Fútbol 2.0</h1>
          <span>{currentUser?.club?.nombre}</span>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-tab ${activeTab === 'resumen' ? 'active' : ''}`} onClick={() => setActiveTab('resumen')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
            Resumen
          </button>
          <button className={`nav-tab ${activeTab === 'gestion' ? 'active' : ''}`} onClick={() => setActiveTab('gestion')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5" /></svg>
            Gestión
          </button>
          <button className={`nav-tab ${activeTab === 'jugadores' ? 'active' : ''}`} onClick={() => setActiveTab('jugadores')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.55.045 1.104.08 1.66.08 1.657 0 3.325-.36 4.797-1.067m-2.287-2.287c.526.178 1.075.332 1.636.465l.56.28m-2.287-2.287l.07-.052a3.004 3.004 0 00-3.639-3.639l-.052.07m3.586 3.586l-2.287-2.287m2.287 2.287l-2.287 2.287m0 0a2.25 2.25 0 01-3.182 0l-2.287-2.287a2.25 2.25 0 010-3.182l2.287-2.287a2.25 2.25 0 013.182 0l2.287 2.287z" /></svg>
            Jugadores
          </button>
          <button className={`nav-tab ${activeTab === 'eventos' ? 'active' : ''}`} onClick={() => setActiveTab('eventos')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" /></svg>
            Eventos
          </button>
          <button className={`nav-tab ${activeTab === 'estadisticas' ? 'active' : ''}`} onClick={() => setActiveTab('estadisticas')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
            Estadísticas
          </button>
        </nav>
      </aside>
      <main className="dashboard-main-content">
        <header className="dashboard-header-modern">
          <div className="user-info-modern">
            <span>Bienvenido, {currentUser?.nombre} {currentUser?.apellido}</span>
          </div>
          <button className="logout-btn-modern" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </header>
        {renderTabContent()}
      </main>
    </div>
  );
}

export default DashboardClub;
