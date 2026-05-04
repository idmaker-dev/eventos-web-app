# Sistema de Configuración de Layout para Lugares y Eventos

## 📋 Resumen

Este sistema permite gestionar múltiples configuraciones de layout (salones) para cada lugar, y asignar/personalizar estas configuraciones a eventos específicos.

## 🏗️ Arquitectura

### Contenedores CosmosDB

1. **lugares** - Almacena información básica de lugares
2. **configuracionesLugar** - Almacena las configuraciones de layout (salones) de cada lugar
   - Partition Key: `/lugar_id`
3. **eventos** - Almacena eventos con referencia opcional a configuración de layout

### Flujo de Datos

```
Lugar (lugar_id)
  └── Configuraciones (salones)
       ├── Configuración 1: "Salón Principal"
       ├── Configuración 2: "Salón VIP"
       └── Configuración 3: "Terraza"

Evento (evento_id)
  └── configuracion_layout
       ├── configuracion_lugar_base_id → Referencia a configuración del lugar
       ├── personalizado: true/false
       └── elementos[] → Si está personalizado, array de elementos modificados
```

## 📡 Endpoints

### Configuraciones de Lugar

#### 1. Crear Configuración (Salón) de un Lugar

**POST** `/api/lugares/{lugarId}/configuraciones`

**Autenticación**: Solo `admin`

**Body**:

```json
{
  "nombre": "Salón Principal",
  "descripcion": "Layout tradicional con mesas redondas",
  "totalMesas": 12,
  "elementos": [
    {
      "id": "mesa-1",
      "type": "mesa",
      "numero": 1,
      "invitados": 0,
      "capacidad": 8,
      "position": { "x": 100, "y": 100 }
    },
    {
      "id": "escenario-1",
      "type": "escenario",
      "position": { "x": 450, "y": 150 }
    }
  ]
}
```

**Respuesta**:

```json
{
  "success": true,
  "data": {
    "configuracion": {
      "id": "config-uuid",
      "lugar_id": "lugar-uuid",
      "nombre": "Salón Principal",
      "descripcion": "Layout tradicional...",
      "totalMesas": 12,
      "elementos": [...],
      "activo": true,
      "version": 1,
      "historial_cambios": [...]
    }
  },
  "message": "Configuración creada exitosamente"
}
```

---

#### 2. Listar Configuraciones de un Lugar

**GET** `/api/lugares/{lugarId}/configuraciones?incluir_inactivas=false`

**Autenticación**: Solo `admin`

**Respuesta**:

```json
{
  "success": true,
  "data": {
    "configuraciones": [
      {
        "id": "config-1",
        "nombre": "Salón Principal",
        "totalMesas": 12,
        "activo": true
      },
      {
        "id": "config-2",
        "nombre": "Salón VIP",
        "totalMesas": 6,
        "activo": true
      }
    ],
    "total": 2,
    "lugar_id": "lugar-uuid"
  }
}
```

---

#### 3. Obtener Configuración Específica

**GET** `/api/configuraciones/{configId}?lugar_id={lugarId}`

**Autenticación**: Solo `admin`

**Respuesta**: Configuración completa con todos los elementos

---

#### 4. Actualizar Configuración

**PUT** `/api/configuraciones/{configId}?lugar_id={lugarId}`

**Autenticación**: Solo `admin`

**Body**:

```json
{
  "nombre": "Salón Principal Actualizado",
  "descripcion": "Nueva descripción",
  "elementos": [...]
}
```

**Nota**: Al actualizar, se incrementa la versión y se guarda en el historial de cambios.

---

#### 5. Desactivar Configuración

**DELETE** `/api/configuraciones/{configId}?lugar_id={lugarId}`

**Autenticación**: Solo `admin`

**Nota**: No permite desactivar si hay eventos usando esta configuración (soft delete).

---

#### 6. Duplicar Configuración

**POST** `/api/configuraciones/{configId}/duplicar?lugar_id={lugarId}`

**Autenticación**: Solo `admin`

**Body**:

```json
{
  "nuevo_nombre": "Copia de Salón Principal"
}
```

**Respuesta**: Nueva configuración creada con los mismos elementos

---

#### 7. Estadísticas de Configuraciones

