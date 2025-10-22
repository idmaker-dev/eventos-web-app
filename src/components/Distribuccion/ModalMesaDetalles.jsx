import React from "react";
import { Accessibility, Users, Utensils, X } from "lucide-react";
import { Button } from "@headlessui/react";

export default function ModalMesaDetalles({ isOpen, onClose, mesa }) {
  if (!isOpen || !mesa) return null;

  const assigned = mesa.assignedGuests || [];

  const restrLabels = {
    vegetariano: { label: "Vegetariano" },
    vegano: { label: "Vegano" },
    sinGluten: { label: "Sin gluten" },
    alergiaMarisco: { label: "Alergia a mariscos" },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl shadow-lg overflow-auto">
        <div className="flex items-center justify-between p-4 border-b bg-fondoVs">
          <div>
            <h3 className="text-lg font-semibold">
              Mesa {mesa.numero} — Detalles
            </h3>
            <div className="text-sm text-gray-500 flex gap-4 items-center">
              <div className="flex gap-2 items-center">
                <Users className="w-4 h-4" />
                {mesa.invitados || 0} / {mesa.capacidad} ocupados
              </div>
              {mesa.invitadosEspeciales ? (
                <>
                  <div className="border-2 border-l h-4 border-gray-300 rounded" />
                  <div className="flex gap-2 items-center">
                    <Accessibility className="w-4 h-4" />
                    {mesa.invitadosEspeciales
                      ? ` Sillas especiales usadas: ${mesa.invitadosEspeciales}`
                      : ""}
                  </div>
                </>
              ) : null}
            </div>
          </div>
          <Button
            onClick={onClose}
            className="text-gray-500 p-1 border bg-white rounded hover:text-red-100 hover:bg-red-600 hover:shadow-md"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div className="p-3 border rounded-xl bg-slate-50">
            {mesa.sillasEspeciales && mesa.sillasEspeciales.length > 0 ? (
              <>
                <div className="flex gap-3 items-center">
                  <div className="bg-white rounded-xl p-2">
                    <Accessibility className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className=" ">
                    <h4 className="font-bold text-gray-900">
                      Sillas especiales
                    </h4>
                    <p className="font-medium text-gray-600 text-sm">
                      Disponibles: {mesa.sillasEspeciales.length} • Usadas:{" "}
                      {mesa.invitadosEspeciales || 0}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 text-center">
                No tiene sillas especiales
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center mb-4">
              <h4 className="font-semibold me-3 text-gray-800">
                Invitados asignados
              </h4>
              <div className="bg-gray-200 rounded-full p-1 w-5 h-5 text-xs flex justify-center items-center">
                {assigned.length}
              </div>
            </div>
            {assigned.length === 0 ? (
              <div className="text-sm text-gray-500 bg-gray-100 rounded-xl p-4 text-center">
                No hay invitados asignados en esta mesa.
              </div>
            ) : (
              <ul className="space-y-3">
                {assigned.map((g) => (
                  <li
                    key={g.id}
                    className="py-3 px-5 border rounded-xl bg-slate-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex gap-3 items-center">
                          <div className="font-bold"> {g.nombre}</div>
                          {g.necesidadEspecial && (
                            <div className="text-xs text-gray-600 px-3 py-0.5  border rounded-xl bg-white flex items-center gap-1">
                              <Accessibility className="inline-block w-3 h-3" />
                              Silla especial
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <Users className="inline-block mr-1 w-4 h-4" />{" "}
                          Cantidad: {g.cantidad}
                        </div>
                      </div>
                      <div className="text-sm text-right">
                        <div className="flex gap-1 items-center text-gray-600 text-muted-foreground">
                          <Utensils className="inline-block mr-1 w-4 h-4" />
                          Restricciones alimenticias:
                        </div>
                        {g.restricciones &&
                        Object.keys(g.restricciones).length > 0 ? (
                          <div className="flex flex-wrap justify-end gap-2">
                             {Object.entries(g.restricciones)
                              .filter(([, v]) => v > 0)
                              .map(([k, v]) => {
                                const meta = restrLabels[k] || { label: k, icon: "🍽" };
                                return (
                                  <span
                                    key={k}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs"
                                  >
                                    <span className="font-medium">{meta.label}</span>
                                    <span className="ml-2 bg-amber-100 text-amber-800 px-2 rounded-full text-xs">{v}</span>
                                  </span>
                                );
                              })}

                            {g.otra && (
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border text-slate-700 text-xs">
                                <span className="font-medium">Otra:</span>
                                <span>{g.otra}</span>
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400">Sin restricciones</div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
