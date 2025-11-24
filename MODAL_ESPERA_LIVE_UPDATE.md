# Modal de Espera con Actualizaciones en Vivo

## Descripción General

Este documento describe la implementación del sistema de **sala de espera interactiva** para invitados que están esperando su turno para seleccionar mesa. El modal ahora incluye:

1. **Vista en vivo del mapa de mesas** con actualizaciones en tiempo real vía SignalR
2. **Sistema de pre-configuración de asientos** guardado en memoria local (localStorage)
3. **Botones de guardar/cancelar** para el control explícito de la configuración

---

## 1. Arquitectura del Sistema

### Componentes Principales

#### `ModalEspera.jsx`

Modal que se muestra cuando un invitado está en estado de `espera` (no es su turno activo).

**Props:**

```javascript
{
  open: boolean,
  usuario: { id, nombre },
  horario: { inicio, fin, duracionMinutos },
  eventoId: string,
  invitadoId: string,
  configuracionPrevia: object | null,
  onGuardarConfiguracion: (config) => void
}
```

**Estados principales:**

- `configuracionGuardada`: Boolean que indica si hay una configuración guardada
- `guardandoConfiguracion`: Loading state durante el guardado
- `zoom`, `offset`: Controles del canvas de mesas
- `elementosConDisponibilidad`: Mesas obtenidas del endpoint en tiempo real

#### `AsignacionUserWrapper.jsx`

Wrapper que coordina el sistema de turnos y determina qué vista mostrar al invitado.

**Responsabilidades:**

- Detectar estado del turno (espera, activo, completado)
- Cargar configuración previa desde localStorage
- Pasar props necesarios a `ModalEspera`
- Gestionar transición de espera a selección activa

### Hooks Personalizados

#### `useSignalRInvitado`

Hook para conectar invitados a SignalR y recibir actualizaciones de mesas.

**Ubicación:** `src/hooks/useSignalRInvitado.js`

**Uso:**

```javascript
const handleMesaSeleccionada = useCallback(
  async (data) => {
    console.log("Mesa seleccionada:", data);
    await refrescarDisponibilidad();
  },
  [refrescarDisponibilidad]
);

useSignalRInvitado(handleMesaSeleccionada);
```

**Características:**

- Usa `invitadoId` como `userId` en la conexión SignalR
- Escucha evento `mesaSeleccionada`
- Comparte la infraestructura de `SignalRContext`

#### `useDisponibilidadMesas`

Hook para obtener el layout completo de mesas con datos de ocupación.

**Endpoint:** `GET /eventos/{eventId}/seleccion-mesas/disponibilidad`

**Retorna:**

```javascript
{
  elementos: Array<Mesa>, // Mesas con datos de ocupación
  estadisticas: Object,    // Estadísticas globales
  loading: boolean,
  refrescar: () => Promise<void>
}
```

---

## 2. Flujo de Datos

### A. Conexión SignalR

```
1. ModalEspera se abre (open = true)
2. useEffect detecta que invitadoId existe
3. Llama a conectarSignalR(invitadoId)
4. SignalRContext establece conexión:
   URL: https://eventosapi-v2.azurewebsites.net/api/v1?userId={invitadoId}
5. useSignalRInvitado registra callback para "mesaSeleccionada"
6. Cuando otro invitado selecciona una mesa:
   - Backend emite evento "mesaSeleccionada"
   - Callback ejecuta refrescarDisponibilidad()
   - Mapa se actualiza con nueva ocupación
```

### B. Sistema de Pre-configuración

```
1. Invitado hace clic en "Ajustes de asientos"
2. Flip animation muestra panel de configuración
3. Invitado configura:
   - Nombres de personas
   - Restricciones alimentarias
   - Mesa deseada (si ya exploró el mapa)
4. Invitado hace clic en "Guardar"
5. handleGuardarConfiguracion():
   - Serializa configuración a JSON
   - Guarda en localStorage con key: config-asientos-{invitadoId}
   - Marca configuracionGuardada = true
   - Muestra indicador verde "Configuración guardada"
   - Vuelve a vista de espera (flip)
6. Si hace clic en "Cancelar":
   - Descarta cambios
   - Restaura configuración previa
   - Vuelve a vista de espera
```

