# Integración Frontend - Sistema de Boletos QR

## Resumen de Cambios

Se ha completado la integración frontend del sistema de boletos con código QR, conectando el componente `Boleto.jsx` existente con el backend de Azure Functions.

## Archivos Creados

### 1. **src/services/boletoService.js**
Servicio HTTP que maneja todas las llamadas al API:
- `subirDiseno(eventoId, archivo)` - Sube diseño de invitación (PNG/JPEG)
- `guardarConfiguracionQR(eventoId, qrConfig)` - Guarda posición y tamaño del QR
- `obtenerConfiguracion(eventoId)` - Obtiene configuración actual
- `generarBoletoIndividual(eventoId, invitadoId)` - Genera boleto con QR para un invitado
- `descargarBoletosMasivo(eventoId)` - Descarga ZIP con todos los boletos
- `compartirBoleto(blobUrl, titulo)` - Comparte boleto via Web Share API
- `validarImagen(archivo)` - Valida tipo y tamaño de imagen (max 100MB)

### 2. **src/hooks/useBoletos.js**
Custom hook que maneja el estado y lógica del componente:
- Estado: `configuracion`, `loading`, `error`
- Métodos: Wrappers de los métodos del servicio con manejo de errores
- Integración: Usa `useSelectedEvent` para obtener el evento actual

### 3. **src/pages/Boletos.jsx**
Página contenedora que envuelve el componente `Boleto.jsx`:
- Layout con título y descripción
- Mensajes contextuales según rol de usuario
- Integración con sistema de autenticación

## Archivos Modificados

### 1. **src/components/Boletos/Boleto.jsx**
Actualizado para usar el API backend en lugar de estado local:
- **Importaciones**: Agregado `useBoletos` hook y `useSelectedEvent` context
- **Estado**: Agregado `archivoImagen` para mantener referencia al archivo
- **Carga inicial**: `useEffect` carga configuración existente al montar
- **handleImagenChange**: Guarda archivo para subir después
- **handleSiguiente**: Sube diseño al backend vía API
- **handleGuardarAjustes**: Guarda configuración QR en backend
- **handleDescargar**: Descarga ZIP con todos los boletos del evento
- **Estados de carga**: Agregado `InlineSpinner` en botones durante operaciones
- **Manejo de errores**: Muestra mensajes de error en UI

### 2. **src/components/layout/Routes.jsx**
Agregada nueva ruta:
```jsx
<Route path="Boletos" element={<Boletos />} />
```

### 3. **src/components/layout/MasterPage.jsx**
Agregado enlace de navegación:
```jsx
<NavLink to="/Boletos" className={({ isActive }) => "nav-item boletos" + (isActive ? " active" : "")}>
  Boletos QR
</NavLink>
```

## Flujo de Usuario

### Administrador (Configuración)
1. **Navegar** a "Boletos QR" en el menú principal
2. **Subir diseño** de invitación (PNG/JPEG, max 100MB)
3. **Vista previa** - Verificar imagen cargada
4. **Clic en "Siguiente"** - Se sube al backend Azure Blob Storage
5. **Alerta** - Indicar dónde colocar el QR
6. **Configurar QR** - Arrastrar y redimensionar cuadro QR sobre la imagen
7. **Guardar ajustes** - Se guarda configuración en CosmosDB
8. **Vista final** - Previsualización con QR en posición configurada
9. **Descargar** - Genera y descarga ZIP con todos los boletos del evento

### Invitado (Generación)
1. Acceder a su perfil/dashboard
2. Generar su boleto individual (requiere selección de mesa completa)
3. Descargar/compartir boleto con QR personalizado

## Integración con Backend

### Endpoints Consumidos
```
POST   /api/v1/eventos/{eventoId}/boletos/diseno
PUT    /api/v1/eventos/{eventoId}/boletos/configuracion-qr
GET    /api/v1/eventos/{eventoId}/boletos/configuracion
GET    /api/v1/eventos/{eventoId}/boletos/invitado/{invitadoId}
GET    /api/v1/eventos/{eventoId}/boletos/descargar-masivo
```

### Formato de Datos

**Configuración QR (guardada y recibida):**
```json
{
  "x": 0.5,        // Posición X como porcentaje (0-1)
  "y": 0.3,        // Posición Y como porcentaje (0-1)
  "width": 0.2,    // Ancho como porcentaje (0-1)
  "height": 0.2    // Alto como porcentaje (0-1)
}
```

**Respuesta de configuración:**
```json
{
  "success": true,
  "data": {
    "id": "evento123",
    "id_evento": "evento123",
    "imagen_url": "https://storage.blob.core.windows.net/...",
    "qr_config": {
      "x": 0.5,
      "y": 0.3,
      "width": 0.2,
      "height": 0.2
    },
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T11:45:00Z"
  }
}
```

