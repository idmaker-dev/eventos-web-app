import React from "react";
import { NavLink } from "react-router-dom";
import { Settings, Bell, Pin, User, X, Users, Megaphone, Ticket, Tickets } from "lucide-react";
import ResumenProgreso from "../../../assets/recursos/resumen_progreso.svg";
import ModuloPagos from "../../../assets/recursos/moduloDePagos.svg";
import ModuloAsignacion from "../../../assets/recursos/moduloDeAsignacion.svg";
import ModuloInvitados from "../../../assets/recursos/moduloInvitados.svg";
import Inicio from "../../../assets/recursos/inicio.svg";

export default function MobileSidebar({ 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  mobileMenuRef 
}) {
  return (
    <div className="lg:hidden">
      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Menú lateral móvil */}
      <aside
        ref={mobileMenuRef}
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#f8fbff] to-[#e9f0f6] dark:from-[#1e1e1e] dark:to-[#121212] shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <img
              src="/logoTentativo2.svg"
              alt="Logo P"
              className="object-contain w-full h-10"
            />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navegación */}
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
              <li>
                <NavLink
                  to="/admin"
                  end
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#216b6b] text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:shadow-md"
                    }`
                  }
                >
                  <img src={Inicio} alt="Inicio" className="w-5 h-5" />
                  <span className="font-medium">Inicio</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/admin/modulos"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#216b6b] text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:shadow-md"
                    }`
                  }
                >
                  <img src={ResumenProgreso} alt="Resumen y progreso" className="w-5 h-5" />
                  <span className="font-medium">Resumen y progreso</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/admin/pagos"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#216b6b] text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:shadow-md"
                    }`
                  }
                >
                  <img src={ModuloPagos} alt="Módulo de pagos" className="w-5 h-5" />
                  <span className="font-medium">Módulo de pagos</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/admin/Asignacion"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#216b6b] text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:shadow-md"
                    }`
                  }
                >
                  <img src={ModuloInvitados} alt="Módulo de invitados" className="w-5 h-5" />
                  <span className="font-medium">Módulo de asignación</span>
                </NavLink>
              </li>
              {/* <li>
                <NavLink
                  to="/admin/clientes"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#216b6b] text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:shadow-md"
                    }`
                  }
                >
                  <Users size={20} />
                  <span className="font-medium">Módulo de clientes</span>
                </NavLink>
              </li> */}
              <li>
                <NavLink
                  to="/admin/campanas"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#216b6b] text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:shadow-md"
                    }`
                  }
                >
                  <Megaphone size={20} />
                  <span className="font-medium">Módulo de campañas</span>
                </NavLink>
              </li> 
              <li>
                <NavLink
                  to="/admin/boletos"
                  onClick={() => setMobileMenuOpen(false)}    
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive

                        ? "bg-[#216b6b] text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:shadow-md"
                    }`  
                  }
                >
                  {/* <img src={ModuloInvitados} alt="Módulo de invitados" className="w-5 h-5" /> */}
                  <Ticket className="rotate-90" size={20} />
                  <span className="font-medium">Módulo de boletos</span>
                </NavLink>
              </li>
              {/* <li>
                <NavLink
                  to="/admin/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#216b6b] text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:shadow-md"
                    }`
                  }
                >
                  <img src={ModuloAsignacion} alt="Módulo de comunicación" className="w-5 h-5" />
                  <span className="font-medium">Módulo de comunicación</span>
                </NavLink>
              </li> */}

              {/* Separador */}
              <li className="border-t border-gray-300/50 dark:border-gray-600/50 pt-4 mt-6">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 mb-3">
                  Configuración
                </h3>
              </li>

              <li>
                <NavLink
                  to="/admin/lugares"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#216b6b] text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:shadow-md"
                    }`
                  }
                >
                  <Pin size={18} />
                  <span className="font-medium">Lugares</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/admin/usuarios"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#216b6b] text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:shadow-md"
                    }`
                  }
                >
                  <User size={18} />
                  <span className="font-medium">Usuarios</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/admin/configuracion"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#216b6b] text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:shadow-md"
                    }`
                  }
                >
                  <Settings size={18} />
                  <span className="font-medium">Configuración</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/admin/signalr-test"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#216b6b] text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:shadow-md"
                    }`
                  }
                >
                  <Bell size={18} />
                  <span className="font-medium">Notificaciones</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-300/50 dark:border-gray-600/50 pt-4">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-200 hover:shadow-md"
            >
              <img src={Inicio} alt="Ir al inicio" className="w-5 h-5" />
              <span className="font-medium">Ir al inicio</span>
            </NavLink>
          </div>
        </div>
      </aside>
    </div>
  );
}