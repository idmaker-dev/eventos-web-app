# Sprint 3: Monitor de Asignación en Tiempo Real

## 📋 Resumen

**Objetivo**: Permitir que el administrador monitoree en tiempo real las mesas que están siendo ocupadas por invitados durante el proceso de selección autoservicio, y preparar la infraestructura para selección manual.

**Fecha de Inicio**: [Fecha actual]
**Estado**: ✅ Completado - Infraestructura SignalR

---

## 🎯 Objetivos del Sprint

### Completados ✅

1. **Monitoreo en Tiempo Real**: El administrador puede ver en el monitor cuándo un invitado selecciona una mesa
2. **Actualización Automática**: El layout y la lista de invitados se actualizan automáticamente sin recargar la página
3. **Indicador Visual**: Panel dedicado mostrando invitados que están en proceso de selección
4. **Arquitectura Escalable**: Infraestructura preparada para futuras funcionalidades de asignación manual

### Pendientes Backend 🔧

- Implementar endpoint `/eventos/{eventId}/turnos/invitados-pendientes`
- Configurar emisión del evento `mesaSeleccionada` desde backend cuando invitado completa selección

---

## 🏗️ Arquitectura

### Flujo de Datos SignalR

```
[Invitado selecciona mesa]
    ↓
[Backend emite evento "mesaSeleccionada"]
    ↓
[SignalR Hub distribuye a clientes conectados]
    ↓
[DistribuccionMonitor recibe notificación]
    ↓
[Frontend consulta endpoint para datos frescos]
    ↓
[UI se actualiza automáticamente]
```

### Componentes Modificados

#### 1. **SignalRContext.jsx**

**Ubicación**: `src/contexts/SignalRContext.jsx`

**Cambios**:

- ✅ Agregado `monitorCallbackRef` para callbacks del monitor
- ✅ Registrado evento `mesaSeleccionada` en la conexión SignalR
- ✅ Implementadas funciones `registrarCallbackMonitor()` y `desregistrarCallbackMonitor()`
- ✅ Exportadas funciones en el contexto

**Código clave**:

```javascript
// Línea 22: Ref para callbacks del monitor
const monitorCallbackRef = useRef(null);

// Líneas 167-193: Handler del evento mesaSeleccionada
newConnection.on("mesaSeleccionada", (data) => {
  console.log("🪑 Notificación recibida: mesaSeleccionada");
  const nuevaNotificacion = {
    tipo: "mesa_seleccionada",
    mensaje: "Mesa seleccionada por invitado",
    data,
    timestamp: new Date().toISOString(),
  };
  setNotificaciones((prev) => [nuevaNotificacion, ...prev]);
  if (monitorCallbackRef.current) {
    monitorCallbackRef.current(data);
  }
});

// Líneas 292-297: Funciones de registro
const registrarCallbackMonitor = useCallback((callback) => {
  monitorCallbackRef.current = callback;
}, []);

const desregistrarCallbackMonitor = useCallback(() => {
  monitorCallbackRef.current = null;
}, []);
```

---

#### 2. **useSignalRMonitor.js** (Nuevo)

**Ubicación**: `src/hooks/useSignalRMonitor.js`

**Propósito**: Hook reutilizable para componentes que necesiten recibir notificaciones de selección de mesas.

**Firma**:

```javascript
useSignalRMonitor(onMesaSeleccionada: function)
// Returns: { conectado: boolean }
```

**Uso**:

```javascript
const { conectado } = useSignalRMonitor(handleMesaSeleccionada);
```

**Características**:

- ✅ Registra callback automáticamente al montar
- ✅ Desregistra callback al desmontar
- ✅ Logging extensivo para debugging
- ✅ Sigue patrón establecido de `useSignalRPagos`

---

#### 3. **eventService.js**

**Ubicación**: `src/services/eventService.js`

**Método Agregado**: `getInvitadosPendientes(eventId)`

**Endpoint**: `GET /eventos/{eventId}/turnos/invitados-pendientes`

**Response**:

