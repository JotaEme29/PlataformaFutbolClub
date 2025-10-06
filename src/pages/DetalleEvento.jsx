import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, getDocs, collection, addDoc, updateDoc, deleteDoc, where, query, increment, writeBatch } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { registrarAccion, escucharAccionesEnVivo } from '../services/PartidoService.js';
import Cronometro from '../components/Cronometro';

function DetalleEvento() {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // --- Estados del Componente ---
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [plantilla, setPlantilla] = useState([]);
  const [convocados, setConvocados] = useState([]);
  const [noConvocados, setNoConvocados] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState({});
  const [evaluacionesGuardadas, setEvaluacionesGuardadas] = useState([]);
  const [yaEvaluado, setYaEvaluado] = useState(false);
  const [statsPartido, setStatsPartido] = useState({ goles_local: 0, goles_visitante: 0 });
  const [vista, setVista] = useState('convocatoria');

  // --- Estados para la funcionalidad "En Vivo" ---
  const [accionesEnVivo, setAccionesEnVivo] = useState([]);
  const [seleccionandoJugador, setSeleccionandoJugador] = useState(null);
  const [titulares, setTitulares] = useState([]);
  const [suplentes, setSuplentes] = useState([]);
  const [cronoEnPausa, setCronoEnPausa] = useState(true);
  const [minutoActual, setMinutoActual] = useState(0);
  // Justo debajo de los otros estados "En Vivo"
  const [fasePartido, setFasePartido] = useState('preparacion'); // 'preparacion', 'primer_tiempo', 'descanso', 'segundo_tiempo', 'finalizado'
  // Justo debajo de los otros estados "En Vivo"
  const [tiempoPrimeraParte, setTiempoPrimeraParte] = useState(0);
  const [tiempoSegundaParte, setTiempoSegundaParte] = useState(0);
  // En DetalleEvento.jsx, junto a las otras funciones
  const resetearTiempos = () => {
  setTiempoPrimeraParte(0);
  setTiempoSegundaParte(0);
  };



  // --- Carga de Datos Inicial ---
  useEffect(() => {
    const obtenerDatos = async () => {
      if (!currentUser?.teamId) { setLoading(false); setError("No se ha podido verificar tu equipo."); return; }
      const eventoDocRef = doc(db, 'eventos', eventoId);
      const eventoDoc = await getDoc(eventoDocRef);
      if (!eventoDoc.exists() || eventoDoc.data().teamId !== currentUser.teamId) { setError("Evento no encontrado o no tienes permiso para verlo."); setLoading(false); return; }
      
      const eventoData = { id: eventoDoc.id, ...eventoDoc.data() };
      setEvento(eventoData);
      if (typeof eventoData.goles_local !== 'undefined') { setStatsPartido({ goles_local: eventoData.goles_local, goles_visitante: eventoData.goles_visitante }); }
      
      const qPlantilla = query(collection(db, 'jugadores'), where("teamId", "==", currentUser.teamId));
      const plantillaSnapshot = await getDocs(qPlantilla);
      const listaPlantilla = plantillaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlantilla(listaPlantilla);
      
      const qEvaluaciones = query(collection(db, 'evaluaciones'), where('id_evento', '==', eventoId), where('teamId', '==', currentUser.teamId));
      const evaluacionesSnapshot = await getDocs(qEvaluaciones);
      const evaluado = !evaluacionesSnapshot.empty;
      setYaEvaluado(evaluado);

      if (evaluado) {
        const datosGuardados = evaluacionesSnapshot.docs.map(docEval => {
          const datos = docEval.data();
          const jugadorInfo = listaPlantilla.find(j => j.id === datos.id_jugador);
          return { ...datos, nombre: jugadorInfo?.nombre || 'N/A', apellidos: jugadorInfo?.apellidos || '' };
        });
        setEvaluacionesGuardadas(datosGuardados);
      }

      const convocadosIds = eventoData.convocados || [];
      const jugadoresConvocados = listaPlantilla.filter(j => convocadosIds.includes(j.id));
      setConvocados(jugadoresConvocados);
      setNoConvocados(listaPlantilla.filter(j => !convocadosIds.includes(j.id)));
      
      // Inicializamos la alineación para la vista "En Vivo"
      setTitulares([]);
      setSuplentes(jugadoresConvocados);
      
      setLoading(false);
    };
    obtenerDatos();
  }, [eventoId, currentUser]);

  // --- Listener para Acciones en Vivo ---
  useEffect(() => {
    if (vista !== 'en_vivo' || !eventoId) return;
    const unsubscribe = escucharAccionesEnVivo(eventoId, (nuevasAcciones) => {
      setAccionesEnVivo(nuevasAcciones);
    });
    return () => {
      console.log("Cerrando listener de acciones en vivo.");
      unsubscribe();
    };
  }, [vista, eventoId]);

  // --- Funciones de Gestión de Convocatoria ---
  const moverJugador = (jugador, aConvocados) => {
    if (yaEvaluado) { alert("No se puede modificar la convocatoria de un evento que ya ha sido evaluado."); return; }
    if (aConvocados) {
      setNoConvocados(noConvocados.filter(j => j.id !== jugador.id));
      setConvocados([...convocados, jugador]);
    } else {
      setConvocados(convocados.filter(j => j.id !== jugador.id));
      setNoConvocados([...noConvocados, jugador]);
    }
  };

  const guardarConvocatoria = async () => {
    const convocadosIds = convocados.map(j => j.id);
    const eventoDocRef = doc(db, 'eventos', eventoId);
    await updateDoc(eventoDocRef, { convocados: convocadosIds });
    for (const jugador of plantilla) {
      const jugadorDocRef = doc(db, 'jugadores', jugador.id);
      const convocadoEstaVez = convocadosIds.includes(jugador.id);
      const yaEstabaConvocado = (evento.convocados || []).includes(jugador.id);
      if (convocadoEstaVez && !yaEstabaConvocado) { await updateDoc(jugadorDocRef, { total_convocatorias: increment(1) }); }
      else if (!convocadoEstaVez && yaEstabaConvocado) { await updateDoc(jugadorDocRef, { total_convocatorias: increment(-1) }); }
    }
    alert("Convocatoria guardada.");
    window.location.reload();
  };

  // --- Funciones de Gestión "En Vivo" ---
  const gestionarAlineacion = (jugador, aTitulares) => {
    if (aTitulares) {
      setSuplentes(suplentes.filter(j => j.id !== jugador.id));
      setTitulares([...titulares, jugador]);
    } else {
      setTitulares(titulares.filter(j => j.id !== jugador.id));
      setSuplentes([...suplentes, jugador]);
    }
  };

  const iniciarSeleccionJugador = (tipoAccion) => {
    setSeleccionandoJugador({ tipo: tipoAccion });
  };

  // En DetalleEvento.jsx

const finalizarSeleccionJugador = async (jugador) => {
  // Si no estamos en modo de selección, no hacemos nada.
  if (!seleccionandoJugador) return;

  try {
    // Mensaje en la consola para depuración.
    console.log(`Registrando ${seleccionandoJugador.tipo} para ${jugador.nombre}...`);

    // PASO 1: Crear el objeto 'accion' con todos sus datos.
    const accion = {
      tipo: seleccionandoJugador.tipo,
      jugador_principal_id: jugador.id,
      nombre_jugador: `${jugador.nombre} ${jugador.apellidos}`,
      // Calcula el minuto redondeado hacia arriba, usando el tiempo de la fase actual del partido.
      minuto: Math.ceil((fasePartido === 'primer_tiempo' ? tiempoPrimeraParte : tiempoSegundaParte) / 60)
      };

    // PASO 2: Si la acción es un GOL, actualizamos el estado del marcador.
    if (accion.tipo === 'GOL') {
      setStatsPartido(prevStats => {
        const esLocal = evento.condicion === 'Local';
        return {
          ...prevStats,
          goles_local: esLocal ? prevStats.goles_local + 1 : prevStats.goles_local,
          goles_visitante: !esLocal ? prevStats.goles_visitante + 1 : prevStats.goles_visitante,
        };
      });
    }

    // PASO 3: Guardamos la acción en la base de datos usando el servicio.
    await registrarAccion(eventoId, accion);

    console.log("¡Acción registrada con éxito!");

  } catch (error) {
    // Si ocurre un error al guardar, lo mostramos en la consola y al usuario.
    console.error("Error al registrar la acción:", error);
    alert("No se pudo registrar la acción. Inténtalo de nuevo.");
  } finally {
    // PASO 4: Se ejecuta siempre. Limpiamos el estado para salir del modo de selección.
    setSeleccionandoJugador(null);
  }
};


  // --- Funciones de Evaluación y Estadísticas ---
  const handleEvalChange = (jugadorId, campo, valor) => { setEvaluaciones(prev => ({ ...prev, [jugadorId]: { ...prev[jugadorId], [campo]: Number(valor) } })); };
  const handleStatsPartidoChange = (e) => { const { name, value } = e.target; setStatsPartido(prev => ({ ...prev, [name]: Number(value) })); };

  const guardarEvaluacionesYStats = async () => {
    if (Object.keys(evaluaciones).length === 0) { alert("No has introducido ninguna evaluación."); return; }
    let sumaDePromediosColectivos = 0;
    let jugadoresEvaluadosCount = 0;
    const batch = writeBatch(db);
    for (const jugadorId in evaluaciones) {
      const datosEvaluacion = evaluaciones[jugadorId];
      const evalDocRef = doc(collection(db, 'evaluaciones'));
      batch.set(evalDocRef, { id_jugador: jugadorId, id_evento: eventoId, fecha_evento: evento.fecha, teamId: currentUser.teamId, ...datosEvaluacion });
      const jugadorDocRef = doc(db, 'jugadores', jugadorId);
      const jugadorDoc = await getDoc(jugadorDocRef);
      const datosJugador = jugadorDoc.data();
      const updates = { total_goles: increment(datosEvaluacion.goles || 0), total_asistencias: increment(datosEvaluacion.asistencias || 0), total_minutos_jugados: increment(datosEvaluacion.minutos_jugados || 0), total_tarjetas_amarillas: increment(datosEvaluacion.tarjetas_amarillas_partido || 0), total_tarjetas_rojas: increment(datosEvaluacion.tarjetas_rojas_partido || 0), total_faltas_cometidas: increment(datosEvaluacion.faltas_cometidas_partido || 0) };
      const eventosEvaluadosPrevios = datosJugador.eventos_evaluados || 0;
      const nuevoTotalEventosEvaluados = eventosEvaluadosPrevios + 1;
      updates.promedio_tecnica = ((datosJugador.promedio_tecnica || 0) * eventosEvaluadosPrevios + (datosEvaluacion.tecnica || 0)) / nuevoTotalEventosEvaluados;
      updates.promedio_fisico = ((datosJugador.promedio_fisico || 0) * eventosEvaluadosPrevios + (datosEvaluacion.fisico || 0)) / nuevoTotalEventosEvaluados;
      updates.promedio_tactica = ((datosJugador.promedio_tactica || 0) * eventosEvaluadosPrevios + (datosEvaluacion.tactica || 0)) / nuevoTotalEventosEvaluados;
      updates.promedio_actitud = ((datosJugador.promedio_actitud || 0) * eventosEvaluadosPrevios + (datosEvaluacion.actitud || 0)) / nuevoTotalEventosEvaluados;
      updates.eventos_evaluados = nuevoTotalEventosEvaluados;
      updates.valoracion_general_promedio = (updates.promedio_tecnica + updates.promedio_fisico + updates.promedio_tactica + updates.promedio_actitud) / 4;
      batch.update(jugadorDocRef, updates);
      const promedioIndividualColectivo = ((datosEvaluacion.tecnica || 0) + (datosEvaluacion.fisico || 0) + (datosEvaluacion.tactica || 0) + (datosEvaluacion.actitud || 0)) / 4;
      if (promedioIndividualColectivo > 0) { sumaDePromediosColectivos += promedioIndividualColectivo; jugadoresEvaluadosCount++; }
    }
    const valoracionColectivaFinal = jugadoresEvaluadosCount > 0 ? sumaDePromediosColectivos / jugadoresEvaluadosCount : 0;
    let puntos = 0;
    let goles_favor_reales, goles_contra_reales;
    if (evento.condicion === 'Local') { goles_favor_reales = statsPartido.goles_local; goles_contra_reales = statsPartido.goles_visitante; }
    else { goles_favor_reales = statsPartido.goles_visitante; goles_contra_reales = statsPartido.goles_local; }
    if (goles_favor_reales > goles_contra_reales) puntos = 3;
    else if (goles_favor_reales === goles_contra_reales) puntos = 1;
    const eventoDocRef = doc(db, 'eventos', eventoId);
    batch.update(eventoDocRef, { valoracion_colectiva: valoracionColectivaFinal, goles_local: statsPartido.goles_local, goles_visitante: statsPartido.goles_visitante, goles_favor: goles_favor_reales, goles_contra: goles_contra_reales, puntos_obtenidos: puntos });
    await batch.commit();
    alert("¡Evaluaciones y estadísticas del partido guardadas!");
    window.location.reload();
  };

  const eliminarEvento = async () => {
    if (window.confirm("¿Seguro que quieres eliminar este evento y todas sus evaluaciones asociadas?")) {
      const q = query(collection(db, 'evaluaciones'), where('id_evento', '==', eventoId));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => { batch.delete(doc.ref); });
      batch.delete(doc(db, 'eventos', eventoId));
      await batch.commit();
      navigate('/eventos');
    }
  };

  // Debajo de la función `eliminarEvento`

