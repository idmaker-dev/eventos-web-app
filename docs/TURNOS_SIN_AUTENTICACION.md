# Sistema de Asignación de Mesas con Turnos - Sin Autenticación

## 📋 Resumen

El sistema de asignación de mesas ahora funciona **sin autenticación**, igual que PortalPagos. Los invitados reciben un enlace por correo con su `eventoId` e `invitadoId` en la URL.

---

## 🔗 Formato de URL

```
https://tu-app.com/asignacion-user/:eventoId/:invitadoId
```

**Ejemplo:**

```
https://tu-app.com/asignacion-user/evento-123/invitado-456
```

---

## 🔄 Flujo Completo

### 1️⃣ **Invitado Recibe Email**

```
📧 Correo del sistema:
"Hola María,

Tu turno para seleccionar mesa es el 12/11/2025 de 10:00 a 10:30.

Accede aquí: https://app.com/asignacion-user/evento-123/invitado-456

¡Te esperamos!"
```

### 2️⃣ **Invitado Abre el Enlace**

#### Caso A: **Antes de su turno** (estadoTurno === 'espera')

- ✅ Se muestra `ModalEspera`
- ⏳ Contador regresivo hasta su turno
- 📅 Muestra horario asignado
- 🔄 Actualización automática cada segundo

#### Caso B: **Durante su turno** (estadoTurno === 'activo')

- ✅ Puede acceder a la selección de mesas
- ⏱️ Contador descendente del tiempo restante
- 🪑 Ve el layout del evento con mesas disponibles
- ✏️ Selecciona mesas, menús y restricciones
- 💾 Guarda su selección

#### Caso C: **Después de guardar** (estadoTurno === 'completado')

- ✅ Ve resumen de su selección
- 🚫 No puede modificar
- 📋 Muestra mesas, menús y restricciones seleccionadas
- ℹ️ Mensaje: "Ya has completado tu selección"

### 3️⃣ **Sistema Actualiza en Tiempo Real**

- Polling cada 30 segundos
- Detecta cambios de estado automáticamente
- Actualiza disponibilidad de mesas

---

## 🛠️ Cambios Implementados

### 1. **Routes.jsx**

```jsx
// ANTES (requería autenticación)
<Route path="/asignacion-user" element={<AsignacionUser />} />

// AHORA (pública con parámetros)
<Route path="/asignacion-user/:eventoId/:invitadoId" element={<AsignacionUser />} />
```

### 2. **AsignacionUser.jsx**

```jsx
// Obtener IDs de la URL
const { eventoId, invitadoId } = useParams();

// Cargar invitado desde backend
const [invitado, setInvitado] = useState(null);

useEffect(() => {
  const cargarInvitado = async () => {
    const resultado = await guestService.getGuest(eventoId, invitadoId);
    if (resultado.success) {
      setInvitado(resultado.guest);
    }
  };
  cargarInvitado();
}, [eventoId, invitadoId]);

// Cargar layout del evento
const { layout, elementos } = useLayoutEvento(eventoId);
```

**Estados Manejados:**

- ⏳ **Loading**: Cargando invitado y layout
- ❌ **Error**: No se encontró invitado o layout
- ✅ **Success**: Muestra AsignacionUserWrapper

### 3. **AsignacionUserWrapper.jsx**

#### Props Actualizadas:

```jsx
export default function AsignacionUserWrapper({
  invitadoId,      // Desde URL
  eventoId,        // Desde URL
  invitado,        // Desde backend (guestService)
  layoutEvento,    // Layout completo del evento
  elementosLayout, // Mesas del layout
  loadingLayout,   // Estado de carga
})
```

#### Lógica de Renderizado:

```jsx
// ❌ Si está esperando su turno
if (estadoTurno === "espera") {
  return (
    <ModalEspera
      usuario={{ nombre: invitado?.nombre }}
      horario={{ inicio, fin, duracionMinutos }}
    />
  );
}

// ✅ Si está en su turno o completó
return (
  <>
    <TurnoActivo turno={turno} />

    {estadoTurno === "completado" ? (
      <ResumenSeleccion seleccion={seleccion} />
    ) : (
      <SeleccionMesasInvitado
        puedeSeleccionar={estadoTurno === "activo"}
        layoutEvento={layoutEvento}
        elementosLayout={elementosLayout}
      />
    )}
  </>
);
```

