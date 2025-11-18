# 🧪 Guía Rápida - Probar Sistema de Turnos (Actualizada)

## 🔗 URL CON PARÁMETROS

```
http://localhost:3000/asignacion-user/:eventoId/:invitadoId
```

### Ejemplo Real:

```
http://localhost:3000/asignacion-user/evento-test-001/user-001
```

---

## ✅ Sin Autenticación (Como PortalPagos)

El sistema ahora funciona **sin login**, igual que el portal de pagos:

```jsx
// Los IDs vienen de la URL
const { eventoId, invitadoId } = useParams();

// Se carga el invitado desde el backend
const resultado = await guestService.getGuest(eventoId, invitadoId);
```

---

## 📋 Requisitos Previos en Backend

Para que la URL funcione, el backend debe tener:

1. **Evento creado** con ID `evento-test-001`
2. **Invitado registrado** con ID `user-001` en ese evento
3. **Turnos generados** para el evento
4. **Layout configurado** con mesas

---

## 🎬 Flujo de Prueba

### 1️⃣ Antes del Turno (estadoTurno === 'espera')

**Abrir:** `http://localhost:3000/asignacion-user/evento-test-001/user-001`

**Esperado:**

- ✅ Se muestra **ModalEspera**
- ⏳ Contador regresivo hasta el turno
- 📅 Muestra horario asignado (inicio - fin)
- 🚫 No puede acceder a selección de mesas

**Backend debe retornar:**

```json
{
  "invitado_id": "user-001",
  "turno": {
    "fecha_hora_inicio": "2025-11-12T15:00:00Z", // Hora futura
    "fecha_hora_fin": "2025-11-12T15:30:00Z",
    "numero_turno": 5,
    "estado": "pendiente"
  }
}
```

---

### 2️⃣ Durante el Turno (estadoTurno === 'activo')

**Backend debe retornar:**

```json
{
  "turno": {
    "fecha_hora_inicio": "2025-11-12T10:00:00Z", // Hora actual
    "fecha_hora_fin": "2025-11-12T10:30:00Z", // Hora futura
    "estado": "activo"
  }
}
```

**Esperado:**

- ✅ Modal desaparece
- ⏱️ Muestra countdown (ej: "28:45")
- 🪑 Muestra layout de mesas disponibles
- ✏️ Puede seleccionar mesas
- 🍽️ Puede elegir tipo de menú
- 🥗 Puede especificar restricciones
- 💾 Botón "Guardar Selección" habilitado

---

### 3️⃣ Después de Guardar (estadoTurno === 'completado')

**Acción:** Presionar "Guardar Selección"

**Esperado:**

- ✅ POST a `/eventos/:eventoId/seleccion-mesas/guardar?invitadoId=:invitadoId`
- 📋 Se muestra resumen de selección:
  - Mesa 5: 3 personas
  - Mesa 8: 1 persona
  - Menú: Vegetariano
  - Restricción: Sin gluten
- 🚫 No puede modificar
- 🔄 Si refresca la página, sigue mostrando el resumen

**Backend debe retornar:**

```json
{
  "estado": "completado",
  "seleccion": {
    "mesas_seleccionadas": [
      { "mesa_id": "mesa-5", "cantidad_personas": 3 },
      { "mesa_id": "mesa-8", "cantidad_personas": 1 }
    ],
    "tipo_menu": "Vegetariano",
    "restriccion_dietetica": "Sin gluten"
  }
}
```

---

### 4️⃣ Turno Expirado (estadoTurno === 'expirado')

**Backend debe retornar:**

```json
{
  "turno": {
    "fecha_hora_fin": "2025-11-12T10:00:00Z", // Hora pasada
    "estado": "expirado"
  }
}
```

**Esperado:**

- ❌ Mensaje: "Tu turno ha expirado"
- 📞 "Contacta al organizador"
- 🚫 No puede seleccionar mesas

---

## 🧪 Casos de Prueba

### ✅ Caso 1: URL Válida

```
URL: /asignacion-user/evento-test-001/user-001
Backend: Invitado existe
Resultado: ✅ Carga correctamente
```

### ❌ Caso 2: Invitado No Existe

