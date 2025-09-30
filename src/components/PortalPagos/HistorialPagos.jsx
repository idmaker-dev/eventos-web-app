"use client"

import { Button } from "@headlessui/react"
import { Coins, CreditCard, Flame } from "lucide-react"
import { DetallesPagoModal } from "./DetallesPago"
import { useState } from "react"

const mockPayments = [
  {
    id: "1",
    amount: 1950.0,
    paymentDate: "26/09/2025",
    paymentMethod: "Transferencia",
    methodIcon: "transfer",
  },
  {
    id: "2",
    amount: 2850.0,
    paymentDate: "15/08/2025",
    paymentMethod: "Pago por tarjeta",
    methodIcon: "card",
  },
  {
    id: "3",
    amount: 1200.0,
    paymentDate: "10/07/2025",
    paymentMethod: "Efectivo",
    methodIcon: "cash",
  },
]

export default function HistorialPagos() {
  const [open, setOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)

  const handleOpenModal = (payment) => {
    setSelectedPayment(payment)
    setOpen(true)
  }

  return (
    <div className="w-full">
      <div className="rounded-lg border border-gray-300 bg-gray-50 overflow-hidden">
        
        {/* Header - Solo visible en Computadoras */}
        <div className="hidden md:grid grid-cols-4 gap-4 border-b border-gray-300 px-6 py-4 bg-white px-8">
          <div className="text-sm font-semibold text-gray-900">Monto</div>
          <div className="text-sm font-semibold text-gray-900">Fecha de pago</div>
          <div className="text-sm font-semibold text-gray-900">Medio de pago</div>
          <div className="text-sm font-semibold text-gray-900">Detalles</div>
        </div>

        {/* Telefono Header */}
        <div className="md:hidden border-b border-gray-300 px-4 py-3 bg-white">
          <h3 className="text-sm font-medium text-gray-900">Historial de Pagos</h3>
        </div>

        <div className="overflow-x-auto">
          {mockPayments.map((payment) => (
            <div key={payment.id}>

              {/* Vista Laptop */}
              <div className="hidden md:grid grid-cols-4 gap-4 py-6 bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors px-8">
                <div className="text-sm text-gray-900 font-medium">
                  ${payment.amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-600">{payment.paymentDate}</div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-red-500/10">
                    {
                            payment.methodIcon === "card" ? (
                              <CreditCard className="h-3 w-3 text-red-500" />
                            ) : payment.methodIcon === "transfer" ? (
                              <Flame className="h-3 w-3 text-red-500" />
                            ) : (
                              <Coins className="h-3 w-3 text-red-500" />
                            )
                          }
                  </div>
                  <span className="text-sm text-gray-600">{payment.paymentMethod}</span>
                </div>
                <div>
                  <button 
                    onClick={() => handleOpenModal(payment)} 
                    className="text-sm text-casal underline hover:text-casal/80 transition-colors"
                  >
                    Ver detalles
                  </button>
                </div>
              </div>

              {/* Vista Telefono - Tarjetas */}
              <div className="md:hidden bg-white border-b border-gray-200 last:border-b-0">
                <div className="p-4 space-y-3">
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-gray-900">
                      ${payment.amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </div>
                    <span className="inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                      Pagado
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Fecha de pago:</span>
                      <span className="text-sm text-gray-900">{payment.paymentDate}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Medio de pago:</span>
                      <div className="flex items-center gap-2">
                        <div className="flex h-4 w-4 items-center justify-center rounded bg-red-500/10">
                          {
                            payment.methodIcon === "card" ? (
                              <CreditCard className="h-3 w-3 text-red-500" />
                            ) : payment.methodIcon === "transfer" ? (
                              <Flame className="h-3 w-3 text-red-500" />
                            ) : (
                              <Coins className="h-3 w-3 text-red-500" />
                            )
                          }
                        </div>
                        <span className="text-sm text-gray-900">{payment.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={() => handleOpenModal(payment)} 
                      className="w-full text-center py-2 px-4 text-sm text-casal border border-casal rounded-lg hover:bg-casal/10 transition-colors"
                    >
                      Ver detalles completos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {mockPayments.length === 0 && (
          <div className="text-center py-12 bg-white">
            <div className="text-gray-500 text-sm">
              No hay pagos registrados
            </div>
          </div>
        )}
      </div>

      <DetallesPagoModal 
        isOpen={open} 
        onClose={() => setOpen(false)} 
        payment={selectedPayment}
      />
    </div>
  )
}