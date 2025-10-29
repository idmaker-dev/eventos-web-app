# 🧪 Guía de Prueba - Lector QR

## Mejoras Implementadas

### ✅ Funciones Estables con useCallback

Las funciones `onScanSuccess` y `onScanError` ahora usan `useCallback` para mantener referencias estables, lo cual es crítico para que html5-qrcode las reconozca correctamente.

### ✅ Configuración Mejorada del Escáner

```javascript
{
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1.777778, // 16:9
  disableFlip: false,
  videoConstraints: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 }
  },
  formatsToSupport: [0-16], // Todos los formatos de códigos
  experimentalFeatures: {
    useBarCodeDetectorIfSupported: true // Usa API nativa si está disponible
  }
}
```

### ✅ Logs Mejorados para Diagnóstico

Ahora verás en la consola:

- 🔄 Cuando intenta iniciar con cada estrategia
- ✓ Cuando el escáner está listo para escanear
- ✗ Cuando una estrategia falla
- ✅ Cuando detecta un código QR
- 📷 Lista de cámaras disponibles

## 🧪 Cómo Probar el Escáner

### 1. Verificar Logs en Consola

Abre la consola (F12) y busca estos mensajes al iniciar el escaneo:

```
🔄 Intentando iniciar con cámara trasera...
✓ Escáner iniciado con cámara trasera - Listo para escanear
```

O en caso de fallback:

```
✗ Cámara trasera no disponible: [mensaje]
🔄 Intentando iniciar con cámara frontal...
✓ Escáner iniciado con cámara frontal - Listo para escanear
```

### 2. Generar Códigos QR de Prueba

**Opción 1: Online**

- https://www.qr-code-generator.com/
- https://www.qrcode-monkey.com/
- https://qr.io/

**Opción 2: Con Texto Simple**
Genera un QR con texto como:

- `"Invitado de Prueba"`
- `"Juan Pérez - 3 boletos"`
- `"Evento Test 2025"`

**Opción 3: Con JSON (para futura integración)**

```json
{
  "evento_id": "123",
  "invitado": "Juan Pérez",
  "boletos": 3,
  "codigo": "ABC123"
}
```

### 3. Condiciones Óptimas para Escaneo

**Iluminación:**

- ✅ Buena iluminación (natural o artificial)
- ❌ Evitar contraluz
- ❌ Evitar reflejos en pantalla

**Distancia:**

- ✅ 10-30 cm del código QR
- ✅ Código QR centrado en el área verde
- ✅ Mantener estable (sin mover mucho)

**Tamaño del QR:**

- ✅ Mínimo 2x2 cm en pantalla
- ✅ Mínimo 3x3 cm impreso
- ✅ Mayor tamaño = mejor detección

**Calidad:**

- ✅ QR impreso en buena calidad
- ✅ QR en pantalla con brillo alto
- ❌ Evitar QR borrosos o pixelados

### 4. Troubleshooting - No Detecta el QR

#### Caso 1: La cámara se abre pero no escanea nada

**Verificar en consola:**

```
✓ Escáner iniciado con [tipo de cámara] - Listo para escanear
```

Si ves este mensaje, el escáner está funcionando. Entonces:

1. **Mejora la iluminación** - Más luz = mejor detección
2. **Acerca/aleja el QR** - Prueba diferentes distancias
3. **Mantén estable** - No muevas mucho el código
4. **Prueba con otro QR** - El QR podría estar dañado
5. **Verifica el contraste** - El QR debe ser oscuro sobre fondo claro

#### Caso 2: No aparece el mensaje "Listo para escanear"

**Problema:** El escáner no se inició correctamente

**Solución:**

1. Cierra y abre el modal de nuevo
2. Revisa permisos de cámara en el navegador
3. Verifica que no haya otra app usando la cámara
4. Revisa los logs de error en consola

#### Caso 3: Detecta el QR pero no muestra nada

