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
import Confirmacion from "../../assets/recursos/confirmacionAsientos.svg";
import { useEventos } from "../../hooks/useEventos";

export default function Eventos({ open, onClose }) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    instituto: "",
    licenciatura: "",
    nombreEvento: "",
    lugarEvento: "",
    fechaHora: "",
    cantidadAsistentes: "",
    responsable: "",
  });

  // Hook de eventos
  const { crearEvento, isCreating, error, limpiarError } = useEventos();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar errores al escribir
    if (error) {
      limpiarError();
    }
  };

  const handleGuardar = async () => {
    // Crear el evento
    const resultado = await crearEvento(formData);
    
    if (resultado.success) {
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
      lugarEvento: "",
      fechaHora: "",
      cantidadAsistentes: "",
      responsable: "",
    });
    limpiarError();
    onClose();
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
                className="w-full max-w-md rounded-xl bg-white dark:bg-[#1a1a1a] p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
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
                    
                    <div className="mb-3">
                      <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300">
                        Nombre de la escuela o institución
                      </label>
                      <Input
                        value={formData.instituto}
                        onChange={(e) => handleInputChange('instituto', e.target.value)}
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
                        onChange={(e) => handleInputChange('licenciatura', e.target.value)}
                        placeholder="Ejemplo: Derecho, Medicina, Ingeniería en Sistemas"
                        className={clsx(
                          "mt-2 block w-full rounded-lg border border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                          "placeholder:italic",
                          "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
                        )}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300">
                        Nombre del evento
                      </label>
                      <Input
                        value={formData.nombreEvento}
                        onChange={(e) => handleInputChange('nombreEvento', e.target.value)}
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
                      <Input
                        value={formData.lugarEvento}
                        onChange={(e) => handleInputChange('lugarEvento', e.target.value)}
                        placeholder="Auditorio, sala, teatro, etc."
                        className={clsx(
                          "mt-2 block w-full rounded-lg border border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                          "placeholder:italic",
                          "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
                        )}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300">
                        Fecha y hora del evento
                      </label>
                      <Input
                        value={formData.fechaHora}
                        onChange={(e) => handleInputChange('fechaHora', e.target.value)}
                        placeholder="Ejemplo: 25 de junio, 18:00 hrs"
                        className={clsx(
                          "mt-2 block w-full rounded-lg border border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                          "placeholder:italic",
                          "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
                        )}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300">
                        Cantidad estimada de asistentes
                      </label>
                      <div className="relative">
                        <Select
                          value={formData.cantidadAsistentes}
                          onChange={(e) => handleInputChange('cantidadAsistentes', e.target.value)}
                          className={clsx(
                            "mt-2 block w-full appearance-none rounded-lg border border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                            "placeholder:italic",
                            "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25",
                            "*:text-black"
                          )}
                        >
                          <option value="">Seleccionar cantidad</option>
                          <option value="50">50 Asistentes</option>
                          <option value="100">100 Asistentes</option>
                          <option value="200">200 Asistentes</option>
                          <option value="300">300 Asistentes</option>
                          <option value="500">500 Asistentes</option>
                          <option value="1000">1000+ Asistentes</option>
                        </Select>
                        <ChevronDown
                          className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300">
                        Responsable o coordinador del evento
                      </label>
                      <Input
                        value={formData.responsable}
                        onChange={(e) => handleInputChange('responsable', e.target.value)}
                        placeholder="Ejemplo: Nombre y datos de contacto"
                        className={clsx(
                          "mt-2 block w-full rounded-lg border border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                          "placeholder:italic",
                          "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
                        )}
                      />
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
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      'Guardar'
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
                    className="inline-flex my-5 items-center justify-center gap-2 rounded-md bg-[#72B7A4] px-6 py-1.5 text-xl font-semibold text-white shadow-inner shadow-white/10"
                    onClick={handleClose}
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
