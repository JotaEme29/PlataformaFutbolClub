// src/services/authService.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { crearUsuario, obtenerUsuario } from './userService';
import { crearClub } from './clubService';
import { ROLES } from '../constants/roles';

/**
 * Registro de nuevo usuario con club automático
 * El primer usuario se convierte en administrador y crea el club
 */
export async function registrarUsuario(datosRegistro) {
  const { email, password, nombre, apellido, nombreClub, ciudad, pais } = datosRegistro;

  try {
    // 1. Crear autenticación en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Crear el club (primer usuario siempre es admin)
    const clubId = await crearClub({
      nombre: nombreClub,
      ciudad,
      pais,
      administradorId: user.uid
    });

    // 3. Crear documento del usuario
    await crearUsuario({
      uid: user.uid,
      email,
      nombre,
      apellido,
      rol: ROLES.ADMIN,
      clubId,
      equipoId: null // Admin no está asignado a un equipo específico
    });

    return { 
      success: true, 
      user: user.uid,
      clubId 
    };
  } catch (error) {
    console.error('Error en registro:', error);
    throw new Error(getErrorMessage(error.code));
  }
}

/**
 * Inicio de sesión
 */
export async function iniciarSesion(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Obtener datos completos del usuario
    const userData = await obtenerUsuario(user.uid);
    
    if (!userData) {
      throw new Error('Usuario no encontrado en la base de datos');
    }

    return { 
      success: true, 
      user: userData 
    };
  } catch (error) {
    console.error('Error en login:', error);
    throw new Error(getErrorMessage(error.code));
  }
}

/**
 * Cerrar sesión
 */
export async function cerrarSesion() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw new Error('Error al cerrar sesión');
  }
}

/**
 * Obtener mensajes de error amigables
 */
function getErrorMessage(errorCode) {
  const errorMessages = {
    'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
    'auth/invalid-email': 'Correo electrónico inválido',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet'
  };

  return errorMessages[errorCode] || 'Error en la autenticación';
}
