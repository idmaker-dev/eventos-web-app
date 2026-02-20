import { Button, Dialog, DialogPanel } from "@headlessui/react";
import { useState, useEffect } from "react";
import TextF from "../../assets/campanas/icono crear.svg";
import useAutomatizaciones from "../../hooks/useAutomatizaciones";
import clsx from "clsx";

export default function CrearCamp({
  isOpen,
  onClose,
  onSuccess,
  tareaInicial,
}) {
  const [descripcion, setDescripcion] = useState(tareaInicial || "");
  const [title, setTitle] = useState("");
  const [tipo, setTipo] = useState("");
  const [idEvento, setIdEvento] = useState("");
  const [usarPlantilla, setUsarPlantilla] = useState(true);
  const [error, setError] = useState("");
  const [plantillasDisponibles, setPlantillasDisponibles] = useState([]);
  const [cargandoPlantillas, setCargandoPlantillas] = useState(false);

  const { crearAutomatizacion, obtenerPlantillas, loading } = useAutomatizaciones();

  // Cargar plantillas al abrir el modal
  useEffect(() => {
    if (isOpen && plantillasDisponibles.length === 0) {
      cargarPlantillas();
    }
  }, [isOpen]);

  const cargarPlantillas = async () => {
    setCargandoPlantillas(true);
    try {
      const plantillas = await obtenerPlantillas();
      setPlantillasDisponibles(plantillas);
      
      // Seleccionar primera plantilla por defecto si hay disponibles
      if (plantillas.length > 0 && !tipo) {
        setTipo(plantillas[0].tipo);
      }
    } catch (err) {
      console.error("Error al cargar plantillas:", err);
    } finally {
      setCargandoPlantillas(false);
    }
  };

  useEffect(() => {
    if (tareaInicial) {
      setDescripcion(tareaInicial);
    }
  }, [tareaInicial]);

  const handleCrear = async () => {
    if (!title.trim()) {
      setError("El nombre de la automatización es requerido.");
      return;
    }

    if (!tipo) {
      setError("Debe seleccionar un tipo de automatización.");
      return;
    }
    
    setError("");
    
    try {
      const datosAutomatizacion = {
        nombre: title.trim(),
        descripcion: descripcion.trim() || undefined,
        tipo: tipo,
        id_evento: idEvento.trim() || undefined,
        usar_plantilla: usarPlantilla,
      };

      const nuevaAutomatizacion = await crearAutomatizacion(datosAutomatizacion);
      
      onSuccess(nuevaAutomatizacion);
      
      // Limpiar formulario
      setTitle("");
      setDescripcion("");
      setIdEvento("");
      setUsarPlantilla(true);
      
      onClose();
    } catch (error) {
      setError(error.message || "Error al crear la automatización");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-casal/20 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border-2 border-Acapulco max-h-[90vh] overflow-y-auto">
          <div className="flex-col md:flex-row flex">
            <div className="bg-casal md:min-h-full md:rounded-l-2xl w-full md:w-32 flex-shrink-0">
              <img src={TextF} alt="Crear Automatización" className="p-6 mx-auto w-36 md:w-72" />
            </div>
            <div className="p-6 w-full">
              <div>
                <p className="text-2xl text-casal font-semibold">Crear Automatización</p>
              </div>

              {/* Nombre */}
              <div className="mt-4">
                <label className="block mb-2 text-sm font-bold text-Acapulco dark:text-gray-300">
                  Nombre de la automatización <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 text-gray-600 dark:text-gray-300 placeholder-gray-400 outline-1 border rounded-xl bg-transparent"
                  placeholder="Ej: Recordatorio de pago 3 días antes"
                />
                {error && (
                  <p className="text-red-500 text-xs mt-1">{error}</p>
                )}
              </div>

              {/* Tipo de automatización */}
              <div className="mt-4">
                <label className="block mb-2 text-sm font-bold text-Acapulco dark:text-gray-300">
                  Tipo de automatización <span className="text-red-500">*</span>
                </label>
                {cargandoPlantillas ? (
                  <div className="w-full p-2 text-gray-500 border rounded-xl bg-gray-50 dark:bg-[#2a2a2a]">
                    Cargando plantillas...
                  </div>
                ) : (
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full p-2 text-gray-600 dark:text-gray-300 border rounded-xl bg-white dark:bg-[#2a2a2a]"
                    disabled={plantillasDisponibles.length === 0}
                  >
                    {plantillasDisponibles.length === 0 && (
                      <option value="">Sin plantillas disponibles</option>
                    )}
                    {plantillasDisponibles.map((plantilla) => (
                      <option key={plantilla.tipo} value={plantilla.tipo}>
                        {plantilla.nombre}
                      </option>
                    ))}
                  </select>
                )}
                
                {/* Mostrar descripción de la plantilla seleccionada */}
                {tipo && plantillasDisponibles.length > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {plantillasDisponibles.find((p) => p.tipo === tipo)?.descripcion}
                    </p>
                  </div>
                )}
              </div>

              {/* ID de Evento (opcional) */}
              <div className="mt-4">
                <label className="block mb-2 text-sm font-bold text-Acapulco dark:text-gray-300">
                  ID del Evento <span className="font-medium text-xs">(Opcional)</span>
                </label>
                <input
                  type="text"
                  value={idEvento}
                  onChange={(e) => setIdEvento(e.target.value)}
                  className="w-full p-2 text-gray-600 dark:text-gray-300 placeholder-gray-400 outline-1 border rounded-xl bg-transparent"
                  placeholder="Deja vacío para aplicar a todos los eventos"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Si especificas un evento, la automatización solo aplicará a ese evento
                </p>
              </div>

              {/* Usar plantilla predefinida */}
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={usarPlantilla}
                    onChange={(e) => setUsarPlantilla(e.target.checked)}
                    className="w-4 h-4 text-casal border-gray-300 rounded focus:ring-casal"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                    Usar configuración predefinida de la plantilla
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                  {usarPlantilla 
                    ? "Se aplicarán valores por defecto. Podrás personalizarlos después."
                    : "Deberás configurar manualmente disparadores, acciones y condiciones."}
                </p>
              </div>

              {/* Descripción */}
              <div className="mt-4">
                <label className="block mb-2 text-sm font-bold text-Acapulco dark:text-gray-300">
                  Descripción <span className="font-medium text-xs">(Opcional)</span>
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full h-20 p-3 text-gray-600 dark:text-gray-300 placeholder-gray-400 outline-1 border rounded-xl resize-none bg-transparent"
                  placeholder="Describe brevemente el objetivo de esta automatización"
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCrear}
                  className={clsx(
                    "bg-casal text-lg font-semibold hover:bg-casal/90 text-white px-8 py-2 rounded-full transition-colors",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={loading}
                >
                  {loading ? "Creando..." : "Crear"}
                </Button>
              </div>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
