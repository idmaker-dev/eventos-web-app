# Sistema de Filtros Contextuales para Automatizaciones

## 📋 Resumen de Cambios

Se implementó un sistema inteligente de filtros que adapta las opciones disponibles según el tipo de disparador y evento seleccionado, resolviendo el problema de mostrar filtros irrelevantes en ciertos contextos.

## 🎯 Problema Resuelto

**Antes:** Si seleccionabas "Graduado Creado" como disparador, veías filtros de turnos y mesas que no tenían sentido porque el graduado apenas se acababa de crear y esa funcionalidad no existe todavía en ese momento del flujo.

**Ahora:** Los filtros se muestran dinámicamente según el contexto, mostrando solo opciones relevantes.

## ⚙️ Arquitectura

### 1. **Archivo de Configuración** (`filtrosContextuales.js`)

Define:
- **Todos los filtros disponibles** (20+ filtros organizados en 7 categorías)
- **Mapeo contextual**: Qué filtros aplican según disparador y evento
- **Mensajes de ayuda** contextuales
- **Filtros recomendados** para cada situación

### 2. **Categorías de Filtros**

```
📌 BÁSICO
  - tiene_telefono
  - tiene_correo
  - id_evento

🎓 ACADÉMICO
  - instituto
  - licenciatura
  - escuela

👤 PERSONAL
  - es_mayor_edad
  - rango_edad

🎟️ BOLETOS
  - tiene_boletos
  - cantidad_boletos_min

💰 DEUDA
  - estado_deuda
  - monto_pendiente_min/max
  - dias_hasta_vencimiento

🕐 TURNOS
  - turno_confirmado
  - tiene_turno_asignado

🪑 MESAS
  - mesa_seleccionada
  - tiene_restricciones_alimentarias

👨‍👩‍👧 TUTOR
  - tiene_tutor

📝 CONTRATO
  - contrato_firmado
```

## 🔍 Lógica Contextual

### Ejemplo 1: Graduado Creado

```javascript
disparador: {
  tipo: "evento",
  evento_tipo: "invitado_creado"
}

// Filtros disponibles:
✅ Básicos: tiene_telefono, tiene_correo, id_evento
✅ Académicos: instituto, licenciatura, escuela
✅ Personales: es_mayor_edad, rango_edad
✅ Tutor: tiene_tutor

❌ Deuda: NO (aún no hay deudas)
❌ Turnos: NO (no se han asignado)
❌ Mesas: NO (no existen todavía)

💡 Mensaje: "Recién se creó el invitado. Solo están disponibles datos básicos y académicos."
```

### Ejemplo 2: Pago Completado

```javascript
disparador: {
  tipo: "evento",
  evento_tipo: "pago_completado"
}

// Filtros disponibles:
✅ Básicos, Académicos, Personales
✅ Deuda: estado_deuda, monto_pendiente
✅ Boletos: tiene_boletos, cantidad_boletos_min

❌ Turnos: NO (contexto de pago, no turnos)
❌ Mesas: NO (contexto de pago)

💡 Mensaje: "El pago se completó. Puedes filtrar por estado de deuda y montos."
```

### Ejemplo 3: Turno Asignado

```javascript
disparador: {
  tipo: "evento",
  evento_tipo: "turno_asignado"
}

// Filtros disponibles:
✅ Básicos, Académicos, Personales
✅ Deuda: estado_deuda (puede tener deuda)
✅ Turnos: tiene_turno_asignado, turno_confirmado

❌ Mesas: NO (aún no se confirma turno)

💡 Mensaje: "Se asignó un turno. Los filtros de mesa aún no aplican hasta que se confirme el turno."
```

### Ejemplo 4: Mesa Seleccionada

```javascript
disparador: {
  tipo: "evento",
  evento_tipo: "mesa_seleccionada"
}

// Filtros disponibles:
✅ TODO: Todos los filtros disponibles

💡 Mensaje: "Se seleccionó una mesa. Todos los filtros están disponibles."
```

## 🎨 Interfaz de Usuario

### Componentes Visuales

1. **Badge "Recomendado"**: Filtros sugeridos según contexto
   ```
   [✓] Solo usuarios con teléfono  [RECOMENDADO]
   ```

2. **Mensaje de Ayuda Contextual**: Explicación dinámica
   ```
   ℹ️ Filtros contextuales
   Recién se creó el invitado. Solo están disponibles 
   datos básicos y académicos.
   ```

3. **Contador de Filtros Activos**:
   ```
   2. Filtros de Destinatarios (3 filtros activos)
   ```

4. **Advertencia Sin Disparador**:
   ```
   ⚠️ Configura el disparador primero
   Los filtros disponibles dependen del tipo de 
   disparador que selecciones.
   ```

