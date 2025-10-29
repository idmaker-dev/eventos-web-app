# Documentación: Cambio de Contraseña Obligatorio

## 📋 Descripción General

Esta funcionalidad permite que cuando un usuario inicia sesión y el backend indica que `debe_cambiar_password: true`, se muestre un modal obligatorio para que el usuario cambie su contraseña antes de poder acceder a la aplicación.

## 🔄 Flujo de Funcionamiento

### 1. Login Inicial

- El usuario ingresa su email y contraseña
- Se realiza la petición al endpoint `/usuarios/login`
- El backend responde con:

```json
{
  "success": true,
  "data": {
    "token": "...",
    "usuario": { ... },
    "debe_cambiar_password": true/false
  }
}
```

### 2. Verificación del Flag

- En `Login.jsx`, después de un login exitoso, se verifica `result.debe_cambiar_password`
- Si es `true`:
  - Se guarda el resultado del login en el estado local
  - Se muestra el modal `CambioPasswordObligatorio`
  - **NO** se navega a ninguna página
- Si es `false`:
  - Se muestra mensaje de éxito
  - Se navega según el rol del usuario

### 3. Modal de Cambio de Contraseña

El modal incluye:

- **Contraseña actual**: Campo con validación
- **Nueva contraseña**: Campo con:
  - Indicador de fortaleza visual (débil/media/fuerte)
  - Requisitos en tiempo real:
    - ✓ Mínimo 8 caracteres
    - ✓ Mayúsculas y minúsculas
    - ✓ Al menos un número
  - Barra de progreso con colores (rojo/ámbar/verde)
- **Confirmar contraseña**: Validación que coincida
- Validaciones:
  - Nueva contraseña diferente a la actual
  - Fortaleza mínima del 40%
  - Coincidencia de contraseñas

### 4. Proceso de Cambio

- Se llama al endpoint `PUT /usuarios/cambiar-password` con:

```json
{
  "passwordActual": "contraseña_actual",
  "passwordNuevo": "nueva_contraseña"
}
```

- Si es exitoso:
  - Se cierra el modal
  - Se muestra mensaje de éxito
  - Se navega a la página correspondiente según el rol
- Si falla:
  - Se muestra mensaje de error
  - El usuario permanece en el modal

## 🗂️ Archivos Modificados/Creados

### Archivos Creados:

1. **`src/components/Modales/CambioPasswordObligatorio.jsx`**
   - Modal con diseño consistente con el proyecto
   - Validaciones en tiempo real
   - Indicador visual de fortaleza de contraseña
   - Estados de carga
   - Manejo de errores por campo

### Archivos Modificados:

2. **`src/pages/Login.jsx`**

   - Importación del modal
   - Estados adicionales: `showPasswordChangeModal`, `passwordChangeLoading`, `loginResult`
   - Modificado `handleSubmit` para verificar `debe_cambiar_password`
   - Nuevo método `handlePasswordChanged` para manejar el cambio de contraseña

3. **`src/hooks/useAuth.js`**

   - Modificado `login()` para retornar `debe_cambiar_password`
   - Nuevo método `changePassword(currentPassword, newPassword)`
   - Exportado en el valor del contexto

4. **`src/services/authService.js`**
   - Modificado `changePassword()` para usar el endpoint correcto: `/usuarios/cambiar-password`
   - Parámetros ajustados: `passwordActual`, `passwordNuevo`

## 🎨 Diseño y Estilo

El modal sigue el diseño existente del proyecto:

- **Colores principales**: `#206a73` (teal del proyecto)
- **Dark mode**: Completamente soportado
- **Iconos**: Lucide React (consistente con el proyecto)
- **Animaciones**: Transiciones suaves
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Accesibilidad**: Labels, aria-attributes, estados disabled

### Indicador de Fortaleza:

- **Rojo** (< 40%): Contraseña débil
- **Ámbar** (40-69%): Contraseña media
- **Verde** (≥ 70%): Contraseña fuerte

## 🔒 Seguridad

- El modal **NO puede cerrarse** (no tiene botón X ni click fuera)
- Es completamente bloqueante hasta que se cambie la contraseña
- Validaciones de fortaleza en el frontend
- El token ya está guardado en localStorage, por lo que la petición de cambio está autenticada
- Se requiere la contraseña actual para cambiarla

## 📱 Experiencia de Usuario

1. Usuario intenta iniciar sesión
2. Si debe cambiar contraseña:
   - Ve mensaje claro: "Cambio de Contraseña Requerido"
   - Descripción: "Por seguridad, debes cambiar tu contraseña antes de continuar"
3. Mientras escribe la nueva contraseña:
   - Ve indicadores visuales de requisitos cumplidos (✓)
   - Barra de progreso de fortaleza en tiempo real
   - Mensajes de error específicos por campo
4. Al enviar:
   - Botón muestra "Cambiando contraseña..." con spinner
   - Todos los campos se deshabilitan
5. Al completar:
   - Mensaje de éxito
   - Redirección automática en 1 segundo

## 🧪 Testing Manual

### Caso 1: Login con cambio obligatorio

```
1. Login con usuario que tenga debe_cambiar_password: true
2. Verificar que aparece el modal
3. Verificar que NO se puede cerrar el modal
4. Completar cambio de contraseña exitosamente
5. Verificar redirección según rol
```

### Caso 2: Login sin cambio obligatorio

```
1. Login con usuario que tenga debe_cambiar_password: false
2. Verificar que NO aparece el modal
3. Verificar redirección inmediata según rol
```

### Caso 3: Validaciones

```
1. Intentar contraseña débil (< 8 caracteres)
2. Intentar contraseña igual a la actual
3. Intentar confirmación que no coincida
4. Verificar mensajes de error apropiados
```

### Caso 4: Error del servidor

```
1. Iniciar cambio de contraseña
2. Simular error del servidor (contraseña actual incorrecta)
3. Verificar mensaje de error
4. Verificar que el modal permanece abierto
```

## 🔧 Configuración del Backend

El backend debe:

1. Retornar `debe_cambiar_password` en la respuesta de login
2. Tener endpoint `PUT /usuarios/cambiar-password` que acepte:
   - `passwordActual`: string
   - `passwordNuevo`: string
3. Validar que el token es válido
4. Validar que la contraseña actual es correcta
5. Actualizar la contraseña y marcar `debe_cambiar_password: false`

## 📝 Notas Adicionales

- El modal usa InlineSpinner (componente existente del proyecto)
- Los iconos son de lucide-react (ya usado en el proyecto)
- El diseño es consistente con ConfirmDialog.jsx
- Soporta completamente dark mode
- No requiere CSS adicional (todo con Tailwind)
