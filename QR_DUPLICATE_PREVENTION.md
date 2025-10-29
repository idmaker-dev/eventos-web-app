# 🎯 Sistema de Prevención de Escaneos Duplicados

## Problema Resuelto

Cuando el lector QR detecta un código, lo escanea múltiples veces por segundo (10 FPS), lo cual causaba que el mismo código se procesara repetidamente:

```
✅ QR Code detected: Hola
✅ QR Code detected: Hola  ← Duplicado (mismo frame)
✅ QR Code detected: Hola  ← Duplicado (mismo frame)
✅ QR Code detected: Hola  ← Duplicado (mismo frame)
...
```

## Solución Implementada

### 🔒 Sistema de Debounce con Referencias

Se implementó un sistema de prevención de duplicados usando `useRef` para mantener estado sin causar re-renders:

```javascript
const lastScanTextRef = useRef(null); // Guarda el último código escaneado
const scanTimeoutRef = useRef(null); // Timeout para resetear
```

### 📋 Flujo de Procesamiento

1. **Detección inicial:**

   - QR detectado: "Hola"
   - `lastScanTextRef.current = null` (primera vez)
   - ✅ **Procesa el código**

2. **Detecciones subsecuentes (mismo código):**

   - QR detectado: "Hola"
   - `lastScanTextRef.current = "Hola"` (ya escaneado)
   - ⏭️ **Ignora el código** (log: "Ignorando escaneo duplicado")

3. **Después de 2 segundos:**

   - Timeout se ejecuta
   - `lastScanTextRef.current = null` (resetea)
   - 🔄 **Listo para escanear de nuevo**

4. **Código diferente:**
   - QR detectado: "Adios"
   - `lastScanTextRef.current = "Hola"` (diferente)
   - ✅ **Procesa el código inmediatamente**

## 🎛️ Configuración

### Tiempo de Espera (Debounce)

Actualmente configurado en **2 segundos**:

```javascript
setTimeout(() => {
  lastScanTextRef.current = null;
  console.log("🔄 Listo para escanear nuevamente");
}, 2000); // 2000ms = 2 segundos
```

**Ajustar según necesidad:**

- **1000ms (1s):** Para escaneo rápido continuo
- **2000ms (2s):** Balance entre prevención y usabilidad (actual)
- **3000ms (3s):** Para eventos donde no se espera re-escaneo inmediato

### Modificar el Tiempo

Para cambiar el tiempo de espera, modifica el valor en `onScanSuccess`:

```javascript
// Opción 1: Más rápido (1 segundo)
scanTimeoutRef.current = setTimeout(() => {
  lastScanTextRef.current = null;
}, 1000);

// Opción 2: Más lento (5 segundos)
scanTimeoutRef.current = setTimeout(() => {
  lastScanTextRef.current = null;
}, 5000);
```

## 📊 Logs en Consola

### Escaneo Normal (sin duplicados)

```javascript
✅ QR Code detectado y procesado: Hola {...}
⏭️ Ignorando escaneo duplicado: Hola
⏭️ Ignorando escaneo duplicado: Hola
... (más ignorados silenciosamente)
// [Después de 2 segundos]
🔄 Listo para escanear nuevamente
```

### Escaneo de Códigos Diferentes

```javascript
✅ QR Code detectado y procesado: Código1 {...}
⏭️ Ignorando escaneo duplicado: Código1
✅ QR Code detectado y procesado: Código2 {...}  ← Inmediato, diferente código
⏭️ Ignorando escaneo duplicado: Código2
```

## 🧹 Limpieza de Recursos

El sistema limpia apropiadamente los timeouts en varios escenarios:

### 1. Al Detener el Escaneo

```javascript
handleStopScan() {
  clearTimeout(scanTimeoutRef.current);  // Limpia timeout
  lastScanTextRef.current = null;         // Resetea estado
}
```

### 2. Al Cerrar el Modal

```javascript
useEffect cleanup {
  clearTimeout(scanTimeoutRef.current);  // Previene memory leaks
}
```

### 3. Al Escanear Nuevo Código

```javascript
if (scanTimeoutRef.current) {
  clearTimeout(scanTimeoutRef.current); // Limpia timeout anterior
}
// Inicia nuevo timeout
```

## 💡 Ventajas del Sistema

