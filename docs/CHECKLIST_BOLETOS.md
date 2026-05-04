# Checklist de Integración Frontend - Boletos QR

## ✅ Tareas Completadas

### Backend (EventosApi)
- [x] BlobStorageService implementado
- [x] ConfiguracionBoletosService implementado
- [x] QRBoletosService implementado
- [x] Endpoint: POST /eventos/{id}/boletos/diseno
- [x] Endpoint: PUT /eventos/{id}/boletos/configuracion-qr
- [x] Endpoint: GET /eventos/{id}/boletos/configuracion
- [x] Endpoint: GET /eventos/{id}/boletos/invitado/{invitadoId}
- [x] Endpoint: GET /eventos/{id}/boletos/descargar-masivo
- [x] Container CosmosDB configurado (configuracionBoletos)
- [x] Blob Storage containers configurados
- [x] Dependencias instaladas (sharp, qrcode, archiver)
- [x] Tests ejecutados exitosamente

### Frontend (eventos-web-app)
- [x] boletoService.js creado
- [x] useBoletos.js hook creado
- [x] Boleto.jsx actualizado con integración API
- [x] Boletos.jsx página creada
- [x] Ruta agregada en Routes.jsx
- [x] Link agregado en MasterPage.jsx
- [x] Estados de carga implementados (InlineSpinner)
- [x] Manejo de errores implementado
- [x] Carga automática de configuración existente
- [x] Validación de imágenes (tipo y tamaño)

### Documentación
- [x] SISTEMA_BOLETOS_QR.md (arquitectura técnica)
- [x] GUIA_RAPIDA_BOLETOS.md (guía de uso)
- [x] INTEGRACION_FRONTEND_BOLETOS.md (detalles de integración)
- [x] CHECKLIST_BOLETOS.md (este archivo)
- [x] RESUMEN_BOLETOS.md (resumen ejecutivo)

## 🔄 Tareas Pendientes (Opcionales)

### Funcionalidad Extendida
- [ ] Implementar vista de invitado para generar boleto individual
- [ ] Agregar funcionalidad al botón "Compartir"
- [ ] Crear página de dashboard para invitados con acceso a su boleto
- [ ] Implementar vista previa de boleto antes de generación masiva
- [ ] Agregar opción de regenerar boletos individuales

### UI/UX
- [ ] Agregar estilos CSS específicos para `.nav-item.boletos`
- [ ] Implementar animaciones en transiciones de vistas
- [ ] Agregar tooltips en componente MovibleQR
- [ ] Crear modal de confirmación antes de descarga masiva
- [ ] Agregar preview de QR generado en vista final

### Testing
- [ ] Crear tests unitarios para boletoService
- [ ] Crear tests para useBoletos hook
- [ ] Tests de integración para flujo completo
- [ ] Tests E2E con Cypress o Playwright
- [ ] Performance testing para generación masiva

### Seguridad
- [ ] Validar permisos en frontend según rol
- [ ] Agregar rate limiting en descarga masiva
- [ ] Implementar caché de configuraciones
- [ ] Sanitización adicional de archivos subidos

### Deployment
- [ ] Configurar variables de entorno en Azure Static Web Apps
- [ ] Configurar CORS en Azure Blob Storage
- [ ] Verificar límites de tamaño en Azure Functions
- [ ] Configurar CDN para servir boletos generados
- [ ] Implementar monitoring y logging

## 🧪 Checklist de Testing Local

### Prerequisitos
- [ ] Backend corriendo en `http://localhost:7071`
- [ ] Frontend corriendo en `http://localhost:3000`
- [ ] CosmosDB emulator o conexión a CosmosDB Azure
- [ ] Azure Blob Storage emulator o conexión a Blob Storage Azure
- [ ] Usuario admin creado y autenticado
- [ ] Evento de prueba creado

