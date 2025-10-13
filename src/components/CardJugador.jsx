import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CardJugador.css'; // Importamos los nuevos estilos

// Componente para un item de estadística individual
const Stat = ({ value, label }) => (
  <div className="stat-item">
    <span className="stat-value">{value}</span>
    <span className="stat-label">{label}</span>
  </div>
);

function CardJugador({ jugador, onEdit, onDelete }) {
  const navigate = useNavigate();

  // Maneja el clic en la tarjeta, evitando la navegación si se hace clic en los botones
  const handleCardClick = (e) => {
    if (e.target.closest('.player-card-actions')) {
      return;
    }
    navigate(`/jugador/${jugador.id}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation(); // Evita que el clic se propague a la tarjeta
    onEdit(jugador);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Evita que el clic se propague a la tarjeta
    onDelete(jugador.id);
  };

  const valoracionGeneral = Math.round(jugador.valoracion_general_promedio || 0);

  return (
    <div className="player-card" onClick={handleCardClick}>
      {/* --- Botones de Acción --- */}
      <div className="player-card-actions">
        <button onClick={handleEditClick} className="player-action-btn" title="Editar Jugador">✏️</button>
        <button onClick={handleDeleteClick} className="player-action-btn" title="Eliminar Jugador">🗑️</button>
      </div>

      {/* --- Banner Superior con Dorsal --- */}
      <div className="player-card-banner">
        <div className="player-card-dorsal">{jugador.dorsal || '#'}</div>
      </div>

      {/* --- Contenido Principal de la Tarjeta --- */}
      <div className="player-card-content">
        
        {/* --- Cabecera con Valoración y Nombre --- */}
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

        {/* --- Grid de Estadísticas Principales --- */}
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