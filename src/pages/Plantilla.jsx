// src/pages/Plantilla.jsx - VERSIÓN FINAL CON EDICIÓN FUNCIONAL

import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import PlayerForm from '../components/PlayerForm';
import CardJugador from '../components/CardJugador';

function Plantilla() {
  const [plantilla, setPlantilla] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [isPlayerFormOpen, setIsPlayerFormOpen] = useState(false);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);

  useEffect(() => {
    if (!currentUser?.teamId) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'jugadores'), where("teamId", "==", currentUser.teamId));
    getDocs(q).then(querySnapshot => {
      const listaJugadores = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlantilla(listaJugadores);
      setLoading(false);
    });
  }, [currentUser]);

  const handleGuardarJugador = async (datosJugador) => {
    if (jugadorSeleccionado) {
      // --- MODO EDICIÓN ---
      const jugadorDocRef = doc(db, 'jugadores', jugadorSeleccionado.id);
      // ¡CORRECCIÓN! Usamos 'updateDoc' para no borrar las estadísticas existentes.
      await updateDoc(jugadorDocRef, datosJugador);
    } else {
      // --- MODO CREACIÓN ---
      const newPlayerData = {
        ...datosJugador,
        teamId: currentUser.teamId,
        total_convocatorias: 0, total_goles: 0, total_asistencias: 0,
        total_minutos_jugados: 0, total_tarjetas_amarillas: 0, total_tarjetas_rojas: 0,
        eventos_evaluados: 0, promedio_tecnica: 0, promedio_fisico: 0,
        promedio_tactica: 0, promedio_actitud: 0, valoracion_general_promedio: 0,
      };
      await addDoc(collection(db, 'jugadores'), newPlayerData);
    }
    // Cierra el formulario y recarga los datos para ver los cambios
    setIsPlayerFormOpen(false);
    window.location.reload(); // Simple y efectivo
  };

  const handleEliminarJugador = async (jugadorId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar a este jugador? Esta acción es irreversible.")) {
      await deleteDoc(doc(db, 'jugadores', jugadorId));
      window.location.reload();
    }
  };

  const abrirFormularioParaEditar = (jugador) => {
    setJugadorSeleccionado(jugador);
    setIsPlayerFormOpen(true);
  };

  const abrirFormularioParaNuevo = () => {
    setJugadorSeleccionado(null);
    setIsPlayerFormOpen(true);
  };

  if (loading) return <div className="card">Cargando plantilla...</div>;

  return (
    <div>
      <div className="plantilla-header">
        <h1>Plantilla</h1>
        <button onClick={abrirFormularioParaNuevo} className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="18" height="18" style={{ marginRight: '6px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          <span>Añadir Jugador</span>
        </button>
      </div>

      <div className="plantilla-grid">
        {plantilla
          .slice() // Crea una copia para no mutar el estado original
          .sort((a, b) => (b.valoracion_general_promedio || 0) - (a.valoracion_general_promedio || 0))
          .map(jugador => (
            <CardJugador
              key={jugador.id}
              jugador={jugador}
              onEdit={abrirFormularioParaEditar}
              onDelete={handleEliminarJugador}
            />
          ))}
      </div>
      

      {/* El PlayerForm ahora es un modal que se renderiza aquí */}
      <PlayerForm
        isOpen={isPlayerFormOpen}
        onClose={() => setIsPlayerFormOpen(false)}
        onSave={handleGuardarJugador}
        jugadorExistente={jugadorSeleccionado}
      />
    </div>
  );
}

export default Plantilla;
