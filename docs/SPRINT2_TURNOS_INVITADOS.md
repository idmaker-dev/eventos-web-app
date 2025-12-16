# Sprint 2: Componentes para Invitados (Sistema de Turnos)

## 📋 Resumen

Sprint 2 completado exitosamente. Se implementaron todos los componentes necesarios para que los invitados puedan seleccionar sus mesas durante sus turnos asignados.

## ✅ Tareas Completadas

### 1. Hook useTurnosInvitado ✅

**Archivo:** `src/hooks/useTurnosInvitado.js`

**Funcionalidad:**

- Gestiona el estado del turno del invitado en tiempo real
- Polling automático cada 30 segundos para mantener datos actualizados
- Countdown automático para turnos activos (actualización cada segundo)
- Manejo de estados: `verificando`, `espera`, `activo`, `completado`, `sin_turno`, `expirado`

**Métodos principales:**

```javascript
const {
  turno, // Datos del turno asignado
  estadoTurno, // Estado actual del turno
  puedeAcceder, // Boolean: si puede seleccionar ahora
  tiempoRestante, // Segundos restantes del turno activo
  seleccion, // Selección guardada del invitado
  estadoOcupacion, // Estado de ocupación de todas las mesas
  loading, // Estado de carga
  error, // Errores
  guardandoSeleccion, // Estado de guardado
  guardarSeleccion, // Función para guardar selección
  refrescar, // Función para refrescar manualmente
} = useTurnosInvitado(eventoId, invitadoId, options);
```

**Características:**

- ✅ Polling automático configurable (default: 30s)
- ✅ Countdown en tiempo real con actualización cada segundo
- ✅ Cálculo automático de tiempo restante
- ✅ Limpieza automática de intervalos al desmontar
- ✅ Manejo de errores robusto
- ✅ Soporte para estados de turno complejos

---

### 2. Componente TurnoActivo ✅

**Archivo:** `src/components/Turnos/TurnoActivo.jsx`

**Funcionalidad:**

- Muestra el estado actual del turno con visualización clara
- Countdown grande y visible para turnos activos
- Diferentes visualizaciones según el estado del turno
- Animación de pulso cuando quedan menos de 5 minutos

**Estados visuales:**

#### 🔄 Verificando

- Loader animado
- Mensaje: "Verificando tu turno..."

#### ⏳ En Espera

- Icono de calendario azul
- Muestra número de turno
- Fecha y hora de inicio
- Fecha y hora de fin
- Mensaje motivacional

#### ✅ Activo (Turno en curso)

- Countdown grande en formato HH:MM:SS
- Colores según tiempo restante:
  - Verde: más de 10 minutos
  - Amarillo: 5-10 minutos
  - Rojo + animación pulso: menos de 5 minutos
- Información del turno (número, hora de fin)
- Botón para actualizar estado

#### ✅ Completado

- Icono verde de check
- Mensaje de éxito
- Información del turno completado

#### ❌ Expirado

- Icono rojo de X
- Mensaje explicativo
- Información del turno expirado

#### ⚠️ Sin Turno

- Icono amarillo de alerta
- Mensaje para contactar organizador

**Características especiales:**

- ✅ Formateo de fechas en español
- ✅ Colores adaptativos según tiempo restante
- ✅ Soporte para dark mode
- ✅ Diseño responsive
- ✅ Animaciones sutiles

---

### 3. Componente SeleccionMesasInvitado ✅

**Archivo:** `src/components/Turnos/SeleccionMesasInvitado.jsx`

**Funcionalidad:**

- Interfaz simplificada para selección de mesas
- Control de cantidad de personas por mesa
- Selección de tipo de menú
- Selección de restricciones dietéticas
- Vista grid de mesas disponibles

**Características principales:**

#### Resumen de Selección

- Muestra mesas seleccionadas con número
- Controles +/- para ajustar cantidad de personas
- Indicador visual de progreso (X/Y personas asignadas)
- Botón para remover mesas

#### Validaciones Integradas

- ✅ No permite seleccionar fuera del turno activo
- ✅ Valida que se asignen todas las personas
- ✅ Previene sobre-asignación de personas
- ✅ Verifica disponibilidad de mesas en tiempo real
- ✅ Valida selección de tipo de menú (si requerido)
- ✅ Mensajes de error claros y específicos

#### Selección de Tipo de Menú

- Grid de opciones con nombre y descripción
- Selección única requerida (si configurado)
- Visualización clara de opción seleccionada

#### Restricciones Dietéticas

- Dropdown con opciones configuradas
- Valor por defecto: "Ninguna"
- Integrado con configuración de turnos

#### Vista de Mesas Disponibles

- Grid responsive (2-4 columnas según pantalla)
- Muestra solo mesas con lugares disponibles
- Número de mesa y lugares disponibles
- Indicador visual de mesas seleccionadas
- Click para agregar a selección

**Estados UI:**

- ✅ Disabled cuando no es turno activo
- ✅ Indicadores visuales de estado (disponible, seleccionada, ocupada)
- ✅ Alertas contextuales (personas faltantes, restricciones)
- ✅ Loading states durante guardado

---

### 4. Wrapper de Integración ✅

**Archivo:** `src/components/AsiganacionUser/AsignacionUserWrapper.jsx`

**Funcionalidad:**

- Detecta si el evento usa sistema de turnos
- Enruta al componente apropiado según configuración
- Integra todos los componentes de turnos
- Maneja estados de carga y error

