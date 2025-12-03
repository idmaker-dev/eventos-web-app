import React, { useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Field,
  Input,
  Select,
} from "@headlessui/react";
import { ChevronDown, CircleX } from "lucide-react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import Confirmacion from "../../assets/recursos/confirmacionAsientos.svg";
import { useSelectedEvent } from "../../contexts/SelectedEventContext";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "../../styles/components/Custom.css";
import DateTimePicker from "../ui/DateTimePicker";
import { es } from "react-day-picker/locale";

export default function Eventos({ open, onClose }) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [isLoadingLugares, setIsLoadingLugares] = useState(false);
  const [formData, setFormData] = useState({
    instituto: "",
    licenciatura: "",
    nombreEvento: "",
    lugar_id: "",
    fechaHora: "",
    cantidadAsistentes: "",
    responsable: "",
    costo: "",
    fechas: [],
    requeridos: false,
  });

  // Hook de eventos desde el contexto (incluye cargarEventos)
  const { crearEvento, isCreating, error, limpiarError, cargarEventos } =
    useSelectedEvent();
  const navigate = useNavigate();

  // Cargar lugares cuando se abre el modal
  React.useEffect(() => {
    const cargarLugares = async () => {
      if (open) {
        setIsLoadingLugares(true);
        try {
          const eventService = (await import("../../services/eventService"))
            .default;
          const resultado = await eventService.getLugares();

          if (resultado.success) {
            setLugares(resultado.data);
          } else {
            console.error("❌ Error al cargar lugares:", resultado.error);
          }
        } catch (error) {
          console.error("❌ Error inesperado al cargar lugares:", error);
        } finally {
          setIsLoadingLugares(false);
        }
      }
    };

    cargarLugares();
  }, [open]);

  const handleInputChange = (field, value) => {
    console.log(field, value);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar errores al escribir
    if (error) {
      limpiarError();
    }
  };

  const handleGuardar = async () => {
    // Crear el evento
    formData.fechas = selectedDates.map(
      (date) => date.toISOString().split("T")[0]
    ); // Convertir a formato YYYY-MM-DD
    formData.requeridos = !!formData.requeridos; 
    const resultado = await crearEvento(formData);

    if (resultado.success) {
      // Recargar la lista de eventos para actualizar el select
      await cargarEventos();
      setShowConfirmation(true);
    }
    // Si hay error, se mostrará automáticamente en el UI
  };

  const handleClose = () => {
    setShowConfirmation(false);
    setFormData({
      instituto: "",
      licenciatura: "",
      nombreEvento: "",
      lugar_id: "",
      fechaHora: "",
      cantidadAsistentes: "",
      responsable: "",
      costo: "",
      fechas: [],
    });
    setSelectedDates([]);
    limpiarError();
    onClose();
  };

  const handleGenerarCuestionario = () => {
    handleClose();
    navigate("/admin/chat");
  };
  return (
    <Dialog
      open={open}
      as="div"
      className="relative z-50 focus:outline-none"
      onClose={onClose}
    >
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-[#2a9d8f]/20  transition-opacity"
          aria-hidden="true"
        />
        <div className="">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Formulario */}
            {!showConfirmation ? (
              <DialogPanel
                transition
                className={clsx(
                  "w-full max-w-2xl rounded-xl bg-white dark:bg-[#1a1a1a] p-6 backdrop-blur-2xl duration-300 ease-out",
                  "max-h-[95vh] overflow-y-auto" // <-- agrega esto
                )}
              >
                <DialogTitle className="text-2xl font-semibold text-[#246370] dark:text-[#2a9d8f]">
                  Crear evento
                </DialogTitle>
                <DialogTitle className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-4">
                  Completa los datos y comienza la organización de tu evento
                </DialogTitle>
                <div>
                  <Field>
                    {/* Error general */}
                    {error && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                      <div className="mb-3">
                        <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300">
                          Nombre de la escuela o institución
                        </label>
                        <Input
                          value={formData.instituto}
                          onChange={(e) =>
                            handleInputChange("instituto", e.target.value)
                          }
                          placeholder="Ejemplo: Universidad Nacional, instituto Tecnológico de Monterrey ..."
                          className={clsx(
                            "mt-2 block w-full rounded-lg border border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                            "placeholder:italic",
                            "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
                          )}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300">
                          Licenciatura o especialidad
                        </label>
                        <Input
                          value={formData.licenciatura}
                          onChange={(e) =>
                            handleInputChange("licenciatura", e.target.value)
                          }
                          placeholder="Ejemplo: Derecho, Medicina, Ingeniería en Sistemas"
                          className={clsx(
                            "mt-2 block w-full rounded-lg border border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                            "placeholder:italic",
                            "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
                          )}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="mb-3">
                        <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300">
                          Nombre del evento
                        </label>
                        <Input
                          value={formData.nombreEvento}
                          onChange={(e) =>
                            handleInputChange("nombreEvento", e.target.value)
                          }
                          placeholder="Ejemplo: Ceremonia de Graduación, Gala de Fin de Cursos"
                          className={clsx(
                            "mt-2 block w-full rounded-lg border border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                            "placeholder:italic",
                            "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
                          )}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300">
                          Lugar del evento
                        </label>
                        <div className="relative">
                          <Select
                            value={formData.lugar_id}
                            onChange={(e) =>
                              handleInputChange("lugar_id", e.target.value)
                            }
                            disabled={isLoadingLugares}
                            className={clsx(
                              "mt-2 block w-full appearance-none rounded-lg border border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                              "placeholder:italic",
                              "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25",
                              "*:text-black",
                              "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                          >
                            <option value="">
                              {isLoadingLugares
                                ? "Cargando lugares..."
                                : "Seleccionar lugar"}
                            </option>
                            {lugares.map((lugar) => (
                              <option key={lugar.id} value={lugar.id}>
                                {lugar.nombre}
                              </option>
                            ))}
                          </Select>
                          <ChevronDown
                            className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="mb-3">
                        <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300">
                          Fecha y hora del evento
                        </label>
                        <DateTimePicker
                          value={formData.fechaHora}
                          onChange={(value) =>
                            handleInputChange("fechaHora", value)
                          }
                          placeholder="Seleccionar fecha y hora del evento"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300">
                          Cantidad estimada de asistentes
                        </label>
                        <Input
                          type="number"
                          value={formData.cantidadAsistentes}
                          onChange={(e) =>
                            handleInputChange(
                              "cantidadAsistentes",
                              e.target.value
                            )
                          }
                          placeholder="Ejemplo: 150, 300, 500..."
                          min="1"
                          max="10000"
                          className={clsx(
                            "mt-2 block w-full rounded-lg border border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                            "placeholder:italic",
                            "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
                          )}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="mb-3">
                        <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300">
                          Responsable o coordinador del evento
                        </label>
                        <Input
                          value={formData.responsable}
                          onChange={(e) =>
                            handleInputChange("responsable", e.target.value)
                          }
                          placeholder="Ejemplo: Nombre y datos de contacto"
                          className={clsx(
                            "mt-2 block w-full rounded-lg border border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                            "placeholder:italic",
                            "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
                          )}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300">
                          Precio
                        </label>
                        <Input
                          value={formData.costo}
                          onChange={(e) =>
                            handleInputChange("costo", e.target.value)
                          }
                          placeholder="Ejemplo: Gratuito, $500 por persona, etc."
                          className={clsx(
                            "mt-2 block w-full rounded-lg border border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                            "placeholder:italic",
                            "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
                          )}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="px-4 py-2 border-2 rounded-2xl bg-white dark:bg-[#23272f] border-[#bcd6e4]">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!formData.requeridos}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                requeridos: e.target.checked, // <-- boolean
                              }))
                            }
                            className="mt-1 w-5 h-5 text-casal border-gray-300 rounded focus:ring-casal"
                          />
                          <span className="text-sm/6 text-casal italic dark:text-gray-300">
                            ¿Requiere datos del tutor o responsable?
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="">
                      {/* Calendario se debe seleccionar un string de fechas */}
                      <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300">
                        Fechas de pago
                      </label>
                      <div className="flex gap-6">
                        {/* Calendario visual para seleccionar varias fechas */}
                        <div className="">
                          <DayPicker
                            mode="multiple"
                            locale={es}
                            selected={selectedDates}
                            onSelect={setSelectedDates}
                            className="my-2 border h-auto rounded-lg p-2 mt-2 bg-white dark:bg-[#23272f] text-[#246370] dark:text-[#bcd6e4] [&_.rdp-nav_button]:text-[#246370] [&_.rdp-nav_button:hover]:bg-[#e0f7fa] [&_.rdp-nav_button:hover]:text-[#2a9d8f]"
                            modifiersClassNames={{
                              selected: "my-selected",
                              today: "my-today",
                            }}
                            style={{
                              caption: { color: "#43a047", fontWeight: "bold" }, // Verde
                              head_cell: {
                                color: "#43a047",
                                fontWeight: "bold",
                              }, // Verde
                            }}
                          />
                        </div>
                        {/* Mostrar las fechas seleccionadas */}
                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                          {selectedDates && selectedDates.length > 0
                            ? selectedDates.map((date, idx) =>
                                date ? (
                                  <div
                                    key={idx}
                                    className=" w-full font-semibold mb-1 py-1 px-5 bg-[#246370]/80 dark:bg-[#2a9d8f] text-white rounded-lg w-fit"
                                  >
                                    fecha:{" "}
                                    {date.toLocaleDateString("es-MX", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })}
                                  </div>
                                ) : null
                              )
                            : "No hay fechas seleccionadas"}
                        </div>
                      </div>
                    </div>
                  </Field>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    className="inline-flex items-center gap-2 rounded-md bg-[#CBCBCB] dark:bg-[#808080] px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 disabled:opacity-50"
                    onClick={handleClose}
                    disabled={isCreating}
                  >
                    Cancelar
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-md bg-[#72B7A4] px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleGuardar}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      "Guardar"
                    )}
                  </button>
                </div>
              </DialogPanel>
            ) : (
              <DialogPanel
                transition
                className="w-full max-w-md space-y-9 rounded-xl bg-white dark:bg-[#1a1a1a] p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
              >
                <div className="flex justify-end">
                  <button
                    className="text-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={handleClose}
                    aria-label="Close"
                  >
                    <CircleX size={28} />
                  </button>
                </div>
                <div className="flex justify-center mb-4">
                  <img
                    className="w-40"
                    src={Confirmacion}
                    alt="Evento creado"
                  />
                </div>
                <DialogTitle className="text-3xl font-semibold text-center text-[#246370] dark:text-[#2a9d8f]">
                  ¡Evento creado <br /> con exitosamente!
                </DialogTitle>
                <div className="mt-4 flex justify-center text-center">
                  <p className="text-base text-gray-800 font-semibold dark:text-gray-300">
                    Ya puede empezar a personalizar <br /> tus eventos y
                    compartir la información <br /> con los asistentes.
                  </p>
                </div>
                <div className="flex justify-center">
                  <button
                    className="inline-flex my-5 items-center justify-center gap-2 rounded-md bg-[#72B7A4] px-6 py-1.5 text-xl font-semibold text-white shadow-inner shadow-white/10 hover:bg-[#5fa090] transition-colors"
                    onClick={handleGenerarCuestionario}
                  >
                    Generar enlace <br /> de cuestionario
                  </button>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-medium text-center">
                    Accede al panel de administración para completar la
                    información y <br /> habilitar funciones como boletos,
                    asientos y recordatorios.
                  </p>
                </div>
              </DialogPanel>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
