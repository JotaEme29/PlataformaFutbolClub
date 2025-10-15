// src/pages/GestionRolesPage.jsx - PÁGINA DEDICADA PARA GESTIÓN DE ROLES

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GestionRoles from '../components/GestionRoles';

function GestionRolesPage() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('roles');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'roles':
        return <GestionRoles />;
      
      case 'permisos':
        return (
          <div className="permisos-info">
            <h2>Sistema de Permisos</h2>
            
            <div className="permisos-section">
              <h3>Descripción de Permisos</h3>
              
              <div className="permisos-grid">
                <div className="permiso-card">
                  <h4>Gestionar Equipos</h4>
                  <p>Crear, editar y eliminar equipos del club. Asignar entrenadores y configurar formatos de juego.</p>
                </div>
                
                <div className="permiso-card">
                  <h4>Gestionar Jugadores</h4>
                  <p>Añadir, editar y eliminar jugadores de todos los equipos del club. Gestionar información personal y estadísticas.</p>
                </div>
                
                <div className="permiso-card">
                  <h4>Gestionar Jugadores del Equipo</h4>
                  <p>Gestionar únicamente los jugadores del equipo asignado. Limitado al equipo específico del usuario.</p>
                </div>
                
                <div className="permiso-card">
                  <h4>Gestionar Eventos</h4>
                  <p>Crear, programar y gestionar eventos, entrenamientos y partidos para todos los equipos.</p>
                </div>
                
                <div className="permiso-card">
                  <h4>Gestionar Eventos del Equipo</h4>
                  <p>Crear y gestionar eventos únicamente para el equipo asignado.</p>
                </div>
                
                <div className="permiso-card">
                  <h4>Ver Estadísticas</h4>
                  <p>Acceso completo a todas las estadísticas del club, equipos y jugadores.</p>
                </div>
                
                <div className="permiso-card">
                  <h4>Ver Estadísticas del Equipo</h4>
                  <p>Ver estadísticas únicamente del equipo asignado y sus jugadores.</p>
                </div>
                
                <div className="permiso-card">
                  <h4>Ver Estadísticas Personales</h4>
                  <p>Acceso únicamente a las estadísticas personales del jugador.</p>
                </div>
                
                <div className="permiso-card">
                  <h4>Gestionar Usuarios</h4>
                  <p>Invitar nuevos usuarios, asignar roles y gestionar permisos dentro del club.</p>
                </div>
                
                <div className="permiso-card">
                  <h4>Ver Perfil Personal</h4>
                  <p>Acceso a la información personal y configuración de la cuenta propia.</p>
                </div>
              </div>
            </div>

            <div className="jerarquia-section">
              <h3>Jerarquía de Roles</h3>
              
              <div className="jerarquia-visual">
                <div className="nivel-jerarquia nivel-1">
                  <div className="rol-jerarquia admin">
                    <h4>Administrador del Club</h4>
                    <p>Máximo nivel de acceso</p>
                    <ul>
                      <li>Gestión completa del club</li>
                      <li>Todos los permisos</li>
                      <li>Asignación de roles</li>
                    </ul>
                  </div>
                </div>
                
                <div className="nivel-jerarquia nivel-2">
                  <div className="rol-jerarquia entrenador">
                    <h4>Entrenador Principal</h4>
                    <p>Gestión de equipo específico</p>
                    <ul>
                      <li>Gestión de jugadores del equipo</li>
                      <li>Programación de eventos</li>
                      <li>Estadísticas del equipo</li>
                    </ul>
                  </div>
                  
                  <div className="rol-jerarquia asistente">
                    <h4>Entrenador Asistente</h4>
                    <p>Apoyo en gestión de equipo</p>
                    <ul>
                      <li>Visualización de jugadores</li>
                      <li>Gestión de eventos</li>
                      <li>Estadísticas del equipo</li>
                    </ul>
                  </div>
                </div>
                
                <div className="nivel-jerarquia nivel-3">
                  <div className="rol-jerarquia jugador">
                    <h4>Jugador</h4>
                    <p>Acceso personal y del equipo</p>
                    <ul>
                      <li>Perfil personal</li>
                      <li>Eventos del equipo</li>
                      <li>Estadísticas personales</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="gestion-roles-page">
      <header className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Gestión de Roles - {currentUser?.club?.nombre}</h1>
            <span className="page-subtitle">Administración de usuarios y permisos</span>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span>{currentUser?.nombre} {currentUser?.apellido}</span>
              <span className="user-role">Administrador</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <nav className="page-nav">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            👥 Gestión de Roles
          </button>
          <button 
            className={`nav-tab ${activeTab === 'permisos' ? 'active' : ''}`}
            onClick={() => setActiveTab('permisos')}
          >
            🔐 Sistema de Permisos
          </button>
        </div>
      </nav>

      <main className="page-content">
        {renderTabContent()}
      </main>
    </div>
  );
}

export default GestionRolesPage;
