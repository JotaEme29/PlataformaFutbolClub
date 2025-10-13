// src/pages/DetalleEvento.jsx - VERSIÓN FINAL Y COMPLETA (1/2)

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, getDocs, collection, addDoc, updateDoc, deleteDoc, where, query, increment, writeBatch } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { registrarAccion, escucharAccionesEnVivo, eliminarAccion } from '../services/PartidoService.js';
import Cronometro from '../components/Cronometro';
import CampoDeJuego from '../components/CampoDeJuego';
import useInterval from '../hooks/useInterval';
import { ordenPosiciones } from '../../config/formaciones.js';
import './DetalleEvento.css'; // ¡NUEVA IMPORTACIÓN!

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

  // --- Estados para "En Vivo" ---
  const [sustitucionEnCurso, setSustitucionEnCurso] = useState(null); // Para el cambio por clics
  const [accionesEnVivo, setAccionesEnVivo] = useState([]);
  const [seleccionandoJugador, setSeleccionandoJugador] = useState(null);
  const [titulares, setTitulares] = useState([]);
  const [suplentes, setSuplentes] = useState([]);
  const [cronoEnPausa, setCronoEnPausa] = useState(true);
  const [fasePartido, setFasePartido] = useState('preparacion');
  const [tiempoPrimeraParte, setTiempoPrimeraParte] = useState(0);
  const [tiempoSegundaParte, setTiempoSegundaParte] = useState(0);
  const [tiempoEnCampo, setTiempoEnCampo] = useState({});
  const [posesion, setPosesion] = useState({ nuestra: 0, rival: 0 });
  const [quienTienePosesion, setQuienTienePosesion] = useState(null);
  const [formacion, setFormacion] = useState('4-3-3');

  // --- Estados para la Evaluación por Clics ---
  const [columnas, setColumnas] = useState({
    jugadores_pendientes: [],
    a_mejorar: [],
    correcto: [],
    buen_partido: [],
    destacado: [],
  });
  const [jugadorActivoId, setJugadorActivoId] = useState(null);

  const valoracionesPorCategoria = {
    destacado: { tecnica: 9, fisico: 9, tactica: 9, actitud: 9 },
    buen_partido: { tecnica: 8, fisico: 8, tactica: 8, actitud: 8 },
    correcto: { tecnica: 7, fisico: 7, tactica: 7, actitud: 7 },
    a_mejorar: { tecnica: 6, fisico: 6, tactica: 6, actitud: 6 },
  };

  // --- Carga de Datos Inicial ---
  useEffect(() => {
    const obtenerDatos = async () => {
      if (!currentUser?.teamId) { setLoading(false); setError("No se ha podido verificar tu equipo."); return; }
      const eventoDocRef = doc(db, 'eventos', eventoId);
      const eventoDoc = await getDoc(eventoDocRef);
      if (!eventoDoc.exists() || eventoDoc.data().teamId !== currentUser.teamId) { setError("Evento no encontrado."); setLoading(false); return; }
      
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

      // ...
const convocadosIds = eventoData.convocados || [];
const jugadoresConvocados = listaPlantilla.filter(j => convocadosIds.includes(j.id));
setConvocados(jugadoresConvocados);
setNoConvocados(listaPlantilla.filter(j => !convocadosIds.includes(j.id)));
      
      // --- LÓGICA DE INICIALIZACIÓN RESTAURADA Y CORREGIDA ---
      const titularesGuardadosIds = eventoData.alineacion_titular || [];
      if (titularesGuardadosIds.length > 0) {
        // Si ya hay una alineación guardada, la cargamos.
        const jugadoresTitulares = listaPlantilla.filter(j => titularesGuardadosIds.includes(j.id));
        const jugadoresSuplentes = jugadoresConvocados.filter(j => !titularesGuardadosIds.includes(j.id));
        setTitulares(jugadoresTitulares);
        setSuplentes(jugadoresSuplentes);
      } else {
        // Si es la primera vez que se configura la alineación, todos los convocados están en el banquillo.
        setTitulares([]);
        setSuplentes(jugadoresConvocados);
      }
      // --- FIN DE LA CORRECCIÓN ---

setLoading(false);
// ...

    };
    obtenerDatos();
  }, [eventoId, currentUser]);

  // --- Listeners y Efectos Secundarios (Memoizados para optimización) ---
  useEffect(() => {
    if (vista !== 'en_vivo' || !eventoId) return;
    const unsubscribe = escucharAccionesEnVivo(eventoId, (nuevasAcciones) => setAccionesEnVivo(nuevasAcciones));
    return () => unsubscribe();
  }, [vista, eventoId]);

  const memoizedTitulares = useMemo(() => titulares, [titulares]);
  useInterval(() => {
    setTiempoEnCampo(prevTiempos => {
      const nuevosTiempos = { ...prevTiempos };
      memoizedTitulares.forEach(jugador => {
        nuevosTiempos[jugador.id] = (nuevosTiempos[jugador.id] || 0) + 1;
      });
      return nuevosTiempos;
    });
  }, cronoEnPausa ? null : 1000);

  useEffect(() => {
    if (cronoEnPausa) {
      setQuienTienePosesion(null);
      return;
    }
    const interval = setInterval(() => {
      if (quienTienePosesion) {
        setPosesion(prev => ({
          ...prev,
          [quienTienePosesion]: prev[quienTienePosesion] + 1
        }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [cronoEnPausa, quienTienePosesion]);

  // --- Efecto para Inicializar la Evaluación por Clics ---
  useEffect(() => {
    // Si la vista cambia a 'evaluacion', no se ha evaluado aún, y las columnas están vacías,
    // poblamos la columna de 'pendientes' con los jugadores convocados.
    if (
      vista === 'evaluacion' &&
      !yaEvaluado &&
      columnas.jugadores_pendientes.length === 0 &&
      columnas.a_mejorar.length === 0 &&
      columnas.correcto.length === 0 &&
      columnas.buen_partido.length === 0 &&
      columnas.destacado.length === 0
    ) {
      setColumnas(prev => ({ ...prev, jugadores_pendientes: convocados }));
    }
  }, [vista, yaEvaluado, convocados, columnas]);

  // --- Funciones de Gestión ---
  const moverJugador = (jugador, aConvocados) => {
    if (yaEvaluado) { alert("No se puede modificar la convocatoria de un evento ya evaluado."); return; }
    if (aConvocados) {
      setNoConvocados(noConvocados.filter(j => j.id !== jugador.id));
      setConvocados([...convocados, jugador]);
    } else {
      setConvocados(convocados.filter(j => j.id !== jugador.id));
      setNoConvocados([...noConvocados, jugador]);
    }
  };

  const guardarConvocatoria = async () => {
    try {
      const convocadosIds = convocados.map(j => j.id);
      const eventoDocRef = doc(db, 'eventos', eventoId);
      
      await updateDoc(eventoDocRef, { convocados: convocadosIds });

      const batch = writeBatch(db);
      plantilla.forEach(jugador => {
        const jugadorDocRef = doc(db, 'jugadores', jugador.id);
        const convocadoEstaVez = convocadosIds.includes(jugador.id);
        const yaEstabaConvocado = (evento.convocados || []).includes(jugador.id);

        if (convocadoEstaVez && !yaEstabaConvocado) {
          batch.update(jugadorDocRef, { total_convocatorias: increment(1) });
        } else if (!convocadoEstaVez && yaEstabaConvocado) {
          batch.update(jugadorDocRef, { total_convocatorias: increment(-1) });
        }
      });
      
      await batch.commit();
      
      alert("Convocatoria guardada con éxito.");
      window.location.reload();

    } catch (e) {
      console.error("Error al guardar la convocatoria: ", e);
      alert("Hubo un error al guardar la convocatoria. Por favor, inténtalo de nuevo.");
    }
  };

  // --- LÓGICA DE ALINEACIÓN CORREGIDA ---
  const gestionarAlineacion = (jugador, esParaEntrar) => {
    const ordenDeFormacion = ordenPosiciones[formacion] || ordenPosiciones['4-3-3'];

    if (esParaEntrar) {
      // Mover de suplentes a titulares
      if (titulares.length >= 11) {
        alert("El campo está lleno (11 jugadores). Debes sacar a un titular antes de meter a un suplente.");
        return;
      }

      // Encontrar la primera posición táctica libre
      const posicionAsignada = ordenDeFormacion.find(pos => !titulares.some(t => t.posicionCampo === pos));

      if (!posicionAsignada) {
        // Esto no debería pasar si hay menos de 11 jugadores, pero es una salvaguarda.
        alert("No se encontró una posición libre en la formación. Intenta cambiar de formación.");
        return;
      }

      const jugadorConPosicion = { ...jugador, posicionCampo: posicionAsignada };

      setSuplentes(prev => prev.filter(j => j.id !== jugador.id));
      setTitulares(prev => [...prev, jugadorConPosicion]);

    } else {
      // Mover de titulares a suplentes
      // Creamos una copia del jugador sin la posición para asegurar que el estado se actualiza correctamente.
      const jugadorSinPosicion = { ...jugador };
      delete jugadorSinPosicion.posicionCampo;

      setTitulares(prev => prev.filter(j => j.id !== jugador.id));
      setSuplentes(prev => [...prev, jugadorSinPosicion].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    }
  };

  const iniciarSeleccionJugador = (tipoAccion) => {
    setSeleccionandoJugador({ tipo: tipoAccion });
  };

  const finalizarSeleccionJugador = async (jugador) => {
    if (!seleccionandoJugador) return;
    try {
      // --- LÓGICA DE MINUTOS CORREGIDA ---
      const minutosPrimerTiempo = Math.ceil(tiempoPrimeraParte / 60);
      const tiempoActual = fasePartido === 'primer_tiempo' ? tiempoPrimeraParte : tiempoSegundaParte + tiempoPrimeraParte;
      const minutoDeAccion = Math.ceil(tiempoActual / 60); // Minuto absoluto del partido
      const accion = {
        tipo: seleccionandoJugador.tipo,
        jugador_principal_id: jugador.id,
        nombre_jugador: `${jugador.nombre} ${jugador.apellidos}`,
        minuto: minutoDeAccion,
        fase: fasePartido,
      };
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
      await registrarAccion(eventoId, accion);
    } catch (error) {
      console.error("Error al registrar la acción:", error);
    } finally {
      setSeleccionandoJugador(null);
    }
  };

  const handleEliminarAccion = async (accionId) => {
    if (window.confirm("¿Seguro que quieres eliminar esta acción?")) {
      try {
        await eliminarAccion(eventoId, accionId);
      } catch (error) {
        console.error("Error al eliminar la acción:", error);
      }
    }
  };

  const sincronizarAccionesConEvaluacion = async () => {
    const q = query(collection(db, 'eventos', eventoId, 'acciones_partido'));
    const accionesSnapshot = await getDocs(q);
    const accionesDelPartido = accionesSnapshot.docs.map(doc => doc.data());
    const totalesPorJugador = {};
    convocados.forEach(jugador => {
      totalesPorJugador[jugador.id] = { goles: 0, asistencias: 0, tarjetas_amarillas_partido: 0, tarjetas_rojas_partido: 0, minutos_jugados: 0 };
    });
    for (const accion of accionesDelPartido) {
      const jugadorId = accion.jugador_principal_id;
      if (!totalesPorJugador[jugadorId]) continue;
      switch (accion.tipo) {
        case 'GOL': totalesPorJugador[jugadorId].goles += 1; break;
        case 'ASISTENCIA': totalesPorJugador[jugadorId].asistencias += 1; break;
        case 'AMARILLA': totalesPorJugador[jugadorId].tarjetas_amarillas_partido += 1; break;
        case 'ROJA': totalesPorJugador[jugadorId].tarjetas_rojas_partido += 1; break;
        default: break;
      }
    }
    for (const jugadorId in tiempoEnCampo) {
      if (totalesPorJugador[jugadorId]) {
        totalesPorJugador[jugadorId].minutos_jugados = Math.round(tiempoEnCampo[jugadorId] / 60);
      }
    }
    setEvaluaciones(evaluacionesPrevias => {
      const nuevasEvaluaciones = { ...evaluacionesPrevias };
      for (const jugadorId in totalesPorJugador) {
        nuevasEvaluaciones[jugadorId] = { ...evaluacionesPrevias[jugadorId], ...totalesPorJugador[jugadorId] };
      }
      return nuevasEvaluaciones;
    });
  };

  // --- Funciones de Evaluación por Clics ---
  const moverJugadorAColumna = (columnaDestinoId) => {
    if (!jugadorActivoId) {
      alert("Por favor, selecciona primero un jugador haciendo clic en su nombre.");
      return;
    }
    let jugadorAMover = null;
    let columnaOrigenId = null;
    for (const colId in columnas) {
      const jugadorEncontrado = columnas[colId].find(j => j.id === jugadorActivoId);
      if (jugadorEncontrado) {
        jugadorAMover = jugadorEncontrado;
        columnaOrigenId = colId;
        break;
      }
    }
    if (!jugadorAMover || columnaOrigenId === columnaDestinoId) return;

    setColumnas(prevColumnas => {
      const nuevasColumnas = { ...prevColumnas };
      nuevasColumnas[columnaOrigenId] = nuevasColumnas[columnaOrigenId].filter(j => j.id !== jugadorActivoId);
      nuevasColumnas[columnaDestinoId] = [...nuevasColumnas[columnaDestinoId], jugadorAMover];
      return nuevasColumnas;
    });

    if (valoracionesPorCategoria[columnaDestinoId]) {
      const nuevasNotas = valoracionesPorCategoria[columnaDestinoId];
      setEvaluaciones(prevEvals => ({
        ...prevEvals,
        [jugadorActivoId]: { ...(prevEvals[jugadorActivoId] || {}), ...nuevasNotas },
      }));
    }
  };

  const handleEvalChange = (jugadorId, campo, valor) => {
    setEvaluaciones(prev => ({
      ...prev,
      [jugadorId]: { ...prev[jugadorId], [campo]: Number(valor) },
    }));
  };

  const guardarEvaluacionesYStats = async () => {
    if (Object.keys(evaluaciones).length === 0) { alert("No has introducido ninguna evaluación."); return; }
    const batch = writeBatch(db);
    for (const jugadorId in evaluaciones) {
      const datosEvaluacion = evaluaciones[jugadorId];
      if (Object.keys(datosEvaluacion).length === 0) continue;
      const evalDocRef = doc(collection(db, 'evaluaciones'));
      batch.set(evalDocRef, { id_jugador: jugadorId, id_evento: eventoId, fecha_evento: evento.fecha, teamId: currentUser.teamId, ...datosEvaluacion });
      const jugadorDocRef = doc(db, 'jugadores', jugadorId);
      const jugadorDoc = await getDoc(jugadorDocRef);
      if (jugadorDoc.exists()) {
        const datosJugador = jugadorDoc.data();
        const updates = {
          total_goles: increment(datosEvaluacion.goles || 0),
          total_asistencias: increment(datosEvaluacion.asistencias || 0),
          total_minutos_jugados: increment(datosEvaluacion.minutos_jugados || 0),
          total_tarjetas_amarillas: increment(datosEvaluacion.tarjetas_amarillas_partido || 0),
          total_tarjetas_rojas: increment(datosEvaluacion.tarjetas_rojas_partido || 0),
        };
        const eventosEvaluadosPrevios = datosJugador.eventos_evaluados || 0;
        const nuevoTotalEventosEvaluados = eventosEvaluadosPrevios + 1;
        updates.promedio_tecnica = ((datosJugador.promedio_tecnica || 0) * eventosEvaluadosPrevios + (datosEvaluacion.tecnica || 0)) / nuevoTotalEventosEvaluados;
        updates.promedio_fisico = ((datosJugador.promedio_fisico || 0) * eventosEvaluadosPrevios + (datosEvaluacion.fisico || 0)) / nuevoTotalEventosEvaluados;
        updates.promedio_tactica = ((datosJugador.promedio_tactica || 0) * eventosEvaluadosPrevios + (datosEvaluacion.tactica || 0)) / nuevoTotalEventosEvaluados;
        updates.promedio_actitud = ((datosJugador.promedio_actitud || 0) * eventosEvaluadosPrevios + (datosEvaluacion.actitud || 0)) / nuevoTotalEventosEvaluados;
        updates.eventos_evaluados = nuevoTotalEventosEvaluados;
        updates.valoracion_general_promedio = (updates.promedio_tecnica + updates.promedio_fisico + updates.promedio_tactica + updates.promedio_actitud) / 4;
        batch.update(jugadorDocRef, updates);
      }
    }
    
    let sumaDePromediosColectivos = 0;
    let jugadoresEvaluadosCount = 0;
    Object.values(evaluaciones).forEach(datosEvaluacion => {
        const promedioIndividualColectivo = ((datosEvaluacion.tecnica || 0) + (datosEvaluacion.fisico || 0) + (datosEvaluacion.tactica || 0) + (datosEvaluacion.actitud || 0)) / 4;
        if (promedioIndividualColectivo > 0) {
          sumaDePromediosColectivos += promedioIndividualColectivo;
          jugadoresEvaluadosCount++;
        }
    });
    const valoracionColectivaFinal = jugadoresEvaluadosCount > 0 ? sumaDePromediosColectivos / jugadoresEvaluadosCount : 0;
    let puntos = 0;
    let goles_favor_reales, goles_contra_reales;
    if (evento.condicion === 'Local') {
      goles_favor_reales = statsPartido.goles_local;
      goles_contra_reales = statsPartido.goles_visitante;
    } else {
      goles_favor_reales = statsPartido.goles_visitante;
      goles_contra_reales = statsPartido.goles_local;
    }
    if (goles_favor_reales > goles_contra_reales) {
      puntos = 3;
    } else if (goles_favor_reales === goles_contra_reales) {
      puntos = 1;
    }

    const eventoDocRef = doc(db, 'eventos', eventoId);
    batch.update(eventoDocRef, {
      goles_local: statsPartido.goles_local,
      goles_visitante: statsPartido.goles_visitante,
      goles_favor: goles_favor_reales,
      goles_contra: goles_contra_reales,
      puntos_obtenidos: puntos,
      valoracion_colectiva: valoracionColectivaFinal,
      posesion_nuestra: posesion.nuestra,
      posesion_rival: posesion.rival,
    });

    await batch.commit();
    alert("¡Evaluaciones y estadísticas guardadas!");
    window.location.reload();
  };

    const eliminarEvento = async () => {
    if (!window.confirm("¿Seguro que quieres eliminar este evento y todos sus datos asociados? Esta acción es irreversible.")) return;

    console.log("Iniciando eliminación del evento:", eventoId);
    setLoading(true); // Muestra un indicador de carga

    try {
      // 1. Eliminar las evaluaciones asociadas
      console.log("Buscando evaluaciones para eliminar...");
      const qEvaluaciones = query(collection(db, 'evaluaciones'), where('id_evento', '==', eventoId));
      const evaluacionesSnapshot = await getDocs(qEvaluaciones);
      if (!evaluacionesSnapshot.empty) {
        console.log(`Encontradas ${evaluacionesSnapshot.size} evaluaciones. Eliminando...`);
        const deletePromises = evaluacionesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        console.log("Evaluaciones eliminadas.");
      } else {
        console.log("No se encontraron evaluaciones para este evento.");
      }

      // 2. Eliminar las acciones del partido (subcolección)
      console.log("Buscando acciones del partido para eliminar...");
      const qAcciones = query(collection(db, 'eventos', eventoId, 'acciones_partido'));
      const accionesSnapshot = await getDocs(qAcciones);
      if (!accionesSnapshot.empty) {
        console.log(`Encontradas ${accionesSnapshot.size} acciones. Eliminando...`);
        const deletePromises = accionesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        console.log("Acciones del partido eliminadas.");
      } else {
        console.log("No se encontraron acciones para este evento.");
      }

      // 3. Finalmente, eliminar el documento del evento principal
      console.log("Eliminando el documento principal del evento...");
      const eventoDocRef = doc(db, 'eventos', eventoId);
      await deleteDoc(eventoDocRef);
      console.log("Evento principal eliminado.");

      alert("El evento ha sido eliminado con éxito.");
      navigate('/eventos');

    } catch (error) {
      console.error("ERROR DETALLADO AL ELIMINAR:", error);
      alert(`Ocurrió un error al intentar eliminar el evento. Revisa la consola para más detalles. (Error: ${error.code})`);
      setLoading(false);
    }
  };


  // --- Renderizado del Componente ---
  if (loading) return <div className="card">Cargando evento...</div>;
  if (error) return <div className="card auth-error">{error}</div>;
  return (
    <div>
      <div className="detalle-evento-header">
        <h1>{evento.tipo}: {evento.descripcion}</h1>
        <p>{new Date(evento.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} ({evento.condicion})</p>
      </div>

      <div className="botones-vista-evento">
        <button onClick={() => setVista('convocatoria')} className={vista === 'convocatoria' ? 'active' : ''}>
          1. Convocatoria
        </button>
        
        {evento?.convocados?.length > 0 && !yaEvaluado && (<button onClick={() => setVista('en_vivo')} className={vista === 'en_vivo' ? 'active' : ''}>
            2. Seguimiento en Vivo
          </button>
        )}
        
        <button onClick={() => {
          if (!yaEvaluado) {
            sincronizarAccionesConEvaluacion();
          }
          setVista('evaluacion');
        }} className={vista === 'evaluacion' ? 'active' : ''}>
          {evento?.convocados?.length > 0 && !yaEvaluado ? '3. Evaluación' : '2. Evaluación'}
        </button>
      </div>

      {vista === 'convocatoria' && (
        <div className="card">
          <h2>Gestión de Convocatoria</h2>
          <div className="convocatoria-grid">
            <div><h3>Plantilla ({noConvocados.length})</h3><div className="lista-jugadores-convocatoria">{noConvocados.map(j => <div key={j.id} onClick={() => currentUser?.rol === 'administrador' && moverJugador(j, true)} className={`item-jugador ${currentUser?.rol === 'administrador' ? 'clickable' : ''}`}>{j.nombre} {j.apellidos}</div>)}</div></div>
            <div><h3>Convocados ({convocados.length})</h3><div className="lista-jugadores-convocatoria">{convocados.map(j => <div key={j.id} onClick={() => currentUser?.rol === 'administrador' && moverJugador(j, false)} className={`item-jugador convocado ${currentUser?.rol === 'administrador' ? 'clickable' : ''}`}>{j.nombre} {j.apellidos}</div>)}</div></div>
          </div>
          {currentUser?.rol === 'administrador' && !yaEvaluado && <button onClick={guardarConvocatoria} className="btn-full-width">Guardar Convocatoria</button>}
        </div>
      )}

      
      {vista === 'en_vivo' && (
        <div className="card">
          <h2>Seguimiento en Vivo</h2>
          
          {/* --- Cronómetro y Controles de Fase --- */}
          <div className="cronometro-container">
            <Cronometro 
              enPausa={cronoEnPausa} 
              onTiempoActualizado={(segundos) => fasePartido === 'primer_tiempo' ? setTiempoPrimeraParte(segundos) : setTiempoSegundaParte(segundos)} 
              fase={fasePartido} 
            />
            <div className="cronometro-controles">
              {fasePartido === 'preparacion' && (
                <button onClick={() => { setFasePartido('primer_tiempo'); setCronoEnPausa(false); }} disabled={titulares.length < 11}>
                  ▶ Iniciar 1er Tiempo
                </button>
              )}
              {fasePartido === 'primer_tiempo' && (
                <button onClick={() => { setFasePartido('descanso'); setCronoEnPausa(true); }}>
                  ❚❚ Finalizar 1er Tiempo
                </button>
              )}
              {fasePartido === 'descanso' && (
                <button onClick={() => { setFasePartido('segundo_tiempo'); setCronoEnPausa(false); }}>
                  ▶ Iniciar 2do Tiempo
                </button>
              )}
              {fasePartido === 'segundo_tiempo' && (
                <button onClick={() => { setFasePartido('finalizado'); setCronoEnPausa(true); sincronizarAccionesConEvaluacion(); setVista('evaluacion'); }}>
                  ■ Finalizar y Evaluar
                </button>
              )}
            </div>
          </div>
          
          {/* --- Contenido Principal de la Vista en Vivo --- */}
          {fasePartido === 'preparacion' ? (
            // --- VISTA DE PREPARACIÓN (Definir Alineación) ---
            <div>
              <h3>Definir Alineación y Táctica</h3>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="formacion-select" style={{ marginRight: '10px' }}>Formación:</label>
                <select id="formacion-select" value={formacion} onChange={e => setFormacion(e.target.value)}>
                  <option value="4-3-3">4-3-3</option>
                  <option value="4-4-2">4-4-2</option>
                  <option value="4-2-3-1">4-2-3-1</option>
                  <option value="3-5-2">3-5-2</option>
                  <option value="3-4-3">3-4-3</option>
                </select>
              </div>
              <div className="convocatoria-grid">
                <div>
                  <h3>Suplentes ({suplentes.length})</h3>
                  <div className="lista-jugadores-convocatoria">
                    {suplentes.map(j => (<div key={j.id} onClick={() => gestionarAlineacion(j, true)} className="item-jugador clickable">{j.nombre} {j.apellidos}</div>))}
                  </div>
                </div>
                <div>
                  <h3>Titulares ({titulares.length})</h3>
                  <div className="lista-jugadores-convocatoria">
                    {titulares.map(j => (<div key={j.id} onClick={() => gestionarAlineacion(j, false)} className="item-jugador titular clickable">{j.nombre} {j.apellidos}</div>))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // --- VISTA DE PARTIDO EN CURSO ---
            <div className="en-vivo-container">
              {/* --- Columna Izquierda (Paneles de Control) --- */}
              <div className="en-vivo-columna-izquierda">
                {seleccionandoJugador ? (
                  <div className="card seleccion-jugador-card">
                    <h3>Selecciona el jugador para: <strong>{seleccionandoJugador.tipo}</strong></h3>
                    <div className="lista-jugadores-convocatoria">
                      {titulares.map(jugador => (
                        <div key={jugador.id} className="item-jugador clickable" onClick={() => finalizarSeleccionJugador(jugador)}>
                          {jugador.nombre} {jugador.apellidos}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setSeleccionandoJugador(null)} className="btn-secondary" style={{marginTop: '10px'}}>Cancelar</button>
                  </div>
                ) : (
                  <>
                    <div className="card posesion-card">
                      <h3>Posesión</h3>
                      <div className="posesion-display">
                        {Math.round((posesion.nuestra / (posesion.nuestra + posesion.rival || 1)) * 100)}% - {Math.round((posesion.rival / (posesion.nuestra + posesion.rival || 1)) * 100)}%
                      </div>
                      <div className="posesion-controles">
                        <button onClick={() => setQuienTienePosesion('nuestra')} style={{background: quienTienePosesion === 'nuestra' ? '#2563eb' : '#e2e8f0', color: quienTienePosesion === 'nuestra' ? 'white' : '#4a5568'}} disabled={cronoEnPausa}>Nuestra</button>
                        <button onClick={() => setQuienTienePosesion('rival')} style={{background: quienTienePosesion === 'rival' ? '#ef4444' : '#e2e8f0', color: quienTienePosesion === 'rival' ? 'white' : '#4a5568'}} disabled={cronoEnPausa}>Rival</button>
                      </div>
                    </div>
                    <div className="card acciones-card">
                      <h3>Registrar Acción</h3>
                      <div className="acciones-botones">
                        <button onClick={() => iniciarSeleccionJugador('GOL')} disabled={cronoEnPausa}>⚽ Registrar Gol</button>
                        <button onClick={() => iniciarSeleccionJugador('ASISTENCIA')} disabled={cronoEnPausa}>🤝 Registrar Asistencia</button>
                        <button onClick={() => iniciarSeleccionJugador('AMARILLA')} disabled={cronoEnPausa}>🟨 Tarjeta Amarilla</button>
                        <button onClick={() => iniciarSeleccionJugador('ROJA')} disabled={cronoEnPausa}>🟥 Tarjeta Roja</button>
                      </div>
                    </div>
                  </>
                )}
                <div className="card feed-acciones-card">
                  <h3>Feed de Acciones</h3>
                  <div className="feed-acciones-lista">
                    {accionesEnVivo.length > 0 ? (
                      accionesEnVivo.slice().reverse().map(accion => (
                        <div key={accion.id} className="feed-item">
                          <span>{accion.minuto}' - {accion.tipo} de {accion.nombre_jugador}</span>
                          <button onClick={() => handleEliminarAccion(accion.id)}>X</button>
                        </div>
                      ))
                    ) : (<p>Aún no se han registrado acciones.</p>)}
                  </div>
                </div>
              </div>

              {/* --- Columna Derecha (Campo y Suplentes) --- */}
              <div className="en-vivo-columna-derecha">
                <div className="campo-y-suplentes-container">
                  <CampoDeJuego 
                    titulares={titulares} 
                    onJugadorClick={(jugador) => gestionarAlineacion(jugador, false)} // Clic en titular lo saca
                    formacion={formacion}
                    tiempoEnCampo={tiempoEnCampo}
                  />
                  <div className="banquillo-container">
                    <h3>Banquillo</h3>
                    <div className="banquillo-jugadores">
                      {suplentes.map(j => (<div key={j.id} className="jugador-suplente clickable" onClick={() => gestionarAlineacion(j, true)}>
                          <span className="dorsal">{j.dorsal || '-'}</span>
                          <span className="nombre">{j.apodo || j.nombre}</span>
                        </div>))}
                    </div>
                  </div>
                </div>
              </div>
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
                <span>{evento.goles_local ?? statsPartido.goles_local}</span> - <span>{evento.goles_visitante ?? statsPartido.goles_visitante}</span>
              </div>
              <div className="tabla-responsive-wrapper">
                <table className="tabla-evaluaciones">
                  <thead>
                    <tr>
                      <th>Jugador</th><th>Téc.</th><th>Fís.</th><th>Táct.</th><th>Act.</th>
                      <th>Min.</th><th>Goles</th><th>Asist.</th><th>TA</th><th>TR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluacionesGuardadas.map(e => (
                      <tr key={e.id_jugador}>
                        <td>{e.nombre} {e.apellidos}</td>
                        <td>{e.tecnica || 0}</td>
                        <td>{e.fisico || 0}</td>
                        <td>{e.tactica || 0}</td>
                        <td>{e.actitud || 0}</td>
                        <td>{e.minutos_jugados || 0}</td>
                        <td>{e.goles || 0}</td>
                        <td>{e.asistencias || 0}</td>
                        <td>{e.tarjetas_amarillas_partido || 0}</td>
                        <td>{e.tarjetas_rojas_partido || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card">
                <h2>Resultado del Partido</h2>
                <div className="form-resultado-partido">
                  <div className="input-group">
                    <label>{evento.condicion === 'Local' ? 'Tu Equipo (Local)' : 'Equipo Local'}</label>
                    <input type="number" min="0" name="goles_local" value={statsPartido.goles_local} onChange={(e) => setStatsPartido(prev => ({...prev, goles_local: Number(e.target.value)}))} disabled={currentUser?.rol !== 'administrador'} />
                  </div>
                  <span>-</span>
                  <div className="input-group">
                    <label>{evento.condicion === 'Visitante' ? 'Tu Equipo (Visitante)' : 'Equipo Visitante'}</label>
                    <input type="number" min="0" name="goles_visitante" value={statsPartido.goles_visitante} onChange={(e) => setStatsPartido(prev => ({...prev, goles_visitante: Number(e.target.value)}))} disabled={currentUser?.rol !== 'administrador'} />
                  </div>
                </div>
              </div>
              
              <div className="card">
                <h2>Evaluación Rápida de Jugadores</h2>
                <p>1. Haz clic en un jugador para seleccionarlo. 2. Haz clic en el título de una columna para moverlo.</p>
                
                <div className="evaluacion-por-clics-container">
                  {Object.keys(columnas).map((colId) => (
                    <ClickEvaluacionColumna
                      key={colId}
                      id={colId}
                      titulo={colId.replace(/_/g, ' ').toUpperCase()}
                      cantidad={columnas[colId].length}
                      onHeaderClick={() => moverJugadorAColumna(colId)}
                    >
                      {columnas[colId].map(jugador => (
                        <ClickEvaluacionJugador
                          key={jugador.id}
                          jugador={jugador}
                          isActive={jugadorActivoId === jugador.id}
                          onSelect={() => setJugadorActivoId(jugador.id)}
                        />
                      ))}
                    </ClickEvaluacionColumna>
                  ))}
                </div>

                {currentUser?.rol === 'administrador' && (
                  <button onClick={guardarEvaluacionesYStats} className="btn-full-width">
                    Guardar Evaluaciones y Estadísticas
                  </button>
                )}
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

// --- Componentes Internos para Evaluación Rápida ---

function ClickEvaluacionColumna({ id, titulo, cantidad, onHeaderClick, children }) {
  return (
    <div className="evaluacion-columna">
      <div className="evaluacion-columna-header" onClick={onHeaderClick}>
        <h3>{titulo}</h3>
        <span className="cantidad">{cantidad}</span>
      </div>
      <div className="evaluacion-columna-body">
        {children}
      </div>
    </div>
  );
}

function ClickEvaluacionJugador({ jugador, isActive, onSelect }) {
  return (
    <div
      className={`jugador-evaluacion-capsula ${isActive ? 'active' : ''}`}
      onClick={onSelect}
    >
      <span className="dorsal">{jugador.dorsal || '-'}</span>
      <span className="nombre">{jugador.apodo || jugador.nombre}</span>
    </div>
  );
}

export default DetalleEvento;
