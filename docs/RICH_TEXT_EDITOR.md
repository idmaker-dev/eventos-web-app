# Editor de Texto Enriquecido para Automatizaciones

## 📝 Descripción

Se ha implementado un editor de texto enriquecido (Rich Text Editor) para mejorar la experiencia al crear plantillas de mensajes en las automatizaciones. Este editor reemplaza los campos de texto simples (`<textarea>`) con una interfaz completa de edición con formato.

## ✨ Características Implementadas

### 🎨 Formato de Texto
- **Negrita, cursiva, subrayado, tachado**
- **Encabezados** (H1, H2, H3)
- **Colores** de texto y fondo
- **Listas** ordenadas y desordenadas
- **Alineación** de texto (izquierda, centro, derecha)
- **Enlaces** (URLs)

### 📋 Variables Dinámicas
- Botones para insertar variables fácilmente
- Variables destacadas en azul y negrita
- Soporte para TODAS las variables del sistema:
  - `{{nombre}}`, `{{nombre_completo}}`
  - `{{correo}}`, `{{telefono}}`
  - `{{instituto}}`, `{{licenciatura}}`
  - `{{monto_total}}`, `{{monto_pendiente}}`
  - `{{fecha_vencimiento_proxima}}`
  - Y más...

### 🌓 Tema Oscuro/Claro
- Soporte completo para tema oscuro
- Estilos personalizados adaptados al diseño de Planoria
- Colores coherentes con la paleta del sistema

### ❓ Ayuda Contextual
- Botón flotante de ayuda (icono `?`)
- Panel desplegable con guía de uso
- Aparece solo en el panel de Acciones (paso 3)

## 📁 Archivos Creados/Modificados

### Nuevos Componentes (Frontend)

1. **`RichTextEditor.jsx`**
   - Componente principal del editor
   - Integra React Quill con configuración personalizada
   - Barra de variables con botones para inserción rápida
   - Ubicación: `src/components/Campana/RichTextEditor.jsx`

2. **`RichTextEditor.css`**
   - Estilos personalizados para el editor
   - Soporte para tema oscuro
   - Formato específico para variables destacadas
   - Ubicación: `src/components/Campana/RichTextEditor.css`

3. **`EditorHelp.jsx`**
   - Componente de ayuda flotante
   - Guía interactiva de uso del editor
   - Aparece solo en el panel de Acciones
   - Ubicación: `src/components/Campana/EditorHelp.jsx`

### Archivos Modificados (Frontend)

4. **`ConfiguracionNueva.jsx`**
   - Importación de `RichTextEditor` y `EditorHelp`
   - Reemplazo de `<textarea>` por `<RichTextEditor>` en:
     - Mensajes de WhatsApp
     - Contenido de Email
   - Integración de ayuda contextual

### Archivos Modificados (Backend)

5. **`emailActionExecutor.js`**
   - Actualizado para soportar HTML completo
   - Removido `white-space: pre-line` que interfería con el HTML
   - Agregados estilos CSS para mejor renderizado de contenido formateado
   - Ubicación: `src/shared/services/actionExecutors/emailActionExecutor.js`

6. **`ultramsgActionExecutor.js`**
   - Nuevo método `htmlATextoPlano()` para convertir HTML a texto
   - Preserva formato básico para WhatsApp:
     - `*negrita*`, `_cursiva_`, `~tachado~`
     - Listas con viñetas `•`
     - Enlaces con formato `texto (url)`
   - Ubicación: `src/shared/services/actionExecutors/ultramsgActionExecutor.js`

## 🔧 Uso

### Para Usuarios

1. **Crear/Editar Automatización**
   - Ve al panel de "Acciones" (paso 3)
   - Agrega una acción de WhatsApp o Email
   - Verás el editor enriquecido en lugar del campo de texto simple

2. **Dar Formato al Texto**
   - Usa la barra de herramientas superior para aplicar formato
   - Selecciona texto y aplica negrita, cursiva, colores, etc.

3. **Insertar Variables**
   - Haz clic en los botones de variables arriba del editor
   - Las variables se insertan automáticamente en la posición del cursor
   - Aparecen destacadas en azul y negrita

4. **Ver Ayuda**
   - Clic en el botón `?` flotante (abajo a la derecha)
   - Lee la guía de uso y consejos
   - Cierra haciendo clic en la `X`

