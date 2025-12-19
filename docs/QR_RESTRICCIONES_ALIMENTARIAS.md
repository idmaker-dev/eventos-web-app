# 🍽️ Sistema de Restricciones Alimentarias en QR

## Descripción General

El lector de códigos QR ahora incluye un sistema completo para registrar y visualizar las restricciones alimentarias de los invitados. Esto permite al personal del evento coordinar mejor el servicio de catering y garantizar que todos los asistentes reciban alimentos adecuados a sus necesidades.

## Tipos de Restricciones Implementadas

### 1. 🥬 Vegetarianos

- **Color**: Verde (`bg-green-500`)
- **Emoji**: 🥬
- **Descripción**: Invitados que no consumen carne ni pescado

### 2. 🦐 Alérgicos a Mariscos

- **Color**: Naranja (`bg-orange-500`)
- **Emoji**: 🦐
- **Descripción**: Invitados con alergia a cualquier tipo de marisco

### 3. 🌾 Celiacos

- **Color**: Ámbar (`bg-amber-500`)
- **Emoji**: 🌾
- **Descripción**: Invitados con intolerancia al gluten

### 4. 🥛 Alérgicos a Lactosa

- **Color**: Azul (`bg-blue-500`)
- **Emoji**: 🥛
- **Descripción**: Invitados con intolerancia a la lactosa

## Estructura de Datos

### Objeto de Restricciones

```javascript
restricciones: {
  vegetarianos: 0,        // Número de invitados vegetarianos
  alergicosMariscos: 0,   // Número de invitados alérgicos a mariscos
  celiaco: 0,             // Número de invitados celiacos
  alergicosLactosa: 0     // Número de invitados alérgicos a lactosa
}
```

### Ejemplo en Datos Mock

```javascript
{
  id: 'INV002',
  nombre: 'María López Rodríguez',
  mesa: 12,
  boletos: 4,
  valido: true,
  restricciones: {
    vegetarianos: 2,         // 2 de 4 son vegetarianos
    alergicosMariscos: 1,    // 1 de 4 es alérgico a mariscos
    celiaco: 0,              // Ninguno es celiaco
    alergicosLactosa: 0      // Ninguno es alérgico a lactosa
  }
}
```

## Visualización en la UI

### 1. Última Lectura (Detallada)

Cuando se escanea una invitación, se muestra:

```
✓ Invitación Válida
👤 María López Rodríguez
🪑 Mesa 12
🎫 4 boletos

━━━━━━━━━━━━━━━━━━━━━━━━━
Restricciones Alimentarias:
● Vegetarianos: 2
● Alérgicos a mariscos: 1
```

**Características**:

- Solo se muestran las restricciones con valor > 0
- Separador visual con borde superior
- Puntos de colores para identificación rápida
- Valores en negrita para destacar cantidades

### 2. Historial (Compacta)

En el historial, las restricciones se muestran como badges:

```
María López Rodríguez
Mesa 12 • 4 • 10:30

[🥬 2] [🦐 1]
```

**Características**:

- Badges con color de fondo según el tipo
- Emoji + número para lectura rápida
- Diseño compacto para ahorrar espacio
- Modo oscuro adaptativo

### 3. Estadísticas Totales

Nueva tarjeta en la sección de estadísticas:

```
🔄 Restricciones Alimentarias Totales

● Vegetarianos: 5      ● Mariscos: 3
● Celiacos: 2          ● Lactosa: 1
```

**Características**:

- Grid 2x2 para distribución uniforme
- Suma acumulativa de todos los escaneos
- Solo se muestra si hay restricciones registradas
- Útil para coordinación con catering

## Respuesta Esperada del API

### GET /api/eventos/{eventoId}/invitados/{invitadoId}

```json
{
  "success": true,
  "data": {
    "id": "INV002",
    "nombre": "María López Rodríguez",
    "mesa": 12,
    "boletos": 4,
    "valido": true,
    "yaEscaneado": false,
    "restricciones": {
      "vegetarianos": 2,
      "alergicosMariscos": 1,
      "celiaco": 0,
      "alergicosLactosa": 0
    }
  }
}
```