## Dependencias del Frontend

Ya existentes en el proyecto:
- `axios` - Cliente HTTP (wrapper en `httpService.js`)
- `react` - Framework
- `react-router-dom` - Navegación

Componentes reutilizados:
- `InlineSpinner` - Indicador de carga
- `MovibleQR` - Componente de arrastrar/redimensionar QR
- `useAuth` - Hook de autenticación
- `useSelectedEvent` - Hook de evento seleccionado

## Características Implementadas

✅ **Carga de configuración**: Al abrir la página, carga automáticamente diseño y configuración existente
✅ **Upload progresivo**: Indicadores de carga durante subida de archivos
✅ **Validación**: Tipo de archivo (PNG/JPEG) y tamaño (max 100MB)
✅ **Gestión de errores**: Mensajes claros en UI con opción de limpiar
✅ **Estados de UI**: Spinner en botones durante operaciones async
✅ **Descarga masiva**: Genera ZIP con todos los boletos del evento
✅ **Responsive**: Mantiene diseño responsivo existente
✅ **Integración contextual**: Usa evento actual del contexto global

## Próximos Pasos (Opcional)

### 1. Boletos para Invitados
Agregar vista para que invitados generen su boleto individual:
```jsx
// En dashboard de invitado o página de perfil
const { generarBoletoIndividual } = useBoletos();

const handleGenerarMiBoleto = async () => {
  const invitadoId = user.id; // o desde el estado/context
  await generarBoletoIndividual(eventoActual.id, invitadoId);
};
```

### 2. Botón Compartir
Implementar funcionalidad del botón "Compartir":
```jsx
const handleCompartir = async () => {
  const { compartirBoleto } = useBoletos();
  const blobUrl = await generarBoletoIndividual(eventoActual.id, invitadoId);
  await compartirBoleto(blobUrl, `Boleto - ${user.nombre}`);
};
```

### 3. CSS para nav-item boletos
Agregar estilos en `src/styles/components/MasterPage.css`:
```css
.nav-item.boletos {
  /* Iconografía y colores específicos */
  background-color: #your-color;
}
.nav-item.boletos.active {
  /* Estado activo */
}
```

### 4. Permisos y Roles
Verificar que solo admins puedan configurar y que invitados puedan generar:
```jsx
// En Boletos.jsx
const { user } = useAuth();
const esAdmin = user?.role === "admin";

// Mostrar diferentes vistas según rol
{esAdmin ? <ConfiguracionBoletos /> : <GenerarMiBoleto />}
```

## Testing Local

1. **Iniciar backend**:
   ```powershell
   cd EventosApi
   func start
   ```

2. **Iniciar frontend**:
   ```powershell
   cd eventos-web-app
   npm start
   ```

3. **Flujo de prueba**:
   - Login como admin
   - Navegar a "Boletos QR"
   - Subir imagen de prueba
   - Configurar posición del QR
   - Verificar que se guarde en CosmosDB
   - Probar descarga masiva (debe generar ZIP)

## Variables de Entorno Necesarias

**Backend** (`local.settings.json`):
```json
{
  "COSMOS_DB_CONNECTION_STRING": "...",
  "BLOB_STORAGE_CONNECTION_STRING": "...",
  "BLOB_STORAGE_CONTAINER_DISENOS": "disenos-invitaciones",
  "BLOB_STORAGE_CONTAINER_BOLETOS": "boletos-generados"
}
```

**Frontend** (`.env` o config):
```env
REACT_APP_API_URL=http://localhost:7071/api/v1
```

## Troubleshooting

### Error: "Cannot read property 'id' of undefined"
**Causa**: No hay evento seleccionado en el contexto
**Solución**: Asegurarse de seleccionar un evento antes de acceder a Boletos

### Error: "Failed to upload design"
**Causa**: Archivo muy grande o tipo no soportado
**Solución**: Verificar que sea PNG/JPEG y menor a 100MB

### Error: "Configuration not found"
**Causa**: No hay configuración guardada para el evento
**Solución**: Normal en primer uso, subir diseño y configurar QR

### La imagen no se muestra en vista previa
**Causa**: CORS o URL de blob inválida
**Solución**: Verificar configuración de CORS en Azure Blob Storage

## Contacto y Soporte

Para preguntas sobre la implementación, consultar:
- `INTEGRACION_FRONTEND_BOLETOS.md` - Documentación detallada
- `SISTEMA_BOLETOS_QR.md` - Arquitectura general del sistema
- `GUIA_RAPIDA_BOLETOS.md` - Guía de uso rápido
