# 🧪 Guía de Pruebas - Sistema de Turnos para Invitados

## 🔗 URL de Prueba

```
http://localhost:3000/asignacion-user
```

## ⚙️ Configuración Actual

La página `AsignacionUser.jsx` ahora tiene un **switch para alternar entre sistemas**:

```javascript
// Línea 10 de AsignacionUser.jsx
const [usarSistemaTurnos] = useState(true); // true = turnos, false = legacy
```

### Sistema Activo: **Turnos** ✅

- Usa `AsignacionUserWrapper` (nuevo)
- Integra hook `useTurnosInvitado`
- Polling automático cada 30 segundos
- Countdown en tiempo real

## 🎯 IDs de Prueba

### Configuración Hardcoded Actual:

```javascript
invitadoId: "user-001";
eventoId: "evento-test-001";
cantidadPersonas: 4;
```

### 🔧 Dónde Cambiar para Pruebas:

**Archivo:** `src/pages/AsignacionUser.jsx` líneas 86-88

```javascript
<AsignacionUserWrapper
  invitadoId="user-001" // 👈 CAMBIAR aquí
  eventoId="evento-test-001" // 👈 CAMBIAR aquí
  configuracionUsuario={{
    cantidadPersonas: 4, // 👈 CAMBIAR aquí
    necesidadesEspeciales: false,
  }}
  onCambioEstado={manejarCambio}
/>
```

## 🧪 Escenarios de Prueba

### 1. **Evento SIN Sistema de Turnos**

- Usa `eventoId` de un evento sin configuración de turnos
- **Resultado esperado:** Renderiza el componente legacy `AsignacionUser`
- **Visualización:** Sin componente TurnoActivo, UI tradicional

---

### 2. **Evento CON Sistema de Turnos - Sin Turno Asignado**

**Backend debe retornar:**

```json
GET /eventos/{eventoId}/seleccion-mesas/mi-turno?invitadoId={invitadoId}
Response: 404 Not Found
```

**Resultado esperado:**

- Estado: `sin_turno`
- Muestra tarjeta amarilla con ⚠️
- Mensaje: "No tienes turno asignado"

---

### 3. **Turno en ESPERA (Aún no comienza)**

**Backend debe retornar:**

```json
{
  "id": "turno-123",
  "numero_turno": 5,
  "invitado_id": "user-001",
  "fecha_hora_inicio": "2025-11-12T15:00:00Z", // Futuro
  "fecha_hora_fin": "2025-11-12T15:15:00Z",
  "estado": "pendiente",
  "completado": false
}
```

**Resultado esperado:**

- Estado: `espera`
- Muestra tarjeta azul con 📅
- Muestra: número de turno, fecha/hora de inicio y fin
- Mensaje: "Tu turno está programado"

---

### 4. **Turno ACTIVO (En curso)**

**Backend debe retornar:**

```json
{
  "id": "turno-123",
  "numero_turno": 5,
  "invitado_id": "user-001",
  "fecha_hora_inicio": "2025-11-12T14:00:00Z", // Pasado
  "fecha_hora_fin": "2025-11-12T14:15:00Z", // Futuro (quedan X minutos)
  "estado": "activo",
  "completado": false
}
```

**Resultado esperado:**

- Estado: `activo`
- Muestra tarjeta verde/roja con ⏰
- **Countdown grande** en formato HH:MM:SS
- Colores según tiempo:
  - Verde: >10 min
  - Amarillo: 5-10 min
  - Rojo pulsante: <5 min
- Muestra componente `SeleccionMesasInvitado` debajo
- Puede seleccionar mesas

---

### 5. **Turno COMPLETADO**

**Backend debe retornar:**

```json
{
  "id": "turno-123",
  "numero_turno": 5,
  "invitado_id": "user-001",
  "fecha_hora_inicio": "2025-11-12T14:00:00Z",
  "fecha_hora_fin": "2025-11-12T14:15:00Z",
  "estado": "completado",
  "completado": true,
  "fecha_completado": "2025-11-12T14:10:00Z"
}
```

**Y selección guardada:**