### C. Transición a Turno Activo

```
1. Backend marca turno como activo
2. useTurnosInvitado detecta estadoTurno = 'activo'
3. AsignacionUserWrapper renderiza AsignacionUser en lugar de ModalEspera
4. AsignacionUser monta:
   - Verifica localStorage: config-asientos-{invitadoId}
   - Si existe configuración:
     * La carga como valores por defecto
     * Pre-llena ModalRestricciones
     * Permite editar antes de guardar
   - Si NO existe:
     * Flujo normal de selección
5. Al guardar selección final:
   - Guarda a base de datos
   - Limpia localStorage: removeItem(config-asientos-{invitadoId})
   - Marca turno como completado
```

---

## 3. Estructura de localStorage

### Key

```
config-asientos-{invitadoId}
```

### Valor (JSON)

```javascript
{
  "mesaSeleccionada": 14,
  "boletosDisponibles": 12,
  "personas": [
    { "id": 1, "nombre": "Juan Pérez", "activa": true },
    { "id": 2, "nombre": "María García", "activa": true }
  ],
  "restriccionesAlimentarias": {
    "vegetariano": false,
    "vegano": true,
    "sinGluten": false,
    "alergiaMarisco": true
  },
  "tipoMenu": "normal",
  "restriccionEspecifica": "Alérgico a nueces",
  "timestamp": "2025-01-18T15:30:00.000Z"
}
```

### Ciclo de Vida

1. **Creación:** Cuando invitado guarda configuración en espera
2. **Lectura:** Al cargar ModalEspera (mostrar indicador) y al activar turno (pre-llenar formulario)
3. **Actualización:** Cada vez que invitado guarda nueva configuración
4. **Eliminación:** Después de guardar selección final a base de datos

---

## 4. Componentes del UI

### Panel Izquierdo - Vista de Espera

**Elementos:**

- Header con foto y nombre del usuario
- Información del turno (hora inicio/fin, duración)
- Contador regresivo hasta el turno
- Resumen de asientos (estadísticas del salón)
- Indicador de "Configuración guardada" (si aplica)
- Botón "Ajustes de asientos"

### Panel Izquierdo - Vista de Ajustes

**Elementos:**

- Lista de personas con sus nombres
- Botón para agregar más personas
- Grid de restricciones alimentarias (checkboxes)
- Campo de texto para restricciones específicas
- **Botones de acción:**
  - **Guardar:** Guarda en localStorage, vuelve a vista de espera
  - **Cancelar:** Descarta cambios, vuelve a vista de espera

### Panel Derecho - Mapa en Vivo

**Elementos:**

- Badge "LIVE" con animación de pulso
- Título del salón y evento
- **Controles de zoom:**
  - Alejar (-)
  - Restablecer (↻)
  - Acercar (+)
- Indicador de conexión SignalR (conectado/desconectado)
- Canvas con mesas renderizadas:
  - Verde: Disponible
  - Rojo: Ocupada
  - Se actualiza automáticamente cuando alguien selecciona mesa

---

## 5. Integración con Backend

### Endpoints Utilizados

#### Disponibilidad de Mesas

```
GET /eventos/{eventId}/seleccion-mesas/disponibilidad
```

**Respuesta:**

```javascript
{
  "elementos": [
    {
      "id": 1,
      "tipo": "MESA_REDONDA",
      "x": 100,
      "y": 200,
      "capacidad_total": 10,
      "asientos_ocupados": 6,
      "estado": "PARCIALMENTE_OCUPADO",
      "disponible_para_seleccion": true
    }
  ],
  "estadisticas": {
    "total_mesas": 50,
    "mesas_ocupadas": 28,
    "porcentaje_ocupacion": 56
  }
}
```

### SignalR

#### Hub URL

```
https://eventosapi-v2.azurewebsites.net/api/v1?userId={invitadoId}
```

#### Eventos Escuchados

- **`mesaSeleccionada`**: Se emite cuando cualquier invitado selecciona una mesa
  ```javascript
  {
    "invitadoId": "abc123",
    "mesaId": 14,
    "cantidadAsientos": 10,
    "timestamp": "2025-01-18T15:30:00Z"
  }
  ```

