import React, { useState, useRef, useEffect, useCallback } from "react";
import Mesa from "../Distribuccion/Mesa.jsx";
import MesaRectangular from "../Distribuccion/MesaRectangular.jsx";
import {
  Accessibility,
  Minus,
  Plus,
  RotateCcw,
  Eye,
  User,
  Users,
  MapPin,
  CheckCircle,
  Clock2,
  X,
} from "lucide-react";
import { Button } from "@headlessui/react";
import { Tooltip } from "../ui/Tooltip.jsx";
import ModalRestricciones from "../Distribuccion/ModalRestricciones.jsx";
import ModalMesaDetalles from "../Distribuccion/ModalMesaDetalles.jsx";
import { useDisponibilidadMesas } from "../../hooks/useDisponibilidadMesas";
import { useSignalRUser } from "../../hooks/useSignalRUser";
import { useConfirm, usePrompt } from "../../hooks/useDialog";
import ConfirmDialog from "../ui/ConfirmDialog";
import PromptDialog from "../ui/PromptDialog";
import httpService from "../../services/httpService";
import MesaSilla from "./../../assets/recursos/MESAS-SILLA.svg";
import IconPersona from "./../../assets/recursos/ICONOPERSONA.svg";
import IconGrupo from "./../../assets/recursos/ICONOPERSONAS.svg";

