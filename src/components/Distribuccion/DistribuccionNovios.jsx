import React, { useState, useRef, useEffect } from "react";
import Mesa from "./Mesa.jsx";
import MesaRectangular from "./MesaRectangular.jsx";
import {
  TriangleAlert,
  Save,
  Accessibility,
  Minus,
  Plus,
  RotateCcw,
  Scan,
} from "lucide-react";
import { Button } from "@headlessui/react";
import { Tooltip } from "../ui/Tooltip.jsx";
import ModalRestricciones from "./ModalRestricciones.jsx";
import ModalMesaDetalles from "./ModalMesaDetalles.jsx";
import FullscreenDesignModal from "./FullscreenDesignModal.jsx";

export default function DistribuccionNovios({
  allElements = [],
  setAllElements,
  invitados = [],
  layoutGuardado,
  layoutFinal,
}) {
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
  const [activeInvitado, setActiveInvitado] = React.useState(null);
  const [invitadosSinAsignar, setInvitadosSinAsignar] =
    React.useState(invitados);
  const [distribucionesGuardadas, setDistribucionesGuardadas] = React.useState(
    []
  );
  const [autoAsignando, setAutoAsignando] = React.useState(false);
  const [guardando, setGuardando] = React.useState(false);

  const [activeId, setActiveId] = useState(null);

  // ZOOM & FULLSCREEN modal
  const [zoom, setZoom] = useState(1); // 1 = 100%
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // pan en coordenadas del canvas
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);

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

  // modal confirmación parcial
  const [showModal, setShowModal] = React.useState(false);
  const [modalData, setModalData] = React.useState(null);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isPanningRef = useRef(false);
  const panLastRef = useRef({ x: 0, y: 0 });

  /* -----------------------
    Effects
  ----------------------- */

  // Cargar distribuciones guardadas del localStorage al inicio
  React.useEffect(() => {
    const distribucionesLS = localStorage.getItem("distribucionesGuardadas");
    if (distribucionesLS) {
      setDistribucionesGuardadas(JSON.parse(distribucionesLS));
    }
  }, []);

  // atajos: Esc -> reset zoom, double click centro -> fit
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

  /* -----------------------
    Estadísticas derivadas
  ----------------------- */
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

  // Zoom con rueda (mantén Ctrl o sin Ctrl — aquí uso Ctrl+wheel para evitar scroll accidental)
  const handleWheel = (e) => {
    // evita scroll accidental: opcional activar Ctrl/meta
    // if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.12 : 0.88;
    const newZoom = clamp(zoom * factor, ZOOM_MIN, ZOOM_MAX);
    const rect = containerRef.current.getBoundingClientRect();
    const cursorCanvasX = (e.clientX - rect.left) / zoom - offset.x;
    const cursorCanvasY = (e.clientY - rect.top) / zoom - offset.y;
    const newOffsetX = offset.x - cursorCanvasX * (newZoom / zoom - 1);
    const newOffsetY = offset.y - cursorCanvasY * (newZoom / zoom - 1);
    setZoom(newZoom);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  // Inicia pan (barra espacio presionada, Alt o botón medio)
  const handleMouseDownCanvas = (e) => {
    // no iniciar pan si estamos arrastrando un elemento
    if (activeId) return;

    // iniciar pan con botón medio o Alt o Space
    const startPan =
      e.button === 1 || e.altKey || e.code === "Space" || e.shiftKey;
    if (!startPan) return;

    isPanningRef.current = true;
    panLastRef.current = { x: e.clientX, y: e.clientY };
    // evitar selección de texto
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

  // Ajusta zoom y offset para encuadrar todo el contenido
  const fitToView = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (!allElements || allElements.length === 0) {
      resetZoom();
      return;
    }

    // calcular bounding box de elementos
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

    // centrar contenido
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
    Asignación automática y manual
  ----------------------- */
  // Actualizar la función autoAsignarInvitados para priorizar necesidades especiales
  const autoAsignarInvitados = async () => {
    if (invitadosSinAsignar.length === 0) {
      mostrarNotificacion("No hay graduados sin asignar", "info");
      return;
    }

    setAutoAsignando(true);
    mostrarNotificacion(
      "Iniciando asignación automática inteligente...",
      "info"
    );

    let elementosTemp = [...allElements];
    let invitadosTemp = [...invitadosSinAsignar];
    let asignacionesRealizadas = [];

    // PASO 1: Priorizar invitados con necesidades especiales
    const invitadosEspeciales = invitadosTemp.filter(
      (inv) => inv.necesidadEspecial
    );
    const invitadosRegulares = invitadosTemp.filter(
      (inv) => !inv.necesidadEspecial
    );

    // Asignar primero a invitados con necesidades especiales
    for (let invitado of invitadosEspeciales) {
      const mesasConSillasEspeciales = elementosTemp
        .filter((el) => el.type === "mesa" || el.type === "mesaRectangular")
        .filter(
          (el) =>
            el.sillasEspeciales &&
            el.sillasEspeciales.length > 0 &&
            (el.invitadosEspeciales || 0) < el.sillasEspeciales.length &&
            el.capacidad - el.invitados >= invitado.cantidad
        )
        .sort((a, b) => {
          const espacioA = a.capacidad - a.invitados;
          const espacioB = b.capacidad - b.invitados;
          const diferenciaA = Math.abs(espacioA - invitado.cantidad);
          const diferenciaB = Math.abs(espacioB - invitado.cantidad);
          return diferenciaA - diferenciaB;
        });

      if (mesasConSillasEspeciales.length > 0) {
        const mejorMesa = mesasConSillasEspeciales[0];

        elementosTemp = elementosTemp.map((element) =>
          element.numero === mejorMesa.numero &&
          (element.type === "mesa" || element.type === "mesaRectangular")
            ? {
                ...element,
                invitados: element.invitados + invitado.cantidad,
                invitadosEspeciales:
                  (element.invitadosEspeciales || 0) + invitado.cantidad,
              }
            : element
        );

        asignacionesRealizadas.push({
          invitado: invitado.nombre,
          cantidad: invitado.cantidad,
          mesa: mejorMesa.numero,
          especial: true,
        });

        invitadosTemp = invitadosTemp.filter((inv) => inv.id !== invitado.id);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // PASO 2: Asignar invitados regulares
    for (let invitado of invitadosRegulares) {
      const mesasDisponibles = elementosTemp
        .filter((el) => el.type === "mesa" || el.type === "mesaRectangular")
        .filter((el) => el.capacidad - el.invitados >= invitado.cantidad)
        .sort((a, b) => {
          const espacioA = a.capacidad - a.invitados;
          const espacioB = b.capacidad - b.invitados;
          const diferenciaA = Math.abs(espacioA - invitado.cantidad);
          const diferenciaB = Math.abs(espacioB - invitado.cantidad);
          return diferenciaA - diferenciaB;
        });

      if (mesasDisponibles.length > 0) {
        const mejorMesa = mesasDisponibles[0];

        elementosTemp = elementosTemp.map((element) =>
          element.numero === mejorMesa.numero &&
          (element.type === "mesa" || element.type === "mesaRectangular")
            ? { ...element, invitados: element.invitados + invitado.cantidad }
            : element
        );

        asignacionesRealizadas.push({
          invitado: invitado.nombre,
          cantidad: invitado.cantidad,
          mesa: mejorMesa.numero,
          especial: false,
        });

        invitadosTemp = invitadosTemp.filter((inv) => inv.id !== invitado.id);
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // Aplicar los cambios finales
    setAllElements(elementosTemp);
    setInvitadosSinAsignar(invitadosTemp);
    setAutoAsignando(false);

    // Mostrar resultado detallado
    if (asignacionesRealizadas.length > 0) {
      const totalPersonasAsignadas = asignacionesRealizadas.reduce(
        (total, a) => total + a.cantidad,
        0
      );
      const asignacionesEspeciales = asignacionesRealizadas.filter(
        (a) => a.especial
      ).length;

      mostrarNotificacion(
        `🎉 Auto-asignación completada!\n\n` +
          `• ${asignacionesRealizadas.length} grupos asignados\n` +
          `• ${totalPersonasAsignadas} personas ubicadas\n` +
          `• ${asignacionesEspeciales} grupos con necesidades especiales 🦽\n` +
          `• ${invitadosTemp.length} grupos restantes`,
        "success"
      );
    } else {
      mostrarNotificacion(
        "No se pudieron asignar más graduados automáticamente",
        "warning"
      );
    }
  };

  // Función para verificar si hay mesa con capacidad disponible
  const encontrarMesaDisponible = (cantidadPersonas) => {
    return allElements.find(
      (element) =>
        (element.type === "mesa" || element.type === "mesaRectangular") &&
        element.capacidad - element.invitados >= cantidadPersonas
    );
  };

  const asignarInvitadosMesa = (numeroMesa, datosInvitado) => {
    // buscar la mesa en el layout
    const mesaSeleccionada = allElements.find(
      (el) =>
        el.numero === numeroMesa &&
        (el.type === "mesa" || el.type === "mesaRectangular")
    );

    if (!mesaSeleccionada) {
      mostrarNotificacion(`Mesa ${numeroMesa} no encontrada`, "error");
      return;
    }

    // normalize cantidad
    const cantidad = Number(datosInvitado?.cantidad || 1);

    // obtener sillas especiales (soporta array o número)
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

    // Validar capacidad disponible
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

    // Si no cabe todo el grupo -> abrir modal de confirmación parcial (ya implementado)
    if (cantidad > espacioDisponible) {
      setModalData({
        invitado: datosInvitado,
        mesa: mesaSeleccionada,
        espacioDisponible,
        personasSobrantes: cantidad - espacioDisponible,
      });
      setShowModal(true);
      return;
    }

    // Si todo OK -> abrir el modal de restricciones para confirmar nombre/restricciones
    setPendingAsignacion({ invitado: datosInvitado, numeroMesa });
    setPendingNombre(datosInvitado?.nombre || "");
    // resetear formulario del modal
    setRestricciones({
      vegetariano: 0,
      vegano: 0,
      sinGluten: 0,
      alergiaMarisco: 0,
    });
    setOtra("");
    setShowRestrModal(true);
  };

  /* -----------------------
    Confirmaciones desde modales
  ----------------------- */

  // Confirmación desde ModalRestricciones: guarda datos y asigna (total o parcial)
  const handleConfirmRestricciones = ({
    nombre,
    restricciones: res,
    otra: otraText,
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
    const espacioDisponible =
      mesaSeleccionada.capacidad - mesaSeleccionada.invitados;
    const cantidad = invitado.cantidad;

    // Si cabe todo, asignar y guardar detalles en assignedGuests
    if (espacioDisponible >= cantidad) {
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
        `✅ ${nombre || invitado.nombre} asignado a Mesa ${numeroMesa}`,
        "success"
      );
    } else {
      // espacio insuficiente -> dividir grupo: asignar lo que cabe y crear sobrante con mismas restricciones
      const personasSobrantes = cantidad - Math.max(0, espacioDisponible);

      // asignar lo que cabe (si cabe algo)
      if (espacioDisponible > 0) {
        setAllElements((prev) =>
          prev.map((el) =>
            el.numero === numeroMesa &&
            (el.type === "mesa" || el.type === "mesaRectangular")
              ? {
                  ...el,
                  invitados: (el.invitados || 0) + espacioDisponible,
                  invitadosEspeciales: invitado.necesidadEspecial
                    ? (el.invitadosEspeciales || 0) + espacioDisponible
                    : el.invitadosEspeciales || 0,
                  assignedGuests: [
                    ...(el.assignedGuests || []),
                    {
                      id: `${invitado.id}-${Date.now()}`,
                      nombre: nombre || invitado.nombre,
                      cantidad: espacioDisponible,
                      restricciones: res,
                      otra: otraText,
                      necesidadEspecial: invitado.necesidadEspecial || false,
                    },
                  ],
                }
              : el
          )
        );
      }

      // crear sobrante y devolver a la lista sin asignar
      const sobrante = {
        ...invitado,
        id: Date.now(),
        nombre: `${nombre || invitado.nombre} (restantes)`,
        cantidad: personasSobrantes,
      };
      setInvitadosSinAsignar((prev) => [
        ...prev.filter((inv) => inv.id !== invitado.id),
        sobrante,
      ]);

      mostrarNotificacion(
        `Asignación parcial: ${Math.max(
          0,
          espacioDisponible
        )} personas → Mesa ${numeroMesa}. ${personasSobrantes} en lista (sobrantes).`,
        "warning"
      );
    }

    // cerrar modal y limpiar
    setShowRestrModal(false);
    setPendingAsignacion(null);
    setPendingNombre("");
  };

  // Función para confirmar asignación parcial
  const confirmarAsignacionParcial = (aceptar) => {
    if (!modalData) return;

    const { invitado, mesa, espacioDisponible, personasSobrantes } = modalData;

    if (aceptar) {
      setAllElements((prev) =>
        prev.map((element) =>
          element.numero === mesa.numero &&
          (element.type === "mesa" || element.type === "mesaRectangular")
            ? { ...element, invitados: element.invitados + espacioDisponible }
            : element
        )
      );

      setInvitadosSinAsignar((prev) =>
        prev.filter((inv) => inv.id !== invitado.id)
      );

      const personasSobrantes_grupo = {
        ...invitado,
        id: Date.now(),
        nombre: `${invitado.nombre} (${personasSobrantes} restantes)`,
        cantidad: personasSobrantes,
      };

      const mesaParaSobrantes = allElements.find(
        (element) =>
          (element.type === "mesa" || element.type === "mesaRectangular") &&
          element.numero !== mesa.numero &&
          element.capacidad - element.invitados >= personasSobrantes
      );

      if (mesaParaSobrantes) {
        setAllElements((prev) =>
          prev.map((element) =>
            element.numero === mesaParaSobrantes.numero &&
            (element.type === "mesa" || element.type === "mesaRectangular")
              ? { ...element, invitados: element.invitados + personasSobrantes }
              : element
          )
        );

        mostrarNotificacion(
          `Distribución exitosa:\n• ${espacioDisponible} personas → Mesa ${mesa.numero}\n• ${personasSobrantes} personas → Mesa ${mesaParaSobrantes.numero}`,
          "success"
        );
      } else {
        setInvitadosSinAsignar((prev) => [...prev, personasSobrantes_grupo]);
        mostrarNotificacion(
          `Asignación parcial completada:\n• ${espacioDisponible} personas → Mesa ${mesa.numero}\n• ${personasSobrantes} personas regresaron a la lista (sin mesas disponibles)`,
          "warning"
        );
      }
    } else {
      mostrarNotificacion(
        `${invitado.nombre} permaneció en la lista. Busque una mesa con más capacidad`,
        "info"
      );
    }

    setShowModal(false);
    setModalData(null);
  };

  /* -----------------------
   Guardado / Distribuciones
  ----------------------- */
  // FUNCIÓN PARA GUARDAR DISTRIBUCIÓN
  const guardarDistribucion = () => {
    setGuardando(true);

    // Crear objeto de distribución
    const nuevaDistribucion = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      fechaFormateada: new Date().toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      elementos: [...allElements],
      invitadosSinAsignar: [...invitadosSinAsignar],
      estadisticas: {
        totalInvitadosAsignados: allElements
          .filter((el) => el.type === "mesa" || el.type === "mesaRectangular")
          .reduce((total, mesa) => total + (mesa.invitados || 0), 0),
        totalCapacidad: allElements
          .filter((el) => el.type === "mesa" || el.type === "mesaRectangular")
          .reduce((total, mesa) => total + (mesa.capacidad || 0), 0),
        mesasOcupadas: allElements.filter(
          (el) =>
            (el.type === "mesa" || el.type === "mesaRectangular") &&
            el.invitados > 0
        ).length,
        totalMesas: allElements.filter(
          (el) => el.type === "mesa" || el.type === "mesaRectangular"
        ).length,
        porcentajeOcupacion: Math.round(
          (allElements
            .filter((el) => el.type === "mesa" || el.type === "mesaRectangular")
            .reduce((total, mesa) => total + (mesa.invitados || 0), 0) /
            Math.max(
              1,
              allElements
                .filter(
                  (el) => el.type === "mesa" || el.type === "mesaRectangular"
                )
                .reduce((total, mesa) => total + (mesa.capacidad || 0), 0)
            )) *
            100
        ),
      },
      nombre: `Distribución ${new Date().toLocaleDateString("es-ES")}`,
    };

    // Guardar en la lista local
    const nuevasDistribuciones = [
      ...distribucionesGuardadas,
      nuevaDistribucion,
    ];
    setDistribucionesGuardadas(nuevasDistribuciones);

    // Guardar en localStorage
    localStorage.setItem(
      "distribucionesGuardadas",
      JSON.stringify(nuevasDistribuciones)
    );
    localStorage.setItem(
      "ultimaDistribucion",
      JSON.stringify(nuevaDistribucion)
    );

    setTimeout(() => {
      setGuardando(false);
      mostrarNotificacion(
        `Distribución guardada exitosamente!\n` +
          `• Fecha: ${nuevaDistribucion.fechaFormateada}\n` +
          `• ${nuevaDistribucion.estadisticas.totalInvitadosAsignados}/${nuevaDistribucion.estadisticas.totalCapacidad} invitados asignados\n` +
          `• ${nuevaDistribucion.estadisticas.porcentajeOcupacion}% de ocupación`,
        "success"
      );
    }, 1000);
  };

  // Función para mostrar lista de distribuciones guardadas
  const mostrarDistribucionesGuardadas = () => {
    if (distribucionesGuardadas.length === 0) {
      mostrarNotificacion("No hay distribuciones guardadas", "info");
      return;
    }

    const listaDistribuciones = distribucionesGuardadas
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 5)
      .map(
        (dist, index) =>
          `${index + 1}. ${dist.fechaFormateada} - ${
            dist.estadisticas.porcentajeOcupacion
          }% ocupación`
      )
      .join("\n");

    mostrarNotificacion(
      `Últimas 5 distribuciones guardadas:\n\n${listaDistribuciones}`,
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

  const openFullscreenModal = () => setShowFullscreenModal(true);
  const closeFullscreenModal = () => setShowFullscreenModal(false);

  /* -----------------------
     Componentes locales para render
     ----------------------- */

  // En DistribuccionNovios.jsx, actualizar el InvitadoDraggable
  const InvitadoDraggable = ({ invitado }) => {
    return (
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", JSON.stringify(invitado));
          setActiveInvitado(invitado);
        }}
        onDragEnd={() => setActiveInvitado(null)}
        className="flex justify-between items-center bg-white p-3 rounded-lg border-2 border-dashed border-gray-200 cursor-move hover:bg-gray-100 transition-colors hover:shadow-md"
      >
        <div className="flex gap-3 items-center">
          <div className="font-medium text-gray-800">{invitado.nombre}</div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold">
              {" "}
              ({invitado.cantidad} personas)
            </span>
          </div>
        </div>
        {invitado.necesidadEspecial && (
          <div
            title="Necesita silla especial 🦽  "
            className="flex items-center gap-1 bg-Acapulco/40 text-casal px-2 py-1 rounded-full text-xs cursor-default"
          >
            <Accessibility className="w-3 h-3" />
          </div>
        )}
      </div>
    );
  };

  // Modal de confirmación
  const ModalConfirmacion = () => {
    if (!showModal || !modalData) return null;

    const { invitado, mesa, espacioDisponible, personasSobrantes } = modalData;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-lg mx-4 shadow-xl">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TriangleAlert className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Mesa con Capacidad Limitada
            </h3>
          </div>

          <div className="text-sm text-gray-600 space-y-2 mb-6">
            <p>
              <strong>Graduado:</strong> {invitado.nombre}
            </p>
            <p>
              <strong>Cantidad a asignar:</strong> {invitado.cantidad} personas
            </p>
            <p>
              <strong>Mesa seleccionada:</strong> Mesa {mesa.numero}
            </p>
            <p>
              <strong>Capacidad total:</strong> {mesa.capacidad} asientos
            </p>
            <p>
              <strong>Ya ocupada:</strong> {mesa.invitados} asientos
            </p>
            <p className="text-green-600">
              <strong>Espacios disponibles:</strong> {espacioDisponible}{" "}
              asientos
            </p>
            <p className="text-red-600">
              <strong>Personas que no caben:</strong> {personasSobrantes}
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>¿Qué deseas hacer?</strong>
              <br />
              <br />
              <strong>SÍ:</strong> Asignar {espacioDisponible} personas a la
              Mesa {mesa.numero}. Las {personasSobrantes} personas restantes
              buscarán <u>OTRA MESA DIFERENTE</u> automáticamente.
              <br />
              <br />
              <strong>NO:</strong> Mantener todo el grupo junto en la lista para
              buscar otra mesa completa.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => confirmarAsignacionParcial(true)}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Sí, Dividir y Redistribuir
            </button>
            <button
              onClick={() => confirmarAsignacionParcial(false)}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              No, Mantener Junto
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Componentes estáticos para mesas
  const MesaEstatica = ({ element }) => (
    <div className="pointer-events-auto">
      <Mesa
        numeroMesa={element.numero}
        invitadosAsignados={element.invitados}
        capacidadMaxima={element.capacidad}
        sillasEspeciales={element.sillasEspeciales || []}
        invitadosEspeciales={element.invitadosEspeciales || 0}
        onDrop={asignarInvitadosMesa}
        onDoubleClick={() => openMesaModal(element.numero)}
      />
    </div>
  );

  const MesaRectangularEstatica = ({ element }) => (
    <div className="pointer-events-auto">
      <MesaRectangular
        numeroMesa={element.numero}
        invitadosAsignados={element.invitados}
        capacidadMaxima={element.capacidad}
        sillasEspeciales={element.sillasEspeciales || []}
        invitadosEspeciales={element.invitadosEspeciales || 0}
        onDrop={asignarInvitadosMesa}
        onDoubleClick={() => openMesaModal(element.numero)}
      />
    </div>
  );

  const renderElementoEstatico = (element) => {
    if (element.type === "mesa") {
      return <MesaEstatica element={element} />;
    }

    if (element.type === "mesaRectangular") {
      return <MesaRectangularEstatica element={element} />;
    }

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
    <div className="min-h-screen">
      <div className="py-4">
        {/* BARRA DE HERRAMIENTAS MEJORADA */}
        <div className="mb-6 bg-gray-100 p-4 rounded-full shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button
                onClick={mostrarDistribucionesGuardadas}
                className="bg-purple-600 text-white px-4 py-2 rounded-full font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                Layout del Salón
              </Button>

              <Button
                onClick={autoAsignarInvitados}
                disabled={autoAsignando || invitadosSinAsignar.length === 0}
                className={`px-4 py-2 border rounded-full font-medium transition-colors flex items-center gap-2 ${
                  autoAsignando
                    ? "bg-yellow-100 text-yellow-800 border-yellow-300 cursor-not-allowed"
                    : invitadosSinAsignar.length === 0
                    ? "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
                    : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {autoAsignando ? "Asignando..." : "Auto-Asignar"}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {/*  */}
              <Button
                onClick={guardarDistribucion}
                disabled={guardando}
                className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
                  guardando
                    ? "bg-green-400 text-white cursor-not-allowed"
                    : "bg-lime-600 text-white hover:bg-lime-700"
                }`}
              >
                <Save
                  className={`w-4 h-4 ${guardando ? "animate-pulse" : ""}`}
                />
                {guardando ? "Guardando..." : "Guardar Distribución"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Lista de Invitados */}
          <div className="w-full xl:w-80 flex-shrink-0">
            <div className="bg-slate-50 py-6 px-3 rounded-lg shadow-sm z-30">
              <p className="text-xl font-semibold mb-4 text-gray-700 flex items-center justify-between gap-2">
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

              <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  Arrastra los invitados a las mesas del plano para asignar
                  lugares.
                </p>
              </div>
            </div>
          </div>

          {/* Plano del Salón */}
          <div className="flex-1 min-w-0">
            <div className="border border-gray-100 rounded-lg bg-white overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-fondoVs">
                <h3 className="text-lg font-semibold text-gray-800 ">
                  Plano del Salón - "Jardín Romántico"
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={zoomOut}
                    className="px-2 py-2 bg-white border rounded hover:bg-Acapulco hover:text-white dark:bg-slate-900 dark:text-gray-100 dark:hover:bg-Acapulco"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <div className="px-3 py-1 bg-white dark:bg-slate-800 dark:text-gray-50 border rounded text-sm">
                    {Math.round(zoom * 100)}%
                  </div>
                  <Button
                    onClick={zoomIn}
                    className="px-2 py-2 bg-white border rounded hover:bg-Acapulco hover:text-white dark:bg-slate-900 dark:text-gray-100 dark:hover:bg-Acapulco"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Tooltip content="Ajustar vista ( f )" position="left">
                    <Button
                      onClick={fitToView}
                      className="ml-2 px-2 py-2 bg-white border rounded hover:bg-Acapulco hover:text-white dark:bg-slate-900 dark:text-gray-100 dark:hover:bg-gray-400 text-sm"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Pantalla completa" position="left">
                    <Button
                      onClick={openFullscreenModal}
                      className="ml-2 px-2 py-2 bg-white border rounded hover:bg-gray-200 dark:bg-slate-900 dark:text-gray-100 dark:hover:bg-gray-400 text-sm"
                    >
                      <Scan className="w-3 h-3" />
                    </Button>
                  </Tooltip>
                </div>
              </div>

              <div
                ref={containerRef}
                className="overflow-x-auto overflow-y-auto"
                style={{ height: "600px", maxHeight: "600px" }}
                // onWheel={handleWheel}
                onMouseDown={handleMouseDownCanvas}
                onMouseMove={handleMouseMoveCanvas}
                onMouseUp={handleMouseUpCanvas}
                onMouseLeave={handleMouseUpCanvas}
              >
                <div
                  className="relative dark:bg-[#1a1a1a] overflow-hidden"
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
                        {renderElementoEstatico(element)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="mt-4 text-sm text-gray-700 bg-slate-100 px-4 py-3 rounded-lg border-gray-200 shadow-sm">
              <div className="flex items-center gap-6 text-center">
                <div>
                  <span className="font-medium text-gray-600">Graduados:</span>
                  <span className="ml-2 font-bold text-blue-600">
                    {totalInvitadosAsignados}/{totalCapacidad}
                  </span>
                  <span className="ml-2 font-medium text-gray-600">
                    Asignados
                  </span>
                </div>
                <div className="w-[0.2rem] h-4 bg-gray-300 rounded"></div>
                <div>
                  <span className="font-medium text-gray-600">
                    Mesas Ocupadas:
                  </span>
                  <span className="ml-2 font-bold text-amber-600">
                    {mesasOcupadas}/{totalMesas}
                  </span>
                </div>
                <div className="w-[0.2rem] h-4 bg-gray-300 rounded"></div>
                <div>
                  <span className="font-medium text-gray-600">
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
                  <span className="font-medium text-gray-600">
                    Sin Asignar:
                  </span>
                  <span
                    className={`ml-2 font-bold ${
                      totalPersonasSinAsignar > 0
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {totalPersonasSinAsignar}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showFullscreenModal && (
        <FullscreenDesignModal
          isOpen={showFullscreenModal}
          onClose={closeFullscreenModal}
          allElements={allElements}
          invitadosSinAsignar={invitadosSinAsignar}
          InvitadoDraggable={InvitadoDraggable}
          renderElementoEstatico={renderElementoEstatico}
          zoom={zoom}
          offset={offset}
          handleWheel={handleWheel}
          handleMouseDownCanvas={handleMouseDownCanvas}
          handleMouseMoveCanvas={handleMouseMoveCanvas}
          handleMouseUpCanvas={handleMouseUpCanvas}
          CANVAS_WIDTH={CANVAS_WIDTH}
          CANVAS_HEIGHT={CANVAS_HEIGHT}
          TotalPersonasSinAsignar={totalPersonasSinAsignar}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          fitToView={fitToView}
          guardarDistribucion={guardarDistribucion}
          guardando={guardando}
        />
      )}

      {/* Modal de Confirmación */}
      <ModalConfirmacion />

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
        />
      )}
    </div>
  );
}
