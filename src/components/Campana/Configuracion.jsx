import React, { useState } from "react";
import {
  ChevronLeft,
  MoreHorizontal,
  CircleCheckBig,
  BookText,
  X,
  Check,
} from "lucide-react";
import { Button, Dialog, DialogPanel } from "@headlessui/react";
import EmojiSelector from "../Clientes/Chat/EmojiSelector";
import FileUploader from "../Clientes/Chat/FileUploader";

export default function Configuracion({ campana, onVolver }) {
  // Pasos del flujo
  const [pasos, setPasos] = useState([
    {
      id: 1,
      tipo: "accion",
      titulo: "Paso 1: Definir acción",
      completado: true,
    },
    {
      id: 2,
      tipo: "mensaje",
      titulo: "Paso 2: Mensaje automático",
      completado: false,
    },
    {
      id: 3,
      tipo: "gestion",
      titulo: "Paso 3: Gestión de respuestas",
      completado: false,
    },
  ]);
  const [pasoSeleccionado, setPasoSeleccionado] = useState(1);
  const [mostrarInfoAccion, setMostrarInfoAccion] = useState(true);

  // Configuración de acción (Paso 1)
  const [accionConfig, setAccionConfig] = useState({
    accionDisparadora: ["Finalización de selección de mesa"],
    grupoPersonas: ["Grupo: Finalización de mesa"],
    condiciones: [
      "Selección de mesa = Confirmada",
      "Evento = todos los eventos",
    ],
  });

  // Configuración de mensaje (Paso 2)
  const [canalSeleccionado, setCanalSeleccionado] = useState(["WhatsApp"]);
  const [mensajeBot, setMensajeBot] = useState(
    `Hola {{Nombre}},\nTu selección de mesa ha sido confirmada correctamente para la Ceremonia de Graduación – Generación 2025.\n\nEvento: {{Evento}}\nFecha: {{Fecha}}\nHora: {{Hora}}\nLugar: {{Lugar}}\n\nEn breve recibirás tus boletos digitales con código QR.\nSi necesitas apoyo, puedes escribirnos por este medio.`
  );
  const [archivos, setArchivos] = useState([]);
  const [adjuntarImagen, setAdjuntarImagen] = useState(false);
  const [adjuntarDocumento, setAdjuntarDocumento] = useState(false);
  const [incluirEnlace, setIncluirEnlace] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState([
    "Respuesta automática del bot",
  ]);
  const opcionesRespuesta = [
    "Crear ticket para asesor humano",
    "Respuesta automática del bot",
    "Ambas opciones",
  ];
  const [condiciones, setCondiciones] = useState([
    "Si la pregunta es frecuente = Responder automáticamente",
    "Si requiere atención personalizada =\n→ Crear ticket en Módulo Cliente\n→ Asignar a asesor humano",
  ]);

  // Modal de edición de variables
  const [modalEdicion, setModalEdicion] = useState(false);
  const [configTemporal, setConfigTemporal] = useState({
    nombreUsuario: "Nombre Usuario",
    nombreEvento: "nombre evento",
    fechaHora: "fecha y hora",
    lugar: "lugar",
    precio: "$800",
    enlaceGenerado: "enlace generado",
  });

  // Manejar archivos subidos
  const handleFileSelect = (fileData) => {
    // Si solo imágenes
    if (adjuntarImagen && !adjuntarDocumento) {
      if (fileData.type.startsWith("image/")) {
        setArchivos((prev) => [...prev, fileData]);
      } else {
        alert("Solo puedes adjuntar imágenes.");
      }
      return;
    }
    // Si solo documentos
    if (!adjuntarImagen && adjuntarDocumento) {
      if (!fileData.type.startsWith("image/")) {
        setArchivos((prev) => [...prev, fileData]);
      } else {
        alert("Solo puedes adjuntar documentos.");
      }
      return;
    }
    // Si ambos o ninguno, acepta cualquier tipo
    setArchivos((prev) => [...prev, fileData]);
  };

  // Agregar paso al flujo
  const agregarPaso = () => {
    const nuevoPaso = {
      id: pasos.length + 1,
      tipo: pasos.length % 2 === 0 ? "usuario" : "admin",
      titulo: `Paso ${pasos.length + 1}: ${
        pasos.length % 2 === 0
          ? "Recibo un mensaje (Usuario)"
          : "Redactar respuesta (Adm)"
      }`,
      completado: false,
    };
    setPasos([...pasos, nuevoPaso]);
  };

  // Modal edición variables mensaje
  const abrirModalEdicion = () => {
    setConfigTemporal({ ...configTemporal });
    setModalEdicion(true);
  };
  const guardarCambios = () => {
    setModalEdicion(false);
  };
  const actualizarVariable = (key, value) => {
    setConfigTemporal((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="min-h-screen border rounded-3xl p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel Izquierdo - Flujo de Pasos */}
          <div className="lg:col-span-2 bg-fondoVs dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm">
            {/* Header */}
            <div className="flex gap-3 items-center mb-6">
              <Button
                onClick={onVolver}
                className="flex items-center gap-2 text-white bg-casal px-2 rounded-lg py-1 hover:bg-casal/80 font-medium"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="bg-white dark:bg-[#2a2a2a] rounded-full px-5 py-1 text-casal font-semibold">
                Acción: {campana.title}
              </span>
            </div>

            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-casal mb-2">
                Editar el flujo
              </h2>
              {/* Lista de Pasos */}
              <div className="space-y-4 w-full">
                {pasos.map((paso, index) => (
                  <div key={paso.id} className="relative">
                    {/* Línea conectora */}
                    <div className="hidden sm:block ">
                      {index < pasos.length - 1 && (
                        <div className="absolute left-1/2 top-14 w-1 h-5 bg-Acapulco "></div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex-1 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 flex items-center justify-between cursor-pointer ${
                          pasoSeleccionado === paso.id
                            ? "ring-2 ring-casal"
                            : ""
                        }`}
                        onClick={() => setPasoSeleccionado(paso.id)}
                      >
                        <div className="flex items-center">
                          <CircleCheckBig
                            className={`h-6 w-6 mr-3 ${
                              paso.completado ? "text-casal" : "text-gray-400"
                            }`}
                          />
                          <span
                            className={
                              paso.completado
                                ? "font-semibold text-casal"
                                : "font-medium text-gray-700"
                            }
                          >
                            {paso.titulo}
                          </span>
                        </div>
                        <Button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Botón Agregar Paso */}
                <div className="flex justify-center pt-6">
                  <Button
                    onClick={agregarPaso}
                    className="flex items-center gap-2 bg-white dark:bg-[#2a2a2a] rounded-3xl px-3 py-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium"
                  >
                    <span className="text-2xl">+</span>
                    Agregar paso
                  </Button>
                </div>
              </div>
            </div>
            {/* Botones de acción */}
            <div className="justify-center flex mt-8">
              <div className="flex gap-4 p-3 bg-white dark:bg-[#2a2a2a] rounded-full shadow-md">
                <Button className="bg-casal hover:bg-casal/90 text-white px-6 py-2 rounded-3xl font-medium">
                  Guardar cambios
                </Button>
                <Button className="flex items-center gap-2 bg-fondoVs rounded-3xl dark:bg-[#1a1a1a] text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 px-6 py-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Desactivar
                </Button>
              </div>
            </div>
          </div>

          {/* Panel Derecho - Configuración */}
          <div className="space-y-6">
            {/* Paso 1: Definir acción */}
            {pasoSeleccionado === 1 && (
              <div className="rounded-2xl p-6 shadow-sm border-2">
                {mostrarInfoAccion ? (
                  <div>
                    <div className="flex justify-between">
                      <h3 className="text-xl font-semibold mb-4 text-casal">
                        Configuración de Paso 1
                      </h3>
                      <Button
                        onClick={() => setMostrarInfoAccion(false)}
                        className="text-Acapulco dark:text-gray-500 px-2 py-2 rounded text-sm flex items-center gap-1 hover:bg-casal/80 hover:text-white"
                      >
                        <BookText className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="mb-4">
                      <p className="block text-xl font-semibold text-Acapulco mb-1">
                        {pasos.find((p) => p.id === pasoSeleccionado)?.titulo}
                      </p>
                    </div>
                    <div className="mb-4 ">
                      <label className="block font-semibold text-Acapulco mb-1">
                        Acción disparadora:
                      </label>
                      <select
                        className="w-full border border-Acapulco rounded-lg p-2 bg-Acapulco/10 text-casal"
                        value={accionConfig.accionDisparadora[0] || ""}
                        onChange={(e) =>
                          setAccionConfig({
                            ...accionConfig,
                            accionDisparadora: Array.from(
                              e.target.selectedOptions,
                              (option) => option.value
                            ),
                          })
                        }
                      >
                        <option value="Pago completado">Pago completado</option>
                        <option value="Finalización de selección de mesa">
                          Finalización de selección de mesa
                        </option>
                        <option value="Registro completado">
                          Registro completado
                        </option>
                        <option value="Recordatorio de pagos">
                          Recordatorio de pagos
                        </option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block font-semibold mb-1 text-Acapulco">
                        Aplicar grupo de personas:
                      </label>
                      <select
                        className="w-full border border-Acapulco rounded-lg p-2 bg-Acapulco/10 text-casal"
                        value={accionConfig.grupoPersonas[0] || ""}
                        onChange={(e) =>
                          setAccionConfig({
                            ...accionConfig,
                            grupoPersonas: Array.from(
                              e.target.selectedOptions,
                              (option) => option.value
                            ),
                          })
                        }
                      >
                        <option value="Grupo: Pagos completados">
                          Grupo: Pagos completados
                        </option>
                        <option value="Grupo: Finalización de mesa">
                          Grupo: Finalización de mesa
                        </option>
                        <option value="Grupo: Pagos pendientes">
                          Grupo: Pagos pendientes
                        </option>
                        <option value="Grupo: Registro completados">
                          Grupo: Registro completados
                        </option>
                        <option value="Evento de ceremonia 2026">
                          Evento de ceremonia 2026
                        </option>
                        <option value="@María Fernanda Villaseñor">
                          @María Fernanda Villaseñor
                        </option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block font-semibold mb-1 text-Acapulco">
                        Condiciones del grupo:
                      </label>
                      <div className="border border-Acapulco p-2 mb-2 rounded-lg text-casal max-h-40 overflow-y-auto">
                        <ul className="space-y-1">
                          {accionConfig.condiciones.map((cond, idx) => (
                            <li
                              key={idx}
                              className="flex items-center justify-between gap-2 "
                            >
                              <span>{cond}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setAccionConfig({
                                    ...accionConfig,
                                    condiciones:
                                      accionConfig.condiciones.filter(
                                        (_, i) => i !== idx
                                      ),
                                  })
                                }
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-500 rounded-lg p-1 ml-2"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="text"
                          placeholder="Nueva condición"
                          className="border border-Acapulco rounded-lg p-2 w-full"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.target.value.trim()) {
                              setAccionConfig({
                                ...accionConfig,
                                condiciones: [
                                  ...accionConfig.condiciones,
                                  e.target.value.trim(),
                                ],
                              });
                              e.target.value = "";
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-semibold text-casal">
                          Información de la acción
                        </h3>
                        <Button
                          className="text-Acapulco dark:text-gray-500 px-2 py-2 rounded text-sm flex items-center gap-1 hover:bg-casal/80 hover:text-white"
                          onClick={() => setMostrarInfoAccion(true)}
                        >
                          Volver
                        </Button>
                      </div>
                      <div>
                        <p className="font-semibold text-Acapulco">Nombre</p>
                        <p className="text-casal">
                          Finalización de selección de mesa
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-Acapulco">
                          Descripción
                        </p>
                        <p className="text-casal">
                          Se activa cuando el asistente concluye y confirma la
                          elección de su mesa dentro del evento, permitiendo
                          ejecutar acciones automáticas como el envío de
                          mensajes, confirmaciones o seguimiento
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-Acapulco">
                          Aplicado a grupo de personas
                        </p>
                        <p className="text-casal">
                          Grupo: Finalización de mesa
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-Acapulco">
                          Condición de acción
                        </p>
                        <div className="pl-2 text-casal">
                          <div>
                            <input
                              type="checkbox"
                              checked
                              readOnly
                              className="mr-2"
                            />
                            Selección de mesa = Confirmada
                          </div>
                          <div>
                            <input
                              type="checkbox"
                              checked
                              readOnly
                              className="mr-2"
                            />
                            Evento = todos los eventos
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-Acapulco">Estado</p>
                        <p className="text-casal">Activa</p>
                      </div>
                      <div>
                        <p className="font-semibold text-Acapulco">
                          Última ejecución
                        </p>
                        <p className="text-casal">Hace 12 minutos</p>
                      </div>
                      <div>
                        <p className="font-semibold text-Acapulco">
                          Última edición
                        </p>
                        <p className="text-casal">Hace 2 semanas</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Paso 2: Mensaje automático */}
            {pasoSeleccionado === 2 && (
              <div className="rounded-2xl p-6 shadow-sm border-2">
                <div className="flex justify-between">
                  <h3 className="text-xl font-semibold mb-4 text-casal">
                    Configuración de Paso 2
                  </h3>
                  <Button className="text-Acapulco dark:text-gray-500 px-2 py-2 rounded text-sm flex items-center gap-1 hover:bg-casal/80 hover:text-white">
                    <BookText className="h-5 w-5" />
                  </Button>
                </div>
                <div className="mb-4">
                  <label className="block font-semibold text-Acapulco mb-1">
                    Canal:
                  </label>
                  <select
                    className="w-full border border-Acapulco rounded-lg p-2 bg-Acapulco/10 text-casal"
                    value={canalSeleccionado[0] || ""}
                    onChange={(e) =>
                      setCanalSeleccionado(
                        Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        )
                      )
                    }
                  >
                    <option value="SMS">SMS</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Correo electrónico">
                      Correo electrónico
                    </option>
                    <option value="Todas las anteriores">
                      Todas las anteriores
                    </option>
                  </select>
                </div>
                <div className="mb-2 flex justify-between items-center">
                  <label className="block font-semibold text-Acapulco mb-1">
                    Mensaje del bot
                  </label>
                  <span className="text-casal dark:text-gray-300 text-sm font-medium">
                    Grupo: Pagos completados
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    className="w-full border border-Acapulco rounded-lg p-4 text-gray-700 min-h-[180px] mb-2"
                    value={mensajeBot}
                    onChange={(e) => setMensajeBot(e.target.value)}
                    placeholder="Escribe el mensaje automático aquí..."
                  />
                  {/* Barra de herramientas */}
                  <div className="flex gap-2 mt-2">
                    <EmojiSelector
                      onEmojiSelect={(emoji) =>
                        setMensajeBot(mensajeBot + emoji)
                      }
                    />

                    <FileUploader
                      onFileSelect={handleFileSelect}
                      onAttachmentMenuToggle={setShowAttachmentMenu}
                      showAttachmentMenu={showAttachmentMenu}
                    />
                  </div>
                </div>
                {/* Vista previa de archivos */}
                {archivos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {archivos.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"
                      >
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        ) : (
                          <span className="text-xs">{file.name}</span>
                        )}
                        <button
                          className="text-red-500 ml-1"
                          onClick={() =>
                            setArchivos(archivos.filter((_, i) => i !== idx))
                          }
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Opciones adicionales */}
                <div className="flex flex-col gap-1 mt-4">
                  <label className="flex items-center gap-2 text-casal">
                    <input
                      type="checkbox"
                      checked={adjuntarImagen}
                      onChange={(e) => setAdjuntarImagen(e.target.checked)}
                    />
                    Adjuntar imagen
                  </label>
                  <label className="flex items-center gap-2 text-casal">
                    <input
                      type="checkbox"
                      checked={adjuntarDocumento}
                      onChange={(e) => setAdjuntarDocumento(e.target.checked)}
                    />
                    Adjuntar documento
                  </label>
                  <label className="flex items-center gap-2 text-casal">
                    <input
                      type="checkbox"
                      checked={incluirEnlace}
                      onChange={(e) => setIncluirEnlace(e.target.checked)}
                    />
                    Incluir enlace personalizado
                  </label>
                </div>
              </div>
            )}

            {pasoSeleccionado === 3 && (
              <div className="rounded-2xl p-6 shadow-sm border-2">
                <div className="flex justify-between">
                  <h3 className="text-xl font-semibold mb-4 text-casal">
                    Configuración de Paso 3
                  </h3>
                  <Button className="text-Acapulco dark:text-gray-500 px-2 py-2 rounded text-sm flex items-center gap-1 hover:bg-casal/80 hover:text-white">
                    <BookText className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-lg font-semibold text-Acapulco mb-2">
                  ¿Qué sucede si el usuario responde?
                </p>
                <select
                  className="w-full border border-Acapulco rounded-lg p-2 bg-Acapulco/10 text-casal mb-4"
                  value={respuestaSeleccionada}
                  onChange={(e) =>
                    setRespuestaSeleccionada(
                      Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      )
                    )
                  }
                >
                  {opcionesRespuesta.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>

                <div className="mb-4">
                  <label className="block text-Acapulco font-semibold mb-1">
                    Configuración
                  </label>
                  <div className="border border-Acapulco rounded-lg p-4 space-y-2">
                    {condiciones.map((cond, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked
                          readOnly
                          className="mt-1"
                        />
                        <span className="text-casal whitespace-pre-line">
                          {cond}
                        </span>
                      </div>
                    ))}
                  </div>
                
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edición de Variables */}
      <Dialog
        open={modalEdicion}
        onClose={() => setModalEdicion(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Editar Variables del Mensaje
              </h3>
              <Button
                onClick={() => setModalEdicion(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Usuario
                </label>
                <input
                  type="text"
                  value={configTemporal.nombreUsuario || ""}
                  onChange={(e) =>
                    actualizarVariable("nombreUsuario", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-casal focus:border-transparent"
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Evento
                </label>
                <input
                  type="text"
                  value={configTemporal.nombreEvento || ""}
                  onChange={(e) =>
                    actualizarVariable("nombreEvento", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-casal focus:border-transparent"
                  placeholder="Ej: Graduación ITESM 2025"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha y Hora
                  </label>
                  <input
                    type="text"
                    value={configTemporal.fechaHora || ""}
                    onChange={(e) =>
                      actualizarVariable("fechaHora", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-casal focus:border-transparent"
                    placeholder="Ej: 15 de Diciembre 2024, 7:00 PM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lugar
                  </label>
                  <input
                    type="text"
                    value={configTemporal.lugar || ""}
                    onChange={(e) =>
                      actualizarVariable("lugar", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-casal focus:border-transparent"
                    placeholder="Ej: Centro de Convenciones"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Precio
                  </label>
                  <input
                    type="text"
                    value={configTemporal.precio || ""}
                    onChange={(e) =>
                      actualizarVariable("precio", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-casal focus:border-transparent"
                    placeholder="Ej: $800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Enlace
                  </label>
                  <input
                    type="text"
                    value={configTemporal.enlaceGenerado || ""}
                    onChange={(e) =>
                      actualizarVariable("enlaceGenerado", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-casal focus:border-transparent"
                    placeholder="Ej: enlace de pago seguro"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vista Previa del Mensaje
              </label>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Hola (
                  <span className="text-casal font-medium">
                    {configTemporal.nombreUsuario || "Nombre Usuario"}
                  </span>
                  ), tu evento (
                  <span className="text-casal font-medium">
                    {configTemporal.nombreEvento || "nombre evento"}
                  </span>
                  ) se llevará a cabo el (
                  <span className="text-casal font-medium">
                    {configTemporal.fechaHora || "fecha y hora"}
                  </span>
                  ) en (
                  <span className="text-casal font-medium">
                    {configTemporal.lugar || "lugar"}
                  </span>
                  ). El precio del boleto es {configTemporal.precio || "$800"}{" "}
                  mxn por persona, para seleccionar tu mesa o asiento, primero
                  debes realizar tu pago oportuno, por medio de un{" "}
                  <span className="text-casal font-medium">
                    {configTemporal.enlaceGenerado || "enlace generado"}
                  </span>
                  , en breve te compartimos el enlace de pago. Cualquier duda o
                  consulta, estamos para ayudarte en este chat.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                onClick={() => setModalEdicion(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
              >
                Cancelar
              </Button>
              <Button
                onClick={guardarCambios}
                className="flex items-center gap-2 bg-casal hover:bg-casal/90 text-white px-6 py-2 rounded-lg font-medium"
              >
                <Check className="h-4 w-4" />
                Guardar Cambios
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
