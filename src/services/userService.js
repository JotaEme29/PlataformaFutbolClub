// src/services/userService.js
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ROLES } from '../constants/roles';

/**
 * Crear un nuevo usuario en Firestore
 */
export async function crearUsuario(datosUsuario) {
  const { uid, email, nombre, apellido, rol, clubId, equipoId } = datosUsuario;

  try {
    const userDocRef = doc(db, 'usuarios', uid);
    const userData = {
      uid,
      email,
      nombre,
      apellido,
      rol,
      clubId,
      equipoId,
      activo: true,
      fechaCreacion: serverTimestamp(),
      ultimaActualizacion: serverTimestamp()
    };

    await setDoc(userDocRef, userData);
    return userData;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw new Error('No se pudo crear el usuario');
  }
}

/**
 * Obtener datos de un usuario por su ID
 */
export async function obtenerUsuario(uid) {
  try {
    const userDocRef = doc(db, 'usuarios', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      console.warn(`Usuario ${uid} no encontrado`);
      return null;
    }
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw new Error('No se pudo obtener el usuario');
  }
}

/**
 * Actualizar datos de un usuario
 */
export async function actualizarUsuario(uid, datosActualizados) {
  try {
    const userDocRef = doc(db, 'usuarios', uid);
    await updateDoc(userDocRef, {
      ...datosActualizados,
      ultimaActualizacion: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw new Error('No se pudo actualizar el usuario');
  }
}

/**
 * Obtener todos los usuarios de un club
 */
export async function obtenerUsuariosClub(clubId) {
  try {
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('clubId', '==', clubId), where('activo', '==', true));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener usuarios del club:', error);
    throw new Error('No se pudieron obtener los usuarios');
  }
}

/**
 * Obtener usuarios de un equipo específico
 */
export async function obtenerUsuariosEquipo(equipoId) {
  try {
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('equipoId', '==', equipoId), where('activo', '==', true));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener usuarios del equipo:', error);
    throw new Error('No se pudieron obtener los usuarios del equipo');
  }
}

/**
 * Cambiar rol de un usuario
 * Solo un administrador puede hacer esto
 */
export async function cambiarRolUsuario(uid, nuevoRol) {
  if (!Object.values(ROLES).includes(nuevoRol)) {
    throw new Error('Rol inválido');
  }

  try {
    await actualizarUsuario(uid, { rol: nuevoRol });
    return { success: true };
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    throw new Error('No se pudo cambiar el rol del usuario');
  }
}

/**
 * Asignar usuario a un equipo
 */
export async function asignarUsuarioAEquipo(uid, equipoId) {
  try {
    await actualizarUsuario(uid, { equipoId });
    return { success: true };
  } catch (error) {
    console.error('Error al asignar equipo:', error);
    throw new Error('No se pudo asignar el usuario al equipo');
  }
}
