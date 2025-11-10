import { Button, Input } from "@headlessui/react";
import clsx from "clsx";
import { Minus, Plus, Search, X } from "lucide-react";
import { Tooltip } from "../ui/Tooltip.jsx";
import React, { useState, useMemo } from "react";
import ListaTickets from "./Detalles/ListaClientes.jsx";
import { ticketsData } from "./Detalles/DetallesDta.js";
import Destalles from "./Detalles/Destalles.jsx";
import ChatModal from "./Chat/ChatModal.jsx";

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
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();

  const handleSeleccionarTicket = (ticket) => {
    setTicketSeleccionado(ticket);
    setChatOpen(true);
    if (isMobile) {
      setShowDetails(true);
    }
  };

  const handleVolverALista = () => {
    setShowDetails(false);
    setTicketSeleccionado(null);
    setChatOpen(false);
  };

  const ticketsFiltrados = useMemo(() => {
    if (!searchTerm.trim()) {
      return ticketsData;
    }

    return ticketsData.filter((ticket) => {
      const searchLower = searchTerm.toLowerCase();
      const nombre = ticket.nombre?.toLowerCase() || "";
      const numeroTicket = ticket.ticket?.toLowerCase() || "";

      return nombre.includes(searchLower) || numeroTicket.includes(searchLower);
    });
  }, [searchTerm]);

  // Vista para móvil
  if (isMobile) {
    return (
      <div className="h-screen bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-md">
        {!showDetails ? (
          // Lista de tickets en móvil
          <div className="h-full flex flex-col">
            <div className="p-4 bg-fondoVs dark:bg-[#1a1a1a] border-b rounded-t-xl">
              <h2 className="text-xl font-bold text-casal mb-2">Tickets</h2>
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
              {ticketsFiltrados.length > 0 ? (
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
            <Destalles
              ticket={ticketSeleccionado}
              ticketsData={ticketsData}
              onBack={handleVolverALista} // Pasamos la función para regresar
              isMobileView={true}
            />
            <ChatModal
              open={chatOpen}
              onClose={() => setChatOpen(false)}
              ticket={ticketSeleccionado?.ticket}
              chatData={ticketSeleccionado?.chat}
            />
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
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar..."
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
              {ticketsFiltrados.length > 0 ? (
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
            {!ticketSeleccionado ? (
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
            ) : (
              <div>
                <Destalles
                  ticket={ticketSeleccionado}
                  ticketsData={ticketsData}
                />
                <ChatModal
                  open={chatOpen}
                  onClose={() => setChatOpen(false)}
                  ticket={ticketSeleccionado.ticket}
                  chatData={ticketSeleccionado.chat}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