### Campos Adicionales Opcionales

Si el backend desea proporcionar más detalle:

```json
{
  "restricciones": {
    "vegetarianos": 2,
    "alergicosMariscos": 1,
    "celiaco": 0,
    "alergicosLactosa": 0,
    "detalles": [
      {
        "nombreInvitado": "María López",
        "restricciones": ["vegetariano"]
      },
      {
        "nombreInvitado": "Carlos López",
        "restricciones": ["vegetariano", "alergico_mariscos"]
      },
      {
        "nombreInvitado": "Ana López",
        "restricciones": []
      },
      {
        "nombreInvitado": "Pedro López",
        "restricciones": []
      }
    ]
  }
}
```

## Integración con Backend

### Ubicación del Código

**Archivo**: `src/components/Modales/LectorQR.jsx`

**Función**: `onScanSuccess` (líneas ~38-99)

### Reemplazar Mock con API Real

```javascript
// TODO: Reemplazar esta sección (línea 58)
const mockInvitados = [
  // ... datos mock
];

// CON:

try {
  const response = await fetch(
    `/api/eventos/${evento?.id}/invitados/${decodedText}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Error al validar invitación");
  }

  const invitadoData = {
    id: result.data.id,
    nombre: result.data.nombre,
    mesa: result.data.mesa,
    boletos: result.data.boletos,
    valido: result.data.valido && !result.data.yaEscaneado,
    restricciones: result.data.restricciones || {
      vegetarianos: 0,
      alergicosMariscos: 0,
      celiaco: 0,
      alergicosLactosa: 0,
    },
  };

  // Continuar con el flujo normal...
} catch (error) {
  console.error("❌ Error al consultar información del invitado:", error);
  // Manejador de errores existente...
}
```

## Casos de Uso

### Caso 1: Grupo con Múltiples Restricciones

**Escenario**: Una familia de 4 personas con diversas necesidades:

- 2 vegetarianos
- 1 alérgico a mariscos
- 1 sin restricciones

**QR Escaneado**: `INV002`

**Resultado**:

```
✓ Invitación Válida
👤 María López Rodríguez
🪑 Mesa 12
🎫 4 boletos

Restricciones Alimentarias:
● Vegetarianos: 2
● Alérgicos a mariscos: 1
```

**Acción del Personal**:

- Informar a cocina: 2 menús vegetarianos, 1 sin mariscos, 1 regular
- Coordinar con meseros para mesa 12

### Caso 2: Invitado Sin Restricciones

**Escenario**: Grupo de 3 personas sin restricciones

**QR Escaneado**: `INV001`

**Resultado**:

```
✓ Invitación Válida
👤 Juan Pérez García
🪑 Mesa 5
🎫 2 boletos
```

**Nota**: La sección de restricciones no se muestra si todas son 0

### Caso 3: Seguimiento en Tiempo Real

**Escenario**: Durante el evento, el personal necesita saber cuántos menús especiales se necesitan en total

**Acción**: Revisar la tarjeta de "Restricciones Alimentarias Totales"

**Ejemplo de Datos**:

```
Después de escanear 10 invitaciones (35 boletos totales):

