# 🔄 Refactor: Sistema de Roles Limpio

## 🎯 Objetivo

Este refactor elimina la complejidad del sistema de roles y registro, creándolo **desde cero** con una arquitectura limpia y mantenible.

## ✨ Mejoras Principales

### 1. **Sistema de Roles Simplificado**

**Antes:** 5+ roles diferentes con lógica confusa
- `administrador`
- `administrador_club`
- `entrenador_principal`
- `entrenador_asistente`
- `jugador`

**Ahora:** 3 roles claros y jerárquicos
- 👑 **Administrador**: Control total del club
- ⚽ **Entrenador**: Gestiona su equipo asignado
- 🎽 **Jugador**: Visualiza su información personal

### 2. **Registro Unificado**

**Antes:**
- Dos componentes separados: `Registro.jsx` y `RegistroClub.jsx`
- Confusión sobre cuál usar
- Lógica duplicada en `AuthContext`

**Ahora:**
- Un solo componente `Registro.jsx` con wizard de 2 pasos
- Flujo intuitivo: Datos personales → Datos del club
- Creación automática del club al registrarse

### 3. **AuthContext Limpio**

**Antes:**
- 200+ líneas de código
- Funciones `signup` y `signupClub` duplicadas
- Manejo de versiones (v1.0 y v2.0)
- Lógica condicional compleja

**Ahora:**
- Menos de 100 líneas
- Una sola función `registrarUsuario`
- Sin versiones ni compatibilidad hacia atrás
- Código claro y directo

### 4. **Arquitectura de Servicios**

**Nueva estructura:**
```
src/
├── config/
│   └── firebase.js         # Configuración Firebase
├── constants/
│   └── roles.js            # Definición de roles y permisos
├── services/
│   ├── authService.js      # Lógica de autenticación
│   ├── userService.js      # Gestión de usuarios
│   └── clubService.js      # Gestión de clubes
├── context/
│   └── AuthContext.jsx     # Context API simplificado
├── hooks/
│   └── useProtectedRoute.js # Hook para proteger rutas
└── pages/
    ├── Registro.jsx        # Registro unificado
    └── Login.jsx           # Login actualizado
```

## 📚 Cómo Usar el Nuevo Sistema

### 1. Verificar Permisos

```jsx
import { useAuth } from '../context/AuthContext';
import { tienePermiso } from '../constants/roles';

function MiComponente() {
  const { currentUser, verificarPermiso } = useAuth();

  // Opción 1: Usar el hook
  const puedeGestionarEquipos = verificarPermiso('gestionarEquipos');

  // Opción 2: Usar shortcuts
  const { esAdmin, esEntrenador, esJugador } = useAuth();

  // Opción 3: Usar la función directa
  if (tienePermiso(currentUser.rol, 'gestionarJugadores')) {
    // ...
  }

  return (
    <div>
      {esAdmin && <ButtonGestionarClub />}
      {(esAdmin || esEntrenador) && <ButtonCrearEvento />}
    </div>
  );
}
```

### 2. Proteger Rutas

```jsx
import { useProtectedRoute } from '../hooks/useProtectedRoute';

function PaginaAdministracion() {
  // Redirige a '/' si no tiene el permiso
  useProtectedRoute('gestionarClub');

  return (
    <div>
      <h1>Panel de Administración</h1>
      {/* Solo visible para administradores */}
    </div>
  );
}
```

### 3. Gestionar Usuarios

```jsx
import { obtenerUsuariosClub, cambiarRolUsuario } from '../services/userService';
import { ROLES } from '../constants/roles';

async function promoverAEntrenador(userId) {
  await cambiarRolUsuario(userId, ROLES.ENTRENADOR);
}
```

## 📦 Estructura de Datos en Firestore

### Colección `usuarios`
```javascript
{
  uid: "abc123",
  email: "entrenador@club.com",
  nombre: "Juan",
  apellido: "Pérez",
  rol: "entrenador",        // administrador | entrenador | jugador
  clubId: "club-id-123",
  equipoId: "equipo-id-456", // null para administrador
  activo: true,
  fechaCreacion: Timestamp,
  ultimaActualizacion: Timestamp
}
```

### Colección `clubes`
```javascript
{
  id: "club-id-123",
  nombre: "Club Deportivo Los Leones",
  ciudad: "Madrid",
  pais: "España",
  administradorId: "abc123",
  activo: true,
  fechaCreacion: Timestamp,
  ultimaActualizacion: Timestamp,
  estadisticas: {
    totalEquipos: 5,
    totalJugadores: 120,
    totalEntrenadores: 8
  }
}
```

## 🛠️ Siguientes Pasos

### Para Completar el Refactor:

1. **Crear componente de gestión de usuarios**
   - Listar usuarios del club
   - Cambiar roles
   - Asignar equipos

2. **Actualizar componentes existentes**
   - Migrar de `AuthContext` antiguo al nuevo
   - Reemplazar verificaciones de roles complejas
   - Usar `useProtectedRoute` en páginas

3. **Sistema de invitaciones**
   - Invitar usuarios por email
   - Asignar rol al aceptar invitación

4. **Tests**
   - Tests unitarios para servicios
   - Tests de integración para flujos de registro/login

## ⚠️ Migración desde el Sistema Antiguo

### Mapeo de Roles Antiguos → Nuevos

```javascript
const MAPEO_ROLES = {
  'administrador': 'administrador',
  'administrador_club': 'administrador',
  'entrenador_principal': 'entrenador',
  'entrenador_asistente': 'entrenador',
  'jugador': 'jugador'
};
```

### Script de Migración (opcional)

```javascript
import { db } from './src/config/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

async function migrarRoles() {
  const usuariosRef = collection(db, 'usuarios');
  const snapshot = await getDocs(usuariosRef);
  
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const nuevoRol = MAPEO_ROLES[data.rol] || 'jugador';
    
    if (nuevoRol !== data.rol) {
      await updateDoc(doc(db, 'usuarios', docSnap.id), {
        rol: nuevoRol
      });
      console.log(`Migrado: ${data.email} de ${data.rol} a ${nuevoRol}`);
    }
  }
}
```

## 📝 Ventajas del Nuevo Sistema

✅ **Simplicidad**: 3 roles en lugar de 5+  
✅ **Mantenibilidad**: Código organizado en servicios  
✅ **Escalabilidad**: Fácil agregar nuevos permisos  
✅ **Testeable**: Funciones puras y separadas  
✅ **Intuitivo**: Wizard de registro paso a paso  
✅ **Sin redundancia**: Un solo flujo de autenticación  

## 👍 Feedback y Mejoras

Este es un sistema base sólido. Puedes extenderlo fácilmente agregando:
- Más permisos granulares en `constants/roles.js`
- Nuevos servicios (equipos, eventos, estadísticas)
- Middleware de autorización
- Sistema de notificaciones

---

**Desarrollado con ❤️ para una gestión de clubes simple y efectiva**
