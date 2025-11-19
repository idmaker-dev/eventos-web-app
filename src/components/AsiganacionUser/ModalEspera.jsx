import { Button, Dialog, DialogPanel } from "@headlessui/react";
import { Clock, Users, Calendar, UserCircle, Eye, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import "./css/style.css";

export default function ModalEspera({ open, usuario, horario }) {
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [horaActual, setHoraActual] = useState(new Date());
  const [mostrarAjustes, setMostrarAjustes] = useState(false);
  const [configuracionAsientos, setConfiguracionAsientos] = useState({
    mesaSeleccionada: 14,
    boletosDisponibles: 12,
    personas: [{ id: 1, nombre: "", activa: true }],
    restriccionesAlimentarias: {
      vegetariano: false,
      vegano: false,
      sinGluten: false,
      alergiaMarisco: false,
    },
    tipoMenu: "normal",
    restriccionEspecifica: "",
  });

  // Actualizar hora actual
  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calcular tiempo restante
  useEffect(() => {
    const calcular = () => {
      const ahora = new Date();
      const [h, m] = horario.inicio.split(":");
      const inicio = new Date();
      inicio.setHours(parseInt(h), parseInt(m), 0, 0);

      const diferencia = inicio - ahora;
      setTiempoRestante(Math.max(0, diferencia));
    };

    calcular();
    const interval = setInterval(calcular, 1000);
    return () => clearInterval(interval);
  }, [horario]);

  const formatearTiempo = (ms) => {
    if (ms <= 0) return "00:00";
    const minutos = Math.floor(ms / 60000);
    const segundos = Math.floor((ms % 60000) / 1000);
    return `${minutos.toString().padStart(2, "0")}:${segundos
      .toString()
      .padStart(2, "0")}`;
  };

  const handleToggleAjustes = () => {
    console.log("Cambiando a ajustes:", !mostrarAjustes);
    setMostrarAjustes(!mostrarAjustes);
  };

  const agregarPersona = () => {
    if (
      configuracionAsientos.personas.length <
      configuracionAsientos.boletosDisponibles
    ) {
      setConfiguracionAsientos((prev) => ({
        ...prev,
        personas: [
          ...prev.personas,
          { id: prev.personas.length + 1, nombre: "", activa: true },
        ],
      }));
    }
  };

  const actualizarPersona = (id, campo, valor) => {
    setConfiguracionAsientos((prev) => ({
      ...prev,
      personas: prev.personas.map((p) =>
        p.id === id ? { ...p, [campo]: valor } : p
      ),
    }));
  };

  const toggleRestriccion = (restriccion) => {
    setConfiguracionAsientos((prev) => ({
      ...prev,
      restriccionesAlimentarias: {
        ...prev.restriccionesAlimentarias,
        [restriccion]: !prev.restriccionesAlimentarias[restriccion],
      },
    }));
  };

  return (
    <Dialog open={open} onClose={() => {}} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row w-full min-h-[600px]">
            {/* Panel izquierdo con flip */}
            <div className="w-full lg:w-96 rounded-2xl flex flex-col relative overflow-hidden">
              <div className="flip-container flex-1">
                <div className={`flip-card ${mostrarAjustes ? "flipped" : ""}`}>
                  {/* Cara frontal - Vista de espera */}
                  <div className="flip-card-front">
                    <div className="h-full overflow-y-auto bg-white rounded-b-2xl">
                      <div className="bg-gradient-to-br from-casal to-casal/90 text-white p-6 flex flex-col justify-center rounded-t-2xl">
                        <div className="text-center mb-8">
                          <div className="w-20 h-20 bg-[#aaf7bf] rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <UserCircle className="w-12 h-12 text-casal" />
                          </div>
                          <h2 className="text-xl font-bold mb-2 text-white">
                            Hola, {usuario.nombre}
                          </h2>
                          <p className="text-white/90 text-sm">
                            Estás en fila para seleccionar tu mesa
                          </p>
                          <p className="text-white/80 text-xs mt-1">
                            Tu turno llegará pronto
                          </p>
                        </div>

                        {/* Información del horario */}
                        <div className="bg-white backdrop-blur-sm rounded-xl p-4 mb-6">
                          <div className="font-semibold mb-3 flex items-center gap-2 justify-center text-casal">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <p>Tu Horario de Asignación</p>
                          </div>

                          <div className="space-y-2 text-sm text-casal w-4/5 mx-auto">
                            <div className="flex justify-between items-center">
                              <span className="text-casal font-semibold">
                                Horario:
                              </span>
                              <span className="font-mono font-semibold bg-Acapulco/30 px-2 py-1 rounded text-md">
                                {horario.inicio} - {horario.fin}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-casal font-semibold">
                                Duración:
                              </span>
                              <span className="font-mono font-semibold bg-Acapulco/30 px-2 py-1 rounded text-md">
                                {horario.duracionMinutos} min
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-casal font-semibold">
                                Hora actual:
                              </span>
                              <span className="font-mono font-semibold text-md">
                                {horaActual.toLocaleTimeString("es-ES", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Contador de tiempo */}
                        {tiempoRestante > 0 && (
                          <div className="bg-casalds-50/20 backdrop-blur-sm rounded-xl p-4 text-center">
                            <Clock className="w-6 h-6 mx-auto mb-2 text-white" />
                            <p className="text-xs text-white mb-2">
                              Tiempo hasta tu turno:
                            </p>
                            <div className="text-2xl font-mono font-bold text-white bg-Acapulco/40 rounded-lg py-2 px-4">
                              {formatearTiempo(tiempoRestante)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Resumen de asientos */}
                      <div className="mt-6 bg-white  p-2 rounded-b-2xl">
                        <h3 className="font-semibold mb-3 text-casal text-md text-center">
                          Resumen de asientos
                        </h3>
                        <div className="grid grid-cols-3 gap-1 text-xs w-11/12 mx-auto">
                          <div className="">
                            <div className="w-8 h-8 bg-green-400 rounded-lg mb-1 flex items-center justify-center"></div>
                            <div className="text-gray-600 font-semibold">
                              Disponible
                            </div>
                            <div className="text-gray-400 font-normal">
                              (15 asientos)
                            </div>
                          </div>
                          <div className="">
                            <div className="w-8 h-8 bg-red-400 rounded-lg mb-1 flex items-center justify-center"></div>
                            <div className="text-gray-600 font-semibold">
                              Ocupado
                            </div>
                            <div className="text-gray-400 font-normal">
                              (21 asientos)
                            </div>
                          </div>
                          <div className="">
                            <div>
                              <p className="text-gray-800 font-semibold">
                                Mesas Ocupadas
                              </p>
                              <div className="text-lg font-semibold text-casal">
                                28/50
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-800 font-semibold">
                                Capacidad utilizada:
                              </p>
                              <div className="text-lg font-semibold text-green-500">
                                56%
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-center mt-3">
                          <Button
                            onClick={handleToggleAjustes}
                            className="bg-casal text-white text-sm font-semibold px-8 py-2 rounded-2xl hover:bg-casal/90 transition"
                          >
                            Ajustes de asientos
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cara trasera - Vista de ajustes */}
                  <div className="flip-card-back">
                    <div className="bg-white rounded-t-2xl h-full p-4 overflow-y-auto">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-casal">
                          Ajuste de asientos
                        </h2>
                        <Button
                          onClick={handleToggleAjustes}
                          className="text-gray-400 hover:text-gray-600 hover:border hover:border-gray-100 hover:shadow-xl rounded text-sm px-2 py-1"
                        >
                          ← Volver
                        </Button>
                      </div>

                      {/* Preselección de mesa */}
                      <div className="mb-4 flex  justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-700">
                            Preselección de mesa
                          </span>
                          <span className="bg-Acapulco text-white px-2 py-1 rounded text-xs font-medium">
                            Mesa {configuracionAsientos.mesaSeleccionada}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            Usted tiene {configuracionAsientos.boletosDisponibles}{" "}
                            boletos
                          </p>
                        </div>
                      </div>

                      {/* Configuración de personas */}
                      <div className="mb-4">
                        <div className="space-y-2 mb-3 bg-slate-100 p-2 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                           <div className="text-sm font-medium text-gray-700">
                             Configuración persona{" "}
                            {configuracionAsientos.personas.length} de{" "}
                            {configuracionAsientos.boletosDisponibles}
                           </div>
                           <div className="flex gap-2 items-center">
                             <Button onClick={agregarPersona} className="text-xs text-casal font-medium underline hover:text-casal/80 bg-gray-300 rounded">
                                <ChevronRight className="w-4 h-4 inline-block rotate-180" />
                              </Button>
                              <Button onClick={agregarPersona} className="text-xs text-casal font-medium underline hover:text-casal/80 bg-gray-300 rounded">
                                <ChevronLeft className="w-4 h-4 inline-block rotate-180" />
                              </Button>
                           </div>
                          </div>
                          <div className="flex gap-1 w-full overflow-x-auto pb-2">
                            {Array.from({ length: 12 }).map((_, i) => (
                              <Button
                                key={i + 1}
                                onClick={() => {
                                  if (
                                    i + 1 <=
                                    configuracionAsientos.personas.length
                                  )
                                    return;
                                  agregarPersona();
                                }}
                                className={`px-2 py-1 text-xs rounded ${
                                  i + 1 <= configuracionAsientos.personas.length
                                    ? "bg-casal text-white"
                                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                }`}
                              >
                                Persona {i + 1}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="block text-sm font-medium text-casal mb-1">
                            Nombre completo (Persona 1)
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-casal/50"
                            placeholder="Ingresa el nombre completo"
                            value={
                              configuracionAsientos.personas[0]?.nombre || ""
                            }
                            onChange={(e) =>
                              actualizarPersona(1, "nombre", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      {/* Tipo de Menú */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-casal mb-2">
                          Tipo de Menú
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Selecciona uno
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          {[
                            {
                              id: "normal",
                              label: "Menú normal",
                              subtitle: "Menú completo estándar",
                            },
                            {
                              id: "infantil",
                              label: "Menú Infantil",
                              subtitle: "Adaptado para niños",
                            },
                            {
                              id: "especial",
                              label: "Menú Especial",
                              subtitle: "Opciones gourmet",
                            },
                            {
                              id: "celiaco",
                              label: "Menú Celiaco",
                              subtitle: "Sin gluten certificado",
                            },
                          ].map((menu) => (
                            <Button
                              key={menu.id}
                              onClick={() =>
                                setConfiguracionAsientos((prev) => ({
                                  ...prev,
                                  tipoMenu: menu.id,
                                }))
                              }
                              className={`p-3 text-left border rounded-lg text-xs transition ${
                                configuracionAsientos.tipoMenu === menu.id
                                  ? "border-casal bg-casal/10 text-casal"
                                  : "border-gray-200 hover:border-gray-300 bg-gray-100 "
                              }`}
                            >
                              <div className="font-medium">{menu.label}</div>
                              <div className="text-gray-500 text-xs">
                                {menu.subtitle}
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Restricciones alimentarias */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Restricciones alimentarias
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Puedes seleccionar varias
                        </p>

                        <div className="grid grid-cols-2 gap-2 border p-2 rounded-lg ">
                          {[
                            {
                              key: "vegetariano",
                              label: "Vegetariano",
                              subtitle: "No consume carne ni pescado",
                            },
                            {
                              key: "sinGluten",
                              label: "Sin gluten",
                              subtitle: "Intolerancia al gluten",
                            },
                            {
                              key: "vegano",
                              label: "Vegano",
                              subtitle: "No consume productos de origen animal",
                            },
                            {
                              key: "alergiaMarisco",
                              label: "Alergia a marisco",
                              subtitle: "Alérgico a mariscos",
                            },
                          ].map((restriccion) => (
                            <Button
                              key={restriccion.key}
                              onClick={() => toggleRestriccion(restriccion.key)}
                              className={`p-2 text-left border rounded-lg text-xs transition ${
                                configuracionAsientos.restriccionesAlimentarias[
                                  restriccion.key
                                ]
                                  ? "border-casal bg-casal/10 text-casal"
                                  : "border-gray-200 text-gray-500 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  checked={
                                    configuracionAsientos
                                      .restriccionesAlimentarias[
                                      restriccion.key
                                    ]
                                  }
                                  onChange={() => {}}
                                  className="w-3 h-3"
                                />
                                <div>
                                  <div className="font-semibold ">
                                    {restriccion.label}
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {restriccion.subtitle}
                                  </div>
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Restricción específica */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Restricción específica adicional
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-casal/50"
                          placeholder="Ej: Alérgico a frutos secos, intolerancias específicas..."
                          rows={2}
                          value={configuracionAsientos.restriccionEspecifica}
                          onChange={(e) =>
                            setConfiguracionAsientos((prev) => ({
                              ...prev,
                              restriccionEspecifica: e.target.value,
                            }))
                          }
                        />
                      </div>

                      {/* Botón de guardar */}
                      <Button className="w-full bg-casal text-white font-medium py-2 rounded-lg hover:bg-casal/90 transition">
                        Guardar configuración
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer fijo */}
              <div className="px-3 py-3 bg-gray-50 rounded-b-2xl">
                <p className="text-xs text-casal font-light text-center">
                  Sistema de Asignación de Mesas / Mantén esta ventana abierta
                </p>
              </div>
            </div>

            {/* Panel derecho - Mapa de asientos */}
            <div className="flex-1 p-4 lg:p-6 bg-gray-50">
              <div className="h-full flex flex-col">
                {/* Header del mapa */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-gray-200">
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center bg-red-500 gap-1 px-2 rounded">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-white">
                          LIVE
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Tiempo real de selección de mesas
                      </span>
                    </div>
                    <div className="flex w-full justify-between items-center">
                      <div className="text-xs text-gray-500 mt-2 sm:mt-0">
                        Plano del Salón - Salón de eventos Foro 1
                      </div>
                      <div className="text-xs text-gray-500 mt-2 sm:mt-0">
                        Evento: Graduación ITESM 2025
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mapa de asientos */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div>
                        <p>En elaboración</p>
                      </div>
                    </div>

                    {/* Leyenda */}
                    <div className="flex justify-center gap-6 mt-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-gray-600">Disponible</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span className="text-gray-600">Ocupado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
