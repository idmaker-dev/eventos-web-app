import { Routes, Route } from "react-router-dom"
import Home from "../../pages/Home"
import Catalogo from "../../pages/Catalogo"
import Calendario from "../../pages/Calendario"
import Finanzas from "../../pages/Finanzas"
import Invitados from "../../pages/Invitados"
import Distribucion from "../../pages/Distribucion"
import Login from "../../pages/Login"
import AccessDenied from "../../pages/AccessDenied"

/* Aqui van las rutas de Admin */
import AdminPage from "./AdminPage"
import Dashboard from "../../pages/Dashboard"
import Pagos from "../../pages/Pagos"
// import Comunicacion from "../../pages/Comunicacion"

/* Componentes de protección de rutas */
import { 
  AdminRoute, 
  AuthenticatedRoute, 
  PublicRoute 
} from "../auth/ProtectedRoute"

export default function AppRoutes() {
  return (
    <Routes>
      {/* Ruta de Login - Solo para usuarios no autenticados */}
      <Route path="/login" element={
        <PublicRoute redirectIfAuthenticated={true}>
          <Login />
        </PublicRoute>
      } />
      
      {/* Página de acceso denegado */}
      <Route path="/access-denied" element={<AccessDenied />} />
      
      {/* Ruta Home - Requiere autenticación */}
      <Route path="/" element={
        <AuthenticatedRoute>
          <Home />
        </AuthenticatedRoute>
      }>
        {/* Sub-rutas que se cargan en el Outlet de Home - Todas requieren autenticación */}
        <Route path="Catalogo" element={<Catalogo />} />
        <Route path="Calendario" element={<Calendario />} />
        <Route path="Finanzas" element={<Finanzas />} />
        <Route path="Invitados" element={<Invitados />} />
        <Route path="Distribucion" element={<Distribucion />} />
      </Route>

      {/* Ruta Admin - Solo para usuarios con rol admin */}
      <Route path="/admin" element={
        <PublicRoute>
          <AdminPage />
        </PublicRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="pagos" element={<Pagos />} />
        
      </Route>
    </Routes>
  )
}
