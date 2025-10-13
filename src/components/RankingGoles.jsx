// src/components/RankingGoles.jsx

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function RankingGoles({ jugadores }) {
  const jugadoresOrdenados = [...jugadores].sort((a, b) => b.total_goles - a.total_goles);

  const data = {
    labels: jugadoresOrdenados.map(j => `${j.nombre} ${j.apellidos}`),
    datasets: [
      {
        label: 'Goles Totales',
        data: jugadoresOrdenados.map(j => j.total_goles),
        backgroundColor: 'rgba(0, 191, 255, 0.6)', // Azul eléctrico con transparencia
        borderColor: 'rgba(0, 191, 255, 1)',     // Azul eléctrico sólido
        borderWidth: 1,
      },
    ],
  };

  const options = {
    // ¡NUEVO! Esta opción es clave para que el gráfico se adapte al contenedor
    maintainAspectRatio: false, 
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Ranking de Goleadores de la Plantilla',
        font: { size: 18, weight: 'bold' },
        color: '#e0e0e0', // Color de texto claro
        padding: { bottom: 20 }
      },
      legend: {
        labels: {
          color: '#e0e0e0' // Color de texto para la leyenda
        }
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: '#aaa', stepSize: 1 }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      x: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
    }
  };

  // Envolvemos el gráfico en un div con una altura fija
  return (
    <div style={{ height: '400px' }}> {/* <-- PUEDES AJUSTAR ESTE VALOR */}
      <Bar options={options} data={data} />
    </div>
  );
}

export default RankingGoles;
