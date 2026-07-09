# Migración del Sistema de Capacidades

## Resumen de Cambios

Se ha completado la migración del sistema de **distribución por cuotas** al nuevo sistema **simplificado de capacidad base + aumentos opcionales**.

## Objetivo del Cambio

### Sistema Antiguo (Cuotas)
- Requeríapredefining exactamente cuántas mesas de cada capacidad (ej: 20 mesas @ 10, 13 mesas @ 12)
- Complejo de configurar y ajustar
- Difícil de entender para los usuarios

### Sistema Nuevo (Base + Aumentos)
- **Todas las mesas empiezan con capacidad_base** (ej: 10 asientos)
- **Opcionalmente** se puede habilitar aumentos con límite
- Si se habilita: definir capacidad_maxima (ej: 12) y cuántas mesas pueden aumentarse (ej: 20 de 33 totales)
- Mucho más simple e intuitivo

## Estructura de Datos

```javascript
distribucion_capacidades: {
  capacidad_base: 10,           // Capacidad inicial de todas las mesas
  permitir_aumento: true,       // ¿Se permite aumentar?
  capacidad_maxima: 12,         // Capacidad máxima permitida
  mesas_pueden_aumentar: 20,    // Límite de cuántas pueden aumentarse
  mesas_aumentadas: 0           // Contador actual (gestionado automáticamente)
}
```

## Componentes Actualizados

### 1. Backend: `eventosService.js`
**Función:** `cambiarCapacidadMesa()`

**Cambios:**
- Reemplazada lógica de cuotas array por contador simple `mesas_aumentadas`
- Validación: `capacidad_base ≤ nueva_capacidad ≤ capacidad_maxima`
- Incrementa contador si pasa de base a aumentada
- Decrementa contador si vuelve de aumentada a base
- Permite cambios entre capacidades aumentadas (11→12) sin afectar contador

### 2. `PanelCuotasCapacidades.jsx`
**Reescritura completa del componente**

**Antes:**
- Gestión de array de cuotas `[{capacidad: 10, cantidad: 20}, {capacidad: 12, cantidad: 13}]`
- Agregar/eliminar cuotas con botones
- Validar que suma de cantidades = total mesas

**Ahora:**
- Inputs simples: `capacidad_base`, checkbox `permitir_aumento`
- Si permitir_aumento: `capacidad_maxima`, `mesas_pueden_aumentar`
- Modo lectura: muestra "X de Y mesas aumentadas" con barra de progreso
- Función `calcularEstadoActual()`: determina capacidad_base como la más común

### 3. `SelectorCapacidadMesa.jsx`
**Props actualizadas**

**Antes:** `cuotas={[...]}`  
**Ahora:** `configuracion={{capacidad_base, permitir_aumento, ...}}`

**Cambios:**
- `getOpcionesCapacidad()`: genera rango dinámicamente desde base hasta maxima
- `getInfoDisponibilidad()`: muestra feedback basado en `mesas_aumentadas` vs `mesas_pueden_aumentar`
- Mensajes: "X cupos disponibles", "Límite alcanzado", etc.

### 4. `DistribuccionMonitor.jsx`
**State y callbacks actualizados**

**Cambios:**
- `cuotasCapacidades` → `configuracionCapacidad`
- `handleCuotasActualizadas` → (removido, ya no se usa)
- `calcularCuotasDesdeElementos()` → `calcularConfiguracionDesdeElementos()`
- Pasa `configuracion` a `SelectorCapacidadMesa` en lugar de `cuotas`
- `handleCapacidadCambiada`: recibe `distribucion` en lugar de array cuotas

### 5. `DistribuccionEditor.jsx`
**Integración actualizada**

**Cambios:**
- `cuotasCapacidades` → `configuracionCapacidad`
- `handleCuotasActualizadas` → `handleConfiguracionActualizada`
- Prop `onConfiguracionActualizada` a `PanelCuotasCapacidades`
- `agregarMesasMultiples()`: ya acepta `distribucion_capacidades` (sin cambios necesarios)
- Todas las mesas se crean con `capacidad_base`

