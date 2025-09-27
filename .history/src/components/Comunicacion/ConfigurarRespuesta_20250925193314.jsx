import React, { useState } from "react";
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
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Botón agregar nueva */}
      <div className="mb-6">
        <button className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition">
          + Agregar nueva pregunta frecuente
        </button>
      </div>

      {/* Lista de preguntas */}
      <div className="space-y-3">
        {preguntas.map((p, i) => (
          <div
            key={p.id}
            className="border rounded-lg bg-white overflow-hidden flex"
          >
            {/* Número a la izquierda */}
            <div className="bg-gray-50 px-4 py-6 flex items-start justify-center border-r text-gray-500 font-semibold text-lg w-10">
              {i + 1}
            </div>

            {/* Contenido */}
            <div className="flex-1">
              {/* Header pregunta */}
              <div
                className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => togglePregunta(p.id)}
              >
                <div className="flex items-center space-x-2">
                  {/* Chevron al lado de "Pregunta" */}
                  {abierto === p.id ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                  <p className="font-semibold text-gray-800">
                    Pregunta{" "}
                    <span
                      className={`ml-1 font-bold ${
                        p.tipo === "CONDICIÓN"
                          ? "text-blue-600"
                          : "text-orange-600"
                      }`}
                    >
                      [{p.tipo}]
                    </span>{" "}
                    {p.titulo}
                  </p>
                </div>

                {/* Botones alineados a la derecha */}
                <div className="flex space-x-2">
                  <button className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600">
                    Editar
                  </button>
                  <button className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600">
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Respuesta */}
              {abierto === p.id && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                    <span className="font-semibold">Respuesta </span>
                    {p.respuesta}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
