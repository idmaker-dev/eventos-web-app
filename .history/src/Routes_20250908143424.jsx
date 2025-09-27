import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./Home"
import Catalogo from "./Catalogo"
import Calendario from "./Calendario"
import Finanzas from "./Componente"
import Invitados from "./Invitados"
import Distribucion from "./Distribucion"
import Minutas from "./Componente"

/*Aqui van las rutas de Admin*/
import AdminPage from "./AdminPage"
import Dashboard from "./Dashboard" 

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {* Ruta Home (incluye hero, resumen y MasterPage adentro) */}
        <Route path="/" element={<Home />}>
          {/* Sub-rutas que se cargan en el Outlet de Home */}
          <Route path="Catalogo" element={<Catalogo />} />
          <Route path="Calendario" element={<Calendario />} />
          <Route path="Componente" element={<Finanzas />} />
          <Route path="Invitados" element={<Invitados />} />
          <Route path="Distribucion" element={<Distribucion />} />
          <Route path="Componente" element={<Minutas />} />
          </Route>

          {/* Ruta Admin */}
        <Route path="/admin" element={<AdminPage />}>
          <Route index element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}
