import React, { useState, useRef, useEffect } from "react";
import Mesa from "../Distribuccion/Mesa.jsx";
import MesaRectangular from "../Distribuccion/MesaRectangular.jsx";
import {
  Save,
  Accessibility,
  Minus,
  Plus,
  RotateCcw,
  Eye,
  User,
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@headlessui/react";
import { Tooltip } from "../ui/Tooltip.jsx";
import ModalRestricciones from "../Distribuccion/ModalRestricciones.jsx";
import ModalMesaDetalles from "../Distribuccion/ModalMesaDetalles.jsx";

export default function AsignacionUser() {
  /* -----------------------
    Constantes
  ----------------------- */
  const CANVAS_WIDTH = 4000;
  const CANVAS_HEIGHT = 2400;
  const ZOOM_STEP = 0.1;
  const ZOOM_MIN = 0.1;
  const ZOOM_MAX = 4;

  /* -----------------------
    Estados y refs
  ----------------------- */
  // Datos del usuario (simulado - en real vendrían de contexto/API)
  const [usuarioActual] = useState({
    id: "user-001",
    nombre: "María González",
    cantidad: 2, // Trae acompañante
    necesidadEspecial: false,
    email: "maria.gonzalez@email.com",
    telefono: "+52 555 123 4567",
  });

  // Estado de asignación del usuario
  const [asignacionActual, setAsignacionActual] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Layout del salón (simulado - en real vendría de API)
  const [allElements, setAllElements] = useState([
    // Mesas circulares
    {
      id: "mesa-1",
      type: "mesa",
      numero: 1,
      invitados: 6,
      capacidad: 8,
      position: { x: 120, y: 120 },
      sillasEspeciales: [],
      assignedGuests: [],
    },
    {
      id: "mesa-2",
      type: "mesa",
      numero: 2,
      invitados: 4,
      capacidad: 8,
      position: { x: 320, y: 120 },
      sillasEspeciales: [1, 2],
      assignedGuests: [],
    },
    {
      id: "mesa-3",
      type: "mesa",
      numero: 3,
      invitados: 8,
      capacidad: 8,
      position: { x: 520, y: 120 },
      sillasEspeciales: [],
      assignedGuests: [],
    },
    {
      id: "mesa-4",
      type: "mesa",
      numero: 4,
      invitados: 2,
      capacidad: 8,
      position: { x: 220, y: 280 },
      sillasEspeciales: [1],
      assignedGuests: [],
    },
    {
      id: "mesa-5",
      type: "mesa",
      numero: 5,
      invitados: 0,
      capacidad: 8,
      position: { x: 420, y: 280 },
      sillasEspeciales: [],
      assignedGuests: [],
    },

    // Mesas rectangulares
    {
      id: "mesa-rect-1",
      type: "mesaRectangular",
      numero: 6,
      invitados: 8,
      capacidad: 12,
      position: { x: 100, y: 450 },
      sillasEspeciales: [],
      assignedGuests: [],
    },
    {
      id: "mesa-rect-2",
      type: "mesaRectangular",
      numero: 7,
      invitados: 5,
      capacidad: 12,
      position: { x: 350, y: 450 },
      sillasEspeciales: [1, 2],
      assignedGuests: [],
    },

    // Elementos decorativos
    {
      id: "mesa-principal",
      type: "mesa-principal",
      position: { x: 320, y: 50 },
    },
    { id: "buffet-1", type: "buffet", position: { x: 50, y: 200 } },
    { id: "escenario-1", type: "escenario", position: { x: 590, y: 200 } },
    {
      id: "pista-baile",
      type: "pistaBaileRedonda",
      position: { x: 320, y: 350 },
    },
  ]);

  // Zoom y controles
  const [zoom, setZoom] = useState(1);
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
       setAsignacionActual(asignacion);
        setAllElements((prevElements) =>
          prevElements.map((element) => {
            if (
              element.numero === asignacion.numeroMesa &&
              (element.type === "mesa" || element.type === "mesaRectangular")
            ) {
              // Verificar si el usuario ya está en la mesa para evitar duplicados
              const yaEstaAsignado = (element.assignedGuests || []).some(
                (guest) => guest.id === usuarioActual.id
              );
              if (!yaEstaAsignado) {
                return {
                  ...element,
                  assignedGuests: [
                    ...(element.assignedGuests || []),
                    {
                      id: usuarioActual.id,
                      nombre: asignacion.nombre,
                      cantidad: asignacion.cantidad,
                      restricciones: asignacion.restricciones,
                      otra: asignacion.otra,
                      necesidadEspecial: asignacion.necesidadEspecial,
                      fechaAsignacion: asignacion.fechaFormateada,
                    },
                  ],
                };
              }
            }
            return element;
          })
        );
      } catch (error) {
        console.error("Error al cargar asignación:", error);
      }
    }
  }, [usuarioActual.id]);

  // Atajos de teclado
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") resetZoom();
      if (e.key === "f") fitToView();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, offset, allElements]);

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

    // Validar capacidad disponible
    const espacioDisponible =
      mesaSeleccionada.capacidad - mesaSeleccionada.invitados;
    if (espacioDisponible < usuarioActual.cantidad) {
      mostrarNotificacion(
        `❌ La Mesa ${numeroMesa} no tiene suficiente espacio.\n\n` +
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
          `❌ La Mesa ${numeroMesa} no tiene sillas especiales.\n\n` +
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

  const handleConfirmRestricciones = ({
    nombre,
    restricciones: res,
    otra: otraText,
  }) => {
    if (!pendingAsignacion) return;

    const { usuario, numeroMesa } = pendingAsignacion;

    // Crear objeto de asignación
    const nuevaAsignacion = {
      id: `asignacion-${Date.now()}`,
      usuarioId: usuario.id,
      numeroMesa,
      nombre: nombre || usuario.nombre,
      cantidad: usuario.cantidad,
      restricciones: res,
      otra: otraText,
      necesidadEspecial: usuario.necesidadEspecial,
      fechaAsignacion: new Date().toISOString(),
      fechaFormateada: new Date().toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Actualizar la mesa con la información del usuario asignado
    setAllElements((prevElements) =>
      prevElements.map((element) => {
        if (
          element.numero === numeroMesa &&
          (element.type === "mesa" || element.type === "mesaRectangular")
        ) {
          return {
            ...element,
            invitados: element.invitados + usuario.cantidad,
            assignedGuests: [
              ...(element.assignedGuests || []),
              {
                id: usuario.id,
                nombre: nombre || usuario.nombre,
                cantidad: usuario.cantidad,
                restricciones: res,
                otra: otraText,
                necesidadEspecial: usuario.necesidadEspecial,
                fechaAsignacion: nuevaAsignacion.fechaFormateada,
              },
            ],
          };
        }
        return element;
      })
    );

    // Guardar asignación
    setAsignacionActual(nuevaAsignacion);
    localStorage.setItem(
      `asignacion-${usuario.id}`,
      JSON.stringify(nuevaAsignacion)
    );

    mostrarNotificacion(
      `✅ ¡Asignación confirmada!\n\n` +
        `Mesa: ${numeroMesa}\n` +
        `Nombre: ${nombre || usuario.nombre}\n` +
        `Personas: ${usuario.cantidad}`,
      "success"
    );

    // Cerrar modal
    setShowRestrModal(false);
    setPendingAsignacion(null);
    setPendingNombre("");
  };

  const cancelarAsignacion = () => {
    if (!asignacionActual) return;

    const confirmar = window.confirm(
      "¿Estás seguro de que deseas cancelar tu asignación?\n\n" +
        "Perderás tu lugar en la mesa y tendrás que seleccionar otra."
    );
    // Remover al usuario de la mesa
    setAllElements((prevElements) =>
      prevElements.map((element) => {
        if (
          element.numero === asignacionActual.numeroMesa &&
          (element.type === "mesa" || element.type === "mesaRectangular")
        ) {
          return {
            ...element,
            invitados: Math.max(0, element.invitados - usuarioActual.cantidad),
            assignedGuests: (element.assignedGuests || []).filter(
              (guest) => guest.id !== usuarioActual.id
            ),
          };
        }
        return element;
      })
    );

    if (confirmar) {
      setAsignacionActual(null);
      localStorage.removeItem(`asignacion-${usuarioActual.id}`);
      mostrarNotificacion(
        "Asignación cancelada. Puedes seleccionar otra mesa.",
        "info"
      );
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
    const espacioDisponible = element.capacidad - element.invitados;
    const puedeSeleccionar =
      !asignacionActual && espacioDisponible >= usuarioActual.cantidad;

    return (
      <div
        className={`pointer-events-auto ${
          puedeSeleccionar ? "cursor-pointer" : "cursor-default"
        }`}
        onClick={() => puedeSeleccionar && seleccionarMesa(element.numero)}
      >
        <Mesa
          numeroMesa={element.numero}
          invitadosAsignados={element.invitados}
          capacidadMaxima={element.capacidad}
          sillasEspeciales={element.sillasEspeciales || []}
          invitadosEspeciales={element.invitadosEspeciales || 0}
          onDoubleClick={() => openMesaModal(element.numero)}
          destacada={esMiMesa}
          disponible={puedeSeleccionar}
          className={esMiMesa ? "ring-4 ring-green-400 ring-opacity-60" : ""}
        />
      </div>
    );
  };

  const MesaRectangularInteractiva = ({ element }) => {
    const esMiMesa = asignacionActual?.numeroMesa === element.numero;
    const espacioDisponible = element.capacidad - element.invitados;
    const puedeSeleccionar =
      !asignacionActual && espacioDisponible >= usuarioActual.cantidad;

    return (
      <div
        className={`pointer-events-auto ${
          puedeSeleccionar ? "cursor-pointer" : "cursor-default"
        }`}
        onClick={() => puedeSeleccionar && seleccionarMesa(element.numero)}
      >
        <MesaRectangular
          numeroMesa={element.numero}
          invitadosAsignados={element.invitados}
          capacidadMaxima={element.capacidad}
          sillasEspeciales={element.sillasEspeciales || []}
          invitadosEspeciales={element.invitadosEspeciales || 0}
          onDoubleClick={() => openMesaModal(element.numero)}
          destacada={esMiMesa}
          disponible={puedeSeleccionar}
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

    // Elementos decorativos (no interactivos)
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
  };

  return (
    <div className="bg-fondoVs min-h-screen max-w-7xl mx-auto px-4 sm:px-2 lg:px-8">
      <div className="py-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <User className="w-8 h-8 text-casal" />
              Selección de Mesa
            </h1>
            <p className="text-gray-600 mt-2">
              Elige tu mesa para el evento y especifica tus preferencias
              alimenticias
            </p>
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
              <Button
                onClick={cancelarAsignacion}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancelar Asignación
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Panel de información del usuario */}
          <div className="w-full xl:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Tu Información
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Nombre</label>
                  <p className="font-medium text-gray-800">
                    {usuarioActual.nombre}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Personas</label>
                  <p className="font-medium text-gray-800 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {usuarioActual.cantidad}{" "}
                    {usuarioActual.cantidad === 1 ? "persona" : "personas"}
                  </p>
                </div>

                {usuarioActual.necesidadEspecial && (
                  <div>
                    <label className="text-sm text-gray-600">
                      Necesidades especiales
                    </label>
                    <p className="font-medium text-orange-600 flex items-center gap-1">
                      <Accessibility className="w-4 h-4" />
                      Silla de accesibilidad requerida
                    </p>
                  </div>
                )}
              </div>

              {asignacionActual && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Tu Asignación
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-600">Mesa:</span>
                      <span className="font-medium ml-2">
                        Mesa {asignacionActual.numeroMesa}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Nombre en mesa:</span>
                      <span className="font-medium ml-2">
                        {asignacionActual.nombre}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Fecha asignación:</span>
                      <span className="font-medium ml-2">
                        {asignacionActual.fechaFormateada}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 p-3 bg-casal/5 border border-casal rounded-lg">
                <p className="text-sm text-casal">
                  {!asignacionActual ? (
                    <>
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      Haz clic en una mesa disponible para seleccionarla. Las
                      mesas con asiento grises tienen espacio suficiente para ti.
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      ¡Perfecto! Ya tienes tu mesa asignada. Puedes ver los
                      detalles haciendo doble clic en tu mesa.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

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
                  <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
                  <span>Mesa disponible para ti</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></div>
                  <span>Mesa con poco espacio</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 border border-red-400 rounded"></div>
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
          }}
          invitado={pendingAsignacion?.usuario}
          mesaNumero={pendingAsignacion?.numeroMesa}
          restricciones={restricciones}
          setRestricciones={setRestricciones}
          otra={otra}
          setOtra={setOtra}
          nombre={pendingNombre}
          setNombre={setPendingNombre}
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
