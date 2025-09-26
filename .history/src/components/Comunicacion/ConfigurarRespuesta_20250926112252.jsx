import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";

export default function ConfigurarRespuesta() {
  const [preguntas, setPreguntas] = useState([]);
  const [abiertos, setAbiertos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editarModalOpen, setEditarModalOpen] = useState(false);

  // Estados del formulario del modal para agregar
  const [nuevoTitulo, setNuevoTitulo] = useState("Nueva pregunta");
  const [nuevoTipo, setNuevoTipo] = useState("PREGUNTA FRECUENTE");
  const [nuevaRespuesta, setNuevaRespuesta] = useState(
    "Aquí escribe la respuesta para la nueva pregunta..."
  );

  // Estados del formulario del modal para editar
  const [editarId, setEditarId] = useState(null);
  const [editarTitulo, setEditarTitulo] = useState("");
  const [editarTipo, setEditarTipo] = useState("");
  const [editarRespuesta, setEditarRespuesta] = useState("");

  // 🔹 Al cargar el componente, traemos preguntas guardadas
  useEffect(() => {
    const dataGuardada = localStorage.getItem("preguntas");
    if (dataGuardada) {
      setPreguntas(JSON.parse(dataGuardada));
    }
  }, []);

  // 🔹 Cada vez que cambian las preguntas, se guardan en localStorage
  useEffect(() => {
    localStorage.setItem("preguntas", JSON.stringify(preguntas));
  }, [preguntas]);

  const togglePregunta = (id) => {
    if (abiertos.includes(id)) {
      setAbiertos(abiertos.filter((item) => item !== id));
    } else {
      setAbiertos([...abiertos, id]);
    }
  };

  // Agregar nueva pregunta
  const abrirModal = () => setModalOpen(true);
  const cerrarModal = () => setModalOpen(false);

  const guardarPregunta = () => {
    const nuevaPregunta = {
      id: Date.now(), // 🔹 id único basado en tiempo
      tipo: nuevoTipo,
      titulo: nuevoTitulo,
      respuesta: nuevaRespuesta,
    };
    setPreguntas([...preguntas, nuevaPregunta]);
    cerrarModal();
    // Reset
    setNuevoTitulo("Nueva pregunta");
    setNuevoTipo("PREGUNTA FRECUENTE");
    setNuevaRespuesta("Aquí escribe la respuesta para la nueva pregunta...");
  };

  // Editar pregunta
  const abrirEditarModal = (pregunta) => {
    setEditarId(pregunta.id);
    setEditarTitulo(pregunta.titulo);
    setEditarTipo(pregunta.tipo);
    setEditarRespuesta(pregunta.respuesta);
    setEditarModalOpen(true);
  };

  const cerrarEditarModal = () => setEditarModalOpen(false);

  const guardarEdicion = () => {
    const nuevasPreguntas = preguntas.map((p) =>
      p.id === editarId
        ? { ...p, titulo: editarTitulo, tipo: editarTipo, respuesta: editarRespuesta }
        : p
    );
    setPreguntas(nuevasPreguntas);
    cerrarEditarModal();
  };

  // Eliminar pregunta
  const eliminarPregunta = (id) => {
    const nuevasPreguntas = preguntas.filter((p) => p.id !== id);
    setPreguntas(nuevasPreguntas);
    setAbiertos(abiertos.filter((a) => a !== id));
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

      {/* Lista de preguntas */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scroll">
        {preguntas.map((p, i) => (
          <div key={p.id} className="border rounded-lg bg-white overflow-hidden flex">
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
                        p.tipo === "CONDICIÓN" ? "text-blue-600" : "text-orange-600"
                      }`}
                    >
                      [{p.tipo}]
                    </span>{" "}
                    {p.titulo}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    className="px-3 py-1 text-sm rounded-full text-white bg-Acapulco hover:opacity-90 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirEditarModal(p);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="px-3 py-1 text-sm rounded-full text-white bg-red-500 hover:opacity-90 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarPregunta(p.id);
                    }}
                  >
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

      {/* Aquí siguen tus modales de agregar y editar (no cambiaron) */}

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
