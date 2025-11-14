# Sistema de Selección de Mesas por Turnos

Sistema completo para gestionar la selección de mesas en eventos de graduación mediante turnos programados ordenados por fecha de liquidación de deuda.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
- [Flujo del Proceso](#flujo-del-proceso)
- [API Endpoints](#api-endpoints)
- [Modelos de Datos](#modelos-de-datos)
- [Casos de Uso](#casos-de-uso)

---

## 📖 Descripción General

Este sistema permite que los invitados de un evento seleccionen sus mesas y menús de manera ordenada mediante un sistema de turnos. **La prioridad de turnos se asigna según la fecha de liquidación completa de la deuda**, recompensando a quienes pagaron primero.

### Características Principales

- ✅ **Turnos priorizados por fecha de pago**: El primer turno es para quien liquidó su deuda primero
- ✅ **Configuración flexible**: Horarios, duraciones, tiempos muertos personalizables
- ✅ **Validación de acceso**: Solo pueden seleccionar durante su turno asignado
- ✅ **Selección de menús**: Normal, Infantil, Especial, Celíaco, Kosher
- ✅ **Restricciones dietéticas**: Por cada asiento/comensal
- ✅ **Verificación de disponibilidad**: Previene selecciones duplicadas
- ✅ **Reportes Excel**: Exportación de todas las selecciones
- ✅ **Reprogramación manual**: Admin puede ajustar turnos

---

## 🏗️ Arquitectura

### Containers de CosmosDB

#### 1. `configuracionesSeleccion`

**Partition Key**: `/evento_id`

Almacena la configuración del proceso de selección por evento.

```json
{
  "id": "config_evento123",
  "evento_id": "evento123",
  "fecha_inicio_seleccion": "2025-12-01T09:00:00Z",
  "fecha_fin_seleccion": "2025-12-15T18:00:00Z",
  "duracion_turno_minutos": 15,
  "tiempo_muerto_minutos": 5,
  "horarios_disponibles": [
    { "inicio": "09:00", "fin": "12:00" },
    { "inicio": "14:00", "fin": "18:00" }
  ],
  "dias_excluidos": [0, 6],
  "periodos_tiempo_muerto": [
    { "inicio": "2025-12-05T12:00:00Z", "fin": "2025-12-05T14:00:00Z" }
  ],
  "tipos_menu": [
    { "id": "normal", "nombre": "Normal" },
    { "id": "infantil", "nombre": "Infantil" },
    { "id": "celiaco", "nombre": "Celíaco" }
  ],
  "estado": "ACTIVO",
  "created_at": "2025-11-10T10:00:00Z"
}
```

#### 2. `turnos`

**Partition Key**: `/evento_id`

Almacena los turnos asignados a cada invitado.

```json
{
  "id": "turno_evento123_invitado456",
  "evento_id": "evento123",
  "invitado_id": "invitado456",
  "numero_turno": 1,
  "fecha_hora_inicio": "2025-12-01T09:00:00Z",
  "fecha_hora_fin": "2025-12-01T09:15:00Z",
  "fecha_liquidacion": "2025-10-15T14:30:00Z",
  "estado": "ASIGNADO",
  "seleccion_realizada": false,
  "created_at": "2025-11-10T10:00:00Z"
}
```

**Estados del turno:**

- `ASIGNADO`: Turno asignado, esperando
- `EN_CURSO`: Turno activo ahora
- `COMPLETADO`: Selección realizada
- `NO_PRESENTADO`: No se presentó a tiempo
- `REPROGRAMADO`: Fue reprogramado manualmente

#### 3. `seleccionesMesas`

**Partition Key**: `/evento_id`

Almacena las selecciones de mesas y menús realizadas.

```json
{
  "id": "seleccion_evento123_invitado456",
  "evento_id": "evento123",
  "invitado_id": "invitado456",
  "invitado_nombre": "Juan Pérez",
  "invitado_numero": "001",
  "cantidad_boletos": 5,
  "mesas_seleccionadas": [
    {
      "mesa_id": "mesa_12",
      "mesa_numero": 12,
      "mesa_tipo": "mesaRedonda",
      "asientos_seleccionados": [
        {
          "asiento_id": "asiento_1",
          "asiento_numero": 1,
          "nombre_comensal": "Juan Pérez",
          "tipo_menu": "normal",
          "restricciones_dieteticas": ["Ninguna"],
          "notas": ""
        }
      ]
    }
  ],
  "resumen_menus": {
    "normal": 3,
    "infantil": 2
  },
  "estado": "CONFIRMADA",
  "fecha_seleccion": "2025-12-01T09:10:00Z"
}
```

### Services

#### ConfiguracionSeleccionService

- `configurarProcesoSeleccion()` - Crear/actualizar configuración
- `obtenerConfiguracion()` - Obtener configuración
- `actualizarEstado()` - Cambiar estado (ACTIVO, PAUSADO, etc.)
- `calcularTurnosDisponibles()` - Estimar cantidad de turnos
- `estaProcesoActivo()` - Verificar si está activo

#### TurnosService

- `generarTurnos()` - **Genera turnos ordenados por fecha de liquidación**
- `obtenerTurnoPorInvitado()` - Obtener turno de un invitado
- `obtenerTurnosEvento()` - Obtener todos los turnos
- `verificarAccesoTurno()` - Verificar si puede acceder ahora
- `actualizarEstadoTurno()` - Cambiar estado del turno
- `reprogramarTurno()` - Reprogramar manualmente
- `generarSlotsDisponibles()` - Calcular slots de tiempo

#### SeleccionMesasService

- `guardarSeleccion()` - Guardar selección con validaciones
- `obtenerSeleccion()` - Obtener selección de un invitado
- `obtenerSeleccionesEvento()` - Todas las selecciones
- `generarReporteExcel()` - Datos para Excel
- `obtenerEstadoOcupacion()` - Estado de ocupación de mesas
- `verificarDisponibilidadMesas()` - Validar disponibilidad
- `cancelarSeleccion()` - Cancelar selección

#### DeudasService (Extendido)

- `obtenerFechaLiquidacion()` - **Fecha de liquidación de un invitado**
- `obtenerFechasLiquidacionEvento()` - **Fechas de todos los invitados**

---

## 🔄 Flujo del Proceso

### 1. Configuración (Admin)

```
POST /api/eventos/{eventoId}/seleccion-mesas/configuracion
```

El administrador configura:

- Rango de fechas para el proceso
- Duración de cada turno (ej: 15 minutos)
- Tiempo muerto entre turnos (ej: 5 minutos)
- Horarios disponibles por día
- Días excluidos (fines de semana, etc.)
- Tipos de menú disponibles

### 2. Generación de Turnos (Admin)

```
POST /api/eventos/{eventoId}/seleccion-mesas/generar-turnos
```

El sistema:

1. Consulta todas las deudas del evento
2. **Filtra solo invitados con deuda PAGADA**
3. **Ordena por fecha del último pago que completó la deuda**
4. Genera slots de tiempo según configuración
5. Asigna turnos en orden de prioridad

**Resultado:**

- Invitado que pagó el 2025-10-01 → Turno #1
- Invitado que pagó el 2025-10-05 → Turno #2
- Invitado que pagó el 2025-10-10 → Turno #3
- Invitado con deuda pendiente → Sin turno

### 3. Consulta de Turno (Invitado)

```
GET /api/eventos/{eventoId}/seleccion-mesas/mi-turno?invitadoId=xxx
```

El invitado consulta:

- Su número de turno
- Fecha y hora asignada
- Minutos restantes hasta su turno
- Estado actual

### 4. Verificación de Acceso (Invitado)

```
GET /api/eventos/{eventoId}/seleccion-mesas/verificar-acceso?invitadoId=xxx
```

El sistema verifica:

- ¿Tiene turno asignado?
- ¿Su turno está activo ahora?
- ¿Ya completó su selección?
- ¿Su turno ya pasó?

**Respuestas posibles:**

- ✅ "Puedes realizar tu selección ahora"
- ❌ "Tu turno comienza en 30 minutos"
- ❌ "Ya completaste tu selección"
- ❌ "Tu turno ha finalizado"

### 5. Selección de Mesas (Invitado)

```
POST /api/eventos/{eventoId}/seleccion-mesas/guardar
```

El invitado selecciona:

- Una o más mesas
- Asientos específicos en cada mesa
- Menú para cada asiento
- Restricciones dietéticas
- Notas adicionales

**Validaciones:**

- Número de asientos = cantidad de boletos
- Asientos no ocupados por otros
- Turno activo en este momento

### 6. Reporte (Admin)

```
GET /api/eventos/{eventoId}/seleccion-mesas/reporte
```

Genera datos para Excel con:

- Invitado, Mesa, Asiento, Menú
- Restricciones dietéticas
- Resumen de menús totales
- Estado de ocupación

---

## 🛠️ API Endpoints

### Endpoints de Configuración

#### POST `/api/eventos/{eventoId}/seleccion-mesas/configuracion`

**Auth:** Admin

Configura el proceso de selección.

**Request Body:**

```json
{
  "fecha_inicio_seleccion": "2025-12-01T09:00:00Z",
  "fecha_fin_seleccion": "2025-12-15T18:00:00Z",
  "duracion_turno_minutos": 15,
  "tiempo_muerto_minutos": 5,
  "horarios_disponibles": [{ "inicio": "09:00", "fin": "18:00" }],
  "dias_excluidos": [0, 6],
  "tipos_menu": [{ "id": "normal", "nombre": "Normal" }],
  "generar_turnos": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Configuración creada y turnos generados",
  "data": {
    "configuracion": {
      /* ... */
    },
    "turnos": {
      "turnos_generados": 45,
      "invitados_sin_turno": 5
    }
  }
}
```

#### GET `/api/eventos/{eventoId}/seleccion-mesas/configuracion`

**Auth:** Admin, Novio

Obtiene la configuración actual.

---

### Endpoints de Turnos (Invitados)

#### GET `/api/eventos/{eventoId}/seleccion-mesas/mi-turno?invitadoId=xxx`

**Auth:** Público (con invitadoId)

Consulta el turno asignado.

**Response:**

```json
{
  "success": true,
  "data": {
    "tiene_turno": true,
    "turno": {
      "numero_turno": 1,
      "fecha_hora_inicio": "2025-12-01T09:00:00Z",
      "fecha_hora_fin": "2025-12-01T09:15:00Z",
      "fecha_liquidacion": "2025-10-15T14:30:00Z",
      "estado": "ASIGNADO",
      "estado_actual": "PENDIENTE",
      "minutos_restantes": 120
    },
    "mensaje": "Tu turno comenzará en 120 minutos"
  }
}
```

#### GET `/api/eventos/{eventoId}/seleccion-mesas/verificar-acceso?invitadoId=xxx`

**Auth:** Público (con invitadoId)

Verifica si puede acceder ahora.

**Response:**

```json
{
  "success": true,
  "data": {
    "puede_acceder": true,
    "turno": {
      /* ... */
    },
    "mensaje": "Puedes realizar tu selección ahora"
  }
}
```

---

### Endpoint de Selección

#### POST `/api/eventos/{eventoId}/seleccion-mesas/guardar?invitadoId=xxx`

**Auth:** Público (con invitadoId)

Guarda la selección de mesas.

**Request Body:**

```json
{
  "mesas_seleccionadas": [
    {
      "mesa_id": "mesa_12",
      "mesa_numero": 12,
      "mesa_tipo": "mesaRedonda",
      "asientos_seleccionados": [
        {
          "asiento_id": "asiento_1",
          "asiento_numero": 1,
          "nombre_comensal": "Juan Pérez",
          "tipo_menu": "normal",
          "restricciones_dieteticas": ["Ninguna"],
          "notas": ""
        },
        {
          "asiento_id": "asiento_2",
          "asiento_numero": 2,
          "nombre_comensal": "María López",
          "tipo_menu": "celiaco",
          "restricciones_dieteticas": ["Sin gluten"],
          "notas": "Alergia severa al trigo"
        }
      ]
    }
  ]
}
```

**Validaciones:**

- ✅ Turno activo en este momento
- ✅ Número de asientos = cantidad de boletos del invitado
- ✅ Asientos disponibles (no ocupados)
- ✅ Estructura de datos correcta

**Response:**

```json
{
  "success": true,
  "message": "Selección guardada exitosamente",
  "data": {
    "id": "seleccion_evento123_invitado456",
    "estado": "CONFIRMADA",
    "resumen_menus": {
      "normal": 1,
      "celiaco": 1
    }
  }
}
```

---

### Endpoints Administrativos

#### GET `/api/eventos/{eventoId}/seleccion-mesas/turnos`

**Auth:** Admin, Novio

Lista todos los turnos del evento con información de invitados.

**Response:**

```json
{
  "success": true,
  "data": {
    "turnos": [
      {
        "numero_turno": 1,
        "invitado_id": "inv123",
        "invitado_info": {
          "nombre_completo": "Juan Pérez",
          "numero": "001",
          "cantidad_boletos": 5
        },
        "fecha_hora_inicio": "2025-12-01T09:00:00Z",
        "fecha_liquidacion": "2025-10-15T14:30:00Z",
        "estado": "COMPLETADO",
        "seleccion_realizada": true
      }
    ],
    "estadisticas": {
      "total_turnos": 45,
      "por_estado": {
        "COMPLETADO": 30,
        "ASIGNADO": 15
      },
      "selecciones_realizadas": 30
    }
  }
}
```

#### GET `/api/eventos/{eventoId}/seleccion-mesas/reporte`

**Auth:** Admin, Novio

Genera reporte Excel de selecciones.

**Response:**

```json
{
  "success": true,
  "data": {
    "datos": [
      {
        "numero_invitado": "001",
        "nombre_invitado": "Juan Pérez",
        "mesa_numero": 12,
        "mesa_tipo": "mesaRedonda",
        "asiento_numero": 1,
        "nombre_comensal": "Juan Pérez",
        "tipo_menu": "normal",
        "restricciones": "Ninguna",
        "notas": "",
        "fecha_seleccion": "01/12/2025"
      }
    ],
    "columnas": ["numero_invitado", "nombre_invitado", ...],
    "resumen": {
      "total_selecciones": 30,
      "total_asientos_ocupados": 150,
      "resumen_menus": {
        "normal": 100,
        "infantil": 30,
        "celiaco": 20
      }
    },
    "ocupacion": {
      "capacidad_total": 200,
      "asientos_ocupados": 150,
      "asientos_disponibles": 50,
      "porcentaje_ocupacion": 75
    }
  }
}
```

#### PUT `/api/eventos/{eventoId}/seleccion-mesas/reprogramar`

**Auth:** Admin

Reprograma un turno manualmente.

**Request Body:**

```json
{
  "invitado_id": "inv456",
  "fecha_hora_inicio": "2025-12-02T10:00:00Z",
  "fecha_hora_fin": "2025-12-02T10:15:00Z"
}
```

#### POST `/api/eventos/{eventoId}/seleccion-mesas/generar-turnos`

**Auth:** Admin

Genera o regenera todos los turnos del evento.

---

## 📊 Modelos de Datos

### ConfiguracionSeleccion

| Campo                    | Tipo     | Descripción                              |
| ------------------------ | -------- | ---------------------------------------- |
| `id`                     | string   | ID único                                 |
| `evento_id`              | string   | ID del evento (partition key)            |
| `fecha_inicio_seleccion` | ISO 8601 | Inicio del proceso                       |
| `fecha_fin_seleccion`    | ISO 8601 | Fin del proceso                          |
| `duracion_turno_minutos` | number   | Duración de cada turno                   |
| `tiempo_muerto_minutos`  | number   | Buffer entre turnos                      |
| `horarios_disponibles`   | array    | Horarios por día                         |
| `dias_excluidos`         | array    | Días no laborables                       |
| `periodos_tiempo_muerto` | array    | Períodos específicos excluidos           |
| `tipos_menu`             | array    | Menús disponibles                        |
| `estado`                 | enum     | CONFIGURADO, ACTIVO, PAUSADO, FINALIZADO |

### Turno

| Campo                 | Tipo     | Descripción                                                 |
| --------------------- | -------- | ----------------------------------------------------------- |
| `id`                  | string   | ID único                                                    |
| `evento_id`           | string   | ID del evento (partition key)                               |
| `invitado_id`         | string   | ID del invitado                                             |
| `numero_turno`        | number   | Orden del turno (1, 2, 3...)                                |
| `fecha_hora_inicio`   | ISO 8601 | Inicio del turno                                            |
| `fecha_hora_fin`      | ISO 8601 | Fin del turno                                               |
| `fecha_liquidacion`   | ISO 8601 | **Fecha que determinó su prioridad**                        |
| `estado`              | enum     | ASIGNADO, EN_CURSO, COMPLETADO, NO_PRESENTADO, REPROGRAMADO |
| `seleccion_realizada` | boolean  | Si completó la selección                                    |
| `fecha_seleccion`     | ISO 8601 | Cuándo realizó la selección                                 |

### SeleccionMesa

| Campo                 | Tipo     | Descripción                       |
| --------------------- | -------- | --------------------------------- |
| `id`                  | string   | ID único                          |
| `evento_id`           | string   | ID del evento (partition key)     |
| `invitado_id`         | string   | ID del invitado                   |
| `invitado_nombre`     | string   | Nombre del invitado               |
| `cantidad_boletos`    | number   | Boletos del invitado              |
| `mesas_seleccionadas` | array    | Mesas y asientos                  |
| `resumen_menus`       | object   | Conteo por tipo de menú           |
| `estado`              | enum     | CONFIRMADA, MODIFICADA, CANCELADA |
| `fecha_seleccion`     | ISO 8601 | Fecha de la selección             |

---

## 💡 Casos de Uso

### Caso 1: Configurar y Generar Turnos

**Objetivo:** Admin configura proceso y genera turnos automáticamente.

**Pasos:**

1. Admin crea configuración con fechas y horarios
2. Sistema calcula slots disponibles
3. Sistema consulta deudas del evento
4. Sistema filtra invitados con deuda PAGADA
5. Sistema ordena por fecha de liquidación (más antigua primero)
6. Sistema asigna turnos en orden

**Resultado:**

- 50 invitados con deuda pagada → 50 turnos generados
- 10 invitados con deuda pendiente → Sin turno (en cola de espera)

### Caso 2: Invitado Consulta su Turno

**Objetivo:** Invitado verifica cuándo puede hacer su selección.

**Pasos:**

1. Invitado accede al sistema con su ID
2. Sistema busca su turno asignado
3. Sistema calcula minutos restantes
4. Sistema muestra fecha/hora y estado

**Resultado:**

- "Tu turno es el #5"
- "Fecha: 01/12/2025 a las 10:00"
- "Liquidaste tu deuda el: 15/10/2025"
- "Faltan 48 horas para tu turno"

### Caso 3: Invitado Realiza Selección

**Objetivo:** Durante su turno, invitado selecciona mesas.

**Pasos:**

1. Invitado verifica acceso → "Turno activo"
2. Invitado visualiza layout del evento
3. Invitado selecciona mesa(s) y asientos
4. Invitado asigna menú a cada asiento
5. Invitado agrega restricciones dietéticas
6. Sistema valida disponibilidad
7. Sistema guarda selección
8. Sistema marca turno como COMPLETADO

**Validaciones:**

- ✅ Turno activo ahora
- ✅ 5 boletos → 5 asientos seleccionados
- ✅ Asientos disponibles
- ✅ Menús válidos

### Caso 4: Admin Genera Reporte

**Objetivo:** Admin exporta todas las selecciones a Excel.

**Pasos:**

1. Admin solicita reporte del evento
2. Sistema recopila todas las selecciones
3. Sistema genera filas por asiento
4. Sistema ordena por mesa y asiento
5. Sistema calcula resúmenes y estadísticas
6. Sistema devuelve datos estructurados

**Resultado:**

- 150 asientos ocupados
- Menú Normal: 100, Infantil: 30, Celíaco: 20
- 75% de ocupación
- Datos listos para Excel

### Caso 5: Admin Reprograma Turno

**Objetivo:** Invitado no pudo asistir, admin le da nuevo horario.

**Pasos:**

1. Admin identifica turno a reprogramar
2. Admin asigna nueva fecha/hora
3. Sistema marca como REPROGRAMADO
4. Sistema envía notificación al invitado

**Resultado:**

- Turno original: 01/12 a las 10:00
- Nuevo turno: 02/12 a las 15:00
- Estado: REPROGRAMADO

---

## 🔐 Seguridad y Permisos

### Roles

- **Admin**: Acceso completo

  - Configurar proceso
  - Generar turnos
  - Ver todos los turnos
  - Reprogramar turnos
  - Generar reportes

- **Novio**: Acceso de lectura

  - Ver configuración
  - Ver turnos
  - Generar reportes

- **Invitado**: Acceso limitado
  - Ver su propio turno
  - Verificar su acceso
  - Realizar su selección

### Validaciones de Acceso

```javascript
// Verificar que el invitado esté en su turno
const accesoTurno = await turnosService.verificarAccesoTurno(
  eventoId,
  invitadoId
);
if (!accesoTurno.puede_acceder) {
  return error(403, accesoTurno.motivo);
}
```

---

## 🚀 Flujo de Implementación

### Fase 1: Configuración

1. Admin configura proceso de selección
2. Sistema valida configuración
3. Sistema calcula turnos disponibles estimados

### Fase 2: Generación de Turnos

1. Sistema consulta deudas del evento
2. Sistema obtiene fechas de liquidación
3. Sistema ordena invitados por fecha de pago
4. Sistema genera slots de tiempo
5. Sistema asigna turnos en orden de prioridad

### Fase 3: Notificaciones (Opcional)

1. Sistema notifica a cada invitado su turno
2. Sistema envía recordatorios 24h antes
3. Sistema envía recordatorio 1h antes

### Fase 4: Selección

1. Invitados acceden en su horario
2. Invitados seleccionan mesas y menús
3. Sistema valida y guarda selecciones
4. Sistema marca turnos como completados

### Fase 5: Reporte

1. Admin genera reporte final
2. Sistema exporta datos para Excel
3. Admin descarga y procesa información

---

## 📝 Notas Importantes

### Ordenamiento por Fecha de Liquidación

El sistema prioriza a los invitados según **cuándo completaron su deuda**:

```javascript
// En turnosService.generarTurnos()
invitadosLiquidados.sort((a, b) => {
  return new Date(a.fecha_liquidacion) - new Date(b.fecha_liquidacion);
});
```

**Ejemplo:**

- Invitado A liquidó el 2025-10-01 → Turno #1
- Invitado B liquidó el 2025-10-05 → Turno #2
- Invitado C liquidó el 2025-10-10 → Turno #3

### Invitados sin Turno

Los invitados con deuda pendiente **no reciben turno**. Deben:

1. Completar el pago de su deuda
2. Esperar a que admin regenere los turnos
3. Entonces recibirán turno según su fecha de liquidación

### Tiempos Muertos

El sistema respeta:

- **Tiempo muerto entre turnos**: Buffer para evitar traslapes
- **Horarios no disponibles**: Fines de semana, festivos
- **Períodos específicos**: Hora de comida, eventos especiales

### Validación de Asientos

El sistema previene:

- ❌ Seleccionar más asientos que boletos
- ❌ Seleccionar menos asientos que boletos
- ❌ Seleccionar asientos ya ocupados
- ❌ Seleccionar fuera del turno asignado

---

## 🎯 Resumen

Este sistema garantiza:

1. ✅ **Orden justo**: Quien paga primero, elige primero
2. ✅ **Control de acceso**: Solo en horario asignado
3. ✅ **Prevención de conflictos**: Validación de disponibilidad
4. ✅ **Trazabilidad completa**: Fecha de liquidación → Turno → Selección
5. ✅ **Reportes precisos**: Exportación de todas las selecciones
6. ✅ **Flexibilidad**: Reprogramación manual por admin

---

**Fecha de Creación**: 10 de Noviembre de 2025  
**Versión**: 1.0  
**Sistema**: EventosApi - Azure Functions + CosmosDB