### Flujo de Prueba - Admin
1. [ ] Login como admin
2. [ ] Seleccionar evento de prueba
3. [ ] Navegar a "Boletos QR" desde menú
4. [ ] Verificar pantalla de carga vacía
5. [ ] Subir imagen de prueba (PNG/JPEG)
6. [ ] Verificar vista previa correcta
7. [ ] Clic en "Siguiente"
8. [ ] Verificar spinner durante upload
9. [ ] Verificar alerta sobre configuración QR
10. [ ] Clic "Siguiente" para configurar
11. [ ] Arrastrar cuadro QR sobre imagen
12. [ ] Redimensionar cuadro QR
13. [ ] Clic "Guardar ajustes"
14. [ ] Verificar spinner durante guardado
15. [ ] Verificar vista final con QR posicionado
16. [ ] Clic "Editar" y verificar que vuelve a configuración
17. [ ] Clic "Guardar" (Descargar masivo)
18. [ ] Verificar descarga de archivo ZIP
19. [ ] Extraer ZIP y verificar boletos generados

### Flujo de Prueba - Recarga de Configuración
1. [ ] Con configuración ya guardada, salir de la página
2. [ ] Volver a "Boletos QR"
3. [ ] Verificar que carga automáticamente:
   - [ ] Imagen de diseño
   - [ ] Vista final (no vista de carga)
   - [ ] QR en posición configurada

### Validaciones de Error
- [ ] Intentar subir archivo PDF (debe rechazar)
- [ ] Intentar subir archivo > 100MB (debe rechazar)
- [ ] Probar sin seleccionar evento (debe mostrar error)
- [ ] Probar descarga masiva sin invitados (debe manejar correctamente)
- [ ] Simular error de red (desconectar backend)

## 📦 Checklist de Deployment

### Backend (Azure Functions)
- [ ] Crear Function App en Azure Portal
- [ ] Configurar variables de entorno en Azure
- [ ] Crear CosmosDB database y container
- [ ] Crear Storage Account y containers de blob
- [ ] Ejecutar `func azure functionapp publish <nombre-app>`
- [ ] Verificar endpoints en producción
- [ ] Configurar CORS para permitir dominio del frontend

### Frontend (Azure Static Web Apps)
- [ ] Crear Static Web App en Azure Portal
- [ ] Configurar variables de entorno (REACT_APP_API_URL)
- [ ] Conectar repositorio GitHub
- [ ] Configurar workflow de deployment
- [ ] Hacer push a rama principal
- [ ] Verificar deployment exitoso
- [ ] Probar flujo completo en producción

### Configuración Post-Deployment
- [ ] Verificar CORS en Blob Storage
- [ ] Configurar CDN si es necesario
- [ ] Habilitar Application Insights
- [ ] Configurar alertas de monitoreo
- [ ] Crear backup de configuraciones
- [ ] Documentar URLs de producción

## 📊 Métricas de Éxito

### Funcionales
- [ ] Tiempo de carga de configuración < 2s
- [ ] Upload de imagen completa en < 10s (imagen 10MB)
- [ ] Guardado de configuración QR < 1s
- [ ] Generación de boleto individual < 3s
- [ ] Descarga masiva de 100 boletos < 30s

### Técnicas
- [ ] Código sin errores de linting
- [ ] Sin warnings en consola del navegador
- [ ] Todos los tests pasando
- [ ] Coverage de código > 80%
- [ ] Lighthouse score > 90

### UX
- [ ] Flujo intuitivo sin necesidad de documentación
- [ ] Mensajes de error claros y accionables
- [ ] Loading states en todas las operaciones async
- [ ] Responsive en móvil, tablet, desktop
- [ ] Accesibilidad (WCAG 2.1 AA)

## 🐛 Issues Conocidos

### Limitaciones Actuales
- Botón "Compartir" no implementado aún
- Vista de invitado no implementada
- Sin validación de dimensiones mínimas de imagen
- Sin compresión automática de imágenes grandes

### Workarounds
- **Compartir**: Por ahora solo descargar individualmente
- **Vista invitado**: Acceso directo via URL cuando se implemente
- **Imágenes grandes**: Reducir manualmente antes de subir

## 📞 Contactos

- **Desarrollador Backend**: [Tu nombre]
- **Desarrollador Frontend**: [Tu nombre]
- **DevOps**: [Nombre del equipo]
- **QA**: [Nombre del equipo]

## 📝 Notas

- Recordar que QR contiene JSON con datos del invitado
- Los boletos se cachean en Blob Storage (no regenerar cada vez)
- Configuración QR usa porcentajes (0-1) para ser responsive
- ZIP masivo solo incluye invitados con selección completa de mesa
