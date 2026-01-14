import React from "react";
import { NavLink } from "react-router-dom";
import { Settings, Bell, Pin, User, Users, Megaphone, Ticket, Tickets } from "lucide-react";
import ResumenProgreso from "../../../assets/recursos/resumen_progreso.svg";
import ModuloPagos from "../../../assets/recursos/moduloDePagos.svg";
import ModuloAsignacion from "../../../assets/recursos/moduloDeAsignacion.svg";
import ModuloInvitados from "../../../assets/recursos/moduloInvitados.svg";
import Inicio from "../../../assets/recursos/inicio.svg";
import { Tooltip } from "../../ui/Tooltip";

export default function DesktopSidebar({
  configMenuOpen,
  setConfigMenuOpen,
  configMenuRef,
}) {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[130px] flex-col justify-between items-center py-6 z-40">
      {/* Logo */}
      <div className="flex-shrink-0">
        <img
          src="/logop.png"
          alt="Logo P"
          className="object-contain rounded-full w-14 h-14"
        />
      </div>

      {/* Navegación principal */}
      <nav className="bg-white dark:bg-[#2a2a2a] px-1 py-1 rounded-full shadow-md">
        <ul className="space-y-3">
          <li className="group">
            <Tooltip content="Inicio" position="right">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-[#216b6b] text-white shadow-lg scale-110"
                      : "bg-[#f1f4f8] dark:bg-[#3a3a3a] text-[#b0b0b0] dark:text-[#ccc] hover:bg-[#d9e6ed] hover:text-[#206a73] dark:hover:bg-[#007bff] dark:hover:text-white hover:scale-105"
                  }`
                }
              >
                <img src={Inicio} alt="Inicio" className="w-6 h-6" />
              </NavLink>
            </Tooltip>
          </li>

          <li className="group">
            <Tooltip content="Resumen y progreso" position="right">
              <NavLink
                to="/admin/resumen"
                className={({ isActive }) =>
                  `w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-[#216b6b] text-white shadow-lg scale-110"
                      : "bg-[#f1f4f8] dark:bg-[#3a3a3a] text-[#b0b0b0] dark:text-[#ccc] hover:bg-[#d9e6ed] hover:text-[#206a73] dark:hover:bg-[#007bff] dark:hover:text-white hover:scale-105"
                  }`
                }
              >
                <img
                  src={ResumenProgreso}
                  alt="Resumen y progreso"
                  className="w-6 h-6"
                />
              </NavLink>
            </Tooltip>
          </li>

          <li className="group">
            <Tooltip content="Módulo de pagos" position="right">
              <NavLink
                to="/admin/pagos"
                className={({ isActive }) =>
                  `w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-[#216b6b] text-white shadow-lg scale-110"
                      : "bg-[#f1f4f8] dark:bg-[#3a3a3a] text-[#b0b0b0] dark:text-[#ccc] hover:bg-[#d9e6ed] hover:text-[#206a73] dark:hover:bg-[#007bff] dark:hover:text-white hover:scale-105"
                  }`
                }
              >
                <img
                  src={ModuloPagos}
                  alt="Módulo de pagos"
                  className="w-6 h-6"
                />
              </NavLink>
            </Tooltip>
          </li>

          <li className="group">
            <Tooltip content="Módulo de asignación" position="right">
              <NavLink
                to="/admin/asignacion"
                className={({ isActive }) =>
                  `w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-[#216b6b] text-white shadow-lg scale-110"
                      : "bg-[#f1f4f8] dark:bg-[#3a3a3a] text-[#b0b0b0] dark:text-[#ccc] hover:bg-[#d9e6ed] hover:text-[#206a73] dark:hover:bg-[#007bff] dark:hover:text-white hover:scale-105"
                  }`
                }
              >
                <img
                  src={ModuloInvitados}
                  alt="Módulo de invitados"
                  className="w-6 h-6"
                />
              </NavLink>
            </Tooltip>
          </li>

          {/*<li className="group">
            <Tooltip content="Módulo de comunicación" position="right">
              <NavLink
                to="/admin/chat"
                className={({ isActive }) =>
                  `w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-[#216b6b] text-white shadow-lg scale-110"
                      : "bg-[#f1f4f8] dark:bg-[#3a3a3a] text-[#b0b0b0] dark:text-[#ccc] hover:bg-[#d9e6ed] hover:text-[#206a73] dark:hover:bg-[#007bff] dark:hover:text-white hover:scale-105"
                  }`
                }
              >
                <img
                  src={ModuloAsignacion}
                  alt="Módulo de comunicación"
                  className="w-6 h-6"
                />
              </NavLink>
            </Tooltip>
          </li>
           <li className="group">
            <Tooltip content="Módulo de clientes" position="right">
              <NavLink
                to="/admin/clientes"
                className={({ isActive }) =>
                  `w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-[#216b6b] text-white shadow-lg scale-110"
                      : "bg-[#f1f4f8] dark:bg-[#3a3a3a] text-[#b0b0b0] dark:text-[#ccc] hover:bg-[#d9e6ed] hover:text-[#206a73] dark:hover:bg-[#007bff] dark:hover:text-white hover:scale-105"
                  }`
                }
              >
                <Users size={24} />
              </NavLink>
            </Tooltip>
          </li>*/}
          <li className="group">
            <Tooltip content="Módulo de campañas" position="right">
              <NavLink
                to="/admin/campanas"
                className={({ isActive }) =>
                  `w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-[#216b6b] text-white shadow-lg scale-110"
                      : "bg-[#f1f4f8] dark:bg-[#3a3a3a] text-[#b0b0b0] dark:text-[#ccc] hover:bg-[#d9e6ed] hover:text-[#206a73] dark:hover:bg-[#007bff] dark:hover:text-white hover:scale-105"
                  }`
                }
              >
                <Megaphone size={24} />
              </NavLink>
            </Tooltip>
          </li> 
          <li className="group">
            <Tooltip content="Módulo de boletos" position="right">
              <NavLink
                to="/admin/boletos"
                className={({ isActive }) =>
                  `w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-[#216b6b] text-white shadow-lg scale-110"
                      : "bg-[#f1f4f8] dark:bg-[#3a3a3a] text-[#b0b0b0] dark:text-[#ccc] hover:bg-[#d9e6ed] hover:text-[#206a73] dark:hover:bg-[#007bff] dark:hover:text-white hover:scale-105"
                  }`
                }
              >
                <Ticket className="rotate-90" size={24} />
              </NavLink>
            </Tooltip>
          </li>
        </ul>
      </nav>

      {/* Botones inferiores */}
      <div className="bg-white dark:bg-[#2a2a2a] px-1 py-1 rounded-full shadow-md space-y-3 relative z-[60]">
        {/* Menú de configuración */}
        <div className="relative" ref={configMenuRef}>
          <div className="group relative">
            <button
              onClick={() => setConfigMenuOpen(!configMenuOpen)}
              className="w-[42px] h-[42px] rounded-full bg-[#f1f4f8] dark:bg-[#3a3a3a] flex items-center justify-center text-[#b0b0b0] dark:text-[#ccc] transition-all duration-300 hover:bg-[#d9e6ed] hover:text-[#206a73] dark:hover:bg-[#007bff] dark:hover:text-white hover:scale-105 relative z-[61]"
            >
              <Settings size={22} />
            </button>

            {!configMenuOpen && (
              <span className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[70] pointer-events-none">
                Configuración
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700"></span>
              </span>
            )}
          </div>

          {configMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-[98]"
                onClick={() => setConfigMenuOpen(false)}
              />
              <div className="absolute left-16 top-1/2 -translate-y-1/2 z-[99]">
                <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl min-w-[200px] py-2 animate-in slide-in-from-left-2 duration-200">
                  <NavLink
                    to="/admin/lugares"
                    onClick={() => setConfigMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#216b6b] text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#216b6b] dark:hover:text-white"
                      }`
                    }
                  >
                    <Pin size={16} />
                    <span>Lugares</span>
                  </NavLink>
                  <NavLink
                    to="/admin/usuarios"
                    onClick={() => setConfigMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#216b6b] text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#216b6b] dark:hover:text-white"
                      }`
                    }
                  >
                    <User size={16} />
                    <span>Usuarios</span>
                  </NavLink>
                  <NavLink
                    to="/admin/configuracion"
                    onClick={() => setConfigMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#216b6b] text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#216b6b] dark:hover:text-white"
                      }`
                    }
                  >
                    <Settings size={16} />
                    <span>Configuración</span>
                  </NavLink>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notificaciones */}
        <div className="group">
          <Tooltip content="Notificaciones" position="right">
            <NavLink
              to="/admin/signalr-test"
              className={({ isActive }) =>
                `w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? "bg-[#216b6b] text-white shadow-lg scale-110"
                    : "bg-[#f1f4f8] dark:bg-[#3a3a3a] text-[#b0b0b0] dark:text-[#ccc] hover:bg-[#d9e6ed] hover:text-[#206a73] dark:hover:bg-[#007bff] dark:hover:text-white hover:scale-105"
                }`
              }
            >
              <Bell size={22} />
            </NavLink>
          </Tooltip>
        </div>

        {/* Ir al inicio */}
        <div className="group relative">
          <Tooltip content="Ir al inicio" position="right">
            <NavLink
              to="/"
              className="w-[42px] h-[42px] rounded-full bg-[#f1f4f8] dark:bg-[#3a3a3a] flex items-center justify-center text-[#b0b0b0] dark:text-[#ccc] transition-all duration-300 hover:bg-[#d9e6ed] hover:text-[#206a73] dark:hover:bg-[#007bff] dark:hover:text-white hover:scale-105"
            >
              <img src={Inicio} alt="Logo inferior" className="w-6 h-6" />
            </NavLink>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
