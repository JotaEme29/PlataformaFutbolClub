import React from 'react';
import { FaStar } from 'react-icons/fa';

// Este es el mismo componente de estrellas que estaba en el modal
const CriterioEvaluacion = ({ titulo, valor, onCambio }) => {
  return (
    <div className="criterio-evaluacion">
      <label>{titulo}</label>
      <div className="stars-container">
        {[...Array(5)].map((_, i) => {
          const ratingValue = i + 1;
          return (
            <FaStar
              key={i}
              className="star"
              color={ratingValue <= valor ? '#ffc107' : '#e4e5e9'}
              onClick={() => onCambio(ratingValue)}
            />
          );
        })}
      </div>
    </div>
  );
};

const PanelDeEvaluacion = ({ jugador, evaluacion, onEvalChange }) => {
  if (!jugador) {
    return (
      <div className="panel-evaluacion panel-vacio">
        <h3>Selecciona un jugador de la lista para ver o editar su evaluación.</h3>
      </div>
    );
  }

  const handleCambioCriterio = (categoria, criterio, valor) => {
    const nuevaEvaluacion = {
      ...evaluacion,
      [categoria]: {
        ...(evaluacion[categoria] || {}),
        [criterio]: valor,
      },
    };
    onEvalChange(jugador.id, nuevaEvaluacion);
  };

  const handleComentariosChange = (e) => {
    const nuevaEvaluacion = { ...evaluacion, comentarios: e.target.value };
    onEvalChange(jugador.id, nuevaEvaluacion);
  };

  const categorias = {
    tecnica: ['Control', 'Dribbling', 'Pase', 'Tiro'],
    tactica: ['Posicionamiento', 'Toma de Decisiones', 'Lectura de Juego'],
    fisico: ['Velocidad', 'Resistencia', 'Fuerza'],
    actitud: ['Esfuerzo', 'Trabajo en Equipo', 'Disciplina'],
  };

  return (
    <div className="panel-evaluacion">
      <div className="panel-header">
        <h3>Evaluación de {jugador.apodo || jugador.nombre}</h3>
        <div className="stats-resumen">
          <span><strong>Minutos:</strong> {evaluacion.minutos_jugados || 0}'</span>
          <span><strong>Goles:</strong> {evaluacion.goles || 0}</span>
          <span><strong>Asistencias:</strong> {evaluacion.asistencias || 0}</span>
        </div>
      </div>
      <div className="panel-body">
        {Object.entries(categorias).map(([cat, crit]) => (
          <div key={cat} className="categoria-evaluacion">
            <h4>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h4>
            <div className="criterios-grid">
              {crit.map(criterio => (
                <CriterioEvaluacion
                  key={criterio}
                  titulo={criterio}
                  valor={evaluacion[cat]?.[criterio] || 0}
                  onCambio={(valor) => handleCambioCriterio(cat, criterio, valor)}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="comentarios-seccion">
          <h4>Comentarios Generales</h4>
          <textarea
            rows="4"
            placeholder="Añade tus observaciones sobre el rendimiento del jugador..."
            value={evaluacion.comentarios || ''}
            onChange={handleComentariosChange}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default PanelDeEvaluacion;
