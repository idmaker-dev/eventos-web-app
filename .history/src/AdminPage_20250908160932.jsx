import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  Home,
  ClipboardCheck,
  Coins,
  Users,
  MessageCircle,
  Bell,
  Moon
} from "lucide-react";
import "./AdminPage.css";

export default function AdminPage() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`admin-layout ${darkMode ? "dark-mode" : ""}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <nav>
          <ul>
            <li>
              <NavLink to="/admin" end>
                <Home size={26} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/tareas">
                <ClipboardCheck size={26} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/finanzas">
                <Coins size={26} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/invitados">
                <Users size={26} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/chat">
                <MessageCircle size={26} />
              </NavLink>
            </li>
          </ul>
        </nav>
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

            {/* Notificación y Modo oscuro */}
            <div className="topbar-icons">
              <Bell size={22} />
              <Moon size={22} onClick={toggleDarkMode} />
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