Restricciones Alimentarias Totales
● Vegetarianos: 8      ● Mariscos: 5
● Celiacos: 3          ● Lactosa: 2
```

**Utilidad**:

- Cocina puede preparar cantidades exactas
- Evitar desperdicio de comida
- Garantizar disponibilidad de opciones especiales

## Consideraciones de UX

### 1. Solo Mostrar Restricciones Activas

✅ **Correcto** (valor > 0):

```
Restricciones Alimentarias:
● Vegetarianos: 2
● Alérgicos a mariscos: 1
```

❌ **Incorrecto** (mostrar todos):

```
Restricciones Alimentarias:
● Vegetarianos: 2
● Alérgicos a mariscos: 1
● Celiacos: 0
● Alérgicos a lactosa: 0
```

### 2. Códigos de Color Consistentes

Mantener el mismo código de color en toda la UI:

- 🥬 Verde → Vegetarianos
- 🦐 Naranja → Mariscos
- 🌾 Ámbar → Celiacos
- 🥛 Azul → Lactosa

### 3. Modo Oscuro

Todos los colores tienen variantes para modo oscuro:

- Fondos: `bg-green-100 dark:bg-green-900/30`
- Textos: `text-green-700 dark:text-green-400`
- Bordes: `border-green-300 dark:border-green-600`

## Ampliación del Sistema

### Agregar Nuevas Restricciones

Si se necesitan más tipos de restricciones:

1. **Actualizar el objeto de restricciones**:

```javascript
restricciones: {
  vegetarianos: 0,
  alergicosMariscos: 0,
  celiaco: 0,
  alergicosLactosa: 0,
  vegano: 0,              // NUEVO
  alergicosNueces: 0,     // NUEVO
  diabetico: 0            // NUEVO
}
```

2. **Agregar visualización en la UI** (línea ~447):

```javascript
{
  lastScan.restricciones.vegano > 0 && (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
      <span>
        Veganos: <strong>{lastScan.restricciones.vegano}</strong>
      </span>
    </div>
  );
}
```

3. **Agregar badge en historial** (línea ~530):

```javascript
{
  scan.restricciones.vegano > 0 && (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
      🌱 {scan.restricciones.vegano}
    </span>
  );
}
```

4. **Actualizar totales** (línea ~567):

```javascript
const totales = scanHistory.reduce(
  (acc, scan) => {
    if (scan.restricciones) {
      // ... restricciones existentes
      acc.vegano += scan.restricciones.vegano || 0; // NUEVO
    }
    return acc;
  },
  {
    vegetarianos: 0,
    // ... otros
    vegano: 0, // NUEVO
  }
);
```

## Testing

### Datos Mock Disponibles

Para probar el sistema, usa estos QR codes:

| QR Code   | Invitado         | Boletos | Restricciones                         |
| --------- | ---------------- | ------- | ------------------------------------- |
| `INV001`  | Juan Pérez       | 2       | 🥬 1 vegetariano                      |
| `INV002`  | María López      | 4       | 🥬 2 veg., 🦐 1 mariscos              |
| `INV003`  | Carlos Hernández | 3       | 🦐 1 mariscos, 🌾 1 celiaco           |
| `INV004`  | Ana Martínez     | 2       | 🥛 1 lactosa                          |
| `INV005`  | Luis Ramírez     | 5       | 🥬 1 veg., 🌾 1 celiaco, 🥛 1 lactosa |
| `INVALID` | Inválida         | 0       | Sin restricciones                     |

### Generar QR Codes de Prueba

Usa herramientas online como:

- [QR Code Generator](https://www.qr-code-generator.com/)
- [QR Monkey](https://www.qrcode-monkey.com/)

**Contenido**: Solo el ID (ej: `INV001`)

## Beneficios del Sistema

### Para el Personal del Evento

✅ Identificación rápida de necesidades especiales
✅ Coordinación eficiente con cocina
✅ Visualización en tiempo real de totales
✅ Reducción de errores en servicio

### Para Invitados

✅ Garantía de recibir comida adecuada
✅ Experiencia personalizada
✅ Atención a necesidades médicas/preferencias

### Para Organización

✅ Mejor planificación de menú
✅ Control de costos de catering
✅ Datos para eventos futuros
✅ Cumplimiento de regulaciones de alérgenos

## Soporte y Documentación

Para más información sobre el sistema de QR, consulta:

- `QR_INVITACION_FLOW.md` - Flujo general de validación
- `INTEGRACION_QR.md` - Integración de la librería
- `QR_TROUBLESHOOTING.md` - Solución de problemas
- `QR_TESTING_GUIDE.md` - Guía de pruebas

---

**Última actualización**: Octubre 2025  
**Versión**: 2.0 (con restricciones alimentarias)
