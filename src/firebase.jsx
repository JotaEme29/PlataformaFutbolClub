// src/firebase.js - VERSIÓN DE DEPURACIÓN

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- ¡¡¡EL CHIVATO!!! ---
// Imprimimos en la consola la API Key que Vite está leyendo.
// Esto nos dirá la verdad.
console.log("API Key leída por Vite:", import.meta.env.VITE_FIREBASE_API_KEY);
// -------------------------

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validamos que la API Key no sea undefined antes de inicializar
if (!firebaseConfig.apiKey) {
  // Lanzamos un error mucho más claro en la consola
  throw new Error("ERROR CRÍTICO: La API Key de Firebase no se ha cargado. Revisa tu archivo .env.local y reinicia el servidor.");
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
