// src/services/clubService.js
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Crear un nuevo club
 */
export async function crearClub(datosClub) {
  const { nombre, ciudad, pais, administradorId } = datosClub;

  try {
    // Usar el UID del administrador como ID del club (simplifica relaciones)
    const clubDocRef = doc(db, 'clubes', administradorId);
    const clubData = {
      id: administradorId,
      nombre,
      ciudad,
      pais,
      administradorId,
      activo: true,
      fechaCreacion: serverTimestamp(),
      ultimaActualizacion: serverTimestamp(),
      estadisticas: {
        totalEquipos: 0,
        totalJugadores: 0,
        totalEntrenadores: 0
      }
    };

    await setDoc(clubDocRef, clubData);
    return administradorId; // Retorna el ID del club
  } catch (error) {
    console.error('Error al crear club:', error);
    throw new Error('No se pudo crear el club');
  }
}

/**
 * Obtener datos de un club por su ID
 */
export async function obtenerClub(clubId) {
  try {
    const clubDocRef = doc(db, 'clubes', clubId);
    const clubDoc = await getDoc(clubDocRef);

    if (clubDoc.exists()) {
      return { id: clubDoc.id, ...clubDoc.data() };
    } else {
      console.warn(`Club ${clubId} no encontrado`);
      return null;
    }
  } catch (error) {
    console.error('Error al obtener club:', error);
    throw new Error('No se pudo obtener el club');
  }
}

/**
 * Actualizar datos de un club
 */
export async function actualizarClub(clubId, datosActualizados) {
  try {
    const clubDocRef = doc(db, 'clubes', clubId);
    await updateDoc(clubDocRef, {
      ...datosActualizados,
      ultimaActualizacion: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar club:', error);
    throw new Error('No se pudo actualizar el club');
  }
}

/**
 * Actualizar estadísticas del club
 */
export async function actualizarEstadisticasClub(clubId, estadisticas) {
  try {
    const clubDocRef = doc(db, 'clubes', clubId);
    await updateDoc(clubDocRef, {
      estadisticas: {
        ...estadisticas
      },
      ultimaActualizacion: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar estadísticas:', error);
    throw new Error('No se pudieron actualizar las estadísticas');
  }
}
