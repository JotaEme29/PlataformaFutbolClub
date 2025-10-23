import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CardJugador.css';

const Stat = ({ value, label }) => (
  <div className="stat-item">
    <span className="stat-value">{value}</span>
    <span className="stat-label">{label}</span>
  </div>
);

function CardJugador({ jugador, onEdit, onDelete }) {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    if (e.target.closest('.player-card-actions')) {
      return;
    }
    navigate(`/jugador/${jugador.id}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(jugador);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(jugador.id);
  };

  const valoracionGeneral = Math.round(jugador.valoracion_general_promedio || 0);

  return (
    <div className="player-card" onClick={handleCardClick}>
      <div className="player-card-actions">
        <button onClick={handleEditClick} className="player-action-btn btn-icon" title="Editar jugador" aria-label="Editar jugador">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
        </button>
        <button onClick={handleDeleteClick} className="player-action-btn btn-icon" title="Eliminar jugador" aria-label="Eliminar jugador">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12m-9 0v-.5A1.5 1.5 0 0110.5 5h3A1.5 1.5 0 0115 6.5V7m-7 0v11a2 2 0 002 2h4a2 2 0 002-2V7"/></svg>
        </button>
      </div>

      <div className="player-card-banner">
        <div className="player-card-dorsal">{jugador.dorsal || '#'}</div>
      </div>

      <div className="player-card-content">
        <div className="player-card-header">
          <div className="player-rating-badge">
            {valoracionGeneral}
            <span>VAL</span>
          </div>
          <div className="player-info">
            <h3 className="player-name">{jugador.nombre} {jugador.apellidos}</h3>
            <p className="player-position">{jugador.posicion || 'Sin posición'}</p>
          </div>
        </div>

        <hr className="stats-separator" />

        <div className="player-stats-grid">
          <Stat value={jugador.total_goles || 0} label="Goles" />
          <Stat value={jugador.total_asistencias || 0} label="Asist." />
          <Stat value={jugador.total_minutos_jugados || 0} label="Minutos" />
          <Stat value={jugador.total_convocatorias || 0} label="Convoc." />
        </div>

      </div>
    </div>
  );
}

export default CardJugador;
