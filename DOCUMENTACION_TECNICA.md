# Documentación Técnica - Plataforma Fútbol 2.0

## Índice
1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Base de Datos](#base-de-datos)
5. [Componentes Principales](#componentes-principales)
6. [Autenticación y Autorización](#autenticación-y-autorización)
7. [Configuración y Despliegue](#configuración-y-despliegue)
8. [APIs y Servicios](#apis-y-servicios)
9. [Optimizaciones](#optimizaciones)
10. [Mantenimiento](#mantenimiento)

---

## Arquitectura del Sistema

### Arquitectura General
```
Frontend (React + Vite)
├── Componentes de UI
├── Context API (Estado Global)
├── Firebase SDK
└── CSS Modules

Backend (Firebase)
├── Authentication
├── Firestore Database
├── Cloud Functions (futuro)
└── Storage (futuro)
```

### Flujo de Datos
1. **Usuario** interactúa con **Componentes React**
2. **Componentes** utilizan **Context API** para estado global
3. **Context** se comunica con **Firebase SDK**
4. **Firebase** maneja autenticación y base de datos
5. **Datos** se sincronizan en tiempo real

---

## Tecnologías Utilizadas

### Frontend
- **React 18**: Framework principal
- **Vite**: Build tool y dev server
- **JavaScript ES6+**: Lenguaje de programación
- **CSS3**: Estilos y responsive design
- **Firebase SDK v9**: Cliente para servicios de Firebase

### Backend
- **Firebase Authentication**: Gestión de usuarios
- **Firestore**: Base de datos NoSQL
- **Firebase Hosting**: Hosting estático (opcional)

### Herramientas de Desarrollo
- **npm**: Gestor de paquetes
- **ESLint**: Linting de código
- **Git**: Control de versiones

---

## Estructura del Proyecto

```
PlataformaFutbolClub/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── ActionLogger.jsx
│   │   ├── ClubManagement.jsx
│   │   ├── EstadisticasAnalisis.jsx
│   │   ├── GestionEventos.jsx
│   │   ├── GestionJugadores.jsx
│   │   ├── GestionRoles.jsx
│   │   ├── PlanificacionEntrenamientos.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/             # Context API
│   │   └── AuthContext.jsx
│   ├── pages/               # Páginas principales
│   │   ├── DashboardClub.jsx
│   │   ├── GestionRolesPage.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Registro.jsx
│   │   └── RegistroClub.jsx
│   ├── styles/              # Estilos CSS
│   │   ├── club.css
│   │   ├── home.css
│   │   └── index.css
│   ├── App.jsx              # Componente raíz
│   ├── firebase.js          # Configuración Firebase
│   └── main.jsx             # Punto de entrada
├── .env.local               # Variables de entorno
├── package.json
├── vite.config.js
├── MANUAL_USUARIO.md
└── DOCUMENTACION_TECNICA.md
```

---

## Base de Datos

### Estructura de Firestore

```
clubes/
├── {clubId}/
│   ├── nombre: string
│   ├── ciudad: string
│   ├── pais: string
│   ├── telefono: string
│   ├── configuracion: object
│   ├── fechaCreacion: timestamp
│   ├── categorias/          # Sub-colección
│   │   └── {categoriaId}/
│   │       ├── nombre: string
│   │       ├── edadMinima: number
│   │       ├── edadMaxima: number
│   │       └── descripcion: string
│   ├── equipos/             # Sub-colección
│   │   └── {equipoId}/
│   │       ├── nombre: string
│   │       ├── categoriaId: string
│   │       ├── formato: number
│   │       ├── entrenador: string
│   │       ├── asistente: string
│   │       ├── limiteJugadores: number
│   │       ├── estadisticas: object
│   │       └── jugadores/   # Sub-colección
│   │           └── {jugadorId}/
│   │               ├── nombre: string
│   │               ├── apellido: string
│   │               ├── fechaNacimiento: timestamp
│   │               ├── posicion: string
│   │               ├── numeroCamiseta: number
│   │               ├── telefono: string
│   │               ├── email: string
│   │               ├── contactoEmergencia: object
│   │               └── estadisticas: object
│   ├── eventos/             # Sub-colección
│   │   └── {eventoId}/
│   │       ├── titulo: string
│   │       ├── tipo: string
│   │       ├── equipoId: string
│   │       ├── fecha: timestamp
│   │       ├── duracion: number
│   │       ├── ubicacion: string
│   │       ├── descripcion: string
│   │       ├── objetivos: string
│   │       ├── materialNecesario: string
│   │       ├── observaciones: string
│   │       ├── estado: string
│   │       ├── asistencia: array
│   │       └── convocados: array
│   ├── sesiones_entrenamiento/ # Sub-colección
│   │   └── {sesionId}/
│   │       ├── titulo: string
│   │       ├── equipoId: string
│   │       ├── categoria: string
│   │       ├── duracion: number
│   │       ├── objetivos: string
│   │       ├── materialNecesario: string
│   │       ├── calentamiento: object
│   │       ├── partePrincipal: object
│   │       ├── vueltaCalma: object
│   │       ├── observaciones: string
│   │       ├── intensidad: string
│   │       └── fechaCreacion: timestamp
│   ├── match_actions/       # Sub-colección
│   │   └── {actionId}/
│   │       ├── eventoId: string
│   │       ├── equipoId: string
│   │       ├── jugadorId: string
│   │       ├── tipo: string
│   │       ├── minuto: number
│   │       ├── descripcion: string
│   │       ├── timestamp: timestamp
│   │       └── registradoPor: string
│   └── invitaciones/        # Sub-colección
│       └── {invitacionId}/
│           ├── email: string
│           ├── rol: string
│           ├── equipoId: string
│           ├── estado: string
│           ├── fechaCreacion: timestamp
│           └── fechaExpiracion: timestamp

users/
└── {userId}/
    ├── nombre: string
    ├── apellido: string
    ├── email: string
    ├── clubId: string // ID del club al que pertenece
    ├── rol: string
    ├── equipoAsignado: string
    ├── permisos: array
    └── fechaCreacion: timestamp
```

### Índices Recomendados

```javascript
// Índices compuestos para optimizar consultas
clubes/{clubId}/eventos: ['equipoId', 'fecha']
clubes/{clubId}/match_actions: ['eventoId', 'minuto']
clubes/{clubId}/equipos/{equipoId}/jugadores: ['numeroCamiseta']
users: ['clubId', 'rol']
```

---

## Componentes Principales

### AuthContext.jsx
**Propósito**: Gestión global de autenticación y estado del usuario

**Funciones principales**:
- `signupClub()`: Registro de clubes y administradores
- `login()`: Autenticación
- `logout()`: Cierre de sesión
- `resetPassword()`: Recuperación de contraseña

**Estado gestionado**:
```javascript
{
  currentUser: object,
  loading: boolean
}
```

### ProtectedRoute.jsx
**Propósito**: Control de acceso basado en autenticación y versión

**Props**:
- `children`: Componentes protegidos
- `requireVersion`: Versión requerida ("1.0" | "2.0")

### DashboardClub.jsx
**Propósito**: Dashboard principal para la versión 2.0

**Secciones**:
- Resumen del club
- Gestión de equipos
- Gestión de jugadores
- Eventos y entrenamientos
- Estadísticas
- Action Logger

### ClubManagement.jsx
**Propósito**: Gestión de categorías y equipos

**Funcionalidades**:
- CRUD de categorías
- CRUD de equipos
- Validaciones de negocio
- Límites por formato

### GestionJugadores.jsx
**Propósito**: Gestión de jugadores por equipo

**Funcionalidades**:
- Registro de jugadores
- Validación de números de camiseta
- Sistema de invitaciones
- Estadísticas básicas

### EstadisticasAnalisis.jsx
**Propósito**: Dashboard de estadísticas y análisis

**Características**:
- Carga optimizada de datos
- Múltiples vistas (resumen, jugadores, comparativas)
- Rankings dinámicos
- Métricas calculadas

### ActionLogger.jsx
**Propósito**: Registro de eventos en tiempo real

**Flujo de trabajo**:
1. Configuración del partido
2. Registro de acciones
3. Feed en tiempo real
4. Procesamiento de estadísticas

---

## Autenticación y Autorización

### Sistema de Roles

```javascript
const ROLES = {
  ADMIN_CLUB: 'admin_club',
  ENTRENADOR_PRINCIPAL: 'entrenador_principal',
  ENTRENADOR_ASISTENTE: 'entrenador_asistente',
  JUGADOR: 'jugador'
};

const PERMISOS = {
  GESTIONAR_CLUB: 'gestionar_club',
  GESTIONAR_EQUIPOS: 'gestionar_equipos',
  GESTIONAR_JUGADORES: 'gestionar_jugadores',
  GESTIONAR_EVENTOS: 'gestionar_eventos',
  VER_ESTADISTICAS: 'ver_estadisticas',
  USAR_ACTION_LOGGER: 'usar_action_logger',
  GESTIONAR_ROLES: 'gestionar_roles',
  VER_PERFIL_PERSONAL: 'ver_perfil_personal',
  VER_EQUIPO_ASIGNADO: 'ver_equipo_asignado'
};
```

### Matriz de Permisos

| Rol | Gestionar Club | Gestionar Equipos | Gestionar Jugadores | Gestionar Eventos | Ver Estadísticas | Action Logger | Gestionar Roles |
|-----|----------------|-------------------|---------------------|-------------------|------------------|---------------|-----------------|
| Admin Club | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Entrenador Principal | ❌ | ❌ | ✅* | ✅* | ✅* | ✅* | ❌ |
| Entrenador Asistente | ❌ | ❌ | ✅* | ✅* | ✅* | ❌ | ❌ |
| Jugador | ❌ | ❌ | ❌ | ❌ | ✅** | ❌ | ❌ |

*Solo para equipo asignado  
**Solo estadísticas personales

### Implementación de Seguridad

```javascript
// Verificación de permisos en componentes
const hasPermission = (user, permission, context = {}) => {
  if (!user || !user.permisos) return false;
  
  if (user.permisos.includes(permission)) {
    // Verificar contexto específico (ej. equipo asignado)
    if (context.equipoId && user.equipoAsignado) {
      return context.equipoId === user.equipoAsignado;
    }
    return true;
  }
  
  return false;
};
```

---

## Configuración y Despliegue

### Variables de Entorno

```bash
# .env.local
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Configuración de Firebase

```javascript
// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Scripts de Build

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx"
  }
}
```

### Despliegue

#### Opción 1: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

#### Opción 2: Netlify
```bash
npm run build
# Subir carpeta dist/ a Netlify
```

#### Opción 3: Vercel
```bash
npm install -g vercel
vercel
```

---

## APIs y Servicios

### Firebase Services

#### Authentication
```javascript
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
```

#### Firestore
```javascript
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
```

### Patrones de Consulta

#### Consultas Optimizadas
```javascript
// Cargar jugadores de un equipo
const loadJugadores = async (clubId, equipoId) => {
  const jugadoresRef = collection(db, 'clubes', clubId, 'equipos', equipoId, 'jugadores');
  const q = query(jugadoresRef, orderBy('numeroCamiseta', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Cargar eventos de un equipo
const loadEventos = async (clubId, equipoId) => {
  const eventosRef = collection(db, 'clubes', clubId, 'eventos');
  const q = query(
    eventosRef, 
    where('equipoId', '==', equipoId),
    orderBy('fecha', 'desc'),
    limit(50)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

---

## Optimizaciones

### Rendimiento

#### Lazy Loading
```javascript
// Implementar lazy loading para componentes grandes
const ActionLogger = lazy(() => import('../components/ActionLogger'));
const EstadisticasAnalisis = lazy(() => import('../components/EstadisticasAnalisis'));
```

#### Memoización
```javascript
// Usar React.memo para componentes que no cambian frecuentemente
const JugadorCard = React.memo(({ jugador }) => {
  return (
    <div className="jugador-card">
      {/* Contenido del jugador */}
    </div>
  );
});
```

#### Optimización de Consultas
```javascript
// Centralizar carga de datos en componentes padre
const DashboardClub = () => {
  const [jugadores, setJugadores] = useState([]);
  
  // Cargar una vez y pasar como props
  useEffect(() => {
    loadAllJugadores().then(setJugadores);
  }, []);
  
  return (
    <div>
      <EstadisticasAnalisis jugadores={jugadores} />
      <GestionJugadores jugadores={jugadores} />
    </div>
  );
};
```

### Bundle Size

#### Code Splitting
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  }
};
```

---

## Mantenimiento

### Monitoreo

#### Firebase Analytics
```javascript
// Implementar tracking de eventos importantes
import { logEvent } from 'firebase/analytics';

const trackUserAction = (action, parameters) => {
  logEvent(analytics, action, parameters);
};
```

#### Error Handling
```javascript
// Patrón global de manejo de errores
const handleFirebaseError = (error) => {
  console.error('Firebase Error:', error);
  
  switch (error.code) {
    case 'auth/user-not-found':
      return 'Usuario no encontrado';
    case 'auth/wrong-password':
      return 'Contraseña incorrecta';
    case 'permission-denied':
      return 'No tienes permisos para esta acción';
    default:
      return 'Error inesperado. Intenta nuevamente.';
  }
};
```

### Backup y Recuperación

#### Exportación de Datos
```javascript
// Script para exportar datos del club
const exportClubData = async (clubId) => {
  const clubRef = doc(db, 'clubes', clubId);
  const clubData = await getDoc(clubRef);
  
  // Exportar sub-colecciones
  const equipos = await getDocs(collection(clubRef, 'equipos'));
  const eventos = await getDocs(collection(clubRef, 'eventos'));
  
  return {
    club: clubData.data(),
    equipos: equipos.docs.map(doc => doc.data()),
    eventos: eventos.docs.map(doc => doc.data())
  };
};
```

### Actualizaciones

#### Versionado de Esquema
```javascript
// Migración de datos entre versiones
const migrateUserToV2 = async (userId) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    version: '2.0',
    migratedAt: serverTimestamp()
  });
};
```

### Testing

#### Tests Unitarios
```javascript
// Ejemplo de test para utilidades
import { calcularEdad } from '../utils/helpers';

describe('calcularEdad', () => {
  test('calcula edad correctamente', () => {
    const fechaNacimiento = new Date('2000-01-01');
    const edad = calcularEdad(fechaNacimiento);
    expect(edad).toBeGreaterThan(20);
  });
});
```

---

## Consideraciones de Seguridad

### Reglas de Firestore

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios solo pueden acceder a su propio documento
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Acceso a clubes basado en membresía
    match /clubes/{clubId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.clubId == clubId;
    }
  }
}
```

### Validación de Datos

```javascript
// Validación en el frontend
const validateJugador = (jugador) => {
  const errors = {};
  
  if (!jugador.nombre?.trim()) {
    errors.nombre = 'Nombre es requerido';
  }
  
  if (!jugador.numeroCamiseta || jugador.numeroCamiseta < 1) {
    errors.numeroCamiseta = 'Número de camiseta inválido';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

---

*Documentación Técnica - Plataforma Fútbol 2.0*  
*Versión 1.0 - Actualizada: Diciembre 2024*
