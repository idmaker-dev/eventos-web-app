# Integración de Turnos con Datos Reales

## 📋 Resumen

Se ha completado la integración del sistema de turnos con datos reales del usuario autenticado y el evento seleccionado. El sistema ahora carga:

- ✅ **ID del usuario autenticado** usando `useAuth()`
- ✅ **Evento seleccionado** usando `useSelectedEvent()`
- ✅ **Layout del evento** con todas las mesas configuradas usando `useLayoutEvento()`
- ✅ **Turno del invitado** desde el backend usando `useTurnosInvitado()`

---

## 🔧 Cambios Realizados

### 1. **AsignacionUser.jsx** (Página Principal)

#### Hooks Agregados:

```javascript
import { useAuth } from "../hooks/useAuth";
import { useSelectedEvent } from "../contexts/SelectedEventContext";
import { useLayoutEvento } from "../hooks/useLayoutEvento";

// En el componente:
const { user, isAuthenticated } = useAuth();
const { eventoActual } = useSelectedEvent();
const eventoId = eventoActual?.id;

const {
  layout: layoutEvento,
  elementos: elementosLayout,
  isLoading: loadingLayout,
} = useLayoutEvento(eventoId);
```

#### Validaciones Agregadas:

- Verificar que el usuario esté autenticado
- Verificar que haya un evento seleccionado
- Mostrar mensajes apropiados si falta alguno

#### Props Actualizadas:

```javascript
<AsignacionUserWrapper
  invitadoId={user.id} // ✅ ID real del usuario
  eventoId={eventoId} // ✅ ID real del evento
  layoutEvento={layoutEvento} // ✅ Layout completo
  elementosLayout={elementosLayout} // ✅ Mesas configuradas
  loadingLayout={loadingLayout} // ✅ Estado de carga
  configuracionUsuario={{
    cantidadPersonas: 4, // TODO: Obtener del invitado
    necesidadesEspeciales: false, // TODO: Obtener del invitado
  }}
  onCambioEstado={manejarCambio}
/>
```

---

### 2. **AsignacionUserWrapper.jsx** (Componente Integrador)

#### Props Agregadas:

```javascript
export default function AsignacionUserWrapper({
  // ... props existentes
  layoutEvento,        // Layout del evento
  elementosLayout,     // Elementos (mesas, etc.)
  loadingLayout,       // Estado de carga del layout
}) {
```

#### Propagación al Hijo:

```javascript
<SeleccionMesasInvitado
  // ... props existentes
  layoutEvento={layoutEvento}
  elementosLayout={elementosLayout}
  loadingLayout={loadingLayout}
  // ...
/>
```

---

### 3. **SeleccionMesasInvitado.jsx** (Componente de Selección)

#### Props Agregadas:

```javascript
export default function SeleccionMesasInvitado({
  // ... props existentes
  layoutEvento,        // Layout del evento
  elementosLayout,     // Elementos del layout
  loadingLayout,       // Estado de carga
}) {
```

#### Vista de Mesas Actualizada:

**Antes** (simulado):

```javascript
{estadoOcupacion.mesas.map(mesa => (...))}
```

**Ahora** (datos reales):

```javascript
{
  elementosLayout
    .filter(
      (el) => (el.type === "mesa" || el.type === "mesaRectangular") && el.numero
    )
    .sort((a, b) => (a.numero || 0) - (b.numero || 0))
    .map((mesa) => {
      const estadoMesa = estadoOcupacion?.mesas?.find(
        (m) => m.numero === mesa.numero
      );
      const lugaresDisponibles =
        estadoMesa?.lugares_disponibles || mesa.capacidad || 0;

      return (
        <button
          onClick={() =>
            handleSeleccionarMesa({
              id: mesa.id,
              numero: mesa.numero,
              capacidad: mesa.capacidad,
              lugares_disponibles: lugaresDisponibles,
            })
          }
        >
          {/* ... */}
        </button>
      );
    });
}
```

#### Mejoras Visuales:

- Muestra capacidad de cada mesa
- Indica mesas no disponibles
- Ordena mesas por número
- Distingue entre mesas redondas y rectangulares

---

## 🎯 Flujo de Datos Completo

```
1. Usuario autenticado (useAuth)
   └─> user.id

2. Evento seleccionado (useSelectedEvent)
   └─> eventoActual.id

3. Layout del evento (useLayoutEvento)
   └─> layoutEvento.elementos (mesas configuradas)

4. Turno del invitado (useTurnosInvitado)
   └─> turno.fecha_hora_inicio, turno.fecha_hora_fin

5. Estado de ocupación (turnosService.obtenerEstadoOcupacion)
   └─> mesas[].lugares_disponibles

6. Selección (SeleccionMesasInvitado)
   └─> Combina: elementos + ocupación + turno
```

---

## 📊 Estructura de Datos

### Elemento de Mesa (del Layout):

