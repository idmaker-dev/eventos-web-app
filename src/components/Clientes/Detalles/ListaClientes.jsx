import { Clock, User, AlertCircle } from "lucide-react";
import clsx from "clsx";
import React from "react";

export default function ListaClientes({
  onSeleccionar,
  ticketsData = [],
  ticketSeleccionado,
}) {
  // Función para determinar los estilos según el estado
  const getTicketStyles = (ticket) => {
    const baseClasses =
      "flex items-center justify-between p-2 cursor-pointer rounded-3xl transition-all duration-200 hover:shadow-md";

    if (ticket.estado === "urgente") {
      return {
        container: `${baseClasses}   border-red-200 hover:bg-red-100 hover:dark:bg-[#2a1a1a]`,
        indicator: "w-5 h-5 rounded-full bg-red-500",
        textColor: "text-red-800",
      };
    } else {
      return {
        container: `${baseClasses} border-gray-200 hover:bg-gray-100 hover:dark:bg-black/30`,
        indicator: "w-3 h-3 rounded-full bg-blue-500",
        textColor: "text-blue-800",
      };
    }
  };

  return (
    <div className="flex flex-col space-y-2 rounded-3xl">
      {ticketsData.map((ticket) => {
        const styles = getTicketStyles(ticket);
        const isSelected = ticketSeleccionado?.id === ticket.id;
        return (
          <div
            key={ticket.id}
            className={`${styles.container} ${
              isSelected ? "bg-gray-50 dark:bg-gray-400" : ""
            }`}
            onClick={() => onSeleccionar(ticket)}
          >
            {/* Lado izquierdo - Avatar y información */}
            <div className="flex items-center gap-3 w-full">
              {/* Avatar */}
              <div className="relative">
                <div className={clsx(`w-8 h-8 rounded-full flex items-center justify-center ${
                  isSelected ? "bg-casal" : "bg-gray-200 dark:bg-black"
                }`)}>
                  <User className={isSelected ? "text-white w-4 h-4" : "w-4 h-4 text-gray-500"} />
                </div>
                {/* Indicador de estado */}
                {ticket.estado === "urgente" && (
                  <div
                    className={`absolute -bottom-1 -left-1  ${styles.indicator} border-2 `}
                  >
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="w-full">
                {/* Información del ticket */}
                <div className="flex flex-col ">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span
                        className={clsx(
                          "text-sm font-bold text-casal"
                         
                        )}
                      >
                        No. Ticket {ticket.ticket}
                      </span>
                     
                    </div>
                  </div>
                  <span className={clsx("font-medium line-clamp-1  text-sm", ticket.estado === "urgente" ? "text-red-500" : "text-gray-500 dark:text-gray-600")}>
                    {ticket.nombre}
                  </span>
                </div>
                {/* Tiempo transcurrido */}
                {/* <div className="flex items-center justify-end gap-1">
                  <span className={ticket.estado === "urgente" ? "text-red-500  text-xs" : "text-gray-500 text-xs"}>{ticket.tiempo}</span>
                </div> */}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