### Para Desarrolladores

#### Integrar el Editor en Otro Componente

```javascript
import RichTextEditor from "./RichTextEditor";

function MiComponente() {
  const [contenido, setContenido] = useState("");

  return (
    <RichTextEditor
      value={contenido}
      onChange={(nuevoContenido) => setContenido(nuevoContenido)}
      placeholder="Escribe aquí..."
      variables={[ // Opcional: lista personalizada de variables
        { name: "nombre", label: "Nombre", description: "Nombre del usuario" },
        { name: "email", label: "Email", description: "Correo electrónico" }
      ]}
    />
  );
}
```

#### Personalizar Variables Disponibles

```javascript
const variablesPersonalizadas = [
  { name: "custom_var", label: "Mi Variable", description: "Descripción" },
  // ... más variables
];

<RichTextEditor
  value={value}
  onChange={onChange}
  variables={variablesPersonalizadas}
/>
```

## 🎯 Backend: Procesamiento de Mensajes

### Email (HTML)
- El contenido HTML se mantiene intacto
- Se renderiza con todos los estilos y formatos
- Template HTML incluye estilos CSS para mejor visualización

### WhatsApp (Texto Plano)
El backend convierte automáticamente HTML a texto plano preservando formato básico:

**Entrada (HTML):**
```html
<p>Hola <strong>Juan</strong>,</p>
<p>Tu pago de <em>$2000</em> ha sido procesado.</p>
<ul>
  <li>Fecha: 13/04/2026</li>
  <li>Monto: $2000</li>
</ul>
```

**Salida (WhatsApp):**
```
Hola *Juan*,
Tu pago de _$2000_ ha sido procesado.

• Fecha: 13/04/2026
• Monto: $2000
```

## 📦 Dependencias

- **react-quill-new** v3.8.3 (ya instalado en package.json)
- **@headlessui/react** (ya instalado)
- **lucide-react** (ya instalado)

## 🚀 Próximos Pasos Recomendados

1. **Vista Previa del Mensaje**
   - Agregar botón "Vista Previa" para ver cómo se verá el mensaje
   - Mostrar versión Email (HTML) y WhatsApp (texto) lado a lado

2. **Plantillas Predefinidas**
   - Crear biblioteca de plantillas comunes
   - Botón "Usar Plantilla" para cargar templates predefinidos

3. **Validación de Variables**
   - Advertir si se usan variables que no existen
   - Sugerir variables disponibles al escribir `{{`

4. **Historial de Mensajes**
   - Guardar versiones anteriores del mensaje
   - Permitir "deshacer" cambios

5. **Emojis**
   - Agregar selector de emojis al editor
   - Especialmente útil para WhatsApp

## 📝 Notas Técnicas

### Almacenamiento
- Los mensajes se guardan como **HTML puro** en la base de datos
- Campo: `accion.mensaje` (string, puede contener HTML)
- No requiere cambios en el schema de CosmosDB

### Compatibilidad
- ✅ Compatible con mensajes antiguos (texto plano se renderiza correctamente)
- ✅ Conversión HTML → Texto no destructiva
- ✅ Variables funcionan igual que antes

### Rendimiento
- Editor carga solo cuando se necesita (lazy)
- Estilos CSS optimizados (sin duplicación)
- Sin impacto en tiempo de carga global

## 🐛 Troubleshooting

### Problema: Variables no se reemplazan
- **Causa**: El formato debe ser exactamente `{{variable}}`
- **Solución**: Usar los botones de variables en lugar de escribir manualmente

### Problema: Email llega sin formato
- **Causa**: Cliente de email no soporta HTML
- **Solución**: Normal en algunos clientes (como texto plano legacy)

### Problema: WhatsApp muestra HTML
- **Causa**: Conversión HTML → Texto falló
- **Solución**: Revisar logs del backend `ultramsgActionExecutor.htmlATextoPlano()`

## 📞 Soporte

Para dudas o problemas:
1. Revisar este README
2. Click en ayuda flotante `?` en la interfaz
3. Revisar logs del backend para debugging

---

**Fecha de Implementación**: Abril 2026
**Versión**: 1.0.0
**Desarrollado para**: Planoria - Sistema de Automatizaciones
