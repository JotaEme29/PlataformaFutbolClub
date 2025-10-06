// src/components/Cronometro.jsx

import React, { useState, useEffect, useRef } from 'react';

// La función ahora recibe 'fase' como una prop para controlar el reinicio.
function Cronometro({ enPausa, onTiempoActualizado, fase }) {
  const [segundos, setSegundos] = useState(0);
  const intervalRef = useRef(null);

  // --- EFECTO 1: Reiniciar el cronómetro ---
  // Este efecto se ejecuta CADA VEZ que la prop 'fase' cambia.
  useEffect(() => {
    // Si la fase cambia a 'primer_tiempo' o 'segundo_tiempo',
    // forzamos el contador de segundos a volver a 0.
    if (fase === 'primer_tiempo' || fase === 'segundo_tiempo') {
      setSegundos(0);
    }
  }, [fase]); // La dependencia es 'fase'.

  // --- EFECTO 2: Controlar el intervalo (play/pausa) ---
  // Este efecto se ejecuta CADA VEZ que la prop 'enPausa' cambia.
  useEffect(() => {
    if (!enPausa) {
      // Si no está en pausa, creamos un intervalo que suma 1 cada segundo.
      intervalRef.current = setInterval(() => {
        setSegundos(prevSegundos => prevSegundos + 1);
      }, 1000);
    } else {
      // Si está en pausa, limpiamos el intervalo para que se detenga.
      clearInterval(intervalRef.current);
    }

    // Función de limpieza: se ejecuta si el componente se desmonta para evitar fugas de memoria.
    return () => clearInterval(intervalRef.current);
  }, [enPausa]); // La dependencia es 'enPausa'.

  // --- EFECTO 3: Informar al componente padre ---
  // Este efecto se ejecuta CADA VEZ que el estado 'segundos' cambia.
  useEffect(() => {
    // Si la función 'onTiempoActualizado' existe, la llamamos con el valor actual.
    if (onTiempoActualizado) {
      onTiempoActualizado(segundos);
    }
  }, [segundos, onTiempoActualizado]); // Las dependencias son 'segundos' y la función prop.

  // --- Función de formato de tiempo ---
  // Convierte el total de segundos a un formato MM:SS.
  const formatoTiempo = (totalSegundos) => {
    const minutos = Math.floor(totalSegundos / 60);
    const segundosRestantes = totalSegundos % 60;
    return `${String(minutos).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`;
  };

  // --- Renderizado del Componente ---
  return (
    <div className="cronometro-display" style={{ fontSize: '2em', fontWeight: 'bold' }}>
      <span>{formatoTiempo(segundos)}</span>
    </div>
  );
}

export default Cronometro;
