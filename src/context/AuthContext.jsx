// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { obtenerUsuario } from '../services/userService';
import { obtenerClub } from '../services/clubService';
import { registrarUsuario, iniciarSesion, cerrarSesion } from '../services/authService';
import { tienePermiso } from '../constants/roles';

const AuthContext = createContext();

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

/**
 * Proveedor del contexto de autenticación
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userClub, setUserClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Cargar datos completos del usuario y su club
   */
  const cargarDatosUsuario = async (uid) => {
    try {
      const userData = await obtenerUsuario(uid);
      
      if (!userData) {
        console.warn('Usuario no encontrado en Firestore');
        setCurrentUser(null);
        setUserClub(null);
        return;
      }

      setCurrentUser(userData);

      // Cargar datos del club si el usuario tiene uno asignado
      if (userData.clubId) {
        const clubData = await obtenerClub(userData.clubId);
        setUserClub(clubData);
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      setError(error.message);
    }
  };

  /**
   * Efecto para escuchar cambios en el estado de autenticación
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await cargarDatosUsuario(user.uid);
      } else {
        setCurrentUser(null);
        setUserClub(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  const verificarPermiso = (permiso) => {
    if (!currentUser?.rol) return false;
    return tienePermiso(currentUser.rol, permiso);
  };

  /**
   * Recargar datos del usuario actual
   */
  const recargarUsuario = async () => {
    if (currentUser?.uid) {
      await cargarDatosUsuario(currentUser.uid);
    }
  };

  const value = {
    // Estado
    currentUser,
    userClub,
    loading,
    error,
    
    // Funciones de autenticación
    registrarUsuario,
    iniciarSesion,
    cerrarSesion,
    
    // Utilidades
    verificarPermiso,
    recargarUsuario,
    
    // Shortcuts para permisos comunes
    esAdmin: currentUser?.rol === 'administrador',
    esEntrenador: currentUser?.rol === 'entrenador',
    esJugador: currentUser?.rol === 'jugador'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
