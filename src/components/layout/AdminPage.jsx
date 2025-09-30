"use client"

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
  Sun,
  ChevronDown,
  CalendarPlus2,
  LogOut
} from "lucide-react";
import "../../styles/pages/AdminPage.css";
import ResumenProgreso from "../../assets/recursos/resumen_progreso.svg";
import ModuloPagos from "../../assets/recursos/moduloDePagos.svg";
import ModuloAsignacion from "../../assets/recursos/moduloDeAsignacion.svg";
import ModuloInvitados from "../../assets/recursos/moduloInvitados.svg";
import Inicio from "../../assets/recursos/inicio.svg";
import Eventos from "../Modales/Eventos";
import { useSelectedEvent } from '../../contexts/SelectedEventContext';

import temaClaro from "../../assets/recursos/temaClaro.svg";
import temaOscuro from "../../assets/recursos/temaOscuro.svg";
import { Button } from "@headlessui/react";
import { useAuth } from "../../hooks/useAuth";



export default function AdminPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); 
  const { logout } = useAuth(); 
  // Cargar preferencia guardada
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setDarkMode(true);
    }
  }, []);

  // Aplicar clase global al <body> y guardar en localStorage
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const [isOpen, setIsOpen] = useState(false)
  const { eventos, selectEvent } = useSelectedEvent();

  const [selectedOption, setSelectedOption] = useState("Selecciona un evento")
  // Obtener etiqueta usando únicamente la propiedad nombre_evento (el nombre ya viene así)
  const getLabel = React.useCallback((evento, index) => {
    if (!evento) return `Evento ${index + 1}`;
    if (evento.nombre_evento && typeof evento.nombre_evento === "string" && evento.nombre_evento.trim().length > 0) {
      return evento.nombre_evento;
    }
    return `Evento ${index + 1}`;
  }, []);

  useEffect(() => {
    console.debug("[AdminPage] eventos.count=", eventos?.length, "first=", eventos?.[0]);
    if (eventos && eventos.length > 0) {
      const first = eventos[0];
      const label = getLabel(first, 0);
      setSelectedOption(label);
      // opcional: cargar el evento actual en el hook
      const id = first.id || first._id || null;
      if (id) {
        // usar selectEvent para centralizar la selección
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
  }

  const handleLogout = async () => {
    try {
      await logout();
      // La función logout ya maneja la redirección a /login
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo P */}
        <div className="sidebar-logo-top">
          <img
            src="/logop.png"
            alt="Logo P"
            className="object-contain rounded-full w-14 h-14"
          />
        </div>

        {/* Menú navegación */}
        <nav className="sidebar-top bg-white dark:bg-[#1a1a1a] px-1 py-1 rounded-full">
          <ul>
            <li className="tooltip mb-3">
              <NavLink to="/admin" end>
                {/* <Home size={22} /> */}
                <img src={Inicio} alt="Inicio" className="w-6 h-6 " />
              </NavLink>
              <span className="tooltip-pill">Inicio</span>
            </li>

            <li className="tooltip mb-3">
              <NavLink to="/admin/modulos">
                {/* <ClipboardCheck size={22} /> */}
                <img
                  src={ResumenProgreso}
                  alt="Resumen y progreso"
                  className="w-6 h-6"
                />
              </NavLink>
              <span className="tooltip-pill">Resumen y progreso</span>
            </li>

            <li className="tooltip mb-3">
              <NavLink to="/admin/pagos">
                {/* <Coins size={22} /> */}
                <img
                  src={ModuloPagos}
                  alt="Módulo de pagos"
                  className="w-6 h-6"
                />
              </NavLink>
              <span className="tooltip-pill">Módulo de pagos</span>
            </li>

            <li className="tooltip mb-3">
              <NavLink to="/admin/invitados">
                {/* <Users size={22} /> */}
                <img
                  src={ModuloInvitados}
                  alt="Módulo de invitados"
                  className="w-6 h-6"
                />
              </NavLink>
              <span className="tooltip-pill">Módulo de asignación</span>
            </li>

            <li className="tooltip">
              <NavLink to="/admin/chat">
                {/* <MessageCircle size={22} /> */}
                <img
                  src={ModuloAsignacion}
                  alt="Módulo de comunicación"
                  className="w-6 h-6"
                />
              </NavLink>
              <span className="tooltip-pill">Módulo de comunicación</span>
            </li>
          </ul>
        </nav>

        {/* Íconos inferiores */}
        <div className="sidebar-bottom bg-white dark:bg-[#1a1a1a] px-1 py-1 rounded-full">
          <NavLink to="/admin/configuracion">
            <Settings size={22} />
          </NavLink>
          <NavLink className="mt-3" to="/">
            <img src={Inicio} alt="Logo inferior" className="w-6 h-6 "/>
          </NavLink>
        </div>
      </aside>

      {/* Contenido */}
      <main className="content">
        <div className="topbar">
          <div className="">
            <p className="text-4xl text-[#216b6b] font-semibold">
              Hola, Instituto Villa Rica
            </p>
            <p className="text-gray-500 dark:text-gray-100  font-semibold">
              Todo tu evento, en orden
            </p>
          </div>

          {/* Menú despegable central */}
          {/* <div className="topbar-select-center">
            <select>
              <option>Graduación de Lic. Derecho 2020 - 2024</option>
              <option>Graduación de Ing. Sistemas 2021 - 2025</option>
              <option>Otro evento</option>
            </select>
          </div> */}
          <div className="relative w-full topbar-select-center2">
            {/* Select Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-96 bg-white dark:bg-[#1a1a1a] hover:bg-gray-250 transition-colors duration-200 rounded-full text-left text-gray-700 dark:text-gray-100 font-medium flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              <span className="text-base px-2 py-1">{selectedOption}</span>
              <div className="bg-[#A1BAC4] px-2 rounded-full transition-transform duration-200">
                <ChevronDown
                  className={`w-8 h-8 text-white ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 overflow-hidden">
                {eventos && eventos.length > 0 ? (
                  eventos.map((option, index) => {
                    const label = getLabel(option, index);
                    const isSelected = selectedOption === label;
                    return (
                      <button
                        key={option.id || option._id || index}
                        onClick={() => handleSelect(option)}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150 ${
                          isSelected
                            ? "bg-gray-100 text-gray-900 font-medium"
                            : "text-gray-700 dark:text-gray-100 "
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })
                ) : (
                  <div className="w-full px-4 py-3 text-left text-sm text-gray-500">No tienes eventos aún</div>
                )}
              </div>
            )}

            {/* Overlay to close dropdown when clicking outside */}
            {isOpen && (
              <div
                className="fixed inset-0 z-0"
                onClick={() => setIsOpen(false)}
              />
            )}
          </div>
          <div>
            <button onClick={() => setModalOpen(true)} className="topbar-usuario tooltip bg-[#216b6b] text-white px-2 py-2 rounded-full flex items-center gap-2">
              <CalendarPlus2 size={22} />
              <span className="tooltip-pill">Agregar eventos</span>
            </button>
          </div>

          {/* Derecha */}
          <div className="topbar-icons ">
            <Button className="acciones-distribucion w-8 h-8 bg-white dark:bg-gray-200 rounded-full flex items-center cursor-pointer justify-center">
              <Bell className="text-gray-600 dark:text-gray-800" />
            </Button>
            {darkMode ? (
              <Button  onClick={() => setDarkMode(false)} className="w-8 h-8 bg-white dark:bg-gray-200 rounded-full flex items-center cursor-pointer justify-center">
                  <img src={temaClaro} alt="Tema Claro" className="w-4 h-4" />
                </Button>
            ) : (
              
              <Button  onClick={() => setDarkMode(true)} className="w-8 h-8 bg-white dark:bg-gray-200 rounded-full flex items-center cursor-pointer justify-center">
                  <img src={temaOscuro} alt="Tema Oscuro" className="w-4 h-4" />
                </Button>
            )}
            <Button onClick={handleLogout} className="acciones-distribucion w-8 h-8 bg-white dark:bg-gray-200 rounded-full flex items-center cursor-pointer justify-center">
              <LogOut className="text-gray-600 dark:text-gray-800" />
            </Button>
          </div>
        </div>

        <div className="child-content p-5 bg-[#e9f0f6]">
          <Outlet context={{ selectedEvent: selectedOption }} />
        </div>
      </main>
      <Eventos open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
