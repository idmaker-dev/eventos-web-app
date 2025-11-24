# Bloqueo y Desbloqueo de Mesas desde el Monitor

## 📋 Descripción General

Se ha implementado la funcionalidad completa para **bloquear y desbloquear mesas** desde el Monitor de Asignación en tiempo real. Esta característica permite a los administradores del evento controlar qué mesas están disponibles para la selección de invitados.

## 🎯 Características Implementadas

### 1. **Indicador Visual de Mesas Bloqueadas**

- **Overlay rojo translúcido** sobre las mesas bloqueadas con texto "🔒 BLOQUEADA"
- **Icono de candado** en la esquina superior derecha de las mesas bloqueadas
- **Tooltip** mostrando el motivo del bloqueo al pasar el cursor
- **Contador en el header** mostrando el número total de mesas bloqueadas

### 2. **Botones de Bloqueo/Desbloqueo**

- **Botón flotante** visible al hacer hover sobre las mesas
- **Color dinámico**:
  - 🔴 Rojo: Para bloquear mesas disponibles
  - 🟢 Verde: Para desbloquear mesas bloqueadas
- Funciona tanto en **mesas circulares** como **rectangulares**

### 3. **Modal de Confirmación**

Al hacer clic en el botón de bloqueo/desbloqueo, se abre un modal que:

#### Para Bloquear:

- Solicita un **motivo obligatorio** del bloqueo
- Ejemplos: "Reservada para VIP", "Mesa dañada", "Zona VIP", etc.
- Validación: No permite bloquear sin motivo

#### Para Desbloquear:

- Muestra el **motivo actual** del bloqueo
- Confirma si se desea desbloquear la mesa
- No requiere información adicional

### 4. **Notificaciones en Tiempo Real**

- **Notificaciones visuales** al bloquear/desbloquear exitosamente
- **Actualización automática** del plano del salón
- **Integración con SignalR** para notificar a todos los monitores conectados

## 🔧 Implementación Técnica

### Endpoints Utilizados

#### Bloqueo/Desbloqueo:

```
POST /api/v1/eventos/{eventoId}/seleccion-mesas/bloquear-mesa
```

**Request Body:**

```json
{
  "mesa_id": "mesa-165",
  "bloqueada": true, // false para desbloquear
  "motivo": "Reservada para VIP" // opcional al desbloquear
}
```

#### Disponibilidad (incluye info de bloqueo):

```
GET /api/v1/eventos/{eventoId}/seleccion-mesas/disponibilidad-mesas
```

**Response incluye:**

```json
{
  "elemento": {
    "bloqueada": true,
    "motivo_bloqueo": "Reservada para VIP",
    "disponibilidad": {
      "esta_bloqueada": true,
      "motivo_bloqueo": "Reservada para VIP"
    }
  },
  "mesas_bloqueadas": [...],
  "estadisticas": {
    "mesas_bloqueadas": 8
  }
}
```

### Archivos Modificados

#### 1. **eventService.js**

```javascript
async bloquearMesa(eventId, mesaId, bloqueada, motivo = "")
```

Nuevo método que gestiona las peticiones de bloqueo/desbloqueo.

#### 2. **DistribuccionMonitor.jsx** (Gestión Admin)

- Estados para el modal de bloqueo: `showBloqueoModal`, `mesaParaBloqueo`, `motivoBloqueo`, `procesandoBloqueo`
- Función `abrirModalBloqueo()`: Abre el modal con la información de la mesa
- Función `confirmarBloqueoMesa()`: Ejecuta la petición al backend y actualiza el monitor
- Renderizado visual con overlays e indicadores para mesas bloqueadas
- Validación para prevenir drag & drop a mesas bloqueadas

#### 3. **AsignacionUser.jsx** (Interfaz Usuario)

- Validación en `seleccionarMesa()`: Rechaza selección de mesas bloqueadas (líneas 371-396)
- Visual overlay en `MesaInteractiva`: Overlay rojo con "🔒 BLOQUEADA" (líneas 839-851)
- Visual overlay en `MesaRectangularInteractiva`: Mismo overlay para mesas rectangulares (líneas 951-964)
- Filtro en `obtenerSugerenciasMesas()`: Excluye mesas bloqueadas de sugerencias (línea 1171)
- Leyenda actualizada: Incluye indicador visual para mesas bloqueadas (líneas 1579-1586)

