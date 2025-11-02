// src/components/CampoDeJuego.jsx

import React from 'react';
import { formaciones } from '../../config/formaciones';
import campoImg from '../assets/campo-futbol.svg'; // Asegúrate de tener esta imagen en tu proyecto

// Función para formatear los segundos a un formato de minutos (ej: 5')
const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return "0'";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}'`;
};

const CampoDeJuego = ({
  titulares = [],
  formacion = '4-3-3',
  onJugadorClick = () => {},
  jugadorSeleccionadoId = null,
  tiempoEnCampo = {},
}) => {
  const posicionesCampo = formaciones[formacion] || {};

  return (
    <div
      className="relative w-full h-full bg-green-700 bg-no-repeat bg-contain bg-center rounded-lg shadow-inner overflow-hidden"
      style={{ backgroundImage: `url(${campoImg})` }}
    >
      {titulares.map((jugador) => {
        const posicion = posicionesCampo[jugador.posicionCampo];
        if (!posicion) return null; // No renderizar si la posición no existe en la formación

        const isSelected = jugador.id === jugadorSeleccionadoId;

        return (
          <div
            key={jugador.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ top: posicion.top, left: posicion.left }}
            onClick={() => onJugadorClick(jugador)}
          >
            <div
              className={`relative flex flex-col items-center justify-center w-12 h-14 rounded-t-md transition-all duration-200 ${
                isSelected
                  ? 'bg-blue-500 scale-110 shadow-lg'
                  : 'bg-red-600 group-hover:bg-red-700'
              }`}
            >
              {/* Muestra los minutos jugados si están disponibles */}
              {tiempoEnCampo[jugador.id] > 0 && (
                <div className="absolute -top-5 bg-black bg-opacity-70 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                  {formatTime(tiempoEnCampo[jugador.id])}
                </div>
              )}
              <span className="text-white text-xl font-black drop-shadow-sm">{jugador.numero_camiseta}</span>
            </div>
            <div className="text-center text-xs font-semibold text-white bg-black bg-opacity-50 rounded-b-md px-1 truncate w-12">
              {jugador.apodo || jugador.nombre.split(' ')[0]}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CampoDeJuego;
