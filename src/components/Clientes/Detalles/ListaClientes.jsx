import { User } from "lucide-react";
import clsx from "clsx";
import React from "react";

export default function ListaClientes({
  onSeleccionar,
  ticketsData = [],
  ticketSeleccionado,
  isCollapsed = false,
}) {
  // Función para determinar los estilos según el estado
  const getTicketStyles = (ticket) => {
    const baseClasses = clsx(
      "flex items-center cursor-pointer transition-all duration-200",
      isCollapsed ? "justify-center p-1" : "justify-between p-2"
    );

    const estado = (ticket.estado || ticket.estatus || "").toLowerCase();
    let styles = {};

    if (estado === "urgente") {
      styles = {
        container: `${baseClasses} border-red-100`,
        hover: "hover:bg-red-50 hover:dark:bg-[#2a1a1a] hover:shadow-md",
        indicator: "bg-red-500",
        textColor: "text-red-600 dark:text-red-400",
        emoji: "🚨",
        bgIcon: "bg-red-100 dark:bg-red-900/30",
        label: "Urgente"
      };
    } else if (estado === "pendiente" || estado === "en espera" || estado === "waiting") {
      styles = {
        container: `${baseClasses} border-yellow-100`,
        hover: "hover:bg-yellow-50 hover:dark:bg-[#2a251a] hover:shadow-md",
        indicator: "bg-yellow-500",
        textColor: "text-yellow-600 dark:text-yellow-400",
        emoji: "⏳",
        bgIcon: "bg-yellow-100 dark:bg-yellow-900/30",
        label: "En espera"
      };
    } else if (estado === "cerrado") {
      styles = {
        container: `${baseClasses} border-gray-100`,
        hover: "hover:bg-gray-50 hover:dark:bg-gray-800/30 hover:shadow-md",
        indicator: "bg-gray-400",
        textColor: "text-gray-500 dark:text-gray-400",
        emoji: "✅",
        bgIcon: "bg-gray-100 dark:bg-gray-800",
        label: "Cerrado"
      };
    } else {
      styles = {
        container: `${baseClasses} border-green-100`,
        hover: "hover:bg-green-50 hover:dark:bg-[#1a2a1a] hover:shadow-md",
        indicator: "bg-green-500",
        textColor: "text-green-600 dark:text-green-400",
        emoji: "🟢",
        bgIcon: "bg-green-100 dark:bg-green-900/30",
        label: "Abierto"
      };
    }

    // Estilos de lectura (Gmail-style)
    const isUnread = ticket.leido === false || ticket.leido === undefined || ticket.leido === null;
    
    return {
      ...styles,
      isUnread,
      container: clsx(
        styles.container,
        isUnread ? "bg-white dark:bg-gray-900/50 shadow-sm" : "bg-gray-50/10 dark:bg-gray-800/5"
      ),
      // Si está leído, atenuamos un poco el color del texto principal
      mainTextColor: isUnread ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400",
      textWeight: isUnread ? "font-bold" : "font-medium"
    };
  };

  return (
    <div className="flex flex-col space-y-2">
      {ticketsData.map((ticket) => {
        const styles = getTicketStyles(ticket);
        const isSelected = ticketSeleccionado?.id === ticket.id;
        
        return (
          <div
            key={ticket.id}
            title={isCollapsed ? `${ticket.nombre_completo || ticket.nombre} - Ticket ${ticket.ticket}` : undefined}
            className={clsx(
              styles.container,
              isCollapsed && "rounded-full w-12 h-12 flex items-center justify-center mx-auto opacity-90 hover:opacity-100",
              !isCollapsed && "rounded-xl border-l-[6px]",
              isSelected 
                ? (isCollapsed ? "scale-110 !opacity-100 shadow-md ring-2 ring-casal ring-offset-2 ring-offset-fondoVs dark:ring-offset-[#1a1a1a]" : "bg-casalds-100/60 dark:bg-casalds-900/40 border-l-casal shadow-sm scale-[1.01] !opacity-100")
                : [styles.hover, !isCollapsed && "border-l-transparent", !isCollapsed && !styles.isUnread && "border-2 border-gray-300 dark:border-gray-600"]
            )}
            onClick={() => onSeleccionar(ticket)}
          >
            {/* Lado izquierdo - Avatar y información */}
            <div className={clsx("flex items-center w-full p-1 relative", isCollapsed ? "justify-center px-0" : "gap-3")}>
              {/* Avatar */}
              <div className="relative">
                <div className={clsx(`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isSelected ? "bg-casal text-white" : styles.bgIcon
                }`)}>
                  <User className={clsx("w-5 h-5", isSelected ? "text-white" : styles.textColor)} />
                </div>
                {/* Indicador de estado */}
                <div
                  className={clsx(
                    "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#1a1a1a]",
                    styles.indicator
                  )}
                />
                
                {/* Badge de no leídos en modo miniatura */}
                {isCollapsed && ticket.msg_no_leidos > 0 && (
                  <div className="absolute -top-1 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold shadow-sm bg-green-500 text-white z-10 border border-white dark:border-[#1a1a1a]">
                    {ticket.msg_no_leidos}
                  </div>
                )}
                {/* Indicador de estado modificado flotante en modo miniatura */}
                {isCollapsed && styles.isUnread && !isSelected && (
                  <div className="absolute top-0 -left-1 w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm border border-white dark:border-gray-900" title="No leído" />
                )}
              </div>

              {!isCollapsed && (
                <div className="w-full min-w-0">
                  {/* Información del ticket */}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={clsx(
                            "text-[10px] md:text-xs break-all leading-tight font-bold",
                            isSelected ? "text-casal dark:text-casalds-300" : "text-gray-500"
                          )}
                        >
                          {styles.emoji} Ticket {ticket.ticket}
                        </span>
                        {styles.isUnread && !isSelected && (
                          <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm flex-shrink-0" title="No leído" />
                        )}
                      </div>
                    </div>
                    
                    {/* Fila del nombre con el Badge de WhatsApp */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={clsx(
                        "line-clamp-1 text-sm transition-all", 
                        styles.textWeight,
                        isSelected ? "text-casal dark:text-white" : styles.mainTextColor
                      )}>
                        {ticket.nombre_completo || ticket.nombre}
                      </span>
                      
                      {/* Badge de mensajes no leídos (WhatsApp style) */}
                      {ticket.msg_no_leidos > 0 && (
                        <div className={clsx(
                          "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold shadow-sm flex-shrink-0 animate-in zoom-in",
                          isSelected ? "bg-casal text-white" : "bg-green-500 text-white"
                        )}>
                          {ticket.msg_no_leidos}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
