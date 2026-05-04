# 🔌 Guía de Integración Backend-Frontend - Módulo de Gestión de Tickets/Clientes

## 📋 Documento para Integración de APIs

Este documento contiene todas las especificaciones técnicas para **integrar el backend de Azure Functions con la interfaz React ya existente** del Módulo de Gestión de Tickets/Clientes.

> ⚠️ **NOTA IMPORTANTE**: La interfaz React ya está desarrollada. Este documento se enfoca en cómo conectarla con los nuevos endpoints del backend.

---

## 🎯 Objetivo de Integración

Conectar la interfaz React existente con los 7 nuevos endpoints del backend para:
1. ✅ Obtener listado de tickets desde el servidor
2. ✅ Cargar información completa del cliente seleccionado
3. ✅ Mostrar detalle del ticket con historial
4. ✅ Enviar y recibir mensajes del chat
5. ✅ Actualizar estados de tickets
6. ✅ Registrar acciones en el historial
7. ✅ Aplicar filtros y búsquedas

---

## 🖼️ Estructura de la Interfaz (Ya Implementada)

La interfaz ya desarrollada incluye 4 paneles principales:

### Layout Principal

```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: "Módulo de Clientes"                                        │
├──────────────┬────────────────────────┬────────────────────────────┤
│              │                        │                            │
│  PANEL 1     │     PANEL 2            │      PANEL 3               │
│  Listado de  │     Historial de       │      Información del       │
│  Tickets     │     Tickets +          │      Cliente               │
│  (izquierda) │     Detalle Ticket     │      (derecha)             │
│              │     (centro)           │                            │
│              │                        │  - Datos Personales        │
│              │                        │  - Historial Acciones      │
│              │                        │  - Info Pago               │
│              │                        │  - Boletos                 │
├──────────────┴────────────────────────┴────────────────────────────┤
│                    PANEL 4: Chat en Vivo (inferior)                 │
│                    Conversación con el cliente                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 🔗 Mapeo de Paneles con Endpoints

| Panel | Función | Endpoint Principal | Trigger |
|-------|---------|-------------------|---------|
| **Panel 1** | Lista de tickets | `GET /tickets` | Al cargar componente + filtros |
| **Panel 2** | Detalle del ticket | `GET /tickets/{ticketId}` | Al seleccionar ticket |
| **Panel 3** | Info del cliente | `GET /tickets/cliente?telefono={tel}` ⭐ | Al seleccionar ticket |
| **Panel 4** | Chat | `GET /tickets/{ticketId}/mensajes` | Al seleccionar ticket + polling |

---

## 🌐 Endpoints del Backend

### Base URL
```
http://localhost:7071/api/v1  (desarrollo)
https://tu-api.azurewebsites.net/api/v1  (producción)
```

### Autenticación
Todos los endpoints requieren:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Lista de Endpoints

#### 1. **GET** `/tickets`
Obtiene todos los tickets con filtros opcionales.

**Query Params (opcionales)**:
- `estatus`: string - "abierto" | "cerrado" | "pendiente"
- `telefono`: string - Número de teléfono
- `limite`: number - Máximo de resultados

**Respuesta**:
```typescript
{
  success: boolean;
  data: {
    tickets: Ticket[];
    total: number;
    filtros_aplicados: {
      estatus?: string;
      telefono?: string;
      limite?: number;
    };
    estadisticas: {
      total: number;
      abiertos: number;
      cerrados: number;
      pendientes: number;
      con_promotor_asignado: number;
      sin_promotor: number;
      canalizados_por_bot: number;
    } | null;
  };
  message: string;
}
```

**Tipo Ticket**:
```typescript
interface Ticket {
  id: string;
  ticket: string;
  telefono: string;
  nombre: string;
  estatus: "abierto" | "cerrado" | "pendiente";
  mensaje: string;
  ultimo_mensaje: string;
  fecha_creacion: string; // ISO 8601
  fecha_cierre: string | null;
  promotor_asignado: string | null;
  nombre_promotor?: string;
  canalizado_por_bot: boolean;
}
```

#### 2. **GET** `/tickets/{ticketId}`
Obtiene detalle de un ticket específico.

**Path Params**:
- `ticketId`: string - ID del ticket (ej: "TCKT-20251015-5522958133")

**Respuesta**:
```typescript
{
  success: boolean;
  data: {
    ticket: Ticket;
    invitado: {
      id: string;
      nombre_completo: string;
      instituto: string;
      licenciatura: string;
    } | null;
    historial_acciones: Accion[];
    conversacion: Conversacion | null;
    estadisticas_conversacion: EstadisticasConversacion | null;
  };
  message: string;
}
```

#### 3. **GET** `/tickets/cliente?telefono={telefono}` ⭐ **PRINCIPAL**
Obtiene TODA la información consolidada del cliente.

**Query Params (requerido)**:
- `telefono`: string - Número de teléfono del cliente

**Respuesta**:
```typescript
{
  success: boolean;
  data: {
    telefono: string;
    invitado_id: string;
    datos_personales: DatosPersonales;
    tickets: {
      total: number;
      abiertos: number;
      cerrados: number;
      pendientes: number;
      lista: Ticket[];
    };
    historial_acciones: {
      total: number;
      acciones: Accion[];
    };
    informacion_pago: InformacionPago;
    informacion_boletos: InformacionBoletos;
    metadata: {
      fecha_consulta: string;
      invitado_activo: boolean;
    };
  };
  message: string;
}
```

**Tipos Completos**:
```typescript
interface DatosPersonales {
  nombre_completo: string;
  numero_telefono: string;
  email: string | null;
  estudios: {
    instituto: string;
    licenciatura: string;
  };
  cantidad_boletos_requeridos: number;
  restricciones_alimentarias: string[] | null;
  contacto_emergencia: {
    telefono: string;
  };
  tutor: {
    nombre_completo: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    telefono: string | null;
  } | null;
  evento_id: string;
  toku_customer_id: string | null;
}

