import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/components/Auth.css';

/**
 * Componente para proteger rutas que requieren autenticación
 */
export const ProtectedRoute = ({ 
  children, 
  redirectTo = '/login', 
  requireAuth = true,
  allowedRoles = null,
  fallback = null 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return fallback || (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  // Si se requiere autenticación pero no está autenticado
  if (requireAuth && !isAuthenticated) {
    // Guardar la ubicación actual para redirigir después del login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Si no se requiere autenticación, mostrar el contenido
  if (!requireAuth) {
    return children;
  }

  // Verificar roles si se especificaron
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.rol;
    // Normalizar allowedRoles (por si se pasa string en otra parte en el futuro)
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!userRole || !rolesArray.includes(userRole)) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  // Si llega aquí, tiene acceso
  return children;
};

/**
 * Componente específico para rutas de admin
 */
export const AdminRoute = ({ children, fallback = null }) => {
  return (
    <ProtectedRoute 
      allowedRoles={['admin']} 
      redirectTo="/login"
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * Componente específico para rutas de usuario autenticado
 */
export const AuthenticatedRoute = ({ children, fallback = null }) => {
  return (
    <ProtectedRoute 
      requireAuth={true}
      redirectTo="/login"
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * Componente para rutas públicas (solo usuarios no autenticados)
 * Útil para páginas como login que no deben ser accesibles si ya está logueado
 */
export const PublicRoute = ({ 
  children, 
  redirectTo = '/', 
  redirectIfAuthenticated = false 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  // Si está autenticado y esta ruta es solo para no autenticados
  if (isAuthenticated && redirectIfAuthenticated) {
    // Redirigir según el rol
    let defaultRedirect = '/';
    if (user?.rol === 'admin') defaultRedirect = '/admin';
    else if (user?.rol === 'lugar') defaultRedirect = '/lugar';
    else defaultRedirect = redirectTo;
    return <Navigate to={defaultRedirect} replace />;
  }

  return children;
};

/**
 * Componente para rutas que requieren roles específicos
 */
export const RoleBasedRoute = ({ 
  children, 
  allowedRoles, 
  fallback = null,
  redirectTo = '/access-denied' 
}) => {
  return (
    <ProtectedRoute 
      requireAuth={true}
      allowedRoles={allowedRoles}
      redirectTo={redirectTo}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedRoute;