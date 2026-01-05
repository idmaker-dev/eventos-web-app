import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Minus,
  Plus,
  RotateCcw,
  Eye,
  Save,
  Accessibility,
  Scan,
} from "lucide-react";
import { Button } from "@headlessui/react";
import { Tooltip } from "../ui/Tooltip.jsx";
import Mesa from "./Mesa.jsx";
import MesaRectangular from "./MesaRectangular.jsx";
import StatsPanel from "./StatsPanel.jsx";
import ModalMesaDetalles from "./ModalMesaDetalles.jsx";
import ModalRestricciones from "./ModalRestricciones.jsx";
import { useSignalRMonitor } from "../../hooks/useSignalRMonitor";
import { useSelectedEvent } from "../../contexts/SelectedEventContext";
import { useDisponibilidadMesas } from "../../hooks/useDisponibilidadMesas";
import eventService from "../../services/eventService";
import turnosService from "../../services/turnosService";

export default function DistribuccionMonitor({
  allElements,
  setAllElements,
  salon,
  invitados,
  setInvitados,
}) {
  const { eventoActual } = useSelectedEvent();
  
  // Hook para obtener disponibilidad de mesas con toda la información de ocupación
  const {
    elementos: elementosConDisponibilidad,
    cargarDisponibilidad,
    isLoading: cargandoDisponibilidad,
  } = useDisponibilidadMesas(eventoActual?.id, false);
  // ZOOM controls
  const [zoom, setZoom] = useState(0.3); // 30% zoom inicial
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showMesaModal, setShowMesaModal] = useState(false);
  const [mesaSeleccionadaModal, setMesaSeleccionadaModal] = useState(null);
  const [showDesignModal, setShowDesignModal] = useState(false);

  // Estados para invitados (igual que en DistribuccionNovios)
  const [activeInvitado, setActiveInvitado] = useState(null);
  const [invitadosSinAsignar, setInvitadosSinAsignar] = useState(
    invitados || []
  );
  const [guardando, setGuardando] = useState(false);
  const [invitadosPendientes, setInvitadosPendientes] = useState([]);
  const [invitadosCompletados, setInvitadosCompletados] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [cargandoDatos, setCargandoDatos] = useState(false);

  const openDesignModal = () => setShowDesignModal(true);
  const closeDesignModal = () => setShowDesignModal(false);
  // Modal de restricciones
  const [showRestrModal, setShowRestrModal] = useState(false);
  const [restricciones, setRestricciones] = useState({
    vegetariano: 0,
    vegano: 0,
    sinGluten: 0,
    alergiaMarisco: 0,
  });
  const [otra, setOtra] = useState("");
  const [pendingAsignacion, setPendingAsignacion] = useState(null);
  const [pendingNombre, setPendingNombre] = useState("");

  // Modal de bloqueo de mesas
  const [showBloqueoModal, setShowBloqueoModal] = useState(false);
  const [mesaParaBloqueo, setMesaParaBloqueo] = useState(null);
  const [motivoBloqueo, setMotivoBloqueo] = useState("");
  const [procesandoBloqueo, setProcesandoBloqueo] = useState(false);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isPanningRef = useRef(false);
  const panLastRef = useRef({ x: 0, y: 0 });

  const CANVAS_WIDTH = 4000;
  const CANVAS_HEIGHT = 2400;
  const ZOOM_STEP = 0.1;
  const ZOOM_MIN = 0.1;
  const ZOOM_MAX = 4;
  const ZOOM_DEFAULT = 0.3; // 30%

  // Zoom functions
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const zoomIn = () =>
    setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () =>
    setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));
  const resetZoom = () => {
    setZoom(ZOOM_DEFAULT);
    setOffset({ x: 0, y: 0 });
  };

  // Función para mostrar notificaciones
  const mostrarNotificacion = (mensaje, tipo) => {
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
  };

  // 🔄 Función para actualizar datos del monitor
  const actualizarDatosMonitor = useCallback(async () => {
    if (!eventoActual?.id || cargandoDatos) {
      return;
    }

    console.log('🔄 [Monitor] Actualizando datos del monitor...');
    setCargandoDatos(true);

    try {
      // 1. Cargar disponibilidad actualizada (incluye layout + ocupación de mesas)
      const resultadoDisponibilidad = await cargarDisponibilidad();
      if (resultadoDisponibilidad?.success) {
        const elementosActualizados = resultadoDisponibilidad.data?.layout?.elementos || [];
        console.log('✅ [Monitor] Layout actualizado:', elementosActualizados.length, 'elementos');
        console.log('✅ [Monitor] Elementos con disponibilidad:', elementosActualizados.filter(e => e.disponibilidad).length);
        
        // Log de tipos de elementos para debugging
        const tiposElementos = elementosActualizados.reduce((acc, el) => {
          acc[el.type] = (acc[el.type] || 0) + 1;
          return acc;
        }, {});
        console.log('📊 [Monitor] Tipos de elementos:', tiposElementos);
        
        setAllElements(elementosActualizados);
      }

      // 2. Cargar estado de invitados con turnos
      const resultadoEstado = await eventService.getEstadoInvitados(eventoActual.id);
      if (resultadoEstado?.success) {
        // Invitados pendientes: PENDIENTES + EN_CURSO + NO_PRESENTADOS
        const pendientes = resultadoEstado.porEstado?.pendientes || [];
        const enCurso = resultadoEstado.porEstado?.en_curso || [];
        const noPresentados = resultadoEstado.porEstado?.no_presentados || [];
        const todosLosPendientes = [...pendientes, ...enCurso, ...noPresentados];
        
        // Invitados completados: ya seleccionaron mesas
        const completados = resultadoEstado.porEstado?.completados || [];
        
        console.log('✅ [Monitor] Invitados pendientes:', todosLosPendientes.length);
        console.log('✅ [Monitor] Invitados completados:', completados.length);
        console.log('📊 [Monitor] Estadísticas:', resultadoEstado.estadisticas);
        
        setInvitadosPendientes(todosLosPendientes);
        setInvitadosCompletados(completados);
        setEstadisticas(resultadoEstado.estadisticas || {});
      }

      console.log('✅ [Monitor] Actualización completa');
    } catch (error) {
      console.error('❌ [Monitor] Error al actualizar datos:', error);
    } finally {
      setCargandoDatos(false);
    }
  }, [eventoActual?.id, cargarDisponibilidad, setAllElements, cargandoDatos]);

  // 📡 Callback para cuando se selecciona una mesa o se bloquea (SignalR)
  const handleMesaSeleccionada = useCallback(async (data) => {
    console.log('🔔 [Monitor] Notificación recibida:', data);
    console.log('🔔 [Monitor] Evento actual:', eventoActual?.id);
    console.log('🔔 [Monitor] Evento del mensaje:', data.eventoId);

    // Verificar que la notificación es para este evento
    if (data.eventoId !== eventoActual?.id) {
      console.log('ℹ️ [Monitor] Notificación para otro evento, ignorando');
      return;
    }

    // Manejar notificación de mesa bloqueada/desbloqueada
    if (data.mesa_id && typeof data.bloqueada !== 'undefined') {
      mostrarNotificacion(
        `🔒 Mesa ${data.mesa_id} ${data.bloqueada ? 'bloqueada' : 'desbloqueada'}${data.motivo ? ': ' + data.motivo : ''}`,
        data.bloqueada ? 'warning' : 'info'
      );
    }
    // Manejar notificación de mesa seleccionada
    else if (data.mesasSeleccionadas) {
      const mesasSeleccionadas = data.mesasSeleccionadas || [];
      mostrarNotificacion(
        `🔔 Mesas seleccionadas: ${mesasSeleccionadas.map(m => m.mesa_id).join(", ")}`,
        'info'
      );
    }

    // Actualizar datos del monitor en ambos casos
    await actualizarDatosMonitor();
  }, [eventoActual?.id, actualizarDatosMonitor]);

  // 🔌 Integrar hook de SignalR
  useSignalRMonitor(handleMesaSeleccionada);

  // 📊 Sincronizar elementos cuando se carguen desde el hook
  useEffect(() => {
    if (elementosConDisponibilidad && elementosConDisponibilidad.length > 0) {
      console.log('🔄 [Monitor] Sincronizando elementos desde hook:', elementosConDisponibilidad.length);
      
      // Verificar mesas bloqueadas
      const mesasBloqueadas = elementosConDisponibilidad.filter(el => 
        (el.type === 'mesa' || el.type === 'mesaRectangular') && 
        (el.disponibilidad?.esta_bloqueada || el.disponibilidad?.bloqueada || el.bloqueada)
      );
      
      if (mesasBloqueadas.length > 0) {
        console.log('🔒 [Monitor] Mesas bloqueadas detectadas:', mesasBloqueadas.map(m => ({
          numero: m.numero,
          id: m.id,
          esta_bloqueada: m.disponibilidad?.esta_bloqueada,
          bloqueada: m.disponibilidad?.bloqueada || m.bloqueada,
          motivo: m.disponibilidad?.motivo_bloqueo || m.motivo_bloqueo
        })));
      }
      
      setAllElements(elementosConDisponibilidad);
    }
  }, [elementosConDisponibilidad, setAllElements]);

  // 📊 Cargar datos iniciales al montar componente
  useEffect(() => {
    actualizarDatosMonitor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para asignar invitados a mesa
  const asignarInvitadosMesa = (numeroMesa, datosInvitado) => {
    const mesaSeleccionada = allElements.find(
      (el) =>
        el.numero === numeroMesa &&
        (el.type === "mesa" || el.type === "mesaRectangular")
    );

    if (!mesaSeleccionada) {
      mostrarNotificacion(`Mesa ${numeroMesa} no encontrada`, "error");
      return;
    }

    // Validar que la mesa no esté bloqueada (triple-check)
    const mesaBloqueada = mesaSeleccionada.disponibilidad?.esta_bloqueada || 
                          mesaSeleccionada.disponibilidad?.bloqueada || 
                          mesaSeleccionada.bloqueada;
    
    if (mesaBloqueada) {
      const motivo = mesaSeleccionada.disponibilidad?.motivo_bloqueo || 
                     mesaSeleccionada.motivo_bloqueo || 
                     'No especificado';
      
      mostrarNotificacion(
        `❌ La Mesa ${numeroMesa} está bloqueada.\n\n` +
        `Motivo: ${motivo}\n\n` +
        `Desbloquea la mesa antes de asignar invitados.`,
        "error"
      );
      return;
    }

    const cantidad = Number(datosInvitado?.cantidad || 1);
    const sillasEspecialesDisponibles = Array.isArray(
      mesaSeleccionada.sillasEspeciales
    )
      ? mesaSeleccionada.sillasEspeciales.length
      : typeof mesaSeleccionada.sillasEspeciales === "number"
      ? mesaSeleccionada.sillasEspeciales
      : 0;

    const personasEspecialesAsignadas = Number(
      mesaSeleccionada.invitadosEspeciales || 0
    );

    // Validar silla especial si es necesario
    if (datosInvitado?.necesidadEspecial) {
      if (sillasEspecialesDisponibles === 0) {
        mostrarNotificacion(
          `❌ La Mesa ${numeroMesa} no tiene sillas especiales.\n\n` +
            `${datosInvitado.nombre} requiere una silla de accesibilidad.\n` +
            `Busca una mesa con el ícono 🦽 que indica sillas especiales.`,
          "error"
        );
        return;
      }

      if (personasEspecialesAsignadas >= sillasEspecialesDisponibles) {
        mostrarNotificacion(
          `❌ Las sillas especiales de la Mesa ${numeroMesa} ya están ocupadas.\n\n` +
            `Sillas especiales: ${sillasEspecialesDisponibles}\n` +
            `Ya asignadas: ${personasEspecialesAsignadas}`,
          "error"
        );
        return;
      }
    }
    const espacioDisponible =
      Number(mesaSeleccionada.capacidad || 0) -
      Number(mesaSeleccionada.invitados || 0);

    if (espacioDisponible <= 0) {
      mostrarNotificacion(
        `❌ La Mesa ${numeroMesa} ya está llena (0 espacios disponibles).`,
        "error"
      );
      return;
    }

    if (cantidad > espacioDisponible) {
      mostrarNotificacion(
        `❌ No hay suficiente espacio en la Mesa ${numeroMesa}\n\n` +
          `Espacio disponible: ${espacioDisponible} asientos\n` +
          `Personas a asignar: ${cantidad}`,
        "error"
      );
      return;
    }

    // Abrir modal de restricciones
    setPendingAsignacion({ invitado: datosInvitado, numeroMesa });
    setPendingNombre(datosInvitado?.nombre || "");
    setRestricciones({
      vegetariano: 0,
      vegano: 0,
      sinGluten: 0,
      alergiaMarisco: 0,
    });
    setOtra("");
    setShowRestrModal(true);
  };
  //Confirmación desde ModalRestricciones
  const handleConfirmRestricciones = ({
    nombre,
    restricciones: res,
    otra: otraText,
    tipoMenu
  }) => {
    if (!pendingAsignacion) return;
    const { invitado, numeroMesa } = pendingAsignacion;

    const mesaSeleccionada = allElements.find(
      (el) =>
        el.numero === numeroMesa &&
        (el.type === "mesa" || el.type === "mesaRectangular")
    );
    if (!mesaSeleccionada) {
      mostrarNotificacion("Mesa no encontrada", "error");
      setShowRestrModal(false);
      setPendingAsignacion(null);
      return;
    }

    const cantidad = invitado.cantidad;

    // Actualizar estado local (el guardado en backend se hace con el botón "Guardar asignaciones")
    setAllElements((prev) =>
      prev.map((el) =>
        el.numero === numeroMesa &&
        (el.type === "mesa" || el.type === "mesaRectangular")
          ? {
              ...el,
              invitados: (el.invitados || 0) + cantidad,
              invitadosEspeciales: invitado.necesidadEspecial
                ? (el.invitadosEspeciales || 0) + cantidad
                : el.invitadosEspeciales || 0,
              assignedGuests: [
                ...(el.assignedGuests || []),
                {
                  id: invitado.id,
                  nombre: nombre || invitado.nombre,
                  cantidad,
                  restricciones: res,
                  otra: otraText,
                  tipoMenu: tipoMenu || "normal",
                  necesidadEspecial: invitado.necesidadEspecial || false,
                },
              ],
            }
          : el
      )
    );

    setInvitadosSinAsignar((prev) =>
      prev.filter((inv) => inv.id !== invitado.id)
    );

    mostrarNotificacion(
      `✅ ${nombre || invitado.nombre} asignado a Mesa ${numeroMesa}\n\n⚠️ Recuerda hacer clic en "Guardar asignaciones" para guardar los cambios`,
      "success"
    );

    setShowRestrModal(false);
    setPendingAsignacion(null);
    setPendingNombre("");
  };
  // Guardar asignaciones en el backend
  const guardarAsignaciones = async () => {
    if (!eventoActual?.id) {
      mostrarNotificacion("No hay evento seleccionado", "error");
      return;
    }

    setGuardando(true);

    try {
      // Recopilar todas las asignaciones por invitado
      const asignacionesPorInvitado = new Map();

      allElements.forEach((elemento) => {
        if (
          (elemento.type === "mesa" || elemento.type === "mesaRectangular") &&
          elemento.assignedGuests &&
          elemento.assignedGuests.length > 0
        ) {
          elemento.assignedGuests.forEach((guest) => {
            if (!asignacionesPorInvitado.has(guest.id)) {
              asignacionesPorInvitado.set(guest.id, {
                invitadoId: guest.id,
                nombreInvitado: guest.nombre,
                mesas: [],
              });
            }

            const invitadoData = asignacionesPorInvitado.get(guest.id);
            
            // Preparar array de personas para este invitado
            const personasArray = Array.from({ length: guest.cantidad }, (_, index) => ({
              nombre: index === 0 ? guest.nombre : `${guest.nombre} - Acompañante ${index + 1}`,
              tipoMenu: guest.tipoMenu || "normal",
              restricciones: guest.restricciones || {},
              otraRestriccion: guest.otra || ""
            }));

            invitadoData.mesas.push({
              mesa_id: elemento.id || `mesa-${elemento.numero}`,
              numero_mesa: elemento.numero,
              cantidad_personas: guest.cantidad,
              tipo_mesa: elemento.type || "mesa",
              personas: personasArray
            });
          });
        }
      });

      if (asignacionesPorInvitado.size === 0) {
        mostrarNotificacion("No hay asignaciones para guardar", "warning");
        setGuardando(false);
        return;
      }

      console.log(`💾 Guardando ${asignacionesPorInvitado.size} asignaciones en el backend...`);

      // Guardar cada asignación
      let exitosas = 0;
      let fallidas = 0;

      for (const [invitadoId, asignacion] of asignacionesPorInvitado) {
        try {
          const datosSeleccion = {
            mesas_seleccionadas: asignacion.mesas,
            personas: asignacion.mesas[0]?.personas || []
          };

          const resultado = await turnosService.guardarSeleccionAdmin(
            eventoActual.id,
            invitadoId,
            datosSeleccion
          );

          if (resultado.success) {
            exitosas++;
            console.log(`✅ Asignación guardada para ${asignacion.nombreInvitado}`);
          } else {
            fallidas++;
            console.error(`❌ Error al guardar asignación para ${asignacion.nombreInvitado}:`, resultado.error);
          }
        } catch (error) {
          fallidas++;
          console.error(`❌ Error al guardar asignación para ${asignacion.nombreInvitado}:`, error);
        }
      }

      // Guardar también en localStorage (para compatibilidad con sistema legacy)
      const asignacionesMonitor = {
        elementos: [...allElements],
        invitadosSinAsignar: [...invitadosSinAsignar],
        fecha: new Date().toISOString(),
        salon: salon?.nombre || "Monitor",
      };
      localStorage.setItem("asignacionesMonitor", JSON.stringify(asignacionesMonitor));

      // Refrescar disponibilidad desde el backend
      if (cargarDisponibilidad) {
        await cargarDisponibilidad();
      }

      setGuardando(false);

      if (fallidas === 0) {
        mostrarNotificacion(
          `✅ ¡Todas las asignaciones guardadas exitosamente!\n\nTotal: ${exitosas} invitados`,
          "success"
        );
      } else if (exitosas > 0) {
        mostrarNotificacion(
          `⚠️ Asignaciones guardadas parcialmente\n\nExitosas: ${exitosas}\nFallidas: ${fallidas}`,
          "warning"
        );
      } else {
        mostrarNotificacion(
          `❌ Error al guardar asignaciones\n\nNinguna asignación pudo ser guardada`,
          "error"
        );
      }
    } catch (error) {
      console.error("❌ Error general al guardar asignaciones:", error);
      setGuardando(false);
      mostrarNotificacion(
        `❌ Error al guardar asignaciones: ${error.message}`,
        "error"
      );
    }
  };

  // Abrir modal para bloquear/desbloquear mesa
  const abrirModalBloqueo = (mesa) => {
    setMesaParaBloqueo(mesa);
    setMotivoBloqueo(mesa.motivo_bloqueo || "");
    setShowBloqueoModal(true);
  };

  // Confirmar bloqueo/desbloqueo de mesa
  const confirmarBloqueoMesa = async () => {
    if (!mesaParaBloqueo || !eventoActual?.id) return;

    // Triple-check del estado de bloqueo
    const estaBloqueada = mesaParaBloqueo.disponibilidad?.esta_bloqueada || 
                          mesaParaBloqueo.disponibilidad?.bloqueada || 
                          mesaParaBloqueo.bloqueada || 
                          false;
    const nuevoEstado = !estaBloqueada;

    // Validar motivo si se está bloqueando
    if (nuevoEstado && !motivoBloqueo.trim()) {
      mostrarNotificacion(
        "⚠️ Debes proporcionar un motivo para bloquear la mesa",
        "warning"
      );
      return;
    }

    setProcesandoBloqueo(true);

    try {
      const resultado = await eventService.bloquearMesa(
        eventoActual.id,
        mesaParaBloqueo.id,
        nuevoEstado,
        nuevoEstado ? motivoBloqueo : ""
      );

      if (resultado.success) {
        mostrarNotificacion(
          `✅ Mesa ${mesaParaBloqueo.numero} ${nuevoEstado ? 'bloqueada' : 'desbloqueada'} exitosamente`,
          "success"
        );

        // Actualizar datos del monitor
        await actualizarDatosMonitor();

        // Cerrar modal
        setShowBloqueoModal(false);
        setMesaParaBloqueo(null);
        setMotivoBloqueo("");
      } else {
        mostrarNotificacion(
          `❌ Error: ${resultado.error}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error al bloquear/desbloquear mesa:", error);
      mostrarNotificacion(
        "❌ Error inesperado al modificar el estado de la mesa",
        "error"
      );
    } finally {
      setProcesandoBloqueo(false);
    }
  };

  // Canvas pan handlers (solo visualización, no edición)
  const handleMouseDownCanvas = (e) => {
    const startPan =
      e.button === 1 || e.altKey || e.code === "Space" || e.shiftKey;
    if (!startPan) return;
    isPanningRef.current = true;
    panLastRef.current = { x: e.clientX, y: e.clientY };
    if (containerRef.current) containerRef.current.style.cursor = "grabbing";
  };

  const handleMouseMoveCanvas = (e) => {
    if (!isPanningRef.current) return;
    const dx = (e.clientX - panLastRef.current.x) / zoom;
    const dy = (e.clientY - panLastRef.current.y) / zoom;
    panLastRef.current = { x: e.clientX, y: e.clientY };
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleMouseUpCanvas = () => {
    if (!isPanningRef.current) return;
    isPanningRef.current = false;
    if (containerRef.current) containerRef.current.style.cursor = "default";
  };

  // Fit to view
  const fitToView = () => {
    if (!containerRef.current || !allElements || allElements.length === 0) {
      resetZoom();
      return;
    }
    resetZoom();
  };

  // Modal para detalles de mesa
  const openMesaModal = (numeroMesa) => {
    const mesa = allElements.find(
      (el) =>
        el.numero === numeroMesa &&
        (el.type === "mesa" || el.type === "mesaRectangular")
    );
    if (!mesa) {
      alert(`Mesa ${numeroMesa} no encontrada`);
      return;
    }
    setMesaSeleccionadaModal(mesa);
    setShowMesaModal(true);
  };

  const closeMesaModal = () => {
    setShowMesaModal(false);
    setMesaSeleccionadaModal(null);
  };

  // Componente para invitados arrastrables
  const InvitadoDraggable = ({ invitado }) => {
    return (
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", JSON.stringify(invitado));
          setActiveInvitado(invitado);
        }}
        onDragEnd={() => setActiveInvitado(null)}
        className="flex justify-between items-center bg-white dark:bg-black p-3 rounded-lg border-2 border-dashed border-gray-200 cursor-move hover:bg-gray-100 transition-colors hover:shadow-md"
      >
        <div className="flex gap-3 items-center">
          <div className="font-medium text-gray-800 dark:text-gray-300">
            {invitado.nombre}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">
              ({invitado.cantidad} personas)
            </span>
          </div>
        </div>
        {invitado.necesidadEspecial && (
          <div
            title="Necesita silla especial 🦽"
            className="flex items-center gap-1 bg-Acapulco/40 text-casal dark:text-gray-300 px-2 py-1 rounded-full text-xs cursor-default"
          >
            <Accessibility className="w-3 h-3" />
          </div>
        )}
      </div>
    );
  };

  // Calcular estadísticas
  const totalPersonasSinAsignar = invitadosSinAsignar.reduce(
    (total, inv) => total + inv.cantidad,
    0
  );
  const mesas = allElements.filter(
    (el) => el.type === "mesa" || el.type === "mesaRectangular"
  );
  const totalInvitadosAsignados = mesas.reduce(
    (total, mesa) => total + (mesa.invitados || 0),
    0
  );
  const totalCapacidad = mesas.reduce(
    (total, mesa) => total + (mesa.capacidad || 0),
    0
  );
  const mesasOcupadas = mesas.filter((mesa) => mesa.invitados > 0).length;
  const totalMesas = mesas.length;
  const porcentajeCapacidadUtilizada =
    totalCapacidad > 0
      ? Math.round((totalInvitadosAsignados / totalCapacidad) * 100)
      : 0;

  // Calcular estadísticas (solo lectura)
  const calcularEstadisticas = () => {
    const mesas = allElements.filter(
      (el) => el.type === "mesa" || el.type === "mesaRectangular"
    );
    if (mesas.length === 0) {
      return {
        disponibles: 0,
        pocoLlenas: 0,
        medias: 0,
        casiLlenas: 0,
        ocupadas: 0,
        sillasEspeciales: 0,
        totalMesas: 0,
        totalCapacidad: 0,
        totalOcupados: 0,
        porcentajeCapacidadUtilizada: 0,
        mesasOcupadas: 0,
      };
    }

    let asientosDisponibles = 0,
      asientosPocoLlenos = 0,
      asientosMedios = 0;
    let asientosCasiLlenos = 0,
      asientosOcupados = 0,
      sillasEspeciales = 0;
    let totalCapacidad = 0,
      totalOcupados = 0;

    mesas.forEach((mesa) => {
      const porcentajeOcupacion = (mesa.invitados / mesa.capacidad) * 100;
      if (porcentajeOcupacion === 0) {
        asientosDisponibles += mesa.capacidad;
      } else if (porcentajeOcupacion <= 50) {
        asientosPocoLlenos += mesa.invitados;
        asientosDisponibles += mesa.capacidad - mesa.invitados;
      } else if (porcentajeOcupacion <= 80) {
        asientosMedios += mesa.invitados;
        asientosDisponibles += mesa.capacidad - mesa.invitados;
      } else if (porcentajeOcupacion < 100) {
        asientosCasiLlenos += mesa.invitados;
        asientosDisponibles += mesa.capacidad - mesa.invitados;
      } else {
        asientosOcupados += mesa.invitados;
      }

      if (mesa.sillasEspeciales && mesa.sillasEspeciales.length > 0) {
        sillasEspeciales += mesa.sillasEspeciales.length;
      }
      totalCapacidad += mesa.capacidad;
      totalOcupados += mesa.invitados;
    });

    return {
      disponibles: asientosDisponibles,
      pocoLlenas: asientosPocoLlenos,
      medias: asientosMedios,
      casiLlenas: asientosCasiLlenos,
      ocupadas: asientosOcupados,
      sillasEspeciales,
      totalMesas: mesas.length,
      totalCapacidad,
      totalOcupados,
      porcentajeCapacidadUtilizada:
        Math.round((totalOcupados / totalCapacidad) * 100) || 0,
      mesasOcupadas: mesas.filter((m) => m.invitados > 7).length,
    };
  };

  // Render elemento (sin botones de eliminar)
  const renderElementMonitor = (element) => {
    // Aplicar transformaciones del layout (rotation, scale)
    const rotation = element.rotation || 0;
    const scale = element.scale || 1;
    const scaleX = element.scaleX || scale;
    const scaleY = element.scaleY || scale;
    
    const transformStyle = { 
      transform: `rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`,
      transformOrigin: 'center center'
    };

    if (element.type === "mesa") {
      // Obtener invitados asignados desde disponibilidad (backend actualizado) o fallback a element.invitados
      const invitadosAsignados = element.disponibilidad 
        ? element.disponibilidad.asientos_ocupados 
        : element.invitados;
      
      // 🔒 Triple-check para detectar mesas bloqueadas (mismo que AsignacionUser)
      const estaBloqueada = element.disponibilidad?.esta_bloqueada || 
                            element.disponibilidad?.bloqueada || 
                            element.bloqueada || 
                            false;
      const motivoBloqueo = element.disponibilidad?.motivo_bloqueo || 
                            element.motivo_bloqueo || 
                            '';
      
      // Log de debugging para verificar detección de bloqueo
      if (estaBloqueada) {
        console.log(`🔒 [Monitor] Mesa ${element.numero} detectada como bloqueada:`, {
          esta_bloqueada: element.disponibilidad?.esta_bloqueada,
          bloqueada_disp: element.disponibilidad?.bloqueada,
          bloqueada_dir: element.bloqueada,
          motivo: motivoBloqueo
        });
      }
      
      return (
        <div className="relative cursor-pointer group" style={transformStyle}>
          <Mesa
            numeroMesa={element.numero}
            invitadosAsignados={invitadosAsignados}
            capacidadMaxima={element.capacidad}
            sillasEspeciales={element.sillasEspeciales || []}
            invitadosEspeciales={element.invitadosEspeciales || 0}
            onDrop={estaBloqueada ? undefined : asignarInvitadosMesa}
            onDoubleClick={() => openMesaModal(element.numero)}
            readOnly={false}
          />
          {/* Overlay para mesas bloqueadas */}
          {estaBloqueada && (
            <div 
              className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px] rounded-full flex items-center justify-center pointer-events-none border-2 border-red-500/40"
              title={motivoBloqueo ? `Bloqueada: ${motivoBloqueo}` : 'Mesa bloqueada'}
            >
              <div className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg">
                🔒 BLOQUEADA
              </div>
            </div>
          )}
          {/* Indicador de bloqueo en esquina */}
          {estaBloqueada && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg z-10">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {/* Botón mejorado de bloqueo/desbloqueo - Siempre visible */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              abrirModalBloqueo(element);
            }}
            className={`absolute -bottom-3 left-1/2 -translate-x-1/2 transition-all rounded-lg px-3 py-1.5 shadow-lg z-10 flex items-center gap-1.5 font-semibold text-xs ${
              estaBloqueada
                ? 'bg-green-500 hover:bg-green-600 hover:scale-105'
                : 'bg-red-500 hover:bg-red-600 hover:scale-105 opacity-0 group-hover:opacity-100'
            } text-white`}
            title={estaBloqueada ? 'Clic para desbloquear mesa' : 'Clic para bloquear mesa'}
          >
            {estaBloqueada ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                </svg>
                <span>Desbloquear</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Bloquear</span>
              </>
            )}
          </button>
        </div>
      );
    }

    if (element.type === "mesaRectangular") {
      // Obtener invitados asignados desde disponibilidad (backend actualizado) o fallback a element.invitados
      const invitadosAsignados = element.disponibilidad 
        ? element.disponibilidad.asientos_ocupados 
        : element.invitados;
      
      // 🔒 Triple-check para detectar mesas bloqueadas (mismo que AsignacionUser)
      const estaBloqueada = element.disponibilidad?.esta_bloqueada || 
                            element.disponibilidad?.bloqueada || 
                            element.bloqueada || 
                            false;
      const motivoBloqueo = element.disponibilidad?.motivo_bloqueo || 
                            element.motivo_bloqueo || 
                            '';
      
      return (
        <div className="relative cursor-pointer group" style={transformStyle}>
          <MesaRectangular
            numeroMesa={element.numero}
            invitadosAsignados={invitadosAsignados}
            capacidadMaxima={element.capacidad}
            sillasEspeciales={element.sillasEspeciales || []}
            invitadosEspeciales={element.invitadosEspeciales || 0}
            onDrop={estaBloqueada ? undefined : asignarInvitadosMesa}
            onDoubleClick={() => openMesaModal(element.numero)}
            readOnly={false}
          />
          {/* Overlay para mesas bloqueadas */}
          {estaBloqueada && (
            <div 
              className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px] rounded-lg flex items-center justify-center pointer-events-none border-2 border-red-500/40"
              title={motivoBloqueo ? `Bloqueada: ${motivoBloqueo}` : 'Mesa bloqueada'}
            >
              <div className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg">
                🔒 BLOQUEADA
              </div>
            </div>
          )}
          {/* Indicador de bloqueo en esquina */}
          {estaBloqueada && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg z-10">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {/* Botón mejorado de bloqueo/desbloqueo - Siempre visible */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              abrirModalBloqueo(element);
            }}
            className={`absolute -bottom-3 left-1/2 -translate-x-1/2 transition-all rounded-lg px-3 py-1.5 shadow-lg z-10 flex items-center gap-1.5 font-semibold text-xs ${
              estaBloqueada
                ? 'bg-green-500 hover:bg-green-600 hover:scale-105'
                : 'bg-red-500 hover:bg-red-600 hover:scale-105 opacity-0 group-hover:opacity-100'
            } text-white`}
            title={estaBloqueada ? 'Clic para desbloquear mesa' : 'Clic para bloquear mesa'}
          >
            {estaBloqueada ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 15.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                </svg>
                <span>Desbloquear</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Bloquear</span>
              </>
            )}
          </button>
        </div>
      );
    }

    // Renderizar otros elementos (sin botones de eliminar) con transformaciones
    const elementContent = (() => {
      switch (element.type) {
        case "entrada":
          return (
            <div className="rounded px-6 py-1 rotate-90 border flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold bg-gray-50 dark:bg-slate-800 whitespace-nowrap">
              Entrada
            </div>
          );
        case "barra":
          return (
            <div className="border-2 border-separate border-dashed border-gray-300 w-24 h-24 flex items-center justify-center text-center p-2 rounded-md text-gray-500 dark:text-gray-300 font-semibold bg-white dark:bg-slate-800 shadow">
              Barra
            </div>
          );
        case "mesa-principal":
          return (
            <div className="rounded px-6 py-3 w-48 border-separate border-2 border-dashed text-center text-gray-600 dark:text-gray-300 font-semibold bg-gray-50 dark:bg-slate-800">
              Mesa principal <br />
              <span className="text-gray-500 text-sm italic">Ana y Juan</span>
            </div>
          );
        case "pistaBaileRedonda":
          return (
            <div className="w-40 h-40 text-center border-cafe border-2 border-dashed flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold bg-cafe/10 rounded-full">
              <span className="text-cafe text-lg font-bold">
                Pista de <br /> Baile
              </span>
            </div>
          );
        case "pistaBaileRectangular":
          return (
            <div className="w-64 h-28 text-center border-cafe border-2 border-dashed flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold bg-cafe/10 rounded-lg">
              <span className="text-cafe text-lg font-bold">
                Pista de <br /> Baile
              </span>
            </div>
          );
        case "pistaBaileCuadrada":
          return (
            <div className="w-40 h-40 text-center border-cafe border-2 border-dashed flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold bg-cafe/10 rounded-md">
              <span className="text-cafe text-lg font-bold">
                Pista de <br /> Baile
              </span>
            </div>
          );
        case "escenario":
          return (
            <div className="border-2 border-separate border-dashed border-gray-300 w-28 h-28 flex flex-col items-center justify-center text-center p-2 rounded-md text-gray-500 dark:text-gray-300 font-semibold bg-white dark:bg-slate-800">
              <p>ESCENARIO</p>
              <p className="text-xs mt-1">DJ Música</p>
            </div>
          );
        case "buffet":
          return (
            <div className="border-2 border-separate border-dashed border-gray-300 w-28 h-20 flex items-center justify-center text-center p-2 rounded-md text-gray-500 dark:text-gray-300 font-semibold bg-white dark:bg-slate-800">
            BUFFET
          </div>
        );
        default:
          return null;
      }
    })();

    // Envolver el contenido con las transformaciones
    return (
      <div style={transformStyle}>
        {elementContent}
      </div>
    );
  };

  // eslint-disable-next-line no-unused-vars
  const stats = calcularEstadisticas();

  const saveFromModal = () => {
    guardarAsignaciones && guardarAsignaciones();
    closeDesignModal();
  };

  return (
    <div className="min-h-screen">
      <div className="p-4">
        {/* Header Monitor */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Eye className="w-6 h-6 text-green-600" />
                Monitor en Vivo - {salon?.nombre || "Salón Principal"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Asignación en tiempo real de invitados
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Modo Monitor - Asignación Activa
            </div>
            {/* Contador de mesas bloqueadas */}
            {(() => {
              const mesasBloqueadas = allElements.filter(
                (el) => (el.type === "mesa" || el.type === "mesaRectangular") && 
                        (el.disponibilidad?.esta_bloqueada || el.disponibilidad?.bloqueada || el.bloqueada)
              ).length;
              return mesasBloqueadas > 0 ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg text-sm font-medium">
                  🔒 {mesasBloqueadas} {mesasBloqueadas === 1 ? 'Mesa bloqueada' : 'Mesas bloqueadas'}
                </div>
              ) : null;
            })()}
            <Button
              onClick={guardarAsignaciones}
              disabled={guardando}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                guardando
                  ? "bg-casal text-white cursor-not-allowed"
                  : "bg-Acapulco text-white hover:bg-casal/90 hover:shadow-lg"
              }`}
            >
              <Save className={`w-4 h-4 ${guardando ? "animate-pulse" : ""}`} />
              {guardando ? "Guardando..." : "Guardar Asignaciones"}
            </Button>
          </div>
        </div>

        {/* Contenedor principal con lista de invitados y plano */}
        <div className="flex flex-col xl:flex-row gap-6 mt-6">
          {/* Lista de Invitados */}
          <div className="w-full xl:w-80 flex-shrink-0 space-y-4">
            {/* 🔴 Panel de Invitados SIN SELECCIÓN (Principal) */}
            <div className="bg-fondoVs dark:bg-[#1a1a1a] py-6 px-3 rounded-lg shadow-sm border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  Sin Selección
                  <span className="text-sm text-gray-500 font-normal">
                    ({invitadosPendientes.length})
                  </span>
                </p>
                {cargandoDatos && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                )}
              </div>

              <div className="max-h-[24rem] overflow-y-auto">
                {invitadosPendientes.length > 0 ? (
                  <ul className="space-y-2">
                    {invitadosPendientes.map((turno) => {
                      // Determinar color según estado
                      const esNoPresentado = turno.estado === 'NO_PRESENTADO';
                      const esEnCurso = turno.estado === 'EN_CURSO';
                      
                      return (
                        <li 
                          key={turno.invitado_id}
                          draggable
                          onDragStart={(e) => {
                            const invitadoData = {
                              id: turno.invitado_id,
                              nombre: turno.invitado_nombre || `Invitado #${turno.invitado_numero}`,
                              cantidad: turno.cantidad_boletos || 1,
                              necesidadEspecial: false,
                              turno_numero: turno.turno_numero,
                              estado: turno.estado
                            };
                            e.dataTransfer.setData("text/plain", JSON.stringify(invitadoData));
                            setActiveInvitado(invitadoData);
                          }}
                          onDragEnd={() => setActiveInvitado(null)}
                          className={`p-3 border rounded-lg cursor-move hover:shadow-md transition-all ${
                            esNoPresentado 
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 hover:border-red-400'
                              : esEnCurso
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 hover:border-blue-400'
                              : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 hover:border-orange-400'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-2 h-2 mt-1.5 rounded-full ${
                              esNoPresentado 
                                ? 'bg-red-500'
                                : esEnCurso 
                                ? 'bg-blue-500 animate-pulse' 
                                : 'bg-orange-500'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">
                                    {turno.invitado_nombre || `Invitado #${turno.invitado_numero}`}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                    {turno.cantidad_boletos} {turno.cantidad_boletos === 1 ? 'persona' : 'personas'} • Turno #{turno.turno_numero}
                                  </p>
                                </div>
                                {esNoPresentado && (
                                  <span className="text-xs px-2 py-0.5 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full font-medium flex-shrink-0">
                                    No presentado
                                  </span>
                                )}
                                {esEnCurso && (
                                  <span className="text-xs px-2 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full font-medium flex-shrink-0">
                                    En curso
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {turno.detalle}
                              </p>
                              {turno.notificado && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                                  <span>✓</span> Notificado
                                </p>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <div className="text-3xl mb-2">🎉</div>
                    <p className="font-medium text-sm">
                      ¡Todos han seleccionado mesa!
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span>💡</span>
                  <span>
                    Arrastra el invitado a una mesa para asignarlo manualmente. 
                    Si no pueden acceder, contáctalos para asistirlos.
                  </span>
                </p>
              </div>
            </div>

            {/* ✅ Panel de Invitados COMPLETADOS (Secundario) */}
            <div className="bg-fondoVs dark:bg-[#1a1a1a] py-4 px-3 rounded-lg shadow-sm border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-3">
                <p className="text-base font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Selección Completada
                  <span className="text-xs text-gray-500 font-normal">
                    ({invitadosCompletados.length})
                  </span>
                </p>
              </div>

              <div className="max-h-[12rem] overflow-y-auto">
                {invitadosCompletados.length > 0 ? (
                  <ul className="space-y-1.5">
                    {invitadosCompletados.map((turno) => (
                      <li 
                        key={turno.invitado_id}
                        className="p-2 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-md"
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 mt-1 bg-green-500 rounded-full flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 dark:text-gray-200 text-xs truncate">
                              {turno.invitado_nombre || `Invitado #${turno.invitado_numero}`}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {turno.cantidad_boletos} {turno.cantidad_boletos === 1 ? 'persona' : 'personas'}
                            </p>
                            {turno.tiene_seleccion && (
                              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                                ✓ Mesa asignada
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-3 text-gray-500">
                    <p className="text-xs">
                      Ningún invitado ha completado su selección aún
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Panel de Invitados sin Asignar */}
            {/* <div className="bg-fondoVs dark:bg-[#1a1a1a] py-6 px-3 rounded-lg shadow-sm">
              <p className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 flex items-center justify-between gap-2">
                Invitados sin Asignar
                <span className="text-sm text-gray-500 font-normal">
                  ({totalPersonasSinAsignar} personas)
                </span>
              </p>

              <div className="max-h-[32rem] overflow-y-auto">
                {invitadosSinAsignar.length > 0 ? (
                  <ul className="space-y-3">
                    {invitadosSinAsignar.map((invitado) => (
                      <li key={invitado.id}>
                        <InvitadoDraggable invitado={invitado} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🎉</div>
                    <p className="font-medium">
                      ¡Todos los invitados asignados!
                    </p>
                    <p className="text-sm">Perfecta distribución</p>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-white dark:bg-black border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Arrastra los invitados a las mesas del plano para asignar
                  lugares.
                </p>
              </div>
            </div> */}
          </div>

          {/* Plano del Salón */}
          <div className="flex-1 min-w-0">
            <div className=" overflow-hiddenrounded-md">
              <div className="p-4 border-b rounded-t-lg border-gray-100 flex justify-between items-center bg-fondoVs dark:bg-[#1a1a1a]">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Plano del Salón - "Jardín Romántico"
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-1">
                  <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                    💡 Arrastra invitados a las mesas o haz doble clic para
                    detalles
                  </p>
                </div>
              </div>

              {/* Área de Visualización */}
              <div
                ref={containerRef}
                className="overflow-x-auto overflow-y-auto"
                style={{ height: "600px", maxHeight: "600px" }}
                onMouseDown={handleMouseDownCanvas}
                onMouseMove={handleMouseMoveCanvas}
                onMouseUp={handleMouseUpCanvas}
                onMouseLeave={handleMouseUpCanvas}
              >
                <div
                  className="relative bg-gray-50 dark:bg-[#1a1a1a] overflow-hidden"
                  style={{
                    height: `${CANVAS_HEIGHT}px`,
                    minHeight: `${CANVAS_HEIGHT}px`,
                    minWidth: `${CANVAS_WIDTH}px`,
                    width: `${CANVAS_WIDTH}px`,
                  }}
                >
                  <div
                    ref={canvasRef}
                    className="absolute left-0 top-0 origin-top-left"
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                      transformOrigin: "0 0",
                      width: `${CANVAS_WIDTH}px`,
                      height: `${CANVAS_HEIGHT}px`,
                    }}
                  >
                    {allElements.map((element) => (
                      <div
                        key={element.id}
                        style={{
                          position: "absolute",
                          left: `${element.position.x}px`,
                          top: `${element.position.y}px`,
                          zIndex: 1,
                        }}
                      >
                        {renderElementMonitor(element)}
                      </div>
                    ))}
                  </div>

                  <div
                    className="absolute inset-0 pointer-events-none opacity-5"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, #ec4899 1px, transparent 1px),
                        linear-gradient(to bottom, #ec4899 1px, transparent 1px)
                      `,
                      backgroundSize: "40px 40px",
                    }}
                  />
                </div>
              </div>

              <div className="bg-fondoVs dark:bg-[#1a1a1a] border-t rounded-b-lg border-green-200 px-4 py-2">
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span className="font-medium">
                    ↔ Scroll horizontal | ↕ Scroll vertical para navegar
                  </span>
                  <span className="text-gray-500">
                    Modo Monitor - Asignación activa
                  </span>
                  <div className="inline-flex items-center gap-2 ml-3">
                    <Button
                      onClick={zoomOut}
                      className="px-2 py-2 bg-white border rounded hover:bg-green-100 hover:text-green-700 dark:bg-slate-900 dark:text-gray-100 dark:hover:bg-green-800"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <div className="px-3 py-1 bg-white dark:bg-slate-800 dark:text-gray-50 border rounded text-sm">
                      {Math.round(zoom * 100)}%
                    </div>
                    <Button
                      onClick={zoomIn}
                      className="px-2 py-2 bg-white border rounded hover:bg-green-100 hover:text-green-700 dark:bg-slate-900 dark:text-gray-100 dark:hover:bg-green-800"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Tooltip content="Amplear pantalla" position="top">
                      <Button
                        onClick={openDesignModal}
                        className="ml-2 px-2 py-2 bg-casal text-white rounded hover:opacity-90 text-sm"
                      >
                        <Scan className="w-3 h-3" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Ajustar vista ( f )" position="left">
                      <Button
                        onClick={fitToView}
                        className="ml-2 px-2 py-2 bg-white border rounded hover:bg-green-100 hover:text-green-700 dark:bg-slate-900 dark:text-gray-100 dark:hover:bg-green-800 text-sm"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="mt-4 text-sm text-gray-700 bg-fondoVs dark:bg-[#1a1a1a]  px-4 py-3 rounded-lg border-gray-500 shadow-sm">
                <div className="flex items-center gap-6 text-center">
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-100">
                      Invitados:
                    </span>
                    <span className="ml-2 font-bold text-blue-600">
                      {totalInvitadosAsignados}/{estadisticas.total}
                    </span>
                    <span className="ml-2 font-medium text-gray-600 dark:text-gray-100">
                      Asignados
                    </span>
                  </div>
                  <div className="w-[0.2rem] h-4 bg-gray-300 rounded"></div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-100">
                      Mesas Ocupadas:
                    </span>
                    <span className="ml-2 font-bold text-amber-600">
                      {mesasOcupadas}/{totalMesas}
                    </span>
                  </div>
                  <div className="w-[0.2rem] h-4 bg-gray-300 rounded"></div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-100">
                      Capacidad utilizada:
                    </span>
                    <span
                      className={`ml-2 font-bold ${
                        porcentajeCapacidadUtilizada >= 90
                          ? "text-red-600"
                          : porcentajeCapacidadUtilizada >= 70
                          ? "text-orange-600"
                          : porcentajeCapacidadUtilizada >= 50
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {porcentajeCapacidadUtilizada}%
                    </span>
                  </div>
                  <div className="w-[0.2rem] h-4 bg-gray-300 rounded"></div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-100">
                      Sin Asignar:
                    </span>
                    <span
                      className={`ml-2 font-bold ${
                        (estadisticas.sin_seleccion || 0) > 0
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {estadisticas.sin_seleccion || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRestrModal && (
        <ModalRestricciones
          isOpen={showRestrModal}
          onClose={() => {
            setShowRestrModal(false);
            setPendingAsignacion(null);
          }}
          invitado={pendingAsignacion?.invitado}
          mesaNumero={pendingAsignacion?.numeroMesa}
          restricciones={restricciones}
          setRestricciones={setRestricciones}
          otra={otra}
          setOtra={setOtra}
          nombre={pendingNombre}
          setNombre={setPendingNombre}
          onConfirm={handleConfirmRestricciones}
        />
      )}

      {showMesaModal && (
        <ModalMesaDetalles
          isOpen={showMesaModal}
          onClose={closeMesaModal}
          mesa={mesaSeleccionadaModal}
          isMonitorMode={true}
        />
      )}

      {/* Modal de Bloqueo de Mesa */}
      {showBloqueoModal && mesaParaBloqueo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${
                mesaParaBloqueo.disponibilidad?.esta_bloqueada || mesaParaBloqueo.disponibilidad?.bloqueada || mesaParaBloqueo.bloqueada
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {mesaParaBloqueo.disponibilidad?.esta_bloqueada || mesaParaBloqueo.disponibilidad?.bloqueada || mesaParaBloqueo.bloqueada
                  ? '🔓 Desbloquear Mesa'
                  : '🔒 Bloquear Mesa'} {mesaParaBloqueo.numero}
              </h3>
              <button
                onClick={() => {
                  setShowBloqueoModal(false);
                  setMesaParaBloqueo(null);
                  setMotivoBloqueo("");
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={procesandoBloqueo}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {mesaParaBloqueo.disponibilidad?.esta_bloqueada || mesaParaBloqueo.disponibilidad?.bloqueada || mesaParaBloqueo.bloqueada ? (
              <div className="mb-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg mb-4">
                  <p className="text-base text-green-800 dark:text-green-300 mb-3 font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                    </svg>
                    Mesa actualmente BLOQUEADA
                  </p>
                  {(mesaParaBloqueo.disponibilidad?.motivo_bloqueo || mesaParaBloqueo.motivo_bloqueo) && (
                    <p className="text-sm text-green-700 dark:text-green-400 ml-7">
                      <strong>Motivo del bloqueo:</strong> {mesaParaBloqueo.disponibilidad?.motivo_bloqueo || mesaParaBloqueo.motivo_bloqueo}
                    </p>
                  )}
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">
                    🔓 Al DESBLOQUEAR esta mesa:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                    <li>• Los invitados podrán verla y seleccionarla</li>
                    <li>• Aparecerá como disponible en el sistema</li>
                    <li>• Se eliminará la restricción de acceso</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Bloquear esta mesa impedirá que los invitados la seleccionen. Proporciona un motivo:
                </p>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motivo del bloqueo <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={motivoBloqueo}
                  onChange={(e) => setMotivoBloqueo(e.target.value)}
                  placeholder="Ej: Reservada para VIP, Mesa dañada, etc."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 resize-none"
                  rows="3"
                  disabled={procesandoBloqueo}
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBloqueoModal(false);
                  setMesaParaBloqueo(null);
                  setMotivoBloqueo("");
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                disabled={procesandoBloqueo}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarBloqueoMesa}
                disabled={procesandoBloqueo || (!(mesaParaBloqueo.disponibilidad?.esta_bloqueada || mesaParaBloqueo.disponibilidad?.bloqueada || mesaParaBloqueo.bloqueada) && !motivoBloqueo.trim())}
                className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-base ${
                  procesandoBloqueo || (!(mesaParaBloqueo.disponibilidad?.esta_bloqueada || mesaParaBloqueo.disponibilidad?.bloqueada || mesaParaBloqueo.bloqueada) && !motivoBloqueo.trim())
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : mesaParaBloqueo.disponibilidad?.esta_bloqueada || mesaParaBloqueo.disponibilidad?.bloqueada || mesaParaBloqueo.bloqueada
                    ? 'bg-green-500 hover:bg-green-600 hover:shadow-lg text-white'
                    : 'bg-red-500 hover:bg-red-600 hover:shadow-lg text-white'
                }`}
              >
                {procesandoBloqueo ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : mesaParaBloqueo.disponibilidad?.esta_bloqueada || mesaParaBloqueo.disponibilidad?.bloqueada || mesaParaBloqueo.bloqueada ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                    </svg>
                    Sí, DESBLOQUEAR Mesa
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Confirmar BLOQUEO
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DISEÑO FULLSCREEN */}
      {showDesignModal && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-stretch">
          <div className="m-auto w-full h-full bg-white dark:bg-gray-900 relative flex flex-col">
            {/* Barra superior de herramientas */}
            <div className="flex p-3 border-b bg-fondoVs dark:bg-gray-800">
              <div>
                <img
                  src="/logoTentativo2.svg"
                  alt="Logo P"
                  className="object-contain rounded-full w-full h-12"
                />
              </div>
              <div className="flex items-center justify-between w-full ml-4">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={zoomOut}
                    className="px-2 py-2 bg-white border rounded dark:bg-slate-900 dark:text-gray-100 dark:hover:bg-Acapulco hover:bg-Acapulco hover:text-white shadow-sm"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <div className="px-3 py-1 bg-white dark:bg-gray-900 dark:text-gray-200 border rounded text-sm">
                    {Math.round(zoom * 100)}%
                  </div>
                  <Button
                    onClick={zoomIn}
                    className="px-2 py-2 bg-white border rounded dark:bg-slate-900 dark:text-gray-100 dark:hover:bg-Acapulco hover:bg-Acapulco hover:text-white shadow-sm"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={resetZoom}
                    className="ml-2 px-2 py-2 bg-white border rounded dark:bg-slate-900 dark:text-gray-100 dark:hover:bg-gray-400 hover:bg-gray-400 hover:text-white text-sm shadow-sm"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={saveFromModal}
                    className="px-3 py-1 bg-casal text-white rounded"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={closeDesignModal}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col xl:flex-row">
              <div className="w-full xl:w-80 flex-shrink-0">
                <div className="bg-fondoVs dark:bg-gray-800 py-6 px-3 shadow-sm">
                  <p className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 flex items-center justify-between gap-2">
                    Invitados sin Asignar
                    <span className="text-sm text-gray-500 font-normal">
                      ({totalPersonasSinAsignar} personas)
                    </span>
                  </p>

                  <div className="max-h-[32rem] overflow-y-auto">
                    {invitadosSinAsignar.length > 0 ? (
                      <ul className="space-y-3">
                        {invitadosSinAsignar.map((invitado) => (
                          <li key={invitado.id}>
                            <InvitadoDraggable invitado={invitado} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">🎉</div>
                        <p className="font-medium">
                          ¡Todos los invitados asignados!
                        </p>
                        <p className="text-sm">Perfecta distribución</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-white dark:bg-black border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Arrastra los invitados a las mesas del plano para asignar
                      lugares.
                    </p>
                  </div>
                </div>
              </div>
              {/* Canvas ampliado (scroll + zoom) */}
              <div
                ref={containerRef}
                className="overflow-x-auto overflow-y-auto"
                style={{ height: "100%", maxHeight: "100%" }}
                onMouseDown={handleMouseDownCanvas}
                onMouseMove={handleMouseMoveCanvas}
                onMouseUp={handleMouseUpCanvas}
                onMouseLeave={handleMouseUpCanvas}
              >
                <div
                  className="relative bg-gray-50 dark:bg-[#1a1a1a] overflow-hidden"
                  style={{
                    height: `${CANVAS_HEIGHT}px`,
                    minHeight: `${CANVAS_HEIGHT}px`,
                    minWidth: `${CANVAS_WIDTH}px`,
                    width: `${CANVAS_WIDTH}px`,
                  }}
                >
                  <div
                    ref={canvasRef}
                    className="absolute left-0 top-0 origin-top-left"
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                      transformOrigin: "0 0",
                      width: `${CANVAS_WIDTH}px`,
                      height: `${CANVAS_HEIGHT}px`,
                    }}
                  >
                    {allElements.map((element) => (
                      <div
                        key={element.id}
                        style={{
                          position: "absolute",
                          left: `${element.position.x}px`,
                          top: `${element.position.y}px`,
                          zIndex: 1,
                        }}
                      >
                        {renderElementMonitor(element)}
                      </div>
                    ))}
                  </div>

                  <div
                    className="absolute inset-0 pointer-events-none opacity-5"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, #ec4899 1px, transparent 1px),
                        linear-gradient(to bottom, #ec4899 1px, transparent 1px)
                      `,
                      backgroundSize: "40px 40px",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