interface Accion {
  id: string;
  telefono: string;
  ticket_id: string;
  tipo_accion: string;
  descripcion: string;
  responsable: string;
  fecha_accion: string; // ISO 8601
  metadata: Record<string, any>;
  createdAt: string;
}

interface InformacionPago {
  devoluciones: any | null; // Pendiente implementación
  progreso: {
    porcentaje: number;
    monto_pagado: number;
    monto_total: number;
    monto_pendiente: number;
  };
  ultima_actualizacion: string;
  responsable_registro: string;
  detalle_transacciones: Transaccion[];
  cuotas: {
    total: number;
    pagadas: number;
    pendientes: number;
    vencidas: number;
    lista_cuotas: Cuota[];
  };
  estado_deuda: "PAGADA" | "PARCIAL" | "PENDIENTE" | "VENCIDA";
  fecha_liquidacion: string | null;
}

interface Transaccion {
  fecha: string;
  tipo: string;
  monto: number;
  descripcion: string;
  estado: string;
  responsable: string;
}

interface Cuota {
  id_cuota: string;
  numero_cuota: number;
  deuda_id: string;
  monto: number;
  monto_pagado: number;
  monto_pendiente: number;
  fecha_vencimiento: string;
  dias_para_vencimiento: number;
  vencida: boolean;
  estado: "PENDIENTE" | "PARCIAL" | "PAGADA";
  descripcion: string;
}

interface InformacionBoletos {
  cantidad_solicitada: number;
  cantidad_asignada: number;
  tiene_seleccion: boolean;
  boletos: Boleto[];
}

