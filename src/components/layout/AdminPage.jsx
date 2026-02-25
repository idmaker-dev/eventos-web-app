"use client";

import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  CalendarPlus2,
  LogOut,
  Menu,
  FileText,
  Link,
  FileSignature,
} from "lucide-react";
import Eventos from "../Modales/Eventos";
import { useSelectedEvent } from "../../contexts/SelectedEventContext";
import temaClaro from "../../assets/recursos/temaClaro.svg";
import temaOscuro from "../../assets/recursos/temaOscuro.svg";
import InlineSpinner from "../ui/InlineSpinner";
import { useAuth } from "../../hooks/useAuth";
import CrearCuestionarioPages from "../Comunicacion/CrearCuestionarioPages";

import DesktopSidebar from "./Menu/DesktopSidebar";
import MobileSidebar from "./Menu/MobilSidebar";

import { useNotifications } from "../../contexts/NotificationContext";

export default function AdminPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [configMenuOpen, setConfigMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const configMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const { logout } = useAuth();
  const [showCuestionario, setShowCuestionario] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const desktopSelectorRef = useRef(null);
  const mobileSelectorRef = useRef(null);

  // const { eventoActual } = useSelectedEvent();
  const { showSuccess, showError } = useNotifications();

  const handleCopyLink = () => {
    const eventId = eventoActual?.id || "mg07vfc5ma7io4axa";
    const link = `${window.location.origin}/cuestionario/${eventId}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        showSuccess("Enlace copiado");
      })
      .catch(() => {
        showError("Error al copiar el enlace");
      });
  };

  const handleConfiguracionContrato = () => {
    if (!eventoActual?.id) {
      showError("Selecciona un evento primero");
      return;
    }
    navigate(`/admin/eventos/${eventoActual.id}/configuracion-contrato`);
  };

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (
  //       configMenuRef.current &&
  //       !configMenuRef.current.contains(event.target)
  //     ) {
  //       setConfigMenuOpen(false);
  //     }
  //     if (
  //       mobileMenuRef.current &&
  //       !mobileMenuRef.current.contains(event.target)
  //     ) {
  //       setMobileMenuOpen(false);
  //     }
  //   };

  //   if (configMenuOpen || mobileMenuOpen) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   }

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [configMenuOpen, mobileMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      const desktopMenu = desktopSelectorRef.current;
      const mobileMenu = mobileSelectorRef.current;
      if (
        isOpen &&
        desktopMenu &&
        !desktopMenu.contains(event.target) &&
        mobileMenu &&
        !mobileMenu.contains(event.target)
      ) {
        setIsOpen(false);
      }
      // Si solo uno está abierto, verifica ese
      if (
        isOpen &&
        desktopMenu &&
        !desktopMenu.contains(event.target) &&
        !mobileMenu
      ) {
        setIsOpen(false);
      }
      if (
        isOpen &&
        mobileMenu &&
        !mobileMenu.contains(event.target) &&
        !desktopMenu
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const { eventos, selectEvent, eventoActual } = useSelectedEvent();
  const [selectedOption, setSelectedOption] = useState("Selecciona un evento");

  const getLabel = React.useCallback((evento, index) => {
    if (!evento) return `Evento ${index + 1}`;
    if (
      evento.nombre_evento &&
      typeof evento.nombre_evento === "string" &&
      evento.nombre_evento.trim().length > 0
    ) {
      return evento.nombre_evento;
    }
    return `Evento ${index + 1}`;
  }, []);

  useEffect(() => {
    console.debug(
      "[AdminPage] eventos.count=",
      eventos?.length,
      "first=",
      eventos?.[0]
    );
    if (eventos && eventos.length > 0) {
      const first = eventos[0];
      const label = getLabel(first, 0);
      setSelectedOption(label);
      const id = first.id || first._id || null;
      if (id) {
        selectEvent(id);
      }
    } else {
      setSelectedOption("Selecciona un evento");
    }
  }, [eventos, selectEvent, getLabel]);

  const handleSelect = (evento) => {
    const label = getLabel(evento, 0);
    setSelectedOption(label);
    setIsOpen(false);
    const id = evento.id || evento._id || null;
    if (id) {
      selectEvent(id);
    }
  };

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    setShowCuestionario(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-fondoVs dark:bg-[#1a1a1a]">
      {/* SIDEBAR DESKTOP */}
      <DesktopSidebar
        configMenuOpen={configMenuOpen}
        setConfigMenuOpen={setConfigMenuOpen}
        configMenuRef={configMenuRef}
      />

      {/* MENÚ MÓVIL */}
      <MobileSidebar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        mobileMenuRef={mobileMenuRef}
      />

      {/* Contenido principal */}
      <main className="lg:ml-[130px] min-h-screen">
        <div className="sticky top-0 z-40 backdrop-blur-sm px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Botón menú móvil */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 shadow-sm"
            >
              <Menu size={20} />
            </button>

            {/* Títulos */}
            <div className="hidden lg:block">
              <p className="text-2xl lg:text-4xl text-[#216b6b] font-bold w-96 lg:w-full line-clamp-2 lg:line-clamp-0 mx-auto">
                Hola, {eventoActual ? eventoActual.instituto : "Usuario"}!
              </p>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Todo tu evento, en orden
              </p>
            </div>

            {/* Título móvil */}
            <div className="lg:hidden flex-1 text-center">
              <p className="text-lg text-[#216b6b] font-bold">
                {eventoActual ? eventoActual.instituto : "Panel Admin"}
              </p>
            </div>

            {/* Menú desplegable central - Solo desktop */}
            <div className="flex-1 md:flex justify-center items-center hidden relative gap-3">
              <div className="relative" ref={desktopSelectorRef}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="md:w-80 lg:w-96 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50  dark:hover:bg-gray-800 transition-all duration-200 rounded-full text-left text-gray-700 dark:text-gray-100 font-medium flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#216b6b] focus:ring-offset-2 shadow-md border border-gray-200 dark:border-gray-600"
                >
                  <span className="text-base px-4 py-1 line-clamp-1">
                    {selectedOption}
                  </span>
                  <div className="bg-[#A1BAC4] px-5 py-1 rounded-full transition-transform duration-200">
                    <ChevronDown
                      className={`w-5 h-5 text-white transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-10 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    {eventos && eventos.length > 0 ? (
                      eventos.map((option, index) => {
                        const label = getLabel(option, index);
                        const isSelected = selectedOption === label;
                        return (
                          <button
                            key={option.id || option._id || index}
                            onClick={() => handleSelect(option)}
                            className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ${
                              isSelected
                                ? "bg-[#216b6b] text-white font-medium hover:text-gray-600 hover:bg-casal/80"
                                : "text-gray-700 dark:text-gray-100"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })
                    ) : (
                      <div className="w-full px-4 py-3 text-left text-sm text-gray-500 dark:text-gray-400">
                        No tienes eventos aún
                      </div>
                    )}
                  </div>
                )}

                {isOpen && (
                  <div
                    className="fixed inset-0 z-0"
                    onClick={() => setIsOpen(false)}
                  />
                )}
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="bg-[#216b6b] text-white p-2.5 rounded-full hover:bg-[#1a5a61] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <CalendarPlus2 size={18} />
              </button>
              <button
                onClick={handleConfiguracionContrato}
                className="bg-[#216b6b] text-white p-2.5 rounded-full hover:bg-[#1a5a61] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                title="Configurar Contrato"
              >
                <FileSignature size={18} />
              </button>
              <button
                className="bg-[#216b6b] text-white p-2.5 rounded-full hover:bg-[#1a5a61] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                onClick={() => setShowCuestionario(true)}
              >
                <FileText size={18} />
              </button>
              <button
                className="bg-[#216b6b] text-white p-2.5 rounded-full hover:bg-[#1a5a61] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                onClick={handleCopyLink}
              >
                <Link size={18} />
              </button>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setModalOpen(true)}
                className="bg-[#216b6b] text-white p-2.5  md:hidden rounded-full hover:bg-[#1a5a61] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <CalendarPlus2 size={18} />
              </button>

              <div className="flex items-center gap-2">
                <button className="w-9 h-9 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200 dark:border-gray-600">
                  <Bell
                    className="text-gray-600 dark:text-gray-300"
                    size={16}
                  />
                </button>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-9 h-9 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200 dark:border-gray-600"
                >
                  <img
                    src={darkMode ? temaClaro : temaOscuro}
                    alt={darkMode ? "Tema Claro" : "Tema Oscuro"}
                    className="w-4 h-4"
                  />
                </button>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-9 h-9 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 border border-gray-200 dark:border-gray-600"
                >
                  {isLoggingOut ? (
                    <InlineSpinner size="xs" />
                  ) : (
                    <LogOut
                      className="text-gray-600 dark:text-gray-300"
                      size={16}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Menú desplegable móvil */}
          <div className="md:hidden mt-4 relative" ref={mobileSelectorRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 rounded-full text-left text-gray-700 dark:text-gray-100 font-medium flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#216b6b] focus:ring-offset-2 shadow-md border border-gray-200 dark:border-gray-600"
            >
              <span className="text-base px-4 py-1 line-clamp-1">
                {selectedOption}
              </span>
              <div className="bg-[#A1BAC4] px-5 py-1 rounded-full transition-transform duration-200">
                <ChevronDown
                  className={`w-5 h-5 text-white transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 mx-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-10 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                {eventos && eventos.length > 0 ? (
                  eventos.map((option, index) => {
                    const label = getLabel(option, index);
                    const isSelected = selectedOption === label;
                    return (
                      <button
                        key={option.id || option._id || index}
                        onClick={() => handleSelect(option)}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ${
                          isSelected
                            ? "bg-[#216b6b] text-white font-medium"
                            : "text-gray-700 dark:text-gray-100"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })
                ) : (
                  <div className="w-full px-4 py-3 text-left text-sm text-gray-500 dark:text-gray-400">
                    No tienes eventos aún
                  </div>
                )}
              </div>
            )}

            {isOpen && (
              <div
                className="fixed inset-0 z-0"
                onClick={() => setIsOpen(false)}
              />
            )}
          </div>

          <div className="md:hidden mt-4 flex justify-center gap-4">
            <button
              className="bg-[#216b6b] text-white p-2.5 rounded-full hover:bg-[#1a5a61] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              onClick={() => setShowCuestionario(true)}
            >
              <FileText size={18} />
            </button>
            <button
              className="bg-[#216b6b] text-white p-2.5 rounded-full hover:bg-[#1a5a61] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
              onClick={handleCopyLink}
            >
              <Link size={18} />
            </button>
          </div>
        </div>

        <div className="p-3 lg:p-6 min-h-[calc(100vh-80px)]">
          {showCuestionario ? (
            <CrearCuestionarioPages
              onClose={() => setShowCuestionario(false)}
            />
          ) : (
            <Outlet context={{ selectedEvent: selectedOption }} />
          )}
        </div>
      </main>

      <Eventos open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
