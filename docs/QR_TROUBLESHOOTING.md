# 🔧 Troubleshooting - Lector QR

## Problemas Comunes y Soluciones

### ❌ Error: "AbortError: Timeout starting video source"

**Causas:**

1. La cámara está siendo usada por otra aplicación (Zoom, Teams, etc.)
2. El navegador no tiene permisos de cámara
3. La cámara está deshabilitada a nivel de sistema operativo
4. Problemas de hardware con la cámara

**Soluciones:**

- ✅ Cierra todas las aplicaciones que puedan estar usando la cámara
- ✅ Verifica los permisos de cámara en el navegador (icono de candado en la barra de direcciones)
- ✅ Revisa la configuración de privacidad del sistema operativo
- ✅ Intenta con otro navegador (Chrome, Firefox, Edge)
- ✅ Reinicia el navegador
- ✅ Reinicia la computadora si el problema persiste

### ❌ Error: "NotAllowedError" / "PermissionDeniedError"

**Causa:** El usuario denegó el permiso de cámara

**Solución:**

1. Hacer clic en el icono de candado/información en la barra de direcciones
2. Cambiar los permisos de cámara a "Permitir"
3. Recargar la página
4. Intentar iniciar el escaneo de nuevo

### ❌ Error: "NotFoundError" / "DevicesNotFoundError"

**Causa:** No se detectó ninguna cámara

**Solución:**

- Verificar que la cámara esté conectada (en caso de cámara externa)
- Verificar que el driver de la cámara esté instalado
- Probar la cámara en otra aplicación para confirmar que funciona

### ❌ Error: "NotReadableError" / "TrackStartError"

**Causa:** La cámara no puede ser leída (hardware/software)

**Solución:**

- Cerrar otras aplicaciones que estén usando la cámara
- Reiniciar el navegador
- Actualizar los drivers de la cámara
- Verificar en el Administrador de Dispositivos (Windows) que la cámara esté habilitada

## 🚀 Mejoras Implementadas

### Estrategia de Fallback (3 niveles)

1. **Primer intento:** Cámara trasera (ideal para móviles)

   ```javascript
   {
     facingMode: {
       ideal: "environment";
     }
   }
   ```

2. **Segundo intento:** Cámara frontal

   ```javascript
   {
     facingMode: "user";
   }
   ```

3. **Tercer intento:** Primera cámara disponible por ID
   ```javascript
   const devices = await Html5Qrcode.getCameras();
   await scanner.start(devices[0].id, config, ...);
   ```

### Mensajes de Error Específicos

El componente ahora detecta el tipo de error y muestra mensajes apropiados:

- **Permiso denegado:** Guía para habilitar permisos
- **Cámara no encontrada:** Verificar hardware
- **Cámara en uso:** Cerrar otras aplicaciones
- **Error de configuración:** Intentar con otra cámara

### Limpieza Mejorada

- Verifica el estado del escáner antes de detenerlo
- Limpia la instancia apropiadamente
- Maneja errores sin interrumpir la UX

## 🔍 Debug Mode

Para habilitar más logs de depuración, descomenta la línea en `onScanError`:

```javascript
const onScanError = (errorMessage) => {
  console.warn("QR Scan error:", errorMessage); // Descomentar para debug
};
```

## 🌐 Requisitos del Navegador

### ✅ Compatibilidad Completa

- Chrome 53+
- Firefox 36+
- Safari 11+
- Edge 79+

### ⚠️ Requisitos de Seguridad

- **HTTPS obligatorio** (excepto en localhost)
- El navegador debe soportar `getUserMedia` API
- El usuario debe otorgar permisos de cámara

### 📱 Dispositivos Móviles

**iOS:**

- Safari 11+ o Chrome iOS
- iOS 11+ requerido
- Puede pedir permisos adicionales en Configuración > Safari > Cámara

**Android:**

- Chrome 53+ o Firefox 36+
- Android 5+ recomendado
- Verificar permisos en Configuración > Aplicaciones > Chrome > Permisos

## 🧪 Probar la Cámara

Antes de usar el lector QR, puedes probar la cámara en:

- https://webcamtests.com/
- https://www.onlinemictest.com/webcam-test/

## 📞 Soporte Adicional

Si el problema persiste después de seguir estos pasos:

1. Revisar la consola del navegador (F12) para errores específicos
2. Verificar que la URL sea HTTPS (o localhost)
3. Probar en modo incógnito/privado
4. Deshabilitar extensiones del navegador temporalmente
5. Verificar que no haya políticas corporativas bloqueando la cámara

## 🔧 Para Desarrolladores

### Verificar Estado del Escáner

```javascript
const state = html5QrCodeRef.current.getState();
// 0 = NOT_STARTED
// 1 = STARTING
// 2 = SCANNING
// 3 = PAUSED
```

### Listar Cámaras Disponibles

```javascript
const cameras = await Html5Qrcode.getCameras();
console.log("Cámaras disponibles:", cameras);
```

### Forzar Limpieza Manual

Si el escáner se queda en un estado inconsistente:

```javascript
if (html5QrCodeRef.current) {
  html5QrCodeRef.current
    .stop()
    .then(() => html5QrCodeRef.current.clear())
    .catch((err) => console.error(err));
}
```
