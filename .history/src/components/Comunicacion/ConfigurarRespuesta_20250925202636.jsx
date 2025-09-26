import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function ConfigurarRespuesta() {
  const [preguntas, setPreguntas] = useState([]); // 🚨 Iniciamos vacío
  const [abiertos, setAbiertos] = useState([]);

  const togglePregunta = (id) => {
    if (abiertos.includes(id)) {
      setAbiertos(abiertos.filter((item) => item !== id));
    } else {
      setAbiertos([...abiertos, id]);
    }
  };

  // 🚨 Función para agregar nueva pregunta
  const agregarPregunta = () => {
    const nuevaPregunta = {
      id: preguntas.length + 1, // id autoincremental
      tipo: "PREGUNTA FRECUENTE",
      titulo: `Nueva pregunta ${preguntas.length + 1}`,
      respuesta: "Aquí escribe la respuesta para la nueva pregunta...",
    };

    setPreguntas([...preguntas, nuevaPregunta]);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Botón agregar nueva */}
      <div className="mb-4">
        <button
          onClick={agregarPregunta}
          className="bg-Acapulco text-white px-4 py-2 rounded-full font-medium hover:opacity-90 transition text-sm"
        >
          + Agregar nueva pregunta frecuente
        </button>
      </div>

      {/* Lista de preguntas con scroll lateral */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scroll">
        {preguntas.map((p, i) => (
          <div
            key={p.id}
            className="border rounded-lg bg-white overflow-hidden flex"
          >
            {/* Número a la izquierda */}
            <div className="bg-gray-50 px-6 flex items-center justify-center border-r text-gray-600 font-semibold text-lg w-14">
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
                  {abiertos.includes(p.id) ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                  <p className="text-gray-800 text-[15px] leading-snug">
                    <span className="font-semibold">Pregunta </span>
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

                {/* Botones */}
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm rounded-full text-white bg-Acapulco hover:opacity-90 transition">
                    Editar
                  </button>
                  <button className="px-3 py-1 text-sm rounded-full text-white bg-gray-400 hover:opacity-90 transition">
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Respuesta */}
              {abiertos.includes(p.id) && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">
                    <span className="font-semibold">Respuesta </span>
                    {p.respuesta}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Mensaje si está vacío */}
        {preguntas.length === 0 && (
          <p className="text-center text-gray-500 text-sm">
            No hay preguntas todavía. Agrega una nueva.
          </p>
        )}
      </div>

      {/* Scrollbar personalizada */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: #c1c1c1;
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #a0a0a0;
        }
      `}</style>
    </div>
  );
}
