import React, { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@headlessui/react";
import { Tooltip } from "../ui/Tooltip.jsx";
import ModalRestricciones from "../Distribuccion/ModalRestricciones.jsx";
import ModalMesaDetalles from "../Distribuccion/ModalMesaDetalles.jsx";
import { useDisponibilidadMesas } from "../../hooks/useDisponibilidadMesas";

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
  const TIEMPO_LIMITE =
    (turno?.duracion_minutos || 5) * 60 * 1000;

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

  // Estado de asignación del usuario
  const [asignacionActual, setAsignacionActual] = useState(null);

  // Obtener disponibilidad de mesas (incluye layout completo + disponibilidad)
  const {
    elementos: elementosConDisponibilidad,
    isLoading: loadingDisponibilidad,
    refrescar: refrescarDisponibilidad
  } = useDisponibilidadMesas(eventoId, true);

  // Layout del salón - SIEMPRE desde el endpoint de disponibilidad
  const allElements = elementosConDisponibilidad || [];

  // Zoom y controles
  const [zoom, setZoom] = useState(0.3);
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
    if (temporizadorActivo && !asignacionActual) {
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
        if (tiempoRestante <= dosMinutosEnMs && tiempoRestante > dosMinutosEnMs - 1000 && !notificacionDosMinutosRef.current) {
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
  }, [temporizadorActivo, asignacionActual, onCambioEstado]);

  const formatearTiempo = (milisegundos) => {
    if (!milisegundos) return "00:00";
    const minutos = Math.floor(milisegundos / 60000);
    const segundos = Math.floor((milisegundos % 60000) / 1000);
    return `${minutos.toString().padStart(2, "0")}:${segundos
      .toString()
      .padStart(2, "0")}`;
  };

  /* -----------------------
     Util / Notificaciones
     ----------------------- */
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
  const seleccionarMesa = (numeroMesa) => {
    // ✅ VALIDACIONES DE TURNO (si está usando sistema de turnos)
    if (usandoSistemaTurnos) {
      // Validar que el turno esté activo
      if (estadoTurno !== 'activo') {
        if (estadoTurno === 'espera') {
          mostrarNotificacion("Tu turno aún no ha comenzado. Espera a que llegue tu horario asignado.", "warning");
        } else if (estadoTurno === 'expirado') {
          mostrarNotificacion("Tu turno ha expirado. Ya no puedes realizar cambios.", "error");
        } else if (estadoTurno === 'completado') {
          mostrarNotificacion("Ya completaste tu selección. No puedes realizar más cambios.", "info");
        } else {
          mostrarNotificacion("No puedes seleccionar mesas en este momento.", "warning");
        }
        return;
      }

      // Validar que pueda acceder
      if (!puedeAcceder) {
        mostrarNotificacion("No tienes permiso para seleccionar mesas en este momento.", "error");
        return;
      }

      // Validar que no haya completado y confirmado ya la selección
      if (seleccionGuardada?.confirmada) {
        mostrarNotificacion("Ya completaste tu selección de mesas.", "info");
        return;
      }
    }

    // Si ya está asignado a esta mesa, no hacer nada
    if (asignacionActual?.numeroMesa === numeroMesa) {
      mostrarNotificacion("Ya estás asignado a esta mesa", "info");
      return;
    }

    const mesaSeleccionada = allElements.find(
      (el) =>
        el.numero === numeroMesa &&
        (el.type === "mesa" || el.type === "mesaRectangular")
    );

    if (!mesaSeleccionada) {
      mostrarNotificacion(`Mesa ${numeroMesa} no encontrada`, "error");
      return;
    }

    // ✅ Validación de mesa vacía SOLO para sistema legacy (sin turnos)
    if (mesaSeleccionada.invitados === 0 && !usandoSistemaTurnos) {
      const validacion = puedeAbrirMesaNueva();

      if (!validacion.puede) {
        const stats = obtenerEstadisticasOcupacion();
        let mensajeDetallado = "";
        if (validacion.razon === "minimo-personas") {
          mensajeDetallado =
            `No puedes abrir una mesa nueva aún.\n\n` +
            `Ocupación actual: ${stats.totalPersonasOcupadas} personas\n` +
            `Mínimo requerido: 10 personas\n\n` +
            `Selecciona una mesa que ya tenga invitados asignados.`;
        } else if (validacion.razon === "espacio-disponible") {
          const mesasConEspacio = allElements
            .filter(
              (el) =>
                (el.type === "mesa" || el.type === "mesaRectangular") &&
                el.invitados > 0 &&
                el.capacidad - el.invitados >= usuarioActual.cantidad
            )
            .map(
              (mesa) =>
                `Mesa ${mesa.numero} (${
                  mesa.capacidad - mesa.invitados
                } lugares)`
            )
            .join(", ");

          mensajeDetallado =
            `No puedes abrir una mesa nueva aún.\n\n` +
            `Personas ocupadas: ${stats.totalPersonasOcupadas}\n` +
            `Espacios disponibles: ${stats.espacioTotalDisponible} lugares\n\n` +
            `Mesas con espacio disponible:\n${mesasConEspacio}\n\n` +
            `Completa las mesas existentes antes de abrir una nueva.`;
        }

        mostrarNotificacion(mensajeDetallado, "warning");
        return;
      }
    }
    // En sistema de turnos, la disponibilidad ya fue verificada por el backend

    // Validar capacidad disponible
    const espacioDisponible =
      mesaSeleccionada.capacidad - mesaSeleccionada.invitados;
    if (espacioDisponible < usuarioActual.cantidad) {
      mostrarNotificacion(
        `La Mesa ${numeroMesa} no tiene suficiente espacio.\n\n` +
          `Necesitas: ${usuarioActual.cantidad} lugares\n` +
          `Disponibles: ${espacioDisponible} lugares`,
        "error"
      );
      return;
    }

    // Validar silla especial si es necesario
    if (usuarioActual.necesidadEspecial) {
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

    // Todo OK -> abrir modal de restricciones
    setPendingAsignacion({ usuario: usuarioActual, numeroMesa });
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

    const { usuario, numeroMesa } = pendingAsignacion;

    // Crear objeto de asignación para guardar
    const asignacionData = {
      id: `asignacion-${Date.now()}`,
      usuarioId: usuario.id,
      numeroMesa,
      cantidadTotal,
      personas: personas,
      fechaAsignacion: new Date().toISOString(),
      fechaFormateada: new Date().toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // ✅ SI USA SISTEMA DE TURNOS, guardar con el servicio de turnos
    if (usandoSistemaTurnos && onGuardarSeleccion) {
      // Preparar datos para el formato de turnos
      const datosSeleccion = {
        mesas_seleccionadas: [{
          mesa_id: numeroMesa,
          numero_mesa: numeroMesa,
          cantidad_personas: cantidadTotal
        }],
        tipo_menu: personas[0]?.tipoMenu || 'normal',
        restriccion_dietetica: personas[0]?.restricciones || 'Ninguna',
        otra_restriccion: personas[0]?.otraRestriccion || null,
        personas: personas
      };

      // Llamar a la función de guardado del turno
      onGuardarSeleccion(datosSeleccion);
    } else {
      // Sistema legacy: guardar en localStorage
      localStorage.setItem(
        `asignacion-${usuarioActual.id}`,
        JSON.stringify(asignacionData)
      );
    }

    // Actualizar el estado de asignación actual
    setAsignacionActual(asignacionData);

    // Refrescar disponibilidad desde el backend para actualizar la UI
    if (refrescarDisponibilidad) {
      refrescarDisponibilidad();
    }

    // Detener temporizador al confirmar asignación
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    localStorage.removeItem("temporizador-inicio");
    localStorage.removeItem("temporizador-fin");
    setTiempoRestante(null);

    mostrarNotificacion(
      `¡Asignación confirmada!\n\n` +
        `Mesa: ${numeroMesa}\n` +
        `Personas registradas: ${cantidadTotal}\n` +
        `Responsable: ${personas[0]?.nombre}\n\n` +
        `${temporizadorActivo ? "⏱️ Temporizador detenido" : ""}`,
      "success"
    );

    // Cerrar modal
    setShowRestrModal(false);
    setPendingAsignacion(null);
    setPendingNombre("");

    if (onCambioEstado) {
      onCambioEstado("completada");
    }
  };

  const cancelarAsignacion = () => {
    if (!asignacionActual) return;

    const confirmar = window.confirm(
      "¿Estás seguro de que deseas cancelar tu asignación?\n\n" +
        `Perderás tu lugar en la Mesa ${asignacionActual.numeroMesa} para ${
          asignacionActual.cantidadTotal || usuarioActual.cantidad
        } ${
          (asignacionActual.cantidadTotal || usuarioActual.cantidad) === 1
            ? "persona"
            : "personas"
        }.\n\n` +
        "Tendrás que seleccionar otra mesa y configurar nuevamente la información de todos los invitados."
    );

    if (!confirmar) return;

    // Limpiar asignación local y refrescar datos del backend
    setAsignacionActual(null);
    localStorage.removeItem(`asignacion-${usuarioActual.id}`);
    
    // Refrescar disponibilidad desde el backend
    if (refrescarDisponibilidad) {
      refrescarDisponibilidad();
    }
    mostrarNotificacion(
      `Asignación cancelada exitosamente.\n\n` +
        `Mesa ${asignacionActual.numeroMesa} liberada.\n` +
        `${asignacionActual.cantidadTotal || usuarioActual.cantidad} ${
          (asignacionActual.cantidadTotal || usuarioActual.cantidad) === 1
            ? "lugar liberado"
            : "lugares liberados"
        }.\n\n` +
        `Puedes seleccionar otra mesa ahora.`,
      "info"
    );
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
      : (element.capacidad - element.invitados);
    const invitadosAsignados = disponibilidad 
      ? disponibilidad.asientos_ocupados 
      : element.invitados;

    let puedeSeleccionar = false;
    if (!asignacionActual) {
      // ✅ CON SISTEMA DE TURNOS: usar SIEMPRE disponibilidad del backend
      if (usandoSistemaTurnos) {
        // En sistema de turnos, la disponibilidad DEBE venir del backend
        if (disponibilidad) {
          puedeSeleccionar = disponibilidad.esta_disponible && 
                            disponibilidad.asientos_disponibles >= usuarioActual.cantidad;
        }
        // Si no hay disponibilidad en sistema de turnos, la mesa NO es seleccionable
      } else {
        // ❌ SISTEMA LEGACY (sin turnos): lógica anterior
        if (disponibilidad) {
          // Usar disponibilidad si está disponible
          puedeSeleccionar = disponibilidad.esta_disponible && 
                            disponibilidad.asientos_disponibles >= usuarioActual.cantidad;
        } else {
          // Fallback a lógica legacy
          if (espacioDisponible >= usuarioActual.cantidad) {
            if (invitadosAsignados > 0) {
              puedeSeleccionar = true;
            } else {
              const validacion = puedeAbrirMesaNueva();
              puedeSeleccionar = validacion.puede;
            }
          }
        }
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
      transformOrigin: 'center center'
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
      </div>
    );
  };

  const MesaRectangularInteractiva = ({ element }) => {
    const esMiMesa = asignacionActual?.numeroMesa === element.numero;
    
    // Usar disponibilidad real del backend si está disponible
    const disponibilidad = element.disponibilidad;
    const espacioDisponible = disponibilidad 
      ? disponibilidad.asientos_disponibles 
      : (element.capacidad - element.invitados);
    const invitadosAsignados = disponibilidad 
      ? disponibilidad.asientos_ocupados 
      : element.invitados;

    let puedeSeleccionar = false;
    if (!asignacionActual) {
      // ✅ CON SISTEMA DE TURNOS: usar SIEMPRE disponibilidad del backend
      if (usandoSistemaTurnos) {
        // En sistema de turnos, la disponibilidad DEBE venir del backend
        if (disponibilidad) {
          puedeSeleccionar = disponibilidad.esta_disponible && 
                            disponibilidad.asientos_disponibles >= usuarioActual.cantidad;
        }
        // Si no hay disponibilidad en sistema de turnos, la mesa NO es seleccionable
      } else {
        // ❌ SISTEMA LEGACY (sin turnos): lógica anterior
        if (disponibilidad) {
          // Usar disponibilidad si está disponible
          puedeSeleccionar = disponibilidad.esta_disponible && 
                            disponibilidad.asientos_disponibles >= usuarioActual.cantidad;
        } else {
          // Fallback a lógica legacy
          if (espacioDisponible >= usuarioActual.cantidad) {
            if (invitadosAsignados > 0) {
              puedeSeleccionar = true;
            } else {
              const validacion = puedeAbrirMesaNueva();
              puedeSeleccionar = validacion.puede;
            }
          }
        }
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
      transformOrigin: 'center center'
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
      transformOrigin: 'center center'
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
    return (
      <div style={transformStyle}>
        {elementContent}
      </div>
    );
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
    const mesasConInvitados = allElements.filter(
      (el) =>
        (el.type === "mesa" || el.type === "mesaRectangular") &&
        el.invitados > 0
    );

    const totalPersonasOcupadas = mesasConInvitados.reduce(
      (total, mesa) => total + mesa.invitados,
      0
    );

    const espacioTotalDisponible = mesasConInvitados.reduce(
      (total, mesa) => total + (mesa.capacidad - mesa.invitados),
      0
    );

    return {
      totalPersonasOcupadas,
      espacioTotalDisponible,
      mesasConInvitados: mesasConInvitados.length,
      totalMesas: allElements.filter(
        (el) => el.type === "mesa" || el.type === "mesaRectangular"
      ).length,
    };
  };

  const puedeAbrirMesaNueva = () => {
    const stats = obtenerEstadisticasOcupacion();

    // Regla 1: Si hay menos de 10 personas total, NO puede abrir mesa nueva
    if (stats.totalPersonasOcupadas < 10) {
      return {
        puede: false,
        razon: "minimo-personas",
        mensaje: `Solo hay ${stats.totalPersonasOcupadas} personas ocupadas. Se necesitan al menos 10 personas antes de abrir una mesa nueva.`,
      };
    }

    // Regla 2: Si aún hay espacio disponible en mesas ocupadas, NO puede abrir mesa nueva
    if (stats.espacioTotalDisponible >= usuarioActual.cantidad) {
      return {
        puede: false,
        razon: "espacio-disponible",
        mensaje: `Aún hay ${stats.espacioTotalDisponible} lugares disponibles en mesas ocupadas. Debes llenar estos espacios primero.`,
      };
    }

    // Puede abrir mesa nueva
    return {
      puede: true,
      razon: "sin-espacio",
      mensaje:
        "Puedes abrir una mesa nueva porque no hay suficiente espacio en las mesas ocupadas.",
    };
  };

  /* -----------------------
    Lógica de sugerencias
  ----------------------- */
  const obtenerSugerenciasMesas = () => {
    if (asignacionActual) return [];

    const stats = obtenerEstadisticasOcupacion();
    const puedeAbrirNueva = puedeAbrirMesaNueva();

    const mesasDisponibles = allElements
      .filter((el) => {
        if (!(el.type === "mesa" || el.type === "mesaRectangular"))
          return false;
        if (el.capacidad - el.invitados < usuarioActual.cantidad) return false;

        // Si la mesa está vacía, verificar si puede abrirla
        if (el.invitados === 0 && !puedeAbrirNueva.puede) return false;

        return true;
      })
      .map((mesa) => ({
        ...mesa,
        espacioDisponible: mesa.capacidad - mesa.invitados,
        porcentajeOcupado: (mesa.invitados / mesa.capacidad) * 100,
        // Validar sillas especiales
        tieneSillaEspecial: usuarioActual.necesidadEspecial
          ? Array.isArray(mesa.sillasEspeciales)
            ? mesa.sillasEspeciales.length > 0
            : mesa.sillasEspeciales > 0
          : true,
        esMesaNueva: mesa.invitados === 0,
      }))
      .filter((mesa) => mesa.tieneSillaEspecial);

    // Ordenar por prioridad:
    // 1. Mesas con invitados primero
    // 2. Mesas más ocupadas
    // 3. Espacio más justo
    const mesasOrdenadas = mesasDisponibles.sort((a, b) => {
      // Priorizar mesas con invitados sobre mesas vacías
      if (a.esMesaNueva && !b.esMesaNueva) return 1;
      if (!a.esMesaNueva && b.esMesaNueva) return -1;

      // Si ambas tienen invitados, priorizar la más ocupada
      if (a.invitados !== b.invitados) {
        return b.invitados - a.invitados;
      }

      // Si tienen la misma ocupación, priorizar espacio más justo
      return a.espacioDisponible - b.espacioDisponible;
    });

    return mesasOrdenadas.slice(0, 3);
  };

  const sugerenciasMesas = obtenerSugerenciasMesas();

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
        <div className="mb-6">
          {/* Título y temporizador */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <User className="w-8 h-8 text-casal" />
                Selección de Mesa
                {/* Mostrar temporizador del turno si está disponible, sino el local */}
                {((usandoSistemaTurnos && tiempoRestanteTurno !== null && tiempoRestanteTurno > 0) || 
                  (!usandoSistemaTurnos && tiempoRestante !== null)) && !asignacionActual && (
                  <div className="ml-4 flex items-center gap-2">
                    <div
                      className={`px-3 py-1 rounded-full font-mono text-lg font-bold ${
                        (usandoSistemaTurnos ? tiempoRestanteTurno : tiempoRestante) < 300
                          ? "bg-red-100 text-red-800 border border-red-300"
                          : (usandoSistemaTurnos ? tiempoRestanteTurno : tiempoRestante) < 600
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
              </h1>
              <div className="text-gray-600 mt-2">
                <p>
                  Elige tu mesa para el evento y especifica tus preferencias
                  alimenticias
                </p>
              </div>
            </div>

            {asignacionActual && (
              <div className="flex items-center gap-3">
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">
                      Mesa {asignacionActual.numeroMesa} confirmada
                    </span>
                  </div>
                </div>
                {/* Ocultar botón si la selección ya está confirmada (completada) */}
                {!seleccionGuardada?.confirmada && (
                  <Button
                    onClick={cancelarAsignacion}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancelar Asignación
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Información del usuario en horizontal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex flex-wrap items-center gap-6">
              {/* Nombre */}
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <label className="text-xs text-gray-500">Nombre</label>
                  <p className="font-semibold text-gray-800">{usuarioActual.nombre}</p>
                </div>
              </div>

              {/* Personas */}
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <label className="text-xs text-gray-500">Personas</label>
                  <p className="font-semibold text-gray-800">
                    {usuarioActual.cantidad} {usuarioActual.cantidad === 1 ? "persona" : "personas"}
                  </p>
                </div>
              </div>

              {/* Necesidad especial */}
              {usuarioActual.necesidadEspecial && (
                <div className="flex items-center gap-2">
                  <Accessibility className="w-5 h-5 text-orange-600" />
                  <div>
                    <label className="text-xs text-gray-500">Necesidades especiales</label>
                    <p className="font-semibold text-orange-600">Silla de accesibilidad</p>
                  </div>
                </div>
              )}

              {/* Asignación actual */}
              {asignacionActual && (
                <>
                  <div className="w-px h-10 bg-gray-300"></div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-casal" />
                    <div>
                      <label className="text-xs text-gray-500">Mesa asignada</label>
                      <p className="font-semibold text-gray-800">Mesa {asignacionActual.numeroMesa}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Fecha asignación</label>
                      <p className="font-semibold text-gray-800">{asignacionActual.fechaFormateada}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Panel de mesas sugeridas (ahora en la parte superior del layout) */}
        {!asignacionActual && sugerenciasMesas.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            {(() => {
              const stats = obtenerEstadisticasOcupacion();
              return (
                <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded text-xs inline-block">
                  <div className="flex gap-4 text-center">
                    <div>
                      <div className="font-semibold text-gray-800">
                        {stats.totalPersonasOcupadas}
                      </div>
                      <div className="text-gray-600">Personas</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {stats.espacioTotalDisponible}
                      </div>
                      <div className="text-gray-600">Espacios libres</div>
                    </div>
                  </div>
                </div>
              );
            })()}
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-casal" />
              Mesas Sugeridas para Ti
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {sugerenciasMesas.map((mesa, index) => (
                <div
                  key={mesa.numero}
                  className="flex items-center justify-between p-2 bg-fondoVs border border-casalds-700 rounded cursor-pointer hover:bg-casalds-600/80 transition-colors group"
                  onClick={() => seleccionarMesa(mesa.numero)}
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-casal text-white group-hover:border group-hover:border-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800 group-hover:text-gray-100">
                      Mesa {mesa.numero}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 group-hover:text-gray-100">
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

        <div className="flex flex-col gap-6">

          {/* Plano del Salón */}
          <div className="flex-1 min-w-0">
            <div className="border border-gray-100 rounded-lg bg-white overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">
                  Plano del Salón - "Jardín Romántico"
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
    </div>
  );
}
