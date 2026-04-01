"use client";

import { useState, useEffect } from "react";
import { Button, Checkbox } from "@headlessui/react";
import { ProductDetailsModal } from "./ProductDetailsModal.jsx";
import MetodoPagoModal from "./MetodoPagoModal.jsx";
import { CheckIcon, X } from "lucide-react";
import EnvConfig from "../../utils/config";

const truncateText = (text, maxLength = 30) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return "";
  const [year, month, day] = fechaISO.split("-");
  return `${day}/${month}/${year}`;
};

const mapearEstado = (cuota) => {
  // Si está vencida
  if (cuota.vencida) return "vencida";
  
  // Si está pagada
  if (cuota.estado === "PAGADA") return "pagada";
  
  // Si está por vencer (menos de 7 días)
  if (cuota.dias_para_vencimiento <= 7 && cuota.dias_para_vencimiento > 0) {
    return "por_vencer";
  }
  
  // Si es futura
  return "futura";
};

export function InstallmentsTable({ cuotas = [], resumen, invitadoId }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [open, setOpen] = useState(false);
  const [metodoPagoOpen, setMetodoPagoOpen] = useState(false);

  // Estados flotante de soporte
  const [mostrarMenuSoporte, setMostrarMenuSoporte] = useState(false);
  const telefonoSoporte = EnvConfig.TELEFONO_SOPORTE;

  const enviarMensajeWp = (tipo) => {
    let mensaje = "";
    if (tipo === 1) mensaje = "Hola, quiero reportar que no se generaron mis facturas o cuotas de pago.";
    else if (tipo === 2) mensaje = ""; // Sin mensaje para el tipo 2
    
    const url = `https://wa.me/${telefonoSoporte}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ""}`;
    window.open(url, "_blank");
    setMostrarMenuSoporte(false);
  };

  // Inicializar con cuotas seleccionables
  useEffect(() => {
    const seleccionables = cuotas
      .filter(c => c.seleccionable)
      .map(c => c.id_cuota);
    setSelectedIds(new Set(seleccionables));
  }, [cuotas]);

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const cuotasSeleccionables = cuotas.filter(c => c.seleccionable);

  const toggleAll = () => {
    if (selectedIds.size === cuotasSeleccionables.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cuotasSeleccionables.map((c) => c.id_cuota)));
    }
  };

  const totalAmount = cuotas
    .filter((c) => selectedIds.has(c.id_cuota))
    .reduce((sum, c) => sum + c.monto_pendiente, 0);

  const getStatusBadge = (cuota) => {
    const status = mapearEstado(cuota);
    
    const badges = {
      pagada: "bg-green-100 text-green-800",
      vencida: "bg-red-100 text-red-800",
      por_vencer: "bg-yellow-100 text-yellow-800",
      futura: "bg-blue-100 text-blue-800"
    };

    const labels = {
      pagada: "Pagada",
      vencida: "Vencida", 
      por_vencer: cuota.estado_display || "Por vencer",
      futura: cuota.estado_display || "Futura"
    };

    return (
      <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="rounded-lg border bg-gray-50 border-gray-300">
      {/* Header - Solo visible en laptop */}
      <div className="hidden md:grid grid-cols-[auto_1fr_1fr_1fr_2fr] gap-4 border-b border-gray-300 px-6 py-4">
        <Checkbox
          checked={selectedIds.size === cuotasSeleccionables.length && cuotasSeleccionables.length > 0}
          onChange={toggleAll}
          className="group relative flex h-6 w-6 cursor-pointer rounded-md bg-white/10 text-white p-1 ring-1 ring-gray-300 ring-inset transition duration-200 ease-in-out focus:outline-none data-[focus]:outline-2 data-[focus]:outline-casal data-[checked]:bg-casal"
        >
          <CheckIcon className="hidden h-4 w-4 fill-casal group-data-[checked]:block" />
        </Checkbox>

        <div className="text-sm font-medium text-gray-900">Monto</div>
        <div className="text-sm font-medium text-gray-900">Vencimiento</div>
        <div className="text-sm font-medium text-gray-900">Estado</div>
        <div className="text-sm font-medium text-gray-900">Producto</div>
      </div>

      {/* Telefono Header */}
      <div className="md:hidden border-b border-gray-300 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Mis Cuotas</h3>
          <Checkbox
            checked={selectedIds.size === cuotasSeleccionables.length && cuotasSeleccionables.length > 0}
            onChange={toggleAll}
            className="group relative flex h-6 w-6 cursor-pointer rounded-md bg-white/10 text-white p-1 ring-1 ring-gray-300 ring-inset transition duration-200 ease-in-out focus:outline-none data-[focus]:outline-2 data-[focus]:outline-casal data-[checked]:bg-casal"
          >
            <CheckIcon className="hidden h-4 w-4 fill-casal group-data-[checked]:block" />
          </Checkbox>
        </div>
      </div>

      {/* Contenido scrolleable horizontalmente en móvil */}
      <div className="overflow-x-auto">
        {cuotas.length === 0 ? (
          <div className="text-center py-12 bg-white">
            <div className="text-gray-500 text-sm">
              No hay cuotas registradas
            </div>
          </div>
        ) : (
          cuotas.map((cuota) => (
          <div key={cuota.id_cuota}>
            {/* Vista Desktop */}
            <div className="hidden md:grid grid-cols-[auto_1fr_1fr_1fr_2fr] gap-4 border-b border-gray-200 px-6 py-4 last:border-b-0 hover:bg-gray-100 transition-colors">
              <Checkbox
                checked={selectedIds.has(cuota.id_cuota)}
                onChange={() => toggleSelection(cuota.id_cuota)}
                disabled={!cuota.seleccionable}
                className="group relative flex h-6 w-6 cursor-pointer rounded-md bg-white/10 text-white p-1 ring-1 ring-gray-300 ring-inset transition duration-200 ease-in-out focus:outline-none data-[focus]:outline-2 data-[focus]:outline-casal data-[checked]:bg-casal disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckIcon className="hidden h-4 w-4 fill-casal group-data-[checked]:block" />
              </Checkbox>

              <div className="text-sm text-gray-900">
                ${cuota.monto_pendiente.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-600">{formatearFecha(cuota.fecha_vencimiento)}</div>
              <div>{getStatusBadge(cuota)}</div>
              <button
                onClick={() => setOpen(true)}
                className="text-sm text-casal underline hover:text-casal/80 text-left"
              >
                {truncateText(cuota.producto_asociado, 25)}
              </button>
            </div>

            {/* Vista Mobile - Tarjetas */}
            <div className="md:hidden border-b border-gray-200 last:border-b-0">
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedIds.has(cuota.id_cuota)}
                      onChange={() => toggleSelection(cuota.id_cuota)}
                      disabled={!cuota.seleccionable}
                      className="group relative flex h-5 w-5 cursor-pointer rounded-md bg-white/10 text-white p-1 ring-1 ring-gray-300 ring-inset transition duration-200 ease-in-out focus:outline-none data-[focus]:outline-2 data-[focus]:outline-casal data-[checked]:bg-casal disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckIcon className="hidden h-3 w-3 fill-casal group-data-[checked]:block" />
                    </Checkbox>
                    <div className="text-lg font-semibold text-gray-900">
                      ${cuota.monto_pendiente.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  {getStatusBadge(cuota)}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Vencimiento:</span>
                    <span className="text-sm text-gray-900">{formatearFecha(cuota.fecha_vencimiento)}</span>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Producto:</span>
                    <button
                      onClick={() => setOpen(true)}
                      className="block text-sm text-casal underline hover:text-casal/80 mt-1"
                    >
                      {truncateText(cuota.producto_asociado, 35)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      <div className="border-t border-gray-200 bg-gray-50 px-4 md:px-6 py-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-gray-900">
              {selectedIds.size} cuotas seleccionadas
            </div>
            <div className="text-sm text-gray-600">Total a pagar</div>
          </div>
          
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-6">
            <div className="text-xl md:text-2xl font-semibold text-gray-900">
              ${totalAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </div>
            <Button
              onClick={() => setMetodoPagoOpen(true)}
              className="w-full md:w-auto bg-casal text-white px-4 py-2 rounded-lg hover:bg-casal/80 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              disabled={selectedIds.size === 0}
            >
              Continuar con el pago
            </Button>
          </div>
        </div>
      </div>

      <ProductDetailsModal isOpen={open} onClose={() => setOpen(false)} />
      <MetodoPagoModal 
        isOpen={metodoPagoOpen} 
        onClose={() => setMetodoPagoOpen(false)}
        invitadoId={invitadoId}
        selectedIds={selectedIds}
        total={totalAmount}
      />

      {/* Botón flotante de soporte */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {mostrarMenuSoporte && (
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-3 mb-4 w-72 flex flex-col gap-2 transition-all transform origin-bottom-right">
            <h3 className="text-casal font-semibold text-sm mb-1 px-2">¿En qué podemos ayudarte?</h3>
            <button
              onClick={() => enviarMensajeWp(1)}
              className="text-left bg-gray-50 hover:bg-gray-100 text-gray-800 text-sm px-3 py-2 rounded-lg transition"
            >
              Reportar que no se generó mis facturas/cuotas de pago
            </button>
            <button
              onClick={() => enviarMensajeWp(2)}
              className="text-left bg-gray-50 hover:bg-gray-100 text-gray-800 text-sm px-3 py-2 rounded-lg transition"
            >
              Otro tipo de detalles
            </button>
          </div>
        )}
        <button
          onClick={() => setMostrarMenuSoporte(!mostrarMenuSoporte)}
          className="bg-[#25D366] hover:bg-[#128C7E] text-white p-3.5 rounded-full shadow-lg transition transform hover:scale-105 flex items-center justify-center"
          aria-label="Soporte por WhatsApp"
        >
          {mostrarMenuSoporte ? (
            <X className="w-7 h-7" />
          ) : (
            <svg 
              className="w-7 h-7"
              viewBox="0 0 24 24" 
              fill="currentColor" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}