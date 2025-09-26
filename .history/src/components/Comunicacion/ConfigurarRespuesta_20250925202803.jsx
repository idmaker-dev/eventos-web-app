import React, { useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";

export default function ConfigurarRespuesta() {
  const [preguntas, setPreguntas] = useState([]);
  const [abiertos, setAbiertos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Estados del formulario del modal
  const [nuevoTitulo, setNuevoTitulo] = useState("Nueva pregunta");
  const [nuevoTipo, setNuevoTipo] = useState("PREGUNTA FRECUENTE");
  const [nuevaRespuesta, setNuevaRespuesta] = useState(
    "Aquí escribe la respuesta para la nueva pregunta..."
  );

  const togglePregunta = (id) => {
    if (abiertos.includes(id)) {
      setAbiertos(abiertos.filter((item) => item !== id));
    } else {
      setAbiertos([...abiertos, id]);
    }
  };

  // Abrir modal
  const abrirModal = () => setModalOpen(true);
  const cerrarModal = () => setModalOpen(false);

  // Guardar nueva pregunta
  const guardarPregunta = () => {
    const nuevaPregunta = {
      id: preguntas.length + 1,
      tipo: nuevoTipo,
      titulo: nuevoTitulo,
      respuesta: nuevaRespuesta,
    };
    setPreguntas([...preguntas, nuevaPregunta]);
    cerrarModal();
    // Reset de formulario
    setNuevoTitulo("Nueva pregunta");
    setNuevoTipo("PREGUNTA FRECUENTE");
    setNuevaRespuesta("Aquí escribe la respuesta para la nueva pregunta...");
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Botón agregar nueva */}
      <div className="mb-4">
        <button
          onClick={abrirModal}
          className="bg-Acapulco text-white px-4 py-2 rounded-full font-medium hover:opacity-90 transition text-sm"
        >
          + Agregar nueva pregunta frecuente
        </button>
      </div>

      {/* Lista de preguntas con scroll */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scroll">
        {preguntas.map((p, i) => (
          <div
            key={p.id}
            className="border rounded-lg bg-white overflow-hidden flex"
          >
            <div className="bg-gray-50 px-6 flex items-center justify-center border-r text-gray-600 font-semibold text-lg w-14">
              {i + 1}
            </div>
            <div className="flex-1">
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

                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm rounded-full text-white bg-Acapulco hover:opacity-90 transition">
                    Editar
                  </button>
                  <button className="px-3 py-1 text-sm rounded-full text-white bg-gray-400 hover:opacity-90 transition">
                    Eliminar
                  </button>
                </div>
              </div>

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

        {preguntas.length === 0 && (
          <p className="text-center text-gray-500 text-sm">
            No hay preguntas todavía. Agrega una nueva.
          </p>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl w-96 p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={cerrarModal}
            >
              <X />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              Agregar nueva pregunta
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  className="mt-1 w-full border rounded-md p-2"
                  value={nuevoTipo}
                  onChange={(e) => setNuevoTipo(e.target.value)}
                >
                  <option value="PREGUNTA FRECUENTE">PREGUNTA FRECUENTE</option>
                  <option value="CONDICIÓN">CONDICIÓN</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Título
                </label>
                <input
                  type="text"
                  className="mt-1 w-full border rounded-md p-2"
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Respuesta
                </label>
                <textarea
                  className="mt-1 w-full border rounded-md p-2"
                  rows={4}
                  value={nuevaRespuesta}
                  onChange={(e) => setNuevaRespuesta(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 rounded-md bg-Acapulco text-white hover:opacity-90"
                  onClick={guardarPregunta}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
