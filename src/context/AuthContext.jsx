// src/context/AuthContext.jsx - VERSIÓN FINAL, ROBUSTA Y CORREGIDA

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  limit,
  writeBatch
} from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // La función de signup no necesita cambios, está bien como está.
  async function signup(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDocRef = doc(db, 'usuarios', user.uid);
      const invitacionesRef = collection(db, 'invitaciones');
      const q = query(invitacionesRef, where('email', '==', email.toLowerCase()), limit(1));
      const invitacionSnapshot = await getDocs(q);

      if (!invitacionSnapshot.empty) {
        const invitacionDoc = invitacionSnapshot.docs[0];
        const datosInvitacion = invitacionDoc.data();
        await setDoc(userDocRef, {
          email: user.email,
          rol: datosInvitacion.rol,
          teamId: datosInvitacion.teamId,
        });
        const batch = writeBatch(db);
        batch.delete(invitacionDoc.ref);
        await batch.commit();
      } else {
        await setDoc(userDocRef, {
          email: user.email,
          rol: 'administrador',
          teamId: user.uid,
        });
      }
    } catch (error) {
      console.error("Error en el proceso de signup:", error.code, error.message);
      throw error;
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  // --- ¡AQUÍ ESTÁ EL CAMBIO IMPORTANTE! ---
  // Este useEffect ahora es más robusto y no cierra la sesión si falla una lectura.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Si hay un usuario autenticado...
        const userDocRef = doc(db, 'usuarios', user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            // CASO 1: Éxito. El usuario tiene su documento en Firestore.
            // Combinamos los datos de Auth y Firestore en un solo objeto.
            setCurrentUser({ ...user, ...userDoc.data() });
          } else {
            // CASO 2: El documento no existe. Esto es un estado inconsistente.
            // En lugar de romper la app, lo advertimos y usamos solo los datos de Auth.
            // La app podría no mostrar datos de equipo, pero no se quedará en blanco.
            console.warn(`ADVERTENCIA: El usuario ${user.email} está autenticado pero no tiene un documento de datos en la colección 'usuarios'.`);
            setCurrentUser(user);
          }
        } catch (error) {
            // CASO 3: Ocurrió un error de permisos al intentar leer el documento.
            // Esto pasaba antes. Ahora, en lugar de cerrar sesión, solo lo advertimos.
            console.error("Error de permisos al leer el documento del usuario. La aplicación podría no funcionar correctamente. Revisa tus Reglas de Seguridad de Firestore.", error);
            setCurrentUser(user); // Usamos solo los datos de Auth para no dejar la app en blanco.
        }
      } else {
        // CASO 4: No hay ningún usuario autenticado.
        setCurrentUser(null);
      }
      
      // PASE LO QUE PASE, al final de todo, decimos que la carga ha terminado.
      // Esto permite que el resto de la aplicación se renderice.
      setLoading(false);
    });

    // La función de limpieza que se ejecuta cuando el componente se desmonta.
    return () => unsubscribe();
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez al montar el componente.

  const value = {
    currentUser,
    loading, // ¡NUEVO! Exponemos el estado 'loading' para que otros componentes puedan usarlo si es necesario.
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* La lógica de '!loading && children' se mantiene. Es correcta. */}
      {!loading && children}
    </AuthContext.Provider>
  );
}
