# Sistema de Protección de Rutas 🔐

Este sistema permite especificar fácilmente qué rutas requieren autenticación y qué roles tienen acceso.

## Componentes Disponibles

### 1. `AuthenticatedRoute`

Protege rutas que requieren que el usuario esté logueado (cualquier rol).

```jsx
<Route
  path="/profile"
  element={
    <AuthenticatedRoute>
      <Profile />
    </AuthenticatedRoute>
  }
/>
```

### 2. `AdminRoute`

Protege rutas que solo pueden acceder usuarios con rol 'admin'.

```jsx
<Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminPanel />
    </AdminRoute>
  }
/>
```

### 3. `PublicRoute`

Para rutas que solo deben ser accesibles por usuarios NO autenticados.

```jsx
<Route
  path="/login"
  element={
    <PublicRoute redirectIfAuthenticated={true}>
      <Login />
    </PublicRoute>
  }
/>
```

### 4. `RoleBasedRoute`

Para rutas que requieren roles específicos personalizados.

```jsx
<Route
  path="/moderator"
  element={
    <RoleBasedRoute allowedRoles={["admin", "moderator"]}>
      <ModeratorPanel />
    </RoleBasedRoute>
  }
/>
```

### 5. `ProtectedRoute` (Componente base)

El más flexible, permite configurar todos los aspectos.

```jsx
<Route
  path="/special"
  element={
    <ProtectedRoute
      requireAuth={true}
      allowedRoles={["admin", "premium"]}
      redirectTo="/login"
      fallback={<CustomLoading />}
    >
      <SpecialContent />
    </ProtectedRoute>
  }
/>
```

## Opciones de Configuración

### Para `ProtectedRoute`:

- `requireAuth`: boolean - Si requiere autenticación (default: true)
- `allowedRoles`: array - Roles permitidos (default: null = todos los roles)
- `redirectTo`: string - A dónde redirigir si no tiene acceso (default: '/login')
- `fallback`: ReactNode - Componente a mostrar mientras carga (default: LoadingSpinner)

### Para `PublicRoute`:

- `redirectIfAuthenticated`: boolean - Si redirigir cuando está autenticado
- `redirectTo`: string - A dónde redirigir si está autenticado (default: '/')

## Flujo de Redirección

1. **Usuario no autenticado** intenta acceder a ruta protegida → Se guarda la URL original → Redirige a `/login`
2. **Usuario se loguea** → Se redirige automáticamente a la URL original guardada
3. **Usuario autenticado** intenta acceder a `/login` → Se redirige según su rol (admin → `/admin`, user → `/`)
4. **Usuario sin permisos** intenta acceder a ruta admin → Se redirige a `/access-denied`

## Roles del Sistema

Actualmente el sistema maneja estos roles:

- `admin`: Acceso completo al sistema
- `user`: Usuario regular (default)

Puedes extender los roles modificando el `authService` y agregando nuevos componentes de ruta.

## Estados de Carga

Mientras se verifica la autenticación, el sistema muestra:

- Un spinner de carga personalizable
- Mensaje "Verificando autenticación..." o personalizado
- Se puede override con el prop `fallback`

## Ejemplos de Uso Común

### Aplicación con área pública y privada:

```jsx
<Routes>
  {/* Rutas públicas */}
  <Route
    path="/login"
    element={
      <PublicRoute redirectIfAuthenticated={true}>
        <Login />
      </PublicRoute>
    }
  />

  <Route
    path="/register"
    element={
      <PublicRoute>
        <Register />
      </PublicRoute>
    }
  />

  {/* Rutas que requieren autenticación */}
  <Route
    path="/"
    element={
      <AuthenticatedRoute>
        <Home />
      </AuthenticatedRoute>
    }
  />

  {/* Rutas de administración */}
  <Route
    path="/admin/*"
    element={
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    }
  />
</Routes>
```

### Nested Routes con protección:

```jsx
<Route
  path="/dashboard"
  element={
    <AuthenticatedRoute>
      <DashboardLayout />
    </AuthenticatedRoute>
  }
>
  <Route index element={<Overview />} />
  <Route path="settings" element={<Settings />} />
  <Route
    path="admin"
    element={
      <AdminRoute>
        <AdminSettings />
      </AdminRoute>
    }
  />
</Route>
```

¡El sistema está listo para usar! 🚀