**Lógica de detección de bloqueo:**

```javascript
const mesaBloqueada =
  element.disponibilidad?.esta_bloqueada ||
  element.disponibilidad?.bloqueada ||
  element.bloqueada;
```

#### 4. **SignalRContext.jsx**

- Nuevo evento `mesaBloqueada` para notificaciones en tiempo real
- Reutiliza el callback de monitor para actualizar todos los monitores conectados

#### 5. **useSignalRMonitor.js** (No requirió cambios)

- Ya estaba preparado para manejar cualquier callback del monitor
- Funciona tanto para selección de mesas como para bloqueos

## 🎨 Diseño Visual

### Mesa Bloqueada

```
┌──────────────────────────┐
│   [🔒]                   │  ← Icono en esquina
│                          │
│   🔒 BLOQUEADA           │  ← Overlay central
│      (badge)             │
│                          │
│          [🟢]            │  ← Botón desbloquear (hover)
└──────────────────────────┘
```

### Mesa Disponible (Hover)

```
┌──────────────────────────┐
│                          │
│    Mesa Normal           │
│                          │
│          [🔴]            │  ← Botón bloquear (hover)
└──────────────────────────┘
```

## 📊 Flujo de Uso

### Bloquear Mesa:

1. Usuario hace hover sobre una mesa disponible
2. Aparece el botón rojo 🔴 en la esquina inferior derecha
3. Click en el botón → Modal de bloqueo
4. Ingresar motivo obligatorio
5. Confirmar → Mesa bloqueada
6. Notificación de éxito
7. Actualización automática del plano

### Desbloquear Mesa:

1. Mesa bloqueada muestra overlay rojo con "🔒 BLOQUEADA"
2. Hacer hover → Aparece botón verde 🟢
3. Click en el botón → Modal de desbloqueo
4. Muestra motivo actual del bloqueo
5. Confirmar → Mesa desbloqueada
6. Notificación de éxito
7. Actualización automática del plano

## 🔔 Notificaciones SignalR

El sistema envía notificaciones en tiempo real cuando:

- ✅ Una mesa es **bloqueada**
- ✅ Una mesa es **desbloqueada**
- ✅ Un invitado **selecciona** una mesa

Formato de notificación de bloqueo:

```javascript
{
  tipo: 'mesa_bloqueada',
  mensaje: 'Mesa bloqueada' | 'Mesa desbloqueada',
  data: {
    eventoId: string,
    mesa_id: string,
    bloqueada: boolean,
    motivo: string
  },
  timestamp: ISO8601
}
```

## 🛡️ Validaciones

### Backend (esperadas):

- ✅ Verificar que la mesa existe
- ✅ Verificar permisos del usuario
- ✅ Verificar que no hay invitados asignados al bloquear
- ✅ Registrar auditoría de cambios
- ✅ Incluir info de bloqueo en endpoint de disponibilidad

### Frontend - Monitor (Admin):

- ✅ Motivo obligatorio al bloquear
- ✅ Confirmación antes de cambiar estado
- ✅ Prevención de clicks duplicados (loading state)
- ✅ Validación de evento actual
- ✅ Prevención de drag & drop a mesas bloqueadas

### Frontend - AsignacionUser (Usuario):

- ✅ Validación al intentar seleccionar mesa bloqueada
- ✅ Notificación de error con motivo del bloqueo
- ✅ Indicadores visuales en mesas bloqueadas
- ✅ Exclusión de mesas bloqueadas de sugerencias
- ✅ Triple-check de estado de bloqueo (disponibilidad?.esta_bloqueada, disponibilidad?.bloqueada, bloqueada)
- ✅ Leyenda visual actualizada

## 📱 Responsive Design

- ✅ Modal adaptable a pantallas pequeñas
- ✅ Botones visibles en dispositivos táctiles (no solo en hover)
- ✅ Contador de mesas bloqueadas en header
- ✅ Overlays visibles en todos los tamaños

## 🚀 Mejoras Futuras (Sugerencias)

1. **Filtro de visualización**

   - Mostrar solo mesas bloqueadas
   - Mostrar solo mesas disponibles

2. **Historial de bloqueos**

   - Ver quién bloqueó/desbloqueó cada mesa
   - Timestamp de cada cambio

