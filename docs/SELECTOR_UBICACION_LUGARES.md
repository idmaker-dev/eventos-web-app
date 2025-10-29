# Selector de Ubicación en Mapa para Lugares

## Descripción

Se ha implementado un selector de ubicación interactivo utilizando Leaflet que permite a los usuarios seleccionar con precisión la ubicación geográfica de un lugar al crear o editar registros.

## Características Implementadas

### 1. Componente de Mapa Interactivo

- **Biblioteca**: Leaflet con React-Leaflet
- **Funcionalidad**: Click en el mapa para seleccionar ubicación
- **Visualización**: Marcador que muestra la ubicación seleccionada
- **Centro por defecto**: Ciudad de México (19.4326, -99.1332)

### 2. Campos de Coordenadas

- **Latitud**: Campo de solo lectura que muestra la coordenada con 6 decimales
- **Longitud**: Campo de solo lectura que muestra la coordenada con 6 decimales
- **Actualización automática**: Se actualizan al hacer clic en el mapa

### 3. Interfaz de Usuario

- **Layout responsivo**: Diseño de dos columnas en pantallas medianas/grandes
  - Columna izquierda: Formulario de datos del lugar
  - Columna derecha: Selector de mapa
- **Botón de visibilidad**: Mostrar/ocultar mapa para optimizar espacio
- **Modal expandido**: Tamaño aumentado a `max-w-3xl` para acomodar el mapa
- **Scroll**: Modal con overflow para contenido extenso

### 4. Estilos Personalizados

- **Soporte de tema oscuro**: Controles de mapa adaptados al modo oscuro
- **Controles de zoom**: Estilos personalizados con bordes redondeados
- **Cursor crosshair**: Indica visualmente que se puede hacer clic en el mapa
- **Atribución**: Diseño limpio y discreto

## Estructura de Datos

### Campos Agregados al Formulario

```javascript
{
  nombre: string,
  direccion: string,
  numero_contacto: string,
  latitud: number | null,    // Nuevo
  longitud: number | null     // Nuevo
}
```

## Dependencias Instaladas

```json
{
  "leaflet": "^1.9.x",
  "react-leaflet": "^4.2.x"
}
```

## Archivos Modificados

1. **src/components/Modales/ModalLugar.jsx**

   - Agregado estado para latitud y longitud
   - Implementado componente MapClickHandler
   - Agregado layout de dos columnas
   - Implementado botón de toggle para mostrar/ocultar mapa
   - Agregados campos de solo lectura para coordenadas

2. **src/index.js**

   - Importación global de estilos CSS de Leaflet
   - Importación de estilos personalizados de Leaflet

3. **src/styles/components/leaflet-custom.css** (Nuevo)
   - Estilos personalizados para controles de mapa
   - Soporte para tema oscuro
   - Mejoras de UX (cursor, controles de zoom)

## Uso

### Para Crear un Lugar con Ubicación

1. Abre el modal de crear lugar
2. Completa los campos obligatorios (nombre, dirección, contacto)
3. Haz clic en "Mostrar mapa para seleccionar ubicación"
4. Haz clic en el punto exacto del mapa donde se encuentra el lugar
5. Verifica que las coordenadas se actualicen en los campos de latitud y longitud
6. Guarda el lugar

### Para Editar la Ubicación de un Lugar

1. Abre el modal de editar lugar
2. Si el lugar ya tiene coordenadas, se mostrará el marcador en esa posición
3. Haz clic en "Mostrar mapa" si está oculto
4. Haz clic en una nueva ubicación para actualizarla
5. Guarda los cambios

## Notas Técnicas

### Provider de Mapas

- Se utiliza OpenStreetMap como proveedor de tiles
- URL: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- Atribución incluida conforme a los términos de OpenStreetMap

### Precisión de Coordenadas

- Se almacenan con 6 decimales de precisión
- Esto proporciona precisión de aproximadamente 0.11 metros

### Compatibilidad

- Compatible con navegadores modernos
- Funciona en dispositivos móviles (touch events)
- Adaptado para modo oscuro

## Backend

### Campos a Agregar en la Base de Datos

Si aún no existen, agregar estos campos a la tabla de lugares:

```sql
ALTER TABLE lugares
ADD COLUMN latitud DECIMAL(10, 6) NULL,
ADD COLUMN longitud DECIMAL(10, 6) NULL;
```

### Actualizaciones en la API

Asegurarse de que los endpoints acepten y devuelvan los campos de latitud y longitud:

- `POST /lugares/crear` - Aceptar latitud y longitud
- `PUT /lugares/{id}` - Aceptar latitud y longitud
- `GET /lugares/activos/list` - Devolver latitud y longitud

## Mejoras Futuras

1. **Geocodificación inversa**: Actualizar dirección al seleccionar en el mapa
2. **Búsqueda de ubicación**: Agregar barra de búsqueda para encontrar direcciones
3. **Múltiples capas**: Permitir cambiar entre diferentes proveedores de mapas
4. **Vista satelital**: Opción para cambiar a vista satelital
5. **Arrastrar marcador**: Permitir arrastrar el marcador en lugar de hacer clic
6. **Historial de ubicaciones**: Mostrar lugares cercanos ya registrados
7. **Validación de coordenadas**: Verificar que las coordenadas estén dentro de rangos válidos
8. **Export KML/GPX**: Exportar ubicaciones de lugares

## Soporte

Para más información sobre Leaflet y React-Leaflet:

- [Leaflet Documentation](https://leafletjs.com/)
- [React-Leaflet Documentation](https://react-leaflet.js.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)