interface Boleto {
  codigo: string; // ej: "BC-5001"
  mesa_numero: number | null;
  asiento_id: string | null;
  persona: string;
  menu: string;
  restricciones: string[] | null;
}
```

#### 4. **PUT** `/tickets/{ticketId}`
Actualiza un ticket.

**Path Params**:
- `ticketId`: string

**Body**:
```typescript
{
  estatus?: "abierto" | "cerrado" | "pendiente";
  promotor_id?: string;
  nombre_promotor?: string;
  ultimo_mensaje?: string;
}
```

**Respuesta**:
```typescript
{
  success: boolean;
  data: {
    ticket: Ticket;
    acciones_realizadas: string[];
  };
  message: string;
}
```

#### 5. **GET** `/tickets/{ticketId}/mensajes`
Obtiene mensajes del ticket.

**Path Params**:
- `ticketId`: string

**Query Params (opcional)**:
- `limite`: number

**Respuesta**:
```typescript
{
  success: boolean;
  data: {
    conversacion_id: string;
    mensajes: Mensaje[];
    total: number;
    mostrados: number;
    estadisticas: EstadisticasConversacion;
    creado_en: string;
    actualizado_en: string;
  };
  message: string;
}
```

**Tipos**:
```typescript
interface Mensaje {
  id: string;
  from: "usuario" | "admin" | "sistema";
  texto: string;
  timestamp: string; // ISO 8601
  leido: boolean;
  admin_id?: string;
  admin_nombre?: string;
}

interface Conversacion {
  id: string;
  conversacionID: string;
  mensajes: Mensaje[];
  creado_en: string;
  actualizado_en: string;
}

interface EstadisticasConversacion {
  total_mensajes: number;
  mensajes_no_leidos: number;
  mensajes_usuario: number;
  mensajes_admin: number;
  mensajes_sistema: number;
  primer_mensaje: string | null;
  ultimo_mensaje: string | null;
}
```

#### 6. **POST** `/tickets/{ticketId}/mensajes`
Envía un mensaje desde el admin.

**Path Params**:
- `ticketId`: string

**Body**:
```typescript
{
  texto: string;
  marcar_leidos?: boolean; // default: false
}
```

**Respuesta**:
```typescript
{
  success: boolean;
  data: {
    mensaje: Mensaje;
    conversacion_id: string;
    total_mensajes: number;
  };
  message: string;
}
```

#### 7. **POST** `/tickets/{ticketId}/acciones`
Registra una acción manual en el historial.

**Path Params**:
- `ticketId`: string

**Body**:
```typescript
{
  tipo_accion: string; // Ver lista de tipos válidos abajo
  descripcion: string;
  responsable?: string; // Opcional, usa nombre del usuario actual si no se proporciona
  metadata?: Record<string, any>; // Opcional
}
```

**Tipos de acción válidos**:
- `"registro_completado"`
- `"solicitud_boletos"`
- `"devolucion"`
- `"cambio_boleto"`
- `"cancelar_boleto"`
- `"pago_completado"`
- `"devolucion_parcial"`
- `"actualizacion_datos"`
- `"generacion_comprobante"`
- `"revision_estatus"`
- `"validacion_manual"`

**Respuesta**:
```typescript
{
  success: boolean;
  data: {
    accion: Accion;
  };
  message: string;
}
```

---

## 🔧 Plan de Integración por Componente

### Componentes Existentes a Conectar

Dado que la interfaz ya está implementada, necesitas identificar los componentes actuales y agregar las llamadas a la API. Probablemente tienes una estructura similar a:

```
src/
├── components/
│   └── tickets/ (o moduloClientes/)
│       ├── Layout principal          → Integrar useTickets, useClientInfo, useChat
│       ├── Lista de tickets          → Conectar a GET /tickets
│       ├── Detalle del ticket        → Conectar a GET /tickets/{ticketId}
│       ├── Info del cliente          → Conectar a GET /tickets/cliente
│       └── Chat                      → Conectar a GET/POST mensajes
├── services/
│   └── ticketsApi.js                 → CREAR NUEVO servicio
├── hooks/ (opcional)
│   ├── useTickets.js                 → CREAR custom hooks
│   ├── useClientInfo.js
│   └── useChat.js
```

### 📝 Checklist de Integración

#### Fase 1: Crear el Servicio API
- [ ] Crear archivo `services/ticketsApi.js` (código completo abajo)
- [ ] Configurar axios con interceptores de autenticación
- [ ] Definir base URL del backend (local: `http://localhost:7071/api/v1`)
- [ ] Probar endpoints con Postman/Thunder Client

