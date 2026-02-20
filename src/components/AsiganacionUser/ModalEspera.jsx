import { Button, Dialog, DialogPanel } from "@headlessui/react";
import {
  Clock,
  Calendar,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDisponibilidadMesas } from "../../hooks/useDisponibilidadMesas";
import { useSignalRInvitado } from "../../hooks/useSignalRInvitado";
import Mesa from "../Distribuccion/Mesa.jsx";
import MesaRectangular from "../Distribuccion/MesaRectangular.jsx";
import "./css/style.css";

export default function ModalEspera({
  open,
  usuario,
  horario,
  eventoId,
  invitadoId,
  configuracionPrevia,
  configuracionTurnos = null,
  onGuardarConfiguracion,
}) {
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [horaActual, setHoraActual] = useState(new Date());
  const [mostrarAjustes, setMostrarAjustes] = useState(false);
  const [personaActualVisible, setPersonaActualVisible] = useState(0); // Para navegación del carrusel
  // ✅ Inicializar TODAS las personas desde el inicio con estructura completa
  const cantidadTotal = usuario?.cantidad_personas || usuario?.cantidad || 1;
  const [configuracionAsientos, setConfiguracionAsientos] = useState({
    boletosDisponibles: cantidadTotal,
    personas: Array.from({ length: cantidadTotal }, (_, index) => ({
      id: index + 1,
      nombre: index === 0 ? (usuario?.nombre_completo || usuario?.nombre || "") : "",
      activa: true,
      // ✅ Datos individuales por persona
      tipoMenu: "normal",
      restricciones: {},
      otraRestriccion: "",
      necesidadesEspeciales: {
        requiereAccesibilidad: false,
        comentarios: ""
      }
    })),
    // Campos legacy (se mantienen por compatibilidad pero NO se usan en preconfiguración)
    restriccionesAlimentarias: {
      vegetariano: false,
      vegano: false,
      sinGluten: false,
      alergiaMarisco: false,
    },
    tipoMenu: "normal",
    restriccionEspecifica: "",
  });

  // Estados para configuración y SignalR
  const [configuracionGuardada, setConfiguracionGuardada] = useState(false);
  const [guardandoConfiguracion, setGuardandoConfiguracion] = useState(false);

  // Estados para el canvas de mesas
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const carruselPersonasRef = useRef(null); // Ref para el carrusel de personas

  // Hook para obtener disponibilidad de mesas
  const {
    elementos: elementosConDisponibilidad,
    estadisticas,
    loading: loadingMesas,
    refrescar: refrescarDisponibilidad,
    disponibilidad,
    eventoInfo,
  } = useDisponibilidadMesas(eventoId, true);

  // Debug: Ver estructura de datos
  useEffect(() => {
    if (disponibilidad) {
      console.log("📊 Disponibilidad completa:", disponibilidad);
      console.log("📋 Elementos:", elementosConDisponibilidad);
      console.log("📈 Estadísticas:", estadisticas);
    }
  }, [disponibilidad, elementosConDisponibilidad, estadisticas]);

  // Función para mostrar notificaciones
  const mostrarNotificacion = useCallback((mensaje, tipo) => {
    const colores = {
      success: "bg-green-100 border-green-400 text-green-700",
      error: "bg-red-100 border-red-400 text-red-700",
      warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
      info: "bg-blue-100 border-blue-400 text-blue-700",
    };

    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 px-4 py-3 rounded border-l-4 ${colores[tipo]} z-50 max-w-md shadow-lg`;
    notification.style.whiteSpace = "pre-line";
    notification.textContent = mensaje;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
  }, []);

  // Callback para actualizaciones de SignalR (selección y bloqueo)
  const handleMesaCambiada = useCallback(
    async (notificacion) => {
      console.log("🔔 [ModalEspera] Notificación recibida:", notificacion);

      // Mostrar notificación al usuario según el tipo
      if (notificacion.tipo === "mesa_bloqueada") {
        const esBloqueada = notificacion.data.bloqueada;
        mostrarNotificacion(
          notificacion.mensaje,
          esBloqueada ? "warning" : "info"
        );
      } else if (notificacion.tipo === "mesa_seleccionada") {
        // Solo refrescar silenciosamente para selecciones
        console.log(
          "🔄 [ModalEspera] Refrescando disponibilidad por cambio en mesa"
        );
      }

      // Refrescar disponibilidad para actualizar el layout
      await refrescarDisponibilidad();
    },
    [refrescarDisponibilidad, mostrarNotificacion]
  );

  // Hook de SignalR para invitados (maneja selección y bloqueo de mesas)
  const { conectado } = useSignalRInvitado(handleMesaCambiada);

  // Cargar disponibilidad inicial cuando el modal se abre
  useEffect(() => {
    if (open && eventoId) {
      console.log(
        "🔄 Cargando disponibilidad inicial al abrir modal de espera"
      );
      refrescarDisponibilidad();
    }
  }, [open, eventoId, refrescarDisponibilidad]);

  // Cargar configuración previa si existe
  useEffect(() => {
    if (configuracionPrevia) {
      setConfiguracionAsientos(configuracionPrevia);
      setConfiguracionGuardada(true);
    }
  }, [configuracionPrevia]);

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

  // Funciones para guardar/cancelar configuración
  const handleGuardarConfiguracion = useCallback(async () => {
    setGuardandoConfiguracion(true);
    try {
      // Guardar en localStorage
      const config = {
        ...configuracionAsientos,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(
        `config-asientos-${invitadoId}`,
        JSON.stringify(config)
      );
      setConfiguracionGuardada(true);

      // Notificar al componente padre si existe callback
      if (onGuardarConfiguracion) {
        onGuardarConfiguracion(config);
      }

      console.log("Configuración guardada en memoria:", config);

      // Volver a la vista de espera
      setMostrarAjustes(false);
    } catch (error) {
      console.error("Error al guardar configuración:", error);
    } finally {
      setGuardandoConfiguracion(false);
    }
  }, [configuracionAsientos, invitadoId, onGuardarConfiguracion]);

  const handleCancelarConfiguracion = useCallback(() => {
    // Restaurar configuración previa o valores por defecto
    if (configuracionPrevia) {
      setConfiguracionAsientos(configuracionPrevia);
    } else {
      setConfiguracionAsientos({
        boletosDisponibles:
          usuario?.cantidad_personas || usuario?.cantidad || 1,
        personas: [
          {
            id: 1,
            nombre: usuario?.nombre_completo || usuario?.nombre || "",
            activa: true,
          },
        ],
        restriccionesAlimentarias: {
          vegetariano: false,
          vegano: false,
          sinGluten: false,
          alergiaMarisco: false,
        },
        tipoMenu: "normal",
        restriccionEspecifica: "",
      });
    }
    setMostrarAjustes(false);
  }, [configuracionPrevia, usuario]);

  // Funciones de zoom para el canvas
  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

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

  // Navegación del carrusel de personas
  const irSiguientePersona = () => {
    if (personaActualVisible < configuracionAsientos.boletosDisponibles - 1) {
      const nuevaPersona = personaActualVisible + 1;
      setPersonaActualVisible(nuevaPersona);
      scrollToPersonaCarrusel(nuevaPersona);
    }
  };

  const irPersonaAnterior = () => {
    if (personaActualVisible > 0) {
      const nuevaPersona = personaActualVisible - 1;
      setPersonaActualVisible(nuevaPersona);
      scrollToPersonaCarrusel(nuevaPersona);
    }
  };

  const irAPersonaCarrusel = (index) => {
    setPersonaActualVisible(index);
    scrollToPersonaCarrusel(index);
  };

  // Scroll automático al botón de la persona seleccionada
  const scrollToPersonaCarrusel = (index) => {
    if (carruselPersonasRef.current) {
      const buttons = carruselPersonasRef.current.children;
      if (buttons[index]) {
        buttons[index].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
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

  // ✅ Actualizar restricciones de la persona actual
  const toggleRestriccionPersona = (personaId, restriccion) => {
    setConfiguracionAsientos((prev) => ({
      ...prev,
      personas: prev.personas.map((p) => {
        if (p.id === personaId) {
          const restriccionesActuales = p.restricciones || {};
          return {
            ...p,
            restricciones: {
              ...restriccionesActuales,
              [restriccion]: !restriccionesActuales[restriccion]
            }
          };
        }
        return p;
      }),
    }));
  };

  // ❌ Mantener para retrocompatibilidad legacy
  const toggleRestriccion = (restriccion) => {
    setConfiguracionAsientos((prev) => ({
      ...prev,
      restriccionesAlimentarias: {
        ...prev.restriccionesAlimentarias,
        [restriccion]: !prev.restriccionesAlimentarias[restriccion],
      },
    }));
  };

  // ✅ Obtener tipos de menú desde configuración o usar defaults
  const opcionesTipoMenu = React.useMemo(() => {
    console.log('🍽️ [ModalEspera] Generando opcionesTipoMenu:', configuracionTurnos?.tipos_menu);
    
    if (configuracionTurnos?.tipos_menu && configuracionTurnos.tipos_menu.length > 0) {
      return configuracionTurnos.tipos_menu.map(tipo => {
        // Manejar si tipo es string o objeto
        const tipoId = typeof tipo === 'string' ? tipo : tipo.id || tipo.value;
        const tipoLabel = typeof tipo === 'string' 
          ? `Menú ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}` 
          : tipo.label || tipo.nombre || `Menú ${tipoId}`;
        const tipoSubtitle = typeof tipo === 'string'
          ? `Opción de menú ${tipoId}`
          : tipo.descripcion || tipo.subtitle || `Opción de menú ${tipoId}`;
        
        return {
          id: tipoId,
          label: tipoLabel,
          subtitle: tipoSubtitle,
        };
      });
    }
    
    // Fallback a opciones por defecto
    return [
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
    ];
  }, [configuracionTurnos]);

  // Renderizar elemento del layout (mesas y decorativos)
  const renderElemento = (element) => {
    // Obtener disponibilidad para mesas
    const disponibilidad = element.disponibilidad;
    const invitadosAsignados = disponibilidad
      ? disponibilidad.asientos_ocupados
      : element.invitados || 0;

    // Verificar si la mesa está bloqueada
    const estaBloqueada =
      element.disponibilidad?.esta_bloqueada ||
      element.disponibilidad?.bloqueada ||
      element.bloqueada;
    const motivoBloqueo =
      element.disponibilidad?.motivo_bloqueo || element.motivo_bloqueo || "";

    // Renderizar mesas
    if (element.type === "mesa") {
      return (
        <div className="relative">
          <Mesa
            numeroMesa={element.numero}
            invitadosAsignados={invitadosAsignados}
            capacidadMaxima={element.capacidad}
            sillasEspeciales={element.sillasEspeciales || []}
            invitadosEspeciales={element.invitadosEspeciales || 0}
            readOnly={true}
          />
          {/* Overlay para mesa bloqueada */}
          {estaBloqueada && (
            <div
              className="absolute inset-0 bg-red-500/30 backdrop-blur-[1px] rounded-full flex items-center justify-center pointer-events-none border-2 border-red-500 z-20"
              title={
                motivoBloqueo ? `Bloqueada: ${motivoBloqueo}` : "Mesa bloqueada"
              }
            >
              <div className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg">
                🔒 BLOQUEADA
              </div>
            </div>
          )}
        </div>
      );
    }

    if (element.type === "mesaRectangular") {
      return (
        <div className="relative">
          <MesaRectangular
            numeroMesa={element.numero}
            invitadosAsignados={invitadosAsignados}
            capacidadMaxima={element.capacidad}
            sillasEspeciales={element.sillasEspeciales || []}
            invitadosEspeciales={element.invitadosEspeciales || 0}
            readOnly={true}
          />
          {/* Overlay para mesa bloqueada */}
          {estaBloqueada && (
            <div
              className="absolute inset-0 bg-red-500/30 backdrop-blur-[1px] rounded-lg flex items-center justify-center pointer-events-none border-2 border-red-500 z-20"
              title={
                motivoBloqueo ? `Bloqueada: ${motivoBloqueo}` : "Mesa bloqueada"
              }
            >
              <div className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg">
                🔒 BLOQUEADA
              </div>
            </div>
          )}
        </div>
      );
    }

    // Aplicar transformaciones para elementos decorativos
    const rotation = element.rotation || 0;
    const scale = element.scale || 1;
    const scaleX = element.scaleX || scale;
    const scaleY = element.scaleY || scale;

    const transformStyle = {
      transform: `rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`,
      transformOrigin: "center center",
    };

    // Renderizar elementos decorativos
    const elementContent = (() => {
      switch (element.type) {
        case "entrada":
          return (
            <div className="rounded px-6 py-1 rotate-90 border flex items-center justify-center text-gray-600 font-semibold bg-gray-50 whitespace-nowrap pointer-events-none">
              Entrada
            </div>
          );
        case "barra":
          return (
            <div className="border-2 border-separate border-dashed border-gray-300 w-24 h-24 flex items-center justify-center text-center p-2 rounded-md text-gray-500 font-semibold bg-white shadow pointer-events-none">
              Barra
            </div>
          );
        case "mesa-principal":
          return (
            <div className="rounded px-6 py-3 w-48 border-separate border-2 border-dashed text-center text-gray-600 font-semibold bg-gray-50 pointer-events-none">
              Mesa principal
            </div>
          );
        case "pistaBaileRedonda":
          return (
            <div className="w-40 h-40 text-center border-cafe border-2 border-dashed flex items-center justify-center text-gray-600 font-semibold bg-cafe/10 rounded-full pointer-events-none">
              <span className="text-cafe text-lg font-bold">
                Pista de <br /> Baile
              </span>
            </div>
          );
        case "pistaBaileRectangular":
          return (
            <div className="w-64 h-28 text-center border-cafe border-2 border-dashed flex items-center justify-center text-gray-600 font-semibold bg-cafe/10 rounded-lg pointer-events-none">
              <span className="text-cafe text-lg font-bold">
                Pista de <br /> Baile
              </span>
            </div>
          );
        case "pistaBaileCuadrada":
          return (
            <div className="w-40 h-40 text-center border-cafe border-2 border-dashed flex items-center justify-center text-gray-600 font-semibold bg-cafe/10 rounded-md pointer-events-none">
              <span className="text-cafe text-lg font-bold">
                Pista de <br /> Baile
              </span>
            </div>
          );
        case "escenario":
          return (
            <div className="border-2 border-separate border-dashed border-gray-300 w-28 h-28 flex flex-col items-center justify-center text-center p-2 rounded-md text-gray-500 font-semibold bg-white shadow pointer-events-none">
              <p>ESCENARIO</p>
              <p className="text-xs mt-1">DJ Música</p>
            </div>
          );
        case "buffet":
          return (
            <div className="border-2 border-separate border-dashed border-gray-300 w-28 h-20 flex items-center justify-center text-center p-2 rounded-md text-gray-500 font-semibold bg-white shadow pointer-events-none">
              BUFFET
            </div>
          );
        default:
          return null;
      }
    })();

    return <div style={transformStyle}>{elementContent}</div>;
  };

  return (
    <Dialog open={open} onClose={() => {}} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-6xl h-[90vh] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col scroll-auto">
          <div className="flex flex-col lg:flex-row w-full h-full min-h-[600px]">
            {/* Panel izquierdo con flip */}
            <div className="w-full lg:w-96 h-full flex flex-col relative bg-white rounded-2xl">
              <div className="flip-container flex-1 h-full">
                <div
                  className={
                    `flip-card h-full ` +
                    (mostrarAjustes
                      ? "flipped mostrar-trasera"
                      : "mostrar-frontal")
                  }
                >
                  {/* Cara frontal - Vista de espera */}
                  <div className="flip-card-front h-full overflow-y-auto">
                    <div className=" bg-white rounded-2xl">
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
                              ({estadisticas?.asientos_disponibles || 0}{" "}
                              asientos)
                            </div>
                          </div>
                          <div className="">
                            <div className="w-8 h-8 bg-red-400 rounded-lg mb-1 flex items-center justify-center"></div>
                            <div className="text-gray-600 font-semibold">
                              Ocupado
                            </div>
                            <div className="text-gray-400 font-normal">
                              ({estadisticas?.asientos_ocupados || 0} asientos)
                            </div>
                          </div>
                          <div className="">
                            <div>
                              <p className="text-gray-800 font-semibold">
                                Mesas Ocupadas
                              </p>
                              <div className="text-lg font-semibold text-casal">
                                {estadisticas?.mesas_llenas || 0}/
                                {estadisticas?.total_mesas || 0}
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-800 font-semibold">
                                Capacidad utilizada:
                              </p>
                              <div className="text-lg font-semibold text-green-500">
                                {estadisticas?.porcentaje_ocupacion || 0}%
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 mt-3">
                          {configuracionGuardada && (
                            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
                              <Save className="w-3 h-3" />
                              <span>Configuración guardada</span>
                            </div>
                          )}
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
                  <div className="flip-card-back h-full overflow-y-auto">
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

                      {/* Información de boletos */}
                      <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Boletos disponibles:
                          </span>
                          <span className="bg-casal text-white px-3 py-1 rounded-lg text-sm font-semibold">
                            {configuracionAsientos.boletosDisponibles}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Configura la información de las personas que asistirán
                        </p>
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
                              <Button
                                onClick={irPersonaAnterior}
                                disabled={personaActualVisible === 0}
                                className="p-2 rounded-lg bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={irSiguientePersona}
                                disabled={personaActualVisible === configuracionAsientos.boletosDisponibles - 1}
                                className="p-2 rounded-lg bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {/* Carrusel de personas con scroll horizontal */}
                          <div 
                            ref={carruselPersonasRef}
                            className="flex gap-1 w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
                          >
                            {Array.from({ length: configuracionAsientos.boletosDisponibles }).map((_, i) => (
                              <Button
                                key={i + 1}
                                onClick={() => irAPersonaCarrusel(i)}
                                className={`px-2 py-1 text-xs rounded flex-shrink-0 ${
                                  i === personaActualVisible
                                    ? "bg-casal text-white ring-2 ring-casal ring-offset-2"
                                    : i + 1 <= configuracionAsientos.personas.length
                                    ? "bg-green-500 text-white"
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
                            Nombre completo (Persona {personaActualVisible + 1})
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-casal/50"
                            placeholder="Ingresa el nombre completo"
                            value={
                              configuracionAsientos.personas[personaActualVisible]?.nombre || ""
                            }
                            onChange={(e) => {
                              const personaId = personaActualVisible + 1;
                              actualizarPersona(personaId, "nombre", e.target.value);
                            }}
                          />
                        </div>
                      </div>

                      {/* Tipo de Menú - POR PERSONA */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-casal mb-2">
                          Tipo de Menú (Persona {personaActualVisible + 1})
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Selecciona uno
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          {opcionesTipoMenu.map((menu) => (
                            <Button
                              key={menu.id}
                              onClick={() => {
                                const personaId = personaActualVisible + 1;
                                actualizarPersona(personaId, 'tipoMenu', menu.id);
                              }}
                              className={`p-3 text-left border rounded-lg text-xs transition ${
                                (configuracionAsientos.personas[personaActualVisible]?.tipoMenu || 'normal') === menu.id
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

                      {/* Restricciones alimentarias - POR PERSONA */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Restricciones alimentarias (Persona {personaActualVisible + 1})
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
                          ].map((restriccion) => {
                            const personaId = personaActualVisible + 1;
                            const restriccionesPersona = configuracionAsientos.personas[personaActualVisible]?.restricciones || {};
                            const estaActivo = restriccionesPersona[restriccion.key] || false;
                            
                            return (
                              <Button
                                key={restriccion.key}
                                onClick={() => toggleRestriccionPersona(personaId, restriccion.key)}
                                className={`p-2 text-left border rounded-lg text-xs transition ${
                                  estaActivo
                                    ? "border-casal bg-casal/10 text-casal"
                                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="checkbox"
                                    checked={estaActivo}
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
                            );
                          })}
                        </div>
                      </div>

                      {/* Restricción específica - POR PERSONA */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Restricción específica adicional (Persona {personaActualVisible + 1})
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-casal/50"
                          placeholder="Ej: Alérgico a frutos secos, intolerancias específicas..."
                          rows={2}
                          value={configuracionAsientos.personas[personaActualVisible]?.otraRestriccion || ''}
                          onChange={(e) => {
                            const personaId = personaActualVisible + 1;
                            actualizarPersona(personaId, 'otraRestriccion', e.target.value);
                          }}
                        />
                      </div>

                      {/* Botones de guardar y cancelar */}
                      <div className="flex gap-2">
                        <Button
                          onClick={handleGuardarConfiguracion}
                          disabled={guardandoConfiguracion}
                          className="flex-1 bg-casal text-white font-medium py-2 rounded-lg hover:bg-casal/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {guardandoConfiguracion ? "Guardando..." : "Guardar"}
                        </Button>
                        <Button
                          onClick={handleCancelarConfiguracion}
                          disabled={guardandoConfiguracion}
                          className="flex-1 bg-gray-200 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancelar
                        </Button>
                      </div>
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
            <div className="flex-1 p-4 lg:p-6 bg-gray-50 h-full overflow-y-auto hidden lg:block">
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
                        {eventoInfo?.lugar_nombre || "Plano del salón"} -{" "}
                        {eventoInfo?.nombre_layout || "Layout por defecto"}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 sm:mt-0">
                        Evento: {eventoInfo?.nombre_evento || "Graduación"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mapa de asientos */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    {/* Controles de zoom */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={zoomOut}
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                          title="Alejar"
                        >
                          <Minus className="w-4 h-4 text-gray-700" />
                        </Button>
                        <Button
                          onClick={resetZoom}
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                          title="Restablecer zoom"
                        >
                          <RotateCcw className="w-4 h-4 text-gray-700" />
                        </Button>
                        <Button
                          onClick={zoomIn}
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                          title="Acercar"
                        >
                          <Plus className="w-4 h-4 text-gray-700" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {conectado ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-green-600 font-medium">
                              Conectado
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-gray-500">Desconectado</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Canvas de mesas */}
                    <div
                      ref={containerRef}
                      className="aspect-[4/3] bg-gray-100 rounded-lg relative overflow-auto"
                      style={{ minHeight: "500px" }}
                    >
                      {loadingMesas ? (
                        <div className="flex flex-col items-center gap-2 absolute inset-0 justify-center">
                          <div className="w-8 h-8 border-4 border-casal/30 border-t-casal rounded-full animate-spin"></div>
                          <p className="text-sm text-gray-500">
                            Cargando mesas...
                          </p>
                        </div>
                      ) : elementosConDisponibilidad &&
                        elementosConDisponibilidad.length > 0 ? (
                        <div
                          className="relative bg-gray-50"
                          style={{
                            width: "1400px",
                            height: "800px",
                            minWidth: "1400px",
                            minHeight: "800px",
                          }}
                        >
                          <div
                            ref={canvasRef}
                            className="absolute left-0 top-0 origin-top-left"
                            style={{
                              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                              transformOrigin: "0 0",
                              width: "1200px",
                              height: "800px",
                            }}
                          >
                            {elementosConDisponibilidad.map((element) => (
                              <div
                                key={element.id}
                                style={{
                                  position: "absolute",
                                  left: `${element.position?.x || 0}px`,
                                  top: `${element.position?.y || 0}px`,
                                  userSelect: "none",
                                }}
                              >
                                {renderElemento(element)}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center absolute inset-0">
                          <p className="text-lg text-gray-400">
                            No hay mesas disponibles
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Leyenda */}
                    <div className="flex justify-center gap-6 mt-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        <span className="text-gray-600">Mesas Disponibles</span>
                      </div>
                      {/* <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span className="text-gray-600">Ocupado</span>
                      </div> */}
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