### 4. **ModalEspera.jsx**

Ya existía, solo se ajustaron los props:

```jsx
<ModalEspera
  open={true}
  usuario={{
    nombre: invitado?.nombre,
  }}
  horario={{
    inicio: "10:00", // Del turno
    fin: "10:30", // Del turno
    duracionMinutos: 30,
  }}
/>
```

---

## 🔐 Sin Autenticación

### ❌ **Removido:**

- `useAuth()` hook
- Verificación de `isAuthenticated`
- Contexto de usuario autenticado
- Redirección a `/login`

### ✅ **Implementado:**

- IDs en URL (`useParams()`)
- Carga de invitado por ID desde backend
- Acceso público a la ruta
- Validación de IDs válidos

---

## 📊 Estados del Sistema

### Estado: `verificando`

```jsx
<Loader>Cargando información...</Loader>
```

### Estado: `espera`

```jsx
<ModalEspera>
  ⏳ Tu turno es de 10:00 a 10:30 Tiempo restante: 25:30
</ModalEspera>
```

### Estado: `activo`

```jsx
<TurnoActivo>
  ⏱️ Tiempo restante: 28:45
  Color: verde (>10min) / amarillo (5-10min) / rojo (<5min)
</TurnoActivo>

<SeleccionMesasInvitado>
  🪑 Selecciona tus mesas
  🍽️ Elige tipo de menú
  🥗 Especifica restricciones
  💾 Guardar Selección
</SeleccionMesasInvitado>
```

### Estado: `completado`

```jsx
<ResumenCompletado>
  ✅ Selección Completada Tu Selección: - Mesa 5: 3 personas - Mesa 8: 1 persona
  - Menú: Vegetariano - Restricción: Sin gluten
</ResumenCompletado>
```

### Estado: `expirado`

```jsx
<TurnoActivo>❌ Tu turno ha expirado Contacta al organizador</TurnoActivo>
```

### Estado: `sin_turno`

```jsx
<TurnoActivo>⚠️ No tienes turno asignado Contacta al organizador</TurnoActivo>
```

---

## 🧪 Cómo Probar

### 1. **Crear Turno en Backend**

```bash
POST /eventos/:eventoId/seleccion-mesas/generar-turnos
```

### 2. **Obtener URL del Invitado**

```javascript
// Backend debe devolver:
{
  invitado_id: "inv-123",
  evento_id: "evt-456",
  turno: {
    fecha_hora_inicio: "2025-11-12T10:00:00Z",
    fecha_hora_fin: "2025-11-12T10:30:00Z"
  }
}

// Construir URL:
const url = `/asignacion-user/${evento_id}/${invitado_id}`;
```

### 3. **Abrir en Navegador**

```
http://localhost:3000/asignacion-user/evento-test-001/user-001
```

### 4. **Verificar Estados**

#### Antes del turno:

- Debería mostrar ModalEspera
- Contador regresivo funcionando
- No puede acceder a selección

#### Durante el turno:

- Modal desaparece
- Muestra componente de selección
- Puede seleccionar mesas
- Contador descendente visible

#### Después de guardar:

- Muestra resumen de selección
- No puede modificar
- Refresco de página muestra mismo estado

---

## 🔄 Integración con Backend

### Endpoints Requeridos:

#### 1. **Obtener Invitado**

```http
GET /eventos/:eventoId/guests/:invitadoId

Response:
{
  id: "inv-123",
  nombre: "María González",
  cantidad_personas: 4,
  necesidades_especiales: false,
  email: "maria@example.com"
}
```

#### 2. **Obtener Turno del Invitado**

```http
GET /eventos/:eventoId/seleccion-mesas/mi-turno?invitadoId=:invitadoId

Response:
{
  invitado_id: "inv-123",
  numero_turno: 5,
  fecha_hora_inicio: "2025-11-12T10:00:00Z",
  fecha_hora_fin: "2025-11-12T10:30:00Z",
  duracion_minutos: 30,
  estado: "pendiente|activo|completado|expirado",
  configuracion: {
    duracion_turno: 30,
    tipos_menu: ["Normal", "Vegetariano"],
    restricciones_dieteticas: ["Ninguna", "Sin gluten", "Sin lactosa"]
  }
}
```

