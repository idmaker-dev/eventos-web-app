# 🚀 Quick Start - Frontend Boletos QR

## Para Desarrolladores

### Iniciar Proyecto Localmente

```powershell
# Terminal 1: Backend
cd C:\proyectos\node\EventosApi
func start

# Terminal 2: Frontend  
cd C:\proyectos\react\eventos-web-app
npm start
```

### URLs Locales
- **Backend API**: http://localhost:7071/api/v1
- **Frontend**: http://localhost:3000
- **Boletos página**: http://localhost:3000/Boletos

### Flujo Rápido de Prueba

1. **Login** como admin en http://localhost:3000/login
2. **Seleccionar evento** desde el selector de eventos
3. **Ir a Boletos QR** desde el menú de navegación
4. **Subir imagen** (usar cualquier PNG/JPEG < 100MB)
5. **Configurar QR** arrastrando el cuadro sobre la imagen
6. **Guardar** y probar descarga masiva

### Estructura de Archivos

```
eventos-web-app/src/
├── services/
│   └── boletoService.js          # HTTP client para API
├── hooks/
│   └── useBoletos.js              # State management hook
├── pages/
│   └── Boletos.jsx                # Container page
├── components/
│   └── Boletos/
│       ├── Boleto.jsx             # Main component (UPDATED)
│       └── MovibleQR.jsx          # Drag/resize QR
└── components/layout/
    ├── Routes.jsx                 # Routes (UPDATED)
    └── MasterPage.jsx             # Navigation (UPDATED)
```

## API Endpoints Disponibles

### Admin Endpoints
```http
POST   /api/v1/eventos/{eventoId}/boletos/diseno
PUT    /api/v1/eventos/{eventoId}/boletos/configuracion-qr
GET    /api/v1/eventos/{eventoId}/boletos/descargar-masivo
```

### Public Endpoints
```http
GET    /api/v1/eventos/{eventoId}/boletos/configuracion
GET    /api/v1/eventos/{eventoId}/boletos/invitado/{invitadoId}
```

## Uso del Hook

```jsx
import { useBoletos } from '../hooks/useBoletos';

function MiComponente() {
  const {
    configuracion,
    loading,
    error,
    cargarConfiguracion,
    subirDiseno,
    guardarConfiguracionQR,
    descargarBoletosMasivo,
    limpiarError
  } = useBoletos();

  // Cargar config al montar
  useEffect(() => {
    cargarConfiguracion(eventoId);
  }, [eventoId]);

  // Subir diseño
  const handleUpload = async (file) => {
    const result = await subirDiseno(eventoId, file);
    if (result.success) {
      console.log('Subido:', result.data);
    }
  };

  // Guardar config QR
  const handleSaveQR = async () => {
    const qrConfig = { x: 0.5, y: 0.3, width: 0.2, height: 0.2 };
    await guardarConfiguracionQR(eventoId, qrConfig);
  };

  // Descargar masivo
  const handleDownload = async () => {
    await descargarBoletosMasivo(eventoId);
  };

  return (
    <div>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {/* Tu UI aquí */}
    </div>
  );
}
```

## Uso del Servicio (Sin Hook)

```jsx
import boletoService from '../services/boletoService';

// Subir diseño
const file = document.querySelector('input[type="file"]').files[0];
const resultado = await boletoService.subirDiseno(eventoId, file);

// Obtener config
const config = await boletoService.obtenerConfiguracion(eventoId);

// Guardar QR config
const qrConfig = { x: 0.5, y: 0.3, width: 0.2, height: 0.2 };
await boletoService.guardarConfiguracionQR(eventoId, qrConfig);

// Generar boleto individual
const blob = await boletoService.generarBoletoIndividual(eventoId, invitadoId);

// Descargar masivo
await boletoService.descargarBoletosMasivo(eventoId);

// Compartir (Web Share API)
await boletoService.compartirBoleto(blobUrl, 'Mi Boleto');
```

