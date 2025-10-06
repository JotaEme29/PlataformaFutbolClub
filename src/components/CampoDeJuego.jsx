// src/components/CampoDeJuego.jsx
import React from 'react';
import './CampoDeJuego.css'; // Crearemos este archivo a continuación

function CampoDeJuego({ titulares }) {
  return (
    <div className="campo-container">
      <div className="campo">
        <div className="area-grande top"></div>
        <div className="area-pequena top"></div>
        <div className="circulo-central"></div>
        <div className="linea-central"></div>
        <div className="area-grande bottom"></div>
        <div className="area-pequena bottom"></div>
        
        <div className="posiciones-grid">
          {titulares.map((jugador, index) => (
            <div key={jugador.id} className="jugador-en-campo" style={{ gridRow: index + 1 }}>
              <div className="nombre-jugador">{jugador.nombre.split(' ')[0]}</div>
              <div className="dorsal-jugador">{jugador.dorsal}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default CampoDeJuego;