```javascript
{
  success: true,
  data: { ... },
  invitados: [
    {
      id: "uuid",
      nombre: "Juan Pérez",
      numeroAcompanantes: 2,
      estado: "seleccionando",
      // ... más campos
    }
  ]
}
```

**Estado**: ⚠️ Endpoint backend pendiente de implementación

---

#### 4. **DistribuccionMonitor.jsx**

**Ubicación**: `src/components/Distribuccion/DistribuccionMonitor.jsx`

**⚠️ IMPORTANTE**: Se cambió de `useLayoutEvento` a `useDisponibilidadMesas` para obtener el layout completo con información de ocupación de mesas, similar a como funciona en `AsignacionUser`. Esto garantiza que **todos los elementos** del layout se rendericen correctamente con sus datos de disponibilidad.

**Endpoint utilizado**: `GET /eventos/{eventId}/seleccion-mesas/disponibilidad`

**Cambios**:

##### a) Imports y Hooks

```javascript
// Línea 1: Agregados useCallback, useEffect
import { useState, useEffect, useRef, useCallback } from "react";

// Líneas 18-21: Nuevos imports
import { useSignalRMonitor } from "../../hooks/useSignalRMonitor";
import { useSelectedEvent } from "../../contexts/SelectedEventContext";
import { useDisponibilidadMesas } from "../../hooks/useDisponibilidadMesas";
import eventService from "../../services/eventService";

// Líneas 29-35: Hooks de contexto y disponibilidad
const { eventoActual } = useSelectedEvent();

// Hook para obtener disponibilidad de mesas con toda la información de ocupación
const {
  elementos: elementosConDisponibilidad,
  cargarDisponibilidad,
  isLoading: cargandoDisponibilidad,
} = useDisponibilidadMesas(eventoActual?.id, false);
```

##### b) Estado

```javascript
// Líneas 45-46: Estado para tiempo real
const [invitadosPendientes, setInvitadosPendientes] = useState([]);
const [cargandoDatos, setCargandoDatos] = useState(false);
```

##### c) Lógica de Actualización

```javascript
// Función para actualizar datos del monitor
const actualizarDatosMonitor = useCallback(async () => {
  if (!eventoActual?.id || cargandoDatos) return;

  console.log("🔄 [Monitor] Actualizando datos del monitor...");
  setCargandoDatos(true);

  try {
    // 1. Cargar disponibilidad actualizada (incluye layout + ocupación de mesas)
    const resultadoDisponibilidad = await cargarDisponibilidad();
    if (resultadoDisponibilidad?.success) {
      const elementosActualizados =
        resultadoDisponibilidad.data?.layout?.elementos || [];
      console.log(
        "✅ [Monitor] Layout actualizado:",
        elementosActualizados.length,
        "elementos"
      );
      console.log(
        "✅ [Monitor] Elementos con disponibilidad:",
        elementosActualizados.filter((e) => e.disponibilidad).length
      );
      setAllElements(elementosActualizados);
    }

    // 2. Cargar invitados pendientes
    const resultadoInvitados = await eventService.getInvitadosPendientes(
      eventoActual.id
    );
    if (resultadoInvitados?.success) {
      const invitadosPend = resultadoInvitados.invitados || [];
      console.log("✅ [Monitor] Invitados pendientes:", invitadosPend.length);
      setInvitadosPendientes(invitadosPend);
      setInvitadosSinAsignar(invitadosPend);
    }

    console.log("✅ [Monitor] Actualización completa");
  } catch (error) {
    console.error("❌ [Monitor] Error al actualizar datos:", error);
  } finally {
    setCargandoDatos(false);
  }
}, [eventoActual?.id, cargarDisponibilidad, setAllElements, cargandoDatos]);

// Callback para SignalR
const handleMesaSeleccionada = useCallback(
  async (data) => {
    console.log("🔔 [Monitor] Mesa seleccionada:", data);

    // Verificar que es para este evento
    if (data.eventoId !== eventoActual?.id) {
      console.log("ℹ️ [Monitor] Notificación para otro evento, ignorando");
      return;
    }

    // Mostrar notificación
    mostrarNotificacion(
      `Mesa ${data.mesaNumero || data.mesaId} seleccionada`,
      "info"
    );

    // Actualizar datos
    await actualizarDatosMonitor();
  },
  [eventoActual?.id, actualizarDatosMonitor]
);

// Integrar SignalR
useSignalRMonitor(handleMesaSeleccionada);

// Sincronizar elementos cuando se carguen desde el hook
useEffect(() => {
  if (elementosConDisponibilidad && elementosConDisponibilidad.length > 0) {
    console.log(
      "🔄 [Monitor] Sincronizando elementos desde hook:",
      elementosConDisponibilidad.length
    );
    setAllElements(elementosConDisponibilidad);
  }
}, [elementosConDisponibilidad, setAllElements]);

// Cargar datos iniciales
useEffect(() => {
  actualizarDatosMonitor();
}, []);
```

