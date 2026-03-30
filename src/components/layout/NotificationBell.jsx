import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, Trash2, Ticket, Check, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Popover, Transition } from "@headlessui/react";
import notificationService from "../../services/notificationService";
import { useSignalR } from "../../contexts/SignalRContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { calcularTiempoTranscurrido, formatearFechaWhatsApp } from "../../utils/ticketsHelpers";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { registrarCallbackNuevoTicketDB, desregistrarCallbackNuevoTicketDB } = useSignalR();
  const { showInfo } = useNotifications();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const response = await notificationService.getAll();
    if (response.success) {
      setNotifications(response.data);
      console.log(response.data);
      setUnreadCount(response.data.filter((n) => !n.leida && !n.leido).length);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Registrar listener de SignalR
    const handleNuevoTicket = (notificacion) => {
      // Agregar a la lista local
      setNotifications((prev) => [
        {
          id: notificacion.id,
          titulo: notificacion.titulo || "Nuevo Ticket",
          mensaje: notificacion.mensaje,
          leido: false,
          created_at: notificacion.created_at || new Date().toISOString(),
          ticket_id: notificacion.ticket_id,
          evento_id: notificacion.id_evento || notificacion.evento_id,
          tipo: notificacion.tipo,
          nombre_evento: notificacion.nombre_evento,
        },
        ...prev,
      ]);
      setUnreadCount((prev) => prev + 1);

      // Mostrar alerta tipo toast (como antes)
      // if (showInfo) {
      //   showInfo(notificacion.titulo || notificacion.mensaje || "Nuevo ticket recibido");
      // }
    };

    registrarCallbackNuevoTicketDB(handleNuevoTicket);

    return () => {
      desregistrarCallbackNuevoTicketDB();
    };
  }, [fetchNotifications, registrarCallbackNuevoTicketDB, desregistrarCallbackNuevoTicketDB]);

  const handleMarkAsRead = async (id, ticketId, eventId, closePopover) => {
    // Determinar si la notificación era previamente "no leída"
    const isUnread = notifications.find(n => n.id === id && (!n.leido && !n.leida));

    if (isUnread) {
      // Actualización silenciosa "under the hood" al marcar como leído
      notificationService.markAsRead(id);
      
      // Actualizar estado local inmediatamente
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leido: true, leida: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    // Cerrar el popover si se proporciona la función
    if (typeof closePopover === "function") {
      closePopover();
    }

    // Navegar al módulo de tickets con ticketId y eventId
    if (ticketId) {
      const eventParam = eventId ? `&eventId=${eventId}` : "";
      navigate(`/admin/clientes?ticketId=${ticketId}${eventParam}`);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Evitar que se marque como leído al borrar
    const response = await notificationService.delete(id);
    if (response.success) {
      const wasUnread = notifications.find(n => n.id === id && (!n.leido && !n.leida));
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    }
  };

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button className="w-9 h-9 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200 dark:border-gray-600 focus:outline-none relative">
            <Bell className="text-gray-600 dark:text-gray-300" size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white dark:border-gray-800 animate-in zoom-in duration-300">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Popover.Button>

          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 z-50 mt-3 w-80 md:w-96 transform">
              <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black ring-opacity-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    Notificaciones
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
                        {unreadCount} nuevas
                      </span>
                    )}
                  </h3>
                  <button 
                    onClick={fetchNotifications}
                    disabled={loading}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex items-center justify-center"
                    title="Actualizar notificaciones"
                  >
                    <RefreshCw 
                      size={14} 
                      className={`text-casal ${loading ? "animate-spin" : ""}`} 
                    />
                  </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell className="text-gray-400" size={20} />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No tienes notificaciones
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                      {notifications.map((notif) => {
                        const isRead = notif.leida || notif.leido;
                        return (
                          <div
                            key={notif.id}
                            onClick={() => handleMarkAsRead(notif.id, notif.ticket_id, notif.id_evento || notif.evento_id || notif.eventoId, close)}
                            className={`p-4 flex gap-3 transition-colors cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/30 ${
                              !isRead ? "bg-blue-50/40 dark:bg-blue-900/10" : ""
                            }`}
                          >
                            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              !isRead ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                            }`}>
                              <Ticket size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm mb-0.5 ${
                                !isRead ? "text-gray-900 dark:text-white font-bold" : "text-gray-700 dark:text-gray-200 font-semibold"
                              }`}>
                                {notif.titulo || "Nueva Notificación"}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-1">
                                {notif.mensaje}
                              </p>
                                {notif.nombre_evento && (
                                  <p className="text-[10px] font-medium text-casal dark:text-blue-400 mb-1 italic">
                                    Evento: {notif.nombre_evento}
                                  </p>
                                )}
                                <div className="flex items-center justify-between">
                                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                  {formatearFechaWhatsApp(notif.created_at || notif.fecha_creacion || notif.fechaCreacion || notif.timestamp)}
                                </span>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => handleDelete(e, notif.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                    title="Eliminar"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Haz clic en una notificación para ver el ticket
                    </p>
                  </div>
                )}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
