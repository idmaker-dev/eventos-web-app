import React, { useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";

export default function ConfigurarRespuesta() {
  const [preguntas, setPreguntas] = useState([]);
  const [abiertos, setAbiertos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Estados del formulario del modal
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState("PREGUNTA FRECUENTE");
  const [nuevaRespuesta, setNuevaRespuesta] = useState("");

  // Abrir / cerrar modal
  const abrirModal = () => setModalOpen(true);
  const cerrarModal = () => {
    setModalOpen(false);
    setNuevoTitulo("");
    setNuevoTipo("PREGUNTA FRECUENTE");
    setNuevaRespuesta("");
  };

  // Guardar nueva pregunta
  const guardarPregunta = () => {
    if (!nuevoTitulo.trim() || !nuevaRespuesta.trim()) return; // Evita guardar vacío

    const nuevaPregunta = {
      id: Date.now(), // 🔹 id único
      tipo: nuevoTipo,
      titulo: nuevoTitulo,
      respuesta: nuevaRespuesta,
    };

    setPreguntas([...preguntas, nuevaPregunta]);
    cerrarModal();
  };

  // Expandir / contraer pregunta
  const togglePregunta = (id) => {
    setAbiertos((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Configurar respuestas</h1>

      {/* Botón para abrir modal */}
      <div className="mb-4">
        <button
          onClick={abrirModal}
          className="bg-[#70a494] text-white px-4 py-2 rounded-md font-medium hover:bg-[#5e887c] transition"
        >
          + Agregar nueva pregunta frecuente
        </button>
      </div>

      {/* Listado de preguntas */}
      <div className="space-y-4">
        {preguntas.map((pregunta) => (
          <div
            key={pregunta.id}
            className="bg-white shadow-md rounded-lg border border-gray-200"
          >
            <button
              onClick={() => togglePregunta(pregunta.id)}
              className="flex justify-between items-center w-full p-4 text-left"
            >
              <span className="text-sm font-semibold text-gray-700">
                [{pregunta.tipo}] {pregunta.titulo}
              </span>
              {abiertos.includes(pregunta.id) ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {abiertos.includes(pregunta.id) && (
              <div className="p-4 border-t border-gray-200 text-sm text-gray-600">
                {pregunta.respuesta}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={cerrarModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">
              Agregar nueva pregunta frecuente
            </h2>

            <div className="space-y-4">
              {/* Tipo de pregunta */}
              <select
                value={nuevoTipo}
                onChange={(e) => setNuevoTipo(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-[#70a494]"
              >
                <option>PREGUNTA FRECUENTE</option>
                <option>CONDICIÓN</option>
                <option>NOTIFICACIÓN</option>
              </select>

              {/* Título */}
              <input
                type="text"
                value={nuevoTitulo}
                onChange={(e) => setNuevoTitulo(e.target.value)}
                placeholder="Nueva pregunta"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-[#70a494]"
              />

              {/* Respuesta */}
              <textarea
                value={nuevaRespuesta}
                onChange={(e) => setNuevaRespuesta(e.target.value)}
                placeholder="Aquí escribe la respuesta para la nueva pregunta..."
                rows="4"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-[#70a494]"
              ></textarea>
            </div>

            {/* Botón guardar */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={guardarPregunta}
                className="bg-[#70a494] text-white px-4 py-2 rounded-md font-medium hover:bg-[#5e887c] transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
