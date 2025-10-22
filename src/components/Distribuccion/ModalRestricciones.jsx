import React from "react";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@headlessui/react";

export default function ModalRestricciones({
  isOpen,
  onClose,
  invitado,
  mesaNumero,
  restricciones,
  setRestricciones,
  otra,
  setOtra,
  nombre,
  setNombre,
  onConfirm, // (payload) => void
}) {
  if (!isOpen) return null;

  const handleChange = (key, delta) =>
    setRestricciones((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta),
    }));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl shadow-lg overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <p className="text-lg font-semibold">Restricciones alimenticias</p>
            <p className="text-xs">Asignación a Mesa {mesaNumero}</p>
          </div>
          <Button onClick={onClose} className="text-gray-400 hover:text-gray-200 hover:border hover:bg-slate-500 rounded-lg p-1">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Nombre / Grupo</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-2 block w-full rounded-3xl border-2 px-3 py-2"
              placeholder={invitado?.nombre || "Nombre completo o familia"}
            />
            <p className="text-xs text-gray-500 mt-1">Cantidad: {invitado?.cantidad || 1} personas</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Restricciones alimenticias</label>
            <div className="p-4 border-2 rounded-2xl bg-white mt-2">
              {[
                { label: "Vegetariano", key: "vegetariano" },
                { label: "Vegano", key: "vegano" },
                { label: "Sin gluten", key: "sinGluten" },
                { label: "Alergia a marisco", key: "alergiaMarisco" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 font-medium w-40">{item.label}</span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full border text-gray-600 flex items-center justify-center hover:bg-gray-100"
                      onClick={() => handleChange(item.key, -1)}
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      className="w-8 h-8 rounded-full border text-gray-600 flex items-center justify-center hover:bg-gray-100"
                      onClick={() => handleChange(item.key, 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-gray-600 w-24 text-right">{restricciones[item.key] || 0} personas</span>
                </div>
              ))}

              <div className="mt-3 mb-1 text-gray-600 font-medium">Añadir una restricción específica</div>
              <input
                type="text"
                value={otra}
                onChange={(e) => setOtra(e.target.value)}
                placeholder="Tu Respuesta"
                className="mt-2 block w-full rounded-3xl border-2 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700 placeholder:italic focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button onClick={onClose} className="px-4 py-2 rounded-lg border bg-slate-200 text-gray-700 border-gray-300 hover:bg-slate-300">Cancelar</Button>
            <Button
              onClick={() =>
                onConfirm({
                  nombre: nombre || invitado?.nombre || "",
                  restricciones: { ...restricciones },
                  otra: (otra || "").trim(),
                })
              }
              className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600"
            >
              Guardar y asignar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}