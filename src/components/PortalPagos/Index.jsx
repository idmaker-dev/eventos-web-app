"use client";

import { useState, useEffect } from "react";
import { Button, Checkbox } from "@headlessui/react";
import { ProductDetailsModal } from "./ProductDetailsModal.jsx";
import { CheckIcon } from "lucide-react";
import { Link } from "react-router-dom";

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
            <Link 
              to={`/checkout/${invitadoId}`} 
              state={{ 
                selectedIds: Array.from(selectedIds),
                total: totalAmount
              }}
            >
              <Button
                className="w-full md:w-auto bg-casal text-white px-4 py-2 rounded-lg hover:bg-casal/80 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedIds.size === 0}
              >
                Obtener CLABE para transferencia
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <ProductDetailsModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}