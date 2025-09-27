import React from "react"
import { Outlet, NavLink } from "react-router-dom"
import "./AdminPage.css"

export default function AdminPage() {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <nav>
          <ul>
            <li>
              <NavLink to="/admin" end>
                <img src="/assets/dashboard.png" alt="Dashboard" />
              </NavLink>
            </li>
            <li><NavLink to="/admin/catalogo">Catálogo</NavLink></li>
            <li><NavLink to="/admin/calendario">Calendario</NavLink></li>
            <li><NavLink to="/admin/finanzas">Finanzas</NavLink></li>
            <li><NavLink to="/admin/invitados">Invitados</NavLink></li>
            <li><NavLink to="/admin/distribucion">Distribución</NavLink></li>
            <li><NavLink to="/admin/minutas">Minutas</NavLink></li>
          </ul>
        </nav>
      </aside>

      {/* Contenido */}
      <main className="content">
        {/* 🔹 Encabezado tipo "azul" */}
        <div className="topbar">
          <div className="topbar-text">
            <h2>Hola, Instituto Villa Rica</h2>
            <p>Todo tu evento, en orden</p>
          </div>

          <div className="topbar-select">
            <select>
              <option>Graduación de Lic. Derecho 2020 - 2024</option>
              <option>Graduación de Ing. Sistemas 2021 - 2025</option>
              <option>Otro evento</option>
            </select>
          </div>
        </div>

        {/* Aquí entran las páginas hijas */}
        <div className="child-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