export default function AsignacionUser({
  // Props estándar
  temporizadorActivo = false,
  invitado,
  invitadoId,
  eventoId,
  onCambioEstado,

  // Props de sistema de turnos (opcionales)
  usandoSistemaTurnos = false,
  turno = null,
  estadoTurno = null,
  tiempoRestante: tiempoRestanteTurno = null,
  seleccion: seleccionGuardada = null,
  estadoOcupacion = null,
  configuracionTurnos = null,
  onGuardarSeleccion = null,
  guardandoSeleccion = false,
  puedeAcceder = true,
}) {
  /* -----------------------
    Constantes
  ----------------------- */
  const CANVAS_WIDTH = 4000;
  const CANVAS_HEIGHT = 2400;
  const ZOOM_STEP = 0.1;
  const ZOOM_MIN = 0.1;
  const ZOOM_MAX = 4;
  const TIEMPO_LIMITE = (turno?.duracion_minutos || 5) * 60 * 1000;

  // 🔍 Debug: Verificar configuracionTurnos
  useEffect(() => {
    console.log('🔧 [AsignacionUser] configuracionTurnos recibida:', configuracionTurnos);
  }, [configuracionTurnos]);

  /* -----------------------
    Estados y refs
  ----------------------- */
  // Estado del temporizador
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [temporizadorExpiro, setTemporizadorExpiro] = useState(false);
  const intervalRef = useRef(null);
  const notificacionDosMinutosRef = useRef(false); // Para mostrar notificación solo una vez

  // Datos del invitado (desde props)
  const usuarioActual = {
    id: invitadoId || invitado?.id || "user-001",
    nombre: invitado?.nombre_completo || invitado?.nombre || "Usuario",
    cantidad: invitado?.cantidad_personas || 1,
    necesidadEspecial: invitado?.necesidades_especiales || false,
    email: invitado?.email || "",
    telefono: invitado?.numero || invitado?.telefono || "",
  };

  // Estado de asignación del usuario - AHORA SOPORTA MÚLTIPLES MESAS
  const [asignacionActual, setAsignacionActual] = useState(null);
  const [asignacionTemporal, setAsignacionTemporal] = useState(null);
  
  // Estado para selección múltiple de mesas
  const [mesasSeleccionadas, setMesasSeleccionadas] = useState([]);
  // Array de objetos: [{ numeroMesa, cantidadPersonas, personas: [] }]

  // 🎯 Estado para preconfiguración
  const [preconfiguracion, setPreconfiguracion] = useState(null);
  const [mostrandoPreconfiguracion, setMostrandoPreconfiguracion] = useState(false);

  // 🎨 Hooks para diálogos personalizados (reemplazan alert/confirm/prompt)
  const { showConfirm, dialogState: confirmState, handleClose: handleConfirmClose } = useConfirm();
  const { showPrompt, dialogState: promptState, handleClose: handlePromptClose, handleSubmit: handlePromptSubmit } = usePrompt();

  // 🔄 Cargar preconfiguración al inicio
  useEffect(() => {
    const cargarPreconfiguracion = () => {
      try {
        const configGuardada = localStorage.getItem(`config-asientos-${usuarioActual.id}`);
        if (configGuardada) {
          const config = JSON.parse(configGuardada);
          console.log('✅ Preconfiguración cargada:', config);
          setPreconfiguracion(config);
        }
      } catch (error) {
        console.error('❌ Error al cargar preconfiguración:', error);
      }
    };

    cargarPreconfiguracion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioActual.id]);

  /* -----------------------
     Util / Notificaciones
     ----------------------- */
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

  // 📝 Función para eliminar preconfiguración
  const eliminarPreconfiguracion = useCallback(async () => {
    const confirmar = await showConfirm({
      title: '¿Eliminar preconfiguración?',
      message: 'Se eliminará la información preconfigurada. Tendrás que volver a configurar los datos de cada persona.\n\n¿Deseas continuar?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'warning'
    });

    if (confirmar) {
      localStorage.removeItem(`config-asientos-${usuarioActual.id}`);
      setPreconfiguracion(null);
      mostrarNotificacion('Preconfiguración eliminada correctamente', 'success');
    }
  }, [usuarioActual.id, showConfirm, mostrarNotificacion]);

  // Obtener disponibilidad de mesas (incluye layout completo + disponibilidad)
  const {
    elementos: elementosConDisponibilidad,
    eventoInfo,
    isLoading: loadingDisponibilidad, // eslint-disable-line no-unused-vars
    refrescar: refrescarDisponibilidad,
  } = useDisponibilidadMesas(eventoId, true);

  // Layout del salón - SIEMPRE desde el endpoint de disponibilidad
  const allElements = elementosConDisponibilidad || [];
  
  // 🆕 Configuración de capacidades del evento
  const configuracionCapacidad = eventoInfo?.distribucion_capacidades || {
    capacidad_base: 10,
    permitir_aumento: false,
    capacidad_maxima: 12,
    mesas_pueden_aumentar: 0,
    mesas_aumentadas: 0
  };

  // 📡 Callback para notificaciones de SignalR (cambios en mesas)
  const handleMesaCambiada = useCallback(
    (notificacion) => {
      console.log("🔔 [AsignacionUser] Notificación recibida:", notificacion);

      // Mostrar notificación al usuario
      if (notificacion.tipo === "mesa_bloqueada") {
        const esBloqueada = notificacion.data.bloqueada;
        mostrarNotificacion(
          notificacion.mensaje,
          esBloqueada ? "warning" : "info"
        );
      } else if (notificacion.tipo === "mesa_seleccionada") {
        // Solo refrescar silenciosamente, no mostrar notificación
        console.log(
          "🔄 [AsignacionUser] Refrescando disponibilidad por cambio en mesa"
        );
      } else if (notificacion.tipo === "capacidad_mesa_cambiada") {
        // Notificar cambio de capacidad en mesa
        mostrarNotificacion(
          notificacion.mensaje,
          "info"
        );
        console.log(
          "📊 [AsignacionUser] Capacidad de mesa actualizada:",
          notificacion.data
        );
      }

      // Refrescar disponibilidad para actualizar el layout
      if (refrescarDisponibilidad) {
        refrescarDisponibilidad();
      }
    },
    [mostrarNotificacion, refrescarDisponibilidad]
  );

  // 🔌 Integrar SignalR para notificaciones en tiempo real
  // IMPORTANTE: Usamos invitadoId para la conexión, igual que en el Wrapper
  const { conectado: signalRConectado } = useSignalRUser(
    handleMesaCambiada,
    invitadoId
  );

  // Log de estado de conexión SignalR
  useEffect(() => {
    console.log(
      "📡 [AsignacionUser] Estado SignalR:",
      signalRConectado ? "CONECTADO ✅" : "DESCONECTADO ❌"
    );
    console.log("📡 [AsignacionUser] InvitadoId:", invitadoId);
    console.log("📡 [AsignacionUser] EventoId:", eventoId);
  }, [signalRConectado, invitadoId, eventoId]);

  // Zoom y controles
  const [zoom, setZoom] = useState(0.4);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Modales
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
  const [tipoMenu, setTipoMenu] = useState("normal");

  const [showMesaModal, setShowMesaModal] = useState(false);
  const [mesaSeleccionadaModal, setMesaSeleccionadaModal] = useState(null);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isPanningRef = useRef(false);
  const panLastRef = useRef({ x: 0, y: 0 });

  /* -----------------------
    Effects
  ----------------------- */
  // Cargar asignación guardada al iniciar
  useEffect(() => {
    // Cargar mesas seleccionadas pendientes
    const mesasGuardadas = localStorage.getItem(
      `mesas-seleccionadas-${usuarioActual.id}`
    );
    if (mesasGuardadas) {
      try {
        const mesas = JSON.parse(mesasGuardadas);
        if (Array.isArray(mesas) && mesas.length > 0) {
          setMesasSeleccionadas(mesas);
        }
      } catch (error) {
        console.error("Error al cargar mesas seleccionadas:", error);
        localStorage.removeItem(`mesas-seleccionadas-${usuarioActual.id}`);
      }
    }
    
    // Cargar asignación confirmada (legacy)
    const asignacionGuardada = localStorage.getItem(
      `asignacion-${usuarioActual.id}`
    );
    if (asignacionGuardada) {
      try {
        const asignacion = JSON.parse(asignacionGuardada);

        // Validar que la estructura de datos sea correcta
        if (!asignacion.personas || !Array.isArray(asignacion.personas)) {
          console.warn("Estructura de asignación inválida, limpiando datos");
          localStorage.removeItem(`asignacion-${usuarioActual.id}`);
          return;
        }

        setAsignacionActual(asignacion);

        // Los datos de la mesa ya vienen actualizados del backend con disponibilidad
        // No necesitamos manipular el estado local
      } catch (error) {
        console.error("Error al cargar asignación:", error);
        // Limpiar datos corruptos
        localStorage.removeItem(`asignacion-${usuarioActual.id}`);
      }
    }
  }, [usuarioActual.id]);

  useEffect(() => {
    // ⚠️ IMPORTANTE: Solo usar temporizador local si NO está usando sistema de turnos
    // En sistema de turnos, el tiempo viene del backend (tiempoRestanteTurno)
    if (temporizadorActivo && !asignacionActual && !usandoSistemaTurnos) {
      // Resetear la notificación de 2 minutos al iniciar el temporizador
      notificacionDosMinutosRef.current = false;

      const inicioTemporizador = Date.now();
      const finTemporizador = inicioTemporizador + TIEMPO_LIMITE;

      localStorage.setItem(
        "temporizador-inicio",
        inicioTemporizador.toString()
      );
      localStorage.setItem("temporizador-fin", finTemporizador.toString());

      const actualizarTemporizador = () => {
        const ahora = Date.now();
        const tiempoRestante = Math.max(0, finTemporizador - ahora);
        setTiempoRestante(tiempoRestante);

        // ⏰ NOTIFICACIÓN: Cuando queden 2 minutos (120000 ms)
        const dosMinutosEnMs = 2 * 60 * 1000;
        if (
          tiempoRestante <= dosMinutosEnMs &&
          tiempoRestante > dosMinutosEnMs - 1000 &&
          !notificacionDosMinutosRef.current
        ) {
          notificacionDosMinutosRef.current = true;
          mostrarNotificacion(
            "⏰ ¡Atención!\n\nQuedan solo 2 minutos para completar tu selección.\n\nApresúrate para no perder tu turno.",
            "warning"
          );
        }

        if (tiempoRestante === 0) {
          setTemporizadorExpiro(true);
          clearInterval(intervalRef.current);
          localStorage.removeItem("temporizador-inicio");
          localStorage.removeItem("temporizador-fin");
          if (onCambioEstado) {
            onCambioEstado("expirada");
          }
          setTimeout(() => {
            //window.location.href = "/login";
          }, 3000);
        }
      };

      actualizarTemporizador();
      intervalRef.current = setInterval(actualizarTemporizador, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    temporizadorActivo,
    asignacionActual,
    onCambioEstado,
    TIEMPO_LIMITE,
    usandoSistemaTurnos,
    mostrarNotificacion,
  ]);

  const formatearTiempo = (milisegundos) => {
    if (!milisegundos) return "00:00";
    const minutos = Math.floor(milisegundos / 60000);
    const segundos = Math.floor((milisegundos % 60000) / 1000);
    return `${minutos.toString().padStart(2, "0")}:${segundos
      .toString()
      .padStart(2, "0")}`;
  };

  /* -----------------------
     Zoom / Pan handlers
  ----------------------- */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const zoomIn = () =>
    setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () =>
    setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));
  const resetZoom = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

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

  const fitToView = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (!allElements || allElements.length === 0) {
      resetZoom();
      return;
    }

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    allElements.forEach((el) => {
      const x = el.position?.x || 0;
      const y = el.position?.y || 0;
      const w = el.width || 100;
      const h = el.height || 100;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });

    const padding = 200;
    const contentW = Math.max(1, maxX - minX + padding * 2);
    const contentH = Math.max(1, maxY - minY + padding * 2);

    const scaleX = rect.width / contentW;
    const scaleY = rect.height / contentH;
    const newZoom = clamp(Math.min(scaleX, scaleY), ZOOM_MIN, ZOOM_MAX);

    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;
    const hostCenterX = rect.width / 2 / newZoom;
    const hostCenterY = rect.height / 2 / newZoom;

    const newOffsetX = hostCenterX - contentCenterX;
    const newOffsetY = hostCenterY - contentCenterY;

    setZoom(newZoom);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  /* -----------------------
    Lógica de asignación
  ----------------------- */
  
  // 🆕 Función para aumentar capacidad de una mesa
  const aumentarCapacidadMesa = async (mesaId, nuevaCapacidad) => {
    try {
      console.log(`📊 Aumentando capacidad de mesa ${mesaId} a ${nuevaCapacidad}...`);
      
      const response = await httpService.put(
        `/eventos/${eventoId}/mesas/${mesaId}/capacidad`,
        { nueva_capacidad: nuevaCapacidad }
      );

      console.log('✅ Capacidad aumentada exitosamente:', response);
      
      // Refrescar disponibilidad para obtener datos actualizados
      await refrescarDisponibilidad();
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error al aumentar capacidad:', error);
      return { 
        success: false, 
        error: error.userMessage || error.message || 'Error al aumentar capacidad'
      };
    }
  };
  
  // Función auxiliar para formatear restricciones desde la pre-configuración
  const formatearRestricciones = (restriccionesObj) => {
    if (!restriccionesObj) return "Ninguna";

    const restriccionesActivas = [];
    if (restriccionesObj.vegetariano) restriccionesActivas.push("Vegetariano");
    if (restriccionesObj.vegano) restriccionesActivas.push("Vegano");
    if (restriccionesObj.sinGluten) restriccionesActivas.push("Sin gluten");
    if (restriccionesObj.alergiaMarisco)
      restriccionesActivas.push("Alergia a mariscos");

    return restriccionesActivas.length > 0
      ? restriccionesActivas.join(", ")
      : "Ninguna";
  };

  const seleccionarMesa = async (numeroMesa) => {
    console.log(`🎯 [seleccionarMesa] Iniciando selección de Mesa ${numeroMesa}`, {
      usuarioId: usuarioActual.id,
      totalBoletos: usuarioActual.cantidad,
      mesasYaSeleccionadas: mesasSeleccionadas.length,
      usandoSistemaTurnos
    });

    // ✅ VALIDACIONES DE TURNO (si está usando sistema de turnos)
    if (usandoSistemaTurnos) {
      console.log('🔍 Validando sistema de turnos...', { estadoTurno, puedeAcceder });
      // Validar que el turno esté activo
      if (estadoTurno !== "activo") {
        if (estadoTurno === "espera") {
          mostrarNotificacion(
            "Tu turno aún no ha comenzado. Espera a que llegue tu horario asignado.",
            "warning"
          );
        } else if (estadoTurno === "expirado") {
          mostrarNotificacion(
            "Tu turno ha expirado. Ya no puedes realizar cambios.",
            "error"
          );
        } else if (estadoTurno === "completado") {
          mostrarNotificacion(
            "Ya completaste tu selección. No puedes realizar más cambios.",
            "info"
          );
        } else {
          mostrarNotificacion(
            "No puedes seleccionar mesas en este momento.",
            "warning"
          );
        }
        return;
      }

      // Validar que pueda acceder
      if (!puedeAcceder) {
        mostrarNotificacion(
          "No tienes permiso para seleccionar mesas en este momento.",
          "error"
        );
        return;
      }

      // Validar que no haya completado y confirmado ya la selección
      if (seleccionGuardada?.confirmada) {
        mostrarNotificacion("Ya completaste tu selección de mesas.", "info");
        return;
      }
    }

    // 🆕 Verificar si la mesa ya está seleccionada (para selección múltiple)
    const mesaYaSeleccionada = mesasSeleccionadas.find(m => m.numeroMesa === numeroMesa);
    if (mesaYaSeleccionada) {
      console.log('⚠️ Mesa ya seleccionada');
      mostrarNotificacion(`La Mesa ${numeroMesa} ya está en tu selección actual.`, "info");
      return;
    }

    console.log('🔍 Buscando mesa en allElements...', { totalElementos: allElements.length });
    const mesaSeleccionada = allElements.find(
      (el) =>
        el.numero === numeroMesa &&
        (el.type === "mesa" || el.type === "mesaRectangular")
    );

    if (!mesaSeleccionada) {
      console.error('❌ Mesa no encontrada en allElements');
      mostrarNotificacion(`Mesa ${numeroMesa} no encontrada`, "error");
      return;
    }
    
    console.log('✅ Mesa encontrada:', mesaSeleccionada);

    // ✅ Validación: Mesa bloqueada
    const mesaBloqueada =
      mesaSeleccionada.disponibilidad?.esta_bloqueada ||
      mesaSeleccionada.disponibilidad?.bloqueada ||
      mesaSeleccionada.bloqueada;

    console.log('🔍 Verificando si mesa está bloqueada:', { mesaBloqueada });

    if (mesaBloqueada) {
      const motivo =
        mesaSeleccionada.disponibilidad?.motivo_bloqueo ||
        mesaSeleccionada.motivo_bloqueo ||
        "No especificado";

      console.error('❌ Mesa bloqueada:', motivo);
      mostrarNotificacion(
        `🔒 La Mesa ${numeroMesa} está bloqueada y no está disponible para selección.\n\n` +
          `Motivo: ${motivo}\n\n` +
          `Por favor, selecciona otra mesa o contacta al administrador del evento.`,
        "error"
      );
      return;
    }

    // 🆕 Calcular boletos ya asignados y disponibles
    const boletosAsignados = mesasSeleccionadas.reduce((total, mesa) => total + (mesa.cantidadPersonas || 0), 0);
    const boletosRestantes = usuarioActual.cantidad - boletosAsignados;

    console.log('🔍 Estado de boletos:', { boletosAsignados, boletosRestantes });

    // Si no hay boletos restantes, no permitir más selecciones
    if (boletosRestantes <= 0) {
      console.error('❌ No hay boletos restantes');
      mostrarNotificacion(
        `Ya has asignado todos tus ${usuarioActual.cantidad} boletos a otras mesas.\n\n` +
        `No puedes seleccionar más mesas.`,
        "warning"
      );
      return;
    }

    // ✅ Validar capacidad disponible SEGÚN BOLETOS RESTANTES (no todos los boletos)
    // 🔥 PRIORIZAR disponibilidad.asientos_disponibles del backend (datos actualizados en tiempo real)
    const espacioDisponible = mesaSeleccionada.disponibilidad?.asientos_disponibles ?? 
      (Number(mesaSeleccionada.capacidad || 0) - Number(mesaSeleccionada.invitados || 0));
    
    console.log('🔍 Espacio disponible en mesa:', { 
      espacioDisponible, 
      capacidad: mesaSeleccionada.capacidad,
      invitados: mesaSeleccionada.invitados,
      disponibilidad: mesaSeleccionada.disponibilidad,
      usandoFallback: !mesaSeleccionada.disponibilidad
    });
    
    if (espacioDisponible < 1) {
      console.error('❌ Mesa sin espacio disponible');
      mostrarNotificacion(
        `La Mesa ${numeroMesa} no tiene espacio disponible.`,
        "error"
      );
      return;
    }

    // ✅ Validación de mesa vacía (solo si es mesa vacía)
    const invitadosEnMesa = mesaSeleccionada.disponibilidad
      ? mesaSeleccionada.disponibilidad.asientos_ocupados
      : mesaSeleccionada.invitados;

    console.log('🔍 Invitados en mesa:', { invitadosEnMesa });

    if (invitadosEnMesa === 0) {
      console.log('🔍 Mesa vacía - Validando si puede aperturar...', {
        esPrimeraSeleccion: mesasSeleccionadas.length === 0,
        tieneMasDe8Boletos: usuarioActual.cantidad >= 8,
        boletosRestantes
      });
      
      // ✅ REGLA CRÍTICA: SIEMPRE validar cuando tiene < 8 boletos restantes
      // (sin importar si es primera selección o no)
      // La función puedeAbrirMesaNueva() internamente verifica si hay mesas con espacio suficiente
      if (boletosRestantes < 8) {
        console.log('🔍 Menos de 8 boletos restantes - VALIDANDO apertura obligatoria...');
        const validacion = puedeAbrirMesaNueva();

        console.log('🔍 Resultado validación:', validacion);

        if (!validacion.puede) {
          console.error('❌ No puede abrir mesa nueva:', validacion.mensaje);
          mostrarNotificacion(validacion.mensaje, "warning");
          return;
        }
      } else {
        // >= 8 boletos restantes: puede aperturar sin restricciones
        console.log(`✅ Puede aperturar mesa (>= 8 boletos restantes: ${boletosRestantes})`);
      }
    }

    // Validar silla especial si es necesario (solo la primera vez)
    if (usuarioActual.necesidadEspecial && mesasSeleccionadas.length === 0) {
      const sillasEspecialesDisponibles = Array.isArray(
        mesaSeleccionada.sillasEspeciales
      )
        ? mesaSeleccionada.sillasEspeciales.length
        : typeof mesaSeleccionada.sillasEspeciales === "number"
        ? mesaSeleccionada.sillasEspeciales
        : 0;

      if (sillasEspecialesDisponibles === 0) {
        mostrarNotificacion(
          `La Mesa ${numeroMesa} no tiene sillas especiales.\n\n` +
            `Necesitas una silla de accesibilidad 🦽\n` +
            `Busca una mesa con el ícono de accesibilidad.`,
          "error"
        );
        return;
      }
    }

    // 🆕 Determinar cantidad de personas para esta mesa
    const maxPersonasParaMesa = Math.min(boletosRestantes, espacioDisponible);
    let cantidadNum;

    console.log('🔍 [Debug] Selección de cantidad:', {
      usuarioTotalBoletos: usuarioActual.cantidad,
      boletosRestantes,
      espacioDisponible,
      maxPersonasParaMesa,
      mesasYaSeleccionadas: mesasSeleccionadas.length
    });

    // 📌 Si tiene < 8 boletos TOTALES, validar si puede aumentar mesa para cubrir todos
    // 🔥 IMPORTANTE: Usar maxPersonasParaMesa que ya considera el espacio disponible
    if (usuarioActual.cantidad < 8) {
      cantidadNum = maxPersonasParaMesa; // ✅ Respeta límite de espacio disponible
      console.log(`✅ Asignación automática (< 8 boletos): ${cantidadNum} personas a Mesa ${numeroMesa} (espacio: ${espacioDisponible})`);
      
      // 🚨 Si no hay espacio suficiente, verificar si se puede aumentar la mesa
      if (cantidadNum < boletosRestantes && configuracionCapacidad.permitir_aumento) {
        const capacidadActual = mesaSeleccionada.capacidad || 10;
        const capacidadMaxima = configuracionCapacidad.capacidad_maxima || 12;
        const capacidadBase = configuracionCapacidad.capacidad_base || 10;
        const cuposDisponibles = configuracionCapacidad.mesas_pueden_aumentar - configuracionCapacidad.mesas_aumentadas;
        
        // Calcular si aumentar resolvería el problema
        const invitadosActuales = mesaSeleccionada.disponibilidad?.asientos_ocupados || 0;
        const espacioSiAumentara = capacidadMaxima - invitadosActuales;
        const mesaEstaAumentada = capacidadActual > capacidadBase;
        
        console.log('🔍 Evaluando aumento de capacidad:', {
          capacidadActual,
          capacidadMaxima,
          invitadosActuales,
          espacioSiAumentara,
          boletosRestantes,
          cuposDisponibles,
          mesaEstaAumentada
        });
        
        // Si aumentar la mesa resuelve el problema y hay cupos disponibles
        if (espacioSiAumentara >= boletosRestantes && (cuposDisponibles > 0 || mesaEstaAumentada)) {
          const confirmar = await showConfirm({
            title: '⚠️ Espacio Insuficiente',
            message: `Mesa ${numeroMesa} tiene ${espacioDisponible} espacios, necesitas ${boletosRestantes}.\n\n💡 SOLUCIÓN: Aumentar mesa de ${capacidadActual} a ${capacidadMaxima} asientos\nEsto te daría ${espacioSiAumentara} espacios disponibles.\n\n¿Deseas aumentar la capacidad de esta mesa?`,
            confirmText: 'Sí, aumentar capacidad',
            cancelText: 'No, gracias',
            type: 'warning'
          });
          
          if (confirmar) {
            mostrarNotificacion('⏳ Aumentando capacidad de mesa...', 'info');
            const resultado = await aumentarCapacidadMesa(mesaSeleccionada.id, capacidadMaxima);
            
            if (!resultado.success) {
              mostrarNotificacion(
                `❌ No se pudo aumentar la capacidad: ${resultado.error}`,
                'error'
              );
              return;
            }
            
            mostrarNotificacion('✅ Capacidad aumentada exitosamente', 'success');
            
            // Esperar un momento para que se actualicen los datos
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Reintentar selección con nueva capacidad
            seleccionarMesa(numeroMesa);
            return;
          }
        }
        
        // Si no se puede aumentar o usuario rechazó, mostrar advertencia
        mostrarNotificacion(
          `⚠️ La Mesa ${numeroMesa} solo tiene ${espacioDisponible} espacios disponibles.\n\n` +
          `Se asignarán ${cantidadNum} personas de tus ${boletosRestantes} boletos restantes.\n\n` +
          `Deberás seleccionar otra mesa para los ${boletosRestantes - cantidadNum} boletos restantes.`,
          "warning"
        );
      }
    } else {
      // >= 8 boletos: Evaluar si necesita aumentar capacidad
      const capacidadActual = mesaSeleccionada.capacidad || 10;
      const capacidadMaxima = configuracionCapacidad.capacidad_maxima || 12;
      const capacidadBase = configuracionCapacidad.capacidad_base || 10;
      const invitadosActuales = mesaSeleccionada.disponibilidad?.asientos_ocupados || 0;
      const espacioSiAumentara = capacidadMaxima - invitadosActuales;
      const cuposDisponibles = configuracionCapacidad.mesas_pueden_aumentar - configuracionCapacidad.mesas_aumentadas;
      const mesaEstaAumentada = capacidadActual > capacidadBase;
      
      // 🔥 Si espacio insuficiente Y se puede aumentar Y aumentar resolvería el problema
      const puedeAumentar = configuracionCapacidad.permitir_aumento && 
                           (cuposDisponibles > 0 || mesaEstaAumentada) &&
                           espacioSiAumentara > espacioDisponible &&
                           capacidadActual < capacidadMaxima;
      
      const necesitaAumento = espacioDisponible < boletosRestantes;
      
      console.log('🔍 Evaluando opciones para >= 8 boletos:', {
        espacioDisponible,
        boletosRestantes,
        capacidadActual,
        capacidadMaxima,
        espacioSiAumentara,
        puedeAumentar,
        necesitaAumento,
        cuposDisponibles
      });
      
      // Si necesita aumento Y puede aumentar, ofrecer opciones
      if (necesitaAumento && puedeAumentar) {
        const opcion = await showConfirm({
          title: '📊 Opciones de Asignación',
          message: `Mesa ${numeroMesa}: ${capacidadActual} asientos, ${espacioDisponible} disponibles\nTus boletos restantes: ${boletosRestantes}\n\n▶ OPCIÓN 1 (Cancelar):\n→ Asignar ${maxPersonasParaMesa} personas a esta mesa\n→ Quedarán ${boletosRestantes - maxPersonasParaMesa} boletos para otra mesa\n\n▶ OPCIÓN 2 (Confirmar):\n→ Aumentar mesa a ${capacidadMaxima} asientos\n→ Tendrás ${espacioSiAumentara} espacios disponibles\n${espacioSiAumentara >= boletosRestantes ? '→ Cabrán todos tus boletos' : `→ Asignar ${Math.min(boletosRestantes, espacioSiAumentara)} personas aquí`}`,
          confirmText: 'Aumentar capacidad',
          cancelText: 'Asignación parcial',
          type: 'info'
        });
        
        if (opcion) {
          // Usuario eligió aumentar
          mostrarNotificacion('⏳ Aumentando capacidad de mesa...', 'info');
          const resultado = await aumentarCapacidadMesa(mesaSeleccionada.id, capacidadMaxima);
          
          if (!resultado.success) {
            mostrarNotificacion(
              `❌ No se pudo aumentar la capacidad: ${resultado.error}`,
              'error'
            );
            return;
          }
          
          mostrarNotificacion('✅ Capacidad aumentada exitosamente', 'success');
          
          // Esperar un momento para que se actualicen los datos
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Reintentar selección con nueva capacidad
          seleccionarMesa(numeroMesa);
          return;
        }
        // Si canceló, continúa con asignación parcial normal
      }
      
      // Preguntar cuántas personas quiere asignar (flujo normal)
      const cantidadPersonas = await showPrompt({
        title: 'Cantidad a asignar',
        message: `¿Cuántas personas deseas asignar a la Mesa ${numeroMesa}?\n\nBoletos restantes: ${boletosRestantes}\nEspacios disponibles en la mesa: ${espacioDisponible}\nMáximo permitido: ${maxPersonasParaMesa}`,
        inputType: 'number',
        defaultValue: maxPersonasParaMesa.toString(),
        min: 1,
        max: maxPersonasParaMesa,
        validation: (value) => {
          const num = Number(value);
          if (num < 1 || num > maxPersonasParaMesa) {
            return `Debe ser un número entre 1 y ${maxPersonasParaMesa}`;
          }
          return null;
        }
      });

      if (cantidadPersonas === null) {
        // Usuario canceló
        console.log('❌ Usuario canceló el prompt');
        return;
      }

      cantidadNum = cantidadPersonas;
      
      console.log(`✅ Cantidad ingresada por usuario: ${cantidadNum}`);
    }

    // 🆕 Verificar si hay configuración previa del modal de espera
    const configuracionPrevia = preconfiguracion || seleccionGuardada?.configuracion;
    let personasPreconfiguradas = null;
    
    if (configuracionPrevia?.personas && configuracionPrevia.personas.length > 0) {
      // Calcular índice de inicio basado en personas ya asignadas
      const personasYaAsignadas = mesasSeleccionadas.reduce((total, mesa) => total + mesa.cantidadPersonas, 0);
      const indiceInicio = personasYaAsignadas;
      const indiceFin = indiceInicio + cantidadNum;
      
      // ✅ COPIA PROFUNDA para evitar referencias compartidas entre mesas
      // slice() solo copia referencias, necesitamos clonar cada objeto persona
      personasPreconfiguradas = configuracionPrevia.personas
        .slice(indiceInicio, indiceFin)
        .map(persona => ({
          ...persona,
          restricciones: { ...persona.restricciones },
          necesidadesEspeciales: persona.necesidadesEspeciales ? {
            requiereAccesibilidad: persona.necesidadesEspeciales.requiereAccesibilidad,
            comentarios: persona.necesidadesEspeciales.comentarios
          } : {
            requiereAccesibilidad: false,
            comentarios: ""
          }
        }));
      
      console.log('✅ Usando configuración previa (copia profunda):', {
        totalPreconfiguradas: configuracionPrevia.personas.length,
        personasYaAsignadas,
        indiceInicio,
        indiceFin,
        personasParaEstaMesa: personasPreconfiguradas.length
      });
    }
    
    // Abrir modal para configurar las personas de ESTA mesa específica
    setPendingAsignacion({ 
      usuario: usuarioActual, 
      numeroMesa, 
      cantidadPersonas: cantidadNum,
      personasPreconfiguradas // ✅ Pasar datos pre-configurados si existen
    });
    setPendingNombre(usuarioActual.nombre);
    setRestricciones({
      vegetariano: 0,
      vegano: 0,
      sinGluten: 0,
      alergiaMarisco: 0,
    });
    setOtra("");
    setShowRestrModal(true);
  };

  const handleConfirmRestricciones = ({ personas, cantidadTotal }) => {
    if (!pendingAsignacion) return;

    const { usuario, numeroMesa, cantidadPersonas } = pendingAsignacion;
    
    // 🆕 Agregar mesa al array de mesas seleccionadas
    const nuevaMesa = {
      numeroMesa,
      cantidadPersonas: cantidadPersonas || cantidadTotal,
      personas: personas,
      fechaAsignacion: new Date().toISOString(),
    };
    
    const nuevasMesasSeleccionadas = [...mesasSeleccionadas, nuevaMesa];
    setMesasSeleccionadas(nuevasMesasSeleccionadas);
    
    // Calcular boletos totales asignados
    const totalBoletosAsignados = nuevasMesasSeleccionadas.reduce((total, mesa) => total + mesa.cantidadPersonas, 0);
    const boletosRestantes = usuarioActual.cantidad - totalBoletosAsignados;
    
    // Guardar en localStorage
    localStorage.setItem(
      `mesas-seleccionadas-${usuarioActual.id}`,
      JSON.stringify(nuevasMesasSeleccionadas)
    );

    mostrarNotificacion(
      `✅ Mesa ${numeroMesa} agregada a tu selección\n\n` +
        `Personas asignadas: ${cantidadPersonas || cantidadTotal}\n` +
        `Boletos restantes: ${boletosRestantes}\n\n` +
        `${boletosRestantes > 0 ? "Puedes seguir seleccionando más mesas" : "Has asignado todos tus boletos"}`,
      "success"
    );

    // Cerrar modal
    setShowRestrModal(false);
    setPendingAsignacion(null);
    setPendingNombre("");
    
    // Si ya asignó todos los boletos, detener temporizador
    if (boletosRestantes === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      localStorage.removeItem("temporizador-inicio");
      localStorage.removeItem("temporizador-fin");
      setTiempoRestante(null);
    }
  };

  const guardarAsignacionFinal = async () => {
    // Verificar que haya mesas seleccionadas
    if (!mesasSeleccionadas || mesasSeleccionadas.length === 0) {
      mostrarNotificacion(
        "No has seleccionado ninguna mesa. Por favor, selecciona al menos una mesa antes de guardar.",
        "warning"
      );
      return;
    }
    
    // Verificar que se hayan asignado todos los boletos
    const totalBoletosAsignados = mesasSeleccionadas.reduce((total, mesa) => total + mesa.cantidadPersonas, 0);
    if (totalBoletosAsignados < usuarioActual.cantidad) {
      const boletosRestantes = usuarioActual.cantidad - totalBoletosAsignados;
      const confirmar = await showConfirm({
        title: 'Boletos sin asignar',
        message: `Aún tienes ${boletosRestantes} boleto(s) sin asignar.\n\n¿Deseas guardar la selección de todas formas?`,
        confirmText: 'Sí, guardar',
        cancelText: 'Cancelar',
        type: 'warning'
      });
      if (!confirmar) return;
    }

    try {
      // ✅ SI USA SISTEMA DE TURNOS, guardar con el servicio de turnos
      if (usandoSistemaTurnos && onGuardarSeleccion) {
        // Preparar datos para el formato de turnos con MÚLTIPLES MESAS
        const datosSeleccion = {
          mesas_seleccionadas: mesasSeleccionadas.map(mesa => ({
            mesa_id: `mesa-${mesa.numeroMesa}`,
            mesa_numero: mesa.numeroMesa,
            mesa_tipo: "mesa",
            cantidad_personas: mesa.cantidadPersonas,
            // ✅ CREAR asientos_seleccionados con TODA la información de cada persona
            asientos_seleccionados: mesa.personas.map((persona, index) => {
              // Convertir restricciones de objeto {vegetariano: true} a array ["vegetariano"]
              const restriccionesDieteticas = persona.restricciones 
                ? Object.keys(persona.restricciones).filter(key => persona.restricciones[key])
                : [];
              
              return {
                asiento_id: `mesa-${mesa.numeroMesa}_${invitadoId}_${index + 1}`,
                asiento_numero: index + 1,
                nombre_comensal: persona.nombre?.trim() || "",
                tipo_menu: persona.tipoMenu || "normal",
                restricciones_dieteticas: restriccionesDieteticas,
                notas: persona.otraRestriccion?.trim() || "",
                necesidades_especiales: {
                  requiere_accesibilidad: persona.necesidadesEspeciales?.requiereAccesibilidad || false,
                  comentarios: persona.necesidadesEspeciales?.comentarios?.trim() || ""
                }
              };
            })
          })),
          personas: mesasSeleccionadas.flatMap(mesa => mesa.personas),
        };

        // Llamar a la función de guardado del turno
        await onGuardarSeleccion(datosSeleccion);
        
        // Limpiar mesas seleccionadas tras guardado exitoso
        setMesasSeleccionadas([]);
        localStorage.removeItem(`mesas-seleccionadas-${usuarioActual.id}`);
        
        mostrarNotificacion(
          `¡Selección guardada exitosamente!\n\n` +
            `Mesas asignadas: ${mesasSeleccionadas.length}\n` +
            `Total personas: ${totalBoletosAsignados}`,
          "success"
        );
      } else {
        // Sistema legacy: guardar en localStorage
        const asignacionData = {
          id: `asignacion-${Date.now()}`,
          usuarioId: usuarioActual.id,
          mesas: mesasSeleccionadas,
          cantidadTotal: totalBoletosAsignados,
          fechaAsignacion: new Date().toISOString(),
        };
        
        localStorage.setItem(
          `asignacion-${usuarioActual.id}`,
          JSON.stringify(asignacionData)
        );
        
        setAsignacionActual(asignacionData);
        setMesasSeleccionadas([]);
        localStorage.removeItem(`mesas-seleccionadas-${usuarioActual.id}`);
        
        mostrarNotificacion(
          `¡Selección guardada!\n\n` +
            `Mesas: ${mesasSeleccionadas.length}\n` +
            `Personas: ${totalBoletosAsignados}`,
          "success"
        );
      }

      // Limpiar pre-configuración si existe
      localStorage.removeItem(`config-asientos-${usuarioActual.id}`);

      // Refrescar disponibilidad desde el backend
      if (refrescarDisponibilidad) {
        await refrescarDisponibilidad();
      }

      if (onCambioEstado) {
        onCambioEstado("completada");
      }
    } catch (error) {
      console.error("Error al guardar asignación final:", error);
      mostrarNotificacion(
        "Error al guardar la asignación. Intenta nuevamente.",
        "error"
      );
    }
  };

  const cancelarAsignacion = async () => {
    // Verificar si hay mesas seleccionadas pendientes
    if (mesasSeleccionadas.length > 0) {
      const totalBoletos = mesasSeleccionadas.reduce((total, mesa) => total + mesa.cantidadPersonas, 0);
      const mensaje = `¿Deseas descartar todas las mesas seleccionadas?\n\nMesas seleccionadas: ${mesasSeleccionadas.length}\nTotal boletos asignados: ${totalBoletos}\n\nTendrás que volver a seleccionar y configurar las mesas.`;
      
      const confirmar = await showConfirm({
        title: '¿Descartar selección?',
        message: mensaje,
        confirmText: 'Sí, descartar',
        cancelText: 'No, mantener',
        type: 'warning'
      });
      if (!confirmar) return;
      
      // Limpiar mesas seleccionadas
      setMesasSeleccionadas([]);
      localStorage.removeItem(`mesas-seleccionadas-${usuarioActual.id}`);
      
      mostrarNotificacion(
        "Selección de mesas descartada. Puedes empezar de nuevo.",
        "info"
      );
      
      // Refrescar disponibilidad
      if (refrescarDisponibilidad) {
        refrescarDisponibilidad();
      }
      return;
    }
    
    // Verificar si hay asignación confirmada
    if (asignacionActual) {
      const mensaje = "¿Estás seguro de que deseas cancelar tu asignación?\n\nPerderás todos los lugares asignados.\n\nTendrás que seleccionar y configurar nuevamente.";

      const confirmar = await showConfirm({
        title: '¿Cancelar asignación?',
        message: mensaje,
        confirmText: 'Sí, cancelar',
        cancelText: 'No, mantener',
        type: 'warning'
      });
      if (!confirmar) return;

      setAsignacionActual(null);
      localStorage.removeItem(`asignacion-${usuarioActual.id}`);
      
      mostrarNotificacion(
        `Asignación cancelada exitosamente.\n\n` +
          `Puedes seleccionar mesas ahora.`,
        "info"
      );

      // Refrescar disponibilidad desde el backend
      if (refrescarDisponibilidad) {
        refrescarDisponibilidad();
      }
    }
  };
  
  // 🆕 Función para remover una mesa específica de la selección
  const removerMesaSeleccionada = async (numeroMesa) => {
    const confirmar = await showConfirm({
      title: '¿Quitar mesa?',
      message: `¿Deseas quitar la Mesa ${numeroMesa} de tu selección?`,
      confirmText: 'Sí, quitar',
      cancelText: 'No, mantener',
      type: 'warning'
    });
    if (!confirmar) return;
    
    const nuevasMesas = mesasSeleccionadas.filter(m => m.numeroMesa !== numeroMesa);
    setMesasSeleccionadas(nuevasMesas);
    
    if (nuevasMesas.length > 0) {
      localStorage.setItem(
        `mesas-seleccionadas-${usuarioActual.id}`,
        JSON.stringify(nuevasMesas)
      );
    } else {
      localStorage.removeItem(`mesas-seleccionadas-${usuarioActual.id}`);
    }
    
    mostrarNotificacion(
      `Mesa ${numeroMesa} removida de tu selección.`,
      "info"
    );
    
    // Refrescar disponibilidad
    if (refrescarDisponibilidad) {
      refrescarDisponibilidad();
    }
  };

  /* -----------------------
     Helpers de UI / Modales
     ----------------------- */
  const openMesaModal = (numeroMesa) => {
    const mesa = allElements.find(
      (el) =>
        el.numero === numeroMesa &&
        (el.type === "mesa" || el.type === "mesaRectangular")
    );
    if (!mesa) {
      mostrarNotificacion(`Mesa ${numeroMesa} no encontrada`, "error");
      return;
    }
    setMesaSeleccionadaModal(mesa);
    setShowMesaModal(true);
  };

  const closeMesaModal = () => {
    setShowMesaModal(false);
    setMesaSeleccionadaModal(null);
  };

  /* -----------------------
     Componentes de render
     ----------------------- */
  const MesaInteractiva = ({ element }) => {
    const esMiMesa = asignacionActual?.numeroMesa === element.numero;

    // Usar disponibilidad real del backend si está disponible
    const disponibilidad = element.disponibilidad;
    const espacioDisponible = disponibilidad
      ? disponibilidad.asientos_disponibles
      : element.capacidad - element.invitados;
    const invitadosAsignados = disponibilidad
      ? disponibilidad.asientos_ocupados
      : element.invitados;

    // Verificar si la mesa está bloqueada
    const mesaBloqueada =
      disponibilidad?.esta_bloqueada ||
      disponibilidad?.bloqueada ||
      element.bloqueada;

    const motivoBloqueo =
      disponibilidad?.motivo_bloqueo || element.motivo_bloqueo || "";

    // 🆕 PERMITIR SELECCIÓN si la mesa tiene AL MENOS 1 espacio disponible
    // La validación detallada se hace dentro de seleccionarMesa()
    let puedeSeleccionar = false;
    if (!asignacionActual && !mesaBloqueada) {
      // ✅ Verificar solo que haya espacio disponible (>= 1)
      // Las validaciones de boletos restantes y apertura de mesas se hacen en seleccionarMesa()
      if (usandoSistemaTurnos) {
        // Con sistema de turnos: usar disponibilidad del backend
        puedeSeleccionar = disponibilidad?.esta_disponible && disponibilidad?.asientos_disponibles >= 1;
      } else {
        // Sin sistema de turnos: verificar espacio disponible
        puedeSeleccionar = espacioDisponible >= 1;
      }
    }

    const esSugerida = sugerenciasMesas.some(
      (mesa) => mesa.numero === element.numero
    );
    const posicionSugerencia =
      sugerenciasMesas.findIndex((mesa) => mesa.numero === element.numero) + 1;

    // Aplicar transformaciones del layout
    const rotation = element.rotation || 0;
    const scale = element.scale || 1;
    const scaleX = element.scaleX || scale;
    const scaleY = element.scaleY || scale;

    const transformStyle = {
      transform: `rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`,
      transformOrigin: "center center",
    };

    const handleClick = (e) => {
      e.stopPropagation();
      if (puedeSeleccionar) {
        seleccionarMesa(element.numero);
      }
    };

    return (
      <div
        className={`pointer-events-auto ${
          puedeSeleccionar ? "cursor-pointer" : "cursor-default"
        }`}
        style={transformStyle}
        onClick={handleClick}
      >
        {esSugerida && !asignacionActual && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="bg-casal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
              {posicionSugerencia}
            </div>
          </div>
        )}
        <Mesa
          numeroMesa={element.numero}
          invitadosAsignados={invitadosAsignados}
          capacidadMaxima={element.capacidad}
          sillasEspeciales={element.sillasEspeciales || []}
          invitadosEspeciales={element.invitadosEspeciales || 0}
          onDoubleClick={() => openMesaModal(element.numero)}
          destacada={esMiMesa}
          disponible={puedeSeleccionar}
          sugerida={esSugerida}
          className={esMiMesa ? "ring-4 ring-green-400 ring-opacity-60" : ""}
        />
        {/* Overlay para mesa bloqueada */}
        {mesaBloqueada && (
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
  };

  const MesaRectangularInteractiva = ({ element }) => {
    const esMiMesa = asignacionActual?.numeroMesa === element.numero;

    // Usar disponibilidad real del backend si está disponible
    const disponibilidad = element.disponibilidad;
    const espacioDisponible = disponibilidad
      ? disponibilidad.asientos_disponibles
      : element.capacidad - element.invitados;
    const invitadosAsignados = disponibilidad
      ? disponibilidad.asientos_ocupados
      : element.invitados;

    // Verificar si la mesa está bloqueada
    const mesaBloqueada =
      disponibilidad?.esta_bloqueada ||
      disponibilidad?.bloqueada ||
      element.bloqueada;

    const motivoBloqueo =
      disponibilidad?.motivo_bloqueo || element.motivo_bloqueo || "";

    // 🆕 PERMITIR SELECCIÓN si la mesa tiene AL MENOS 1 espacio disponible
    // La validación detallada se hace dentro de seleccionarMesa()
    let puedeSeleccionar = false;
    if (!asignacionActual && !mesaBloqueada) {
      // ✅ Verificar solo que haya espacio disponible (>= 1)
      // Las validaciones de boletos restantes y apertura de mesas se hacen en seleccionarMesa()
      if (usandoSistemaTurnos) {
        // Con sistema de turnos: usar disponibilidad del backend
        puedeSeleccionar = disponibilidad?.esta_disponible && disponibilidad?.asientos_disponibles >= 1;
      } else {
        // Sin sistema de turnos: verificar espacio disponible
        puedeSeleccionar = espacioDisponible >= 1;
      }
    }

    const esSugerida = sugerenciasMesas.some(
      (mesa) => mesa.numero === element.numero
    );
    const posicionSugerencia =
      sugerenciasMesas.findIndex((mesa) => mesa.numero === element.numero) + 1;

    // Aplicar transformaciones del layout
    const rotation = element.rotation || 0;
    const scale = element.scale || 1;
    const scaleX = element.scaleX || scale;
    const scaleY = element.scaleY || scale;

    const transformStyle = {
      transform: `rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`,
      transformOrigin: "center center",
    };

    const handleClick = (e) => {
      e.stopPropagation();
      if (puedeSeleccionar) {
        seleccionarMesa(element.numero);
      }
    };

    return (
      <div
        className={`pointer-events-auto ${
          puedeSeleccionar ? "cursor-pointer" : "cursor-default"
        }`}
        style={transformStyle}
        onClick={handleClick}
      >
        {/* Indicador de sugerencia */}
        {esSugerida && !asignacionActual && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="bg-casal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
              {posicionSugerencia}
            </div>
          </div>
        )}
        <MesaRectangular
          numeroMesa={element.numero}
          invitadosAsignados={invitadosAsignados}
          capacidadMaxima={element.capacidad}
          sillasEspeciales={element.sillasEspeciales || []}
          invitadosEspeciales={element.invitadosEspeciales || 0}
          onDoubleClick={() => openMesaModal(element.numero)}
          destacada={esMiMesa}
          disponible={puedeSeleccionar}
          sugerida={esSugerida}
          className={esMiMesa ? "ring-4 ring-green-400 ring-opacity-60" : ""}
        />
        {/* Overlay para mesa bloqueada */}
        {mesaBloqueada && (
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
  };

  const renderElementoInteractivo = (element) => {
    if (element.type === "mesa") {
      return <MesaInteractiva element={element} />;
    }

    if (element.type === "mesaRectangular") {
      return <MesaRectangularInteractiva element={element} />;
    }

    // Aplicar transformaciones (rotación y escala) desde el layout
    const rotation = element.rotation || 0;
    const scale = element.scale || 1;
    const scaleX = element.scaleX || scale;
    const scaleY = element.scaleY || scale;

    const transformStyle = {
      transform: `rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`,
      transformOrigin: "center center",
    };

    // Elementos decorativos (no interactivos)
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
              Mesa principal <br />
              <span className="text-gray-500 text-sm italic">Ana y Juan</span>
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

    // Envolver el contenido con las transformaciones
    return <div style={transformStyle}>{elementContent}</div>;
  };

  if (temporizadorExpiro) {
    return (
      <div className="bg-fondoVs min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            ¡Tiempo Agotado!
          </h2>
          <p className="text-gray-600 mb-6">
            Se acabó el tiempo para seleccionar tu mesa.
            <br />
            Serás redirigido al login automáticamente.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-casal mx-auto"></div>
        </div>
      </div>
    );
  }

  /* -----------------------
    Lógica de sugerencias y validaciones
  ----------------------- */
  const obtenerEstadisticasOcupacion = () => {
    // Filtrar mesas (redondas o rectangulares)
    const todasLasMesas = allElements.filter(
      (el) => el.type === "mesa" || el.type === "mesaRectangular"
    );

    // Filtrar mesas con invitados (usar disponibilidad del backend si existe)
    const mesasConInvitados = todasLasMesas.filter((el) => {
      const invitados = el.disponibilidad
        ? el.disponibilidad.asientos_ocupados
        : el.invitados;
      return invitados > 0;
    });

    // Calcular total de personas ocupadas
    const totalPersonasOcupadas = mesasConInvitados.reduce((total, mesa) => {
      const ocupados = mesa.disponibilidad
        ? mesa.disponibilidad.asientos_ocupados
        : mesa.invitados;
      return total + ocupados;
    }, 0);

    // Calcular espacio total disponible en mesas ocupadas
    const espacioTotalDisponible = mesasConInvitados.reduce((total, mesa) => {
      const disponibles = mesa.disponibilidad
        ? mesa.disponibilidad.asientos_disponibles
        : mesa.capacidad - mesa.invitados;
      return total + disponibles;
    }, 0);

    return {
      totalPersonasOcupadas,
      espacioTotalDisponible,
      mesasConInvitados: mesasConInvitados.length,
      totalMesas: todasLasMesas.length,
    };
  };

  const puedeAbrirMesaNueva = () => {
    // Calcular boletos ya asignados en otras mesas
    const boletosAsignados = mesasSeleccionadas.reduce((total, mesa) => total + (mesa.cantidadPersonas || 0), 0);
    const boletosRestantes = usuarioActual.cantidad - boletosAsignados;

    // 📋 REGLA CRÍTICA: Si tiene < 8 boletos restantes (sin importar cuántos tenía originalmente),
    // debe verificar si hay mesas con espacio suficiente ANTES de permitir apertura
    if (boletosRestantes < 8) {
      // Verificar si hay mesas CON INVITADOS con capacidad suficiente para TODOS sus boletos restantes
      const mesasConCapacidadSuficiente = allElements.filter(
        (el) => {
          if (!(el.type === "mesa" || el.type === "mesaRectangular")) return false;
          
          // Excluir mesas bloqueadas
          const mesaBloqueada = el.disponibilidad?.esta_bloqueada || el.disponibilidad?.bloqueada || el.bloqueada;
          if (mesaBloqueada) return false;
          
          // Verificar si hay invitados (mesas ocupadas)
          const invitados = el.disponibilidad ? el.disponibilidad.asientos_ocupados : el.invitados;
          if (invitados === 0) return false; // Solo mesas ocupadas
          
          // Verificar capacidad disponible
          const espacioDisponible = el.disponibilidad
            ? el.disponibilidad.asientos_disponibles
            : el.capacidad - el.invitados;
          
          // Debe caber TODOS los boletos restantes
          return espacioDisponible >= boletosRestantes;
        }
      );

      // Si HAY mesas con espacio suficiente, NO pueden aperturar mesa nueva
      if (mesasConCapacidadSuficiente.length > 0) {
        const numerosMesas = mesasConCapacidadSuficiente.map(m => `Mesa ${m.numero}`).join(', ');
        return {
          puede: false,
          razon: "hay-mesas-disponibles",
          mensaje: `Tienes ${boletosRestantes} boleto(s) restante(s).\n\nHay ${mesasConCapacidadSuficiente.length} mesa(s) con espacio suficiente:\n${numerosMesas}\n\nPara optimizar el espacio, debes seleccionar una de estas mesas en lugar de aperturar una nueva.`,
        };
      }

      // Si NO hay mesas con espacio suficiente, SÍ pueden aperturar
      return {
        puede: true,
        razon: "sin-mesas-con-capacidad",
        mensaje: `No hay mesas disponibles con capacidad para tus ${boletosRestantes} boleto(s) restante(s).\n\nPuedes aperturar una mesa nueva.`,
      };
    }

    // 📋 REGLA: Invitados con >= 8 boletos RESTANTES pueden aperturar nueva mesa
    if (boletosRestantes >= 8) {
      return {
        puede: true,
        razon: "grupo-grande-boletos-suficientes",
        mensaje: `Tienes ${boletosRestantes} boletos restantes. Puedes aperturar una mesa nueva (mínimo 8 boletos).`,
      };
    }

    // 📋 CASO LEGACY (no debería llegar aquí con la nueva lógica)
    if (usuarioActual.cantidad < 8) {
      // Verificar si hay mesas con capacidad suficiente para TODOS sus boletos restantes
      const mesasConCapacidadSuficiente = allElements.filter(
        (el) => {
          if (!(el.type === "mesa" || el.type === "mesaRectangular")) return false;
          
          // Excluir mesas bloqueadas
          const mesaBloqueada = el.disponibilidad?.esta_bloqueada || el.disponibilidad?.bloqueada || el.bloqueada;
          if (mesaBloqueada) return false;
          
          // Verificar si hay invitados (mesas ocupadas)
          const invitados = el.disponibilidad ? el.disponibilidad.asientos_ocupados : el.invitados;
          if (invitados === 0) return false; // Solo mesas ocupadas
          
          // Verificar capacidad disponible
          const espacioDisponible = el.disponibilidad
            ? el.disponibilidad.asientos_disponibles
            : el.capacidad - el.invitados;
          
          // Debe caber TODOS los boletos restantes
          return espacioDisponible >= boletosRestantes;
        }
      );

      // Si HAY mesas con espacio suficiente, NO pueden aperturar mesa nueva
      if (mesasConCapacidadSuficiente.length > 0) {
        return {
          puede: false,
          razon: "hay-mesas-disponibles",
          mensaje: `Tienes ${boletosRestantes} boleto(s) restante(s).\n\nHay ${mesasConCapacidadSuficiente.length} mesa(s) con espacio suficiente para tus boletos.\n\nPara optimizar el espacio, debes seleccionar una mesa existente en lugar de aperturar una nueva.`,
        };
      }

      // Si NO hay mesas con espacio suficiente, SÍ pueden aperturar
      return {
        puede: true,
        razon: "sin-mesas-con-capacidad",
        mensaje: `No hay mesas disponibles con capacidad para tus ${boletosRestantes} boleto(s) restante(s).\n\nPuedes aperturar una mesa nueva.`,
      };
    }

    // Caso por defecto (no debería llegar aquí)
    return {
      puede: false,
      razon: "error",
      mensaje: "No se pudo determinar si puedes aperturar una mesa nueva.",
    };
  };

  /* -----------------------
    Lógica de sugerencias
  ----------------------- */
  const obtenerSugerenciasMesas = () => {
    if (asignacionActual) return [];

    // eslint-disable-next-line no-unused-vars
    const stats = obtenerEstadisticasOcupacion();
    const puedeAbrirNueva = puedeAbrirMesaNueva();

    const mesasDisponibles = allElements
      .filter((el) => {
        if (!(el.type === "mesa" || el.type === "mesaRectangular"))
          return false;

        // 🔒 Excluir mesas bloqueadas
        const mesaBloqueada =
          el.disponibilidad?.esta_bloqueada ||
          el.disponibilidad?.bloqueada ||
          el.bloqueada;
        if (mesaBloqueada) return false;

        // Obtener datos correctos (disponibilidad del backend si existe)
        const invitados = el.disponibilidad
          ? el.disponibilidad.asientos_ocupados
          : el.invitados;
        const espacioDisponible = el.disponibilidad
          ? el.disponibilidad.asientos_disponibles
          : el.capacidad - el.invitados;

        // Verificar si tiene espacio suficiente
        if (espacioDisponible < usuarioActual.cantidad) return false;

        // Si la mesa está vacía, verificar si puede abrirla
        if (invitados === 0 && !puedeAbrirNueva.puede) return false;

        return true;
      })
      .map((mesa) => {
        // Usar disponibilidad del backend si existe
        const invitados = mesa.disponibilidad
          ? mesa.disponibilidad.asientos_ocupados
          : mesa.invitados;
        const espacioDisponible = mesa.disponibilidad
          ? mesa.disponibilidad.asientos_disponibles
          : mesa.capacidad - mesa.invitados;

        return {
          ...mesa,
          espacioDisponible,
          invitados, // Sobrescribir con el valor correcto
          porcentajeOcupado: (invitados / mesa.capacidad) * 100,
          // Validar sillas especiales
          tieneSillaEspecial: usuarioActual.necesidadEspecial
            ? Array.isArray(mesa.sillasEspeciales)
              ? mesa.sillasEspeciales.length > 0
              : mesa.sillasEspeciales > 0
            : true,
          esMesaNueva: invitados === 0,
          // Calcular qué tan "justa" es la asignación (cuánto espacio sobraría)
          espacioSobrante: espacioDisponible - usuarioActual.cantidad,
        };
      })
      .filter((mesa) => mesa.tieneSillaEspecial);

    // 🎯 Ordenar por prioridad optimizada para llenar mesas completamente:
    const mesasOrdenadas = mesasDisponibles.sort((a, b) => {
      // 1. Priorizar mesas con invitados sobre mesas vacías (grupos pequeños)
      if (a.esMesaNueva && !b.esMesaNueva) return 1;
      if (!a.esMesaNueva && b.esMesaNueva) return -1;

      // 2. Priorizar mesas que quedarían COMPLETAS (espacio sobrante = 0)
      if (a.espacioSobrante === 0 && b.espacioSobrante !== 0) return -1;
      if (b.espacioSobrante === 0 && a.espacioSobrante !== 0) return 1;

      // 3. Priorizar menor espacio sobrante (mejor ajuste)
      if (a.espacioSobrante !== b.espacioSobrante) {
        return a.espacioSobrante - b.espacioSobrante;
      }

      // 4. Si el espacio sobrante es igual, priorizar mesas más ocupadas
      if (a.invitados !== b.invitados) {
        return b.invitados - a.invitados;
      }

      // 5. Como último recurso, ordenar por número de mesa
      return a.numero - b.numero;
    });

    return mesasOrdenadas.slice(0, 3);
  };

  const sugerenciasMesas = obtenerSugerenciasMesas();

  // eslint-disable-next-line no-unused-vars
  const puedeSeleccionarMesaVacia = () => {
    const validacion = puedeAbrirMesaNueva();
    return validacion.puede;
  };

  const limpiarEstados = () => {
    setRestricciones({});
    // setOtraRestriccion("");
    // setNombrePersona("");
    setTipoMenu("normal");
  };

  return (
    <div className="bg-fondoVs min-h-screen max-w-7xl mx-auto px-4 sm:px-2 lg:px-8">
      <div className="py-4">
        {/* Header con información del usuario */}
        <div className="">
          {/* Título y temporizador */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-casal flex items-center gap-2">
                  <img src={MesaSilla} alt="Logo" className="w-12 h-12 me-3" />
                  Selección de Mesa
                </h1>

                {/* Indicador de estado SignalR */}
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    signalRConectado
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-gray-100 text-gray-600 border border-gray-300"
                  }`}
                  title={
                    signalRConectado
                      ? "Notificaciones en tiempo real activas"
                      : "Reconectando..."
                  }
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      signalRConectado
                        ? "bg-green-500 animate-pulse"
                        : "bg-gray-400"
                    }`}
                  ></span>
                  {signalRConectado ? "En vivo" : "Offline"}
                </div>

                {/* Mostrar temporizador del turno si está disponible, sino el local */}
                {((usandoSistemaTurnos &&
                  tiempoRestanteTurno !== null &&
                  tiempoRestanteTurno > 0) ||
                  (!usandoSistemaTurnos && tiempoRestante !== null)) &&
                  !asignacionActual && (
                    <div className="flex items-center gap-2">
                      <div
                        className={`px-3 py-1 rounded-full font-mono text-lg font-bold ${
                          (usandoSistemaTurnos
                            ? tiempoRestanteTurno
                            : tiempoRestante) < 300
                            ? "bg-red-100 text-red-800 border border-red-300"
                            : (usandoSistemaTurnos
                                ? tiempoRestanteTurno
                                : tiempoRestante) < 600
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                            : "bg-green-100 text-green-800 border border-green-300"
                        }`}
                      >
                        <Clock2 className="w-4 h-4 inline mr-1" />{" "}
                        {usandoSistemaTurnos
                          ? formatearTiempo((tiempoRestanteTurno || 0) * 1000)
                          : formatearTiempo(tiempoRestante)}
                      </div>
                    </div>
                  )}
              </div>
              <div className="text-gray-600 mt-2">
                <p>
                  Elige tu mesa para el evento y especifica tus preferencias
                  alimenticias
                </p>
              </div>

              {/* 🎯 Indicador de Preconfiguración */}
              {preconfiguracion && !asignacionActual && (
                <div className="mt-3">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-semibold text-purple-800">
                            Preconfiguración Cargada
                          </p>
                          <p className="text-xs text-purple-600">
                            {preconfiguracion.personas?.length || 0} {(preconfiguracion.personas?.length || 0) === 1 ? 'persona' : 'personas'} configuradas
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setMostrandoPreconfiguracion(!mostrandoPreconfiguracion)}
                          className="text-xs text-purple-700 hover:text-purple-900 font-medium underline"
                        >
                          {mostrandoPreconfiguracion ? 'Ocultar' : 'Ver detalles'}
                        </button>
                        <button
                          onClick={eliminarPreconfiguracion}
                          className="text-xs text-red-600 hover:text-red-800 font-medium underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    {/* Detalles de la preconfiguración */}
                    {mostrandoPreconfiguracion && preconfiguracion.personas && (
                      <div className="mt-3 pt-3 border-t border-purple-200 space-y-2 max-h-48 overflow-y-auto">
                        {preconfiguracion.personas.map((persona, idx) => (
                          <div key={idx} className="bg-white rounded px-3 py-2 text-xs">
                            <p className="font-medium text-gray-800">
                              {idx + 1}. {persona.nombre || 'Sin nombre'}
                            </p>
                            <div className="flex gap-4 mt-1 text-gray-600">
                              <span>Menú: {persona.tipoMenu || 'normal'}</span>
                              {persona.restricciones && Object.keys(persona.restricciones).length > 0 && (
                                <span>Restricciones: {Object.keys(persona.restricciones).join(', ')}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 🆕 Mostrar mesas seleccionadas (m\u00faltiples) */}
            {mesasSeleccionadas.length > 0 && (
              <div className="flex items-start gap-3 flex-wrap">
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex-1 min-w-[300px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Clock2 className="w-5 h-5" />
                      <span className="font-semibold">
                        {mesasSeleccionadas.length} {mesasSeleccionadas.length === 1 ? "Mesa Seleccionada" : "Mesas Seleccionadas"}
                      </span>
                    </div>
                    <span className="text-sm text-blue-600">
                      {mesasSeleccionadas.reduce((total, m) => total + m.cantidadPersonas, 0)}/{usuarioActual.cantidad} boletos asignados
                    </span>
                  </div>
                  
                  {/* Lista de mesas */}
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {mesasSeleccionadas.map((mesa, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded px-3 py-2">
                        <span className="text-sm font-medium text-gray-700">
                          Mesa {mesa.numeroMesa}: {mesa.cantidadPersonas} {mesa.cantidadPersonas === 1 ? "persona" : "personas"}
                        </span>
                        <button
                          onClick={() => removerMesaSeleccionada(mesa.numeroMesa)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botones de acci\u00f3n */}
                <div className="flex gap-2">
                  <Button
                    onClick={guardarAsignacionFinal}
                    disabled={guardandoSeleccion}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {guardandoSeleccion ? "Guardando..." : "Confirmar Selecci\u00f3n"}
                  </Button>
                  <Button
                    onClick={cancelarAsignacion}
                    disabled={guardandoSeleccion}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Descartar
                  </Button>
                </div>
              </div>
            )}

            {/* Mostrar asignaci\u00f3n confirmada (cuando ya guard\u00f3) */}
            {asignacionActual && mesasSeleccionadas.length === 0 && (
              <div className="flex items-center gap-3">
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">
                      Selecci\u00f3n confirmada y guardada
                    </span>
                  </div>
                </div>

                {/* Bot\u00f3n de cancelar solo en sistema legacy */}
                {!usandoSistemaTurnos && !seleccionGuardada?.confirmada && (
                  <Button
                    onClick={cancelarAsignacion}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancelar Asignaci\u00f3n
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            <div className="w-full">
              {/* Información del usuario en horizontal */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className=" items-center gap-4">
                  {/* Nombre */}
                  <div className="flex items-center gap-2">
                    {/* <User className="w-5 h-5 text-gray-600" /> */}
                    <img src={IconPersona} alt="" className="w-6 h-6 text-gray-600" />
                    <div>
                      <label className="text-xs text-gray-500">Nombre</label>
                      <p className="font-semibold text-gray-800">
                        {usuarioActual.nombre}
                      </p>
                    </div>
                  </div>

                  {/* Personas */}
                  <div className="flex items-center gap-2">
                    <img src={IconGrupo} alt="" className="w-6 h-6 text-gray-600" />
                    <div>
                      <label className="text-xs text-gray-500">Personas</label>
                      <p className="font-semibold text-gray-800">
                        {usuarioActual.cantidad}{" "}
                        {usuarioActual.cantidad === 1 ? "persona" : "personas"}
                      </p>
                    </div>
                  </div>

                  {/* Necesidad especial */}
                  {usuarioActual.necesidadEspecial && (
                    <div className="flex items-center gap-2">
                      <Accessibility className="w-5 h-5 text-orange-600" />
                      <div>
                        <label className="text-xs text-gray-500">
                          Necesidades especiales
                        </label>
                        <p className="font-semibold text-orange-600">
                          Silla de accesibilidad
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Asignación actual o temporal */}
                  {(asignacionTemporal || asignacionActual) && (
                    <>
                      <div className="w-full h-px bg-gray-300 border"></div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-casal" />
                        <div>
                          <label className="text-xs text-gray-500">
                            Mesa{" "}
                            {asignacionTemporal ? "seleccionada" : "asignada"}
                          </label>
                          <p className="font-semibold text-gray-800">
                            Mesa{" "}
                            {
                              (asignacionTemporal || asignacionActual)
                                .numeroMesa
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div>
                          <label className="text-xs text-gray-500">
                            Fecha selección
                          </label>
                          <p className="font-semibold text-gray-800">
                            {
                              (asignacionTemporal || asignacionActual)
                                .fechaFormateada
                            }
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full md:col-span-2 lg:col-span-4">
              {/* Panel de mesas sugeridas (ahora en la parte superior del layout) */}
              {!asignacionTemporal &&
                !asignacionActual &&
                sugerenciasMesas.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 ">
                    <div className="flex justify-between items-center gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-2xl text-gray-800 mb-3 flex items-center gap-2">
                          <Eye className="w-6 h-6 text-casal" />
                          Mesas Sugeridas para Ti
                        </p>
                      </div>
                      <div>
                        {(() => {
                          const stats = obtenerEstadisticasOcupacion();
                          return (
                            <div className="text-xs inline-block">
                              <div className="flex flex-col md:flex-row gap-4 text-center p-2 bg-gray-50 border border-gray-200 rounded-lg shadow-md">
                                <Tooltip
                                  content="Total de invitados asignados"
                                  position="top"
                                >
                                  <div className="">
                                    <div className="font-semibold text-gray-800">
                                      {stats.totalPersonasOcupadas}
                                    </div>
                                    <div className="text-gray-600">
                                      Personas
                                    </div>
                                  </div>
                                </Tooltip>
                                <Tooltip
                                  content="Total de espacios disponibles"
                                  position="top"
                                >
                                  <div>
                                    <div className="font-semibold text-gray-800">
                                      {stats.espacioTotalDisponible}
                                    </div>
                                    <div className="text-gray-600">
                                      Espacios libres
                                    </div>
                                  </div>
                                </Tooltip>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex items-center w-full gap-3 overflow-y-auto">
                      {sugerenciasMesas.map((mesa, index) => (
                        <div
                          key={mesa.numero}
                          className="flex min-w-[14rem] mb-2 max-w-xs items-center justify-between px-2 py-1 bg-Acapulco border border-Acapulco rounded cursor-pointer hover:bg-casalds-700/80 transition-colors group"
                          onClick={() => seleccionarMesa(mesa.numero)}
                        >
                          <div className="flex items-center gap-1">
                            {/* <div className=" text-white group-hover:border group-hover:border-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div> */}
                            <span className="font-semibold text-white group-hover:text-gray-100">
                              {mesa.numero} Mesa
                            </span>
                          </div>
                          <div className="text-sm text-white group-hover:text-gray-100">
                            {mesa.espacioDisponible}
                            {mesa.invitados > 0 && (
                              <span className="ml-1 text-casal group-hover:text-gray-200">
                                ({mesa.invitados})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
        <div className="h-px w-full border my-3"></div>
        <div className="flex flex-col gap-6">
          {/* Plano del Salón */}
          <div className="flex-1 min-w-0">
            <div className="border border-gray-100 rounded-lg bg-white overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">
                  Plano del Salón{eventoInfo?.salon_nombre ? ` - "${eventoInfo.salon_nombre}"` : ''}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={zoomOut}
                    className="px-2 py-2 bg-white border rounded hover:bg-gray-100"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <div className="px-3 py-1 bg-white border rounded text-sm">
                    {Math.round(zoom * 100)}%
                  </div>
                  <Button
                    onClick={zoomIn}
                    className="px-2 py-2 bg-white border rounded hover:bg-gray-100"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Tooltip content="Ajustar vista (f)" position="left">
                    <Button
                      onClick={fitToView}
                      className="ml-2 px-2 py-2 bg-white border rounded hover:bg-gray-100 text-sm"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  </Tooltip>
                </div>
              </div>

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
                  className="relative bg-gray-50 overflow-hidden"
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
                          left: `${element.position?.x || 0}px`,
                          top: `${element.position?.y || 0}px`,
                          userSelect: "none",
                        }}
                      >
                        {renderElementoInteractivo(element)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Leyenda */}
            <div className="mt-4 text-sm text-gray-700 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded"></div>
                  <span>Mesa disponible para ti</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <span>Mesas sugeridas (prioridad)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded"></div>
                  <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></div>
                  <span>Mesa con poco espacio</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
                  <span>Mesa llena</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-red-600 text-xs font-bold">🔒</span>
                    </div>
                  </div>
                  <span>Mesa bloqueada</span>
                </div>
                {asignacionActual && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-400 border border-blue-600 rounded"></div>
                    <span>Tu mesa asignada</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Restricciones */}
      {showRestrModal && (
        <ModalRestricciones
          isOpen={showRestrModal}
          onClose={() => {
            setShowRestrModal(false);
            setPendingAsignacion(null);
            limpiarEstados();
          }}
          invitado={pendingAsignacion?.usuario}
          cantidadPersonasEspecifica={pendingAsignacion?.cantidadPersonas} // ✅ Cantidad para ESTA mesa específica
          personasPreconfiguradas={pendingAsignacion?.personasPreconfiguradas} // ✅ Personas pre-configuradas del modal de espera
          mesaNumero={pendingAsignacion?.numeroMesa}
          restricciones={restricciones}
          setRestricciones={setRestricciones}
          otra={otra}
          setOtra={setOtra}
          nombre={pendingNombre}
          setNombre={setPendingNombre}
          tipoMenu={tipoMenu}
          setTipoMenu={setTipoMenu}
          onConfirm={handleConfirmRestricciones}
          isUserMode={true}
          configuracionTurnos={configuracionTurnos} // ✅ Pasar configuración
        />
      )}

      {/* Modal de Detalles de Mesa */}
      {showMesaModal && (
        <ModalMesaDetalles
          isOpen={showMesaModal}
          onClose={closeMesaModal}
          mesa={mesaSeleccionadaModal}
          isUserMode={true}
        />
      )}

      {/* 🎨 Diálogos personalizados */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={handleConfirmClose}
        onConfirm={confirmState.resolver}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
      />

      <PromptDialog
        isOpen={promptState.isOpen}
        onClose={handlePromptClose}
        onSubmit={handlePromptSubmit}
        title={promptState.title}
        message={promptState.message}
        placeholder={promptState.placeholder}
        defaultValue={promptState.defaultValue}
        inputType={promptState.inputType}
        min={promptState.min}
        max={promptState.max}
        confirmText={promptState.confirmText}
        cancelText={promptState.cancelText}
        validation={promptState.validation}
      />
    </div>
  );
}