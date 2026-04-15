import React, { useState } from "react";
import {
  User,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  MessageSquare,
  Send,
  Eye,
  Menu,
  Minus,
  Plus,
  ArrowLeft,
  Check,
  X,
  ChevronDown,
  FileText,
  Download,
} from "lucide-react";
import {
  Button,
  Input,
  Menu as HeadlessMenu,
  MenuButton,
  MenuItems,
  MenuItem,
  Dialog,
  Transition,
} from "@headlessui/react";
import { Fragment } from "react";
import clsx from "clsx";
import { Tooltip } from "../../ui/Tooltip";
import eventService from "../../../services/eventService";
import { useSelectedEvent } from "../../../contexts/SelectedEventContext";
import { useNotifications } from "../../../contexts/NotificationContext";
import ModalComprobantes from "./ModalComprobantes";
import ModalReciboPdf from "./ModalReciboPdf";
import ModalDevolucion from "./ModalDevolucion";
import ModalCancelacionBoletos from "../../Modales/ModalCancelacionBoletos";
import { TicketX } from "lucide-react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
}

export default function Destalles({ ticket, onBack, isMobileView, onRefresh }) {
  const { showSuccess, showError } = useNotifications();
  const [tabActivo, setTabActivo] = useState("cliente");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [deudaForCancel, setDeudaForCancel] = useState(null);
  const isMobile = useIsMobile();

  // console.log(ticket, "*******************************************");

  // Estados para modificación de boletos
  const [modificandoBoletos, setModificandoBoletos] = useState(false);
  const [nuevaCantidad, setNuevaCantidad] = useState(0);
  const [opcionProrrateo, setOpcionProrrateo] = useState("crear_nuevas");
  const [cargando, setCargando] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  const { eventoActual } = useSelectedEvent();

  // Estados para los nuevos modals
  const [showComprobantesModal, setShowComprobantesModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Obtener cantidad actual de boletos del ticket
  const cantidadActual =
    ticket?.cliente?.catidadPedido || ticket?.cliente?.boletos?.length || 2;

  const handleIniciarModificacion = (incremento) => {
    if (!modificandoBoletos) {
      // Primera vez: iniciar modo edición
      const nuevaCant = Number(cantidadActual) + Number(incremento);

      if (nuevaCant <= 0) {
        showError("La cantidad de boletos no puede ser menor a 1");
        return;
      }

      setNuevaCantidad(nuevaCant);
      setModificandoBoletos(true);

      // Si es disminución, auto-seleccionar "eliminar_completas"
      if (incremento < 0) {
        setOpcionProrrateo("eliminar_completas");
      } else {
        setOpcionProrrateo("crear_nuevas");
      }
    } else {
      // Ya está en modo edición: solo actualizar cantidad
      const nuevaCant = Number(nuevaCantidad) + Number(incremento);

      if (nuevaCant <= 0) {
        showError("La cantidad de boletos no puede ser menor a 1");
        return;
      }

      setNuevaCantidad(nuevaCant);

      // Actualizar opción prorrateo según dirección
      if (nuevaCant < Number(cantidadActual)) {
        setOpcionProrrateo("eliminar_completas");
      } else if (
        opcionProrrateo === "eliminar_completas" &&
        nuevaCant > Number(cantidadActual)
      ) {
        setOpcionProrrateo("crear_nuevas");
      }
    }
  };

  const handleCancelar = () => {
    setModificandoBoletos(false);
    setNuevaCantidad(0);
    setOpcionProrrateo("crear_nuevas");
  };

  const handleConfirmar = async () => {
    try {
      setCargando(true);

      // Obtener invitado_id del ticket
      const invitadoId = ticket?.cliente?.invitado_id || ticket?.invitado_id;

      if (!invitadoId) {
        showError("No se encontró el ID del graduado");
        return;
      }

      if (!eventoActual) {
        showError("No hay evento seleccionado");
        return;
      }

      const response = await eventService.updateInvitadoBoletos(
        invitadoId,
        nuevaCantidad,
        opcionProrrateo,
        ticket?.id,
        nuevaCantidad > cantidadActual ? "AGREGAR BOLETO" : "ELIMINAR BOLETO"
      );

      if (response.success) {
        showSuccess(
          `Boletos ${
            nuevaCantidad > cantidadActual ? "aumentados" : "disminuidos"
          } exitosamente`
        );
        handleCancelar();
        if (onRefresh) {
          console.log("🔄 [Destalles] Solicitando refresh silencioso...");
          onRefresh();
        } else {
          console.warn("⚠️ [Destalles] onRefresh prop no proporcionada");
        }
      } else {
        showError(response.error || "Error al actualizar boletos");
      }
    } catch (error) {
      console.error("Error al actualizar boletos:", error);
      showError(error.response?.data?.message || "Error al actualizar boletos");
    } finally {
      setCargando(false);
    }
  };

  const handleOpenCancelModal = async () => {
    try {
      setCargando(true);
      const invitadoId = ticket?.cliente?.invitado_id || ticket?.invitado_id;
      const resultado = await eventService.getEventDebts(eventoActual.id);
      
      if (resultado.success) {
        const d = resultado.data.deudas.find(d => d.invitado_id === invitadoId);
        if (d) {
          setDeudaForCancel(d);
          setIsCancelModalOpen(true);
        } else {
          showError("No se encontró información financiera para este graduado");
        }
      } else {
        showError("Error al cargar datos financieros");
      }
    } catch (error) {
      showError("Error al abrir el módulo de cancelación");
    } finally {
      setCargando(false);
    }
  };

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-full bg-fondoVs rounded-r-3xl">
        <div className="text-center p-10">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-xl font-bold mb-2 text-gray-600">
            Chat de Tickets
          </p>
          <p className="text-gray-400">
            Selecciona un ticket para ver la conversación.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${isMobileView ? "h-screen" : "h-full"} ${
        isMobileView
          ? "bg-white dark:bg-[#1a1a1a]"
          : "bg-fondoVs dark:bg-[#1a1a1a] rounded-r-3xl"
      } flex flex-col`}
    >
      {/* Header del Chat */}
      <div
        className={`p-3 border-b border-gray-200 ${
          isMobileView ? "" : "rounded-tr-3xl"
        } dark:border-gray-700 bg-white dark:bg-[#1a1a1a] flex-shrink-0`}
      >
        <div className="flex items-center gap-3">
          {isMobileView && onBack && (
            <Button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-casal" />
            </Button>
          )}

          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500" />
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                ticket.estado === "cerrado" ? "bg-gray-500" : "bg-blue-500"
              }`}
            ></div>
          </div>

          {/* Información del usuario */}
          <div className="flex-1">
            <p className="text-xl font-semibold text-casal dark:text-white flex items-center gap-2">
              No. Ticket {ticket.ticket}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">{ticket.nombre}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional del ticket */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        {isMobile ? (
          <div className="w-full flex justify-around bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
            <Button
              onClick={() => setTabActivo("historial")}
              className={clsx(
                "flex-1 py-3 font-semibold text-sm",
                tabActivo === "historial"
                  ? "border-b-4 border-casal text-casal"
                  : "text-gray-400 hover:text-casal"
              )}
            >
              Historial
            </Button>
            <Button
              onClick={() => setTabActivo("registro")}
              className={clsx(
                "flex-1 py-3 font-semibold text-sm",
                tabActivo === "registro"
                  ? "border-b-4 border-casal text-casal"
                  : "text-gray-400 hover:text-casal"
              )}
            >
              Registro
            </Button>
            <Button
              onClick={() => setTabActivo("cliente")}
              className={clsx(
                "flex-1 py-3 font-semibold text-sm",
                tabActivo === "cliente"
                  ? "border-b-4 border-casal text-casal"
                  : "text-gray-400 hover:text-casal"
              )}
            >
              Cliente
            </Button>
            <Button
              onClick={() => setTabActivo("pago")}
              className={clsx(
                "flex-1 py-3 font-semibold text-sm",
                tabActivo === "pago"
                  ? "border-b-4 border-casal text-casal"
                  : "text-gray-400 hover:text-casal"
              )}
            >
              Pago
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 text-xl border-b border-Acapulco dark:border-gray-700 bg-gray-50 dark:bg-black">
            <div className="flex items-center gap-2 p-3 text-casal dark:text-Acapulco">
              Historial <span className="font-bold">de Tickets</span>
            </div>
            <div className="flex items-center gap-2 p-3 text-casal dark:text-Acapulco">
              Registro <span className="font-bold">Secuencial</span>
            </div>
            <div className="grid grid-cols-2 border-l text-sm">
              <Button
                onClick={() => setTabActivo("cliente")}
                className={clsx(
                  "px-4 py-2 font-normal transition-colors",
                  tabActivo === "cliente"
                    ? "border-b-4 border-casal text-casal"
                    : "text-gray-400 hover:text-casal hover:bg-casal/10"
                )}
              >
                Información del <b>Cliente</b>
              </Button>
              <Button
                onClick={() => setTabActivo("pago")}
                className={clsx(
                  "px-4 py-2 font-normal transition-colors",
                  tabActivo === "pago"
                    ? "border-b-4 border-casal text-casal"
                    : "text-gray-400 hover:text-casal hover:bg-casal/10"
                )}
              >
                Información <br /> <b>de Pago</b>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className={isMobile ? "p-2" : "grid grid-cols-3"}>
          {(!isMobile || tabActivo === "historial") && (
            <div
              className={
                isMobile
                  ? ""
                  : "p-2 bg-casalds-700/25 dark:bg-Acapulco/5 border-r border-gray-200 dark:border-gray-700 h-[calc(100vh)] lg:h-[calc(63vh)] px-4 overflow-y-auto"
              }
            >
              {/* Historial de tickets */}
              <div>
                <div className="text-xs text-casal dark:text-Acapulco leading-5">
                  Consulta el registro de los tickets. Aquí encontrarás
                  información sobre cambios de los pagos, devolución de boletos,
                  solicitud de nuevos o cancelación de boletos.
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] mt-4 p-2 rounded-lg">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-casal text-white">
                        <th className="py-2 px-2 text-left rounded-l">
                          Motivo de ticket
                        </th>
                        <th className="py-2 px-2 text-left">Fecha</th>
                        <th className="py-2 px-2 text-left">Estado</th>
                        <th className="py-2 px-2 text-center rounded-r font-light">
                          Ver detalles
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticket.ticketHistorial &&
                      ticket.ticketHistorial.length > 0 ? (
                        ticket.ticketHistorial.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b hover:bg-gray-100 dark:hover:bg-gray-700 text-casal dark:text-gray-100 font-semibold"
                          >
                            <td className="py-2 px-2">{item.motivo}</td>
                            <td className="py-2 px-2">{item.fecha}</td>
                            <td className="py-2 px-2">
                              <span
                                className={clsx(
                                  "rounded px-2 py-1 text-xs text-center capitalize",
                                  item.estado === "activo"
                                    ? "text-white bg-blue-600 font-semibold"
                                    : item.estado === "cerrado"
                                    ? "text-white bg-gray-500 font-semibold"
                                    : "text-white bg-blue-600 font-semibold"
                                )}
                              >
                                {item.estado}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <Button className="text-casal dark:text-Acapulco font-semibold text-xs">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center text-gray-500 dark:text-gray-400 py-4"
                          >
                            No hay historial de tickets disponible.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] p-2 rounded-lg mt-2">
                  <div className="text-sm font-semibold py-1 px-2 rounded text-center bg-casal text-white leading-5">
                    Detalles del ticket
                  </div>
                  <div className="text-xs text-casal dark:text-Acapulco leading-5 mt-2">
                    <span className="font-semibold">Fecha de Ticket:</span>{" "}
                    <br />{" "}
                    <span className="text-gray-500 font-semibold">
                      {ticket.detalle.fechaTicket}
                    </span>{" "}
                    <br />
                  </div>
                  <div className="text-xs text-casal dark:text-Acapulco leading-5 mt-2">
                    <span className="font-semibold">Nombre del asistente:</span>{" "}
                    <br />{" "}
                    <span className="text-gray-500 font-semibold">
                      {ticket.detalle.nombreAsistente}
                    </span>{" "}
                    <br />
                  </div>
                  <div className="text-xs text-casal dark:text-Acapulco leading-5 mt-2">
                    <span className="font-semibold">Nombre del evento:</span>{" "}
                    <br />{" "}
                    <span className="text-gray-500 font-semibold">
                      {ticket.detalle.nombreEvento}
                    </span>{" "}
                    <br />
                  </div>
                  <div className="text-xs text-casal dark:text-Acapulco leading-5 mt-2">
                    <span className="font-semibold">Estado del ticket:</span>{" "}
                    <br />
                    <span
                      className={clsx({
                        "text-white bg-blue-600": ticket.estado === "activo",
                        "text-white bg-gray-500": ticket.estado === "cerrado",
                        "rounded px-2 py-1 font-semibold capitalize": true,
                      })}
                    >
                      {ticket.estado}
                    </span>
                  </div>
                  <div className="text-xs text-casal dark:text-Acapulco leading-5 mt-2">
                    <span className="font-semibold">Movimiento:</span> <br />
                    <span className="text-gray-500 font-semibold">
                      {ticket.detalle.movimiento}
                    </span>{" "}
                    <br />
                  </div>
                  <div className="text-xs text-casal dark:text-Acapulco leading-5 mt-2">
                    <span className="font-semibold">Descripción:</span> <br />{" "}
                    <span className="text-gray-500 font-semibold">
                      {ticket.detalle.descripcion}
                    </span>{" "}
                    <br />
                  </div>
                  <div className="text-xs text-casal dark:text-Acapulco leading-5 mt-2">
                    <span className="font-semibold">Boletos anteriores:</span>
                    <div className="text-gray-500 font-semibold">
                      {ticket.detalle.boletos?.anteriores &&
                      ticket.detalle.boletos.anteriores.length > 0 ? (
                        ticket.detalle.boletos.anteriores.map(
                          (boleto, index) => (
                            <span key={index} className="mr-2">
                              {boleto.codigo}
                            </span>
                          )
                        )
                      ) : (
                        <span className="text-gray-400">
                          Sin boletos anteriores
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-casal dark:text-Acapulco leading-5 mt-2">
                    <span className="font-semibold">Boletos adicionales:</span>
                    <div className="text-gray-500 font-semibold">
                      {ticket.detalle.boletos?.adicionales &&
                      ticket.detalle.boletos.adicionales.length > 0 ? (
                        ticket.detalle.boletos.adicionales.map(
                          (boleto, index) => (
                            <span key={index} className="mr-2">
                              {boleto.codigo}
                            </span>
                          )
                        )
                      ) : (
                        <span className="text-gray-400">
                          Sin boletos adicionales
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-casal dark:text-Acapulco leading-5 mt-2">
                    <span className="font-semibold">Cantidad pagada:</span>{" "}
                    <br />{" "}
                    <span className="text-gray-500 font-semibold">
                      {ticket.detalle.cantidadPagada}
                    </span>
                  </div>
                  <div className="text-xs text-casal dark:text-Acapulco leading-5 mt-2">
                    <span className="font-semibold">Forma de pago:</span> <br />{" "}
                    <span className="text-gray-500 font-semibold">
                      {ticket.detalle.formaPago}
                    </span>
                  </div>
                  <div className="text-xs text-casal dark:text-Acapulco leading-5 mt-2">
                    <span className="font-semibold">
                      Responsable del cambio:
                    </span>{" "}
                    <br />{" "}
                    <span className="text-gray-500 font-semibold">
                      {ticket.detalle.responsableCambio}
                    </span>
                  </div>
                  <div className="text-xs text-casal dark:text-Acapulco leading-5 mt-2">
                    <span className="font-semibold">Fecha de cambio:</span>{" "}
                    <br />{" "}
                    <span className="text-gray-500 font-semibold">
                      {ticket.detalle.fechaPago}
                    </span>
                  </div>
                  <div className="text-xs text-casal dark:text-Acapulco leading-5 mt-2">
                    <span className="font-semibold">Última actualización:</span>{" "}
                    <br />{" "}
                    <span className="text-gray-500 font-semibold">
                      {ticket.detalle.fechaDePagos}
                    </span>
                  </div>
                  <div className="text-xs text-casal dark:text-Acapulco leading-5 mt-2">
                    <span className="font-semibold">Lugar del evento:</span>{" "}
                    <br />{" "}
                    <span className="text-gray-500 font-semibold">
                      {ticket.detalle.lugarPago}
                    </span>
                  </div>
                  <div className="text-xs text-casal dark:text-Acapulco leading-5 mt-2">
                    <span className="font-semibold">
                      Fecha y hora del evento:
                    </span>{" "}
                    <br />{" "}
                    <span className="text-gray-500 font-semibold">
                      {ticket.detalle.fechaEvento}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {(!isMobile || tabActivo === "registro") && (
            <div
              className={
                isMobile
                  ? ""
                  : "bg-white dark:bg-[#1a1a1a] p-2 rounded-lg h-[calc(100vh)] lg:h-[calc(63vh)] overflow-y-auto"
              }
            >
              {/* Registro secuencial */}
              <div>
                <div className="font-semibold text-center bg-gray-200 dark:bg-black text-casal py-1 px-2 rounded text-sm leading-5">
                  <p>Registro secuencial del asistente</p>
                </div>
                <div className="text-xs text-casal flex flex-row gap-1 dark:text-Acapulco line-clamp-1 mt-2">
                  <div className="font-semibold">Nombre del asistente:</div>{" "}
                  <br />{" "}
                  <div className="font-normal line-clamp-2">
                    {ticket.nombre}
                  </div>
                </div>
                <div className="text-xs text-casal flex flex-grow gap-1 dark:text-Acapulco leading-5 mt-2">
                  <div className="font-semibold">Número de Ticket:</div> <br />{" "}
                  <div className="font-normal">{ticket.ticket}</div>
                </div>
                <div className="text-xs text-casal flex flex-grow gap-1 dark:text-Acapulco leading-5 mt-2">
                  <div className="font-semibold">Evento:</div> <br />{" "}
                  <div className="font-normal">
                    {ticket.detalle.nombreEvento}
                  </div>
                </div>
                <div className="text-xs text-casal flex flex-grow gap-1 dark:text-Acapulco leading-5 mt-2">
                  <div className="font-semibold">
                    Fecha de registro inicial:
                  </div>{" "}
                  <br />{" "}
                  <div className="font-normal">
                    {ticket.detalle.fechaEvento}
                  </div>
                </div>
                <div className="h-1 my-3 border-b border-gray-200 dark:border-gray-700"></div>
                <div>
                  <div className="text-Acapulco font-bold text-center mb-3">
                    <span>Historial de acciones</span>
                  </div>
                  <div className="relative ml-3">
                    {/* Línea vertical */}
                    <div className="absolute left-2 top-0 w-0.5 h-full bg-gray-300"></div>
                    {ticket.historialSecuencial &&
                    ticket.historialSecuencial.length > 0 ? (
                      ticket.historialSecuencial.map((item, idx) => (
                        <div
                          key={idx}
                          className="relative mb-8 flex items-start"
                        >
                          {/* Punto */}
                          <div className="absolute -left-1.5 top-2">
                            <div className="bg-white dark:bg-[#1a1a1a] rounded-full p-1">
                              <span className="block w-6 h-6 rounded-full border-2 border-Acapulco bg-white dark:bg-[#1a1a1a]"></span>
                            </div>
                          </div>
                          {/* Tarjeta */}
                          <div className="ml-8 bg-blue-50 dark:bg-black rounded-lg shadow-sm px-4 py-2 w-full text-sm">
                            <div className="flex justify-between items-center mb-0">
                              <span className="font-bold text-gray-700 dark:text-gray-300">
                                {item.fecha}
                              </span>
                              <span className="text-Acapulco font-semibold">
                                {item.hora}
                              </span>
                            </div>
                            <div className="font-semibold text-Acapulco text-sm mb-1">
                              {item.evento}
                            </div>
                            <div className="text-gray-700 dark:text-gray-300 mb-2 text-xs">
                              {item.detalle}
                            </div>
                            {/* <div className="text-xs font-semibold text-casal">
                              <span className="font-bold">Responsable:</span>{" "}
                              {item.responsable}
                            </div> */}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 py-4">
                        Sin historial de acciones
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(!isMobile || tabActivo === "cliente" || tabActivo === "pago") && (
            <div
              className={
                isMobile
                  ? ""
                  : "p-2 bg-casalds-700/25 dark:bg-Acapulco/5 h-[calc(100vh)] lg:h-[calc(63vh)] px-3 overflow-y-auto rounded-br-lg"
              }
            >
              {/* Cliente o Pago */}
              {tabActivo === "cliente" && (
                <>
                  <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-4 shadow">
                    <h4 className="font-bold text-casal mb-2 text-center">
                      Datos personales
                    </h4>
                    <div className="text-sm text-gray-700 dark:text-gray-200">
                      <div>
                        <span className="font-semibold text-casal">
                          Nombre:
                        </span>{" "}
                        {ticket.cliente.nombre}
                      </div>
                      <div>
                        <span className="font-semibold text-casal">
                          Estudios:
                        </span>{" "}
                        {ticket.cliente.estudios}
                      </div>
                      <div>
                        <span className="font-semibold text-casal">
                          Cant. de boletos requeridos:
                        </span>{" "}
                        {ticket.cliente.catidadPedido}
                      </div>
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex flex-row justify-between items-center gap-1 w-full">
                          <div className="font-semibold text-casal">
                            Número de boletos:
                          </div>
                          <div className="flex gap-1 items-center py-1 px-2 bg-fondoVs dark:bg-black rounded-full">
                            <Tooltip content="Reducir boletos">
                              <Button
                                onClick={() => handleIniciarModificacion(-1)}
                                disabled={cargando}
                                className="border border-red-500 bg-red-100 text-red-500 rounded-full w-4 h-4 flex items-center justify-center hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Agregar boletos">
                              <Button
                                onClick={() => handleIniciarModificacion(1)}
                                disabled={cargando}
                                className="border border-green-600 bg-green-200 text-green-600 rounded-full w-4 h-4 flex items-center justify-center hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </Tooltip>
                            <div className="text-casal font-bold">
                              {modificandoBoletos
                                ? nuevaCantidad
                                : cantidadActual}{" "}
                              boletos
                            </div>
                          </div>
                          
                          {/* DESCOMENTAR AL TERMINAR CANCELACION */}
                          {/* {!modificandoBoletos && (
                            <Tooltip content="Cancelar boletos (vía administrativa)">
                              <Button
                                onClick={handleOpenCancelModal}
                                disabled={cargando}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-xs font-semibold"
                              >
                                <TicketX size={14} /> Cancelar Boletos
                              </Button>
                            </Tooltip>
                          )} */}
                        </div>

                        {/* Panel de confirmación inline */}
                        {modificandoBoletos && (
                          <div className="p-3 bg-casal/10 dark:bg-casal/20 rounded-lg border border-casal/30">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Nueva cantidad:{" "}
                                <span className="text-casal font-bold">
                                  {nuevaCantidad}
                                </span>
                              </span>
                            </div>

                            {/* Selector de opción prorrateo (solo si es aumento) */}
                            {nuevaCantidad > cantidadActual && (
                              <div className="mb-3">
                                <HeadlessMenu as="div" className="relative">
                                  <MenuButton className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <span className="text-gray-700 dark:text-gray-200">
                                      {opcionProrrateo === "crear_nuevas"
                                        ? "Crear nuevas facturas"
                                        : "Aumentar facturas existentes"}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                  </MenuButton>
                                  <MenuItems className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
                                    <MenuItem>
                                      {({ focus }) => (
                                        <button
                                          onClick={() =>
                                            setOpcionProrrateo("crear_nuevas")
                                          }
                                          className={clsx(
                                            "w-full text-left px-3 py-2 text-sm transition-colors",
                                            focus
                                              ? "bg-casal/10 dark:bg-casal/20"
                                              : "",
                                            opcionProrrateo === "crear_nuevas"
                                              ? "text-casal font-medium"
                                              : "text-gray-700 dark:text-gray-200"
                                          )}
                                        >
                                          Crear nuevas facturas
                                        </button>
                                      )}
                                    </MenuItem>
                                    <MenuItem>
                                      {({ focus }) => (
                                        <button
                                          onClick={() =>
                                            setOpcionProrrateo(
                                              "aumentar_existentes"
                                            )
                                          }
                                          className={clsx(
                                            "w-full text-left px-3 py-2 text-sm transition-colors",
                                            focus
                                              ? "bg-casal/10 dark:bg-casal/20"
                                              : "",
                                            opcionProrrateo ===
                                              "aumentar_existentes"
                                              ? "text-casal font-medium"
                                              : "text-gray-700 dark:text-gray-200"
                                          )}
                                        >
                                          Aumentar facturas existentes
                                        </button>
                                      )}
                                    </MenuItem>
                                  </MenuItems>
                                </HeadlessMenu>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <Button
                                onClick={handleConfirmar}
                                disabled={cargando}
                                className="flex-1 flex items-center justify-center gap-1 text-sm px-3 py-1.5 text-white font-semibold rounded-lg bg-casal hover:bg-casal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {cargando ? (
                                  <>Procesando...</>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4" /> Confirmar
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={handleCancelar}
                                disabled={cargando}
                                className="flex-1 flex items-center justify-center gap-1 text-sm px-3 py-1.5 text-gray-700 dark:text-gray-200 font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <X className="h-4 w-4" /> Cancelar
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mb-4">
                        <h3 className="font-bold text-casal mb-2">
                          <span className="">Restricciones alimenticias</span>
                        </h3>
                        <div className="grid grid-cols-3 gap-1">
                          {ticket.cliente.boletos.map((boleto, idx) => (
                            <div
                              key={boleto.codigo}
                              className={clsx(
                                "p-3 rounded-lg",
                                boleto.status
                                  ? "bg-Acapulco/40 dark:bg-casal/10 border-none shadow"
                                  : "border-2 border-dashed border-gray-400 bg-white dark:bg-[#1a1a1a]"
                              )}
                            >
                              <div className="font-semibold text-center text-gray-700 dark:text-gray-300 text-xs mb-1">
                                Boleto
                              </div>
                              <div className="font-bold text-sm text-casal mb-1">
                                {boleto.codigo}
                              </div>
                              <span className="text-gray-400">
                                Menú: {boleto.menu || "No especificado"}
                              </span>
                              <div className="text-xs text-gray-700 dark:text-gray-300 mb-1">
                                {boleto.status &&
                                boleto.retriciones &&
                                boleto.retriciones.some((r) => r.item) ? (
                                  boleto.retriciones
                                    .filter((r) => r.item)
                                    .map((r, i) => <div key={i}>{r.item}</div>)
                                ) : (
                                  <span className="text-gray-400">
                                    No especificado
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* <div>
                        <span className="font-semibold text-casal">
                          Contacto de emergencia:
                        </span>{" "}
                        {ticket.cliente.contactoErme.tutorER} -{" "}
                        {ticket.cliente.contactoErme.telefonoER}
                      </div> */}

                      {ticket?.cliente?.contacto && (
                        <div>
                          <div>
                            <span className="font-semibold text-casal">
                              Datos del tutor:
                            </span>{" "}
                            {ticket.cliente.contacto.tutor}
                          </div>

                          <div>
                            <span className="font-semibold text-casal">
                              Teléfono del tutor:
                            </span>{" "}
                            {ticket.cliente.contacto.telefono}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-4 shadow mt-4">
                    <h4 className="font-bold text-casal mb-2 text-center">
                      Información del evento
                    </h4>
                    <div className="text-sm text-gray-700 dark:text-gray-200">
                      <div>
                        <span className="font-semibold text-casal">
                          Nombre de la escuela:
                        </span>{" "}
                        <span className="break-words">
                          {ticket.cliente.institución}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-casal">
                          Nombre del evento:
                        </span>{" "}
                        {ticket.detalle.nombreEvento}
                      </div>
                      <div>
                        <span className="font-semibold text-casal">
                          Fecha y hora del evento:
                        </span>{" "}
                        {ticket.detalle.fechaEvento}
                      </div>
                      <div>
                        <span className="font-semibold text-casal">
                          Lugar del evento:
                        </span>{" "}
                        {ticket.detalle.lugarPago}
                      </div>
                      <div>
                        <span className="font-semibold text-casal">
                          Cantidad estimada de asistentes:
                        </span>{" "}
                        {ticket.detalle.boletosTotales}
                      </div>
                      <div>
                        <span className="font-semibold text-casal">
                          Coordinador de evento:
                        </span>{" "}
                        {ticket.detalle.coordinadorEvento}
                      </div>
                      <div>
                        <span className="font-semibold text-casal">
                          Precio de cada boleto:
                        </span>{" "}
                        {ticket.detalle.precioBoleto}
                      </div>
                      <div>
                        <span className="font-semibold text-casal">
                          Fecha de pagos:
                        </span>{" "}
                        {ticket.detalle.fechaDePagos}
                      </div>
                    </div>
                  </div>
                </>
              )}
              {tabActivo === "pago" && (
                <div>
                  {/* Encabezado */}
                  <div className="bg-white text-sm dark:bg-[#1a1a1a] rounded-lg p-4 text-gray-700 dark:text-gray-200 shadow mb-4">
                    <div className="mb-1">
                      <span className="font-semibold text-casal">
                        Asistente:
                      </span>{" "}
                      {ticket.cliente.nombre}
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold text-casal">
                        No. de Ticket:
                      </span>{" "}
                      {ticket.ticket}
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold text-casal">Evento:</span>{" "}
                      {ticket.detalle.nombreEvento}
                    </div>
                    <div className="border border-gray-200 dark:border-gray-500 border-b my-2"></div>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                      <div>
                        <div>
                          <span className="font-semibold text-casal">
                            Estado general:
                          </span>
                        </div>
                        <div>{ticket.pago.estadoGeneral}</div>
                        <div className="mt-2">
                          <span className="font-semibold text-casal">
                            Total de Boletos:
                          </span>
                        </div>
                        <div>{ticket.pago.totalBoletos}</div>
                        <div className="mt-2">
                          <span className="font-semibold text-casal">
                            Total pagado:
                          </span>
                        </div>
                        <div>{ticket.pago.totalPagado}</div>
                      </div>
                      <div>
                        <div>
                          <span className="font-semibold text-casal">
                            Forma de pago:
                          </span>
                        </div>
                        <div>{ticket.pago.formaPago}</div>
                        <div className="mt-2">
                          <span className="font-semibold text-casal">
                            Fecha de pago:
                          </span>
                        </div>
                        <div>{ticket.pago.fechaDePago}</div>
                        <div className="mt-2">
                          <span className="font-semibold text-casal">
                            Fecha de vencimiento:
                          </span>
                        </div>
                        <div>{ticket.pago.fechaVencimiento}</div>
                      </div>
                    </div>
                  </div>

                  {/* Detalle de transacciones */}
                  <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-4 shadow mb-4">
                    <h4 className="font-bold text-casal mb-2 text-center">
                      Detalle de transacciones
                    </h4>
                    <table className="w-full text-sm mb-2 rounded-lg">
                      <thead>
                        <tr className="bg-casal text-white">
                          <th className="py-2 px-2 text-left rounded-l">
                            Fecha
                          </th>
                          <th className="py-2 px-2 text-left">Monto</th>
                          <th className="py-2 px-2 text-left">Método</th>
                          <th className="py-2 px-2 text-left">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ticket.pago.transacciones.map((tx, idx) => (
                          <tr
                            key={idx}
                            className="border-b text-casal hover:bg-slate-50 dark:hover:bg-casal/15"
                          >
                            <td className="py-2 px-2">{tx.fecha}</td>
                            <td className="py-2 px-2">{tx.monto}</td>
                            <td className="py-2 px-2">{tx.método}</td>
                            <td className="py-2 px-2">
                              <span
                                className={clsx(
                                  "px-2 py-1 rounded font-semibold text-xs",
                                  tx.estado === "Pagado"
                                    ? "bg-green-100 text-green-700"
                                    : tx.estado === "Proceso"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-200 text-gray-700"
                                )}
                              >
                                {tx.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Información adicional */}
                  <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-4 shadow mb-4">
                    <h4 className="font-bold text-casal mb-2 text-center">
                      Información adicional
                    </h4>
                    <div className="mb-2 text-sm">
                      <div>
                        <span className="font-semibold text-casal">
                          Devoluciones:
                        </span>{" "}
                        <br />
                        <span className="text-gray-600 dark:text-gray-200">
                          {ticket.pago.adicional.devoluciones.length > 0 ? (
                            <ul className="list-disc pl-5">
                              {ticket.pago.adicional.devoluciones.map(
                                (devolucion, idx) => (
                                  <li key={idx} className="text-sm">
                                    {devolucion.amount} {devolucion.currency} -{" "}
                                    {devolucion.reason + " "}{" "}
                                    {"  - " + devolucion.fecha}
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            "No hay devoluciones"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => setShowRefundModal(true)}
                          className="border bg-green-100 hover:bg-casal hover:text-white text-green-700 px-4 py-1 rounded-xl text-xs"
                        >
                          Aplicar devolución
                        </button>
                      </div>
                    </div>
                    <div className="mb-2 flex gap-2 flex-wrap">
                      {ticket.pago.adicional.opcionesDevolucion.map(
                        (op, idx) => (
                          <span
                            key={idx}
                            className={clsx(
                              "px-2 py-1 rounded text-xs font-semibold",
                              op.includes("total")
                                ? "bg-pink-200 text-pink-700"
                                : "bg-orange-200 text-orange-700"
                            )}
                          >
                            {op}
                          </span>
                        )
                      )}
                    </div>
                    <div className="mb-2 text-sm">
                      <div className="font-semibold text-casal">
                        Progreso de pago:
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-3 bg-Acapulco rounded-full transition-all"
                            style={{
                              width: `${parseInt(
                                ticket.pago.adicional.progresoPago
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="font-bold text-casal min-w-[40px] text-right">
                          {ticket.pago.adicional.progresoPago}
                        </span>
                      </div>
                    </div>
                    <div className="mb-2 text-sm">
                      <span className="font-semibold text-casal">
                        Última actualización:
                      </span>{" "}
                      <span className="text-gray-500 dark:text-gray-300">
                        {ticket.pago.adicional.últimaActualización}
                      </span>
                    </div>
                    <div className="mb-2 text-sm">
                      <span className="font-semibold text-casal">
                        Responsable del registro:
                      </span>{" "}
                      <span className="text-gray-500 dark:text-gray-300">
                        {ticket.pago.adicional.responsableRegistro}
                      </span>
                    </div>
                  </div>

                  {/* Detalle de transacciones complementarias */}
                  <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-4 shadow">
                    <h4 className="font-bold text-casal mb-2 text-center">
                      Detalle de transacciones complementarias
                    </h4>
                    <ul className="text-sm">
                      {ticket.pago.detalleExtra.map((extra, idx) => (
                        <li
                          key={idx}
                          className="mb-1 text-gray-500 dark:text-gray-400"
                        >
                          <span className="font-semibold text-casal">
                            {extra.fecha}
                          </span>
                          {" - "}
                          <span>{extra.detalle}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold mt-4">
                      <Button
                        onClick={() => setShowComprobantesModal(true)}
                        className="mt-4 w-full px-4 py-2 bg-gray-100 text-casal hover:bg-gray-200 dark:bg-casal dark:text-white rounded-lg dark:hover:bg-casal/80 transition-colors"
                      >
                        Ver comprobantes
                      </Button>
                      <Button
                        onClick={() => setShowPdfModal(true)}
                        className="mt-4 w-full px-4 py-2 bg-gray-100 text-casal hover:bg-gray-200 dark:bg-casal dark:text-white rounded-lg dark:hover:bg-casal/80 transition-colors"
                      >
                        Generar recibo PDF
                      </Button>
                      {/* <Button className="mt-4 w-full px-4 py-2 bg-gray-100 text-casal hover:bg-gray-200 dark:bg-casal dark:text-white rounded-lg dark:hover:bg-casal/80 transition-colors">
                        Reportar incidencia
                      </Button> */}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ModalDevolucion
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        ticket={ticket}
        onRefresh={onRefresh}
      />

      <ModalComprobantes
        isOpen={showComprobantesModal}
        onClose={() => setShowComprobantesModal(false)}
        ticket={ticket}
      />

      <ModalReciboPdf
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        ticket={ticket}
      />

      <ModalCancelacionBoletos
        open={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setDeudaForCancel(null);
        }}
        deuda={deudaForCancel}
        onSuccess={onRefresh}
      />
    </div>
  );
}