### Tipos de Controles

- **Boolean**: Checkbox simple (tiene_telefono)
- **Tristate**: 3 botones (null/true/false) - turno_confirmado
- **Multiselect**: Checkboxes múltiples (estado_deuda)
- **Text**: Input de texto (id_evento)
- **Number**: Input numérico con prefijos (monto_pendiente_min: $)

## 🚀 Nuevos Filtros Agregados

### Académicos
- `instituto`: Filtra por institución educativa
- `licenciatura`: Filtra por carrera/programa
- `escuela`: Filtra por campus/escuela

### Personales
- `es_mayor_edad`: Mayor/menor de 18 años
- `rango_edad`: Rango de edad personalizado (min/max)

### Boletos
- `tiene_boletos`: Solo con boletos asignados
- `cantidad_boletos_min`: Mínimo de boletos

### Deuda (expandidos)
- `monto_pendiente_min`: Saldo mínimo pendiente
- `monto_pendiente_max`: Saldo máximo pendiente
- `dias_hasta_vencimiento`: Deudas que vencen en X días

### Turnos
- `tiene_turno_asignado`: Solo con turno activo

### Mesas
- `tiene_restricciones_alimentarias`: Con restricciones dietéticas

### Tutor
- `tiene_tutor`: Con información de tutor/responsable

### Contrato
- `contrato_firmado`: Con/sin contrato firmado

### Correo
- `tiene_correo`: Solo con email registrado

## 📊 Flujo de Datos

```
1. Usuario selecciona disparador
   ↓
2. useMemo calcula filtrosRelevantes
   obtenerFiltrosDisponibles(tipo, evento)
   ↓
3. filtrosContextuales.js determina:
   - Categorías permitidas
   - Filtros excluidos
   - Filtros recomendados
   - Mensaje de ayuda
   ↓
4. PanelFiltros renderiza solo filtros relevantes
   - Badge "Recomendado" en sugeridos
   - Mensaje de ayuda contextual
   ↓
5. Usuario configura filtros activos
   ↓
6. Al guardar: filtros completos → backend
```

## 🛠️ Uso en Código

### Obtener Filtros Disponibles

```javascript
import { obtenerFiltrosDisponibles } from './filtrosContextuales';

const filtros = obtenerFiltrosDisponibles(
  'evento',           // tipo de disparador
  'invitado_creado'   // evento (opcional)
);

// Retorna:
{
  tiene_telefono: {
    tipo: "boolean",
    label: "Solo usuarios con teléfono",
    categoria: "basico",
    es_recomendado: true
  },
  // ... más filtros
}
```

### Obtener Mensaje de Ayuda

```javascript
import { obtenerMensajeAyuda } from './filtrosContextuales';

const mensaje = obtenerMensajeAyuda('evento', 'pago_completado');
// "El pago se completó. Puedes filtrar por estado de deuda y montos."
```

## 🧪 Casos de Prueba Sugeridos

1. **Crear automatización con "Graduado Creado"**
   - ✓ Verificar que NO aparecen filtros de turnos/mesas
   - ✓ Verificar mensaje de ayuda correcto
   - ✓ Verificar badge "Recomendado" en tiene_telefono

2. **Cambiar a "Pago Completado"**
   - ✓ Filtros de deuda ahora visibles
   - ✓ Filtros de turnos aún no visibles
   - ✓ Mensaje de ayuda actualizado

3. **Cambiar a "Mesa Seleccionada"**
   - ✓ Todos los filtros disponibles
   - ✓ Mensaje indica disponibilidad completa

4. **Tipo "Programado" (cron)**
   - ✓ Todos los filtros disponibles
   - ✓ Mensaje general

## 📚 Próximas Mejoras

1. **Filtros dinámicos**: Cargar opciones de instituto/licenciatura desde backend
2. **Validación**: Advertir si filtros son mutuamente exclusivos
3. **Guardar presets**: Templates de filtros comunes
4. **Analytics**: Mostrar cuántos usuarios cumplen los filtros actuales
5. **Filtro OR/AND**: Lógica de combinación de filtros

## 🔗 Archivos Modificados

- ✅ `filtrosContextuales.js` (NUEVO)
- ✅ `ConfiguracionNueva.jsx` (MODIFICADO)
  - Importa utilidades de filtros
  - Estado expandido con 20+ campos de filtros
  - useMemo para calcular filtros relevantes
  - PanelFiltros completamente reescrito
  - Renderizado dinámico según tipo de control
  - Mensajes de ayuda contextuales
  - Badges "Recomendado"
  - Contador de filtros activos

---

**Implementado**: Abril 2026  
**Versión**: 2.0.0  
**Retrocompatible**: ✅ Sí (filtros antiguos siguen funcionando)
