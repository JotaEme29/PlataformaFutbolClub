// src/constants/roles.js

/**
 * Roles del sistema - SIMPLIFICADO
 * Solo 3 niveles jerárquicos claros
 */
export const ROLES = {
  ADMIN: 'administrador',
  ENTRENADOR: 'entrenador',
  JUGADOR: 'jugador'
};

/**
 * Permisos por rol
 * Define qué puede hacer cada tipo de usuario
 */
export const PERMISOS = {
  [ROLES.ADMIN]: {
    gestionarClub: true,
    gestionarEquipos: true,
    gestionarUsuarios: true,
    gestionarJugadores: true,
    gestionarEventos: true,
    verEstadisticas: true,
    configuracion: true
  },
  [ROLES.ENTRENADOR]: {
    gestionarClub: false,
    gestionarEquipos: false, // Solo su equipo
    gestionarUsuarios: false,
    gestionarJugadores: true, // Solo de su equipo
    gestionarEventos: true,   // Solo de su equipo
    verEstadisticas: true,    // Solo de su equipo
    configuracion: false
  },
  [ROLES.JUGADOR]: {
    gestionarClub: false,
    gestionarEquipos: false,
    gestionarUsuarios: false,
    gestionarJugadores: false,
    gestionarEventos: false,
    verEstadisticas: true, // Solo propias
    configuracion: false
  }
};

/**
 * Etiquetas amigables para mostrar en la UI
 */
export const ROLES_LABELS = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.ENTRENADOR]: 'Entrenador',
  [ROLES.JUGADOR]: 'Jugador'
};

/**
 * Colores asociados a cada rol (para badges y UI)
 */
export const ROLES_COLORS = {
  [ROLES.ADMIN]: 'purple',
  [ROLES.ENTRENADOR]: 'blue',
  [ROLES.JUGADOR]: 'green'
};

/**
 * Verifica si un usuario tiene un permiso específico
 * @param {string} rol - Rol del usuario
 * @param {string} permiso - Permiso a verificar
 * @returns {boolean}
 */
export function tienePermiso(rol, permiso) {
  return PERMISOS[rol]?.[permiso] || false;
}

/**
 * Verifica si un rol tiene mayor jerarquía que otro
 * @param {string} rol1 - Primer rol
 * @param {string} rol2 - Segundo rol
 * @returns {boolean}
 */
export function esMayorJerarquia(rol1, rol2) {
  const jerarquia = {
    [ROLES.ADMIN]: 3,
    [ROLES.ENTRENADOR]: 2,
    [ROLES.JUGADOR]: 1
  };
  return (jerarquia[rol1] || 0) > (jerarquia[rol2] || 0);
}
