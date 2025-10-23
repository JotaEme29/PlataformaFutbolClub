import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Importa AMBOS componentes guardianes
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Importa páginas públicas y de autenticación
import Login from './pages/Login';
import Home from './pages/Home';

// Importa páginas v2.0 (clubes)
import RegistroClub from './pages/RegistroClub';
import DashboardClub from './pages/DashboardClub';
import DetalleEventoClub from './pages/DetalleEventoClub';
import GestionRolesPage from './pages/GestionRolesPage';

// Componente de navegación adaptativo
function Navbar() {
  const { currentUser, logout } = useAuth();
  
  if (!currentUser) return null;

  // Navegación simple para usuarios autenticados en v2 (clubes)
  return (
    <nav className="navbar navbar-v2">
      <div className="nav-brand">
        <span className="brand-name">Plataforma Fútbol 2.0</span>
        <span className="club-name">{currentUser?.club?.nombre || ''}</span>
      </div>
      <div className="nav-links">
        {currentUser?.rol === 'administrador_club' && (
          <>
            <NavLink to="/dashboard-club">Dashboard Club</NavLink>
            <NavLink to="/gestion-roles">Gestión Roles</NavLink>
          </>
        )}
      </div>
      <div className="nav-user">
        <span className="user-name">{currentUser.nombre || currentUser.email}</span>
        <button onClick={logout} className="logout-button">Cerrar Sesión</button>
      </div>
    </nav>
  );
}

// Nota: La lógica de redirección por versión se eliminó al soportar únicamente v2.0

function App() {
  return (
    <Router>
      <Navbar />
      <div>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/registro-club" element={<PublicRoute><RegistroClub /></PublicRoute>} />

            {/* Rutas privadas v2 (clubes) */}
            <Route path="/dashboard-club" element={<ProtectedRoute><DashboardClub /></ProtectedRoute>} />
            <Route path="/gestion-roles" element={<ProtectedRoute><GestionRolesPage /></ProtectedRoute>} />
            <Route path="/eventos/:eventoId" element={<ProtectedRoute><DetalleEventoClub /></ProtectedRoute>} />

          {/* Página de inicio */}
          <Route path="/" element={<Home />} />

          {/* Catch-all 404 */}
          <Route path="*" element={<div><h2>404 - Página no encontrada</h2></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
