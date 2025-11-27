# 🔗 Guía de Integración - Módulo de Clientes

## 📁 Archivos Creados

### Servicios
- ✅ `src/services/ticketsService.js` - Servicio completo con 7 endpoints del API
- ✅ `src/services/index.js` - Actualizado para exportar ticketsService

### Hooks Personalizados
- ✅ `src/hooks/useTickets.js` - Gestión de lista de tickets con filtros
- ✅ `src/hooks/useTicketDetail.js` - Detalle de ticket específico
- ✅ `src/hooks/useClientInfo.js` - Información completa del cliente por teléfono
- ✅ `src/hooks/useTicketChat.js` - Chat con polling y soporte SignalR
- ✅ `src/hooks/useSignalRTickets.js` - Notificaciones en tiempo real

### Contextos
- ✅ `src/contexts/SignalRContext.jsx` - Actualizado con eventos de tickets

### Componentes
- ✅ `src/components/Clientes/CompClientes.jsx` - **INTEGRADO CON API REAL**

---

## 🌐 Endpoints Integrados

| Endpoint | Método | Hook Usado | Estado |
|----------|--------|------------|--------|
| `/tickets` | GET | `useTickets` | ✅ Integrado |
| `/tickets/{ticketId}` | GET | `useTicketDetail` | ⏳ Pendiente integración UI |
| `/tickets/cliente?telefono={tel}` | GET | `useClientInfo` | ⏳ Pendiente integración UI |
| `/tickets/{ticketId}` | PUT | `useTicketDetail` | ⏳ Pendiente integración UI |
| `/tickets/{ticketId}/mensajes` | GET | `useTicketChat` | ⏳ Pendiente integración UI |
| `/tickets/{ticketId}/mensajes` | POST | `useTicketChat` | ⏳ Pendiente integración UI |
| `/tickets/{ticketId}/acciones` | POST | `useTicketDetail` | ⏳ Pendiente integración UI |

---

## 🔄 Mapeo de Datos API → UI

### 1. Lista de Tickets (Panel 1)

**Respuesta del API:**
```json
{
  "id": "TCKT-20251030-5522958133",
  "ticket": "TCKT-20251030-5522958133",
  "telefono": "5522958133",
  "nombre": "JASM",
  "estatus": "cerrado",
  "mensaje": "Tengo problemas con el portal de pago",
  "ultimo_mensaje": "Tengo problemas con el portal de pago",
  "fecha_creacion": "2025-10-30T17:27:45.178459+00:00",
  "fecha_cierre": "2025-10-30T18:17:24.236442+00:00",
  "promotor_asignado": null,
  "canalizado_por_bot": true
}
```

**Mapeo para UI:**
```javascript
{
  id: ticket.id,                    // ✅ Usamos 'id' como identificador único
  ticket: ticket.ticket,            // ✅ Número de ticket para mostrar
  nombre: ticket.nombre,            // ✅ Nombre del cliente
  telefono: ticket.telefono,        // ✅ Teléfono (necesario para getClientInfo)
  tiempo: calcularTiempo(ticket.fecha_creacion), // ⚠️ Calcular "Hace X minutos"
  estado: mapearEstado(ticket.estatus), // ⚠️ "cerrado" → "activo/urgente"
  color: getColorEstado(ticket.estatus) // ⚠️ Color según estado
}
```

**Funciones de transformación necesarias:**
```javascript
// Calcular tiempo transcurrido
function calcularTiempo(fechaCreacion) {
  const ahora = new Date();
  const fecha = new Date(fechaCreacion);
  const diff = ahora - fecha;
  const minutos = Math.floor(diff / 60000);
  
  if (minutos < 60) return `Hace ${minutos} minutos`;
  if (minutos < 1440) return `Hace ${Math.floor(minutos / 60)} horas`;
  return `Hace ${Math.floor(minutos / 1440)} días`;
}

// Mapear estado del API a estado UI
function mapearEstado(estatusAPI) {
  switch(estatusAPI) {
    case 'abierto': return 'activo';
    case 'pendiente': return 'urgente';
    case 'cerrado': return 'activo';
    default: return 'activo';
  }
}

// Color según estado
function getColorEstado(estatusAPI) {
  switch(estatusAPI) {
    case 'pendiente': return '#ff6b6b'; // Rojo para urgente
    case 'abierto': return '#b7e6f7';   // Azul para activo
    case 'cerrado': return '#95c99d';   // Verde para cerrado
    default: return '#b7e6f7';
  }
}
```

---

### 2. Información del Cliente (Panel 3)

**Endpoint:** `GET /tickets/cliente?telefono={telefono}`