```javascript
{
  id: "mesa-123",
  type: "mesa", // o "mesaRectangular"
  numero: 5,
  capacidad: 8,
  x: 100,
  y: 200,
  rotation: 0,
  sillas: [...],
  // ... otros atributos visuales
}
```

### Estado de Mesa (del Backend):

```javascript
{
  id: "mesa-id",
  numero: 5,
  capacidad_total: 8,
  lugares_ocupados: 3,
  lugares_disponibles: 5,
  invitados_asignados: [...]
}
```

### Combinación en UI:

```javascript
{
  id: mesa.id,          // Del layout
  numero: mesa.numero,  // Del layout
  capacidad: mesa.capacidad, // Del layout
  lugares_disponibles: estadoMesa?.lugares_disponibles || mesa.capacidad
}
```

---

## 🔄 Estados de Carga

### AsignacionUser.jsx:

```javascript
if (!isAuthenticated || !user?.id) {
  return <mensaje de "debes iniciar sesión">;
}

if (!eventoId) {
  return <mensaje de "no hay evento seleccionado">;
}

// Continúa normalmente
```

### SeleccionMesasInvitado.jsx:

```javascript
{loadingLayout ? (
  <Loader />
) : !elementosLayout || elementosLayout.length === 0 ? (
  <mensaje de "no hay mesas configuradas">
) : (
  <grid de mesas>
)}
```

---

## ✅ Validaciones Implementadas

1. **Usuario Autenticado**: Verifica `isAuthenticated` y `user.id`
2. **Evento Seleccionado**: Verifica `eventoActual?.id`
3. **Layout Cargado**: Verifica `elementosLayout.length > 0`
4. **Mesa Disponible**: Verifica `lugares_disponibles > 0`
5. **Turno Activo**: Verifica `estadoTurno === 'activo'`

---

## 🧪 Cómo Probar

### 1. Iniciar Sesión:

- Ve a `/login`
- Inicia sesión con credenciales válidas
- Verifica que `user.id` esté presente en localStorage

### 2. Seleccionar Evento:

- Ve al Dashboard o Home
- Selecciona un evento activo
- Verifica que `eventoActual` esté en contexto

### 3. Ir a Asignación:

- Navega a `/asignacion-user`
- Debería cargar:
  - Tu turno desde el backend
  - Las mesas del layout del evento
  - Estado de ocupación en tiempo real

### 4. Verificar Consola:

```javascript
// Deberías ver logs como:
console.log("🔍 User:", user);
console.log("🎟️ Evento:", eventoActual);
console.log("📐 Layout:", layoutEvento);
console.log("🪑 Elementos:", elementosLayout);
console.log("⏰ Turno:", turno);
```

---

## 🐛 Troubleshooting

### Problema: "Debes iniciar sesión"

**Causa**: Usuario no autenticado  
**Solución**: Hacer login primero

### Problema: "No hay evento seleccionado"

**Causa**: No hay evento en contexto  
**Solución**: Seleccionar evento desde Dashboard

### Problema: "No hay mesas configuradas"

**Causa**: El evento no tiene layout asignado  
**Solución**: Ir a `/asignacion` y configurar layout primero

### Problema: "No tienes turno asignado"

**Causa**: Backend no ha generado turnos  
**Solución**: Usar el botón "Generar Turnos Ahora" en el modal de configuración

---

## 📝 TODOs Pendientes

### 1. Obtener Cantidad de Personas del Invitado:

```javascript
// En AsignacionUser.jsx
const { invitado } = useInvitado(user.id, eventoId); // Crear hook

configuracionUsuario={{
  cantidadPersonas: invitado?.cantidad_personas || 1,
  necesidadesEspeciales: invitado?.necesidades_especiales || false
}}
```

### 2. Sincronizar con Backend:

- Verificar que los IDs de mesas del layout coincidan con el backend
- Asegurar que `mesa.numero` sea único
- Validar estructura de respuesta de `estadoOcupacion`

### 3. Mejorar UX:

- Mostrar preview visual del layout (canvas)
- Destacar mesas cercanas a necesidades especiales
- Filtrar mesas por capacidad
- Agregar búsqueda de mesas

---

## 🎨 Próximas Mejoras

1. **Vista de Plano**: Mostrar layout completo con mesas coloreadas según disponibilidad
2. **Reserva Temporal**: Bloquear mesas mientras el usuario decide
3. **Recomendaciones**: Sugerir mesas basadas en preferencias
4. **Historial**: Mostrar selecciones anteriores si el usuario regresa

---

## 📚 Referencias

- **useAuth**: `src/hooks/useAuth.js`
- **useSelectedEvent**: `src/contexts/SelectedEventContext.jsx`
- **useLayoutEvento**: `src/hooks/useLayoutEvento.js`
- **useTurnosInvitado**: `src/hooks/useTurnosInvitado.js`
- **turnosService**: `src/services/turnosService.js`

---

✅ **Sistema completamente integrado con datos reales**
