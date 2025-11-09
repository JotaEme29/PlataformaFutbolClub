// src/hooks/useProtectedRoute.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tienePermiso } from '../constants/roles';

/**
 * Hook para proteger rutas según permisos del usuario
 * @param {string|string[]} permisoRequerido - Permiso(s) necesario(s) para acceder a la ruta
 * @param {string} redirectTo - Ruta a la que redirigir si no tiene permiso
 */
export function useProtectedRoute(permisoRequerido, redirectTo = '/') {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // Si no hay usuario, redirigir al login
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    // Si se especifica un permiso, verificarlo
    if (permisoRequerido) {
      const permisos = Array.isArray(permisoRequerido) ? permisoRequerido : [permisoRequerido];
      const tieneAcceso = permisos.some(permiso => tienePermiso(currentUser.rol, permiso));

      if (!tieneAcceso) {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [currentUser, loading, permisoRequerido, redirectTo, navigate]);

  return { currentUser, loading };
}
