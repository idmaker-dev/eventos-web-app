# 🎫 Sistema de Validación de Invitaciones por QR

## Flujo de Validación

### 1. Generación de QR (Backend)

Cada invitado recibe una invitación con un código QR único que contiene su ID:

```
Invitación enviada a: Juan Pérez
QR Code contiene: "INV001"
```

### 2. Escaneo del QR (Frontend)

Cuando el invitado llega al evento, el personal escanea el QR:

```javascript
QR escaneado: "INV001"
↓
onScanSuccess(decodedText = "INV001")
```

### 3. Consulta a API (Simulado)

El sistema consulta la información del invitado:

```javascript
// TODO: Implementar llamada real
const response = await fetch(
  `/api/eventos/${eventoId}/invitados/${invitadoId}`
);
const data = await response.json();
```

### 4. Respuesta Esperada del API

```json
{
  "id": "INV001",
  "nombre": "Juan Pérez García",
  "mesa": 5,
  "boletos": 2,
  "valido": true,
  "restricciones": {
    "vegetarianos": 1,
    "alergicosMariscos": 0,
    "celiaco": 0,
    "alergicosLactosa": 0
  }
}
```

### 5. Visualización

La información se muestra en tiempo real:

```
✓ Invitación Válida
👤 Juan Pérez García
🪑 Mesa 5
🎫 2 boletos

━━━━━━━━━━━━━━━━━━━━━━━━━
Restricciones Alimentarias:
● Vegetarianos: 1

🕐 10:30:15
```

## 📊 Estructura de Datos

### Objeto de Escaneo

```javascript
{
  id: "QR-1234567890",           // ID único del escaneo
  timestamp: "2025-10-22T10:30:15.000Z",
  invitadoId: "INV001",          // ID del invitado (del QR)
  invitado: "Juan Pérez García",  // Nombre completo
  mesa: 5,                        // Número de mesa asignada
  boletos: 2,                     // Cantidad de boletos/invitados
  restricciones: {                // Restricciones alimentarias
    vegetarianos: 1,
    alergicosMariscos: 0,
    celiaco: 0,
    alergicosLactosa: 0
  },
  valido: true,                   // Si la invitación es válida
  evento: "Graduación 2025"       // Nombre del evento
}
```

### Estados de Validación

**✅ Invitación Válida:**

- `valido: true`
- Muestra borde verde
- Ícono CheckCircle2 (verde)
- Permite el acceso

**❌ Invitación No Válida:**

- `valido: false`
- Muestra borde rojo
- Ícono XCircle (rojo)
- Niega el acceso

### Casos de Invitación No Válida

1. **Invitación ya usada** (verificar en backend)
2. **Invitación expirada**
3. **Evento incorrecto**
4. **Invitado no encontrado en base de datos**
5. **QR inválido o corrupto**

## 🔧 Implementación Backend

### Endpoint Sugerido

