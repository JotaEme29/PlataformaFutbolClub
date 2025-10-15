# Plataforma Fútbol 2.0 ⚽

Una plataforma integral de gestión para clubes de fútbol que permite administrar equipos, jugadores, entrenamientos, partidos y estadísticas de manera profesional y eficiente.

## 🚀 Características Principales

### ✨ Gestión Integral del Club
- **Estructura jerárquica**: Club → Categorías → Equipos → Jugadores
- **Múltiples formatos**: Soporte para fútbol 5, 7, 8, 9 y 11
- **Gestión de roles**: Sistema granular de permisos y acceso
- **Compatibilidad**: Mantiene soporte para usuarios de la versión 1.0

### 📊 Estadísticas y Análisis Avanzado
- **Dashboard completo**: Métricas del club en tiempo real
- **Rankings de jugadores**: Top goleadores y más activos
- **Análisis por equipos**: Comparativas y rendimiento
- **Action Logger**: Registro de eventos en tiempo real durante partidos

### 🏃‍♂️ Gestión de Entrenamientos
- **Planificación estructurada**: Calentamiento, parte principal, vuelta a la calma
- **Ejercicios predefinidos**: Biblioteca de ejercicios por categoría
- **Sesiones profesionales**: Técnico, táctico, físico, psicológico y mixto
- **Material y objetivos**: Planificación completa de recursos

### ⚽ Eventos y Partidos
- **Gestión de eventos**: Entrenamientos, partidos, reuniones, eventos especiales
- **Calendario integrado**: Visualización y organización temporal
- **Convocatorias**: Sistema de invitaciones y confirmaciones
- **Seguimiento**: Estado y asistencia de eventos

## 🛠️ Tecnologías

- **Frontend**: React 18 + Vite
- **Backend**: Firebase (Authentication + Firestore)
- **Estilos**: CSS3 con diseño responsive
- **Hosting**: Compatible con Firebase Hosting, Netlify, Vercel

## 📋 Requisitos Previos

- Node.js 16+ 
- npm o yarn
- Cuenta de Firebase
- Navegador moderno (Chrome, Firefox, Safari, Edge)

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/PlataformaFutbolClub.git
cd PlataformaFutbolClub
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Firebase

1. **Crear proyecto en Firebase Console**
   - Ir a [Firebase Console](https://console.firebase.google.com/)
   - Crear nuevo proyecto
   - Habilitar Authentication y Firestore

2. **Configurar Authentication**
   - Ir a Authentication → Sign-in method
   - Habilitar "Email/Password"

3. **Configurar Firestore**
   - Ir a Firestore Database
   - Crear base de datos en modo de prueba
   - Configurar reglas de seguridad

4. **Obtener configuración**
   - Ir a Project Settings → General
   - Scroll down a "Your apps"
   - Copiar configuración de Firebase

### 4. Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```bash
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 5. Ejecutar en Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Estructura del Proyecto

```
PlataformaFutbolClub/
├── public/                  # Archivos estáticos
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── ActionLogger.jsx
│   │   ├── ClubManagement.jsx
│   │   ├── EstadisticasAnalisis.jsx
│   │   ├── GestionEventos.jsx
│   │   ├── GestionJugadores.jsx
│   │   └── ...
│   ├── context/             # Context API
│   │   └── AuthContext.jsx
│   ├── pages/               # Páginas principales
│   │   ├── DashboardClub.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   └── ...
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
├── MANUAL_USUARIO.md        # Manual de usuario
└── DOCUMENTACION_TECNICA.md # Documentación técnica
```

## 📖 Documentación

- **[Manual de Usuario](MANUAL_USUARIO.md)**: Guía completa para usuarios finales
- **[Documentación Técnica](DOCUMENTACION_TECNICA.md)**: Información para desarrolladores

## 🎯 Uso Rápido

### Primer Uso

1. **Acceder a la aplicación**
2. **Seleccionar "Versión 2.0"** en la página de inicio
3. **Registrar nuevo club** con información del administrador
4. **Crear categorías** (ej: Sub-16, Juvenil, Senior)
5. **Añadir equipos** con formato y entrenadores
6. **Registrar jugadores** en cada equipo
7. **Planificar entrenamientos** y eventos
8. **Usar Action Logger** durante partidos para estadísticas automáticas

### Funcionalidades Clave

#### 🏆 Gestión del Club
- Crear y gestionar categorías por edad
- Configurar equipos con diferentes formatos
- Asignar entrenadores y límites de jugadores

#### 👥 Gestión de Jugadores
- Registro completo con validaciones
- Sistema de invitaciones por email
- Estadísticas automáticas por jugador

#### 📅 Eventos y Entrenamientos
- Planificación de sesiones estructuradas
- Gestión de partidos y entrenamientos
- Biblioteca de ejercicios predefinidos

#### 📊 Estadísticas
- Dashboard con métricas del club
- Rankings de goleadores y más activos
- Análisis comparativo entre equipos

#### 🎥 Action Logger
- Registro en tiempo real durante partidos
- 10 tipos de acciones diferentes
- Procesamiento automático de estadísticas

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## 🚀 Despliegue

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Netlify
1. Ejecutar `npm run build`
2. Subir carpeta `dist/` a Netlify
3. Configurar variables de entorno en Netlify

### Vercel
```bash
npm install -g vercel
vercel
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📝 Changelog

### Versión 2.0.0
- ✅ Sistema completo de gestión de clubes
- ✅ Estructura jerárquica Club → Categorías → Equipos → Jugadores
- ✅ Action Logger para registro en tiempo real
- ✅ Estadísticas avanzadas y análisis
- ✅ Planificación profesional de entrenamientos
- ✅ Sistema de roles y permisos
- ✅ Compatibilidad con versión 1.0

### Versión 1.0.0
- ✅ Gestión básica de equipos
- ✅ Registro de jugadores
- ✅ Eventos simples
- ✅ Estadísticas básicas

## 🐛 Problemas Conocidos

- Vista de calendario en desarrollo (próxima actualización)
- Exportación de reportes en PDF pendiente
- Notificaciones push en desarrollo

## 📞 Soporte

Para problemas técnicos o consultas:
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/PlataformaFutbolClub/issues)
- **Email**: soporte@plataformafutbol.com
- **Documentación**: Ver archivos de documentación incluidos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- Firebase por la infraestructura backend
- React team por el framework
- Vite por las herramientas de desarrollo
- Comunidad de desarrolladores por feedback y contribuciones

---

**Plataforma Fútbol 2.0** - Desarrollado con ❤️ para la gestión profesional de clubes de fútbol

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Powered by Firebase](https://img.shields.io/badge/Powered%20by-Firebase-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Built with Vite](https://img.shields.io/badge/Built%20with-Vite-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
