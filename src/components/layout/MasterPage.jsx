// src/components/layout/MasterPage.jsx
import { NavLink } from "react-router-dom"
import "../../styles/components/MasterPage.css"

export default function MasterPage({ children }) {
  return (
    <div className="masterpage max-w-7xl mx-auto">
      <header className="header">
        <nav className="navbar px-1 ">
          
          <NavLink to="/Catalogo" className={({ isActive }) => "nav-item proveedores" + (isActive ? " active" : "")
            } > Catálogo de Proveedores </NavLink>
          
          <NavLink to="/Calendario" className={({ isActive }) => "nav-item calendario" + (isActive ? " active" : "") 
          } > Calendario y Tareas </NavLink>
          
          <NavLink to="/Finanzas" className={({ isActive }) => "nav-item finanzas" + (isActive ? " active" : "")
            } > Gestión Financiera </NavLink>
          
          <NavLink to="/Invitados" className={({ isActive }) => "nav-item invitados" + (isActive ? " active" : "")
            } > Gestión de graduados </NavLink>
          
          <NavLink to="/Distribucion" className={({ isActive }) => "nav-item mesas" + (isActive ? " active" : "")
            } > Distribución de mesas </NavLink>
          
          <NavLink to="/Boletos" className={({ isActive }) => "nav-item boletos" + (isActive ? " active" : "")
            } > Boletos QR </NavLink>
          
          <NavLink to="/Minutas" className={({ isActive }) => "nav-item minutas" + (isActive ? " active" : "")
            } > Minutas y Cambios </NavLink>
        </nav>
      </header>
      <main className="content">{children}</main>
    </div>
  )
}
