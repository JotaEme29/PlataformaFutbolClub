// src/components/EventoForm.jsx

import { useState, useEffect } from 'react';
import './EventoForm.css';

function EventoForm({ isOpen, onClose, onSave }) {
  const [nuevoEvento, setNuevoEvento] = useState({
    tipo: 'Partido',
    descripcion: '',
    fecha: '',
    condicion: 'Local',
  });

  useEffect(() => {
    // Resetea el formulario cada vez que se abre
    if (isOpen) {
      setNuevoEvento({
        tipo: 'Partido',
        descripcion: '',
        fecha: '',
        condicion: 'Local',
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoEvento(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(nuevoEvento);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear Nuevo Evento</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="evento-form">
          <div className="input-group">
            <label>Tipo</label>
            <select name="tipo" value={nuevoEvento.tipo} onChange={handleChange}>
              <option value="Partido">Partido</option>
              <option value="Entrenamiento">Entrenamiento</option>
            </select>
          </div>
          <div className="input-group">
            <label>Descripción</label>
            <input name="descripcion" value={nuevoEvento.descripcion} onChange={handleChange} placeholder={nuevoEvento.tipo === 'Partido' ? 'vs Rival' : 'Foco del entreno'} required />
          </div>
          <div className="input-group">
            <label>Fecha</label>
            <input name="fecha" type="date" value={nuevoEvento.fecha} onChange={handleChange} required />
          </div>
          {nuevoEvento.tipo === 'Partido' && (
            <div className="input-group">
              <label>Condición</label>
              <select name="condicion" value={nuevoEvento.condicion} onChange={handleChange}>
                <option value="Local">Local</option>
                <option value="Visitante">Visitante</option>
              </select>
            </div>
          )}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Crear Evento</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventoForm;