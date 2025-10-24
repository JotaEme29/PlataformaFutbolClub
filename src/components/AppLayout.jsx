// src/components/AppLayout.jsx

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AppLayout.css'; // Importar los nuevos estilos

function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      alert("Error al cerrar sesión");
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">FutbolClub</h1>
        </div>
        <nav className="sidebar-nav">
          <h2 className="sidebar-section-title">General</h2>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>🏠 Inicio</NavLink>
          
          <h2 className="sidebar-section-title">Club</h2>
          <NavLink to="/dashboard-club" className={({ isActive }) => isActive ? 'active' : ''}>⚽ Dashboard Club</NavLink>
          <NavLink to="/gestion-roles" className={({ isActive }) => isActive ? 'active' : ''}>👥 Gestión Roles</NavLink>
        </nav>
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
