import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  Home,
  ClipboardCheck,
  Coins,
  Users,
  MessageCircle,
  Settings,
  Bell,
  Moon,
  Sun
} from "lucide-react";
import "./AdminPage.css";

export default function AdminPage() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* 🔹 Logo superior */}
        <div className="sidebar-logo-top">
          <img src="/logop.png" alt="Logo P" className="logo-p" />
        </div>

        {/* 🔹 Menú navegación */}
        <nav className="sidebar-top">
          <ul>
            <li className="tooltip">
              <NavLink to="/admin" end>
              <img src="/casa.png" alt="Icono P" className="custom-icon" />
              </NavLink>
              <span className="tooltip-pill">Inicio</span>
            </li>

            <li className="tooltip">
              <NavLink to="/admin/tareas">
                <ClipboardCheck size={22} />
              </NavLink>
              <span className="tooltip-pill">Resumen y progreso</span>
            </li>

            <li className="tooltip">
              <NavLink to="/admin/finanzas">
                <Coins size={22} />
              </NavLink>
              <span className="tooltip-pill">Módulo de pagos</span>
            </li>

            <li className="tooltip">
              <NavLink to="/admin/invitados">
                <Users size={22} />
              </NavLink>
              <span className="tooltip-pill">Módulo de asignación</span>
            </li>

            <li className="tooltip">
              <NavLink to="/admin/chat">
                <MessageCircle size={22} />
              </NavLink>
              <span className="tooltip-pill">Módulo de comunicación</span>
            </li>
          </ul>
        </nav>

        {/* Íconos inferiores */}
        <div className="sidebar-bottom">
          <NavLink to="/admin/configuracion">
            <Settings size={22} />
          </NavLink>
          <div className="sidebar-logo">
            <img src="/casa.png" alt="Logo inferior" />
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <main className="content">
        {/* Topbar */}
        <div className="topbar">
          {/* Izquierda */}
          <div className="topbar-text">
            <h2>Hola, Instituto Villa Rica</h2>
            <p>Todo tu evento, en orden</p>
          </div>

          {/* Centro */}
          <div className="topbar-select-center">
            <select>
              <option>Graduación de Lic. Derecho 2020 - 2024</option>
              <option>Graduación de Ing. Sistemas 2021 - 2025</option>
              <option>Otro evento</option>
            </select>
          </div>

          {/* Derecha */}
          <div className="topbar-icons">
            <Bell size={22} />
            {darkMode ? (
              <Sun size={22} onClick={() => setDarkMode(false)} />
            ) : (
              <Moon size={22} onClick={() => setDarkMode(true)} />
            )}
          </div>
        </div>

        <div className="child-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