## Formato de Datos

### Configuración QR
```json
{
  "x": 0.5,        // 0-1 (0 = izquierda, 1 = derecha)
  "y": 0.3,        // 0-1 (0 = arriba, 1 = abajo)
  "width": 0.2,    // 0-1 (porcentaje del ancho total)
  "height": 0.2    // 0-1 (porcentaje del alto total)
}
```

### Respuesta del API
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
  },
  "message": "Configuración obtenida exitosamente"
}
```

## Debugging

### Console Logs Útiles
```javascript
// En useBoletos.js - descomentar para debug
console.log('Cargando configuración para evento:', eventoId);
console.log('Configuración recibida:', data);
console.log('Error:', error);

// En boletoService.js
console.log('Subiendo diseño:', formData);
console.log('Guardando QR config:', qrConfig);
```

### Verificar Estado del Hook
```jsx
const boletos = useBoletos();
console.log('Estado completo:', boletos);
```

### Network Inspector
- Abrir DevTools → Network
- Filtrar por "boletos"
- Verificar headers (Authorization debe tener Bearer token)
- Verificar payload y response

## Errores Comunes

### ❌ "eventoActual is undefined"
**Causa**: No hay evento seleccionado  
**Solución**: Seleccionar evento desde el selector antes de ir a Boletos

### ❌ "Failed to upload design"
**Causa**: Archivo muy grande o tipo incorrecto  
**Solución**: Verificar que sea PNG/JPEG y < 100MB

### ❌ "Unauthorized"
**Causa**: Token JWT expirado o inválido  
**Solución**: Hacer logout y login nuevamente

### ❌ "Configuration not found"
**Causa**: No hay configuración guardada (normal en primer uso)  
**Solución**: Subir diseño y configurar QR

## Variables de Entorno

### Frontend (.env o .env.local)
```env
REACT_APP_API_URL=http://localhost:7071/api/v1
```

### Backend (local.settings.json)
```json
{
  "Values": {
    "COSMOS_DB_CONNECTION_STRING": "...",
    "BLOB_STORAGE_CONNECTION_STRING": "...",
    "BLOB_STORAGE_CONTAINER_DISENOS": "disenos-invitaciones",
    "BLOB_STORAGE_CONTAINER_BOLETOS": "boletos-generados"
  }
}
```

## Testing

### Test Manual Rápido
```javascript
// En consola del navegador (después de login)
const eventoId = 'tu-evento-id';
const file = new File(['test'], 'test.png', { type: 'image/png' });

// Test upload
await boletoService.subirDiseno(eventoId, file);

// Test config
const config = await boletoService.obtenerConfiguracion(eventoId);
console.log(config);

// Test QR save
await boletoService.guardarConfiguracionQR(eventoId, {
  x: 0.5, y: 0.3, width: 0.2, height: 0.2
});
```

## Recursos

- **Documentación Técnica**: `INTEGRACION_FRONTEND_BOLETOS.md`
- **Checklist**: `CHECKLIST_BOLETOS.md`
- **Resumen**: `RESUMEN_INTEGRACION_FRONTEND.md`
- **Backend Docs**: `../EventosApi/SISTEMA_BOLETOS_QR.md`

## Notas Importantes

⚠️ **Autenticación**: Todos los endpoints requieren JWT excepto los públicos  
⚠️ **Evento Seleccionado**: Componente depende de `useSelectedEvent` context  
⚠️ **Formato QR**: Siempre usar porcentajes (0-1) para compatibilidad  
⚠️ **Blob URLs**: Revocar con `URL.revokeObjectURL()` después de usar  

## Siguientes Pasos

1. ✅ Backend implementado
2. ✅ Frontend integrado
3. ⏳ Testing local completo
4. ⏳ Deploy a Azure
5. ⏳ Testing en producción
6. ⏳ Vista de invitado para generar su boleto

---
**Última actualización**: Enero 2025  
**Versión**: 1.0.0