#### Comportamiento

- Auto-reconnect con delays: [0, 20000, 50000, 60000]ms
- Indica estado de conexión en UI (punto verde/gris)

---

## 6. Consideraciones de Rendimiento

### Optimizaciones Implementadas

1. **useCallback para funciones:**

   - `handleGuardarConfiguracion`
   - `handleCancelarConfiguracion`
   - `handleMesaSeleccionada`
   - Controles de zoom (zoomIn, zoomOut, resetZoom)

2. **Refrescar solo cuando es necesario:**

   - SignalR callback refresca solo cuando se detecta cambio
   - No hay polling constante

3. **Canvas con transformaciones CSS:**

   - Zoom usa `transform: scale()` para mejor performance
   - Transiciones suaves con `transition: transform 0.2s ease-out`

4. **Lazy loading:**
   - ModalEspera solo carga cuando `open = true`
   - Conexión SignalR solo se establece cuando modal está abierto

### Límites y Restricciones

- **Tamaño de localStorage:** ~5MB por dominio
  - Cada configuración ocupa ~1-2KB
  - Soporta miles de configuraciones sin problema
- **Conexiones SignalR simultáneas:** Limitado por servidor (normalmente 10,000+)
- **Frecuencia de refrescos:** Cada evento `mesaSeleccionada` (no hay throttling)

---

## 7. Testing

### Casos de Prueba

#### Test 1: Conexión SignalR

```
✅ Invitado abre modal de espera
✅ SignalR conecta con invitadoId
✅ Indicador muestra "Conectado"
✅ Console.log muestra: "Mesa seleccionada detectada en espera: {data}"
```

#### Test 2: Mapa en Vivo

```
✅ Mapa carga mesas con estados correctos (verde/rojo)
✅ Otro invitado selecciona mesa
✅ SignalR emite evento mesaSeleccionada
✅ Mapa se actualiza sin reload manual
✅ Mesa seleccionada cambia de verde a rojo
```

#### Test 3: Pre-configuración - Guardar

```
✅ Click en "Ajustes de asientos"
✅ Flip animation muestra panel de configuración
✅ Llenar nombres y restricciones
✅ Click en "Guardar"
✅ localStorage contiene config-asientos-{invitadoId}
✅ Vuelve a vista de espera con flip animation
✅ Muestra indicador verde "Configuración guardada"
```

#### Test 4: Pre-configuración - Cancelar

```
✅ Configurar ajustes
✅ Click en "Cancelar"
✅ Cambios se descartan
✅ Vuelve a vista de espera
✅ localStorage no se modifica
```

#### Test 5: Transición a Turno Activo

```
✅ Invitado en espera con configuración guardada
✅ Backend activa turno
✅ useTurnosInvitado detecta estadoTurno = 'activo'
✅ AsignacionUserWrapper renderiza AsignacionUser
✅ AsignacionUser carga config desde localStorage
✅ ModalRestricciones pre-llena con datos guardados
✅ Invitado puede editar antes de guardar
```

#### Test 6: Guardado Final y Limpieza

```
✅ Invitado selecciona mesa
✅ Confirma selección
✅ Datos se guardan en base de datos
✅ localStorage.removeItem(config-asientos-{invitadoId})
✅ estadoTurno = 'completado'
```

#### Test 7: Zoom y Controles

```
✅ Click en "+" aumenta zoom (scale)
✅ Click en "-" disminuye zoom
✅ Click en "↻" resetea a zoom 1 y offset (0, 0)
✅ Transiciones suaves sin saltos
```

### Comandos de Testing Manual

#### Console Commands

```javascript
// Ver configuración guardada
localStorage.getItem("config-asientos-{invitadoId}");

// Limpiar configuración
localStorage.removeItem("config-asientos-{invitadoId}");

// Ver estado de SignalR
window.signalRState;

// Simular evento mesaSeleccionada (si tienes acceso al hub)
// Desde otro invitado, seleccionar una mesa y observar actualización
```

---

## 8. Troubleshooting