1. **✅ Sin Re-renders:** Usa `useRef` en lugar de `useState`
2. **✅ Performance:** Solo procesa cuando es necesario
3. **✅ Flexible:** Permite escanear códigos diferentes inmediatamente
4. **✅ Configurable:** Fácil ajustar el tiempo de espera
5. **✅ Sin Memory Leaks:** Limpia timeouts apropiadamente
6. **✅ UX Mejorada:** Evita spam en historial y estadísticas

## 🔄 Casos de Uso

### Caso 1: Escaneo de Invitaciones en Evento

**Escenario:** Validar invitaciones en la entrada

**Configuración sugerida:** 2-3 segundos

- Persona escanea su QR
- Sistema valida y marca como entrada
- Siguiente persona puede escanear inmediatamente (código diferente)
- Misma persona no puede re-escanear durante 2-3 segundos

### Caso 2: Registro de Asistencia

**Escenario:** Control de asistencia en clase/conferencia

**Configuración sugerida:** 5-10 segundos

- Estudiante escanea su QR
- Sistema registra asistencia
- No permite duplicados por varios segundos

### Caso 3: Control de Inventario

**Escenario:** Escaneo rápido de múltiples items

**Configuración sugerida:** 0.5-1 segundo

- Permite escaneo rápido continuo
- Evita duplicados accidentales por movimiento lento

## 🎨 Personalización Avanzada

### Opción 1: Cooldown por Código

Mantener un registro de todos los códigos escaneados recientemente:

```javascript
const recentScansRef = useRef(new Map()); // Map<codigo, timestamp>

const onScanSuccess = useCallback((decodedText) => {
  const now = Date.now();
  const lastTime = recentScansRef.current.get(decodedText);

  // Verificar si se escaneó hace menos de 2 segundos
  if (lastTime && now - lastTime < 2000) {
    console.log("⏭️ Ignorando escaneo reciente");
    return;
  }

  // Actualizar timestamp
  recentScansRef.current.set(decodedText, now);

  // Procesar...
}, []);
```

### Opción 2: Contador de Escaneos

Permitir X escaneos del mismo código antes de bloquearlo:

```javascript
const scanCountRef = useRef(new Map()); // Map<codigo, count>

const onScanSuccess = useCallback((decodedText) => {
  const count = scanCountRef.current.get(decodedText) || 0;

  if (count >= 3) {
    // Máximo 3 escaneos del mismo código
    console.log("⏭️ Máximo de escaneos alcanzado");
    return;
  }

  scanCountRef.current.set(decodedText, count + 1);

  // Procesar...
}, []);
```

### Opción 3: Confirmación Visual

Agregar feedback visual para indicar cooldown:

```javascript
const [cooldownActive, setCooldownActive] = useState(false);

const onScanSuccess = useCallback(
  (decodedText) => {
    if (cooldownActive) {
      console.log("⏭️ En cooldown, espera...");
      return;
    }

    setCooldownActive(true);

    // Procesar...

    setTimeout(() => {
      setCooldownActive(false);
    }, 2000);
  },
  [cooldownActive]
);
```

## 🧪 Testing

Para probar el sistema:

1. **Genera un QR simple**
2. **Escanea y observa logs:**
   - Primer escaneo: ✅ procesado
   - Siguientes escaneos: ⏭️ ignorados
3. **Espera 2 segundos**
4. **Escanea de nuevo:** ✅ procesado
5. **Cambia de QR:** ✅ procesado inmediatamente

## 📝 Notas Técnicas

- **useRef vs useState:** Elegimos `useRef` porque no necesitamos re-render cuando cambia el último código escaneado
- **Timeout vs Throttle:** Usamos timeout (debounce) en lugar de throttle porque queremos procesar el primer escaneo inmediatamente
- **Memory Safety:** Limpiamos timeouts en todos los puntos de salida del componente
- **Race Conditions:** El sistema maneja correctamente cambios rápidos entre códigos diferentes

## 🎯 Resultado Final

**Antes:**

```
Historial:
- Hola (10:30:01.123)
- Hola (10:30:01.223)
- Hola (10:30:01.323)
- Hola (10:30:01.423)
```

**Después:**

```
Historial:
- Hola (10:30:01.123)
- Código2 (10:30:05.456)
- Código3 (10:30:10.789)
```

✨ **Sistema limpio, eficiente y user-friendly**
