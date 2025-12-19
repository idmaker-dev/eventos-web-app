import { Button, Dialog, DialogPanel } from "@headlessui/react";
import { useState, useEffect } from "react";
import TextF from "../../assets/campanas/icono crear.svg";

export default function CrearCamp({
  isOpen,
  onClose,
  onSuccess,
  tareaInicial,
}) {
  const [descripcion, setDescripcion] = useState(tareaInicial || "");
  const [title, setTitle] = useState("");
  const [error, setError] = useState(""); 

  useEffect(() => {
    if (tareaInicial) {
      setDescripcion(tareaInicial);
    }
  }, [tareaInicial]);

  const handleCrear = () => {
    if (!title.trim()) {
      setError("El nombre de la campaña es requerido.");
      return;
    }
    setError("");
    const nuevaCampana = {
      id: Date.now(),
      title: title.trim(),
      descripcion: descripcion.trim(),
      categoria: "pregunta-frecuente",
    };
    onSuccess(nuevaCampana);
    setTitle("");
    setDescripcion("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-casal/20 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center ">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border-2 border-Acapulco">
          <div className="flex">
            <div className="bg-casal min-h-full rounded-l-2xl w-32">
              <img src={TextF} alt="Crear Campaña" className="p-6" />
            </div>
            <div className="p-4 w-full">
              <div>
                <p className="text-2xl text-casal font-semibold">Crear Campaña</p>
              </div>
              <div>
                <label className="block mt-4 mb-2 text-sm font-bold text-Acapulco dark:text-gray-300">
                  Nombre de la campaña <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-1.5 text-gray-600 dark:text-gray-300 placeholder-gray-400 outline-1 border rounded-xl bg-transparent"
                  placeholder="Ingresa el nombre de la campaña"
                />
                {error && (
                  <p className="text-red-500 text-xs mt-1">{error}</p>
                )}
              </div>
              <div>
                <label className="block mt-4 mb-2 text-sm font-bold text-Acapulco dark:text-gray-300">
                  Descripción: <span className="font-medium"> (Opcional)</span>
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full h-24 p-3 text-gray-600  dark:text-gray-300 placeholder-gray-400  outline-1 border rounded-xl resize bg-transparent"
                  placeholder="Describe brevemente el objetivo de la campaña"
                />
              </div>
              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleCrear}
                  className="bg-casal text-xl font-semibold hover:bg-casal/90 text-white px-8 py-1.5 rounded-full transition-colors"
                >
                  Crear
                </Button>
              </div>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
