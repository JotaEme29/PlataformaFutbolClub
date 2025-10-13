// src/components/PlayerForm.jsx

import { useState, useEffect } from 'react';
import './PlayerForm.css'; // Asegúrate de que este archivo CSS exista en la misma carpeta

function PlayerForm({ isOpen, onClose, onSave, jugadorExistente }) {
  const [jugador, setJugador] = useState({
    nombre: '',
    apellidos: '',
    apodo: '',
    dorsal: '',
    posicion: 'Portero',
  });

  useEffect(() => {
    // Si estamos editando, llenamos el formulario con los datos existentes.
    // Si no, lo reseteamos para crear un jugador nuevo.
    if (jugadorExistente) {
      setJugador({
        nombre: jugadorExistente.nombre || '',
        apellidos: jugadorExistente.apellidos || '',
        apodo: jugadorExistente.apodo || '',
        dorsal: jugadorExistente.dorsal || '',
        posicion: jugadorExistente.posicion || 'Portero',
      });
    } else {
      setJugador({
        nombre: '',
        apellidos: '',
        apodo: '',
        dorsal: '',
        posicion: 'Portero',
      });
    }
  }, [jugadorExistente, isOpen]); // Se actualiza cuando cambia el jugador o se abre el modal

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJugador(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(jugador);
  };

  if (!isOpen) {
    return null; // No renderizar nada si el modal no está abierto
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{jugadorExistente ? 'Editar Jugador' : 'Añadir Nuevo Jugador'}</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="player-form">
          <div className="input-group">
            <label>Nombre</label>
            <input name="nombre" value={jugador.nombre} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Apellidos</label>
            <input name="apellidos" value={jugador.apellidos} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Apodo (opcional)</label>
            <input name="apodo" value={jugador.apodo} onChange={handleChange} />
          </div>
          <div className="form-row">
            <div className="input-group">
              <label>Dorsal</label>
              <input name="dorsal" type="number" value={jugador.dorsal} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Posición</label>
              <select name="posicion" value={jugador.posicion} onChange={handleChange}>
                <option>Portero</option>
                <option>Defensa</option>
                <option>Mediocentro</option>
                <option>Delantero</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PlayerForm;