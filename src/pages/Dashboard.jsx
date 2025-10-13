// src/pages/Dashboard.jsx - VERSIÓN RESTAURADA Y COMPLETA

import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import GraficoEvolucion from '../components/GraficoEvolucion';
import '../components/Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

function RankingChart({ field, title, color }) {
  const { currentUser } = useAuth();
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.teamId) { setLoading(false); return; }
    const processRanking = async () => {
      try {
        // 1. Obtenemos TODOS los jugadores del equipo
        const q = query(collection(db, 'jugadores'), where('teamId', '==', currentUser.teamId));
        const querySnapshot = await getDocs(q);
        const todosLosJugadores = querySnapshot.docs.map(doc => doc.data());

        // 2. Ordenamos y filtramos en el cliente (en la aplicación)
        const jugadoresOrdenados = todosLosJugadores
          .sort((a, b) => (b[field] || 0) - (a[field] || 0))
          .slice(0, 10); // Tomamos los primeros 10

        if (jugadoresOrdenados.length > 0) {
          setChartData({
            labels: jugadoresOrdenados.map(j => j.apodo || j.nombre),
            datasets: [{
              label: title,
              data: jugadoresOrdenados.map(j => j[field] || 0),
              backgroundColor: color,
              borderRadius: 4,
            }]
          });
        } else {
          setChartData({ labels: [], datasets: [] });
        }
      } catch (error) {
        console.error(`Error al procesar el ranking para ${title}:`, error);
        setChartData({ labels: [], datasets: [] });
      } finally {
        setLoading(false);
      }
    };
    processRanking();
  }, [currentUser, field, title, color]);

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: true, text: title, font: { size: 16 }, color: '#1a2530' } },
    scales: { x: { beginAtZero: true, ticks: { stepSize: 1, color: '#4a5568' } }, y: { ticks: { color: '#4a5568' } } },
  };

  if (loading) return <p>Cargando ranking...</p>;
  if (chartData.labels.length === 0) return <p>No hay datos suficientes para mostrar este gráfico.</p>;

  return <Bar data={chartData} options={options} />;
}

function EvolucionColectivaChart() {
  const { currentUser } = useAuth();
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.teamId) { setLoading(false); return; }

    const fetchEvolucion = async () => {
      try {
        const q = query(
          collection(db, 'eventos'),
          where('teamId', '==', currentUser.teamId),
          where('valoracion_colectiva', '>', 0), // Mantenemos el filtro para solo coger partidos evaluados
          orderBy('fecha', 'asc')
        );
        const querySnapshot = await getDocs(q);
        const eventos = querySnapshot.docs.map(doc => doc.data());

        if (eventos.length > 1) {
          setChartData({
            labels: eventos.map(e => new Date(e.fecha + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })),
            datasets: [{
              label: 'Valoración Colectiva',
              data: eventos.map(e => e.valoracion_colectiva.toFixed(2)),
              fill: true,
              backgroundColor: 'rgba(129, 140, 248, 0.2)',
              borderColor: 'rgba(129, 140, 248, 1)',
              tension: 0.3,
            }]
          });
        }
      } catch (error) {
        console.error("Error al cargar la evolución colectiva. Es posible que falte un índice en Firestore.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvolucion();
  }, [currentUser]);

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: true, text: 'Evolución del Rendimiento Colectivo', font: { size: 16 }, color: '#1a2530' } },
    scales: { y: { min: 0, max: 10, ticks: { color: '#4a5568' } }, x: { ticks: { color: '#4a5568' } } },
  };

  if (loading) return <p>Cargando evolución del equipo...</p>;
  if (chartData.labels.length === 0) return <p>No hay suficientes datos para mostrar la evolución del equipo (se necesitan al menos 2 partidos evaluados).</p>;
  return <Line data={chartData} options={options} />;
}

function Dashboard() {
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.teamId) {
      const q = query(collection(db, 'jugadores'), where("teamId", "==", currentUser.teamId));
      getDocs(q).then(snapshot => {
        setJugadores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }).catch(err => {
        console.error("Error al cargar jugadores:", err);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (loading) {
    return <div className="card">Cargando dashboard...</div>;
  }

  return (
    <div>
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="dashboard-grid-superior">
        <div className="card card-grafico">
          <RankingChart
            field="total_goles"
            title="Top 5 Goleadores"
            color="rgba(37, 99, 235, 0.8)"
          />
        </div>
        <div className="card card-grafico">
          <RankingChart
            field="total_asistencias"
            title="Top 5 Asistidores"
            color="rgba(22, 163, 74, 0.8)"
          />
        </div>
      </div>

      <div className="dashboard-grid-superior" style={{ marginTop: '1.5rem' }}>
        <div className="card card-grafico">
          <RankingChart
            field="total_minutos_jugados"
            title="Top 5 Minutos Jugados"
            color="rgba(249, 115, 22, 0.8)"
          />
        </div>
        <div className="card card-grafico">
          <GraficoEvolucion jugadores={jugadores} />
        </div>
      </div>

      <div className="card card-grafico-grande">
        <EvolucionColectivaChart />
      </div>
    </div>
  );
}

export default Dashboard;
