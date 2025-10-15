// src/App.jsx - VERSIÓN 2.0 CON SOPORTE PARA CLUBES Y COMPATIBILIDAD V1

import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Importa AMBOS componentes guardianes
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Importa páginas v1.0 (compatibilidad)
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Eventos from './pages/Eventos';
import Plantilla from './pages/Plantilla';
import DetalleEvento from './pages/DetalleEvento';
import Configuracion from './pages/Configuracion';

// Importa páginas v2.0 (nuevas)
import Home from './pages/Home';
import RegistroClub from './pages/RegistroClub';
import DashboardClub from './pages/DashboardClub';
import GestionRolesPage from './pages/GestionRolesPage';

// Componente de navegación adaptativo
function Navbar() {
  const { currentUser, logout } = useAuth();
  
  if (!currentUser) return null;

  // Navegación para usuarios v2.0 (administradores de club)
  if (currentUser?.version === '2.0' && currentUser?.rol === 'administrador_club') {
    return (
      <nav className="navbar navbar-v2">
        <div className="nav-brand">
          <span className="brand-name">Plataforma Fútbol 2.0</span>
          <span className="club-name">{currentUser?.club?.nombre}</span>
        </div>
        <div className="nav-user">
          <span className="user-name">{currentUser.nombre} {currentUser.apellido}</span>
          <span className="user-role">Administrador</span>
          <button onClick={logout} className="logout-button">Cerrar Sesión</button>
        </div>
      </nav>
    );
  }

  // Navegación para usuarios v1.0 (compatibilidad)
  return (
    <nav className="navbar navbar-v1">
      <div className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/eventos">Eventos</NavLink>
        <NavLink to="/plantilla">Plantilla</NavLink>
        {currentUser?.rol === 'administrador' && (
          <NavLink to="/configuracion">Configuración</NavLink>
        )}
      </div>
      <div className="nav-user">
        <span className="user-email">{currentUser.email}</span>
        <button onClick={logout} className="logout-button">Cerrar Sesión</button>
      </div>
    </nav>
  );
}

// Componente para redirigir según la versión del usuario
function DashboardRedirect() {
  const { currentUser } = useAuth();
  
  if (currentUser?.version === '2.0' && currentUser?.rol === 'administrador_club') {
    return <Navigate to="/dashboard-club" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
            {/* --- Rutas Públicas --- */}
            <Route 
              path="/login" 
              element={<PublicRoute><Login /></PublicRoute>} 
            />
            
            {/* Registro v1.0 (compatibilidad) */}
            <Route 
              path="/signup" 
              element={<PublicRoute><Registro /></PublicRoute>} 
            />
            
            {/* Registro v2.0 (nuevo) */}
            <Route 
              path="/registro-club" 
              element={<PublicRoute><RegistroClub /></PublicRoute>} 
            />
            
            {/* --- Rutas Privadas v2.0 --- */}
            <Route 
              path="/dashboard-club" 
              element={
                <ProtectedRoute requireVersion="2.0">
                  <DashboardClub />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gestion-roles" 
              element={
                <ProtectedRoute requireVersion="2.0">
                  <GestionRolesPage />
                </ProtectedRoute>
              } 
            />

            {/* --- Rutas Privadas v1.0 (compatibilidad) --- */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requireVersion="1.0">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/eventos" 
              element={
                <ProtectedRoute requireVersion="1.0">
                  <Eventos />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/plantilla" 
              element={
                <ProtectedRoute requireVersion="1.0">
                  <Plantilla />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/evento/:eventoId" 
              element={
                <ProtectedRoute requireVersion="1.0">
                  <DetalleEvento />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/configuracion" 
              element={
                <ProtectedRoute requireVersion="1.0">
                  <Configuracion />
                </ProtectedRoute>
              } 
            />

            {/* Ruta por defecto - página de inicio */}
            <Route path="/" element={<Home />} />
            
            {/* Ruta para usuarios autenticados */}
            <Route 
              path="/dashboard-redirect" 
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              } 
            />

            {/* Página de selección de versión para nuevos usuarios */}
            <Route 
              path="/seleccionar-version" 
              element={
                <PublicRoute>
                  <div className="version-selector">
                    <h2>Selecciona tu versión</h2>
                    <div className="version-options">
                      <div className="version-card">
                        <h3>Plataforma Fútbol 1.0</h3>
                        <p>Gestión individual de equipos</p>
                        <NavLink to="/signup" className="btn-primary">
                          Registrar Equipo
                        </NavLink>
                      </div>
                      <div className="version-card featured">
                        <h3>Plataforma Fútbol 2.0</h3>
                        <p>Gestión completa de clubes</p>
                        <span className="badge">Recomendado</span>
                        <NavLink to="/registro-club" className="btn-primary">
                          Registrar Club
                        </NavLink>
                      </div>
                    </div>
                  </div>
                </PublicRoute>
              } 
            />

            {/* Ruta para páginas no encontradas */}
            <Route path="*" element={<div><h2>404 - Página no encontrada</h2></div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
