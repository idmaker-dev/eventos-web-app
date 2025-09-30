"use client";

import { useState } from "react";
import { Button, Checkbox } from "@headlessui/react";
import { ProductDetailsModal } from "./ProductDetailsModal.jsx";
import { CheckIcon } from "lucide-react";
import { Link } from "react-router-dom";

const mockInstallments = [
  {
    id: "1",
    amount: 1950.0,
    dueDate: "02/02/2026",
    status: "futura",
    product: "Graduacion PREPA IBERO 26...",
  },
  {
    id: "2",
    amount: 1950.0,
    dueDate: "03/04/2026",
    status: "futura",
    product: "Graduacion PREPA IBERO 26...",
  },
  {
    id: "3",
    amount: 1950.0,
    dueDate: "01/05/2026",
    status: "futura",
    product: "Graduacion PREPA IBERO 26...",
  },
];

const truncateText = (text, maxLength = 30) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export function InstallmentsTable() {
  const [selectedIds, setSelectedIds] = useState(
    new Set(mockInstallments.map((i) => i.id))
  );
  const [open, setOpen] = useState(false);

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === mockInstallments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(mockInstallments.map((i) => i.id)));
    }
  };

  const totalAmount = mockInstallments
    .filter((i) => selectedIds.has(i.id))
    .reduce((sum, i) => sum + i.amount, 0);

  const getStatusBadge = (status) => {
    const badges = {
      pagada: "bg-green-100 text-green-800",
      vencida: "bg-red-100 text-red-800",
      futura: "bg-blue-100 text-blue-800"
    };

    const labels = {
      pagada: "Pagada",
      vencida: "Vencida", 
      futura: "Futura"
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
          checked={selectedIds.size === mockInstallments.length}
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
            checked={selectedIds.size === mockInstallments.length}
            onChange={toggleAll}
            className="group relative flex h-6 w-6 cursor-pointer rounded-md bg-white/10 text-white p-1 ring-1 ring-gray-300 ring-inset transition duration-200 ease-in-out focus:outline-none data-[focus]:outline-2 data-[focus]:outline-casal data-[checked]:bg-casal"
          >
            <CheckIcon className="hidden h-4 w-4 fill-casal group-data-[checked]:block" />
          </Checkbox>
        </div>
      </div>

      {/* Contenido scrolleable horizontalmente en móvil */}
      <div className="overflow-x-auto">
        {mockInstallments.map((installment) => (
          <div key={installment.id}>
            {/* Vista Desktop */}
            <div className="hidden md:grid grid-cols-[auto_1fr_1fr_1fr_2fr] gap-4 border-b border-gray-200 px-6 py-4 last:border-b-0 hover:bg-gray-100 transition-colors">
              <Checkbox
                checked={selectedIds.has(installment.id)}
                onChange={() => toggleSelection(installment.id)}
                className="group relative flex h-6 w-6 cursor-pointer rounded-md bg-white/10 text-white p-1 ring-1 ring-gray-300 ring-inset transition duration-200 ease-in-out focus:outline-none data-[focus]:outline-2 data-[focus]:outline-casal data-[checked]:bg-casal"
              >
                <CheckIcon className="hidden h-4 w-4 fill-casal group-data-[checked]:block" />
              </Checkbox>

              <div className="text-sm text-gray-900">
                ${installment.amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-600">{installment.dueDate}</div>
              <div>{getStatusBadge(installment.status)}</div>
              <button
                onClick={() => setOpen(true)}
                className="text-sm text-casal underline hover:text-casal/80 text-left"
              >
                {truncateText(installment.product, 25)}
              </button>
            </div>

            {/* Vista Mobile - Tarjetas */}
            <div className="md:hidden border-b border-gray-200 last:border-b-0">
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedIds.has(installment.id)}
                      onChange={() => toggleSelection(installment.id)}
                      className="group relative flex h-5 w-5 cursor-pointer rounded-md bg-white/10 text-white p-1 ring-1 ring-gray-300 ring-inset transition duration-200 ease-in-out focus:outline-none data-[focus]:outline-2 data-[focus]:outline-casal data-[checked]:bg-casal"
                    >
                      <CheckIcon className="hidden h-3 w-3 fill-casal group-data-[checked]:block" />
                    </Checkbox>
                    <div className="text-lg font-semibold text-gray-900">
                      ${installment.amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  {getStatusBadge(installment.status)}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Vencimiento:</span>
                    <span className="text-sm text-gray-900">{installment.dueDate}</span>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Producto:</span>
                    <button
                      onClick={() => setOpen(true)}
                      className="block text-sm text-casal underline hover:text-casal/80 mt-1"
                    >
                      {truncateText(installment.product, 35)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
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
            <Link to="/checkout" state={{ selectedIds: Array.from(selectedIds) }}>
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