**Respuesta esperada del API:**
```typescript
{
  datos_personales: {
    nombre_completo: string,
    telefono: string,
    email: string | null,
    estudios: string | null,
    institucion: string | null,
    tutor_nombre: string | null,
    tutor_telefono: string | null,
    contacto_emergencia_nombre: string | null,
    contacto_emergencia_telefono: string | null,
    evento_id: string,
    evento_nombre: string,
    invitado_id: string,
    toku_customer_id: string | null
  },
  historial_acciones: [
    {
      id: string,
      ticket_id: string,
      tipo_accion: string,
      descripcion: string,
      fecha: string,
      admin_id: string | null,
      admin_nombre: string | null,
      metadata: object | null
    }
  ],
  informacion_pago: {
    devoluciones: null,
    monto_total: number,
    monto_pagado: number,
    monto_pendiente: number,
    estado_pago: string,
    metodo_pago: string,
    transacciones: [
      {
        fecha: string,
        monto: number,
        metodo: string,
        estado: string,
        responsable: string
      }
    ],
    cuotas: [...]
  },
  informacion_boletos: {
    cantidad_solicitada: number,
    cantidad_confirmada: number,
    cantidad_pagada: number,
    boletos: [
      {
        codigo: string,
        asiento: string | null,
        estado: string,
        qr_code: string | null,
        restricciones: string[] | null
      }
    ]
  },
  tickets_totales: number,
  tickets_abiertos: number,
  tickets_cerrados: number,
  tickets_pendientes: number
}
```

**Mapeo para UI:**
```javascript
// Datos Personales
{
  nombre: clientInfo.datos_personales.nombre_completo,
  estudios: clientInfo.datos_personales.estudios,
  institución: clientInfo.datos_personales.institucion,
  catidadPedido: clientInfo.informacion_boletos.cantidad_solicitada,
  contactoErme: {
    telefonoER: clientInfo.datos_personales.contacto_emergencia_telefono,
    tutorER: clientInfo.datos_personales.contacto_emergencia_nombre
  },
  contacto: {
    telefono: clientInfo.datos_personales.telefono,
    tutor: clientInfo.datos_personales.tutor_nombre
  },
  boletos: clientInfo.informacion_boletos.boletos.map(b => ({
    codigo: b.codigo,
    asiento: b.asiento || "Sin asiento",
    status: b.estado === "confirmado",
    retriciones: b.restricciones?.map(r => ({ item: r })) || [{ item: null }]
  }))
}

// Información de Pago
{
  estadoGeneral: clientInfo.informacion_pago.estado_pago,
  formaPago: clientInfo.informacion_pago.metodo_pago,
  totalBoletos: clientInfo.informacion_boletos.cantidad_confirmada,
  fechaDePago: formatearFecha(clientInfo.informacion_pago.transacciones[0]?.fecha),
  totalPagado: `$${clientInfo.informacion_pago.monto_pagado} MXN`,
  transacciones: clientInfo.informacion_pago.transacciones.map(t => ({
    fecha: formatearFecha(t.fecha),
    monto: `$${t.monto} MXN`,
    método: t.metodo,
    estado: t.estado
  }))
}

// Historial Secuencial
{
  historialSecuencial: clientInfo.historial_acciones.map(a => ({
    fecha: formatearFecha(a.fecha),
    hora: formatearHora(a.fecha),
    evento: a.tipo_accion,
    detalle: a.descripcion,
    responsable: a.admin_nombre || "Sistema automático"
  }))
}
```

---

### 3. Chat (Panel 4)

**Endpoint:** `GET /tickets/{ticketId}/mensajes`

**Respuesta esperada:**
```typescript
{
  mensajes: [
    {
      id: string,
      texto: string,
      es_admin: boolean,
      fecha: string,
      leido: boolean,
      admin_nombre?: string
    }
  ],
  conversacion: {
    id: string,
    ticket_id: string,
    creado_en: string,
    actualizado_en: string
  },
  estadisticas: {
    total_mensajes: number,
    mensajes_no_leidos: number,
    ultimo_mensaje_fecha: string | null
  }
}
```

**Mapeo para UI:**
```javascript
{
  chat: mensajes.map(msg => ({
    remitente: msg.es_admin ? "Soporte" : "Cliente",
    nombre: msg.es_admin ? (msg.admin_nombre || "Soporte") : ticketData.nombre,
    texto: msg.texto,
    hora: formatearFechaHora(msg.fecha), // "1 mayo 2025, 10:40 AM"
    leido: msg.leido
  }))
}
```

---

## 📝 Funciones de Utilidad Necesarias

Crear en: `src/utils/ticketsHelpers.js`