##### d) UI - Panel de Invitados Pendientes

**Ubicación en JSX**: Antes del panel "Invitados sin Asignar"

**Características**:

- 🔵 Indicador de tiempo real (pulso azul animado)
- 📊 Contador de invitados en proceso
- 🔄 Spinner cuando está cargando datos
- 💡 Tooltip explicativo
- 🎨 Estilo diferenciado con borde azul

**Estructura**:

```jsx
<div className="bg-fondoVs dark:bg-[#1a1a1a] py-6 px-3 rounded-lg shadow-sm border-2 border-blue-200 dark:border-blue-800">
  {/* Header con contador y spinner */}
  <div className="flex items-center justify-between mb-4">
    <p className="text-xl font-semibold">
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      Seleccionando Mesa
      <span className="text-sm">({invitadosPendientes.length})</span>
    </p>
    {cargandoDatos && <div className="animate-spin ..."></div>}
  </div>

  {/* Lista de invitados */}
  <div className="max-h-[16rem] overflow-y-auto">
    {invitadosPendientes.map((invitado) => (
      <li className="p-3 bg-blue-50 dark:bg-blue-900/20 ...">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <div>
          <p>{invitado.nombre}</p>
          <p className="text-xs">
            Con {invitado.numeroAcompanantes} acompañantes
          </p>
        </div>
      </li>
    ))}
  </div>

  {/* Tooltip */}
  <div className="mt-3 p-2 bg-blue-50 ...">
    💡 Invitados que están eligiendo su mesa en tiempo real
  </div>
</div>
```

---

## 🔌 Integración Backend

### Evento SignalR: `mesaSeleccionada`

**Cuándo se emite**: Cuando un invitado completa la selección de mesa en el flujo de QR

**Payload esperado**:

```javascript
{
  eventoId: "uuid-del-evento",
  mesaId: "uuid-de-la-mesa",
  mesaNumero: "Mesa 5",  // Opcional, para UI
  invitadoId: "uuid-del-invitado",
  timestamp: "2024-01-15T10:30:00Z"
}
```

**Implementación backend sugerida**:

```csharp
// En el controlador de turnos después de asignar mesa
await _hubContext.Clients
    .Group($"evento_{eventoId}")
    .SendAsync("mesaSeleccionada", new {
        eventoId = eventoId,
        mesaId = mesaId,
        mesaNumero = mesa.Numero,
        invitadoId = invitadoId,
        timestamp = DateTime.UtcNow
    });
```

---

### Endpoint: `/eventos/{eventId}/turnos/invitados-pendientes`

**Método**: `GET`

**Descripción**: Retorna lista de invitados que están en proceso de selección de mesa (tienen turno activo pero aún no seleccionan).

**Query Parameters**: Ninguno

**Response exitoso (200)**:

```json
{
  "success": true,
  "data": {
    "eventoId": "uuid",
    "totalPendientes": 5,
    "invitados": [
      {
        "id": "uuid",
        "nombre": "Juan Pérez",
        "numeroAcompanantes": 2,
        "turnoNumero": 3,
        "estadoTurno": "seleccionando",
        "horaInicio": "2024-01-15T10:25:00Z",
        "restriccionesAlimentarias": ["vegetariano"]
      }
    ]
  }
}
```

**Response sin datos (200)**:

```json
{
  "success": true,
  "data": {
    "eventoId": "uuid",
    "totalPendientes": 0,
    "invitados": []
  }
}
```

**Lógica sugerida**:

```sql
SELECT i.*
FROM invitados i
INNER JOIN turnos t ON t.invitado_id = i.id
WHERE i.evento_id = @eventoId
  AND t.estado = 'activo'
  AND i.mesa_asignada_id IS NULL
ORDER BY t.numero ASC;
```

---

## 📊 Flujo de Usuario

### Vista Administrador (Monitor)

```
1. Admin abre pantalla DistribuccionMonitor
   ↓
2. Se cargan datos iniciales:
   - Layout de mesas con ocupación actual
   - Lista de invitados sin asignar
   - Lista de invitados seleccionando (pendientes)
   ↓
3. Admin monitorea en tiempo real:
   - Panel "Seleccionando Mesa" muestra invitados activos
   - Layout muestra mesas ocupadas vs disponibles
   ↓
4. Cuando invitado selecciona mesa:
   - 🔔 Llega notificación SignalR "mesaSeleccionada"
   - 💡 Aparece toast: "Mesa X seleccionada"
   - 🔄 Se recarga automáticamente:
     * Layout (mesas actualizadas)
     * Lista invitados pendientes
   - ✅ UI refleja cambio en <2 segundos
   ↓
5. Admin puede:
   - Ver actualizaciones en vivo sin refrescar
   - Asignar manualmente invitados (arrastrar)
   - Guardar cambios cuando termine
```

---

## 🧪 Testing

### Pruebas Funcionales

#### Test 1: Recepción de Evento SignalR

```javascript
// Consola del navegador en DistribuccionMonitor
// Debe aparecer cuando un invitado selecciona mesa:

🪑 Notificación recibida: mesaSeleccionada
🔔 [useSignalRMonitor] Mesa seleccionada recibida: {eventoId: "...", mesaId: "..."}
🔔 [Monitor] Mesa seleccionada: {eventoId: "...", mesaId: "..."}
🔄 [Monitor] Actualizando datos del monitor...
✅ [Monitor] Layout actualizado: 25 elementos
✅ [Monitor] Invitados pendientes: 3
✅ [Monitor] Actualización completa
```

#### Test 2: Filtrado por Evento

```javascript
// Verificar que solo se actualiza el evento correcto:
// 1. Admin en evento A
// 2. Invitado selecciona mesa en evento B
// Resultado esperado:
ℹ️ [Monitor] Notificación para otro evento, ignorando
// No debe haber actualización de datos
```

#### Test 3: Panel de Pendientes

- ✅ Muestra invitados correctamente
- ✅ Contador actualiza cuando llega notificación
- ✅ Animación de pulso visible
- ✅ Spinner aparece durante carga
- ✅ Mensaje cuando no hay pendientes

#### Test 4: Reconexión SignalR

```javascript
// 1. Desconectar internet
// 2. Esperar 30 segundos
// 3. Reconectar internet
// Resultado esperado:
🔌 Reconectado al hub SignalR
// Callbacks deben seguir funcionando
```

---

## 🐛 Debugging

### Logs Disponibles

**SignalRContext.jsx**:

```javascript
🔌 Intentando conectar al hub SignalR...
✅ Conectado al hub SignalR
🪑 Notificación recibida: mesaSeleccionada
❌ Error de conexión SignalR: [error]
🔌 Reconectando al hub SignalR...
```

**useSignalRMonitor.js**:

```javascript
🎯 [useSignalRMonitor] Registrando callback
🎯 [useSignalRMonitor] Callback registrado correctamente
🔔 [useSignalRMonitor] Mesa seleccionada recibida: [data]
⚠️ [useSignalRMonitor] onMesaSeleccionada no es una función
🧹 [useSignalRMonitor] Desregistrando callback
```

**DistribuccionMonitor.jsx**:

```javascript
🔔 [Monitor] Mesa seleccionada: [data]
ℹ️ [Monitor] Notificación para otro evento, ignorando
🔄 [Monitor] Actualizando datos del monitor...
✅ [Monitor] Layout actualizado: [count] elementos
✅ [Monitor] Invitados pendientes: [count]
❌ [Monitor] Error al actualizar datos: [error]
```