### 6. `ModalAgregarMesasMultiples.jsx`
**Actualización completa del modal**

#### State (Líneas ~11-16)
**Antes:**
```javascript
const [usarDistribucionCapacidades, setUsarDistribucionCapacidades] = useState(false);
const [cuotasCapacidades, setCuotasCapacidades] = useState([{capacidad: 10, cantidad: 0}]);
const [totalAsignado, setTotalAsignado] = useState(0);
```

**Ahora:**
```javascript
const [usarConfiguracionCapacidades, setUsarConfiguracionCapacidades] = useState(false);
const [permitirAumento, setPermitirAumento] = useState(false);
const [capacidadMaxima, setCapacidadMaxima] = useState(12);
const [mesasPuedenAumentar, setMesasPuedenAumentar] = useState(0);
```

#### Validación handleConfirmar (Líneas ~39-67)
**Antes:**
```javascript
if (usarDistribucionCapacidades && totalAsignado !== cantidadMesas) {
  toast.error(`La suma de cuotas debe ser igual a ${cantidadMesas}`);
  return;
}
```

**Ahora:**
```javascript
if (usarConfiguracionCapacidades && permitirAumento && mesasPuedenAumentar > cantidadMesas) {
  toast.error(`No puedes configurar más de ${cantidadMesas} mesas con aumento`);
  return;
}

config.distribucion_capacidades = {
  capacidad_base: capacidadBase,
  permitir_aumento: permitirAumento,
  capacidad_maxima: capacidadMaxima,
  mesas_pueden_aumentar: mesasPuedenAumentar,
  mesas_aumentadas: 0
};
```

#### UI (Líneas ~225-375)
**Antes:**
- Checkbox "Usar Distribución Personalizada de Capacidades"
- Select para "Capacidad Base (Default)"
- Array de cuotas con agregar/eliminar
- Validación "Total asignado: X / Y"

**Ahora:**
- Checkbox "Configurar Capacidad de Mesas"
- Input numérico con botones +/- para `capacidad_base` (6-20)
- Checkbox "Habilitar aumento de asientos"
- Sección condicional si `permitir_aumento`:
  - Input `capacidad_maxima` (min: capacidad_base, max: 20)
  - Input `mesas_pueden_aumentar` (min: 0, max: cantidadMesas)
  - Resumen: "X mesas de Y asientos. Hasta Z podrán aumentarse a W asientos"

#### Funciones Removidas
- `agregarCuota()`
- `eliminarCuota()`
- `actualizarCuota()`

#### Funciones Añadidas (Líneas ~94-106)
- `incrementarCapacidadBase()`
- `decrementarCapacidadBase()`

## Flujo de Trabajo Actualizado

### 1. Crear Layout con Múltiples Mesas
1. Abrir `ModalAgregarMesasMultiples`
2. Configurar cantidad de mesas (ej: 33)
3. Activar "Configurar Capacidad de Mesas"
4. Establecer capacidad_base = 10
5. Activar "Habilitar aumento de asientos"
6. Configurar:
   - Capacidad Máxima: 12
   - Máximo de mesas que pueden aumentar: 20
7. Confirmar → Todas las mesas se crean con 10 asientos

### 2. Aumentar Capacidad de Mesas Individuales
1. En `DistribuccionMonitor`, seleccionar una mesa
2. Usar `SelectorCapacidadMesa` para cambiar de 10 → 11 o 12
3. El sistema automáticamente:
   - Valida que no se exceda `mesas_pueden_aumentar`
   - Incrementa `mesas_aumentadas`
   - Actualiza la visualización

### 3. Monitoreo de Estado
- `PanelCuotasCapacidades` muestra en modo lectura:
  - Capacidad base: 10 asientos
  - Total de mesas: 33
  - Barra de progreso: "15 de 20 mesas aumentadas"