**GET** `/api/lugares/{lugarId}/configuraciones/estadisticas`

**Autenticación**: Solo `admin`

**Respuesta**:

```json
{
  "success": true,
  "data": {
    "estadisticas": {
      "total_configuraciones": 3,
      "activas": 3,
      "inactivas": 0,
      "total_mesas_disponibles": 26
    }
  }
}
```

---

### Layout de Eventos

#### 1. Asignar Configuración Base a Evento

**POST** `/api/eventos/{eventoId}/layout/asignar`

**Autenticación**: Solo `admin`

**Body**:

```json
{
  "configuracion_lugar_id": "config-uuid"
}
```

**Flujo**:

1. Verifica que el evento exista
2. Verifica que el evento tenga un `lugar_id`
3. Verifica que la configuración pertenezca al lugar del evento
4. Asigna la configuración base (sin copiar elementos aún)

**Respuesta**:

```json
{
  "success": true,
  "data": {
    "evento": {...},
    "configuracion_layout": {
      "configuracion_lugar_base_id": "config-uuid",
      "configuracion_lugar_base_nombre": "Salón Principal",
      "personalizado": false,
      "elementos": null,
      "asignado_at": "2025-10-31T..."
    }
  }
}
```

---

#### 2. Obtener Layout de Evento

**GET** `/api/eventos/{eventoId}/layout`

**Autenticación**: Solo `admin`

**Respuesta (si no está personalizado)**:

```json
{
  "success": true,
  "data": {
    "layout": {
      "tiene_configuracion": true,
      "evento_id": "evento-uuid",
      "configuracion_lugar_base_id": "config-uuid",
      "configuracion_lugar_base_nombre": "Salón Principal",
      "personalizado": false,
      "elementos": [...], // Elementos del lugar
      "totalMesas": 12
    }
  }
}
```

**Respuesta (si está personalizado)**:

```json
{
  "success": true,
  "data": {
    "layout": {
      "tiene_configuracion": true,
      "evento_id": "evento-uuid",
      "configuracion_lugar_base_id": "config-uuid",
      "configuracion_lugar_base_nombre": "Salón Principal",
      "personalizado": true,
      "elementos": [...], // Elementos personalizados del evento
      "totalMesas": 10,
      "version": 2
    }
  }
}
```

---

#### 3. Personalizar Layout de Evento

**PUT** `/api/eventos/{eventoId}/layout/personalizar`

**Autenticación**: Solo `admin`

**Body**:

```json
{
  "elementos": [
    {
      "id": "mesa-1",
      "type": "mesa",
      "numero": 1,
      "invitados": 0,
      "capacidad": 8,
      "position": { "x": 150, "y": 120 }
    }
  ]
}
```

**Flujo**:

1. Valida estructura de elementos
2. Marca `personalizado: true`
3. Guarda elementos personalizados en el evento
4. Incrementa versión

---

#### 4. Resetear Layout a Configuración Base

**POST** `/api/eventos/{eventoId}/layout/resetear`

**Autenticación**: Solo `admin`

**Flujo**:

1. Marca `personalizado: false`
2. Elimina elementos personalizados
3. El evento vuelve a usar la configuración del lugar

---

#### 5. Eliminar Layout de Evento

**DELETE** `/api/eventos/{eventoId}/layout`

**Autenticación**: Solo `admin`

**Flujo**: Elimina completamente la configuración de layout del evento

---

## 🎨 Tipos de Elementos Válidos

```javascript
const TIPOS_ELEMENTOS_VALIDOS = [
  "mesa", // Requiere: numero, capacidad, invitados
  "mesa-principal", // Requiere: capacidad
  "entrada",
  "barra",
  "pistaBaileRedonda",
  "pistaBaileCuadrada",
  "escenario",
  "buffet",
  "cocina",
  "bano",
  "decoracion",
];
```

## 🔒 Validaciones

### Para Configuraciones de Lugar:

- ✅ Nombre requerido
- ✅ `totalMesas` debe coincidir con el conteo real de elementos tipo "mesa"
- ✅ Todos los elementos deben tener `id` único
- ✅ Todos los elementos deben tener `type` válido
- ✅ Todos los elementos deben tener `position` con `x` e `y` numéricos
- ✅ Mesas deben tener `numero` y `capacidad`
- ✅ No se puede desactivar si hay eventos usándola

