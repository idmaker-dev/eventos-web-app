import { Button, Input } from "@headlessui/react";
import clsx from "clsx";
import { Minus, Plus, Search, X, RefreshCw } from "lucide-react";
import { Tooltip } from "../ui/Tooltip.jsx";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import ListaTickets from "./Detalles/ListaClientes.jsx";
import Destalles from "./Detalles/Destalles.jsx";
import ChatModal from "./Chat/ChatModal.jsx";
import { useTickets } from "../../hooks/useTickets";
import { useSignalRTickets } from "../../hooks/useSignalRTickets";
import { useSignalRConnection } from "../../hooks/useSignalR";
import { useTicketDetail } from "../../hooks/useTicketDetail";
import { useClientInfo } from "../../hooks/useClientInfo";
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
  const isMobile = useIsMobile();

  // Hook para conectar a SignalR automáticamente
  const { conectado: signalRConectado } = useSignalRConnection();

  // Hook para cargar tickets desde el API
  const { tickets, loading, error, cargarTickets, estadisticas, cerrarTicket } = useTickets();

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
      console.log("🔄 [CompClientes] Transformando datos:", {
        ticketDetail,
        clientInfo,
        tieneTicket: !!ticketDetail.ticket,
        tieneDatosPersonales: !!clientInfo.datos_personales,
        tieneTickets: !!clientInfo.tickets,
      });
      const ticketCompleto = transformarTicketCompletoParaUI(
        ticketDetail,
        clientInfo
      );

      // Sobrescribir historialSecuencial con el específico si existe
      if (historialAcciones.length > 0) {
        ticketCompleto.historialSecuencial = historialAcciones;
      }

      setTicketSeleccionado((prev) => {
        // Si ya teníamos el ticket seleccionado, preservamos los mensajes locales
        // (mensajes que enviamos o recibimos en tiempo real que aún no están en el API)
        if (prev && prev.id === ticketCompleto.id) {
          const chatIds = new Set(ticketCompleto.chat.map((m) => m.id));
          const mensajesLocales = (prev.chat || []).filter(
            (m) => !chatIds.has(m.id)
          );

          if (mensajesLocales.length > 0) {
            // console.log(
            //   `➕ [CompClientes] Preservando ${mensajesLocales.length} mensajes locales`
            // );
            ticketCompleto.chat = [...ticketCompleto.chat, ...mensajesLocales];
            // Opcional: ordenar por timestamp si los mensajes tienen fecha
            // ticketCompleto.chat.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
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

  const handleVolverALista = () => {
    setShowDetails(false);
    setTicketSeleccionadoSimple(null);
    setTicketSeleccionado(null);
    setChatOpen(false);
  };

  const ticketsFiltrados = useMemo(() => {
    if (!searchTerm.trim()) {
      return tickets;
    }

    return tickets.filter((ticket) => {
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
  }, [searchTerm, tickets]);

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
                  Tickets ({estadisticas.total})
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
        <div className="flex">
          <div className="w-72 h-full border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 bg-fondoVs dark:bg-[#1a1a1a] rounded-tl-3xl">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total: {estadisticas.total} | Activos:{" "}
                  {estadisticas.activos || 0}
                </div>
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
              </div>
              <div className="relative">
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
            <div className="h-[calc(100vh-80px)] lg:h-[calc(81.2vh-80px)] rounded-bl-3xl px-4 overflow-y-auto space-y-2 bg-fondoVs dark:bg-[#1a1a1a]">
              {loading && tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                  <RefreshCw className="w-8 h-8 mb-2 opacity-50 animate-spin" />
                  <p className="text-sm">Cargando tickets...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-32 text-red-500">
                  <X className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm text-center">{error}</p>
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
                <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                  <Search className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No se encontraron tickets</p>
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