**Verificar en consola:**

```
✅ QR Code detected: [contenido] [objeto]
```

Si ves esto, el escáner está funcionando correctamente. El problema es en la UI.

**Solución:**

- Revisa que el estado `lastScan` se actualice
- Verifica que `scanHistory` se actualice
- Comprueba que no haya errores de renderizado

### 5. Test Rápido con QR en Pantalla

**Paso 1:** Genera un QR simple en https://www.qr-code-generator.com/

- Contenido: "TEST 12345"
- Descarga o toma screenshot

**Paso 2:** Abre la imagen en otra pantalla o imprime

**Paso 3:** Inicia el escáner y apunta a la pantalla/papel

**Paso 4:** Deberías ver en consola:

```
✅ QR Code detected: TEST 12345 {...}
```

**Paso 5:** Deberías ver la UI actualizada con:

- ✓ Invitación Válida (verde)
- Invitado: TEST 12345
- X boletos
- Hora del escaneo

### 6. Test con Móvil

**Opción A: Usar el móvil como fuente del QR**

1. Genera QR en el móvil
2. Abre el lector en la computadora
3. Apunta la cámara de la computadora al móvil

**Opción B: Usar el móvil como escáner**

1. Abre la aplicación en el móvil (HTTPS requerido)
2. Genera QR en la computadora o impreso
3. Usa la cámara del móvil para escanear

## 📊 Logs Esperados (Flujo Normal)

```javascript
// Al hacer clic en "Iniciar Escaneo"
🔄 Intentando iniciar con cámara trasera...
✓ Escáner iniciado con cámara trasera - Listo para escanear

// Cuando detecta un QR
✅ QR Code detected: "Contenido del QR" {decodedResult: {...}}

// Al hacer clic en "Detener Escaneo"
Escáner detenido exitosamente

// Al cerrar el modal
Scanner detenido al cerrar modal
```

## 🔍 Comandos de Debug

Abre la consola y ejecuta estos comandos para diagnosticar:

```javascript
// Ver estado actual del escáner
html5QrCodeRef.current?.getState();
// 0=NOT_STARTED, 1=STARTING, 2=SCANNING, 3=PAUSED

// Ver cámaras disponibles
Html5Qrcode.getCameras().then((devices) => console.log(devices));

// Ver configuración actual
console.log(html5QrCodeRef.current);
```

## ⚡ Tips Pro

1. **Usa HTTPS:** Muchos navegadores restringen cámara en HTTP
2. **Prueba diferentes navegadores:** Chrome suele funcionar mejor
3. **Actualiza drivers:** Asegúrate de tener drivers de cámara actualizados
4. **Cierra otras apps:** Zoom, Teams, etc. pueden bloquear la cámara
5. **Buena iluminación:** Es el factor más importante para detección
6. **QR de buen tamaño:** Mínimo 3x3 cm
7. **Mantén estable:** No muevas mucho mientras escaneas
8. **Distancia correcta:** 15-25 cm es ideal

## 🎯 Siguiente Paso: Integración con API

Una vez que el escaneo funcione correctamente, modifica `onScanSuccess`:

```javascript
const onScanSuccess = useCallback(
  async (decodedText, decodedResult) => {
    try {
      // Llamar a tu API para validar
      const response = await fetch("/api/eventos/validar-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode: decodedText,
          eventoId: evento?.id,
        }),
      });

      const data = await response.json();

      // Usar datos reales del servidor
      setLastScan({
        id: data.id,
        timestamp: new Date().toISOString(),
        invitado: data.nombreInvitado,
        boletos: data.numeroBoletos,
        alumno: data.nombreAlumno,
        valido: data.esValido,
      });

      setScanHistory((prev) => [data, ...prev].slice(0, 10));
    } catch (error) {
      console.error("Error validando QR:", error);
      // Mostrar error al usuario
    }
  },
  [evento]
);
```
