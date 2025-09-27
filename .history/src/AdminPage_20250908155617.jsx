import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import "./AdminPage.css";

export default function AdminPage() {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <nav className="sidebar-top">
          <ul>
            <li>
              <NavLink to="/admin" end>
                <img src="/icons/home.png" alt="Inicio" />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/tareas">
                <img src="/icons/tareas.png" alt="Tareas" />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/finanzas">
                <img src="/icons/finanzas.png" alt="Finanzas" />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/invitados">
                <img src="/icons/invitados.png" alt="Invitados" />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/chat">
                <img src="/icons/chat.png" alt="Chat" />
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Íconos inferiores */}
        <div className="sidebar-bottom">
          <NavLink to="/admin/configuracion">
            <img src="/icons/config.png" alt="Configuración" />
          </NavLink>
          <div className="sidebar-logo">
            <img src="/logo.png" alt="Logo" />
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <main className="content">
        {/* Topbar */}
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
          </div>
        </div>

        <div className="child-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
