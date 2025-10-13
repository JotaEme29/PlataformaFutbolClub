// src/components/CampoDeJuego.jsx - VERSIÓN FINAL Y ESTABLE

import './CampoDeJuego.css';
import { formaciones, ordenPosiciones } from '../../config/formaciones.js';

function CampoDeJuego({ titulares = [], onJugadorClick, formacion, tiempoEnCampo }) {
  const coords = formaciones[formacion] || formaciones['4-3-3'];
  const orden = ordenPosiciones[formacion] || ordenPosiciones['4-3-3'];

  return (
    <div className="campo-container">
      <div className="campo">
        <div className="linea-central"></div>
        <div className="circulo-central"></div>
        <div className="area-grande area-arriba"></div>
        <div className="area-pequena area-arriba"></div>
        <div className="area-grande area-abajo"></div>
        <div className="area-pequena area-abajo"></div>

        {orden.map((pos, index) => {
          const jugador = titulares.find(j => j.posicionCampo === pos) || null; // Lógica para encontrar al jugador en esa posición
          const posicionStyle = coords[pos];

          return (
            <div key={pos} className="posicion-tactica" style={posicionStyle}>
              {jugador ? (
                // Al hacer clic en un jugador, se llama a onJugadorClick con ese jugador
                <div className="jugador-en-campo clickable" onClick={() => onJugadorClick(jugador)}>
                  <span className="dorsal">{jugador.dorsal}</span>
                  <span className="nombre">{jugador.nombre.split(' ')[0]}</span>
                  <div className="minutos-en-campo">{Math.floor((tiempoEnCampo[jugador.id] || 0) / 60)}'</div>
                </div>
              ) : (
                // Si no hay jugador, se muestra un espacio vacío.
                <div className="posicion-vacia clickable" onClick={() => onJugadorClick(null)}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CampoDeJuego;
