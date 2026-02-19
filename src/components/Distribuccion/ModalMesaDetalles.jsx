import React from "react";
import {
  Accessibility,
  Users,
  Utensils,
  X,
  Crown,
  User,
  ChefHat,
  CheckIcon,
} from "lucide-react";
import { Button } from "@headlessui/react";

export default function ModalMesaDetalles({
  isOpen,
  onClose,
  mesa,
  isUserMode = false,
}) {
  if (!isOpen || !mesa) return null;

  // ✅ Adaptador: Convertir datos del backend (disponibilidad) al formato legacy
  let assigned = mesa.assignedGuests || [];
  
  // Si hay disponibilidad del backend, convertir al formato esperado
  if (mesa.disponibilidad?.asientos_ocupados_ids && mesa.disponibilidad.asientos_ocupados_ids.length > 0) {
    const invitadoPrincipal = mesa.disponibilidad.invitados_asignados?.[0];
    
    // Convertir asientos_ocupados_ids al formato assignedGuests
    assigned = mesa.disponibilidad.asientos_ocupados_ids.map((asiento, index) => ({
      id: `asiento-${asiento.asiento_id}`,
      usuarioId: invitadoPrincipal?.invitado_id || 'unknown',
      nombreCompleto: asiento.nombre_comensal?.trim() || `Invitado ${asiento.asiento_numero}`,
      tipoMenu: asiento.tipo_menu || 'normal',
      restricciones: Array.isArray(asiento.restricciones_dieteticas) 
        ? asiento.restricciones_dieteticas.reduce((acc, r) => ({ ...acc, [r]: true }), {})
        : {},
      otraRestriccion: asiento.notas?.trim() || '',
      necesidadEspecial: false,
      necesidadesEspeciales: asiento.necesidades_especiales || asiento.necesidadesEspeciales || {
        requiereAccesibilidad: false,
        comentarios: ''
      },
      fechaAsignacion: new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      esResponsable: index === 0
    }));
  }

  // Agrupar personas por usuario responsable
  const gruposUsuarios = assigned.reduce((grupos, persona) => {
    const key = persona.usuarioId || persona.id;
    if (!grupos[key]) {
      grupos[key] = [];
    }
    grupos[key].push(persona);
    return grupos;
  }, {});

  const restrLabels = {
    vegetariano: { label: "Vegetariano", emoji: "🥗" },
    vegano: { label: "Vegano", emoji: "🌱" },
    sinGluten: { label: "Sin gluten", emoji: "🌾" },
    alergiaMarisco: { label: "Alergia a mariscos", emoji: "🦐" },
  };

  const tipoMenuLabels = {
    normal: {
      label: "Menú Normal",
      emoji: "🍽️",
      color: "bg-gray-100 text-gray-800",
    },
    infantil: {
      label: "Menú Infantil",
      emoji: "🧒",
      color: "bg-blue-100 text-blue-800",
    },
    especial: {
      label: "Menú Especial",
      emoji: "⭐",
      color: "bg-yellow-100 text-yellow-800",
    },
    celiaco: {
      label: "Menú Celíaco",
      emoji: "🌾",
      color: "bg-green-100 text-green-800",
    },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-4xl shadow-lg overflow-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b bg-fondoVs">
          <div>
            <h3 className="text-lg font-semibold">
              Mesa {mesa.numero} — Detalles
            </h3>
            <div className="text-sm text-gray-500 flex gap-4 items-center">
              <div className="flex gap-2 items-center">
                <Users className="w-4 h-4" />
                {mesa.disponibilidad?.asientos_ocupados || mesa.invitados || 0} / {mesa.capacidad} ocupados
              </div>
              {mesa.sillasEspeciales?.length > 0 && (
                <>
                  <div className="border-l h-4 border-gray-300" />
                  <div className="flex gap-2 items-center">
                    <Accessibility className="w-4 h-4" />
                    {mesa.sillasEspeciales.length} sillas especiales
                  </div>
                </>
              )}
            </div>
          </div>
          <Button
            onClick={onClose}
            className="text-gray-500 p-1 border bg-white rounded hover:text-red-100 hover:bg-red-600 hover:shadow-md"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información de sillas especiales */}
          {mesa.sillasEspeciales?.length > 0 && (
            <div className="p-4 border rounded-xl bg-slate-50">
              <div className="flex gap-3 items-center">
                <div className="bg-white rounded-xl p-2">
                  <Accessibility className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Sillas especiales</h4>
                  <p className="font-medium text-gray-600 text-sm">
                    Disponibles: {mesa.sillasEspeciales.length} • Usadas:{" "}
                    {assigned.filter((p) => p.necesidadEspecial).length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Lista de invitados por grupos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-semibold text-gray-800">
                Invitados Asignados
              </h4>
              <div className="bg-gray-200 rounded-full px-3 py-1 text-sm font-medium">
                {Object.keys(gruposUsuarios).length}{" "}
                {Object.keys(gruposUsuarios).length === 1
                  ? "reserva"
                  : "reservas"}{" "}
                • {assigned.length} personas
              </div>
            </div>

            {Object.keys(gruposUsuarios).length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No hay invitados asignados en esta mesa</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(gruposUsuarios).map(
                  ([usuarioId, personas], groupIndex) => {
                    const responsable =
                      personas.find((p) => p.esResponsable) || personas[0];
                    return (
                      <div
                        key={usuarioId}
                        className="border-2 border-gray-200 rounded-xl bg-white overflow-hidden"
                      >
                        {/* Header del grupo */}
                        <div className="bg-gray-50 px-6 py-4 border-b">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-casal text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                {groupIndex + 1}
                              </div>
                              <div>
                                <h5 className="font-bold text-gray-800 flex items-center gap-2">
                                  <Crown className="w-4 h-4 text-yellow-600" />
                                  Reserva de: {mesa.disponibilidad?.invitados_asignados?.[0]?.invitado_nombre || responsable.nombreCompleto}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {personas.length}{" "}
                                  {personas.length === 1
                                    ? "persona"
                                    : "personas"}{" "}
                                  • Asignado el {responsable.fechaAsignacion}
                                </p>
                              </div>
                            </div>
                            {(responsable.necesidadEspecial || responsable.necesidadesEspeciales?.requiereAccesibilidad) && (
                              <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full text-xs font-medium">
                                <Accessibility className="w-4 h-4" />
                                Requiere accesibilidad
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Lista de personas en este grupo */}
                        <div className="divide-y divide-gray-100">
                          {personas.map((persona, personaIndex) => (
                            <div key={persona.id} className="p-6">
                              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                                {/* Info básica */}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-gray-100 rounded-full p-1">
                                      <User className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <h6 className="font-semibold text-gray-800">
                                      {persona.nombreCompleto}
                                    </h6>
                                    {persona.esResponsable && (
                                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                        Responsable
                                      </span>
                                    )}
                                  </div>

                                  {/* Tipo de menú */}
                                  <div className="mb-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <ChefHat className="w-4 h-4 text-gray-500" />
                                      <span className="text-sm font-medium text-gray-700">
                                        Tipo de menú:
                                      </span>
                                    </div>
                                    <div
                                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                        tipoMenuLabels[persona.tipoMenu]
                                          ?.color || "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      <span>
                                        {tipoMenuLabels[persona.tipoMenu]
                                          ?.emoji || "🍽️"}
                                      </span>
                                      {tipoMenuLabels[persona.tipoMenu]
                                        ?.label || persona.tipoMenu}
                                    </div>
                                  </div>
                                </div>

                                {/* Restricciones alimenticias */}
                                <div className="flex-1 lg:max-w-md">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Utensils className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                      Restricciones:
                                    </span>
                                  </div>

                                  {persona.restricciones &&
                                  Object.keys(persona.restricciones).length >
                                    0 ? (
                                    <div className="space-y-2">
                                      {/* Restricciones estándar */}
                                      <div className="flex flex-wrap gap-2">
                                        {Object.entries(persona.restricciones)
                                          .filter(
                                            ([key, value]) => value === true
                                          )
                                          .map(([key]) => {
                                            const restriccion =
                                              restrLabels[key];
                                            if (!restriccion) return null;
                                            return (
                                              <span
                                                key={key}
                                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium"
                                              >
                                                <span>{restriccion.emoji}</span>
                                                {restriccion.label}
                                              </span>
                                            );
                                          })}
                                      </div>

                                      {/* Restricción adicional */}
                                      {persona.otraRestriccion && (
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                                          <p className="text-xs font-medium text-slate-600 mb-1">
                                            Restricción adicional:
                                          </p>
                                          <p className="text-sm text-slate-800">
                                            {persona.otraRestriccion}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-gray-400 text-sm bg-gray-50 rounded-lg p-2 text-center">
                                      Sin restricciones alimentarias
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Necesidades Especiales / Accesibilidad */}
                              {(persona.necesidadesEspeciales?.requiereAccesibilidad || persona.necesidadesEspeciales?.comentarios) && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="bg-blue-600 rounded-lg p-1.5">
                                        <Accessibility className="w-4 h-4 text-white" />
                                      </div>
                                      <h6 className="font-semibold text-blue-900 dark:text-blue-100">
                                        Necesidades Especiales
                                      </h6>
                                    </div>

                                    <div className="space-y-2">
                                      {persona.necesidadesEspeciales.requiereAccesibilidad && (
                                        <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg px-3 py-2">
                                          <CheckIcon className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                            ♿ Requiere silla de ruedas / accesibilidad
                                          </span>
                                        </div>
                                      )}

                                      {persona.necesidadesEspeciales.comentarios && (
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                                          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                                            💬 Comentarios adicionales:
                                          </p>
                                          <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {persona.necesidadesEspeciales.comentarios}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
        {/* Footer con resumen */}
        {assigned.length > 0 && (
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <strong>{assigned.length}</strong> personas total
              </div>
              <div className="flex items-center gap-1">
                <ChefHat className="w-4 h-4" />
                <strong>
                  {assigned.filter((p) => p.tipoMenu === "infantil").length}
                </strong>{" "}
                menús infantiles
              </div>
              <div className="flex items-center gap-1">
                <Utensils className="w-4 h-4" />
                <strong>
                  {
                    assigned.filter((p) =>
                      Object.values(p.restricciones || {}).some(Boolean)
                    ).length
                  }
                </strong>{" "}
                con restricciones
              </div>
              {mesa.sillasEspeciales?.length > 0 && (
                <div className="flex items-center gap-1">
                  <Accessibility className="w-4 h-4" />
                  <strong>
                    {assigned.filter((p) => p.necesidadEspecial).length}
                  </strong>{" "}
                  sillas especiales usadas
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
