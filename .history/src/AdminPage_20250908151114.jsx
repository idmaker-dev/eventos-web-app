import React from "react"
import { Outlet, NavLink } from "react-router-dom"
import { FaHome, FaBook, FaCalendarAlt, FaMoneyBillWave, FaUsers, FaThLarge, FaClipboardList } from "react-icons/fa"
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
                <img src="/assets/c.png" alt="Dashboard" />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/catalogo">
                <FaBook size={24} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/calendario">
                <FaCalendarAlt size={24} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/finanzas">
                <FaMoneyBillWave size={24} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/invitados">
                <FaUsers size={24} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/distribucion">
                <FaThLarge size={24} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/minutas">
                <FaClipboardList size={24} />
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Contenido */}
      <main className="content">
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