```
URL: /asignacion-user/evento-test-001/invitado-999
Backend: 404 Not Found
Resultado: ❌ "No se encontró información del invitado"
```

### ❌ Caso 3: Evento No Existe

```
URL: /asignacion-user/evento-999/user-001
Backend: 404 Not Found
Resultado: ❌ "Error al cargar información"
```

### ❌ Caso 4: Sin Layout Configurado

```
URL: /asignacion-user/evento-test-001/user-001
Backend: Layout vacío
Resultado: ⚠️ "No hay mesas configuradas para este evento"
```

### ❌ Caso 5: Sin Turnos Generados

```
URL: /asignacion-user/evento-test-001/user-001
Backend: sin_turno
Resultado: ⚠️ "No tienes turno asignado"
```

---

## 🔍 Debugging

### 1. Verificar IDs en Consola

```javascript
console.log("EventoId:", eventoId);
console.log("InvitadoId:", invitadoId);
```

### 2. Verificar Carga de Invitado

```javascript
console.log("Invitado:", invitado);
// Debe mostrar: { id, nombre, cantidad_personas, necesidades_especiales }
```

### 3. Verificar Layout

```javascript
console.log("Elementos Layout:", elementosLayout);
// Debe mostrar array de mesas con: id, type, numero, capacidad
```

### 4. Verificar Estado de Turno

```javascript
console.log("Estado Turno:", estadoTurno);
// Valores: verificando, espera, activo, completado, expirado, sin_turno
```

### 5. Red (Network Tab)

```
GET /eventos/:eventoId/guests/:invitadoId
GET /eventos/:eventoId/layout
GET /eventos/:eventoId/seleccion-mesas/mi-turno?invitadoId=:invitadoId
GET /eventos/:eventoId/seleccion-mesas/estado-ocupacion
POST /eventos/:eventoId/seleccion-mesas/guardar?invitadoId=:invitadoId
```

---

## 🎯 URLs de Prueba Rápida

### Copiar y pegar en el navegador:

```bash
# Prueba básica
http://localhost:3000/asignacion-user/evento-test-001/user-001

# Con diferentes invitados
http://localhost:3000/asignacion-user/evento-test-001/user-002
http://localhost:3000/asignacion-user/evento-test-001/user-003

# Con diferentes eventos
http://localhost:3000/asignacion-user/evento-abc/user-001
http://localhost:3000/asignacion-user/evento-xyz/user-001
```

---

## 📊 Endpoints que Debe Tener el Backend

```bash
# 1. Obtener invitado
GET /eventos/:eventoId/guests/:invitadoId

# 2. Obtener layout del evento
GET /eventos/:eventoId/layout

# 3. Obtener turno del invitado
GET /eventos/:eventoId/seleccion-mesas/mi-turno?invitadoId=:invitadoId

# 4. Obtener estado de ocupación
GET /eventos/:eventoId/seleccion-mesas/estado-ocupacion

# 5. Guardar selección
POST /eventos/:eventoId/seleccion-mesas/guardar?invitadoId=:invitadoId
Body: { mesas_seleccionadas, tipo_menu, restriccion_dietetica }

# 6. Obtener selección guardada
GET /eventos/:eventoId/seleccion-mesas/mi-seleccion?invitadoId=:invitadoId
```

---

## ✅ Checklist de Prueba

- [ ] URL con parámetros funciona correctamente
- [ ] Carga datos del invitado desde backend
- [ ] Muestra ModalEspera cuando no está en turno
- [ ] Permite selección solo durante turno activo
- [ ] Muestra layout de mesas del evento
- [ ] Permite seleccionar múltiples mesas
- [ ] Valida cantidad de personas
- [ ] Permite elegir tipo de menú
- [ ] Permite especificar restricciones
- [ ] Guarda selección en backend
- [ ] Muestra resumen después de guardar
- [ ] No permite modificar después de guardar
- [ ] Polling actualiza estado cada 30s
- [ ] Countdown funciona correctamente
- [ ] Maneja errores de red gracefully

---

✅ **Sistema completamente funcional sin autenticación**

Para documentación completa, ver: `TURNOS_SIN_AUTENTICACION.md`
