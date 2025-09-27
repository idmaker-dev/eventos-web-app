import React, { useState } from "react";
import { Button } from "@headlessui/react";
import clsx from "clsx";

export default function ConfigurarRespuesta() {
  const [preguntas, setPreguntas] = useState([
    {
      id: 1,
      tipo: "CONDICIÓN",
      titulo: "Se realizó el pago en plataforma",
      respuesta: `Hemos recibido tu pago, (Nombre Usuario), por (cantidad abonada). Actualmente te faltan (cantidad) boletos por cubrir.
Cualquier duda o consulta, escríbenos por este chat y con gusto te apoyamos.`,
    },
    {
      id: 2,
      tipo: "CONDICIÓN",
      titulo: "Pago pendiente",
      respuesta: `Hola (Nombre Usuario), te recordamos tu pago pendiente. Falta por cubrir (cantidad abonada). Actualmente te faltan (cantidad) boletos por pagar.
□ Realiza tu pago aquí: www.planoria.com/pagos_pendientes8009`,
    },
    {
      id: 3,
      tipo: "PREGUNTA FRECUENTE",
      titulo: "Información del evento",
      respuesta: `Hola (Nombre Usuario), tu evento (nombre evento) se llevará a cabo el (fecha y hora) en (lugar).
Cualquier duda o consulta, estamos para ayudarte en este chat.`,
    },
  ]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-4">
      {/* Botón agregar nueva */}
      <div className="mb-4">
        <button className="bg-casal text-white px-4 py-2 rounded-lg hover:bg-Acapulco transition">
          + Agregar nueva pregunta frecuente
        </button>
      </div>

      {/* Lista de preguntas */}
      <div className="space-y-4">
        {preguntas.map((p, i) => (
          <div
            key={p.id}
            className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800"
          >
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
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line">
              Respuesta {p.respuesta}
            </p>
            <div className="flex space-x-2 mt-2">
              <button className="bg-green-100 text-green-700 px-3 py-1 text-sm rounded hover:bg-green-200">
                Editar
              </button>
              <button className="bg-red-100 text-red-700 px-3 py-1 text-sm rounded hover:bg-red-200">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
