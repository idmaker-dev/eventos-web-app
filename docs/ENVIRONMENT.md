# Variables de Entorno - EventPlanner

Este documento explica cómo configurar las variables de entorno para el proyecto EventPlanner.

## 📍 Ubicación

El archivo `.env` debe estar en la **raíz del proyecto**, al mismo nivel que `package.json`:

```
eventos-web-app/
├── .env                 ← Aquí va tu archivo .env
├── .env.example         ← Plantilla de ejemplo
├── package.json
├── src/
└── ...
```

## 🚀 Configuración Inicial

1. **Copia el archivo de ejemplo:**

   ```bash
   cp .env.example .env
   ```

2. **Edita las variables según tu entorno:**
   ```bash
   nano .env
   ```

## 📋 Variables Disponibles

### API Configuration

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_API_VERSION=v1
```

### Autenticación

```env
REACT_APP_JWT_SECRET=tu-jwt-secret-super-seguro
REACT_APP_TOKEN_EXPIRY=24h
```

### URLs Base

```env
REACT_APP_BASE_URL=http://localhost:3000
REACT_APP_ADMIN_URL=http://localhost:3000/admin
```

### Feature Flags

```env
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_DARK_MODE=true
REACT_APP_ENABLE_NOTIFICATIONS=true
```

### Servicios de Terceros

```env
REACT_APP_GOOGLE_MAPS_API_KEY=tu-google-maps-api-key
REACT_APP_STRIPE_PUBLIC_KEY=tu-stripe-public-key
REACT_APP_FIREBASE_CONFIG={"apiKey":"tu-firebase-config"}
```

### Development

```env
REACT_APP_DEBUG_MODE=true
REACT_APP_LOG_LEVEL=debug
REACT_APP_ENVIRONMENT=development
```

## 🔧 Uso en el Código

Las variables se acceden a través del utilitario `EnvConfig`:

```javascript
import EnvConfig from "../utils/config";

// URL de la API
const apiUrl = EnvConfig.FULL_API_URL;

// Feature flags
if (EnvConfig.ENABLE_DARK_MODE) {
  // Habilitar modo oscuro
}

// Debug
if (EnvConfig.DEBUG_MODE) {
  console.log("Debug info");
}
```

## 🛡️ Seguridad

⚠️ **IMPORTANTE:**

- **Nunca** incluyas información sensible como claves privadas
- Solo variables que empiecen con `REACT_APP_` son accesibles desde el frontend
- El archivo `.env` está en `.gitignore` para evitar versionarlo
- Usa `.env.example` para documentar las variables necesarias

## 🌍 Entornos

### Development

```env
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG_MODE=true
REACT_APP_API_URL=http://localhost:3001/api
```

### Production

```env
REACT_APP_ENVIRONMENT=production
REACT_APP_DEBUG_MODE=false
REACT_APP_API_URL=https://api.tu-dominio.com/api
```

## 🔍 Troubleshooting

### Variable no se actualiza

1. Reinicia el servidor de desarrollo: `npm start`
2. Verifica que empiece con `REACT_APP_`
3. Revisa la sintaxis del archivo `.env`

### Variable undefined

1. Verifica que exista en el archivo `.env`
2. Asegúrate de no tener espacios alrededor del `=`
3. Usa `EnvConfig.logConfig()` para debug

### Ejemplo de debug

```javascript
// En tu componente
useEffect(() => {
  EnvConfig.logConfig(); // Muestra todas las variables en consola
}, []);
```

## 📝 Notas

- Las variables se leen en **tiempo de compilación**, no en runtime
- Cambios requieren reiniciar el servidor de desarrollo
- En producción, las variables deben estar configuradas en el servidor/servicio de hosting
- Para Vercel, Netlify, etc., configúralas en el panel de administración

## 🆘 Soporte

Si tienes problemas con las variables de entorno:

1. Verifica la sintaxis del archivo `.env`
2. Consulta la documentación de Create React App
3. Revisa los logs en la consola del navegador (con `DEBUG_MODE=true`)
