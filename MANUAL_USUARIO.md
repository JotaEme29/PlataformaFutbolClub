# Manual de Usuario - Plataforma Fútbol 2.0

## Índice
1. [Introducción](#introducción)
2. [Primeros Pasos](#primeros-pasos)
3. [Gestión del Club](#gestión-del-club)
4. [Gestión de Jugadores](#gestión-de-jugadores)
5. [Eventos y Entrenamientos](#eventos-y-entrenamientos)
6. [Estadísticas y Análisis](#estadísticas-y-análisis)
7. [Action Logger](#action-logger)
8. [Gestión de Roles](#gestión-de-roles)
9. [Solución de Problemas](#solución-de-problemas)

---

## Introducción

La **Plataforma Fútbol 2.0** es un sistema integral de gestión para clubes de fútbol que permite administrar equipos, jugadores, entrenamientos, partidos y estadísticas de manera profesional y eficiente.

### Características Principales
- **Gestión jerárquica**: Club → Categorías → Equipos → Jugadores
- **Múltiples formatos**: Fútbol 5, 7, 8, 9 y 11
- **Roles y permisos**: Sistema granular de acceso
- **Estadísticas avanzadas**: Análisis detallado de rendimiento
- **Action Logger**: Registro en tiempo real durante partidos
- **Planificación de entrenamientos**: Sesiones estructuradas y profesionales

---

## Primeros Pasos

### 1. Registro del Club

1. **Acceder a la aplicación** en la URL proporcionada
2. **Hacer clic en "Registrar Club"**
3. **Completar el formulario** con la información del administrador y del club:
   - Datos personales del administrador
   - Nombre del club
   - Ciudad y país
   - Teléfono de contacto
   - Configuración inicial (máximo equipos, formatos permitidos)

### 2. Primer Acceso

Después del registro exitoso:
1. **Iniciar sesión** con las credenciales creadas
2. **Explorar el dashboard** principal
3. **Configurar las primeras categorías** y equipos
4. **Invitar entrenadores** y registrar jugadores

---

## Gestión del Club

### Dashboard Principal

El dashboard ofrece una vista general del club con:
- **Estadísticas generales**: Número de equipos, jugadores, eventos
- **Próximos eventos**: Entrenamientos y partidos programados
- **Actividad reciente**: Últimas acciones realizadas
- **Navegación rápida**: Acceso directo a todas las funcionalidades

### Gestión de Categorías

#### Crear Nueva Categoría
1. Ir a **"Gestión del Club"**
2. Hacer clic en **"+ Nueva Categoría"**
3. Completar:
   - **Nombre**: Ej. "Sub-16", "Juvenil", "Senior"
   - **Rango de edad**: Edad mínima y máxima
   - **Descripción**: Información adicional

#### Editar/Eliminar Categorías
- **Editar**: Clic en el botón "Editar" de la categoría
- **Eliminar**: Solo posible si no hay equipos asociados

### Gestión de Equipos

#### Crear Nuevo Equipo
1. Seleccionar **categoría existente**
2. Hacer clic en **"+ Nuevo Equipo"**
3. Configurar:
   - **Nombre del equipo**
   - **Formato de juego** (5, 7, 8, 9, 11 jugadores)
   - **Entrenador principal** y asistente
   - **Límite de jugadores** (automático según formato)

#### Gestión de Equipos Existentes
- **Ver detalles**: Información completa del equipo
- **Editar**: Modificar configuración y entrenadores
- **Eliminar**: Remover equipo (con confirmación)

---

## Gestión de Jugadores

### Añadir Jugadores

1. Ir a **"Gestión de Jugadores"**
2. **Seleccionar equipo** del dropdown
3. Hacer clic en **"+ Nuevo Jugador"**
4. Completar información:
   - **Datos personales**: Nombre, apellido, fecha de nacimiento
   - **Información deportiva**: Posición, número de camiseta
   - **Contacto**: Teléfono, email, contacto de emergencia

### Validaciones Automáticas
- **Números únicos**: No se permiten números de camiseta duplicados
- **Límites por formato**: Respeta el máximo de jugadores según el formato del equipo
- **Edad apropiada**: Verifica que la edad esté dentro del rango de la categoría

### Sistema de Invitaciones

#### Invitar Jugadores
1. Hacer clic en **"Invitar Jugador"**
2. Introducir **email del jugador**
3. Seleccionar **rol** (Jugador, Entrenador, etc.)
4. **Enviar invitación**

#### Gestionar Invitaciones
- **Ver pendientes**: Lista de invitaciones sin respuesta
- **Reenviar**: Enviar nuevamente la invitación
- **Cancelar**: Anular invitación pendiente

---

## Eventos y Entrenamientos

### Gestión de Eventos

#### Crear Nuevo Evento
1. Ir a **"Eventos"**
2. Hacer clic en **"+ Nuevo Evento"**
3. Seleccionar **tipo de evento**:
   - **🏃‍♂️ Entrenamiento**: Sesión de práctica
   - **⚽ Partido**: Encuentro competitivo
   - **👥 Reunión**: Junta o charla técnica
   - **🎉 Evento Especial**: Actividades especiales

#### Configurar Evento
- **Información básica**: Título, equipo, fecha, hora, duración
- **Ubicación**: Lugar donde se realizará
- **Detalles específicos**:
  - **Partidos**: Equipo rival, local/visitante
  - **Entrenamientos**: Objetivos, material necesario

### Planificación de Entrenamientos

#### Crear Sesión de Entrenamiento
1. Ir a **"Eventos"** → **"Planificación de Entrenamientos"**
2. **Seleccionar equipo**
3. Hacer clic en **"+ Nueva Sesión"**
4. Configurar:
   - **Información general**: Título, categoría, intensidad
   - **Estructura temporal**: Calentamiento, parte principal, vuelta a la calma
   - **Ejercicios**: Usar sugerencias predefinidas o crear personalizados

#### Categorías de Sesiones
- **⚽ Técnico**: Habilidades individuales con balón
- **🧠 Táctico**: Estrategia y posicionamiento
- **💪 Físico**: Preparación física y resistencia
- **🧘 Psicológico**: Concentración y mentalidad
- **🔄 Mixto**: Combinación de aspectos

#### Ejercicios Predefinidos
La plataforma incluye bibliotecas de ejercicios por categoría:
- **Calentamiento**: Movilidad, activación
- **Técnicos**: Pases, control, regate
- **Tácticos**: Posesión, transiciones
- **Físicos**: Velocidad, resistencia
- **Vuelta a la calma**: Estiramientos, relajación

---

## Estadísticas y Análisis

### Dashboard de Estadísticas

#### Resumen General
- **Métricas del club**: Equipos, jugadores, eventos totales
- **Distribución por equipos**: Rendimiento individual de cada equipo
- **Actividad reciente**: Timeline de eventos y entrenamientos

#### Estadísticas de Jugadores
1. **Seleccionar equipo** para análisis
2. Ver **métricas del equipo**:
   - Número total de jugadores
   - Edad promedio
   - Goles y asistencias totales

#### Rankings y Comparativas
- **Top goleadores**: Jugadores con más goles
- **Más activos**: Jugadores con más partidos y minutos
- **Tabla completa**: Estadísticas detalladas de todos los jugadores

### Métricas Disponibles
- **Partidos jugados**
- **Goles y asistencias**
- **Tarjetas amarillas y rojas**
- **Minutos jugados**
- **Estadísticas por posición**

---

## Action Logger

### Registro en Tiempo Real

El **Action Logger** permite registrar eventos durante partidos en vivo de manera eficiente.

#### Configuración del Partido
1. Ir a **"Action Logger"**
2. **Seleccionar equipo** y **evento/partido**
3. **Configurar minuto actual**
4. Hacer clic en **"🚀 Iniciar Partido"**

#### Tipos de Acciones Disponibles
- **⚽ Gol**: Anotación
- **🎯 Asistencia**: Pase que genera gol
- **🟨 Tarjeta Amarilla**: Amonestación
- **🟥 Tarjeta Roja**: Expulsión
- **🔄 Sustituciones**: Entradas y salidas
- **⚠️ Faltas**: Infracciones
- **📐 Corners**: Tiros de esquina
- **🎯 Tiros Libres**: Faltas a favor
- **🥅 Paradas**: Para porteros

#### Proceso de Registro
1. **Seleccionar tipo de acción**
2. **Hacer clic en el jugador** correspondiente
3. La acción se registra automáticamente con:
   - Minuto actual del partido
   - Timestamp exacto
   - Jugador involucrado

#### Finalización del Partido
1. Hacer clic en **"🏁 Finalizar Partido"**
2. El sistema **procesa automáticamente** todas las acciones
3. **Actualiza estadísticas** de jugadores y equipo
4. **Genera resumen** del partido

### Beneficios del Action Logger
- **Eficiencia**: Registro rápido con pocos toques
- **Precisión**: Captura el minuto exacto de cada acción
- **Automatización**: Cálculo automático de estadísticas
- **Tiempo real**: Viable durante partidos en vivo

---

## Gestión de Roles

### Tipos de Roles

#### 1. Administrador del Club
- **Acceso completo** a todas las funcionalidades
- **Gestión de usuarios** y asignación de roles
- **Configuración del club** y equipos
- **Acceso a todas las estadísticas**

#### 2. Entrenador Principal
- **Gestión del equipo** asignado
- **Planificación de entrenamientos**
- **Registro de eventos** y partidos
- **Estadísticas del equipo**

#### 3. Entrenador Asistente
- **Apoyo en gestión** del equipo
- **Visualización de jugadores**
- **Participación en eventos**
- **Estadísticas limitadas**

#### 4. Jugador
- **Perfil personal**
- **Eventos del equipo**
- **Estadísticas personales**
- **Acceso limitado**

### Gestión de Permisos

#### Asignar Roles
1. Ir a **"Gestión de Roles"**
2. Seleccionar **usuario** de la lista
3. **Cambiar rol** desde el dropdown
4. **Confirmar cambio**

#### Sistema de Invitaciones
1. Hacer clic en **"+ Invitar Usuario"**
2. Introducir **email** y **rol deseado**
3. **Enviar invitación**
4. El usuario recibe email con instrucciones

---

## Solución de Problemas

### Problemas Comunes

#### No puedo añadir más jugadores
**Causa**: Se ha alcanzado el límite según el formato del equipo
**Solución**: 
- Verificar el formato del equipo (5, 7, 8, 9, 11)
- Eliminar jugadores inactivos
- Cambiar formato del equipo si es necesario

#### Error al registrar acciones en Action Logger
**Causa**: Conexión a internet o configuración incorrecta
**Solución**:
- Verificar conexión a internet
- Asegurar que equipo y evento estén seleccionados
- Reiniciar la sesión del Action Logger

#### No aparecen las estadísticas
**Causa**: No se han registrado acciones o partidos
**Solución**:
- Usar Action Logger para registrar partidos
- Verificar que los eventos estén marcados como "partido"
- Esperar procesamiento después de finalizar partidos

#### Problemas de permisos
**Causa**: Rol insuficiente para la acción
**Solución**:
- Contactar al administrador del club
- Verificar rol asignado en perfil
- Solicitar cambio de permisos si es necesario

### Contacto y Soporte

Para problemas técnicos o consultas adicionales:
- **Email de soporte**: [Configurar según necesidades]
- **Documentación técnica**: Disponible en el repositorio
- **Actualizaciones**: Se notificarán automáticamente

---

## Consejos de Uso

### Mejores Prácticas

1. **Configuración inicial completa**: Crear todas las categorías y equipos antes de añadir jugadores
2. **Uso regular del Action Logger**: Registrar todos los partidos para estadísticas precisas
3. **Planificación anticipada**: Crear entrenamientos y eventos con tiempo suficiente
4. **Gestión de roles**: Asignar permisos apropiados según responsabilidades
5. **Backup de datos**: Las estadísticas se guardan automáticamente en la nube

### Optimización del Rendimiento

- **Conexión estable**: Usar WiFi confiable durante partidos
- **Navegador actualizado**: Usar versiones recientes de Chrome, Firefox o Safari
- **Limpieza regular**: Eliminar eventos y jugadores obsoletos
- **Sincronización**: Permitir que la aplicación sincronice datos regularmente

---

*Plataforma Fútbol 2.0*  
*Desarrollado para la gestión profesional de clubes de fútbol*
