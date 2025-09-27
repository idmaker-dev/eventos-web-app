// src/AdminPage.jsx
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
            <li><NavLink to="/admin" end>Dashboard</NavLink></li>
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
        {/* Header */}
        <header className="header">
          <h2>Hola, Instituto Villa Rica</h2>
          <p>Todo tu evento, en orden</p>
        </header>

        {/* Aquí entran las páginas hijas */}
        <div className="child-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
