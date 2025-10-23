# 🎫 Sistema de Confirmación de Boletos - Guía Completa

## 📋 Descripción General

El sistema de confirmación de boletos permite un control granular del check-in de invitados. Cada invitado puede tener múltiples boletos y puede confirmarlos en diferentes momentos, permitiendo llegadas escalonadas de un mismo grupo.

---

## 🔄 Flujo de Confirmación

### 1. **Escaneo del QR**

- El usuario escanea el código QR de la invitación
- El sistema identifica al invitado y consulta sus datos
- Se verifica cuántos boletos totales tiene asignados

### 2. **Verificación de Boletos Disponibles**

```javascript
const boletosYaUsados = boletosRegistrados[invitadoId] || 0;
const boletosRestantes = boletosTotal - boletosYaUsados;
```

- **Si `boletosRestantes === 0`**:
  - Se muestra mensaje de error
  - No se permite más confirmaciones
  - Se registra en el historial como inválido
- **Si `boletosRestantes > 0`**:
  - Se abre el modal de confirmación
  - Se permite seleccionar de 1 a N boletos restantes

### 3. **Selección de Boletos**

- Modal interactivo con controles **+** / **-**
- Input numérico con validación
- Rango: `min = 1`, `max = boletosRestantes`
- Visualización clara: "X de Y disponibles"

### 4. **Confirmación**

- Al confirmar, se actualiza el tracking: `boletosRegistrados[invitadoId] += boletosConfirmados`
- Se crea registro en el historial con:
  - Boletos confirmados en este escaneo
  - Total de boletos del invitado
  - Acumulado de boletos usados
- Se muestra feedback visual en la interfaz

---

## 💾 Estructura de Datos

### Estado de Confirmación Pendiente

```javascript
pendingConfirmation = {
  invitadoData: {
    id: 'INV001',
    nombre: 'Juan Pérez García',
    mesa: 5,
    boletos: 4,  // Total asignado
    valido: true,
    restricciones: {...}
  },
  boletosRestantes: 2,    // Disponibles para confirmar ahora
  boletosYaUsados: 2      // Ya confirmados en escaneos previos
}
```

### Tracking de Boletos Registrados

```javascript
boletosRegistrados = {
  INV001: 2, // Juan Pérez ha confirmado 2 de 4 boletos
  INV002: 4, // María López ha confirmado los 4 boletos
  INV003: 1, // Carlos Hernández ha confirmado 1 de 3 boletos
};
```

### Registro en Historial

```javascript
scanData = {
  id: 'QR-1234567890',
  timestamp: '2024-01-15T20:30:00.000Z',
  invitadoId: 'INV001',
  invitado: 'Juan Pérez García',
  mesa: 5,
  boletos: 2,           // Confirmados en ESTE escaneo
  boletosTotal: 4,      // Total asignados al invitado
  boletosUsados: 2,     // Total confirmados hasta ahora (incluye este escaneo)
  restricciones: {...},
  valido: true,
  evento: 'Gala Anual 2024'
}
```

---

## 🎯 Casos de Uso

### **Caso 1: Confirmación Total**

```
Invitado: María López
Boletos Totales: 4
Acción: Escanea QR y confirma 4 boletos

Resultado:
✅ 4 boletos confirmados (4/4)
⚠️ Próximo escaneo: "Todos los boletos ya fueron utilizados"
```

### **Caso 2: Confirmación Parcial - Llegada Escalonada**

```
Invitado: Juan Pérez
Boletos Totales: 4

--- Primer Escaneo (8:00 PM) ---
Acción: Escanea QR y confirma 2 boletos
Resultado: ✅ 2 boletos confirmados (2/4)

--- Segundo Escaneo (8:30 PM) ---
Acción: Escanea QR nuevamente
Modal muestra: "2 de 2 disponibles" (Ya usados: 2)
Confirma: 2 boletos
Resultado: ✅ 2 boletos confirmados (4/4)

--- Tercer Escaneo (intento) ---
Resultado: ❌ "Todos los boletos ya fueron utilizados"
```

### **Caso 3: Confirmación Gradual**

```
Invitado: Carlos Hernández
Boletos Totales: 5

Escaneo 1: Confirma 1 boleto → (1/5)
Escaneo 2: Confirma 2 boletos → (3/5)
Escaneo 3: Confirma 1 boleto → (4/5)
Escaneo 4: Confirma 1 boleto → (5/5) ✓ Completo
```

---

## 🎨 Elementos de UI

### **Modal de Confirmación**

```
┌─────────────────────────────────────┐
│ ✓ Confirmar Boletos                 │
├─────────────────────────────────────┤
│ 👤 Juan Pérez García                │
│    Mesa: 5                          │
│    Total de boletos: 4              │
│    Ya usados: 2                     │
│                                     │
│ ¿Cuántos boletos desea confirmar?   │
│                                     │
│  [−]      [ 2 ]      [+]           │
│      de 2 disponible(s)             │
│                                     │
│ [Cancelar] [Confirmar 2 boletos]    │
└─────────────────────────────────────┘
```

### **Última Lectura - Con Boletos**

```
✓ Invitación Válida
👤 Juan Pérez García
🪑 Mesa 5
🎫 2 boletos  [2/4 confirmados]
```

### **Historial - Vista Compacta**

```
✓ María López
  Mesa 12 | 🎫 4 de 4 (4/4) | 20:15
```

### **Error - Boletos Agotados**