3. **Bloqueo masivo**

   - Seleccionar múltiples mesas
   - Bloquear/desbloquear en lote

4. **Programación de bloqueos**

   - Bloquear automáticamente en ciertas horas
   - Desbloquear automáticamente

5. **Niveles de bloqueo**
   - Bloqueo temporal
   - Bloqueo permanente
   - Bloqueo con excepción para VIP

## ✅ Testing

### Casos de Prueba Monitor:

- ✅ Bloquear mesa vacía
- ✅ Desbloquear mesa bloqueada
- ✅ Ver motivo de bloqueo
- ✅ Actualización en tiempo real en múltiples monitores
- ✅ Persistencia del estado de bloqueo
- ✅ Prevención de drag & drop a mesas bloqueadas
- ⚠️ Bloquear mesa con invitados asignados (validación backend)

### Casos de Prueba AsignacionUser:

- ✅ Intentar seleccionar mesa bloqueada → error con motivo
- ✅ Ver overlay visual en mesas bloqueadas (circular)
- ✅ Ver overlay visual en mesas bloqueadas (rectangular)
- ✅ Verificar que mesas bloqueadas no aparecen en sugerencias
- ✅ Tooltip muestra motivo de bloqueo al pasar cursor
- ✅ Leyenda muestra indicador de mesa bloqueada
- ⚠️ Actualización en tiempo real al recibir evento SignalR `mesaBloqueada`

## 📝 Notas de Implementación

### Detección de Estado de Bloqueo:

El sistema verifica el estado de bloqueo en tres ubicaciones posibles para máxima compatibilidad:

```javascript
const mesaBloqueada =
  element.disponibilidad?.esta_bloqueada ||
  element.disponibilidad?.bloqueada ||
  element.bloqueada;
```

### Motivo de Bloqueo:

```javascript
const motivoBloqueo =
  element.disponibilidad?.motivo_bloqueo ||
  element.motivo_bloqueo ||
  "No especificado";
```

### Actualizaciones:

- **Monitor**: La actualización automática se hace mediante `actualizarDatosMonitor()`
- **AsignacionUser**: Usa el hook `useDisponibilidadMesas` que obtiene datos actualizados del backend
- **SignalR**: El callback maneja tanto selecciones como bloqueos para sincronización en tiempo real

### Restricciones:

- ✅ No se permite arrastrar invitados a mesas bloqueadas (Monitor)
- ✅ No se permite seleccionar mesas bloqueadas (AsignacionUser)
- ✅ Las mesas bloqueadas no aparecen en sugerencias (AsignacionUser)

## 🐛 Troubleshooting

### La mesa no se bloquea (Monitor):

- Verificar que el `eventoId` es correcto
- Verificar que el `mesa_id` tiene el formato correcto (ej: "mesa-165")
- Revisar la respuesta del backend en la consola

### No se actualiza el plano (Monitor):

- Verificar conexión SignalR en la consola
- Verificar que el `eventoId` del mensaje coincide con el evento actual
- Llamar manualmente a `actualizarDatosMonitor()`

### El botón no aparece en hover (Monitor):

- Verificar que el elemento tiene la clase `group`
- Verificar que el botón tiene `group-hover:opacity-100`

### No se ve el overlay de bloqueada (AsignacionUser):

- Verificar que los datos de disponibilidad incluyen `esta_bloqueada` o `bloqueada`
- Revisar en consola el objeto `element.disponibilidad`
- Verificar que el endpoint de disponibilidad retorna la info de bloqueo

### La mesa bloqueada aparece como seleccionable (AsignacionUser):

- Verificar la lógica de detección en `MesaInteractiva` (triple-check)
- Revisar la condición `if (!asignacionActual && !mesaBloqueada)`
- Confirmar que `puedeSeleccionar` está en `false` para mesas bloqueadas

### Las mesas bloqueadas aparecen en sugerencias:

- Verificar el filtro en `obtenerSugerenciasMesas()` línea ~1171
- Confirmar que el check `if (mesaBloqueada) return false;` está activo

---

**Implementado por**: GitHub Copilot  
**Fecha**: 20 de noviembre de 2025  
**Versión**: 2.0.0 (Incluye implementación completa en AsignacionUser)