const sincronizarAccionesConEvaluacion = async () => {
  console.log("Sincronizando acciones con el formulario de evaluación...");
  
  // 1. Obtenemos todas las acciones del partido desde Firestore.
  const q = query(collection(db, 'eventos', eventoId, 'acciones_partido'));
  const accionesSnapshot = await getDocs(q);
  const accionesDelPartido = accionesSnapshot.docs.map(doc => doc.data());

  if (accionesDelPartido.length === 0) {
    console.log("No hay acciones en vivo para sincronizar.");
    return; // No hay nada que hacer
  }

  // 2. Creamos un objeto para almacenar los totales de cada jugador.
  const totalesPorJugador = {};

  // NUEVO: Pre-rellenamos la evaluación de cada convocado con un valor base
  for (const jugador of convocados) {
    totalesPorJugador[jugador.id] = {
      tecnica: 5,
      fisico: 5,
      tactica: 5,
      actitud: 5,
      goles: 0,
      asistencias: 0,
      tarjetas_amarillas_partido: 0,
      tarjetas_rojas_partido: 0,
      minutos_jugados: 0,
      faltas_cometidas_partido: 0, // Asumimos 0 por ahora
    };
  }

  // 3. Iteramos sobre cada acción para contar los totales.
  for (const accion of accionesDelPartido) {
    const jugadorId = accion.jugador_principal_id;

    // Si es la primera vez que vemos a este jugador, inicializamos su objeto.
    if (!totalesPorJugador[jugadorId]) {
      totalesPorJugador[jugadorId] = {
        goles: 0,
        asistencias: 0,
        tarjetas_amarillas_partido: 0,
        tarjetas_rojas_partido: 0,
      };
    }

    // 4. Sumamos al contador correspondiente según el tipo de acción.
    switch (accion.tipo) {
      case 'GOL':
        totalesPorJugador[jugadorId].goles += 1;
        break;
      case 'ASISTENCIA':
        totalesPorJugador[jugadorId].asistencias += 1;
        break;
      case 'AMARILLA':
        totalesPorJugador[jugadorId].tarjetas_amarillas_partido += 1;
        break;
      case 'ROJA':
        totalesPorJugador[jugadorId].tarjetas_rojas_partido += 1;
        break;
      default:
        break;
    }

    // 5. Añadimos los minutos jugados a los titulares
  const minutosDelPartido = minutoActual;
  for (const jugador of titulares) {
    if (!totalesPorJugador[jugador.id]) {
      totalesPorJugador[jugador.id] = {}; // Aseguramos que el objeto exista
    }
    // Asignamos los minutos totales del partido a quienes terminaron jugando
    totalesPorJugador[jugador.id].minutos_jugados = minutosDelPartido;
  }

  // 6. Actualizamos el estado 'evaluaciones' con los totales calculados.
  setEvaluaciones(evaluacionesPrevias => {
    // ... (el resto de la función se mantiene igual)
  });
};

  // 5. Actualizamos el estado 'evaluaciones' con los totales calculados.
  // Usamos el formato funcional de setEvaluaciones para asegurar que partimos del estado más reciente.
  setEvaluaciones(evaluacionesPrevias => {
    const nuevasEvaluaciones = { ...evaluacionesPrevias };
    for (const jugadorId in totalesPorJugador) {
      nuevasEvaluaciones[jugadorId] = {
        ...nuevasEvaluaciones[jugadorId], // Mantenemos cualquier dato ya existente (ej. técnica)
        ...totalesPorJugador[jugadorId], // Sobrescribimos con los nuevos totales
      };
    }
    return nuevasEvaluaciones;
  });

  console.log("Sincronización completada. Estado de evaluaciones actualizado:", totalesPorJugador);
};


  // --- Renderizado del Componente ---
  if (loading) return <div>Cargando evento...</div>;
  if (error) return <div className="card auth-error">{error}</div>;

  return (
    <div>
      <h1>{evento.tipo}: {evento.descripcion}</h1>
      <p>{new Date(evento.fecha).toLocaleDateString()} ({evento.condicion})</p>

      <div className="botones-vista-evento">
        <button onClick={() => setVista('convocatoria')} className={vista === 'convocatoria' ? '' : 'btn-secondary'}>
          1. Convocatoria
        </button>
        {evento?.convocados?.length > 0 && !yaEvaluado && (
          <button onClick={() => setVista('en_vivo')} className={vista === 'en_vivo' ? '' : 'btn-secondary'}>
            2. Seguimiento en Vivo
          </button>
        )}
            <button 
            onClick={() => {
              setVista('evaluacion');
              if (!yaEvaluado) { // Solo sincronizamos si el partido no ha sido guardado/evaluado aún
                sincronizarAccionesConEvaluacion();
              }
            }} 
            className={vista === 'evaluacion' ? '' : 'btn-secondary'}
          >

          {evento?.convocados?.length > 0 && !yaEvaluado ? '3. Evaluación' : '2. Evaluación'}
        </button>
      </div>

      {vista === 'convocatoria' && (
        <div className="card">
          <h2>Gestión de Convocatoria</h2>
          <div className="convocatoria-grid">
            <div>
              <h3>Plantilla ({noConvocados.length})</h3>
              <div className="lista-jugadores-convocatoria">
                {noConvocados.map(j => <div key={j.id} onClick={() => currentUser?.rol === 'administrador' && moverJugador(j, true)} className={`item-jugador ${currentUser?.rol === 'administrador' ? 'clickable' : ''}`}>{j.nombre} {j.apellidos}</div>)}
              </div>
            </div>
            <div>
              <h3>Convocados ({convocados.length})</h3>
              <div className="lista-jugadores-convocatoria">
                {convocados.map(j => <div key={j.id} onClick={() => currentUser?.rol === 'administrador' && moverJugador(j, false)} className={`item-jugador convocado ${currentUser?.rol === 'administrador' ? 'clickable' : ''}`}>{j.nombre} {j.apellidos}</div>)}
              </div>
            </div>
          </div>
          {currentUser?.rol === 'administrador' && !yaEvaluado && <button onClick={guardarConvocatoria} className="btn-full-width" style={{marginTop: '20px'}}>Guardar Convocatoria</button>}
        </div>
      )}

      {vista === 'en_vivo' && (
        <div className="card">
          <h2>Seguimiento en Vivo</h2>
          {/* Panel del Cronómetro y Controles de Fase del Partido */}
          <div style={{ borderBottom: '1px solid #444', marginBottom: '20px', paddingBottom: '20px', textAlign: 'center' }}>
            // Dentro del return de DetalleEvento.jsx
            <Cronometro 
              enPausa={cronoEnPausa}
              onTiempoActualizado={(segundos) => {
                if (fasePartido === 'primer_tiempo') setTiempoPrimeraParte(segundos);
                if (fasePartido === 'segundo_tiempo') setTiempoSegundaParte(segundos);
              }}
              fase={fasePartido} // ¡Esta línea es crucial!
            />

            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              
              {fasePartido === 'preparacion' && (
                <button onClick={() => { setCronoEnPausa(false); setFasePartido('primer_tiempo'); }} disabled={titulares.length < 7}>
                  ▶ Iniciar 1er Tiempo
                </button>
              )}

              {fasePartido === 'primer_tiempo' && (
                <button onClick={() => { setCronoEnPausa(true); setFasePartido('descanso'); }}>
                  ❚❚ Finalizar 1er Tiempo
                </button>
              )}

              // En el JSX de los botones de fase
              {fasePartido === 'descanso' && (
                <button onClick={() => { 
                  // ¡CORRECCIÓN AQUÍ!
                  // No reseteamos el crono, simplemente lo reanudamos.
                  // El tiempo del 2do tiempo se acumulará en su propio estado.
                  setCronoEnPausa(false); 
                  setFasePartido('segundo_tiempo'); 
                }}>
                  ▶ Iniciar 2do Tiempo
                </button>
              )}


              {fasePartido === 'segundo_tiempo' && (
                <button onClick={() => { setCronoEnPausa(true); setFasePartido('finalizado'); sincronizarAccionesConEvaluacion(); setVista('evaluacion'); }}>
                  🏁 Finalizar Partido y Evaluar
                </button>
              )}

            </div>
          </div>

          {cronoEnPausa && minutoActual === 0 ? (
            <div>
              <h3>Definir Alineación Titular</h3>
              <div className="convocatoria-grid">
                <div>
                  <h3>Suplentes ({suplentes.length})</h3>
                  <div className="lista-jugadores-convocatoria">
                    {suplentes.map(j => <div key={j.id} onClick={() => gestionarAlineacion(j, true)} className="item-jugador clickable">{j.nombre} {j.apellidos}</div>)}
                  </div>
                </div>
                <div>
                  <h3>Titulares ({titulares.length})</h3>
                  <div className="lista-jugadores-convocatoria">
                    {titulares.map(j => <div key={j.id} onClick={() => gestionarAlineacion(j, false)} className="item-jugador convocado clickable">{j.nombre} {j.apellidos}</div>)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {seleccionandoJugador ? (
                <div>
                  <h3>Selecciona el jugador para: <strong>{seleccionandoJugador.tipo}</strong></h3>
                  <div className="lista-jugadores-convocatoria">
                    {titulares.map(jugador => <div key={jugador.id} className="item-jugador clickable" onClick={() => finalizarSeleccionJugador(jugador)}>{jugador.nombre} {jugador.apellidos}</div>)}
                  </div>
                  <button onClick={() => setSeleccionandoJugador(null)} className="btn-secondary" style={{marginTop: '10px'}}>Cancelar</button>
                </div>
              ) : (
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                  <div>
                    <h3>Registrar Acción</h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                      <button onClick={() => iniciarSeleccionJugador('GOL')}>⚽ Registrar Gol</button>
                      <button onClick={() => iniciarSeleccionJugador('ASISTENCIA')}>🤝 Registrar Asistencia</button>
                      <button onClick={() => iniciarSeleccionJugador('AMARILLA')}>🟨 Tarjeta Amarilla</button>
                      <button onClick={() => iniciarSeleccionJugador('ROJA')}>🟥 Tarjeta Roja</button>
                    </div>
                  </div>
                  <div>
                    <h3>Feed de Acciones</h3>
                    <div className="lista-jugadores-convocatoria" style={{minHeight: '200px'}}>
                      {accionesEnVivo.length > 0 ? (
                        accionesEnVivo.slice().reverse().map(accion => <div key={accion.id} className="item-jugador">{accion.minuto}' - {accion.tipo} de {accion.nombre_jugador}</div>)
                      ) : (
                        <p>Aún no se han registrado acciones.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {vista === 'evaluacion' && (
        <div>
          {yaEvaluado ? (
            <div className="card">
              <h2>Estadísticas Registradas del Partido</h2>
              <div className="marcador-final">
                <span>{evento.goles_favor}</span>
                <span>-</span>
                <span>{evento.goles_contra}</span>
              </div>
              <div className="tabla-responsive-wrapper">
                <table>
                  <thead><tr><th>Jugador</th><th>Téc.</th><th>Fís.</th><th>Táct.</th><th>Act.</th><th>Min.</th><th>Goles</th><th>Asist.</th><th>TA</th><th>TR</th><th>Faltas</th></tr></thead>
                  <tbody>{evaluacionesGuardadas.map(e => (<tr key={e.id_jugador}><td>{e.nombre} {e.apellidos}</td><td>{e.tecnica || 0}</td><td>{e.fisico || 0}</td><td>{e.tactica || 0}</td><td>{e.actitud || 0}</td><td>{e.minutos_jugados || 0}</td><td>{e.goles || 0}</td><td>{e.asistencias || 0}</td><td>{e.tarjetas_amarillas_partido || 0}</td><td>{e.tarjetas_rojas_partido || 0}</td><td>{e.faltas_cometidas_partido || 0}</td></tr>))}</tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <div className="card">
                <h2>Resultado del Partido</h2>
                <div className="form-resultado-partido">
                  <div className="input-group">
                    <label>{evento.condicion === 'Local' ? 'Tu Equipo (Local)' : 'Equipo Local'}</label>
                    <input type="number" name="goles_local" value={statsPartido.goles_local} onChange={handleStatsPartidoChange} disabled={currentUser?.rol !== 'administrador'} />
                  </div>
                  <span>-</span>
                  <div className="input-group">
                    <label>{evento.condicion === 'Visitante' ? 'Tu Equipo (Visitante)' : 'Equipo Visitante'}</label>
                    <input type="number" name="goles_visitante" value={statsPartido.goles_visitante} onChange={handleStatsPartidoChange} disabled={currentUser?.rol !== 'administrador'} />
                  </div>
                </div>
              </div>
              <div className="card">
                <h2>Parrilla de Evaluación y Estadísticas Individuales</h2>
                <div className="tabla-responsive-wrapper">
                  <table>
                    <thead><tr><th>Jugador</th><th>Téc.</th><th>Fís.</th><th>Táct.</th><th>Act.</th><th>Min.</th><th>Goles</th><th>Asist.</th><th>TA</th><th>TR</th><th>Faltas</th></tr></thead>
                    <tbody>
                      {convocados.map(jugador => (
                        <tr key={jugador.id}>
                          <td>{jugador.nombre} {jugador.apellidos}</td>
                          {['tecnica', 'fisico', 'tactica', 'actitud'].map(c => (<td key={c}><input type="number" min="0" max="10" value={evaluaciones[jugador.id]?.[c] || ''} onChange={e => handleEvalChange(jugador.id, c, e.target.value)} disabled={currentUser?.rol !== 'administrador'} /></td>))}
                          {['minutos_jugados', 'goles', 'asistencias', 'tarjetas_amarillas_partido', 'tarjetas_rojas_partido', 'faltas_cometidas_partido'].map(c => (<td key={c}><input type="number" min="0" value={evaluaciones[jugador.id]?.[c] || ''} onChange={e => handleEvalChange(jugador.id, c, e.target.value)} disabled={currentUser?.rol !== 'administrador'} /></td>))}

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {currentUser?.rol === 'administrador' && <button onClick={guardarEvaluacionesYStats} className="btn-full-width" style={{marginTop: '20px'}}>Guardar Evaluaciones y Estadísticas</button>}
              </div>
            </div>
          )}
        </div>
      )}

      {currentUser?.rol === 'administrador' && (
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button onClick={eliminarEvento} className="btn-danger-outline">Eliminar este evento</button>
        </div>
      )}
    </div>
  );
}

export default DetalleEvento;