## Validaciones Implementadas

### Backend (`eventosService.js`)
- ✅ `nueva_capacidad >= capacidad_base`
- ✅ `nueva_capacidad <= capacidad_maxima`
- ✅ Si intenta aumentar y `mesas_aumentadas >= mesas_pueden_aumentar` → Error 400
- ✅ Permite cambiar entre capacidades aumentadas (11→12) sin error

### Frontend
- ✅ `capacidadBase` entre 6 y 20
- ✅ `capacidadMaxima >= capacidadBase`
- ✅ `mesasPuedenAumentar <= cantidadMesas`
- ✅ Feedback visual de disponibilidad en selector

## Testing

### Casos de Prueba

#### Test 1: Crear layout básico
```
1. Crear layout con 33 mesas, capacidad_base: 10
2. NO habilitar aumentos
3. Verificar: todas las mesas tienen 10 asientos
4. Intentar cambiar a 11 → debe fallar (no permitido)
```

#### Test 2: Crear layout con aumentos
```
1. Crear layout con 33 mesas
2. capacidad_base: 10
3. Habilitar aumentos:
   - capacidad_maxima: 12
   - mesas_pueden_aumentar: 20
4. Verificar: todas empiezan en 10
5. Cambiar 15 mesas a 11 → debe funcionar
6. Panel muestra "15 de 20"
7. Intentar cambiar la 21ª mesa → debe fallar
```

#### Test 3: Cambios entre capacidades aumentadas
```
1. Mesa en capacidad 11
2. Cambiar a 12 → debe funcionar
3. Contador se mantiene igual (no incrementa)
4. Cambiar de 12 a 10 → debe funcionar
5. Contador decrementa en 1
```

## Retrocompatibilidad

⚠️ **BREAKING CHANGE**: El formato antiguo de `cuotas_capacidades` ya no es soportado.

### Migración Manual Requerida
Si tienes eventos existentes con el sistema antiguo:

**Antiguo:**
```javascript
{
  cuotas_capacidades: [
    {capacidad: 10, cantidad: 20},
    {capacidad: 12, cantidad: 13}
  ]
}
```

**Nuevo (equivalente):**
```javascript
{
  distribucion_capacidades: {
    capacidad_base: 10,
    permitir_aumento: true,
    capacidad_maxima: 12,
    mesas_pueden_aumentar: 13,
    mesas_aumentadas: 0  // Calcular basándose en mesas actuales
  }
}
```

## Estado de Implementación

✅ **COMPLETADO**
- [x] Backend: `eventosService.js` - cambiarCapacidadMesa()
- [x] `PanelCuotasCapacidades.jsx` - Reescritura completa
- [x] `SelectorCapacidadMesa.jsx` - Props y lógica actualizados
- [x] `DistribuccionMonitor.jsx` - State y callbacks actualizados
- [x] `DistribuccionEditor.jsx` - Integración actualizada
- [x] `ModalAgregarMesasMultiples.jsx` - UI y state completamente actualizados

## Próximos Pasos

1. ✅ Testing manual de flujo completo
2. ⏳ Testing en producción con usuarios reales
3. ⏳ Monitorear feedback y ajustar UX si es necesario
4. ⏳ Documentar proceso de migración para eventos existentes (si aplica)

## Notas Técnicas

### Performance
- El contador `mesas_aumentadas` se actualiza en tiempo real con cada cambio
- No requiere recálculo completo del estado
- Operaciones O(1) en lugar de O(n) del sistema anterior

### UX Improvements
- Mucho más intuitivo: "base + aumentos opcionales"
- Feedback visual inmediato de cupos disponibles
- Resumen claro del estado actual
- Validaciones en tiempo real

### Mantenibilidad
- Código más simple y legible
- Menos estados que sincronizar
- Validaciones centralizadas en backend
- Estructura de datos más plana

---

**Fecha de Migración:** 2024-01-XX  
**Versión:** 2.0.0  
**Autor:** Sistema EventosApi