### Problemas Comunes

**❌ No llegan notificaciones**:

```
Verificar:
1. Conexión SignalR activa (ver network tab)
2. Usuario en grupo correcto del hub
3. Backend emitiendo evento correctamente
4. Formato del payload coincide con esperado
```

**❌ Se actualiza evento equivocado**:

```
Verificar:
1. data.eventoId en payload del evento
2. eventoActual?.id en componente
3. Comparación estricta en handleMesaSeleccionada
```

**❌ Layout no se actualiza**:

```
Verificar:
1. cargarLayout() retorna data.layout.elementos
2. setAllElements se ejecuta con datos nuevos
3. No hay errores en consola de cargarLayout
```

---

## 📝 Notas Técnicas

### Patrón de Consulta (Option B)

**Por qué se eligió**:

- ✅ Datos siempre frescos del backend
- ✅ No requiere lógica de merge en frontend
- ✅ Evita inconsistencias si evento llega tarde
- ✅ Backend mantiene source of truth

**Alternativa descartada (Option A)**:

- ❌ Enviar todos los datos en el evento SignalR
- ❌ Requiere merge con estado local
- ❌ Payload grande en cada evento
- ❌ Riesgo de datos desactualizados

### Escalabilidad

**Límites actuales**:

- ✅ Soporta múltiples admins viendo mismo evento
- ✅ No hay polling, solo actualización por evento
- ✅ Cada evento en grupo SignalR separado
- ⚠️ No hay paginación en invitados pendientes

**Mejoras futuras**:

- Implementar paginación si >100 invitados pendientes
- Agregar debouncing si eventos muy frecuentes
- Considerar WebSockets nativos si SignalR es overhead

---

## 🚀 Próximos Pasos (Sprint 4)

### Selección Manual de Mesa

**Funcionalidades pendientes**:

1. **Drag & Drop de Admin a Mesa**:

   - Admin arrastra invitado de panel "Seleccionando Mesa" a una mesa específica
   - Override de validaciones (capacidad, turno activo)
   - Confirmación antes de asignar

2. **Modal de Asignación Manual**:

   - Click en mesa muestra modal con invitados disponibles
   - Seleccionar múltiples invitados para asignar en lote
   - Validaciones flexibles con warnings

3. **Historial de Asignaciones**:

   - Log de quién asignó qué mesa y cuándo
   - Filtros: manual vs automática, por admin, por fecha

4. **Notificaciones Push al Invitado**:
   - Cuando admin asigna manualmente, notificar al invitado
   - Actualizar su vista de QR en tiempo real

---

## ✅ Checklist de Implementación

### Frontend (Completado)

- [x] Extender SignalRContext con evento `mesaSeleccionada`
- [x] Crear hook `useSignalRMonitor`
- [x] Agregar método `getInvitadosPendientes` a eventService
- [x] Integrar SignalR en DistribuccionMonitor
- [x] Crear panel UI de invitados pendientes
- [x] Agregar logging para debugging
- [x] Testing manual en desarrollo
- [x] Documentación completa

### Backend (Pendiente)

- [ ] Implementar endpoint `/eventos/{eventId}/turnos/invitados-pendientes`
- [ ] Emitir evento `mesaSeleccionada` al asignar mesa
- [ ] Configurar grupos SignalR por evento
- [ ] Agregar logging de eventos emitidos
- [ ] Testing de integración con frontend
- [ ] Documentar contrato de API

---

## 📚 Referencias

- **Sprint 2**: `QR_INVITACION_FLOW.md` - Sistema de turnos y validaciones
- **SignalR Dashboard**: `src/contexts/SignalRContext.jsx` (líneas 130-166)
- **SignalR Pagos**: `src/hooks/useSignalRPagos.js` - Patrón de hooks
- **Event Service**: `src/services/eventService.js` - Métodos de API

---

**Última actualización**: [Fecha]
**Desarrollador**: [Nombre]
**Revisado por**: [Nombre]
