import { Button, Input } from "@headlessui/react";
import clsx from "clsx";
import { Minus, Plus, Search, X, RefreshCw, Inbox, Clock, CheckCircle, AlertCircle, Menu } from "lucide-react";
import { Tooltip } from "../ui/Tooltip.jsx";
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import ListaTickets from "./Detalles/ListaClientes.jsx";
import Destalles from "./Detalles/Destalles.jsx";
import ChatModal from "./Chat/ChatModal.jsx";
import { useTickets } from "../../hooks/useTickets";
import { useSignalRTickets } from "../../hooks/useSignalRTickets";
import { useSignalRConnection } from "../../hooks/useSignalR";
import { useTicketDetail } from "../../hooks/useTicketDetail";
import { useClientInfo } from "../../hooks/useClientInfo";
import { useSelectedEvent } from "../../contexts/SelectedEventContext";
import {
  transformarTicketCompletoParaUI,
  formatearFechaHora,
  transformarHistorialParaUI,
} from "../../utils/ticketsHelpers";
import historialAccionesService from "../../services/historialAccionesService";

// Hook para detectar móvil
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768); // Cambié a 768px para móvil
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
}

export default function CompClientes() {
  const [ticketSeleccionadoSimple, setTicketSeleccionadoSimple] =
    useState(null);
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [historialAcciones, setHistorialAcciones] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("todos"); // "todos", "abierto", "pendiente", "cerrado"
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTicketsListOpen, setIsTicketsListOpen] = useState(true);
  const isMobile = useIsMobile();
  const lastMarkedTicketId = useRef(null);

  const handleVolverALista = useCallback(() => {
    setShowDetails(false);
    setTicketSeleccionadoSimple(null);
    setTicketSeleccionado(null);
    setChatOpen(false);
    lastMarkedTicketId.current = null;
  }, []);

  // Hook para conectar a SignalR automáticamente
  const { conectado: signalRConectado } = useSignalRConnection();

  // Obtener el evento seleccionado actualmente
  const { eventoActual } = useSelectedEvent();

  // Memoizar los filtros iniciales para evitar re-renders innecesarios
  const filtrosIniciales = React.useMemo(() => ({
    eventoId: eventoActual?.id
  }), [eventoActual?.id]);

  // Hook para cargar tickets desde el API
  const { tickets, loading, error, cargarTickets, estadisticas, cerrarTicket, actualizarFiltros, marcarComoLeido } = useTickets(filtrosIniciales);

  // Reiniciar la selección de ticket cuando cambia el evento o el filtro de estado
  useEffect(() => {
    handleVolverALista();
  }, [eventoActual?.id, filtroEstado, handleVolverALista]);

  // Resetear el estado a "todos" cuando cambia el evento seleccionado
  useEffect(() => {
    if (eventoActual?.id) {
      setFiltroEstado("todos");
    }
  }, [eventoActual?.id]);



  const handleCerrarTicket = async () => {
    if (ticketSeleccionadoSimple?.id) {
      const response = await cerrarTicket(ticketSeleccionadoSimple.id);
      if (response?.success) {
        handleVolverALista();
        cargarTickets();
      }
    }
  };

  const handleMensajeEnviado = useCallback((nuevoMsg) => {
    setTicketSeleccionado((prev) => {
      if (!prev) return prev;
      
      // Evitar duplicados por ID (mensajes temporales o reales)
      const chat = prev.chat || [];
      const yaExiste = chat.some((m) => m.id === nuevoMsg.id);
      if (yaExiste) return prev;

      return {
        ...prev,
        chat: [...chat, nuevoMsg],
      };
    });
  }, []);

  // Log para verificar conexión de SignalR
  useEffect(() => {
    console.log("📡 [CompClientes] Estado de SignalR:", signalRConectado);
  }, [signalRConectado]);

  // Hooks para cargar detalle del ticket y datos del cliente
  const {
    ticketDetail,
    loading: loadingDetail,
    cargarTicket,
  } = useTicketDetail(ticketSeleccionadoSimple?.ticket);

  const {
    clientInfo,
    loading: loadingClient,
    cargarClientInfo,
  } = useClientInfo(ticketSeleccionadoSimple?.telefono);

  // Hook para SignalR (actualizaciones en tiempo real)
  useSignalRTickets({
    onNuevoTicket: (data) => {
      console.log("📩 Nuevo ticket recibido, recargando lista...", data);
      cargarTickets();
    },
    onTicketActualizado: (data) => {
      console.log("🔄 Ticket actualizado, recargando lista...", data);
      cargarTickets();
      // Si el ticket actualizado es el seleccionado, forzar recarga seleccionando de nuevo
      if (ticketSeleccionadoSimple?.ticket === data?.ticket) {
        setTicketSeleccionadoSimple({ ...ticketSeleccionadoSimple });
      }
    },
    onNuevoMensaje: (data) => {
      console.log("💬 Nuevo mensaje recibido via SignalR:", data);

      // Si el mensaje es del ticket seleccionado, agregarlo al chat
      if (ticketSeleccionadoSimple?.ticket === data?.ticketId) {
        console.log(
          "✅ El mensaje pertenece al ticket seleccionado, agregando al chat..."
        );

        // Crear el objeto de mensaje en el formato esperado por ChatModal
        const nuevoMensaje = {
          id: data.mensajeId,
          remitente: data.from === "usuario" ? "Cliente" : "Soporte",
          nombre: data.from === "usuario" ? "Cliente" : "Soporte",
          texto: data.texto,
          hora: formatearFechaHora(data.timestamp),
          leido: false,
          from: data.from, // Mantener para compatibilidad con ChatModal
        };

        // Agregar el mensaje al ticket seleccionado usando la función común
        handleMensajeEnviado(nuevoMensaje);
        console.log("✅ Mensaje agregado al chat:", nuevoMensaje);
      } else {
        console.log("ℹ️ El mensaje no pertenece al ticket actual");
      }
    },
  });

  // Efecto para buscar historial específico cuando cambia el ticket
  useEffect(() => {
    const fetchHistorialEspecifico = async () => {
      if (!ticketDetail?.ticket?.id) return;

      try {
        setLoadingHistorial(true);
        const registro_id = ticketDetail.ticket.id;
        // Intentar obtener el user_id de varias fuentes posibles
        const user_id =
          ticketDetail.invitado?.id ||
          ticketDetail.ticket.invitado_id ||
          clientInfo?.invitado_id;

        if (!user_id) {
          console.log("⚠️ No se encontró user_id para buscar historial");
          return;
        }

        const acciones = [
          "AGREGAR BOLETO",
          "ELIMINAR BOLETO",
          "DEVOLUCIÓN DE PAGO",
        ];
        const modulos = ["CLIENTES"];

        const data = await historialAccionesService.getHistorialPorParametros(
          registro_id,
          user_id,
          acciones,
          modulos
        );

        const historialData = Array.isArray(data) ? data : data.data || [];
        // console.log("✅ Historial específico cargado:", historialData);
        const historialUI = transformarHistorialParaUI(historialData);
        setHistorialAcciones(historialUI);
      } catch (err) {
        console.error("❌ Error al cargar historial específico:", err);
      } finally {
        setLoadingHistorial(false);
      }
    };

    fetchHistorialEspecifico();
  }, [ticketDetail, clientInfo]);

  // Efecto para transformar datos cuando se cargan el detalle y el cliente
  useEffect(() => {
    if (ticketDetail && clientInfo) {
      console.log("🔄 [CompClientes] Transformando datos y marcando como leído si es necesario...");
      
      const ticketCompleto = transformarTicketCompletoParaUI(
        ticketDetail,
        clientInfo
      );

      // 1. Marcar como leído si es un ticket nuevo cargado con éxito
      if (ticketDetail.ticket?.id && lastMarkedTicketId.current !== ticketDetail.ticket.id) {
        // Solo marcar si no ha sido marcado ya en esta sesión de carga
        marcarComoLeido(ticketDetail.ticket.id);
        lastMarkedTicketId.current = ticketDetail.ticket.id;
      }

      // 2. Transformación UI
      if (historialAcciones.length > 0) {
        ticketCompleto.historialSecuencial = historialAcciones;
      }

      setTicketSeleccionado((prev) => {
        if (prev && prev.id === ticketCompleto.id) {
          const chatIds = new Set(ticketCompleto.chat.map((m) => m.id));
          const mensajesLocales = (prev.chat || []).filter(
            (m) => !chatIds.has(m.id)
          );

          if (mensajesLocales.length > 0) {
            ticketCompleto.chat = [...ticketCompleto.chat, ...mensajesLocales];
          }
        }

        return ticketCompleto;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketDetail, clientInfo, loadingClient, historialAcciones]);

  // Memoizar datos del chat para evitar re-renders innecesarios
  const chatData = useMemo(() => {
    return ticketSeleccionado?.chat || [];
  }, [ticketSeleccionado?.chat]);

  const handleSeleccionarTicket = (ticket) => {
    setTicketSeleccionadoSimple(ticket);
    setChatOpen(true);
    if (isMobile) {
      setShowDetails(true);
    }
  };


  const ticketsFiltrados = useMemo(() => {
    let result = tickets;

    // Filtrar por estado (Local)
    if (filtroEstado !== "todos") {
      result = result.filter((t) => {
        const estado = (t.estado || t.estatus || "").toLowerCase();
        if (filtroEstado === "abierto") {
          return estado === "abierto" || estado === "open" || estado === "urgente";
        }
        if (filtroEstado === "pendiente") {
          return estado === "pendiente" || estado === "en espera" || estado === "waiting";
        }
        if (filtroEstado === "cerrado") {
          return estado === "cerrado" || estado === "closed";
        }
        return true;
      });
    }

    if (!searchTerm.trim()) {
      return result;
    }

    return result.filter((ticket) => {
      const searchLower = searchTerm.toLowerCase();
      const nombre = ticket.nombre?.toLowerCase() || "";
      const numeroTicket = ticket.ticket?.toLowerCase() || "";
      const telefono = ticket.telefono || "";

      return (
        nombre.includes(searchLower) ||
        numeroTicket.includes(searchLower) ||
        telefono.includes(searchLower)
      );
    });
  }, [searchTerm, tickets, filtroEstado]);

  // Vista para móvil
  if (isMobile) {
    return (
      <div className="h-screen bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-md">
        {!showDetails ? (
          // Lista de tickets en móvil
          <div className="h-full flex flex-col">
            <div className="p-4 bg-fondoVs dark:bg-[#1a1a1a] border-b rounded-t-xl">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-casal">
                  Tickets ({estadisticas[filtroEstado === "todos" ? "total" : filtroEstado === "abierto" ? "activos" : filtroEstado === "pendiente" ? "pendientes" : "cerrados"]})
                </h2>
                <Tooltip content="Recargar tickets">
                  <Button
                    onClick={cargarTickets}
                    disabled={loading}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <RefreshCw
                      className={`w-5 h-5 text-casal ${
                        loading ? "animate-spin" : ""
                      }`}
                    />
                  </Button>
                </Tooltip>
              </div>
              
              {/* Selector de estados móvil (estilo Gmail/Tabs) */}
              <div className="flex gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar">
                {[
                  { id: "todos", label: "Recibidos", icon: Inbox },
                  { id: "abierto", label: "Activos", icon: AlertCircle },
                  { id: "pendiente", label: "En espera", icon: Clock },
                  { id: "cerrado", label: "Cerrados", icon: CheckCircle }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFiltroEstado(item.id)}
                    className={clsx(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-xs transition-all",
                      filtroEstado === item.id 
                        ? "bg-casal text-white font-bold shadow-sm" 
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700"
                    )}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                    {(estadisticas[item.id === "todos" ? "total" : item.id === "abierto" ? "activos" : item.id === "pendiente" ? "pendientes" : "cerrados"] || 0) > 0 && (
                      <span className={clsx(
                        "ml-1 text-[10px] px-1.5 py-0.5 rounded-full",
                        filtroEstado === item.id ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                      )}>
                        {estadisticas[item.id === "todos" ? "total" : item.id === "abierto" ? "activos" : item.id === "pendiente" ? "pendientes" : "cerrados"]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={clsx(
                    "mt-0 block w-full rounded-3xl border bg-white/80 dark:bg-gray-900 px-3 py-1.5 text-sm/6 text-white",
                    "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
                  )}
                />
                <div className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
                  {searchTerm ? (
                    <button onClick={() => setSearchTerm("")}>
                      <X className="h-5 w-5" />
                    </button>
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2 bg-fondoVs rounded-b-xl dark:bg-[#1a1a1a]">
              {loading && tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <RefreshCw className="w-8 h-8 mb-2 opacity-50 animate-spin" />
                  <p className="text-sm">Cargando tickets...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-32 text-red-500">
                  <X className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">{error}</p>
                  <Button
                    onClick={cargarTickets}
                    className="mt-2 text-xs underline"
                  >
                    Reintentar
                  </Button>
                </div>
              ) : ticketsFiltrados.length > 0 ? (
                <ListaTickets
                  ticketsData={ticketsFiltrados}
                  onSeleccionar={handleSeleccionarTicket}
                  ticketSeleccionado={ticketSeleccionado}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <Search className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No se encontraron tickets</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Detalles en pantalla completa (móvil)
          <div className="h-full">
            {loadingDetail || loadingClient ? (
              <div className="flex flex-col items-center justify-center h-full bg-fondoVs dark:bg-[#1a1a1a]">
                <RefreshCw className="w-12 h-12 mb-4 opacity-50 animate-spin text-casal" />
                <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                  Cargando detalles del ticket...
                </p>
              </div>
            ) : ticketSeleccionado ? (
              <>
                <Destalles
                  ticket={ticketSeleccionado}
                  onBack={handleVolverALista}
                  isMobileView={true}
                  onRefresh={() => {
                    // console.log("🔄 Ejecutando silent refresh (móvil)...");
                    cargarTickets({ silent: true });
                    cargarTicket({ silent: true });
                    cargarClientInfo({ silent: true });
                  }}
                />
                <ChatModal
                  open={chatOpen}
                  onClose={() => setChatOpen(false)}
                  chatData={chatData}
                  ticket={ticketSeleccionadoSimple?.ticket}
                  telefono={ticketSeleccionadoSimple?.telefono}
                  estatus={ticketSeleccionadoSimple?.estatus}
                  onCerrarTicket={handleCerrarTicket}
                  onMensajeEnviado={handleMensajeEnviado}
                />
              </>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  // Vista para tablet/escritorio (actual)
  return (
    <div>
      <div className="h-[100%] lg:h-[80vh] bg-white dark:bg-[#1a1a1a] rounded-3xl border shadow-md">
        <div className="flex bg-fondoVs dark:bg-[#1a1a1a] overflow-hidden rounded-3xl h-full">
          {/* Barra lateral estilo Gmail (Navegación por estado) */}
          <div className={clsx(
            "h-full border-r border-gray-100 dark:border-gray-800 flex flex-col pt-4 bg-fondoVs dark:bg-[#1a1a1a] rounded-l-3xl transition-all duration-300",
            isSidebarOpen ? "w-16 md:w-56" : "w-16 md:w-16"
          )}>
            <div className={clsx("px-3 mb-2 flex items-center", isSidebarOpen ? "justify-start" : "justify-center")}>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors hidden md:block"
                title="Alternar menú"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            <div className="px-2 space-y-1">
              {[
                { id: "todos", label: "Recibidos", icon: Inbox, color: "text-blue-500", count: estadisticas.total },
                { id: "abierto", label: "Activos", icon: AlertCircle, color: "text-green-500", count: estadisticas.activos },
                { id: "pendiente", label: "En espera", icon: Clock, color: "text-yellow-500", count: estadisticas.pendientes || 0 },
                { id: "cerrado", label: "Cerrados", icon: CheckCircle, color: "text-gray-500", count: estadisticas.cerrados || estadisticas.cerrado || 0 }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFiltroEstado(item.id)}
                  title={!isSidebarOpen ? item.label : undefined}
                  className={clsx(
                    "flex items-center gap-3 py-2 transition-all group relative",
                    isSidebarOpen ? "w-full px-3 rounded-r-full" : "w-10 h-10 mx-auto justify-center rounded-full",
                    filtroEstado === item.id 
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  )}
                >
                  <item.icon className={clsx("w-5 h-5", filtroEstado === item.id ? item.color : "text-gray-400 group-hover:text-gray-600")} />
                  <span className={clsx("hidden text-sm whitespace-nowrap overflow-hidden transition-all", isSidebarOpen ? "md:block" : "md:hidden")}>
                    {item.label}
                  </span>
                  {item.count > 0 && (
                    <span className={clsx(
                      "hidden ml-auto text-xs px-2 py-0.5 rounded-full transition-all",
                      isSidebarOpen ? "md:block" : "md:hidden",
                      filtroEstado === item.id ? "bg-blue-100 dark:bg-blue-800 text-blue-700" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    )}>
                      {item.count}
                    </span>
                  )}
                  {/* Indicador activo estilo Gmail */}
                  {filtroEstado === item.id && isSidebarOpen && (
                    <div className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className={clsx(
            "h-full border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col",
            isTicketsListOpen ? "w-72" : "w-16 md:w-20"
          )}>
            <div className="p-4 bg-fondoVs dark:bg-[#1a1a1a] rounded-tl-3xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 relative">
                  <button
                    onClick={() => setIsTicketsListOpen(!isTicketsListOpen)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors hidden md:block"
                    title="Alternar lista de tickets"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <div className={clsx("text-sm font-semibold text-casal", !isTicketsListOpen && "hidden")}>
                    Tickets
                  </div>
                </div>
                {isTicketsListOpen && (
                  <Tooltip content="Recargar tickets">
                    <Button
                      onClick={cargarTickets}
                      disabled={loading}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                      <RefreshCw
                        className={`w-4 h-4 text-casal ${
                          loading ? "animate-spin" : ""
                        }`}
                      />
                    </Button>
                  </Tooltip>
                )}
              </div>
              <div className={clsx("relative mt-2", !isTicketsListOpen && "hidden")}>
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={clsx(
                    "mt-0 block w-full rounded-3xl border bg-white/80 dark:bg-gray-900 px-3 py-1.5 text-sm/6 text-gray-700 dark:text-white",
                    "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
                  )}
                />
                <div className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
                  {searchTerm ? (
                    <button onClick={() => setSearchTerm("")}>
                      <X className="h-5 w-5" />
                    </button>
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 rounded-bl-3xl px-2 md:px-4 overflow-y-auto space-y-3 bg-fondoVs dark:bg-[#1a1a1a] pb-4 pt-3 custom-scrollbar">
              {loading && tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                  <RefreshCw className="w-8 h-8 mb-2 opacity-50 animate-spin" />
                  <p className={clsx("text-sm", !isTicketsListOpen && "hidden")}>Cargando tickets...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-32 text-red-500">
                  <X className="w-8 h-8 mb-2 opacity-50" />
                  <p className={clsx("text-sm text-center", !isTicketsListOpen && "hidden")}>{error}</p>
                  <Button
                    onClick={cargarTickets}
                    className={clsx("mt-2 text-xs underline", !isTicketsListOpen && "hidden")}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : ticketsFiltrados.length > 0 ? (
                <ListaTickets
                  ticketsData={ticketsFiltrados}
                  onSeleccionar={handleSeleccionarTicket}
                  ticketSeleccionado={ticketSeleccionado}
                  isCollapsed={!isTicketsListOpen}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                  <Search className="w-8 h-8 mb-2 opacity-50" />
                  <p className={clsx("text-sm", !isTicketsListOpen && "hidden")}>No se encontraron tickets</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            {!ticketSeleccionadoSimple ? (
              <div className="flex items-center justify-center h-full bg-fondoVs dark:bg-[#1a1a1a] rounded-r-3xl">
                <div className="text-center p-10">
                  <img
                    src="/logop.png"
                    alt=""
                    className="h-full w-24 mx-auto"
                  />
                  <p className="text-4xl font-bold mb-4 text-casal">Ticket</p>
                  <p className="text-gray-400">
                    Selecciona un ticket para ver los detalles y mensajes.
                  </p>
                </div>
              </div>
            ) : loadingDetail || loadingClient ? (
              <div className="flex items-center justify-center h-full bg-fondoVs dark:bg-[#1a1a1a] rounded-r-3xl">
                <div className="text-center p-10">
                  <RefreshCw className="w-16 h-16 mb-4 mx-auto opacity-50 animate-spin text-casal" />
                  <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">
                    Cargando detalles del ticket...
                  </p>
                </div>
              </div>
            ) : ticketSeleccionado ? (
              <div>
                <Destalles
                  ticket={ticketSeleccionado}
                  onRefresh={() => {
                    // console.log("🔄 Ejecutando silent refresh...");
                    cargarTickets({ silent: true });
                    cargarTicket({ silent: true });
                    cargarClientInfo({ silent: true });
                  }}
                />
                <ChatModal
                  open={chatOpen}
                  onClose={() => setChatOpen(false)}
                  chatData={chatData}
                  ticket={ticketSeleccionadoSimple?.ticket}
                  telefono={ticketSeleccionadoSimple?.telefono}
                  estatus={ticketSeleccionadoSimple?.estatus}
                  onCerrarTicket={handleCerrarTicket}
                  onMensajeEnviado={handleMensajeEnviado}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