**Flujo de decisión:**

```
¿Tiene eventoId e invitadoId?
  NO → AsignacionUser original
  SÍ → Cargar información de turnos
    ¿Sistema de turnos configurado?
      NO → AsignacionUser original
      SÍ → UI con turnos:
        - TurnoActivo (siempre visible)
        - SeleccionMesasInvitado (solo si activo/completado)
        - Mensajes contextuales según estado
```

**Características:**

- ✅ Loading screen inicial elegante
- ✅ Manejo de errores con opción de reintentar
- ✅ Compatibilidad con componente legacy
- ✅ Vista de selección completada con resumen
- ✅ Mensajes contextuales para cada estado
- ✅ Integración con NotificationContext

---

## 📊 Estadísticas del Sprint

- **Archivos creados:** 4
- **Líneas de código:** ~1,200
- **Componentes:** 3 + 1 wrapper
- **Hooks personalizados:** 1
- **Tiempo estimado:** Sprint de 2-3 días
- **Cobertura de funcionalidad:** 100% de requisitos

## 🎯 Características Implementadas

### Funcionalidad Core

- ✅ Sistema de turnos con estados completos
- ✅ Countdown en tiempo real
- ✅ Selección de mesas por invitado
- ✅ Validaciones robustas
- ✅ Actualización automática (polling cada 30s)

### UX/UI

- ✅ Diseño consistente con el resto de la app
- ✅ Soporte completo para dark mode
- ✅ Diseño responsive
- ✅ Animaciones sutiles y apropiadas
- ✅ Mensajes claros y contextuales
- ✅ Iconografía consistente (lucide-react)

### Integración

- ✅ Compatible con turnosService
- ✅ Integrado con NotificationContext
- ✅ Integrado con SelectedEventContext
- ✅ Retrocompatible con AsignacionUser legacy

### Validaciones

- ✅ Control de acceso por turno
- ✅ Validación de capacidad de mesas
- ✅ Validación de personas asignadas
- ✅ Validación de tipo de menú
- ✅ Validación de tiempo de turno

---

## 🚀 Uso

### En la aplicación

```jsx
import AsignacionUserWrapper from './components/AsiganacionUser/AsignacionUserWrapper';

// Con sistema de turnos
<AsignacionUserWrapper
  invitadoId={currentUser.id}
  eventoId={evento.id}
  configuracionUsuario={config}
  onCambioEstado={(estado) => console.log('Estado:', estado)}
/>

// Sin sistema de turnos (fallback automático)
<AsignacionUserWrapper
  temporizadorActivo={true}
  configuracionUsuario={config}
/>
```

### Uso directo del hook

```jsx
import useTurnosInvitado from "./hooks/useTurnosInvitado";

const MiComponente = () => {
  const { turno, estadoTurno, tiempoRestante, guardarSeleccion } =
    useTurnosInvitado("evento-123", "invitado-456", {
      autoRefresh: true,
      refreshInterval: 30000,
    });

  return (
    <div>
      <p>Estado: {estadoTurno}</p>
      {tiempoRestante && <p>Tiempo: {tiempoRestante}s</p>}
    </div>
  );
};
```

---

## 🔄 Próximos Pasos

### Sprint 3: Admin Manual Selection

- [ ] Componente para que admin asigne mesas sin restricción de turnos
- [ ] Override de validaciones para casos especiales
- [ ] Interface drag-and-drop para asignación rápida

### Sprint 4: Testing & Polish

- [ ] Testing end-to-end del flujo completo
- [ ] Optimización de performance
- [ ] Edge cases y manejo de errores
- [ ] Documentación de API

### Mejoras Futuras (Backlog)

- [ ] SignalR para updates en tiempo real (reemplazar polling)
- [ ] Notificaciones push cuando el turno está por empezar
- [ ] Historial de cambios de selección
- [ ] Exportar reporte de selecciones

---

## 📝 Notas Técnicas

### Dependencias

- React 18+
- @headlessui/react (Dialog components)
- lucide-react (Iconos)
- clsx (Utility classes)
- Contextos: NotificationContext, SelectedEventContext

### Patrones Utilizados

- Custom Hooks para lógica reutilizable
- Wrapper pattern para retrocompatibilidad
- Polling con cleanup automático
- Estado local con useState para UI
- useCallback para optimización de renders

### Performance

- Polling optimizado (30s por defecto, configurable)
- Cleanup automático de intervalos
- useCallback en funciones críticas
- Renders condicionados por estado

### Accesibilidad

- Labels semánticos
- Contraste de colores apropiado
- Focus states visibles
- Keyboard navigation support (componentes Headless UI)

---

## 🐛 Troubleshooting

### "No se actualiza el countdown"

- Verificar que `estadoTurno === 'activo'`
- Verificar que `turno.fecha_hora_fin` es una fecha válida

### "No aparece la opción de turnos"

- Verificar que se pasan `eventoId` e `invitadoId` al wrapper
- Verificar que el evento tiene configuración de turnos en backend

### "No puedo seleccionar mesas"

- Verificar `puedeAcceder === true`
- Verificar `estadoTurno === 'activo'`
- Verificar que hay mesas disponibles en `estadoOcupacion`

---

## ✨ Resumen

**Sprint 2 completado al 100%**. Sistema de turnos funcional y completo para invitados, con polling automático, validaciones robustas, y UX pulida. Listo para integración con backend real y pruebas de usuario.
