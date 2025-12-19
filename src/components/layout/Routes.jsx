import { Routes, Route, Navigate } from "react-router-dom"
import Home from "../../pages/Home"
import Catalogo from "../../pages/Catalogo"
import Calendario from "../../pages/Calendario"
import Finanzas from "../../pages/Finanzas"
import Invitados from "../../pages/Invitados"
import Distribucion from "../../pages/Distribucion"
import Login from "../../pages/Login"
import AccessDenied from "../../pages/AccessDenied"
import Comunicacion from "../../pages/Comunicacion"
import Cuestionario from "../../pages/Cuestionario"
import PortalPagos from "../../pages/PortalPagos"
import Checkout from "../../pages/checkout"
import PagoTarjeta from "../../pages/PagoTarjeta"
import SignalRTest from "../../pages/SignalRTest"
import HomeLugar from "../../pages/HomeLugar" // nueva vista para rol lugar
import LectorQRPage from "../../pages/LectorQRPage" // vista para escaneo de QR
import Boletos from "../../pages/Boletos" // vista para configuración de boletos

/* Aqui van las rutas de Admin */
import AdminPage from "./AdminPage"
import Dashboard from "../../pages/Dashboard"
import Pagos from "../../pages/Pagos"
import Lugares from "../../pages/Lugares"
import Usuarios from "../../pages/Usuarios"
import Asignacion from "../../pages/Asignacion"
import AsignacionUser from "../../pages/AsignacionUser"
import ConfiguracionLayout from "../../pages/ConfiguracionLayout"
import Clientes from "../../pages/Clientes"
import Campanas from "../../pages/Campanas"
// import Comunicacion from "../../pages/Comunicacion"

/* Componentes de protección de rutas */
import { 
  AdminRoute, 
  AuthenticatedRoute, 
  PublicRoute,
  RoleBasedRoute
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
        <AdminRoute>
          <Home />
        </AdminRoute>
      }>
        {/* Sub-rutas que se cargan en el Outlet de Home - Todas requieren autenticación */}
        <Route index element={<Navigate to="Catalogo" replace />} />
        <Route path="Catalogo" element={<Catalogo />} />
        <Route path="Calendario" element={<Calendario />} />
        <Route path="Finanzas" element={<Finanzas />} />
        <Route path="Invitados" element={<Invitados />} />
        <Route path="Distribucion" element={<Distribucion />} />
        <Route path="Boletos" element={<Boletos />} />
      </Route>

      {/* Nueva ruta para usuarios rol 'lugar' */}
      <Route path="/lugar" element={
        <RoleBasedRoute allowedRoles={["lugar"]} redirectTo="/login">
          <HomeLugar />
        </RoleBasedRoute>
      } />

      {/* Ruta Admin - Solo para usuarios con rol admin */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminPage />
        </AdminRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="pagos" element={<Pagos />} />
        <Route path="lugares" element={<Lugares />} />
        <Route path="configuracion-layout" element={<ConfiguracionLayout />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="chat" element={<Comunicacion />} />
        <Route path="signalr-test" element={<SignalRTest />} />
        <Route path="asignacion" element={<Asignacion />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="campanas" element={<Campanas />} />
      </Route>
      {/* Ruta pública - Accesible sin autenticación */}
      <Route path="/Cuestionario/:eventId" element={<Cuestionario />} />
      <Route path="/PortalPagos/:invitadoId" element={<PortalPagos />} />
      <Route path="/Checkout/:invitadoId" element={<Checkout />} />
      <Route path="/pago-tarjeta/:invitadoId" element={<PagoTarjeta />} />
      <Route path="/asignacion-user/:eventoId/:invitadoId" element={<AsignacionUser />} />
      
      {/* Ruta para lector QR - Accesible sin autenticación para personal del evento */}
      <Route path="/lector-qr/:eventoId" element={<LectorQRPage />} />
    </Routes>
  )
}