### Para Layout de Eventos:

- ✅ Evento debe existir
- ✅ Evento debe tener `lugar_id`
- ✅ Configuración debe pertenecer al lugar del evento
- ✅ Mismas validaciones de elementos que configuraciones de lugar

## 📊 Control de Versiones

Cada configuración y layout personalizado tiene:

```json
{
  "version": 2,
  "historial_cambios": [
    {
      "version": 1,
      "accion": "creacion",
      "usuario": "admin-user-id",
      "fecha": "2025-10-31T10:00:00Z",
      "cambios": "Configuración creada"
    },
    {
      "version": 2,
      "accion": "actualizacion",
      "usuario": "admin-user-id",
      "fecha": "2025-10-31T11:00:00Z",
      "cambios": "Elementos actualizados (12 elementos, 12 mesas)"
    }
  ]
}
```

## 🚀 Ejemplo de Flujo Completo

```bash
# 1. Crear lugar
POST /api/lugares/crear
{
  "nombre": "Poliforum León",
  "direccion": "Av. Principal 123",
  ...
}
# → lugar_id: "lugar-123"

# 2. Agregar configuraciones (salones) al lugar
POST /api/lugares/lugar-123/configuraciones
{
  "nombre": "Salón Principal",
  "totalMesas": 12,
  "elementos": [...]
}
# → config_id: "config-abc"

POST /api/lugares/lugar-123/configuraciones
{
  "nombre": "Salón VIP",
  "totalMesas": 6,
  "elementos": [...]
}
# → config_id: "config-xyz"

# 3. Crear evento
POST /api/eventos/crear
{
  "nombreEvento": "Graduación 2025",
  "lugar_id": "lugar-123",
  ...
}
# → evento_id: "evento-456"

# 4. Asignar configuración base al evento
POST /api/eventos/evento-456/layout/asignar
{
  "configuracion_lugar_id": "config-abc"
}

# 5. Obtener layout del evento (hereda del lugar)
GET /api/eventos/evento-456/layout
# → Devuelve elementos de "Salón Principal"

# 6. Personalizar layout para este evento
PUT /api/eventos/evento-456/layout/personalizar
{
  "elementos": [
    // Array modificado con cambios
  ]
}

# 7. Si necesita volver a la configuración original
POST /api/eventos/evento-456/layout/resetear
```

## 📝 Notas Importantes

1. **Lazy Loading**: Los elementos no se copian al evento hasta que se personaliza. Si no está personalizado, se leen directamente de la configuración del lugar.

2. **Integridad Referencial**: No se puede desactivar una configuración si hay eventos usándola.

3. **Partition Keys**:

   - `configuracionesLugar` usa `/lugar_id` como partition key
   - Siempre se debe proporcionar `lugar_id` al consultar configuraciones específicas

4. **Control de Acceso**: Todos los endpoints requieren rol `admin`

5. **Auditoría**: Todos los cambios se registran con usuario y timestamp

## 🐛 Errores Comunes

### Error 400: "El totalMesas no coincide..."

**Causa**: El número de elementos tipo "mesa" no coincide con el campo `totalMesas`
**Solución**: Ajustar `totalMesas` o agregar/quitar mesas del array de elementos

### Error 400: "La configuración seleccionada no pertenece al lugar del evento"

**Causa**: Intentando asignar configuración de un lugar diferente
**Solución**: Verificar que la configuración pertenezca al mismo lugar del evento

### Error 409: "...está siendo utilizada por X evento(s)"

**Causa**: Intentando desactivar configuración en uso
**Solución**: Primero remover la configuración de todos los eventos que la usan

## 🔄 Migración de Datos Existentes

Si ya tienes lugares y eventos:

1. Los lugares existentes no tienen configuraciones → agrégalas cuando sea necesario
2. Los eventos existentes no tienen `configuracion_layout` → asígnalas cuando sea necesario
3. No hay migración automática requerida, es opt-in

---

**Versión del Sistema**: 1.0.0  
**Fecha**: Octubre 31, 2025  
**Autor**: Sistema EventosAPI