#### Fase 2: Integrar Panel 1 (Lista de Tickets)
- [ ] Importar `ticketsApi.getAllTickets()` en componente de lista
- [ ] Reemplazar datos mock con llamada real al backend
- [ ] Implementar filtros (estatus, teléfono) con query params
- [ ] Manejar estados de loading y error
- [ ] Mostrar estadísticas del response

#### Fase 3: Integrar Panel 2 (Detalle del Ticket)
- [ ] Importar `ticketsApi.getTicketDetail()` en componente de detalle
- [ ] Cargar detalle cuando usuario seleccione un ticket
- [ ] Mostrar historial de acciones del ticket
- [ ] Implementar botón de actualización de estado con `updateTicket()`

#### Fase 4: Integrar Panel 3 (Info del Cliente) ⭐ IMPORTANTE
- [ ] Importar `ticketsApi.getClientInfo()` en componente de info cliente
- [ ] Ejecutar llamada cuando se seleccione un ticket (usar `ticket.telefono`)
- [ ] Mapear respuesta a secciones existentes:
  - `clientInfo.datos_personales` → Componente de datos personales
  - `clientInfo.historial_acciones` → Timeline/lista de acciones
  - `clientInfo.informacion_pago` → Componente de pagos
  - `clientInfo.informacion_boletos` → Lista de boletos
- [ ] Mostrar estadísticas de tickets del cliente

#### Fase 5: Integrar Panel 4 (Chat)
- [ ] Importar `ticketsApi.getMessages()` en componente de chat
- [ ] Cargar mensajes cuando se seleccione un ticket
- [ ] Implementar `sendMessage()` al enviar mensaje desde el input
- [ ] Configurar polling (cada 5 segundos) para actualizar mensajes
- [ ] Marcar mensajes como leídos automáticamente
- [ ] Mostrar indicador "Enviando..." mientras `sending === true`

#### Fase 6: Funcionalidades Adicionales
- [ ] Implementar registro de acciones manuales con `registerAction()`
- [ ] Agregar notificaciones toast para acciones exitosas/fallidas
- [ ] Implementar debounce en búsqueda/filtros
- [ ] Agregar confirmación antes de cerrar tickets

---

## 💻 Código Listo para Integrar

### 1. 🆕 CREAR: Servicio API (`services/ticketsApi.js`)

> ⚠️ **ACCIÓN REQUERIDA**: Crear este archivo nuevo en tu proyecto React

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7071/api/v1';

// Configurar interceptor para agregar token
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const ticketsApi = {
  // Obtener todos los tickets
  getAllTickets: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.estatus) params.append('estatus', filtros.estatus);
    if (filtros.telefono) params.append('telefono', filtros.telefono);
    if (filtros.limite) params.append('limite', filtros.limite);
    
    const response = await api.get(`/tickets?${params}`);
    return response.data;
  },

  // Obtener detalle de ticket
  getTicketDetail: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data;
  },

  // Obtener información completa del cliente ⭐
  getClientInfo: async (telefono) => {
    const response = await api.get(`/tickets/cliente?telefono=${telefono}`);
    return response.data;
  },

  // Actualizar ticket
  updateTicket: async (ticketId, updates) => {
    const response = await api.put(`/tickets/${ticketId}`, updates);
    return response.data;
  },

  // Obtener mensajes
  getMessages: async (ticketId, limite = null) => {
    const params = limite ? `?limite=${limite}` : '';
    const response = await api.get(`/tickets/${ticketId}/mensajes${params}`);
    return response.data;
  },

  // Enviar mensaje
  sendMessage: async (ticketId, texto, marcarLeidos = true) => {
    const response = await api.post(`/tickets/${ticketId}/mensajes`, {
      texto,
      marcar_leidos: marcarLeidos,
    });
    return response.data;
  },

  // Registrar acción
  registerAction: async (ticketId, accion) => {
    const response = await api.post(`/tickets/${ticketId}/acciones`, accion);
    return response.data;
  },
};
```

### 2. 🆕 CREAR (Opcional): Hook Personalizado (`hooks/useTickets.js`)

> 💡 **ALTERNATIVA**: Puedes usar este hook personalizado o llamar directamente `ticketsApi` en tus componentes existentes

```javascript
import { useState, useEffect } from 'react';
import { ticketsApi } from '../services/ticketsApi';

