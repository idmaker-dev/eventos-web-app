import React, { useState } from "react";

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

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Botón agregar nueva */}
      <div className="mb-6">
        <button className="bg-teal-500 text-white px-4 py-2 rounded-full hover:bg-teal-600 transition">
          + Agregar nueva pregunta frecuente
        </button>
      </div>

      {/* Lista de preguntas */}
      <div className="space-y-4">
        {preguntas.map((p, i) => (
          <div
            key={p.id}
            className="border rounded-lg bg-white overflow-hidden p-4"
          >
            {/* Header */}
            <p className="font-semibold text-gray-800">
              <span className="mr-2 text-gray-600">{i + 1}</span>
              Pregunta{" "}
              <span
                className={`ml-1 font-bold ${
                  p.tipo === "CONDICIÓN" ? "text-blue-600" : "text-orange-600"
                }`}
              >
                [{p.tipo}]
              </span>{" "}
              {p.titulo}
            </p>

            {/* Respuesta */}
            <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
              <span className="font-semibold">Respuesta </span>
              {p.respuesta}
            </p>

            {/* Botones */}
            <div className="flex space-x-2 mt-3">
              <button className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm hover:bg-green-200">
                Editar
              </button>
              <button className="bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm hover:bg-red-200">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