```json
GET /eventos/{eventoId}/seleccion-mesas/mi-seleccion?invitadoId={invitadoId}
{
  "mesas_seleccionadas": [
    { "mesa_id": "mesa-1", "cantidad_personas": 2 },
    { "mesa_id": "mesa-3", "cantidad_personas": 2 }
  ],
  "tipo_menu": "normal",
  "restriccion_dietetica": "Ninguna"
}
```

**Resultado esperado:**

- Estado: `completado`
- Muestra tarjeta verde con ✅
- Mensaje: "Selección completada"
- Muestra resumen de selección (mesas, tipo de menú, restricciones)
- NO permite modificar

---

### 6. **Turno EXPIRADO (Tiempo acabado)**

**Backend debe retornar:**

```json
{
  "id": "turno-123",
  "numero_turno": 5,
  "invitado_id": "user-001",
  "fecha_hora_inicio": "2025-11-12T14:00:00Z",
  "fecha_hora_fin": "2025-11-12T14:15:00Z", // Pasado
  "estado": "expirado",
  "completado": false
}
```

**Resultado esperado:**

- Estado: `expirado`
- Muestra tarjeta roja con ❌
- Mensaje: "Tu turno ha expirado"
- NO muestra selector de mesas
- Instrucciones para contactar organizador

---

## 📊 Estado de Ocupación de Mesas

**Backend debe retornar:**

```json
GET /eventos/{eventoId}/seleccion-mesas/estado-ocupacion
{
  "mesas": [
    {
      "id": "mesa-1",
      "numero": 1,
      "capacidad": 8,
      "lugares_ocupados": 5,
      "lugares_disponibles": 3
    },
    {
      "id": "mesa-2",
      "numero": 2,
      "capacidad": 8,
      "lugares_ocupados": 8,
      "lugares_disponibles": 0
    }
  ],
  "ultima_actualizacion": "2025-11-12T14:05:00Z"
}
```

**Visualización:**

- Grid de mesas disponibles (solo mesas con `lugares_disponibles > 0`)
- Actualización automática cada 30 segundos
- Contador de personas X/Y en resumen

---

## 🔄 Flujo de Prueba Completo

### Paso 1: Sin Turno

```bash
# URL
http://localhost:3000/asignacion-user

# Esperar
- Ver estado "verificando" (loading)
- Ver estado "sin_turno" con mensaje amarillo
```

### Paso 2: Crear Turno en Backend

```bash
# Crear configuración de turnos para el evento
POST /eventos/evento-test-001/seleccion-mesas/configuracion

# Generar turnos
POST /eventos/evento-test-001/seleccion-mesas/generar-turnos
```

### Paso 3: Refrescar Página

```bash
# El hook hace polling automático, pero puedes refrescar manualmente
# Debería mostrar estado "espera" con información del turno
```

### Paso 4: Esperar Inicio de Turno

```bash
# Ajustar fecha_hora_inicio del turno para que sea "ahora"
# O esperar hasta la hora programada
# Polling detectará automáticamente el cambio a "activo"
```

### Paso 5: Seleccionar Mesas

```bash
# Click en mesas disponibles
# Ajustar cantidad con +/-
# Seleccionar tipo de menú
# Seleccionar restricción dietética
# Click en "Guardar Selección"
```

### Paso 6: Ver Completado

```bash
# Después de guardar, debería cambiar a estado "completado"
# Mostrar resumen de selección
```

---

## 🐛 Debugging

### Ver Estado del Hook en Consola

El hook tiene logs automáticos. Abre DevTools Console:

```javascript
// Verás logs como:
console.log("🎟️ Estado del turno:", estadoTurno);
console.log("⏰ Tiempo restante:", tiempoRestante);
console.log("🔄 Polling ejecutado");
```

### Inspeccionar Network Requests

En DevTools Network, busca:

```
/eventos/{eventoId}/seleccion-mesas/mi-turno
/eventos/{eventoId}/seleccion-mesas/verificar-acceso
/eventos/{eventoId}/seleccion-mesas/mi-seleccion
/eventos/{eventoId}/seleccion-mesas/estado-ocupacion
```

### React DevTools

Inspeccionar componentes:

