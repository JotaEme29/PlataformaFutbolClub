// src/components/EstadisticasAnalisis.jsx - SISTEMA DE ESTADÍSTICAS Y ANÁLISIS PARA PLATAFORMA FÚTBOL 2.0

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';

function EstadisticasAnalisis() {
  const { currentUser } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [jugadores, setJugadores] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [estadisticasClub, setEstadisticasClub] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumen');

  useEffect(() => {
    if (currentUser?.clubId) {
      loadAllData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedTeam && equipos.length > 0) {
      loadTeamData();
    }
  }, [selectedTeam, equipos]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Cargar equipos
      const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
      const equiposSnapshot = await getDocs(equiposRef);
      const equiposData = equiposSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEquipos(equiposData);

      // Cargar eventos
      const eventosRef = collection(db, 'clubes', currentUser.clubId, 'eventos');
      const eventosSnapshot = await getDocs(eventosRef);
      const eventosData = eventosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEventos(eventosData);

      // Calcular estadísticas del club
      await calcularEstadisticasClub(equiposData, eventosData);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamData = async () => {
    try {
      // Cargar jugadores del equipo seleccionado
      const jugadoresRef = collection(db, 'clubes', currentUser.clubId, 'equipos', selectedTeam, 'jugadores');
      const q = query(jugadoresRef, orderBy('numeroCamiseta', 'asc'));
      const jugadoresSnapshot = await getDocs(q);
      const jugadoresData = jugadoresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJugadores(jugadoresData);
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
    }
  };

  const calcularEstadisticasClub = async (equiposData, eventosData) => {
    const stats = {
      totalEquipos: equiposData.length,
      totalJugadores: 0,
      totalEventos: eventosData.length,
      partidosJugados: 0,
      entrenamientos: 0,
      proximosEventos: 0
    };

    // Contar jugadores por equipo
    for (const equipo of equiposData) {
      try {
        const jugadoresRef = collection(db, 'clubes', currentUser.clubId, 'equipos', equipo.id, 'jugadores');
        const jugadoresSnapshot = await getDocs(jugadoresRef);
        stats.totalJugadores += jugadoresSnapshot.size;
      } catch (error) {
        console.error('Error al contar jugadores:', error);
      }
    }

    // Analizar eventos
    const ahora = new Date();
    eventosData.forEach(evento => {
      if (evento.tipo === 'partido') {
        stats.partidosJugados++;
      } else if (evento.tipo === 'entrenamiento') {
        stats.entrenamientos++;
      }
      
      const fechaEvento = evento.fecha?.toDate ? evento.fecha.toDate() : new Date(evento.fecha);
      if (fechaEvento > ahora) {
        stats.proximosEventos++;
      }
    });

    setEstadisticasClub(stats);
  };

  const getEquipoNombre = (equipoId) => {
    const equipo = equipos.find(eq => eq.id === equipoId);
    return equipo ? equipo.nombre : 'Equipo no encontrado';
  };

  const getTopJugadores = () => {
    return jugadores
      .sort((a, b) => (b.estadisticas?.goles || 0) - (a.estadisticas?.goles || 0))
      .slice(0, 5);
  };

  const getJugadoresMasActivos = () => {
    return jugadores
      .sort((a, b) => (b.estadisticas?.partidosJugados || 0) - (a.estadisticas?.partidosJugados || 0))
      .slice(0, 5);
  };

  const calcularPromedioEdad = () => {
    if (jugadores.length === 0) return 0;
    
    const edades = jugadores.map(jugador => {
      if (!jugador.fechaNacimiento) return 0;
      const hoy = new Date();
      const nacimiento = jugador.fechaNacimiento.toDate ? jugador.fechaNacimiento.toDate() : new Date(jugador.fechaNacimiento);
      return hoy.getFullYear() - nacimiento.getFullYear();
    }).filter(edad => edad > 0);
    
    return edades.length > 0 ? Math.round(edades.reduce((sum, edad) => sum + edad, 0) / edades.length) : 0;
  };

  const getEventosRecientes = () => {
    return eventos
      .filter(evento => {
        const fechaEvento = evento.fecha?.toDate ? evento.fecha.toDate() : new Date(evento.fecha);
        const ahora = new Date();
        const diferenciaDias = (ahora - fechaEvento) / (1000 * 60 * 60 * 24);
        return diferenciaDias >= 0 && diferenciaDias <= 30; // Últimos 30 días
      })
      .sort((a, b) => {
        const fechaA = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
        const fechaB = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha);
        return fechaB - fechaA;
      })
      .slice(0, 5);
  };

  const renderResumenTab = () => (
    <div className="resumen-tab">
      {/* Estadísticas Generales del Club */}
      <div className="stats-overview">
        <h3>Resumen del Club</h3>
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-value">{estadisticasClub.totalEquipos}</div>
              <div className="stat-label">Equipos</div>
            </div>
          </div>
          
          <div className="stat-card success">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{estadisticasClub.totalJugadores}</div>
              <div className="stat-label">Jugadores</div>
            </div>
          </div>
          
          <div className="stat-card info">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-value">{estadisticasClub.totalEventos}</div>
              <div className="stat-label">Eventos Totales</div>
            </div>
          </div>
          
          <div className="stat-card warning">
            <div className="stat-icon">⚽</div>
            <div className="stat-content">
              <div className="stat-value">{estadisticasClub.partidosJugados}</div>
              <div className="stat-label">Partidos</div>
            </div>
          </div>
          
          <div className="stat-card secondary">
            <div className="stat-icon">🏃‍♂️</div>
            <div className="stat-content">
              <div className="stat-value">{estadisticasClub.entrenamientos}</div>
              <div className="stat-label">Entrenamientos</div>
            </div>
          </div>
          
          <div className="stat-card danger">
            <div className="stat-icon">🔜</div>
            <div className="stat-content">
              <div className="stat-value">{estadisticasClub.proximosEventos}</div>
              <div className="stat-label">Próximos Eventos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por Equipos */}
      <div className="equipos-distribution">
        <h3>Distribución por Equipos</h3>
        <div className="equipos-cards">
          {equipos.map(equipo => (
            <div key={equipo.id} className="equipo-stat-card">
              <h4>{equipo.nombre}</h4>
              <div className="equipo-details">
                <p><strong>Formato:</strong> Fútbol {equipo.formato}</p>
                <p><strong>Entrenador:</strong> {equipo.entrenador || 'No asignado'}</p>
                <div className="equipo-stats">
                  <div className="mini-stat">
                    <span className="mini-value">{equipo.estadisticas?.partidosJugados || 0}</span>
                    <span className="mini-label">Partidos</span>
                  </div>
                  <div className="mini-stat">
                    <span className="mini-value">{equipo.estadisticas?.partidosGanados || 0}</span>
                    <span className="mini-label">Ganados</span>
                  </div>
                  <div className="mini-stat">
                    <span className="mini-value">{equipo.estadisticas?.golesAFavor || 0}</span>
                    <span className="mini-label">Goles</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Eventos Recientes */}
      <div className="eventos-recientes">
        <h3>Actividad Reciente</h3>
        <div className="eventos-timeline">
          {getEventosRecientes().map(evento => (
            <div key={evento.id} className="timeline-item">
              <div className="timeline-icon">
                {evento.tipo === 'partido' ? '⚽' : 
                 evento.tipo === 'entrenamiento' ? '🏃‍♂️' : 
                 evento.tipo === 'reunion' ? '👥' : '🎉'}
              </div>
              <div className="timeline-content">
                <h5>{evento.titulo}</h5>
                <p>{getEquipoNombre(evento.equipoId)}</p>
                <span className="timeline-date">
                  {evento.fecha?.toDate ? evento.fecha.toDate().toLocaleDateString('es-ES') : 'Fecha no disponible'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderJugadoresTab = () => (
    <div className="jugadores-tab">
      <div className="team-selector-section">
        <label htmlFor="team-select">Seleccionar Equipo:</label>
        <select
          id="team-select"
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
        >
          <option value="">Selecciona un equipo</option>
          {equipos.map(equipo => (
            <option key={equipo.id} value={equipo.id}>
              {equipo.nombre}
            </option>
          ))}
        </select>
      </div>

      {selectedTeam && jugadores.length > 0 && (
        <>
          {/* Estadísticas del Equipo */}
          <div className="team-stats-overview">
            <h3>Estadísticas del Equipo: {getEquipoNombre(selectedTeam)}</h3>
            <div className="team-stats-grid">
              <div className="team-stat-card">
                <div className="stat-value">{jugadores.length}</div>
                <div className="stat-label">Jugadores</div>
              </div>
              <div className="team-stat-card">
                <div className="stat-value">{calcularPromedioEdad()}</div>
                <div className="stat-label">Edad Promedio</div>
              </div>
              <div className="team-stat-card">
                <div className="stat-value">
                  {jugadores.reduce((total, j) => total + (j.estadisticas?.goles || 0), 0)}
                </div>
                <div className="stat-label">Goles Totales</div>
              </div>
              <div className="team-stat-card">
                <div className="stat-value">
                  {jugadores.reduce((total, j) => total + (j.estadisticas?.asistencias || 0), 0)}
                </div>
                <div className="stat-label">Asistencias Totales</div>
              </div>
            </div>
          </div>

          {/* Top Goleadores */}
          <div className="top-players-section">
            <h3>Top Goleadores</h3>
            <div className="players-ranking">
              {getTopJugadores().map((jugador, index) => (
                <div key={jugador.id} className="ranking-item">
                  <div className="ranking-position">#{index + 1}</div>
                  <div className="player-info">
                    <div className="player-name">
                      {jugador.nombre} {jugador.apellido}
                    </div>
                    <div className="player-position">{jugador.posicion}</div>
                  </div>
                  <div className="player-stats">
                    <div className="stat-item">
                      <span className="stat-value">{jugador.estadisticas?.goles || 0}</span>
                      <span className="stat-label">Goles</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{jugador.estadisticas?.asistencias || 0}</span>
                      <span className="stat-label">Asistencias</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Jugadores Más Activos */}
          <div className="active-players-section">
            <h3>Jugadores Más Activos</h3>
            <div className="players-ranking">
              {getJugadoresMasActivos().map((jugador, index) => (
                <div key={jugador.id} className="ranking-item">
                  <div className="ranking-position">#{index + 1}</div>
                  <div className="player-info">
                    <div className="player-name">
                      {jugador.nombre} {jugador.apellido}
                    </div>
                    <div className="player-position">{jugador.posicion}</div>
                  </div>
                  <div className="player-stats">
                    <div className="stat-item">
                      <span className="stat-value">{jugador.estadisticas?.partidosJugados || 0}</span>
                      <span className="stat-label">Partidos</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{jugador.estadisticas?.minutosJugados || 0}</span>
                      <span className="stat-label">Minutos</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla Completa de Jugadores */}
          <div className="players-table-section">
            <h3>Estadísticas Completas</h3>
            <div className="players-table">
              <div className="table-header">
                <div className="col-player">Jugador</div>
                <div className="col-position">Posición</div>
                <div className="col-games">PJ</div>
                <div className="col-goals">Goles</div>
                <div className="col-assists">Asist.</div>
                <div className="col-cards">Tarjetas</div>
                <div className="col-minutes">Minutos</div>
              </div>
              {jugadores.map(jugador => (
                <div key={jugador.id} className="table-row">
                  <div className="col-player">
                    <div className="player-cell">
                      <span className="player-number">#{jugador.numeroCamiseta}</span>
                      <div className="player-details">
                        <span className="player-name">{jugador.nombre} {jugador.apellido}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-position">{jugador.posicion}</div>
                  <div className="col-games">{jugador.estadisticas?.partidosJugados || 0}</div>
                  <div className="col-goals">{jugador.estadisticas?.goles || 0}</div>
                  <div className="col-assists">{jugador.estadisticas?.asistencias || 0}</div>
                  <div className="col-cards">
                    <span className="yellow-cards">{jugador.estadisticas?.tarjetasAmarillas || 0}</span>
                    <span className="red-cards">{jugador.estadisticas?.tarjetasRojas || 0}</span>
                  </div>
                  <div className="col-minutes">{jugador.estadisticas?.minutosJugados || 0}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {selectedTeam && jugadores.length === 0 && (
        <div className="empty-state">
          <h3>No hay jugadores registrados</h3>
          <p>Este equipo aún no tiene jugadores registrados.</p>
        </div>
      )}
    </div>
  );

  const renderComparativasTab = () => (
    <div className="comparativas-tab">
      <div className="coming-soon">
        <h3>🚧 Comparativas y Análisis Avanzado</h3>
        <p>Esta sección incluirá:</p>
        <ul>
          <li>Comparativas entre jugadores</li>
          <li>Análisis de rendimiento por posición</li>
          <li>Gráficos de evolución temporal</li>
          <li>Métricas avanzadas de rendimiento</li>
          <li>Comparación entre equipos del club</li>
        </ul>
        <p>Estará disponible en la siguiente actualización.</p>
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading">Cargando estadísticas...</div>;
  }

  return (
    <div className="estadisticas-analisis">
      <div className="estadisticas-header">
        <h2>Estadísticas y Análisis</h2>
        <div className="header-actions">
          <button className="btn-secondary">📊 Exportar Reporte</button>
          <button className="btn-primary">📈 Action Logger</button>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div className="tabs-navigation">
        <button 
          className={`tab-btn ${activeTab === 'resumen' ? 'active' : ''}`}
          onClick={() => setActiveTab('resumen')}
        >
          📊 Resumen General
        </button>
        <button 
          className={`tab-btn ${activeTab === 'jugadores' ? 'active' : ''}`}
          onClick={() => setActiveTab('jugadores')}
        >
          👥 Estadísticas de Jugadores
        </button>
        <button 
          className={`tab-btn ${activeTab === 'comparativas' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparativas')}
        >
          📈 Comparativas y Análisis
        </button>
      </div>

      {/* Contenido de las Pestañas */}
      <div className="tab-content">
        {activeTab === 'resumen' && renderResumenTab()}
        {activeTab === 'jugadores' && renderJugadoresTab()}
        {activeTab === 'comparativas' && renderComparativasTab()}
      </div>
    </div>
  );
}

export default EstadisticasAnalisis;
