# Integración de Lector QR Real

## 📦 Librería Instalada

Se ha integrado **html5-qrcode** (v2.3.8+) para lectura real de códigos QR mediante la cámara del dispositivo.

```bash
npm install html5-qrcode
```

## 🎯 Características Implementadas

### ✅ Lectura Real de QR

- Acceso a la cámara del dispositivo (preferentemente trasera)
- Escaneo en tiempo real con detección automática
- Configuración optimizada: 10 FPS, área de escaneo 250x250px
- **Estrategia de fallback multi-nivel** para máxima compatibilidad

### ✅ Manejo Robusto de Errores

- **3 niveles de fallback** para acceso a cámara:
  1. Intento con cámara trasera (`environment`)
  2. Fallback a cámara frontal (`user`)
  3. Fallback a primera cámara disponible por ID
- Mensajes de error específicos según el tipo de problema
- Detección automática de problemas de permisos, hardware, y conflictos

### ✅ Procesamiento de Datos

Cuando se detecta un código QR:

```javascript
onScanSuccess = (decodedText, decodedResult) => {
  // decodedText: Contenido del código QR
  // decodedResult: Objeto con información adicional
};
```

### ✅ UI Mejorada

- Contenedor específico para el preview de la cámara
- Estilos personalizados en `LectorQR.css`
- Manejo de estados: scanning/idle
- Botones de control: Iniciar/Detener escaneo

## 🔧 Estructura del Código

### Componente: `LectorQR.jsx`

**Estados:**

- `scanning`: Indica si el escáner está activo
- `lastScan`: Último código QR escaneado
- `scanHistory`: Historial de últimos 10 escaneos

**Referencias:**

- `html5QrCodeRef`: Instancia del escáner Html5Qrcode
- `scannerIdRef`: ID del elemento DOM ("qr-reader")

**Funciones principales:**

1. `handleStartScan()`: Inicia el escáner
2. `handleStopScan()`: Detiene y limpia el escáner
3. `onScanSuccess()`: Callback al detectar un QR
4. `onScanError()`: Callback para errores (silenciado)

## 📝 Pendiente por Implementar

### Backend Integration

Actualmente el componente usa datos mock después de escanear. Para conectar con tu API:

```javascript
const onScanSuccess = async (decodedText, decodedResult) => {
  try {
    // Llamar a tu API para validar el QR
    const response = await fetch("/api/validate-qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        qrCode: decodedText,
        eventoId: evento?.id,
      }),
    });

    const data = await response.json();

    // Usar datos reales del API
    const scanData = {
      id: data.id,
      timestamp: new Date().toISOString(),
      invitado: data.nombreInvitado,
      boletos: data.numeroBoletos,
      alumno: data.nombreAlumno,
      valido: data.esValido,
    };

    setLastScan(scanData);
    setScanHistory((prev) => [scanData, ...prev].slice(0, 10));
  } catch (error) {
    console.error("Error validating QR:", error);
    // Manejar error
  }
};
```

## 🎨 Estilos Personalizados

Archivo: `LectorQR.css`

- Oculta controles por defecto de html5-qrcode
- Ajusta el video al contenedor con `object-fit: cover`
- Personaliza el overlay del área de escaneo con color teal
- Aplica border-radius consistente

## 🔒 Permisos de Cámara

**Requisitos:**

- La aplicación debe correr en HTTPS o localhost
- El navegador solicitará permiso de cámara al usuario
- Si el permiso es denegado, se muestra un alert

## 🐛 Manejo de Errores

El componente ahora incluye manejo robusto de errores con mensajes específicos:

- **NotAllowedError/PermissionDeniedError**: Guía al usuario para habilitar permisos de cámara
- **NotFoundError/DevicesNotFoundError**: Indica que no se encontró ninguna cámara
- **NotReadableError/TrackStartError/AbortError**: Detecta conflictos con otras aplicaciones usando la cámara
- **OverconstrainedError**: Problema con los requisitos de la cámara
- **Fallback automático**: Si una cámara falla, intenta con otra automáticamente

### 🔍 Troubleshooting

Para problemas comunes y soluciones detalladas, consulta: **[QR_TROUBLESHOOTING.md](./QR_TROUBLESHOOTING.md)**

## 🚀 Cómo Usar

1. Usuario abre el modal de detalles del evento
2. Hace clic en "Lector QR"
3. Hace clic en "Iniciar Escaneo"
4. Otorga permisos de cámara si se solicitan
5. Coloca el QR frente a la cámara
6. El sistema detecta automáticamente y procesa el QR

## 📱 Compatibilidad

- ✅ Chrome/Edge (desktop & mobile)
- ✅ Safari (iOS 11+)
- ✅ Firefox (desktop & mobile)
- ✅ Navegadores modernos con soporte para getUserMedia

## 🔄 Cleanup

El componente maneja correctamente la limpieza de recursos:

- Al cerrar el modal
- Al desmontar el componente
- Al cambiar de estado

Esto previene memory leaks y libera la cámara apropiadamente.
