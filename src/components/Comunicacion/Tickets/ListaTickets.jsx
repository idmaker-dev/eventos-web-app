
import { Clock, User, AlertCircle } from "lucide-react";
import clsx from "clsx";
import React from "react";

export default function ListaTickets({ onSeleccionar, ticketsData = [], ticketSeleccionado }) {
  // Función para determinar los estilos según el estado
  const getTicketStyles = (ticket) => {
    const baseClasses =
      "flex items-center justify-between p-3 cursor-pointer shadow-sm border-b transition-all duration-200 hover:shadow-md";

    if (ticket.estado === "urgente") {
      return {
        container: `${baseClasses} bg-red-50 dark:bg-[#1a1a1a] border-red-200 hover:bg-red-100 hover:dark:bg-[#2a1a1a]`,
        indicator: "w-3 h-3 rounded-full bg-red-500",
        textColor: "text-red-800",
      };
    } else {
      return {
        container: `${baseClasses} bg-white dark:bg-[#1a1a1a] border-gray-200 hover:bg-gray-100 hover:dark:bg-black/30`,
        indicator: "w-3 h-3 rounded-full bg-blue-500",
        textColor: "text-blue-800",
      };
    }
  };

  return (
    <div className="flex flex-col">
      {ticketsData.map((ticket) => {
        const styles = getTicketStyles(ticket);
        const isSelected = ticketSeleccionado?.id === ticket.id;
        return (
          <div
            key={ticket.id}
            className={`${styles.container} ${isSelected ? 'bg-casal/10 border-casal' : ''}`}
            onClick={() => onSeleccionar(ticket)}
          >
            {/* Lado izquierdo - Avatar y información */}
            <div className="flex items-center gap-3 w-full">
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 bg-gray-200 dark:bg-black rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                {/* Indicador de estado */}
                {/* <div
                  className={`absolute -bottom-1 -right-1 ${styles.indicator} border-2 border-white`}
                ></div> */}
              </div>

              <div className="w-full">
                {/* Información del ticket */}
                <div className="flex flex-col ">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className={clsx("text-sm font-bold", ticket.estado === "urgente" ? "text-red-700" : "text-casal")}>
                        No. Ticket {ticket.ticket}
                      </span>
                    </div>
                    <div>
                      {ticket.estado === "urgente" && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <span className={clsx("font-medium line-clamp-1  text-sm", ticket.estado === "urgente" ? "text-red-500" : "text-gray-400")}>
                    {ticket.nombre}
                  </span>
                </div>
                {/* Tiempo transcurrido */}
                <div className="flex items-center justify-end gap-1">
                  <span className={ticket.estado === "urgente" ? "text-red-500  text-xs" : "text-gray-500 text-xs"}>{ticket.tiempo}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
