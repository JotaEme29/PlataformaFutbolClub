// src/components/ProtectedRoute.jsx - VERSIÓN 2.0 CON SOPORTE PARA VERSIONES

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requireVersion = null }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Si no hay usuario, redirige a la página de login
    return <Navigate to="/login" replace />;
  }

  // Si se requiere una versión específica, verificar compatibilidad
  if (requireVersion) {
    const userVersion = currentUser.version || '1.0'; // Por defecto v1.0 para usuarios existentes
    
    if (requireVersion === '2.0' && userVersion !== '2.0') {
      // Usuario v1.0 intentando acceder a funcionalidad v2.0
      return <Navigate to="/dashboard" replace />;
    }
    
    if (requireVersion === '1.0' && userVersion === '2.0') {
      // Usuario v2.0 intentando acceder a funcionalidad v1.0
      return <Navigate to="/dashboard-club" replace />;
    }
  }

  // Si hay un usuario y cumple los requisitos de versión, mostrar el componente
  return children;
}

export default ProtectedRoute;
