// Ruta: src/pages/Eventos.jsx
// ¡¡ÚSALO SOLO DESPUÉS DE ACTUALIZAR TUS EVENTOS ANTIGUOS EN FIREBASE!!

import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, addDoc, onSnapshot, limit } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventoForm from '../components/EventoForm'; // Importamos el nuevo formulario modal
import './Eventos.css';

function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [proximoPartido, setProximoPartido] = useState(null);
  const [filtro, setFiltro] = useState('Todos');
  const [isEventoFormOpen, setIsEventoFormOpen] = useState(false); // Estado para el modal
  const { currentUser } = useAuth();

  // En src/pages/Eventos.jsx

  useEffect(() => {
    // Si no hay un usuario con teamId, no podemos hacer una consulta.
    // Devolvemos una función vacía para que React no se queje.
    
    if (!currentUser?.teamId) {
      // Si el usuario se desloguea, nos aseguramos de limpiar la lista de eventos.
      setEventos([]);
      return () => {};
    }

    // Si llegamos aquí, es porque currentUser y currentUser.teamId existen.
    console.log(`Realizando consulta para teamId: ${currentUser.teamId}`);

    const q = query(collection(db, 'eventos'), where("teamId", "==", currentUser.teamId), orderBy('fecha', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Añadimos un log para ver exactamente qué está llegando de Firebase.
      console.log("Datos recibidos de Firestore:", eventosData);
      
      setEventos(eventosData);
    }, (error) => {
      console.error("Error en onSnapshot: ", error);
    });

    // La función de limpieza que detiene la escucha cuando el componente se desmonta o el usuario cambia.
    return () => {
      console.log("Limpiando suscripción de onSnapshot.");
      unsubscribe();
    };
    
  }, [currentUser]); // La dependencia en currentUser es correcta.

  // Efecto para obtener solo el próximo partido
  useEffect(() => {
    if (!currentUser?.teamId) {
      setProximoPartido(null);
      return;
    }

    const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const qProximo = query(
      collection(db, 'eventos'),
      where("teamId", "==", currentUser.teamId),
      where("tipo", "==", "Partido"),
      where('fecha', '>=', hoy),
      orderBy('fecha', 'asc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(qProximo, (snapshot) => {
      setProximoPartido(snapshot.docs.length > 0 ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const crearEvento = async (nuevoEvento) => {
    if (!nuevoEvento.descripcion || !nuevoEvento.fecha || !currentUser) return;

    await addDoc(collection(db, 'eventos'), {
      ...nuevoEvento,
      teamId: currentUser.teamId, // Asegura que los nuevos eventos tengan teamId
      userId: currentUser.uid,
      valoracion_colectiva: 0,
      puntos_obtenidos: -1,
    });

    setIsEventoFormOpen(false); // Cierra el modal después de crear
  };

  // Memoizamos los cálculos para optimizar el rendimiento
  const { ultimosPartidos, eventosFiltrados } = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0];
    const partidosPasados = eventos
      .filter(e => e.tipo === 'Partido' && e.fecha < hoy)
      .slice(0, 3);

    const filtrados = eventos.filter(evento => {
      if (filtro === 'Todos') return true;
      return evento.tipo.toLowerCase() === filtro.toLowerCase();
    });

    return { ultimosPartidos: partidosPasados, eventosFiltrados: filtrados };
  }, [eventos, filtro]);

  return (
    <div>
      <div className="eventos-pagina-header">
        <div className="card card-proximo-partido">
          <h2>Próximo Partido</h2>
          {proximoPartido ? <CardProximoPartido evento={proximoPartido} /> : <p className="no-partidos-msg">No hay próximos partidos programados.</p>}
        </div>

        <div className="card card-ultimos-partidos">
          <h2>Últimos 3 Partidos</h2>
          {ultimosPartidos.length > 0 ? (
            <div className="ultimos-partidos-lista">
              {ultimosPartidos.map(partido => <CardEventoMini key={partido.id} evento={partido} />)}
            </div>
          ) : <p className="no-partidos-msg">No se han jugado partidos recientemente.</p>}
        </div>
      </div>

      <div className="eventos-header">
        <h2>Historial de Eventos</h2>
        <div className="filtros-eventos">
          {currentUser?.rol === 'administrador' && (
            <button onClick={() => setIsEventoFormOpen(true)} className="btn-crear-evento">+ Crear Evento</button>
          )}
          <button onClick={() => setFiltro('Todos')} className={filtro === 'Todos' ? 'active' : ''}>Todos</button>
          <button onClick={() => setFiltro('Partido')} className={filtro === 'Partido' ? 'active' : ''}>Partidos</button>
          <button onClick={() => setFiltro('Entrenamiento')} className={filtro === 'Entrenamiento' ? 'active' : ''}>Entrenamientos</button>
        </div>
      </div>

      <div className="eventos-grid">
        {eventosFiltrados.map(evento => <CardEvento key={evento.id} evento={evento} />)}
      </div>

      {/* El formulario modal se renderiza aquí */}
      <EventoForm
        isOpen={isEventoFormOpen}
        onClose={() => setIsEventoFormOpen(false)}
        onSave={crearEvento}
      />
    </div>
  );
}

// Componente para la tarjeta del próximo partido
function CardProximoPartido({ evento }) {
  return (
    <Link to={`/evento/${evento.id}`} className="card-evento-link">
      <div className="proximo-partido-info">
        <h3>vs {evento.descripcion}</h3>
        <p className="fecha">{new Date(evento.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p className="condicion">{evento.condicion}</p>
      </div>
      <div className="ver-detalles">
        <span>Ver Detalles →</span>
      </div>
    </Link>
  );
}

// Componente para la tarjeta de últimos partidos
function CardEventoMini({ evento }) {
  let resultadoColor = '#6b7280'; // Gris por defecto
  if (evento.puntos_obtenidos === 3) resultadoColor = '#16a34a'; // Verde
  else if (evento.puntos_obtenidos === 0) resultadoColor = '#ef4444'; // Rojo
  else if (evento.puntos_obtenidos === 1) resultadoColor = '#f59e0b'; // Ámbar

  return (
    <Link to={`/evento/${evento.id}`} className="card-evento-mini">
      <div className="resultado-indicador" style={{ backgroundColor: resultadoColor }}></div>
      <div className="info-mini">
        <span className="descripcion-mini">vs {evento.descripcion}</span>
        <span className="fecha-mini">{new Date(evento.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
      </div>
      <div className="resultado-mini">
        {typeof evento.goles_favor !== 'undefined'
          ? `${evento.goles_favor} - ${evento.goles_contra}`
          : '-'}
      </div>
    </Link>
  );
}

// El componente CardEvento no necesita cambios
function CardEvento({ evento }) {
    let resultadoParaMostrar = '';
    let resultadoColor = {};
    let resultadoVarColor = '#444'; // Color neutral por defecto para la variable CSS

    if (evento.tipo === 'Partido' && typeof evento.goles_favor !== 'undefined' && typeof evento.goles_contra !== 'undefined') {
        const golesFavor = evento.goles_favor;
        const golesContra = evento.goles_contra;
        resultadoParaMostrar = `${golesFavor} - ${golesContra}`;
        if (golesFavor > golesContra) { 
            resultadoColor = { color: '#1DB954' }; // Verde para victoria
            resultadoVarColor = '#1DB954';
        } else if (golesFavor < golesContra) { 
            resultadoColor = { color: '#FF4757' }; // Rojo para derrota
            resultadoVarColor = '#FF4757';
        } else { 
            resultadoColor = { color: '#f1c40f' }; // Amarillo para empate
            resultadoVarColor = '#f1c40f';
        }
    }
    return (
        <Link 
          to={`/evento/${evento.id}`} 
          className="card-evento" 
          style={{ '--resultado-color': resultadoVarColor }} // Asignamos la variable CSS
        >
            <div className="card-evento-header">
                <h4>{evento.tipo === 'Partido' ? `vs ${evento.descripcion}` : evento.descripcion}</h4>
                {resultadoParaMostrar && (<span style={{ fontWeight: 'bold', fontSize: '1.2em', ...resultadoColor }}>{resultadoParaMostrar}</span>)}
            </div>
            <p style={{ color: '#aaa', margin: '0.5rem 0 0' }}>{new Date(evento.fecha).toLocaleDateString()} {evento.tipo === 'Partido' ? `(${evento.condicion})` : ''}</p>
            {evento.valoracion_colectiva > 0 && (<div style={{ background: '#1a1d21', color: '#e0e0e0', padding: '5px 10px', borderRadius: '5px', textAlign: 'center', marginTop: '15px', fontSize: '0.9em' }}>Valoración Colectiva: <strong>{evento.valoracion_colectiva.toFixed(2)}</strong></div>)}
        </Link>
    );
}

export default Eventos;