```
GET /api/eventos/{eventoId}/invitados/{invitadoId}
```

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "INV001",
    "nombre": "Juan Pérez García",
    "email": "juan.perez@example.com",
    "mesa": 5,
    "boletos": 2,
    "restricciones": {
      "vegetarianos": 1,
      "alergicosMariscos": 0,
      "celiaco": 0,
      "alergicosLactosa": 0
    },
    "valido": true,
    "yaEscaneado": false,
    "fechaEscaneo": null,
    "observaciones": null
  }
}
```

**Respuesta Error - No Encontrado (404):**

```json
{
  "success": false,
  "error": "Invitado no encontrado",
  "code": "INVITADO_NOT_FOUND"
}
```

**Respuesta Error - Ya Escaneado (409):**

```json
{
  "success": false,
  "error": "Esta invitación ya fue utilizada",
  "code": "ALREADY_SCANNED",
  "data": {
    "fechaEscaneo": "2025-10-22T10:15:00.000Z",
    "escaneadoPor": "Usuario Admin"
  }
}
```

**Respuesta Error - Invitación Inválida (403):**

```json
{
  "success": false,
  "error": "Invitación no válida para este evento",
  "code": "INVALID_INVITATION"
}
```

### Marcar Invitación como Usada

```
POST /api/eventos/{eventoId}/invitados/{invitadoId}/check-in
```

**Request Body:**

```json
{
  "timestamp": "2025-10-22T10:30:15.000Z",
  "escaneadoPor": "usuario_id"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Check-in registrado exitosamente",
  "data": {
    "invitadoId": "INV001",
    "nombre": "Juan Pérez García",
    "fechaCheckIn": "2025-10-22T10:30:15.000Z"
  }
}
```

## 💻 Integración con Frontend

### Reemplazar Simulación con API Real

Actualizar la función `onScanSuccess` en `LectorQR.jsx`:

```javascript
const onScanSuccess = useCallback(
  async (decodedText, decodedResult) => {
    // [... validación de duplicados ...]

    try {
      console.log("🔍 Consultando invitado:", decodedText);

      // Llamada real al API
      const response = await fetch(
        `/api/eventos/${evento?.id}/invitados/${decodedText}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Invitado no encontrado");
      }

      const result = await response.json();
      const invitadoData = result.data;

      console.log("✅ Invitado encontrado:", invitadoData);

      // Si ya fue escaneado, mostrar como no válido
      if (invitadoData.yaEscaneado) {
        const scanData = {
          id: `QR-${Date.now()}`,
          timestamp: new Date().toISOString(),
          invitadoId: invitadoData.id,
          invitado: invitadoData.nombre,
          mesa: invitadoData.mesa,
          boletos: invitadoData.boletos,
          valido: false, // No válido porque ya fue usado
          evento: evento?.nombre_evento || "Evento",
          error: "Invitación ya utilizada",
          fechaEscaneoAnterior: invitadoData.fechaEscaneo,
        };

        setLastScan(scanData);
        setScanHistory((prev) => [scanData, ...prev].slice(0, 10));
        return;
      }

      // Marcar como escaneado
      await fetch(
        `/api/eventos/${evento?.id}/invitados/${decodedText}/check-in`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            escaneadoPor: userId,
          }),
        }
      );

      // Crear registro del escaneo
      const scanData = {
        id: `QR-${Date.now()}`,
        timestamp: new Date().toISOString(),
        invitadoId: invitadoData.id,
        invitado: invitadoData.nombre,
        mesa: invitadoData.mesa,
        boletos: invitadoData.boletos,
        valido: true,
        evento: evento?.nombre_evento || "Evento",
      };

      setLastScan(scanData);
      setScanHistory((prev) => [scanData, ...prev].slice(0, 10));
    } catch (error) {
      console.error("❌ Error:", error);

      // Mostrar como no válido
      const errorScanData = {
        id: `QR-${Date.now()}`,
        timestamp: new Date().toISOString(),
        invitadoId: decodedText,
        invitado: error.message || "Error al validar",
        mesa: null,
        boletos: 0,
        valido: false,
        evento: evento?.nombre_evento || "Evento",
      };

      setLastScan(errorScanData);
      setScanHistory((prev) => [errorScanData, ...prev].slice(0, 10));
    }
  },
  [evento, token, userId]
);
```

## 🧪 Datos Mock para Pruebas

### Invitados Pre-configurados

```javascript
const mockInvitados = [
  {
    id: "INV001",
    nombre: "Juan Pérez García",
    mesa: 5,
    boletos: 2,
    valido: true,
  },
  {
    id: "INV002",
    nombre: "María López Rodríguez",
    mesa: 12,
    boletos: 4,
    valido: true,
  },
  {
    id: "INV003",
    nombre: "Carlos Hernández Sánchez",
    mesa: 8,
    boletos: 3,
    valido: true,
  },
  {
    id: "INVALID",
    nombre: "Invitación No Válida",
    mesa: null,
    boletos: 0,
    valido: false,
  },
];
```

### Generar QRs de Prueba

Para probar el sistema, genera QRs con estos contenidos:

1. **QR para Juan Pérez:**

   - Contenido: `INV001`
   - Resultado esperado: Mesa 5, 2 boletos ✅

2. **QR para María López:**

   - Contenido: `INV002`
   - Resultado esperado: Mesa 12, 4 boletos ✅

3. **QR Inválido:**

   - Contenido: `INVALID`
   - Resultado esperado: Invitación No Válida ❌

4. **QR Aleatorio:**
   - Contenido: `XYZ123`
   - Resultado esperado: Genera datos simulados con mesa aleatoria ✅

Genera los QRs en: https://www.qr-code-generator.com/

## 📱 Flujo de Usuario (Personal del Evento)

1. **Abrir lector QR** desde el modal de detalles del evento
2. **Iniciar escaneo** con el botón verde
3. **Escanear QR** del invitado
4. **Revisar información:**
   - ✅ Verde = Permitir acceso
   - ❌ Rojo = Denegar acceso
5. **Verificar mesa asignada** para dirigir al invitado
6. **Continuar con siguiente invitado**

## 🎯 Mejoras Futuras

### Feedback Sonoro

```javascript
// Reproducir sonido según resultado
if (scanData.valido) {
  new Audio("/sounds/success.mp3").play();
} else {
  new Audio("/sounds/error.mp3").play();
}
```

### Vibración (Móvil)

```javascript
if (navigator.vibrate) {
  if (scanData.valido) {
    navigator.vibrate(200); // Vibración corta
  } else {
    navigator.vibrate([100, 50, 100]); // Patrón de error
  }
}
```

### Confirmación de Acceso

```javascript
// Botón para confirmar manualmente el acceso
<button onClick={() => confirmarAcceso(scanData.invitadoId)}>
  Confirmar Acceso
</button>
```

### Búsqueda Manual

```javascript
// Input para buscar invitado por nombre
<input
  type="text"
  placeholder="Buscar invitado por nombre..."
  onChange={(e) => buscarInvitado(e.target.value)}
/>
```

### Exportar Reporte

```javascript
// Exportar lista de check-ins a Excel
const exportarCheckIns = () => {
  const data = scanHistory.map((scan) => ({
    Invitado: scan.invitado,
    Mesa: scan.mesa,
    Boletos: scan.boletos,
    Hora: new Date(scan.timestamp).toLocaleString("es-MX"),
  }));

  // Generar Excel con librería
  generarExcel(data, `check-ins-${evento.nombre_evento}.xlsx`);
};
```

## 📊 Estadísticas en Tiempo Real

Agregar panel con:

- Total de invitados esperados
- Total de check-ins realizados
- Porcentaje de asistencia
- Gráfica de llegadas por hora
- **Restricciones alimentarias totales** (ver `QR_RESTRICCIONES_ALIMENTARIAS.md`)

```javascript
<div className="stats-panel">
  <div>Esperados: {totalInvitados}</div>
  <div>Registrados: {scanHistory.length}</div>
  <div>
    Asistencia: {((scanHistory.length / totalInvitados) * 100).toFixed(1)}%
  </div>
  <div>Vegetarianos: {totalRestricciones.vegetarianos}</div>
</div>
```

---

## 📚 Documentación Relacionada

- **`QR_RESTRICCIONES_ALIMENTARIAS.md`** - Sistema completo de restricciones alimentarias
- **`INTEGRACION_QR.md`** - Integración de la librería html5-qrcode
- **`QR_TROUBLESHOOTING.md`** - Solución de problemas comunes
- **`QR_TESTING_GUIDE.md`** - Guía de pruebas y QR de ejemplo
- **`QR_DUPLICATE_PREVENTION.md`** - Sistema de prevención de duplicados

---

**Última actualización**: Octubre 2025  
**Versión**: 2.0 (con restricciones alimentarias)
