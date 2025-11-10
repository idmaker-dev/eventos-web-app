# Transformación de Elementos en el Editor de Distribución

## 🎯 Nuevas Funcionalidades Implementadas

### 1. **Redimensionamiento de Elementos** 📏

Ahora puedes cambiar el tamaño de **todos los elementos** (mesas, barras, escenarios, pistas de baile, etc.) de manera flexible:

#### Escala Uniforme

- **Control**: Campo "Escala" en el panel morado
- **Rango**: 10% - 500%
- **Incremento**: 5%
- **Uso**: Cambia el tamaño manteniendo la proporción original
- **Ejemplo**: 100% = tamaño original, 150% = 50% más grande, 50% = mitad del tamaño

#### Ancho y Alto Independientes

- **Control**: Campos "Ancho" y "Alto" (visibles cuando 🔓 está desbloqueado)
- **Rango**: 10% - 500% cada uno
- **Uso**: Permite deformar elementos cambiando solo una dimensión
- **Casos de uso**:
  - Alargar mesas rectangulares
  - Hacer barras más anchas
  - Ajustar proporciones de pistas de baile

#### Bloqueo de Proporción 🔒

- **Botón**: 🔒 (bloqueado) / 🔓 (desbloqueado)
- **Bloqueado**: Solo muestra control de "Escala" - mantiene proporción
- **Desbloqueado**: Muestra "Ancho" y "Alto" - permite deformación

### 2. **Rotación Libre** 🔄

Además de rotar en incrementos de 90°, ahora puedes rotar a **cualquier ángulo**:

#### Rotación por Incrementos

- **Botón "+90°"**: Rota 90 grados en sentido horario
- **Tecla R**: Igual que el botón +90°
- **Shift+R**: Rota 90 grados antihorario

#### Rotación Exacta

- **Control**: Campo "Rotación" en el panel morado
- **Rango**: 0° - 359°
- **Incremento**: 1°
- **Uso**: Ingresa el ángulo exacto deseado
- **Ejemplos**:
  - 45° = diagonal
  - 180° = invertido
  - 270° = 90° antihorario

## 🎨 Panel de Controles de Transformación

Cuando seleccionas uno o más elementos, aparece un **panel morado** con los siguientes controles:

```
┌─────────────────────────────────────────────────────────────┐
│ Rotación: [___]° | Escala: [___]% | 🔒 | Ancho: [___]% | Alto: [___]% │
└─────────────────────────────────────────────────────────────┘
```

### Características del Panel:

- **Color morado**: Distinguible del panel azul de selección básica
- **Actualización automática**: Muestra valores del primer elemento seleccionado
- **Entrada rápida**:
  - Escribe valor y presiona **Enter** para aplicar
  - O sal del campo (blur) para aplicar automáticamente

## 💾 Persistencia de Datos

Todos los elementos ahora tienen las siguientes propiedades guardadas:

```javascript
{
  id: "mesa-1",
  type: "mesa",
  position: { x: 100, y: 200 },
  rotation: 45,        // Ángulo en grados (0-359)
  scale: 1.5,          // Escala uniforme (1 = 100%)
  scaleX: 1.2,         // Escala horizontal (opcional)
  scaleY: 0.8,         // Escala vertical (opcional)
  // ... otros campos
}
```

### Notas Técnicas:

- `scale` es la escala base para ambas dimensiones
- `scaleX` y `scaleY` se usan solo cuando la proporción está desbloqueada
- Si `scaleX` o `scaleY` no existen, se usa `scale`
- La transformación CSS combina rotación y escala: `transform: rotate(45deg) scale(1.2, 0.8)`

## 📋 Casos de Uso

### Ejemplo 1: Mesas más grandes en el centro

1. Selecciona las mesas centrales (Ctrl+Click o arrastra área)
2. En "Escala", pon 120
3. Presiona Enter
4. Las mesas crecen un 20%

### Ejemplo 2: Barra inclinada

1. Selecciona la barra
2. En "Rotación", pon 30
3. Presiona Enter
4. La barra se inclina 30 grados

### Ejemplo 3: Mesa rectangular alargada

1. Selecciona una mesa rectangular
2. Click en 🔓 para desbloquear proporción
3. En "Ancho", pon 150
4. En "Alto", deja 100
5. La mesa se alarga horizontalmente

### Ejemplo 4: Pista de baile personalizada

1. Selecciona la pista de baile
2. Desbloquea proporción 🔓
3. Ancho: 200, Alto: 80
4. Rotación: 45
5. Obtienes una pista rectangular girada en diagonal

## ⌨️ Atajos de Teclado (sin cambios)

- **Ctrl+A**: Seleccionar todas las mesas
- **R**: Rotar elementos seleccionados 90° horario
- **Shift+R**: Rotar 90° antihorario
- **Flechas ←↑→↓**: Mover pixel a pixel
- **Shift+Flechas**: Mover 10 píxeles
- **Esc**: Limpiar selección
- **Delete**: Eliminar elementos seleccionados

## 🔧 Implementación Técnica

### Archivos Modificados:

- `src/components/Distribuccion/DistribuccionEditor.jsx`

### Funciones Agregadas:

- `setRotacionElementosSeleccionados(angulo)`: Establece rotación exacta
- `setEscalaElementosSeleccionados(escala)`: Establece escala uniforme
- `setAnchoElementosSeleccionados(porcentaje)`: Cambia solo el ancho
- `setAltoElementosSeleccionados(porcentaje)`: Cambia solo el alto

### Estados Agregados:

- `rotationInput`: Valor del input de rotación
- `scaleInput`: Valor del input de escala
- `widthInput`: Valor del input de ancho
- `heightInput`: Valor del input de alto
- `lockAspectRatio`: Estado del bloqueo de proporción

### Propiedades de Elementos:

- `scale`: Escala base (default: 1)
- `scaleX`: Escala horizontal (opcional)
- `scaleY`: Escala vertical (opcional)
- `rotation`: Ángulo de rotación (default: 0)

## ✅ Compatibilidad

- ✅ Funciona con todos los tipos de elementos (mesas, barras, escenarios, etc.)
- ✅ Compatible con selección múltiple
- ✅ Los valores se guardan en el layout
- ✅ Los valores se restauran al cargar una configuración
- ✅ Modo oscuro soportado
- ✅ Validación de rangos (10% - 500%)

## 🎉 Beneficios

1. **Mayor flexibilidad**: Adapta elementos a espacios específicos
2. **Precisión**: Ángulos exactos en lugar de múltiplos de 90°
3. **Control total**: Escala uniforme o deformación independiente
4. **Diseño profesional**: Crea layouts más realistas y personalizados
5. **Eficiencia**: Transforma múltiples elementos a la vez
