import React, { Fragment } from "react";
import { Dialog, Transition, Button } from "@headlessui/react";
import { X, FileText, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNotifications } from "../../../contexts/NotificationContext";

export default function ModalReciboPdf({ isOpen, onClose, ticket }) {
  const { showSuccess } = useNotifications();

  // Función para generar PDF
  const generarPDF = (descargar = false) => {
    const doc = new jsPDF();
    const margin = 20;
    const casalColor = [29, 78, 95]; // #1d4e5f

    // Cabecera (Limpia con borde inferior, igual que el preview)
    doc.setFontSize(22);
    doc.setTextColor(...casalColor);
    doc.setFont("helvetica", "bold");
    doc.text("RECIBO DE PAGO", margin + 85, 30, { align: "center" });

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text(`ID-TICKET: ${ticket.ticket}`, margin + 85, 38, { align: "center" });

    // Línea de la cabecera
    doc.setDrawColor(...casalColor);
    doc.setLineWidth(1);
    doc.line(margin, 42, 190, 42);

    // Info del Cliente y Fecha (Lados opuestos)
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.text("CLIENTE:", margin, 55);
    doc.text("FECHA:", margin + 170, 55, { align: "right" });

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${ticket.cliente.nombre}`, margin, 62);
    doc.text(`${new Date().toLocaleDateString()}`, margin + 170, 62, {
      align: "right",
    });

    // Evento
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.text("EVENTO:", margin, 75);

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${ticket.detalle.nombreEvento}`, margin, 82);

    // Sección: Detalle de Deuda (Tabla Principal)
    const columnsDeuda = [
      "CUOTA",
      "MONTO",
      "PAGADO",
      "PENDIENTE",
      "ESTATUS",
      "VENCIMIENTO",
    ];
    const listaCuotas = ticket.pago.cuotas?.lista_cuotas || [];
    const rowsDeuda = listaCuotas.map((item) => [
      item.descripcion || "Cuota",
      `$${(item.monto || 0).toLocaleString()}`,
      `$${(item.monto_pagado || 0).toLocaleString()}`,
      `$${(item.monto_pendiente || 0).toLocaleString()}`,
      item.estado_display || "N/A",
      item.fecha_vencimiento
        ? new Date(item.fecha_vencimiento).toLocaleDateString()
        : "N/A",
    ]);

    autoTable(doc, {
      startY: 95,
      head: [columnsDeuda],
      body: rowsDeuda,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: [40, 40, 40],
      },
      headStyles: {
        fillColor: casalColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { halign: "left", cellWidth: "auto" },
        1: { halign: "right" },
        2: { halign: "right", fontStyle: "bold" },
        3: { halign: "right", fontStyle: "bold" },
        4: { halign: "center" },
        5: { halign: "center" },
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      didParseCell: function (data) {
        if (data.section === "body") {
          // Color para Pagado (Verde)
          if (data.column.index === 2) {
            data.cell.styles.textColor = [0, 128, 0];
          }
          // Color para Pendiente (Rojo)
          if (data.column.index === 3) {
            data.cell.styles.textColor = [180, 0, 0];
          }
          // Sombreado para Estatus (Simulación de Badge)
          if (data.column.index === 4) {
            const status = String(data.cell.raw).toLowerCase();
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.halign = "center";

            if (status.includes("pagado")) {
              data.cell.styles.fillColor = [220, 252, 231]; // Green-100
              data.cell.styles.textColor = [22, 101, 52]; // Green-800
            } else if (status.includes("vencida") || status.includes("atrasado")) {
              data.cell.styles.fillColor = [254, 226, 226]; // Red-100
              data.cell.styles.textColor = [153, 27, 27]; // Red-800
            } else if (status.includes("pendiente") || status.includes("proceso")) {
              data.cell.styles.fillColor = [254, 243, 199]; // Amber-100
              data.cell.styles.textColor = [146, 64, 14]; // Amber-800
            } else {
              data.cell.styles.fillColor = [243, 244, 246]; // Gray-100
              data.cell.styles.textColor = [31, 41, 55]; // Gray-800
            }
          }
        }
      },
    });

    // Totales (Alineado a la derecha con más espacio)
    const finalY = doc.lastAutoTable.finalY + 15;
    const rightAlignPos = 190;
    const labelPos = rightAlignPos - 70;

    // Resumen de Totales
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    
    // Total a Pagar
    doc.text("TOTAL EVENTO:", labelPos, finalY);
    doc.setTextColor(40, 40, 40);
    doc.text(`$${(ticket.pago.monto_total || 0).toLocaleString()}`, rightAlignPos, finalY, { align: "right" });

    // Pagado
    doc.setTextColor(100, 100, 100);
    doc.text("TOTAL PAGADO:", labelPos, finalY + 8);
    doc.setTextColor(0, 128, 0); // Verde para lo pagado
    doc.text(`${ticket.pago.totalPagado}`, rightAlignPos, finalY + 8, { align: "right" });

    // Pendiente
    doc.setTextColor(100, 100, 100);
    doc.text("SALDO PENDIENTE:", labelPos, finalY + 16);
    doc.setTextColor(180, 0, 0); // Rojo para lo pendiente
    doc.text(`$${(ticket.pago.monto_pendiente || 0).toLocaleString()}`, rightAlignPos, finalY + 16, { align: "right" });

    // Línea separadora antes del estatus
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(labelPos, finalY + 20, rightAlignPos, finalY + 20);

    // Estatus y Progreso
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("ESTATUS:", labelPos, finalY + 30);
    doc.setTextColor(...casalColor);
    doc.text(`${ticket.pago.estadoGeneral}`, rightAlignPos, finalY + 30, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Progreso de pago: ${ticket.pago.adicional.progresoPago}`, margin, finalY + 30);

    if (descargar) {
      const nombreEvento = ticket.detalle.nombreEvento.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      // const fechaId = new Date().toISOString().split('T')[0] + "_" + Date.now();
      // doc.save(`Recibo_${nombreEvento}_${fechaId}.pdf`);
      doc.save(`Recibo_${nombreEvento}.pdf`);
      showSuccess("PDF descargado correctamente");
    } else {
      return doc.output("bloburl");
    }
  };

  if (!ticket) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-[#1a1a1a] p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-casal dark:text-white flex items-center justify-between"
                >
                  <span>Previsualización de Recibo</span>
                  <Button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </Button>
                </Dialog.Title>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Panel de Información */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-black/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                      <h4 className="font-bold text-casal dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Detalles de las Cuotas
                      </h4>
                      <div className="space-y-3">
                        {(ticket.pago.cuotas?.lista_cuotas || []).map((cuota, idx) => (
                          <div
                            key={idx}
                            className="text-sm flex justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0"
                          >
                            <span className="font-semibold text-gray-600 dark:text-gray-400">
                              {cuota.descripcion}
                            </span>
                            <span className="text-gray-800 dark:text-gray-200 text-right">
                              {cuota.fecha_vencimiento ? new Date(cuota.fecha_vencimiento).toLocaleDateString() : "N/A"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-casal/5 dark:bg-casal/20 p-4 rounded-xl border border-casal/10">
                      <h4 className="font-bold text-casal dark:text-casal mb-3">
                        Estado de Cuenta
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Monto Total:</span>
                          <span className="font-bold dark:text-white">${(ticket.pago.monto_total || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Pagado:</span>
                          <span className="font-bold text-green-600">{ticket.pago.totalPagado}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t dark:border-gray-700 pt-2">
                          <span className="text-gray-500 font-semibold">Pendiente:</span>
                          <span className="font-bold text-red-500">${(ticket.pago.monto_pendiente || 0).toLocaleString()}</span>
                        </div>
                        <div className="mt-4 pt-2 border-t dark:border-gray-700">
                          <div className="flex justify-between items-center">
                            <span className="text-xs uppercase font-bold tracking-wider text-casal">Progreso de pago</span>
                            <span className="text-lg font-black text-casal dark:text-white">
                              {ticket.pago.adicional.progresoPago}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Previsualización del PDF (Simulada) */}
                  <div className="bg-gray-200 dark:bg-gray-800 rounded-xl p-2 min-h-[400px] flex flex-col">
                    <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg shadow-inner p-6 overflow-y-auto overflow-x-hidden">
                      {/* Cabecera del Recibo Simulado */}
                      <div className="border-b-2 border-casal pb-4 mb-4 text-center">
                        <h2 className="text-2xl font-bold text-casal uppercase">
                          Recibo de Pago
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                          ID-TICKET: {ticket.ticket}
                        </p>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-bold text-gray-500 uppercase">
                              Cliente:
                            </p>
                            <p className="text-sm font-semibold">
                              {ticket.cliente.nombre}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-500 uppercase">
                              Fecha:
                            </p>
                            <p className="text-sm font-semibold">
                              {new Date().toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="font-bold text-gray-500 uppercase">
                            Evento:
                          </p>
                          <p className="text-sm font-semibold">
                            {ticket.detalle.nombreEvento}
                          </p>
                        </div>

                        {/* Tabla Simulada */}
                        <div className="mt-4 overflow-x-auto border rounded overflow-hidden">
                          <table className="w-full text-[9px] text-left border-collapse">
                            <thead className="bg-casal text-white uppercase font-bold">
                              <tr>
                                <th className="p-1 border-b">Cuota</th>
                                <th className="p-1 border-b text-right">Monto</th>
                                <th className="p-1 border-b text-right text-green-200">Pagado</th>
                                <th className="p-1 border-b text-right text-red-200">Pend.</th>
                                <th className="p-1 border-b text-center">Estatus</th>
                                <th className="p-1 border-b text-center">Venc.</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {(ticket.pago.cuotas?.lista_cuotas || []).map((cuota, idx) => (
                                <tr key={idx} className="text-gray-700 dark:text-gray-300">
                                  <td className="p-1 font-semibold truncate max-w-[80px]">{cuota.descripcion}</td>
                                  <td className="p-1 text-right">${(cuota.monto || 0).toLocaleString()}</td>
                                  <td className="p-1 text-right text-green-600 font-bold">${(cuota.monto_pagado || 0).toLocaleString()}</td>
                                  <td className="p-1 text-right text-red-500">${(cuota.monto_pendiente || 0).toLocaleString()}</td>
                                  <td className="p-1 text-center">
                                    <span className="px-1 rounded bg-gray-100 dark:bg-gray-800 text-[8px]">
                                      {cuota.estado_display}
                                    </span>
                                  </td>
                                  <td className="p-1 text-center font-mono">
                                    {cuota.fecha_vencimiento ? new Date(cuota.fecha_vencimiento).toLocaleDateString() : "N/A"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex justify-end pt-4">
                          <div className="min-w-[180px] space-y-1 text-[10px]">
                            <div className="flex justify-between">
                              <span className="font-bold text-gray-500 uppercase">Total Evento:</span>
                              <span className="font-bold text-gray-700">${(ticket.pago.monto_total || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-bold text-gray-500 uppercase">Pagado:</span>
                              <span className="font-bold text-green-600">{ticket.pago.totalPagado}</span>
                            </div>
                            <div className="flex justify-between border-b pb-1">
                              <span className="font-bold text-gray-500 uppercase">Pendiente:</span>
                              <span className="font-bold text-red-500">${(ticket.pago.monto_pendiente || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-1">
                              <span className="font-bold text-gray-500 uppercase">Estatus:</span>
                              <span className="text-casal font-bold">
                                {ticket.pago.estadoGeneral}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <Button
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => generarPDF(true)}
                    className="px-6 py-2 bg-casal text-white rounded-lg hover:bg-casal/90 transition-colors flex items-center gap-2 font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
