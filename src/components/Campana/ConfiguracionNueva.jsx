import React, { useState, useEffect } from "react";
import { ChevronLeft, Check, AlertCircle, CircleCheckBig, MoreHorizontal } from "lucide-react";
import { Button } from "@headlessui/react";
import useAutomatizaciones from "../../hooks/useAutomatizaciones";
import clsx from "clsx";

export default function ConfiguracionNueva({ campana, onVolver }) {
  const { actualizarAutomatizacion, loading } = useAutomatizaciones();

  // Estado para los 4 paneles de configuración
  const [panelActual, setPanelActual] = useState(1);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  // Función para verificar si cada paso está completado
  const verificarPasoCompletado = (pasoId) => {
    switch (pasoId) {
      case 1: // Disparador
        if (disparador.tipo === "evento") {
          return !!disparador.evento_tipo;
        }
        if (disparador.tipo === "programado") {
          return !!disparador.cron;
        }
        if (disparador.tipo === "fecha_relativa") {
          return disparador.dias_antes_vencimiento > 0;
        }
        return false;

      case 2: // Filtros
        // Los filtros siempre tienen valores por defecto, consideramos completado si tiene id_evento
        return !!filtros.id_evento;

      case 3: // Acciones
        const accionesActivas = acciones.filter(a => a.activa);
        if (accionesActivas.length === 0) return false;
        // Verificar que cada acción activa tenga configuración completa
        return accionesActivas.every(accion => {
          if (accion.tipo === "whatsapp") {
            return !!accion.mensaje;
          }
          if (accion.tipo === "email") {
            return !!accion.asunto && !!accion.plantilla;
          }
          if (accion.tipo === "signalr") {
            return !!accion.evento && !!accion.datos;
          }
          return false;
        });

      case 4: // Frecuencia
        if (frecuencia.tipo === "recurrente") {
          return frecuencia.intervalo_horas > 0 && frecuencia.max_envios > 0;
        }
        return true; // unica y continua siempre válidas

      default:
        return false;
    }
  };

  // Pasos visuales para el sidebar con estado dinámico
  const pasos = [
    { id: 1, titulo: "Disparador", descripcion: "Define cuándo se ejecuta", completado: verificarPasoCompletado(1) },
    { id: 2, titulo: "Filtros", descripcion: "Selecciona destinatarios", completado: verificarPasoCompletado(2) },
    { id: 3, titulo: "Acciones", descripcion: "Qué se ejecutará", completado: verificarPasoCompletado(3) },
    { id: 4, titulo: "Frecuencia", descripcion: "Con qué frecuencia", completado: verificarPasoCompletado(4) },
  ];

  // Panel 1: Disparador
  const [disparador, setDisparador] = useState({
    tipo: "evento", // evento | programado | fecha_relativa
    evento_tipo: "",
    cron: "",
    dias_antes_vencimiento: 3,
  });

  // Panel 2: Filtros de destinatarios
  const [filtros, setFiltros] = useState({
    tiene_telefono: true,
    estado_deuda: [],
    turno_confirmado: null,
    mesa_seleccionada: null,
    id_evento: "",
  });

  // Panel 3: Acciones
  const [acciones, setAcciones] = useState([
    {
      tipo: "whatsapp",
      plantilla: "",
      mensaje: "",
      activa: true,
    },
  ]);

  // Panel 4: Frecuencia
  const [frecuencia, setFrecuencia] = useState({
    tipo: "unica", // unica | recurrente | continua
    intervalo_horas: 24,
    max_envios: 3,
  });

  // Cargar datos existentes de la automatización
  useEffect(() => {
    if (campana) {
      if (campana.disparador) {
        setDisparador(campana.disparador);
      }
      if (campana.filtros_destinatarios) {
        setFiltros(campana.filtros_destinatarios);
      }
      if (campana.acciones) {
        setAcciones(campana.acciones);
      }
      if (campana.frecuencia) {
        setFrecuencia(campana.frecuencia);
      }
    }
  }, [campana]);

  // Validar configuración antes de guardar
  const validarConfiguracion = () => {
    const nuevosErrores = {};

    // Validar disparador
    if (disparador.tipo === "evento" && !disparador.evento_tipo) {
      nuevosErrores.disparador = "Debe seleccionar un tipo de evento";
    }
    if (disparador.tipo === "programado" && !disparador.cron) {
      nuevosErrores.disparador = "Debe especificar una expresión cron";
    }
    if (disparador.tipo === "fecha_relativa" && !disparador.dias_antes_vencimiento) {
      nuevosErrores.disparador = "Debe especificar días antes del vencimiento";
    }

    // Validar acciones
    const accionesActivas = acciones.filter(a => a.activa);
    if (accionesActivas.length === 0) {
      nuevosErrores.acciones = "Debe haber al menos una acción activa";
    }
    
    accionesActivas.forEach((accion, idx) => {
      if (accion.tipo === "whatsapp" && !accion.mensaje) {
        nuevosErrores[`accion_${idx}`] = "El mensaje de WhatsApp no puede estar vacío";
      }
      if (accion.tipo === "email" && (!accion.asunto || !accion.plantilla)) {
        nuevosErrores[`accion_${idx}`] = "El email debe tener asunto y plantilla";
      }
    });

    // Validar frecuencia
    if (frecuencia.tipo === "recurrente") {
      if (!frecuencia.intervalo_horas || frecuencia.intervalo_horas < 1) {
        nuevosErrores.frecuencia = "El intervalo debe ser al menos 1 hora";
      }
      if (!frecuencia.max_envios || frecuencia.max_envios < 1) {
        nuevosErrores.frecuencia = "El máximo de envíos debe ser al menos 1";
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Guardar configuración
  const handleGuardar = async () => {
    if (!validarConfiguracion()) {
      alert("Por favor corrige los errores antes de guardar");
      return;
    }

    setGuardando(true);
    try {
      await actualizarAutomatizacion(campana.id, {
        disparador,
        filtros_destinatarios: filtros,
        acciones,
        frecuencia,
      });
      
      alert("Configuración guardada exitosamente");
      onVolver();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar la configuración");
    } finally {
      setGuardando(false);
    }
  };

  // Activar/Desactivar automatización
  const handleToggleActivo = async () => {
    // Verificar que todos los pasos estén completados antes de activar
    const todosCompletados = pasos.every(p => p.completado);
    
    if (!campana.activa && !todosCompletados) {
      alert("Debes completar todos los pasos antes de activar la automatización");
      return;
    }

    setGuardando(true);
    try {
      await actualizarAutomatizacion(campana.id, {
        activa: !campana.activa,
        disparador,
        filtros_destinatarios: filtros,
        acciones,
        frecuencia,
      });
      
      alert(`Automatización ${!campana.activa ? "activada" : "desactivada"} exitosamente`);
      onVolver();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert(error.message || "Error al cambiar el estado de la automatización");
    } finally {
      setGuardando(false);
    }
  };

  // Navegación entre paneles
  const siguientePanelnext = () => {
    if (panelActual < 4) {
      setPanelActual(panelActual + 1);
    }
  };

  const panelAnterior = () => {
    if (panelActual > 1) {
      setPanelActual(panelActual - 1);
    }
  };

  const irAPanel = (numero) => {
    setPanelActual(numero);
  };

  return (
    <div className="min-h-screen border rounded-3xl p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
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
                Configuración: {campana?.nombre}
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
                    <div className="hidden sm:block">
                      {index < pasos.length - 1 && (
                        <div className="absolute left-1/2 top-14 w-1 h-5 bg-Acapulco"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex-1 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 flex items-center justify-between cursor-pointer ${
                          panelActual === paso.id
                            ? "ring-2 ring-casal"
                            : ""
                        }`}
                        onClick={() => irAPanel(paso.id)}
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
                                : "font-medium text-gray-700 dark:text-gray-300"
                            }
                          >
                            {paso.titulo}
                          </span>
                        </div>
                        <Button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Botones de acción */}
            <div className="justify-center flex mt-8">
              <div className="flex gap-4 p-3 bg-white dark:bg-[#2a2a2a] rounded-full shadow-md">
                <Button 
                  onClick={handleGuardar}
                  disabled={guardando || loading}
                  className={clsx(
                    "bg-casal hover:bg-casal/90 text-white px-6 py-2 rounded-3xl font-medium",
                    (guardando || loading) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </Button>
                <Button 
                  onClick={handleToggleActivo}
                  disabled={guardando || loading}
                  className={clsx(
                    "flex items-center gap-2 rounded-3xl px-6 py-2",
                    campana?.activa 
                      ? "bg-red-500 hover:bg-red-600 text-white" 
                      : "bg-green-500 hover:bg-green-600 text-white",
                    (guardando || loading) && "opacity-50 cursor-not-allowed"
                  )}
                >
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
                  {campana?.activa ? "Desactivar" : "Activar"}
                </Button>
              </div>
            </div>
          </div>

          {/* Panel Derecho - Configuración */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border-2">
              {/* Errores de validación */}
              {Object.keys(errores).length > 0 && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">Errores de validación:</span>
                  </div>
                  <ul className="mt-2 ml-7 list-disc text-sm text-red-700 dark:text-red-400">
                    {Object.values(errores).map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contenido de paneles */}
              <div className="min-h-[500px]">
                {panelActual === 1 && (
                  <PanelDisparador
                    disparador={disparador}
                    setDisparador={setDisparador}
                    error={errores.disparador}
                  />
                )}
                {panelActual === 2 && (
                  <PanelFiltros
                    filtros={filtros}
                    setFiltros={setFiltros}
                  />
                )}
                {panelActual === 3 && (
                  <PanelAcciones
                    acciones={acciones}
                    setAcciones={setAcciones}
                    errores={errores}
                  />
                )}
                {panelActual === 4 && (
                  <PanelFrecuencia
                    frecuencia={frecuencia}
                    setFrecuencia={setFrecuencia}
                    error={errores.frecuencia}
                  />
                )}
              </div>

              {/* Navegación entre paneles */}
              <div className="flex justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={panelAnterior}
                  disabled={panelActual === 1}
                  className={clsx(
                    "px-6 py-2 rounded-full font-semibold transition-colors",
                    panelActual === 1
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  )}
                >
                  ← Anterior
                </Button>
                <Button
                  onClick={siguientePanelnext}
                  disabled={panelActual === 4}
                  className={clsx(
                    "px-6 py-2 rounded-full font-semibold transition-colors",
                    panelActual === 4
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-casal hover:bg-casal/90 text-white"
                  )}
                >
                  Siguiente →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== PANEL 1: DISPARADOR ==========
function PanelDisparador({ disparador, setDisparador, error }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-casal mb-4">
        1. Configurar Disparador
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Define cuándo se debe ejecutar esta automatización
      </p>

      {/* Tipo de disparador */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Tipo de disparador
        </label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "evento", label: "Evento en tiempo real", desc: "Se dispara cuando ocurre un evento específico" },
            { value: "programado", label: "Programado (Cron)", desc: "Se ejecuta en horarios específicos" },
            { value: "fecha_relativa", label: "Fecha relativa", desc: "Días antes de un vencimiento" },
          ].map((tipo) => (
            <button
              key={tipo.value}
              onClick={() => setDisparador({ ...disparador, tipo: tipo.value })}
              className={clsx(
                "p-4 rounded-lg border-2 text-left transition-all",
                disparador.tipo === tipo.value
                  ? "border-casal bg-casal/10"
                  : "border-gray-300 dark:border-gray-600 hover:border-casal/50"
              )}
            >
              <div className="font-semibold text-gray-800 dark:text-gray-200">
                {tipo.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {tipo.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuración específica según tipo */}
      {disparador.tipo === "evento" && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Tipo de evento
          </label>
          <select
            value={disparador.evento_tipo}
            onChange={(e) =>
              setDisparador({ ...disparador, evento_tipo: e.target.value })
            }
            className="w-full p-3 border rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300"
          >
            <option value="">Selecciona un evento...</option>
            <option value="invitado_creado">Invitado Creado</option>
            <option value="invitado_actualizado">Invitado Actualizado</option>
            <option value="pago_completado">Pago Completado</option>
            <option value="pago_parcial">Pago Parcial</option>
            <option value="deuda_vencida">Deuda Vencida</option>
            <option value="turno_asignado">Turno Asignado</option>
            <option value="turno_confirmado">Turno Confirmado</option>
            <option value="mesa_seleccionada">Mesa Seleccionada</option>
          </select>
        </div>
      )}

      {disparador.tipo === "programado" && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Expresión Cron
          </label>
          <input
            type="text"
            value={disparador.cron}
            onChange={(e) =>
              setDisparador({ ...disparador, cron: e.target.value })
            }
            placeholder="Ej: 0 0 10 * * * (Diario a las 10 AM)"
            className="w-full p-3 border rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Formato: segundo minuto hora día mes día-semana
          </p>
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold mb-2">
              Ejemplos:
            </p>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>• <code>0 */15 * * * *</code> - Cada 15 minutos</li>
              <li>• <code>0 0 10 * * *</code> - Todos los días a las 10 AM</li>
              <li>• <code>0 0 9 * * 1</code> - Todos los lunes a las 9 AM</li>
            </ul>
          </div>
        </div>
      )}

      {disparador.tipo === "fecha_relativa" && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Días antes del vencimiento
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={disparador.dias_antes_vencimiento}
            onChange={(e) =>
              setDisparador({
                ...disparador,
                dias_antes_vencimiento: parseInt(e.target.value),
              })
            }
            className="w-full p-3 border rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            La automatización se ejecutará X días antes de que venza una deuda
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

// ========== PANEL 2: FILTROS ==========
function PanelFiltros({ filtros, setFiltros }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-casal mb-4">
        2. Filtros de Destinatarios
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Define qué usuarios recibirán esta automatización
      </p>

      {/* Tiene teléfono */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filtros.tiene_telefono}
            onChange={(e) =>
              setFiltros({ ...filtros, tiene_telefono: e.target.checked })
            }
            className="w-5 h-5 text-casal border-gray-300 rounded focus:ring-casal"
          />
          <span className="ml-3 text-gray-700 dark:text-gray-300 font-medium">
            Solo usuarios con teléfono registrado
          </span>
        </label>
      </div>

      {/* ID de Evento */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          ID del Evento (Opcional)
        </label>
        <input
          type="text"
          value={filtros.id_evento || ""}
          onChange={(e) => setFiltros({ ...filtros, id_evento: e.target.value })}
          placeholder="Deja vacío para todos los eventos"
          className="w-full p-3 border rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300"
        />
      </div>

      {/* Estado de Deuda */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Estado de Deuda
        </label>
        <div className="space-y-2">
          {["PENDIENTE", "PAGADA", "VENCIDA", "PARCIAL"].map((estado) => (
            <label key={estado} className="flex items-center">
              <input
                type="checkbox"
                checked={filtros.estado_deuda?.includes(estado)}
                onChange={(e) => {
                  const nuevosEstados = e.target.checked
                    ? [...(filtros.estado_deuda || []), estado]
                    : (filtros.estado_deuda || []).filter((e) => e !== estado);
                  setFiltros({ ...filtros, estado_deuda: nuevosEstados });
                }}
                className="w-4 h-4 text-casal border-gray-300 rounded focus:ring-casal"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                {estado}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Turno Confirmado */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Turno Confirmado
        </label>
        <div className="flex gap-4">
          {[
            { value: null, label: "Ambos" },
            { value: true, label: "Sí" },
            { value: false, label: "No" },
          ].map((opcion) => (
            <button
              key={String(opcion.value)}
              onClick={() =>
                setFiltros({ ...filtros, turno_confirmado: opcion.value })
              }
              className={clsx(
                "flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all",
                filtros.turno_confirmado === opcion.value
                  ? "border-casal bg-casal text-white"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-casal/50"
              )}
            >
              {opcion.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mesa Seleccionada */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Mesa Seleccionada
        </label>
        <div className="flex gap-4">
          {[
            { value: null, label: "Ambos" },
            { value: true, label: "Sí" },
            { value: false, label: "No" },
          ].map((opcion) => (
            <button
              key={String(opcion.value)}
              onClick={() =>
                setFiltros({ ...filtros, mesa_seleccionada: opcion.value })
              }
              className={clsx(
                "flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all",
                filtros.mesa_seleccionada === opcion.value
                  ? "border-casal bg-casal text-white"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-casal/50"
              )}
            >
              {opcion.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== PANEL 3: ACCIONES ==========
function PanelAcciones({ acciones, setAcciones, errores }) {
  const agregarAccion = (tipo) => {
    const nuevaAccion = {
      tipo,
      plantilla: "",
      mensaje: "",
      asunto: "",
      activa: true,
    };
    setAcciones([...acciones, nuevaAccion]);
  };

  const eliminarAccion = (index) => {
    setAcciones(acciones.filter((_, i) => i !== index));
  };

  const actualizarAccion = (index, campo, valor) => {
    const nuevasAcciones = [...acciones];
    nuevasAcciones[index] = { ...nuevasAcciones[index], [campo]: valor };
    setAcciones(nuevasAcciones);
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-casal mb-4">3. Acciones a Ejecutar</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Define qué acciones se ejecutarán cuando se dispare la automatización
      </p>

      {/* Lista de acciones */}
      <div className="space-y-4 mb-6">
        {acciones.map((accion, index) => (
          <div
            key={index}
            className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={accion.activa}
                  onChange={(e) =>
                    actualizarAccion(index, "activa", e.target.checked)
                  }
                  className="w-5 h-5 text-casal border-gray-300 rounded focus:ring-casal"
                />
                <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                  {accion.tipo === "whatsapp" && "📱 WhatsApp"}
                  {accion.tipo === "email" && "📧 Email"}
                  {accion.tipo === "signalr" && "🔔 Notificación SignalR"}
                </span>
              </div>
              <Button
                onClick={() => eliminarAccion(index)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Eliminar
              </Button>
            </div>

            {/* Configuración de WhatsApp */}
            {accion.tipo === "whatsapp" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Plantilla (Opcional)
                </label>
                <input
                  type="text"
                  value={accion.plantilla}
                  onChange={(e) =>
                    actualizarAccion(index, "plantilla", e.target.value)
                  }
                  placeholder="nombre_plantilla"
                  className="w-full p-2 mb-3 border rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300"
                />

                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Mensaje
                </label>
                <textarea
                  value={accion.mensaje}
                  onChange={(e) =>
                    actualizarAccion(index, "mensaje", e.target.value)
                  }
                  placeholder="Hola {{nombre}}, este es tu mensaje..."
                  rows={4}
                  className="w-full p-3 border rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Variables disponibles: {"{"}
                  {"{"}nombre{"}"}
                  {"}"}, {"{"}
                  {"{"}telefono{"}"}
                  {"}"}, {"{"}
                  {"{"}evento_nombre{"}"}
                  {"}"}, {"{"}
                  {"{"}monto_pendiente{"}"}
                  {"}"}
                </p>
              </div>
            )}

            {/* Configuración de Email */}
            {accion.tipo === "email" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Asunto
                </label>
                <input
                  type="text"
                  value={accion.asunto}
                  onChange={(e) =>
                    actualizarAccion(index, "asunto", e.target.value)
                  }
                  placeholder="Asunto del correo"
                  className="w-full p-2 mb-3 border rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300"
                />

                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Plantilla
                </label>
                <input
                  type="text"
                  value={accion.plantilla}
                  onChange={(e) =>
                    actualizarAccion(index, "plantilla", e.target.value)
                  }
                  placeholder="nombre_plantilla_email"
                  className="w-full p-2 mb-3 border rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300"
                />

                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Contenido (opcional)
                </label>
                <textarea
                  value={accion.mensaje}
                  onChange={(e) =>
                    actualizarAccion(index, "mensaje", e.target.value)
                  }
                  placeholder="Contenido adicional del email..."
                  rows={4}
                  className="w-full p-3 border rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 resize-none"
                />
              </div>
            )}

            {/* Configuración de SignalR */}
            {accion.tipo === "signalr" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Target (Nombre del método)
                </label>
                <input
                  type="text"
                  value={accion.plantilla}
                  onChange={(e) =>
                    actualizarAccion(index, "plantilla", e.target.value)
                  }
                  placeholder="Ej: pagoCompletado"
                  className="w-full p-2 mb-3 border rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300"
                />

                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Destinatarios (IDs separados por coma)
                </label>
                <input
                  type="text"
                  value={accion.mensaje}
                  onChange={(e) =>
                    actualizarAccion(index, "mensaje", e.target.value)
                  }
                  placeholder="id1,id2,id3 o deja vacío para todos"
                  className="w-full p-2 border rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300"
                />
              </div>
            )}

            {errores[`accion_${index}`] && (
              <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
                {errores[`accion_${index}`]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botones para agregar acciones */}
      <div className="flex gap-3">
        <Button
          onClick={() => agregarAccion("whatsapp")}
          className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
        >
          + WhatsApp
        </Button>
        <Button
          onClick={() => agregarAccion("email")}
          className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
        >
          + Email
        </Button>
        <Button
          onClick={() => agregarAccion("signalr")}
          className="flex-1 py-3 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors"
        >
          + SignalR
        </Button>
      </div>

      {errores.acciones && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
          {errores.acciones}
        </div>
      )}
    </div>
  );
}

// ========== PANEL 4: FRECUENCIA ==========
function PanelFrecuencia({ frecuencia, setFrecuencia, error }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-casal mb-4">
        4. Frecuencia de Envío
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Define con qué frecuencia se puede enviar esta automatización a cada
        destinatario
      </p>

      {/* Tipo de frecuencia */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Tipo de frecuencia
        </label>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              value: "unica",
              label: "Única",
              desc: "Solo se envía una vez por destinatario",
            },
            {
              value: "recurrente",
              label: "Recurrente",
              desc: "Se puede enviar múltiples veces con intervalo",
            },
            {
              value: "continua",
              label: "Continua",
              desc: "Se envía cada vez que se cumple la condición",
            },
          ].map((tipo) => (
            <button
              key={tipo.value}
              onClick={() =>
                setFrecuencia({ ...frecuencia, tipo: tipo.value })
              }
              className={clsx(
                "p-4 rounded-lg border-2 text-left transition-all",
                frecuencia.tipo === tipo.value
                  ? "border-casal bg-casal/10"
                  : "border-gray-300 dark:border-gray-600 hover:border-casal/50"
              )}
            >
              <div className="font-semibold text-gray-800 dark:text-gray-200">
                {tipo.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {tipo.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuración para recurrente */}
      {frecuencia.tipo === "recurrente" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Intervalo entre envíos (horas)
            </label>
            <input
              type="number"
              min="1"
              max="720"
              value={frecuencia.intervalo_horas}
              onChange={(e) =>
                setFrecuencia({
                  ...frecuencia,
                  intervalo_horas: parseInt(e.target.value),
                })
              }
              className="w-full p-3 border rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tiempo mínimo entre envíos al mismo destinatario
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Máximo de envíos por destinatario
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={frecuencia.max_envios}
              onChange={(e) =>
                setFrecuencia({
                  ...frecuencia,
                  max_envios: parseInt(e.target.value),
                })
              }
              className="w-full p-3 border rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Número máximo de veces que se enviará al mismo destinatario
            </p>
          </div>
        </div>
      )}

      {/* Información adicional según tipo */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold mb-2">
          {frecuencia.tipo === "unica" && "Frecuencia Única"}
          {frecuencia.tipo === "recurrente" && "Frecuencia Recurrente"}
          {frecuencia.tipo === "continua" && "Frecuencia Continua"}
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-400">
          {frecuencia.tipo === "unica" &&
            "Esta automatización solo se ejecutará una vez por destinatario, sin importar cuántas veces se cumpla la condición."}
          {frecuencia.tipo === "recurrente" &&
            `Esta automatización se puede ejecutar hasta ${frecuencia.max_envios} veces por destinatario, con un intervalo mínimo de ${frecuencia.intervalo_horas} horas entre cada envío.`}
          {frecuencia.tipo === "continua" &&
            "Esta automatización se ejecutará cada vez que se cumpla la condición, sin límites de frecuencia. Úsala con precaución."}
        </p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

