import React, { useState } from "react";
import clsx from "clsx";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function ConfigurarRespuesta() {
  const [preguntas, setPreguntas] = useState([
    {
      id: 1,
      tipo: "CONDICIÓN",
      titulo: "Se realizó el pago en plataforma",
      respuesta: `Hemos recibido tu pago, (Nombre Usuario), por (cantidad abonada). Actualmente te faltan (cantidad) boletos por cubrir.\n\nCualquier duda o consulta, escríbenos por este chat y con gusto te apoyamos.`,
    },
    {
      id: 2,
      tipo: "CONDICIÓN",
      titulo: "Pago pendiente",
      respuesta: `Hola (Nombre Usuario), te recordamos tu pago pendiente. Falta por cubrir (cantidad abonada). Actualmente te faltan (cantidad) boletos por pagar.\n\n□ Realiza tu pago aquí: www.planoria.com/pagos_pendientes8009`,
    },
    {
      id: 3,
      tipo: "PREGUNTA FRECUENTE",
      titulo: "Información del evento",
      respuesta: `Hola (Nombre Usuario), tu evento (nombre evento) se llevará a cabo el (fecha y hora) en (lugar).\n\nCualquier duda o consulta, estamos para ayudarte en este chat.`,
    },
  ]);

  const [abierto, setAbierto] = useState(null);

  const togglePregunta = (id) => {
    setAbierto(abierto === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
      {/* Botón agregar nueva */}
      <div className="mb-6">
        <button className="bg-casal text-white px-4 py-2 rounded-lg hover:bg-Acapulco transition">
          + Agregar nueva pregunta frecuente
        </button>
      </div>

      {/* Lista de preguntas */}
      <div className="space-y-4">
        {preguntas.map((p, i) => (
          <div
            key={p.id}
            className="border rounded-lg bg-gray-50 dark:bg-gray-800 overflow-hidden"
          >
            {/* Header */}
            <div
              className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              onClick={() => togglePregunta(p.id)}
            >
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  Pregunta{" "}
                  <span
                    className={clsx(
                      "px-2 py-0.5 rounded text-xs font-bold ml-1",
                      p.tipo === "CONDICIÓN"
                        ? "text-blue-600"
                        : "text-orange-600"
                    )}
                  >
                    [{p.tipo}]
                  </span>{" "}
                  {p.titulo}
                </p>
              </div>
              {abierto === p.id ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </div>

            {/* Respuesta */}
            {abierto === p.id && (
              <div className="px-4 pb-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-line">
                  <span className="font-semibold">Respuesta</span> {p.respuesta}
                </p>
                <div className="flex space-x-2 mt-3">
                  <button className="bg-green-100 text-green-700 px-3 py-1 text-sm rounded hover:bg-green-200">
                    Editar
                  </button>
                  <button className="bg-red-100 text-red-700 px-3 py-1 text-sm rounded hover:bg-red-200">
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
