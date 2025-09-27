import React from "react"
import { Outlet, NavLink } from "react-router-dom"
import {
  Home,
  ClipboardCheck,
  Coins,
  Users,
  MessageCircle
} from "lucide-react"

import "./AdminPage.css"

export default function AdminPage() {
  return (
    <div className="admin-layout">
      {/* Sidebar con íconos */}
      <aside className="sidebar">
        <nav>
          <ul>
            <li>
              <NavLink to="/admin" end>
                <Home size={26} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/catalogo">
                <Book size={26} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/calendario">
                <Calendar size={26} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/finanzas">
                <DollarSign size={26} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/invitados">
                <Users size={26} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/distribucion">
                <LayoutGrid size={26} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/minutas">
                <FileText size={26} />
              </NavLink>
            </li>
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

          <div className="topbar-actions">
            <div className="topbar-select">
              <select>
                <option>Graduación de Lic. Derecho 2020 - 2024</option>
                <option>Graduación de Ing. Sistemas 2021 - 2025</option>
                <option>Otro evento</option>
              </select>
            </div>

            {/* 🔔 Notificación y 🌙 Modo oscuro */}
            <div className="topbar-icons">
              <Bell size={22} />
              <Moon size={22} />
            </div>
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
