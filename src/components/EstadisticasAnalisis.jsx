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
import RankingGoles from './RankingGoles';
import RankingAsistencias from './RankingAsistencias';
import RankingMinutos from './RankingMinutos';
import RankingPromedio from './RankingPromedio';
import GraficoEvolucion from './GraficoEvolucion';

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

  // Normaliza estructura de jugadores para componentes de ranking
  const jugadoresNormalizados = jugadores.map(j => ({
    ...j,
    total_goles: (j.total_goles ?? j.estadisticas?.goles ?? 0),
    total_asistencias: (j.total_asistencias ?? j.estadisticas?.asistencias ?? 0),
    total_minutos_jugados: (j.total_minutos_jugados ?? j.estadisticas?.minutosJugados ?? 0),
  }));

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
    <div>
      <h3>Resumen del Club</h3>
      <div className="stats-grid-modern">
        <div className="stat-card-modern">
          <h3>{estadisticasClub.totalEquipos}</h3>
          <p>Equipos</p>
        </div>
        <div className="stat-card-modern">
          <h3>{estadisticasClub.totalJugadores}</h3>
          <p>Jugadores</p>
        </div>
        <div className="stat-card-modern">
          <h3>{estadisticasClub.totalEventos}</h3>
          <p>Eventos Totales</p>
        </div>
        <div className="stat-card-modern">
          <h3>{estadisticasClub.partidosJugados}</h3>
          <p>Partidos</p>
        </div>
        <div className="stat-card-modern">
          <h3>{estadisticasClub.entrenamientos}</h3>
          <p>Entrenamientos</p>
        </div>
        <div className="stat-card-modern">
          <h3>{estadisticasClub.proximosEventos}</h3>
          <p>Próximos Eventos</p>
        </div>
      </div>

      <h3>Distribución por Equipos</h3>
      <div className="stats-grid-modern">
        {equipos.map(equipo => (
          <div key={equipo.id} className="stat-card-modern">
            <h4>{equipo.nombre}</h4>
            <p><strong>Formato:</strong> Fútbol {equipo.formato}</p>
            <p><strong>Entrenador:</strong> {equipo.entrenador || 'No asignado'}</p>
          </div>
        ))}
      </div>

      <h3>Actividad Reciente</h3>
      <div className="stats-grid-modern">
        {getEventosRecientes().map(evento => (
          <div key={evento.id} className="stat-card-modern">
            <h5>{evento.titulo}</h5>
            <p>{getEquipoNombre(evento.equipoId)}</p>
            <span>
              {evento.fecha?.toDate ? evento.fecha.toDate().toLocaleDateString('es-ES') : 'Fecha no disponible'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderJugadoresTab = () => (
    <div>
      <h3>Estadísticas de Jugadores</h3>
      <div className="eventos-filters-modern">
        <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
          <option value="">Selecciona un equipo</option>
          {equipos.map(equipo => (
            <option key={equipo.id} value={equipo.id}>
              {equipo.nombre}
            </option>
          ))}
        </select>
      </div>

      {selectedTeam && jugadores.length > 0 && (
        <div className="stats-grid-modern">
          <div className="stat-card-modern">
            <h3>{jugadores.length}</h3>
            <p>Jugadores</p>
          </div>
          <div className="stat-card-modern">
            <h3>{calcularPromedioEdad()}</h3>
            <p>Edad Promedio</p>
          </div>
          <div className="stat-card-modern">
            <h3>{jugadores.reduce((total, j) => total + (j.estadisticas?.goles || 0), 0)}</h3>
            <p>Goles Totales</p>
          </div>
          <div className="stat-card-modern">
            <h3>{jugadores.reduce((total, j) => total + (j.estadisticas?.asistencias || 0), 0)}</h3>
            <p>Asistencias Totales</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderComparativasTab = () => (
    <div>
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
  );

  if (loading) {
    return <div className="loading">Cargando estadísticas...</div>;
  }

  return (
    <div>
      <div className="info-card-modern">
        <h2>Estadísticas y Análisis</h2>
        <div className="actions-grid-modern">
            <button className={`action-btn-modern ${activeTab === 'resumen' ? 'active' : ''}`} onClick={() => setActiveTab('resumen')}>
                Resumen General
            </button>
            <button className={`action-btn-modern ${activeTab === 'jugadores' ? 'active' : ''}`} onClick={() => setActiveTab('jugadores')}>
                Estadísticas de Jugadores
            </button>
            <button className={`action-btn-modern ${activeTab === 'comparativas' ? 'active' : ''}`} onClick={() => setActiveTab('comparativas')}>
                Comparativas y Análisis
            </button>
        </div>
      </div>

      {activeTab === 'resumen' && <div className="info-card-modern">{renderResumenTab()}</div>}
      {activeTab === 'jugadores' && <div className="info-card-modern">{renderJugadoresTab()}</div>}
      {activeTab === 'comparativas' && <div className="info-card-modern">{renderComparativasTab()}</div>}
    </div>
  );
}

export default EstadisticasAnalisis;