export const useTickets = (filtros = {}) => {
  const [tickets, setTickets] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ticketsApi.getAllTickets(filtros);
      
      if (response.success) {
        setTickets(response.data.tickets);
        setEstadisticas(response.data.estadisticas);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar tickets');
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [JSON.stringify(filtros)]); // Re-fetch cuando cambien los filtros

  return {
    tickets,
    estadisticas,
    loading,
    error,
    refetch: fetchTickets,
  };
};
```

### 3. 🆕 CREAR (Opcional): Hook para Info del Cliente (`hooks/useClientInfo.js`)

> 💡 **USO**: Este hook es especialmente útil para el Panel 3 (Info del Cliente)

```javascript
import { useState, useEffect } from 'react';
import { ticketsApi } from '../services/ticketsApi';

export const useClientInfo = (telefono) => {
  const [clientInfo, setClientInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClientInfo = async () => {
    if (!telefono) {
      setClientInfo(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await ticketsApi.getClientInfo(telefono);
      
      if (response.success) {
        setClientInfo(response.data);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar información del cliente');
      console.error('Error fetching client info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientInfo();
  }, [telefono]);

  return {
    clientInfo,
    loading,
    error,
    refetch: fetchClientInfo,
  };
};
```

### 4. 🆕 CREAR (Opcional): Hook para Chat (`hooks/useChat.js`)

> 💡 **USO**: Este hook maneja el chat con polling automático cada 5 segundos

```javascript
import { useState, useEffect, useCallback } from 'react';
import { ticketsApi } from '../services/ticketsApi';

export const useChat = (ticketId) => {
  const [mensajes, setMensajes] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = async () => {
    if (!ticketId) {
      setMensajes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await ticketsApi.getMessages(ticketId);
      
      if (response.success) {
        setMensajes(response.data.mensajes);
        setEstadisticas(response.data.estadisticas);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar mensajes');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = useCallback(async (texto) => {
    try {
      setSending(true);
      setError(null);
      const response = await ticketsApi.sendMessage(ticketId, texto, true);
      
      if (response.success) {
        // Recargar mensajes después de enviar
        await fetchMessages();
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message || 'Error al enviar mensaje');
      console.error('Error sending message:', err);
      return false;
    } finally {
      setSending(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchMessages();
    
    // Opcional: Polling cada 5 segundos para actualizar mensajes
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [ticketId]);

  return {
    mensajes,
    estadisticas,
    loading,
    sending,
    error,
    sendMessage,
    refetch: fetchMessages,
  };
};
```

### 5. 📝 MODIFICAR: Tu Componente Principal Existente

> 🔧 **ACCIÓN**: En tu layout/componente principal, importa y usa los hooks o servicios

```jsx
// En tu componente principal existente (ej: TicketsLayout.jsx, ModuloClientes.jsx, etc.)
import { useState, useEffect } from 'react';
import { ticketsApi } from '../../services/ticketsApi';

// Si decides usar hooks personalizados:
// import { useTickets } from '../../hooks/useTickets';
// import { useClientInfo } from '../../hooks/useClientInfo';
// import { useChat } from '../../hooks/useChat';

function TuComponentePrincipal() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [clientInfo, setClientInfo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar tickets al montar el componente
  useEffect(() => {
    loadTickets();
  }, []);

  // Cargar info del cliente cuando se selecciona un ticket
  useEffect(() => {
    if (selectedTicket?.telefono) {
      loadClientInfo(selectedTicket.telefono);
      loadMessages(selectedTicket.ticket);
    }
  }, [selectedTicket]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketsApi.getAllTickets({ estatus: 'abierto' });
      if (response.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Error cargando tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClientInfo = async (telefono) => {
    try {
      const response = await ticketsApi.getClientInfo(telefono);
      if (response.success) {
        setClientInfo(response.data);
      }
    } catch (error) {
      console.error('Error cargando info cliente:', error);
    }
  };

  const loadMessages = async (ticketId) => {
    try {
      const response = await ticketsApi.getMessages(ticketId);
      if (response.success) {
        setMensajes(response.data.mensajes);
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const handleSendMessage = async (texto) => {
    try {
      const response = await ticketsApi.sendMessage(selectedTicket.ticket, texto);
      if (response.success) {
        loadMessages(selectedTicket.ticket); // Recargar mensajes
        return true;
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      return false;
    }
  };

  // Tu JSX existente aquí...
  // Pasa estos datos como props a tus componentes existentes
}
```

### 6. 📝 MODIFICAR: Componente de Lista de Tickets

> 🔧 **INTEGRACIÓN**: En tu componente existente de lista de tickets

```jsx
// En el componente que maneja la lista de tickets (Panel 1)
import { useState, useEffect } from 'react';
import { ticketsApi } from '../../services/ticketsApi';

function TuComponenteListaTickets() {
  const [tickets, setTickets] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [filtros, setFiltros] = useState({});

  useEffect(() => {
    loadTickets();
  }, [filtros]);

  const loadTickets = async () => {
    try {
      const response = await ticketsApi.getAllTickets(filtros);
      if (response.success) {
        setTickets(response.data.tickets);
        setEstadisticas(response.data.estadisticas);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFilterChange = (estatus) => {
    setFiltros({ estatus: estatus || undefined });
  };

  // Tu render existente...
  // Usa `tickets` y `estadisticas` en tu UI actual
}
```

### 7. 📝 MODIFICAR: Componente de Info del Cliente (Panel 3)

> 🔧 **INTEGRACIÓN CRÍTICA**: Este es el más importante

```jsx
// En el componente que muestra información del cliente (Panel 3)
import { useState, useEffect } from 'react';
import { ticketsApi } from '../../services/ticketsApi';

function TuComponenteInfoCliente({ telefono }) {
  const [clientInfo, setClientInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (telefono) {
      loadClientInfo();
    }
  }, [telefono]);

  const loadClientInfo = async () => {
    try {
      setLoading(true);
      const response = await ticketsApi.getClientInfo(telefono);
      
      if (response.success) {
        const data = response.data;
        
        // Ahora tienes acceso a toda la información:
        console.log('Datos personales:', data.datos_personales);
        console.log('Historial acciones:', data.historial_acciones);
        console.log('Info pago:', data.informacion_pago);
        console.log('Boletos:', data.informacion_boletos);
        
        setClientInfo(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!clientInfo) return null;

  // Mapea los datos a tu UI existente:
  return (
    <div>
      {/* Sección Datos Personales */}
      <div className="datos-personales">
        <h3>{clientInfo.datos_personales.nombre_completo}</h3>
        <p>{clientInfo.datos_personales.numero_telefono}</p>
        <p>{clientInfo.datos_personales.estudios.instituto}</p>
        {/* ... más campos */}
      </div>

      {/* Sección Historial Acciones */}
      <div className="historial">
        <h4>Historial de Acciones ({clientInfo.historial_acciones.total})</h4>
        {clientInfo.historial_acciones.acciones.map(accion => (
          <div key={accion.id}>
            <p>{accion.descripcion}</p>
            <small>{new Date(accion.fecha_accion).toLocaleString()}</small>
          </div>
        ))}
      </div>

      {/* Sección Info Pago */}
      <div className="info-pago">
        <h4>Información de Pago</h4>
        <p>Estado: {clientInfo.informacion_pago.estado_deuda}</p>
        <p>Pagado: ${clientInfo.informacion_pago.progreso.monto_pagado}</p>
        <p>Total: ${clientInfo.informacion_pago.progreso.monto_total}</p>
        <p>Progreso: {clientInfo.informacion_pago.progreso.porcentaje}%</p>
        {/* Cuotas */}
        {clientInfo.informacion_pago.cuotas.lista_cuotas.map(cuota => (
          <div key={cuota.id_cuota}>
            <p>Cuota {cuota.numero_cuota}: ${cuota.monto}</p>
            <p>Estado: {cuota.estado}</p>
          </div>
        ))}
      </div>

      {/* Sección Boletos */}
      <div className="boletos">
        <h4>Boletos ({clientInfo.informacion_boletos.cantidad_asignada}/{clientInfo.informacion_boletos.cantidad_solicitada})</h4>
        {clientInfo.informacion_boletos.boletos.map((boleto, idx) => (
          <div key={idx}>
            <p>Código: {boleto.codigo}</p>
            <p>Persona: {boleto.persona}</p>
            <p>Mesa: {boleto.mesa_numero || 'Sin asignar'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 8. 📝 MODIFICAR: Componente de Chat (Panel 4)

> 🔧 **INTEGRACIÓN**: Chat con polling automático

```jsx
// En tu componente de chat existente
import { useState, useEffect, useRef } from 'react';
import { ticketsApi } from '../../services/ticketsApi';

function TuComponenteChat({ ticketId }) {
  const [mensajes, setMensajes] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Cargar mensajes iniciales
  useEffect(() => {
    if (ticketId) {
      loadMessages();
    }
  }, [ticketId]);

  // Polling cada 5 segundos
  useEffect(() => {
    if (!ticketId) return;
    
    const interval = setInterval(() => {
      loadMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [ticketId]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const loadMessages = async () => {
    try {
      const response = await ticketsApi.getMessages(ticketId);
      if (response.success) {
        setMensajes(response.data.mensajes);
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    try {
      setSending(true);
      const response = await ticketsApi.sendMessage(ticketId, messageText, true);
      
      if (response.success) {
        setMessageText('');
        loadMessages(); // Recargar inmediatamente
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      alert('Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  // Tu render existente con mensajes mapeados...
  return (
    <div className="chat">
      <div className="mensajes">
        {mensajes.map(msg => (
          <div key={msg.id} className={`mensaje ${msg.from}`}>
            <p>{msg.texto}</p>
            <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage}>
        <input
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
          disabled={sending}
          placeholder="Escribe un mensaje..."
        />
        <button type="submit" disabled={sending}>
          {sending ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
```

---

## 🎨 Notas sobre Estilos

> ℹ️ **INFORMACIÓN**: Tu interfaz ya tiene estilos implementados, pero aquí hay notas sobre clases CSS que puedes usar si necesitas ajustes

---

## 📦 Dependencias Recomendadas

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "date-fns": "^2.30.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  }
}
```

---

## 🔄 Flujo de Datos Completo

```
1. Usuario selecciona filtro de tickets
   ↓
2. useTickets hace fetch a GET /tickets?estatus=abierto
   ↓
3. Se renderiza la lista de tickets
   ↓
4. Usuario hace clic en un ticket
   ↓
5. useClientInfo hace fetch a GET /tickets/cliente?telefono={telefono}
   ↓
6. useChat hace fetch a GET /tickets/{ticketId}/mensajes
   ↓
7. Se muestra toda la información consolidada
   ↓
8. Usuario escribe y envía mensaje
   ↓
9. POST /tickets/{ticketId}/mensajes
   ↓
10. Se recargan los mensajes automáticamente
```

---

## 🚀 Guía Rápida de Integración (5 Pasos)

### ✅ **PASO 1**: Crear el Servicio API (5 min)
```bash
# En tu proyecto React
mkdir -p src/services
# Copia el código del servicio ticketsApi.js (sección 1 arriba)
```

### ✅ **PASO 2**: Configurar Variables de Entorno (2 min)
```bash
# Crear/editar .env en la raíz del proyecto React
REACT_APP_API_URL=http://localhost:7071/api/v1
```

### ✅ **PASO 3**: Integrar en Componente de Lista (10 min)
- Importa `ticketsApi.getAllTickets()`
- Reemplaza datos mock con llamada real
- Implementa filtros con query params

### ✅ **PASO 4**: Integrar Información del Cliente ⭐ (15 min)
- Importa `ticketsApi.getClientInfo()`
- Ejecuta cuando se seleccione un ticket
- Mapea respuesta a tus componentes de UI existentes

### ✅ **PASO 5**: Integrar Chat (15 min)
- Importa `ticketsApi.getMessages()` y `sendMessage()`
- Configura polling cada 5 segundos
- Conecta input de envío con `sendMessage()`

**Total estimado**: ~50 minutos para integración completa

---

## ⚠️ Consideraciones Técnicas Importantes

### 🔐 Autenticación
```javascript
// El servicio ya incluye el interceptor, solo asegúrate de que el token esté en localStorage
localStorage.setItem('authToken', 'tu-token-jwt-aqui');
```

### 🔄 Polling para Chat
```javascript
// Ya incluido en el ejemplo de useChat
setInterval(() => loadMessages(), 5000); // Cada 5 segundos
```

### 🚨 Manejo de Errores
```javascript
try {
  const response = await ticketsApi.getAllTickets();
  if (!response.success) {
    // Mostrar error al usuario
    alert(response.message || 'Error al cargar tickets');
  }
} catch (error) {
  console.error('Error:', error);
  alert('Error de conexión con el servidor');
}
```

### ⚡ Performance
- **Debounce** en búsquedas: Usa `lodash.debounce` o custom hook
- **Memoización**: Usa `React.memo()` para componentes de lista
- **Virtual Scrolling**: Si hay muchos tickets, considera `react-window`

### 📅 Formateo de Fechas
```javascript
// Ejemplo simple
new Date(fecha).toLocaleDateString('es-MX', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

// O instala date-fns:
// npm install date-fns
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

format(new Date(fecha), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
```

### 💰 Formateo de Moneda
```javascript
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

// Uso: formatCurrency(1500.50) → "$1,500.50"
```

---

## 🧪 Testing de la Integración

### Probar Endpoints desde el Frontend

```javascript
// En la consola del navegador (DevTools)
// 1. Verificar que el token esté guardado
console.log(localStorage.getItem('authToken'));

// 2. Probar llamada a tickets
import { ticketsApi } from './services/ticketsApi';
ticketsApi.getAllTickets().then(console.log);

// 3. Probar info del cliente
ticketsApi.getClientInfo('5522958133').then(console.log);

// 4. Probar mensajes
ticketsApi.getMessages('TCKT-20251015-5522958133').then(console.log);
```

### Verificar CORS
Si tienes problemas de CORS, el backend ya está configurado, pero verifica:
```javascript
// En Azure Functions (host.json) - YA ESTÁ CONFIGURADO
{
  "extensions": {
    "http": {
      "routePrefix": "api/v1"
    }
  },
  "version": "2.0"
}
```

---

## 🎯 Resumen Ejecutivo

### ✅ Lo que YA tienes:
- ✅ Interfaz React completa con 4 paneles
- ✅ Componentes visuales funcionando
- ✅ Diseño y estilos implementados

### 🔧 Lo que NECESITAS hacer:
1. ✅ Crear `services/ticketsApi.js` (5 min)
2. ✅ Importar el servicio en tus componentes (5 min)
3. ✅ Reemplazar datos mock con llamadas reales (30 min)
4. ✅ Implementar polling para el chat (5 min)
5. ✅ Manejar estados de loading y error (10 min)

**Total**: ~1 hora de trabajo de integración

---

## 📞 Soporte

### URLs de Referencia
- **Backend Local**: `http://localhost:7071/api/v1`
- **Documentación Backend**: Ver `MODULO_CLIENTES_DOCUMENTACION.md`
- **Tests Backend**: Ver `TEST_MODULO_CLIENTES.md`

### Estructura de Respuestas
Todos los endpoints siguen el mismo patrón:
```typescript
{
  success: boolean;
  data: any;
  message: string;
}
```

### En caso de error (HTTP 4xx/5xx):
```typescript
{
  success: false;
  message: "Descripción del error";
  error?: string; // Detalles técnicos
}
```

---

**🎉 Fin del documento de integración**

Este documento contiene TODO lo necesario para **conectar tu frontend React existente con el nuevo backend de Azure Functions**. 

La integración debería tomar aproximadamente 1 hora si sigues los 5 pasos de la guía rápida. ¡Éxito! 🚀