```javascript
/**
 * Calcular tiempo transcurrido desde una fecha
 */
export function calcularTiempoTranscurrido(fechaISO) {
  const ahora = new Date();
  const fecha = new Date(fechaISO);
  const diff = ahora - fecha;
  const minutos = Math.floor(diff / 60000);
  
  if (minutos < 1) return "Hace menos de 1 minuto";
  if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
  
  const dias = Math.floor(horas / 24);
  if (dias < 30) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
  
  const meses = Math.floor(dias / 30);
  return `Hace ${meses} mes${meses > 1 ? 'es' : ''}`;
}

/**
 * Mapear estado del API a estado UI
 */
export function mapearEstadoTicket(estatusAPI) {
  const mapeo = {
    'abierto': 'activo',
    'pendiente': 'urgente',
    'cerrado': 'activo'
  };
  return mapeo[estatusAPI] || 'activo';
}

/**
 * Obtener color según estado
 */
export function getColorEstado(estatusAPI) {
  const colores = {
    'pendiente': '#ff6b6b',
    'abierto': '#b7e6f7',
    'cerrado': '#95c99d'
  };
  return colores[estatusAPI] || '#b7e6f7';
}

/**
 * Formatear fecha ISO a formato legible
 */
export function formatearFecha(fechaISO) {
  if (!fechaISO) return '';
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Formatear hora desde fecha ISO
 */
export function formatearHora(fechaISO) {
  if (!fechaISO) return '';
  const fecha = new Date(fechaISO);
  return fecha.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Formatear fecha y hora completa
 */
export function formatearFechaHora(fechaISO) {
  if (!fechaISO) return '';
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Transformar datos de ticket del API para la UI
 */
export function transformarTicketParaUI(ticketAPI) {
  return {
    id: ticketAPI.id,
    ticket: ticketAPI.ticket,
    nombre: ticketAPI.nombre,
    telefono: ticketAPI.telefono,
    tiempo: calcularTiempoTranscurrido(ticketAPI.fecha_creacion),
    estado: mapearEstadoTicket(ticketAPI.estatus),
    color: getColorEstado(ticketAPI.estatus),
    estatus: ticketAPI.estatus, // Mantener el original
    mensaje: ticketAPI.mensaje,
    ultimo_mensaje: ticketAPI.ultimo_mensaje,
    fecha_creacion: ticketAPI.fecha_creacion,
    fecha_cierre: ticketAPI.fecha_cierre,
    promotor_asignado: ticketAPI.promotor_asignado,
    canalizado_por_bot: ticketAPI.canalizado_por_bot
  };
}
```

---

## 🎯 Próximos Pasos

### ✅ Completado
1. ✅ Creación de servicios y hooks
2. ✅ Integración en CompClientes.jsx (Panel 1)

### ⏳ Pendiente

#### 1. Crear archivo de utilidades
- [ ] Crear `src/utils/ticketsHelpers.js` con funciones de transformación

#### 2. Integrar Destalles.jsx (Paneles 2 y 3)
- [ ] Importar `useTicketDetail` y `useClientInfo`
- [ ] Reemplazar mock data con datos reales
- [ ] Implementar carga de cliente por teléfono
- [ ] Mapear estructura de datos según tablas arriba

#### 3. Integrar ChatModal.jsx (Panel 4)
- [ ] Importar `useTicketChat` y `useSignalRTickets`
- [ ] Implementar carga de mensajes
- [ ] Implementar envío de mensajes
- [ ] Conectar SignalR para mensajes en tiempo real
- [ ] Implementar polling como fallback

---

## 🔧 Notas de Implementación

### SignalR - Eventos Disponibles

```javascript
// Eventos que el backend debe emitir:
'nuevoTicket'         // Cuando se crea un nuevo ticket
'ticketActualizado'   // Cuando se actualiza un ticket
'nuevoMensaje'        // Cuando llega un nuevo mensaje en el chat
```

### Polling vs SignalR

El sistema usa **ambos** de forma complementaria:
- **SignalR**: Actualizaciones en tiempo real (cuando está conectado)
- **Polling**: Fallback cada 5 segundos (cuando SignalR no está disponible)

```javascript
// En ChatModal:
const { 
  mensajes, 
  enviarMensaje, 
  handleSignalRMessage 
} = useTicketChat(ticketId, {
  enablePolling: true,    // Polling automático
  pollingInterval: 5000   // Cada 5 segundos
});

// SignalR maneja mensajes nuevos instantáneamente
useSignalRTickets({
  onNuevoMensaje: handleSignalRMessage
});
```

---

## 🚨 Problemas Conocidos y Soluciones

### 1. Campo `telefono` faltante
**Problema**: Si el API no devuelve `telefono` en la lista de tickets
**Solución**: Solicitar al backend agregar este campo, es crítico para `getClientInfo`

### 2. Estructura de datos diferente
**Problema**: UI espera estructura anidada, API devuelve estructura plana
**Solución**: Usar funciones de transformación en `ticketsHelpers.js`

### 3. Formato de fechas
**Problema**: API devuelve ISO 8601, UI espera formato legible en español
**Solución**: Usar `formatearFecha()`, `formatearHora()`, `formatearFechaHora()`

---

## 📚 Documentación de Referencia

- **API Spec**: `src/docs/api/FRONTEND_REACT_SPECS.md`
- **Servicios**: `src/services/ticketsService.js`
- **Hooks**: `src/hooks/useTickets.js`, `useTicketDetail.js`, `useClientInfo.js`, `useTicketChat.js`
- **SignalR Context**: `src/contexts/SignalRContext.jsx`