```
✗ Invitación No Válida
👤 Juan Pérez García
🪑 Mesa 5
🎫 0 boletos [Todos los boletos ya fueron utilizados]
```

---

## 🔧 Handlers Principales

### `handleConfirmarBoletos()`

```javascript
const handleConfirmarBoletos = () => {
  // 1. Actualizar tracking
  setBoletosRegistrados((prev) => ({
    ...prev,
    [invitadoId]: (prev[invitadoId] || 0) + boletosConfirmar,
  }));

  // 2. Crear registro de escaneo
  const scanData = {
    boletos: boletosConfirmar, // Este escaneo
    boletosTotal: invitadoData.boletos,
    boletosUsados: boletosYaUsados + boletosConfirmar,
  };

  // 3. Actualizar historial y estado
  setLastScan(scanData);
  setScanHistory((prev) => [scanData, ...prev]);

  // 4. Limpiar modal
  setPendingConfirmation(null);
};
```

### `onScanSuccess()` - Con verificación

```javascript
// Calcular disponibilidad
const boletosYaUsados = boletosRegistrados[invitadoId] || 0;
const boletosRestantes = invitadoData.boletos - boletosYaUsados;

// Validar
if (boletosRestantes <= 0) {
  // Registrar error y retornar
  setLastScan({ error: "Todos los boletos ya fueron utilizados" });
  return;
}

// Mostrar modal de confirmación
setPendingConfirmation({
  invitadoData,
  boletosRestantes,
  boletosYaUsados,
});
```

---

## 📊 Estadísticas y Reportes

### Cálculos en Tiempo Real

```javascript
// Total de boletos confirmados
const totalBoletosConfirmados = scanHistory.reduce(
  (sum, scan) => sum + scan.boletos,
  0
);

// Invitados únicos
const invitadosUnicos = new Set(scanHistory.map((scan) => scan.invitadoId))
  .size;

// Promedio de boletos por invitado
const promedioBoletos = totalBoletosConfirmados / invitadosUnicos;

// Boletos por mesa
const boletosPorMesa = scanHistory.reduce((acc, scan) => {
  acc[scan.mesa] = (acc[scan.mesa] || 0) + scan.boletos;
  return acc;
}, {});
```

---

## 🚀 Ventajas del Sistema

### ✅ **Flexibilidad**

- Permite llegadas escalonadas del mismo grupo
- No obliga a confirmar todos los boletos de una vez
- Adaptable a diferentes escenarios de eventos

### ✅ **Control Preciso**

- Tracking exacto de quién llegó y cuándo
- Histórico de confirmaciones parciales
- Prevención de duplicados automática

### ✅ **Experiencia de Usuario**

- Modal intuitivo con controles visuales
- Feedback claro del estado actual
- Mensajes de error descriptivos

### ✅ **Trazabilidad**

- Cada confirmación se registra con timestamp
- Historial completo por invitado
- Estado actualizado en tiempo real

---

## 🔐 Validaciones Implementadas

1. **Rango de boletos**: `1 ≤ boletosConfirmar ≤ boletosRestantes`
2. **Prevención de duplicados**: Debounce de 2 segundos entre escaneos
3. **Verificación de disponibilidad**: Antes de mostrar modal
4. **Bloqueo automático**: Cuando `boletosRestantes === 0`
5. **Persistencia de estado**: `boletosRegistrados` se mantiene durante la sesión

---

## 📝 Ejemplo Completo de Sesión

```
Evento: Gala Anual 2024
Fecha: 15 de Enero, 2024

=== Invitado: Juan Pérez (INV001) ===
Total de Boletos: 4

[20:00:00] Escaneo #1
  → Modal: Confirmar boletos (0 usados, 4 disponibles)
  → Acción: Confirma 2 boletos
  → Registro: "2 de 4 (2/4)" ✓

[20:30:15] Escaneo #2
  → Modal: Confirmar boletos (2 usados, 2 disponibles)
  → Acción: Confirma 1 boleto
  → Registro: "1 de 4 (3/4)" ✓

[21:00:45] Escaneo #3
  → Modal: Confirmar boletos (3 usados, 1 disponible)
  → Acción: Confirma 1 boleto
  → Registro: "1 de 4 (4/4)" ✓

[21:15:00] Escaneo #4 (intento)
  → Verificación: 4 usados, 0 disponibles
  → Resultado: ❌ "Todos los boletos ya fueron utilizados"
  → No se muestra modal

=== Resumen Final ===
✓ 3 confirmaciones exitosas
✓ 4 boletos totales confirmados
✓ Historial completo con timestamps
```

---

## 🛠️ Personalización

### Modificar Cooldown de Debounce

```javascript
const SCAN_COOLDOWN = 3000; // 3 segundos en lugar de 2
```

### Cambiar Comportamiento por Defecto

```javascript
// Siempre iniciar en todos los boletos disponibles
setBoletosConfirmar(boletosRestantes);

// O siempre en el mínimo
setBoletosConfirmar(1);
```

### Agregar Validaciones Adicionales

```javascript
if (boletosRestantes <= 0) {
  // Enviar notificación a administrador
  sendAlertToAdmin(invitadoData);

  // Registrar intento en log
  logUnauthorizedAttempt(invitadoData);
}
```

---

## 📞 Soporte

Para más información sobre el sistema de confirmación de boletos:

- Consulta `INTEGRACION_QR.md` para detalles de la integración
- Revisa `QR_INVITACION_FLOW.md` para el flujo completo
- Verifica `QR_TROUBLESHOOTING.md` para solución de problemas
