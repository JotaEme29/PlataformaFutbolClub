// src/context/AuthContext.jsx - VERSIÓN 2.0 CON SOPORTE PARA CLUBES

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
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función original de signup (mantener compatibilidad con v1)
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

  // Nueva función para registro de clubes (v2.0)
  async function signupClub(formData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      const batch = writeBatch(db);
      
      // Crear documento del club
      const clubDocRef = doc(db, 'clubes', user.uid);
      const clubData = {
        id: user.uid,
        nombre: formData.nombreClub,
        ciudad: formData.ciudad,
        pais: formData.pais,
        telefono: formData.telefono || '',
        fechaCreacion: serverTimestamp(),
        administradorId: user.uid,
        activo: true,
        version: '2.0',
        configuracion: {
          maxEquipos: 12,
          formatosPermitidos: [5, 7, 8, 9, 11]
        }
      };
      batch.set(clubDocRef, clubData);

      // Crear documento del usuario administrador
      const userDocRef = doc(db, 'usuarios', user.uid);
      const userData = {
        uid: user.uid,
        email: user.email,
        nombre: formData.nombreAdministrador,
        apellido: formData.apellidoAdministrador,
        rol: 'administrador_club',
        clubId: user.uid,
        fechaRegistro: serverTimestamp(),
        activo: true,
        version: '2.0'
      };
      batch.set(userDocRef, userData);

      // Crear colección de categorías vacía para el club
      const categoriasDocRef = doc(db, 'clubes', user.uid, 'categorias', 'placeholder');
      batch.set(categoriasDocRef, {
        placeholder: true,
        fechaCreacion: serverTimestamp()
      });

      // Ejecutar todas las operaciones
      await batch.commit();
      
      console.log('Club creado exitosamente:', clubData.nombre);
      
    } catch (error) {
      console.error("Error en el proceso de signupClub:", error.code, error.message);
      throw error;
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  // Función para obtener datos del club
  async function getClubData(clubId) {
    try {
      const clubDocRef = doc(db, 'clubes', clubId);
      const clubDoc = await getDoc(clubDocRef);
      
      if (clubDoc.exists()) {
        return { id: clubDoc.id, ...clubDoc.data() };
      } else {
        console.warn(`Club con ID ${clubId} no encontrado`);
        return null;
      }
    } catch (error) {
      console.error("Error al obtener datos del club:", error);
      return null;
    }
  }

  // Función para obtener equipos del club
  async function getEquiposClub(clubId) {
    try {
      const equiposRef = collection(db, 'clubes', clubId, 'equipos');
      const equiposSnapshot = await getDocs(equiposRef);
      
      return equiposSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error al obtener equipos del club:", error);
      return [];
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'usuarios', user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Si es un usuario v2.0 (administrador de club), obtener datos del club
            if (userData.version === '2.0' && userData.clubId) {
              const clubData = await getClubData(userData.clubId);
              setCurrentUser({ 
                ...user, 
                ...userData, 
                club: clubData 
              });
            } else {
              // Usuario v1.0 o sin club asociado
              setCurrentUser({ ...user, ...userData });
            }
          } else {
            console.warn(`ADVERTENCIA: El usuario ${user.email} está autenticado pero no tiene un documento de datos en la colección 'usuarios'.`);
            setCurrentUser(user);
          }
        } catch (error) {
          console.error("Error de permisos al leer el documento del usuario. La aplicación podría no funcionar correctamente. Revisa tus Reglas de Seguridad de Firestore.", error);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    signupClub, // Nueva función para v2.0
    login,
    logout,
    getClubData,
    getEquiposClub
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