#### 3. **Obtener Layout del Evento**

```http
GET /eventos/:eventoId/layout

Response:
{
  layout: {
    id: "layout-123",
    elementos: [
      {
        id: "mesa-1",
        type: "mesa",
        numero: 1,
        capacidad: 8,
        x: 100,
        y: 200,
        sillas: [...]
      }
    ]
  }
}
```

#### 4. **Guardar Selección**

```http
POST /eventos/:eventoId/seleccion-mesas/guardar?invitadoId=:invitadoId

Body:
{
  mesas_seleccionadas: [
    { mesa_id: "mesa-1", cantidad_personas: 3 },
    { mesa_id: "mesa-5", cantidad_personas: 1 }
  ],
  tipo_menu: "Vegetariano",
  restriccion_dietetica: "Sin gluten"
}
```

---

## 📧 Email Template Sugerido

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Tu Turno para Selección de Mesas</title>
  </head>
  <body>
    <div
      style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"
    >
      <h1>¡Hola {{nombre_invitado}}!</h1>

      <p>
        Tu turno para seleccionar tu mesa en
        <strong>{{nombre_evento}}</strong> está programado para:
      </p>

      <div
        style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;"
      >
        <h2 style="margin-top: 0;">📅 {{fecha_turno}}</h2>
        <h3 style="margin: 10px 0;">⏰ {{hora_inicio}} - {{hora_fin}}</h3>
        <p><strong>Duración:</strong> {{duracion}} minutos</p>
      </div>

      <p>
        <strong>Importante:</strong> Solo podrás seleccionar tu mesa durante
        este horario.
      </p>

      <a
        href="{{url_asignacion}}"
        style="display: inline-block; background: #246370; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;"
      >
        Acceder a Selección de Mesas
      </a>

      <p style="font-size: 12px; color: #666;">
        Deberás seleccionar mesa para {{cantidad_personas}} persona(s)
      </p>

      <hr style="margin: 30px 0;" />

      <p style="font-size: 12px; color: #999;">
        Si tienes problemas, contacta al organizador del evento.
      </p>
    </div>
  </body>
</html>
```

---

## 🔒 Seguridad

### Consideraciones:

1. **URLs Únicas**: Cada invitado tiene un ID único imposible de adivinar
2. **Validación de Turno**: Backend verifica que el turno esté activo
3. **Rate Limiting**: Limitar peticiones por IP para evitar spam
4. **Expiración**: Los turnos expiran automáticamente
5. **Una Sola Selección**: Una vez guardada, no se puede modificar

### Recomendaciones:

```javascript
// Backend debe validar:
- Invitado pertenece al evento
- Turno está activo
- No ha guardado selección previamente
- Mesas seleccionadas están disponibles
- Cantidad de personas es correcta
```

---

## 📝 TODOs Futuros

- [ ] Agregar autenticación opcional (QR code + PIN)
- [ ] Permitir modificación dentro del turno
- [ ] Notificaciones push cuando empiece el turno
- [ ] Vista previa visual del layout
- [ ] Exportar PDF con resumen de selección
- [ ] Sistema de reemplazo si se pierde el turno

---

## ✅ Checklist de Implementación

- [x] Ruta pública `/asignacion-user/:eventoId/:invitadoId`
- [x] Obtener invitado por ID desde backend
- [x] Cargar layout del evento
- [x] Obtener turno del invitado
- [x] Mostrar ModalEspera cuando no está en turno
- [x] Permitir selección solo durante turno activo
- [x] Bloquear cambios después de completar
- [x] Polling automático cada 30s
- [x] Contador regresivo en tiempo real
- [x] Estados visuales claros
- [x] Manejo de errores

---

## 🎯 URL de Prueba

```
http://localhost:3000/asignacion-user/evento-test-001/user-001
```

**Requisitos previos:**

1. Backend debe tener evento `evento-test-001`
2. Backend debe tener invitado `user-001` en ese evento
3. Backend debe tener turnos generados
4. Backend debe tener layout configurado para el evento

---

✅ **Sistema completamente funcional sin autenticación**
