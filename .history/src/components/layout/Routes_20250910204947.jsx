import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "../../pages/Home"
import Catalogo from "../../pages/Catalogo"
import Calendario from "../../pages/Calendario"
import Finanzas from "../../pages/Finanzas"
import Invitados from "../../pages/Invitados"
import Distribucion from "../../pages/Distribucion"

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Ruta Home (incluye hero, resumen y MasterPage adentro) */}
        <Route path="/" element={<Home />}>
          {/* Sub-rutas que se cargan en el Outlet de Home */}
          <Route path="Catalogo" element={<Catalogo />} />
          <Route path="Calendario" element={<Calendario />} />
          <Route path="Finanzas" element={<Finanzas />} />
          <Route path="Invitados" element={<Invitados />} />
          <Route path="Distribucion" element={<Distribucion />} />
        </Route>
      </Routes>
    </Router>
  )
}
