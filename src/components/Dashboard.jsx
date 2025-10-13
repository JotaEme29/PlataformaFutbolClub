// src/pages/Dashboard.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import GraficoMinutosJugados from '../pages/GraficoMinutosJugados';
import GraficoEvolucion from '../components/GraficoEvolucion';
import './Dashboard.css';

function Dashboard() {
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchJugadores = async () => {
      if (!currentUser?.teamId) {
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'jugadores'), where("teamId", "==", currentUser.teamId));
        const querySnapshot = await getDocs(q);
        const listaJugadores = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJugadores(listaJugadores);
      } catch (error) {
        console.error("Error al cargar los jugadores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJugadores();
  }, [currentUser]);

  if (loading) {
    return <div className="card">Cargando dashboard...</div>;
  }

  return (
    <div>
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="dashboard-grid-superior">
        <div className="card card-grafico">
          <GraficoMinutosJugados />
        </div>
        <div className="card card-grafico">
          <GraficoEvolucion jugadores={jugadores} />
        </div>
      </div>

    </div>
  );
}

export default Dashboard;