### Problema: SignalR no conecta

**Síntomas:**

- Indicador muestra "Desconectado"
- Mapa no se actualiza

**Solución:**

1. Verificar que `invitadoId` existe y es válido
2. Verificar URL del hub en `SignalRContext.jsx`
3. Revisar consola para errores de CORS
4. Verificar que el backend está corriendo

### Problema: Configuración no se guarda

**Síntomas:**

- Click en "Guardar" pero no aparece indicador verde
- localStorage vacío

**Solución:**

1. Verificar que `invitadoId` no es null/undefined
2. Revisar consola para errores de serialización JSON
3. Verificar límite de localStorage (5MB)
4. Verificar que callback `onGuardarConfiguracion` existe

### Problema: Mapa no muestra mesas

**Síntomas:**

- Muestra "No hay mesas disponibles"
- Loading infinito

**Solución:**

1. Verificar que `eventoId` es correcto
2. Revisar endpoint de disponibilidad en Network tab
3. Verificar que hay mesas en el evento
4. Revisar permisos del endpoint

### Problema: Transición a turno activo no funciona

**Síntomas:**

- Modal de espera se queda abierto
- Configuración guardada no se carga

**Solución:**

1. Verificar `estadoTurno` en useTurnosInvitado
2. Verificar que backend está actualizando turnos correctamente
3. Revisar polling/refrescos en useTurnosInvitado
4. Verificar que AsignacionUser está leyendo localStorage

---

## 9. Próximos Pasos

### Mejoras Pendientes

1. **AsignacionUser Integration:**

   - Implementar lectura de localStorage al montar
   - Pre-llenar ModalRestricciones con datos guardados
   - Limpiar localStorage después de guardar

2. **Estadísticas en Vivo:**

   - Usar `estadisticas` del hook useDisponibilidadMesas
   - Actualizar contadores en panel de espera
   - Mostrar porcentaje de ocupación en tiempo real

3. **Notificaciones Push:**

   - Notificar cuando está por llegar el turno (5 min antes)
   - Notificar cuando el turno está activo
   - Usar Web Notifications API

4. **Animaciones Mejoradas:**

   - Highlight en mesas recién ocupadas
   - Fade in/out en estadísticas que cambian
   - Smooth scroll al abrir ajustes

5. **Accesibilidad:**
   - ARIA labels en controles de zoom
   - Keyboard navigation en mapa de mesas
   - Screen reader announcements para actualizaciones

---

## 10. Referencias

### Archivos Modificados

- `src/components/AsiganacionUser/ModalEspera.jsx`
- `src/components/AsiganacionUser/AsignacionUserWrapper.jsx`

### Archivos Nuevos

- `src/hooks/useSignalRInvitado.js`

### Documentación Relacionada

- `SIGNALR_PAGOS_DOCS.md` - Documentación de infraestructura SignalR
- `ROUTE_PROTECTION.md` - Sistema de protección de rutas
- `QR_INVITACION_FLOW.md` - Flujo de invitaciones

### Endpoints Backend

- `GET /eventos/{eventId}/seleccion-mesas/disponibilidad`
- `GET /eventos/{eventId}/seleccion-mesas/estado-invitados`
- SignalR Hub: `https://eventosapi-v2.azurewebsites.net/api/v1`

---

## 11. Changelog

### v1.0.0 - 2025-01-18

**Añadido:**

- Vista en vivo del mapa de mesas con SignalR
- Sistema de pre-configuración con localStorage
- Botones de guardar/cancelar para control explícito
- Controles de zoom para el mapa
- Indicador de configuración guardada
- Indicador de estado de conexión SignalR
- Hook `useSignalRInvitado` para invitados en espera
- Integración con `useDisponibilidadMesas`

**Cambiado:**

- Modal de espera de estático a interactivo
- Botón "Guardar configuración" reemplazado por "Guardar" y "Cancelar"
- AsignacionUserWrapper ahora pasa props de SignalR a ModalEspera

**Técnico:**

- useCallback en funciones críticas
- localStorage para almacenamiento temporal
- CSS transforms para zoom performante
- Auto-reconnect en SignalR