- `AsignacionUserWrapper` → props: eventoId, invitadoId
- Hook `useTurnosInvitado` → state completo
- `TurnoActivo` → props: estadoTurno, tiempoRestante
- `SeleccionMesasInvitado` → props: estadoOcupacion, puedeSeleccionar

---

## 🎨 Estados Visuales Esperados

### Loading (Verificando)

```
┌─────────────────────────────┐
│ 🔄 Verificando tu turno...  │
└─────────────────────────────┘
```

### Sin Turno

```
┌─────────────────────────────────────┐
│ ⚠️  No tienes turno asignado        │
│                                     │
│ El sistema de turnos aún no ha     │
│ sido configurado...                 │
└─────────────────────────────────────┘
```

### En Espera

```
┌─────────────────────────────────────┐
│ 📅 Tu turno está programado         │
│                                     │
│ Número de turno: #5                 │
│ Inicio: martes 12/11/2025 15:00    │
│ Fin: martes 12/11/2025 15:15       │
└─────────────────────────────────────┘
```

### Activo (>5 min)

```
┌─────────────────────────────────────┐
│ ⏰ ¡Tu turno está activo!           │
│                                     │
│     Tiempo restante                 │
│       00:12:45                      │
│                                     │
│ Turno: #5    Finaliza: 15:15       │
└─────────────────────────────────────┘
```

### Activo (<5 min) - Pulsante

```
┌═════════════════════════════════════┐
║ ⏰ ¡Tu turno está activo!           ║
║                                     ║
║     Tiempo restante                 ║
║       00:04:23                      ║
║ ⚠️ ¡Apúrate! Quedan menos de 5 min ║
║                                     ║
║ Turno: #5    Finaliza: 15:15       ║
└═════════════════════════════════════┘
(Borde rojo pulsante)
```

### Completado

```
┌─────────────────────────────────────┐
│ ✅ Selección completada             │
│                                     │
│ Has completado tu selección        │
│                                     │
│ Tu Selección:                       │
│ Mesa 1: 2 personas                  │
│ Mesa 3: 2 personas                  │
│ Tipo de menú: Normal                │
└─────────────────────────────────────┘
```

### Expirado

```
┌─────────────────────────────────────┐
│ ❌ Tu turno ha expirado             │
│                                     │
│ El tiempo asignado ha finalizado   │
│ Contacta al organizador...          │
└─────────────────────────────────────┘
```

---

## 🔧 Cambiar a Sistema Legacy

**Archivo:** `src/pages/AsignacionUser.jsx` línea 10

```javascript
// Cambiar de true a false
const [usarSistemaTurnos] = useState(false);
```

Esto renderizará el componente anterior sin sistema de turnos.

---

## ✅ Checklist de Prueba

- [ ] Cargar página sin turno → Ver "sin_turno"
- [ ] Crear configuración de turnos en backend
- [ ] Generar turnos para el invitado
- [ ] Ver turno en estado "espera"
- [ ] Ajustar hora para que sea "activo"
- [ ] Ver countdown funcionando
- [ ] Ver mesas disponibles cargadas
- [ ] Seleccionar mesas (verificar validaciones)
- [ ] Ajustar cantidades con +/-
- [ ] Seleccionar tipo de menú
- [ ] Guardar selección
- [ ] Ver estado "completado" con resumen
- [ ] Refrescar página → Mantener estado "completado"
- [ ] Verificar polling (esperar 30s y ver request en Network)

---

## 📞 Endpoints Backend Necesarios

```
GET    /eventos/{eventoId}/seleccion-mesas/configuracion
POST   /eventos/{eventoId}/seleccion-mesas/configuracion
GET    /eventos/{eventoId}/seleccion-mesas/mi-turno?invitadoId={id}
GET    /eventos/{eventoId}/seleccion-mesas/verificar-acceso?invitadoId={id}
POST   /eventos/{eventoId}/seleccion-mesas/guardar?invitadoId={id}
GET    /eventos/{eventoId}/seleccion-mesas/mi-seleccion?invitadoId={id}
GET    /eventos/{eventoId}/seleccion-mesas/estado-ocupacion
POST   /eventos/{eventoId}/seleccion-mesas/generar-turnos
```

Todos ya están mapeados en `turnosService.js` ✅
