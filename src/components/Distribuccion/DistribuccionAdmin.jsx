import React, { useState, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  BadgeQuestionMark,
  BringToFront,
  Minus,
  Plus,
  RotateCcw,
  Scan,
} from "lucide-react";
import {
  Button,
} from "@headlessui/react";
// UI - local components */
import { Tooltip } from "../ui/Tooltip.jsx";
import Mesa from "./Mesa.jsx";
import MesaRectangular from "./MesaRectangular.jsx";
import DraggableElement from "./DraggableElement.jsx";
import DesignTools from "./DesignTools.jsx";
import StatsPanel from "./StatsPanel.jsx";
import ModalSillasEspeciales from "./ModalSillasEspeciales.jsx";


export default function DistribuccionAdmin({
  allElements,
  setAllElements,
  contadores,
  setContadores,
  layoutGuardado,
  setLayoutGuardado,
  layoutFinal,
  setLayoutFinal,
  invitados,
  setInvitados,
}) {
  const [activeId, setActiveId] = useState(null);
  const [activeElement, setActiveElement] = useState(null);

  const [showModalSillas, setShowModalSillas] = useState(false);
  const [tipoMesaModal, setTipoMesaModal] = useState("");
  const [capacidadMesaModal, setCapacidadMesaModal] = useState(8);

  // ZOOM & FULLSCREEN modal
  const [zoom, setZoom] = useState(1); // 1 = 100%
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // opcional para pan futuro
  const [showDesignModal, setShowDesignModal] = useState(false);

  const containerRef = useRef(null); // scroll area contenedor
  const canvasRef = useRef(null); // canvas grande (dentro del scroll area)
  const isPanningRef = useRef(false);
  const panLastRef = useRef({ x: 0, y: 0 });

  const CANVAS_WIDTH = 4000; 
  const CANVAS_HEIGHT = 2400;

  const ZOOM_STEP = 0.1;
  const ZOOM_MIN = 0.1;
  const ZOOM_MAX = 4;

  const openDesignModal = () => setShowDesignModal(true);
  const closeDesignModal = () => setShowDesignModal(false);

  const saveFromModal = () => {
    guardarDistribucion && guardarDistribucion(); // reutiliza la función existente si está definida
    closeDesignModal();
  };

  const elementosIniciales = [
    {
      id: "mesa-1",
      type: "mesa",
      numero: 1,
      invitados: 5,
      capacidad: 8,
      position: { x: 50, y: 50 },
    },
    {
      id: "mesa-2",
      type: "mesa",
      numero: 2,
      invitados: 3,
      capacidad: 8,
      position: { x: 50, y: 150 },
    },
    {
      id: "mesa-3",
      type: "mesa",
      numero: 3,
      invitados: 6,
      capacidad: 8,
      position: { x: 50, y: 250 },
    },
    {
      id: "mesa-4",
      type: "mesa",
      numero: 4,
      invitados: 8,
      capacidad: 8,
      position: { x: 50, y: 350 },
    },
    {
      id: "mesa-5",
      type: "mesa",
      numero: 5,
      invitados: 2,
      capacidad: 8,
      position: { x: 650, y: 50 },
    },
    {
      id: "mesa-6",
      type: "mesa",
      numero: 6,
      invitados: 5,
      capacidad: 8,
      position: { x: 650, y: 150 },
    },
    {
      id: "mesa-7",
      type: "mesa",
      numero: 7,
      invitados: 0,
      capacidad: 8,
      position: { x: 650, y: 250 },
    },
    {
      id: "mesa-8",
      type: "mesa",
      numero: 8,
      invitados: 4,
      capacidad: 8,
      position: { x: 650, y: 350 },
    },
    { id: "entrada-1", type: "entrada", position: { x: 20, y: 200 } },
    { id: "barra-1", type: "barra", position: { x: 20, y: 300 } },
    {
      id: "mesa-principal",
      type: "mesa-principal",
      position: { x: 350, y: 50 },
    },
    {
      id: "pista-redonda-1",
      type: "pistaBaileRedonda",
      position: { x: 300, y: 200 },
    },
    { id: "escenario-1", type: "escenario", position: { x: 800, y: 200 } },
    { id: "buffet-1", type: "buffet", position: { x: 800, y: 300 } },
  ];

  const contadoresIniciales = {
    mesa: 8,
    mesaRectangular: 0,
    barra: 1,
    buffet: 1,
    escenario: 1,
    entrada: 1,
    pistaBaileRedonda: 1,
    pistaBaileRectangular: 0,
  };

  /* -----------------------
    Sensors (dnd-kit)
  ----------------------- */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  /* -----------------------
    Implementacion Zoom / Pan handlers para convertir el tipo miro
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

  // Establecer zoom para ajustar al viewport

  // Zoom con rueda (mantén Ctrl o sin Ctrl — aquí uso Ctrl+wheel para evitar scroll accidental)
  const handleWheel = (e) => {
    // permitir también Ctrl+wheel o simplemente wheel si prefieres
    if (!e.ctrlKey && !e.metaKey) return; // quita esta línea si quieres zoom con rueda sin Ctrl
    e.preventDefault();

    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.12 : 0.88;
    const newZoom = clamp(zoom * factor, ZOOM_MIN, ZOOM_MAX);

    const rect = containerRef.current.getBoundingClientRect();
    // posición del cursor en coordenadas del canvas actual (antes de zoom)
    const cursorCanvasX = (e.clientX - rect.left) / zoom - offset.x;
    const cursorCanvasY = (e.clientY - rect.top) / zoom - offset.y;

    // calcular nuevo offset para hacer zoom hacia el cursor
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
    Element management (add / remove / reindex)
  ----------------------- */

  // Agregar función para obtener el siguiente número de mesa disponible
  const obtenerSiguienteNumeroMesa = () => {
    const mesas = allElements.filter(
      (el) => el.type === "mesa" || el.type === "mesaRectangular"
    );

    if (mesas.length === 0) return 1;

    // Obtener todos los números ocupados y ordenarlos
    const numerosOcupados = mesas
      .map((mesa) => mesa.numero)
      .sort((a, b) => a - b);

    // Buscar el primer hueco en la secuencia
    for (let i = 1; i <= numerosOcupados.length + 1; i++) {
      if (!numerosOcupados.includes(i)) {
        return i;
      }
    }

    // Si no hay huecos, devolver el siguiente número
    return numerosOcupados.length + 1;
  };

  const agregarElemento = (tipo) => {
    if (tipo === "mesa" || tipo === "mesaRectangular") {
      setTipoMesaModal(tipo);
      setCapacidadMesaModal(tipo === "mesa" ? 8 : 10);
      setShowModalSillas(true);
      return;
    }

    const nuevoContador = contadores[tipo] + 1;

    const posicionAleatoria = {
      x: Math.random() * 1400 + 100,
      y: Math.random() * 600 + 100,
    };

    let nuevoElemento;

    switch (tipo) {
      case "mesa":
        nuevoElemento = {
          id: `mesa-${nuevoContador}`,
          type: "mesa",
          numero: nuevoContador,
          invitados: 0,
          capacidad: 8,
          position: posicionAleatoria,
        };
        break;
      case "mesaRectangular":
        nuevoElemento = {
          id: `mesa-rect-${nuevoContador}`,
          type: "mesaRectangular",
          numero: nuevoContador,
          invitados: 0,
          capacidad: 10,
          position: posicionAleatoria,
        };
        break;
      case "barra":
        nuevoElemento = {
          id: `barra-${nuevoContador}`,
          type: "barra",
          position: posicionAleatoria,
        };
        break;
      case "buffet":
        nuevoElemento = {
          id: `buffet-${nuevoContador}`,
          type: "buffet",
          position: posicionAleatoria,
        };
        break;
      case "escenario":
        nuevoElemento = {
          id: `escenario-${nuevoContador}`,
          type: "escenario",
          position: posicionAleatoria,
        };
        break;
      case "entrada":
        nuevoElemento = {
          id: `entrada-${nuevoContador}`,
          type: "entrada",
          position: posicionAleatoria,
        };
        break;
      case "pistaBaileRedonda":
        nuevoElemento = {
          id: `pista-redonda-${nuevoContador}`,
          type: "pistaBaileRedonda",
          position: posicionAleatoria,
        };
        break;
      case "pistaBaileRectangular":
        nuevoElemento = {
          id: `pista-rect-${nuevoContador}`,
          type: "pistaBaileRectangular",
          position: posicionAleatoria,
        };
        break;
      default:
        return;
    }

    setAllElements((prev) => [...prev, nuevoElemento]);
    setContadores((prev) => ({ ...prev, [tipo]: nuevoContador }));
  };

  // Actualizar la función eliminarElemento
  const eliminarElemento = (id) => {
    const elemento = allElements.find((el) => el.id === id);

    // Si es una mesa, reorganizar números
    if (
      elemento &&
      (elemento.type === "mesa" || elemento.type === "mesaRectangular")
    ) {
      // Validar que la mesa esté vacía
      if (elemento.invitados > 0) {
        alert(
          `No se puede eliminar la Mesa ${elemento.numero}\n\n` +
            `Esta mesa tiene ${elemento.invitados} invitado(s) asignado(s).\n`
        );
        return; // No eliminar la mesa
      }
      reorganizarNumerosMesas(id);

      // Actualizar contador del tipo específico
      setContadores((prev) => ({
        ...prev,
        [elemento.type]: Math.max(0, prev[elemento.type] - 1),
      }));
    } else {
      // Para otros elementos, eliminación normal
      setAllElements((prev) => prev.filter((element) => element.id !== id));
    }
  };

  /* -----------------------
    Assignment helpers (sillas especiales + asignar invitados)
  ----------------------- */

  // Agregar función para validar asignación de silla especial
  const validarAsignacionSillaEspecial = (mesa, invitado) => {
    // Si el invitado tiene necesidad especial
    if (invitado.necesidadEspecial) {
      // Verificar si la mesa tiene sillas especiales disponibles
      const sillasEspecialesDisponibles = mesa.sillasEspeciales
        ? mesa.sillasEspeciales.length
        : 0;

      if (sillasEspecialesDisponibles === 0) {
        return {
          permitido: false,
          mensaje:
            `La Mesa ${mesa.numero} no tiene sillas especiales.\n\n` +
            `${invitado.nombre} requiere una silla de accesibilidad.\n` +
            `Por favor, selecciona una mesa que tenga sillas especiales disponibles.`,
        };
      }

      // Verificar si ya hay personas asignadas a sillas especiales
      const personasConNecesidadEspecialAsignadas =
        mesa.invitadosEspeciales || 0;

      if (
        personasConNecesidadEspecialAsignadas >= sillasEspecialesDisponibles
      ) {
        return {
          permitido: false,
          mensaje:
            `Las sillas especiales de la Mesa ${mesa.numero} ya están ocupadas.\n\n` +
            `Sillas especiales: ${sillasEspecialesDisponibles}\n` +
            `Ya asignadas: ${personasConNecesidadEspecialAsignadas}\n` +
            `Busca otra mesa con sillas especiales disponibles.`,
        };
      }
    }
    return { permitido: true };
  };

    // Actualizar la función asignarInvitadosMesa
  const asignarInvitadosMesa = (numeroMesa, datosInvitado) => {
    const mesaSeleccionada = allElements.find(
      (element) =>
        element.numero === numeroMesa &&
        (element.type === "mesa" || element.type === "mesaRectangular")
    );

    if (!mesaSeleccionada) return;

    // Validar asignación de silla especial
    const validacion = validarAsignacionSillaEspecial(
      mesaSeleccionada,
      datosInvitado
    );

    if (!validacion.permitido) {
      alert(validacion.mensaje);
      return;
    }

    const espacioDisponible =
      mesaSeleccionada.capacidad - mesaSeleccionada.invitados;
    const cantidadInvitados = datosInvitado.cantidad;

    // Verificar si hay espacio suficiente
    if (espacioDisponible >= cantidadInvitados) {
      setAllElements((prev) =>
        prev.map((element) =>
          element.numero === numeroMesa &&
          (element.type === "mesa" || element.type === "mesaRectangular")
            ? {
                ...element,
                invitados: element.invitados + cantidadInvitados,
                // Actualizar contador de personas con necesidades especiales
                invitadosEspeciales: datosInvitado.necesidadEspecial
                  ? (element.invitadosEspeciales || 0) + cantidadInvitados
                  : element.invitadosEspeciales || 0,
              }
            : element
        )
      );

      // Mostrar confirmación específica para necesidades especiales
      if (datosInvitado.necesidadEspecial) {
        alert(
          `✅ ${datosInvitado.nombre} asignado correctamente a la Mesa ${numeroMesa}\n\n` +
            `Silla especial reservada para persona con necesidades de accesibilidad.\n` +
            `La mesa cuenta con ${
              mesaSeleccionada.sillasEspeciales?.length || 0
            } silla(s) especial(es).`
        );
      } else {
        alert(
          `✅ ${datosInvitado.nombre} asignado correctamente a la Mesa ${numeroMesa}`
        );
      }
    } else {
      alert(
        `No hay suficiente espacio en la Mesa ${numeroMesa}\n\n` +
          `Espacio disponible: ${espacioDisponible} asientos\n` +
          `Personas a asignar: ${cantidadInvitados}`
      );
    }
  };

  /* -----------------------
    DnD handlers
  ----------------------- */

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);

    const element = allElements.find((el) => el.id === active.id);
    setActiveElement(element);
  };

  const handleDragEnd = (event) => {
    const { active, delta } = event;

    setActiveId(null);
    setActiveElement(null);

    if (!delta) return;

    const draggedElementId = active.id;
    const adjDeltaX = delta.x / (zoom || 1);
    const adjDeltaY = delta.y / (zoom || 1);

    setAllElements((prev) =>
      prev.map((element) => {
        if (element.id === draggedElementId) {
          return {
            ...element,
            position: {
              x: Math.max(
                0,
                Math.min(1600 - 100, element.position.x + adjDeltaX)
              ),
              y: Math.max(
                0,
                Math.min(800 - 100, element.position.y + adjDeltaY)
              ),
            },
          };
        }
        return element;
      })
    );
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveElement(null);
  };

  /* -----------------------
    Save / reset / edit layout
  ----------------------- */

  // Función para guardar el layout final
  const guardarDistribucion = () => {
    const layoutConDatos = {
      elementos: [...allElements],
      contadores: { ...contadores },
      fechaCreacion: new Date().toISOString(),
      totalMesas: allElements.filter(
        (el) => el.type === "mesa" || el.type === "mesaRectangular"
      ).length,
      estadisticas: {
        mesasRedondas: allElements.filter((el) => el.type === "mesa").length,
        mesasRectangulares: allElements.filter(
          (el) => el.type === "mesaRectangular"
        ).length,
        barras: allElements.filter((el) => el.type === "barra").length,
        buffets: allElements.filter((el) => el.type === "buffet").length,
        escenarios: allElements.filter((el) => el.type === "escenario").length,
        entradas: allElements.filter((el) => el.type === "entrada").length,
        pistasRedondas: allElements.filter(
          (el) => el.type === "pistaBaileRedonda"
        ).length,
        pistasRectangulares: allElements.filter(
          (el) => el.type === "pistaBaileRectangular"
        ).length,
      },
    };

    setLayoutFinal(layoutConDatos);
    setLayoutGuardado(true);

    localStorage.setItem("layoutSalon", JSON.stringify(layoutConDatos));

    alert(
      "🎉 ¡Layout guardado exitosamente! Ahora está disponible para los novios."
    );
  };

  const editarLayout = () => {
    setLayoutGuardado(false);
  };

  const resetearLayout = () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres resetear todo el layout?\n\nEsta acción eliminará:\n• Todo el diseño actual\n• Las asignaciones de novios\n• No se puede deshacer"
      )
    ) {
      // Limpiar localStorage
      localStorage.removeItem("layoutSalon");
      localStorage.removeItem("asignacionesNovios");

      // Resetear estados
      setLayoutGuardado(false);
      setLayoutFinal(null);
      setAllElements([...elementosIniciales]);
      setContadores({ ...contadoresIniciales });

      // Confirmación
      alert(
        "✅ Layout reseteado exitosamente. Todo ha vuelto al estado inicial."
      );
    }
  };

  /* -----------------------
    Render helpers
  ----------------------- */

  const renderElementAdmin = (element) => {
    if (element.type === "mesa") {
      return (
        <div className="relative group">
          <Mesa
            numeroMesa={element.numero}
            invitadosAsignados={element.invitados}
            capacidadMaxima={element.capacidad}
            sillasEspeciales={element.sillasEspeciales || []}
            invitadosEspeciales={element.invitadosEspeciales || 0}
            onDrop={asignarInvitadosMesa}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              eliminarElemento(element.id);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600"
          >
            ×
          </button>
        </div>
      );
    }

    if (element.type === "mesaRectangular") {
      return (
        <div className="relative group">
          <MesaRectangular
            numeroMesa={element.numero}
            invitadosAsignados={element.invitados}
            capacidadMaxima={element.capacidad}
            sillasEspeciales={element.sillasEspeciales || []}
            invitadosEspeciales={element.invitadosEspeciales || 0}
            onDrop={asignarInvitadosMesa}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              eliminarElemento(element.id);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600"
          >
            ×
          </button>
        </div>
      );
    }

    const elementContent = (() => {
      switch (element.type) {
        case "entrada":
          return (
            <div className="rounded px-6 py-1 rotate-90 border flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold bg-gray-50 dark:bg-slate-800 whitespace-nowrap cursor-move">
              Entrada
            </div>
          );
        case "barra":
          return (
            <div className="border-2 border-separate border-dashed border-gray-300 w-24 h-24 flex items-center justify-center text-center p-2 rounded-md text-gray-500 dark:text-gray-300 font-semibold bg-white dark:bg-slate-800 shadow cursor-move">
              Barra
            </div>
          );
        case "mesa-principal":
          return (
            <div className="rounded px-6 py-3 w-48 border-separate border-2 border-dashed text-center text-gray-600 dark:text-gray-300 font-semibold bg-gray-50 dark:bg-slate-800 cursor-move">
              Mesa principal <br />
              <span className="text-gray-500 text-sm italic">Ana y Juan</span>
            </div>
          );

        case "pistaBaileRedonda":
          return (
            <div className="w-40 h-40 text-center border-cafe border-2 border-dashed flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold bg-cafe/10  cursor-move rounded-full">
              <span className="text-cafe text-lg font-bold">
                Pista de <br /> Baile
              </span>
            </div>
          );
        case "pistaBaileRectangular":
          return (
            <div className="w-64 h-28 text-center border-cafe border-2 border-dashed flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold bg-cafe/10 cursor-move rounded-lg">
              <span className="text-cafe text-lg font-bold">
                Pista de <br /> Baile
              </span>
            </div>
          );
        case "escenario":
          return (
            <div className="border-2 border-separate border-dashed border-gray-300 w-28 h-28 flex flex-col items-center justify-center text-center p-2 rounded-md text-gray-500 dark:text-gray-300 font-semibold bg-white dark:bg-slate-800 shadow cursor-move">
              <p>ESCENARIO</p>
              <p className="text-xs mt-1">DJ Música</p>
            </div>
          );
        case "buffet":
          return (
            <div className="border-2 border-separate border-dashed border-gray-300 w-28 h-20 flex items-center justify-center text-center p-2 rounded-md text-gray-500 dark:text-gray-300 font-semibold bg-white dark:bg-slate-800 shadow cursor-move">
              BUFFET
            </div>
          );
        default:
          return null;
      }
    })();

    if (!["mesa-principal"].includes(element.type)) {
      return (
        <div className="relative group">
          {elementContent}
          <button
            onClick={(e) => {
              e.stopPropagation();
              eliminarElemento(element.id);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600"
          >
            ×
          </button>
        </div>
      );
    }

    return elementContent;
  };

  // Actualizar la función confirmarMesaConSillas
  const confirmarMesaConSillas = (sillasEspeciales) => {
    const tipo = tipoMesaModal;
    const siguienteNumero = obtenerSiguienteNumeroMesa();

    const posicionAleatoria = {
      x: Math.random() * 1400 + 100,
      y: Math.random() * 600 + 100,
    };

    let nuevoElemento;

    if (tipo === "mesa") {
      nuevoElemento = {
        id: `mesa-${siguienteNumero}`,
        type: "mesa",
        numero: siguienteNumero,
        invitados: 0,
        capacidad: 8,
        sillasEspeciales: sillasEspeciales,
        position: posicionAleatoria,
      };
    } else if (tipo === "mesaRectangular") {
      nuevoElemento = {
        id: `mesa-rect-${siguienteNumero}`,
        type: "mesaRectangular",
        numero: siguienteNumero,
        invitados: 0,
        capacidad: 10,
        sillasEspeciales: sillasEspeciales,
        position: posicionAleatoria,
      };
    }

    setAllElements((prev) => [...prev, nuevoElemento]);

    // Actualizar contador solo para el tipo específico
    setContadores((prev) => ({
      ...prev,
      [tipo]: prev[tipo] + 1,
    }));

    setShowModalSillas(false);
  };

  const calcularEstadisticas = () => {
    // Filtrar solo las mesas (redondas y rectangulares)
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

    // Contadores para MESAS por categoría (para la visualización)
    let mesasDisponibles = 0;
    let mesasPocoLlenas = 0; 
    let mesasMedias = 0; 
    let mesasCasiLlenas = 0;
    let mesasOcupadas = 0;

    // Contadores para ASIENTOS individuales
    let asientosDisponibles = 0;
    let asientosPocoLlenos = 0;
    let asientosMedios = 0;
    let asientosCasiLlenos = 0;
    let asientosOcupados = 0;

    let sillasEspeciales = 0;
    let totalCapacidad = 0;
    let totalOcupados = 0;

    mesas.forEach((mesa) => {
      const porcentajeOcupacion = (mesa.invitados / mesa.capacidad) * 100;

      if (porcentajeOcupacion === 0) {
        mesasDisponibles++;
        asientosDisponibles += mesa.capacidad;
      } else if (porcentajeOcupacion <= 50) {
        mesasPocoLlenas++;
        asientosPocoLlenos += mesa.invitados;
        asientosDisponibles += mesa.capacidad - mesa.invitados;
      } else if (porcentajeOcupacion <= 80) {
        mesasMedias++;
        asientosMedios += mesa.invitados;
        asientosDisponibles += mesa.capacidad - mesa.invitados;
      } else if (porcentajeOcupacion < 100) {
        mesasCasiLlenas++;
        asientosCasiLlenos += mesa.invitados;
        asientosDisponibles += mesa.capacidad - mesa.invitados;
      } else {
        mesasOcupadas++;
        asientosOcupados += mesa.invitados;
      }

      // Contar sillas especiales
      if (mesa.sillasEspeciales && mesa.sillasEspeciales.length > 0) {
        sillasEspeciales += mesa.sillasEspeciales.length;
      }

      // Sumar capacidades y ocupados totales
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
      mesasDisponibles,
      mesasPocoLlenas,
      mesasMedias,
      mesasCasiLlenas,
      mesasCompletasOcupadas: mesasOcupadas,
    };
  };

  const stats = calcularEstadisticas();

  // Función para reorganizar números al eliminar una mesa
  const reorganizarNumerosMesas = (mesaEliminadaId) => {
    const mesaEliminada = allElements.find((el) => el.id === mesaEliminadaId);
    if (
      !mesaEliminada ||
      (mesaEliminada.type !== "mesa" &&
        mesaEliminada.type !== "mesaRectangular")
    ) {
      return;
    }

    const numeroEliminado = mesaEliminada.numero;

    // Obtener todas las mesas que tienen número mayor al eliminado
    const mesasAReorganizar = allElements
      .filter(
        (el) =>
          (el.type === "mesa" || el.type === "mesaRectangular") &&
          el.numero > numeroEliminado
      )
      .sort((a, b) => a.numero - b.numero);

    // Reorganizar los números (bajar en 1 cada mesa posterior)
    const elementosActualizados = allElements
      .map((element) => {
        if (element.id === mesaEliminadaId) {
          return null; // Marcar para eliminación
        }

        // Si es una mesa con número mayor, reducir en 1
        if (
          (element.type === "mesa" || element.type === "mesaRectangular") &&
          element.numero > numeroEliminado
        ) {
          return {
            ...element,
            numero: element.numero - 1,
            id:
              element.type === "mesa"
                ? `mesa-${element.numero - 1}`
                : `mesa-rect-${element.numero - 1}`,
          };
        }

        return element;
      })
      .filter((element) => element !== null); // Eliminar el elemento marcado

    setAllElements(elementosActualizados);
  };

  

  return (
    <div className="min-h-screen">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="p-4">
          {/* Header Admin */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Módulo de Asignación
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Gestión de Asientos
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {layoutGuardado && (
                <div className="flex items-center gap-2 px-3 py-2 bg-fondoVs dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm font-medium">
                  <div className="w-2 h-2 bg-Acapulco rounded-full animate-pulse"></div>
                  Layout Activo
                </div>
              )}
              {/* Botón Guardar (solo si no está guardado) */}
              {!layoutGuardado && (
                <button
                  onClick={guardarDistribucion}
                  className="flex items-center gap-2 bg-casal text-white  py-2 px-6 rounded-lg font-semibold hover:bg-casal/80 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Guardar Layout
                </button>
              )}

              {/* Botón Editar (solo si está guardado) */}
              {layoutGuardado && (
                <button
                  onClick={editarLayout}
                  className="flex items-center gap-2 bg-yellow-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Editar Layout
                </button>
              )}

              <button
                onClick={resetearLayout}
                className="flex items-center gap-2 px-4 py-2 bg-rojop hover:bg-red-500 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Resetear Todo
              </button>
            </div>
          </div>

          <div className="flex gap-3 my-6 ">
            <Button className="flex items-center gap-2 bg-casal text-white py-2 px-4 rounded-full font-semibold hover:bg-casal/80 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
              <BringToFront className="w-4 h-4" />
              Gestionar layaout
            </Button>
            <Button className="flex items-center gap-2 bg-casal text-white py-2 px-4 rounded-full font-semibold hover:bg-casal/80 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
              <div className="w-3 h-3 animate-duration-1000 animate-pulse bg-red-500 rounded-full"></div>
              Monitor en vivo
            </Button>
          </div>

          <div className="block md:flex md:justify-between lg:justify-between gap-10 px-4 pb-4">
            <div className="dark:text-gray-100 mb-4 md:mb-0">
              <h3 className="text-xl font-semibold">
                Plano del Salón - "{"Jardín Romántico"}"
              </h3>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                Evento: "{"Graduación ITESM 2025"}"
              </h3>
            </div>
            <div className="relative flex items-center gap-3">
              <div className="group relative">
                <Button className="size-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
                  <BadgeQuestionMark />
                </Button>
                <div className="absolute w-72 -right-6 top-20 -translate-y-1/2 px-3 py-2 bg-white border dark:bg-gray-600 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                  <p className="text-sm text-yellow-800 dark:text-gray-200">
                    <strong>Instrucciones:</strong> Arrastra los elementos para
                    posicionarlos. Haz hover sobre cualquier elemento y presiona
                    "×" para eliminarlo. Guarda el layout cuando esté listo.
                  </p>
                </div>
              </div>
              <div className="">
                <DesignTools agregarElemento={agregarElemento} />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <StatsPanel stats={stats} />

            {/* Área de Diseño */}
            <div className="flex-1 border border-gray-300 rounded-3xl overflow-hidden shadow-sm">
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
                      <DraggableElement
                        key={element.id}
                        id={element.id}
                        data={element}
                        style={{
                          position: "absolute",
                          left: `${element.position.x}px`,
                          top: `${element.position.y}px`,
                          zIndex: activeId === element.id ? 1000 : 1,
                        }}
                      >
                        {renderElementAdmin(element)}
                      </DraggableElement>
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

              <div className="bg-blue-50 dark:bg-[#1a1a1a] border-t border-blue-200 px-4 py-2">
                <div className="flex justify-between items-center text-xs text-blue-600">
                  <span className="font-medium">
                    ↔ Scroll horizontal | ↕ Scroll vertical para navegar
                  </span>
                  <span className="text-blue-500">
                    Modo Admin - Edición completa
                  </span>
                  <div className="inline-flex items-center gap-2 ml-3">
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

                    {/* <Tooltip content="Restablecer zoom">
                      <Button
                        onClick={resetZoom}
                        className="ml-2 px-2 py-2 border bg-white rounded hover:bg-gray-400 hover:text-white text-sm dark:bg-slate-900 dark:text-gray-100 dark:hover:bg-gray-400"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </Tooltip> */}

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
                        className="ml-2 px-2 py-2 bg-white border rounded hover:bg-gray-200 dark:bg-slate-900 dark:text-gray-100 dark:hover:bg-gray-400 text-sm"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeElement ? (
            <div className="opacity-75 transform scale-105">
              {renderElementAdmin(activeElement)}
            </div>
          ) : null}
        </DragOverlay>

        {/* MODAL DE DISEÑO FULLSCREEN */}
        {showDesignModal && (
          <div className="fixed inset-0 z-40 bg-black/60 flex items-stretch">
            <div className="m-auto w-full h-full bg-white dark:bg-gray-900 relative flex flex-col">
              {/* Barra superior de herramientas */}
              <div className="flex p-3 border-b bg-fondoVs dark:bg-gray-800">
                <div>
                  <img
                    src="/logop.png"
                    alt="Logo P"
                    className="object-contain rounded-full w-14 h-14"
                  />
                </div>
                <div className="flex items-center justify-between w-full ml-4">
                  <div className="flex items-center gap-2">
                    <DesignTools agregarElemento={agregarElemento} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={zoomOut}
                      className="px-2 py-2 bg-white border rounded dark:bg-slate-900 dark:text-gray-100 dark:hover:bg-Acapulco hover:bg-Acapulco hover:text-white shadow-sm"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <div className="px-3 py-1 bg-white border rounded text-sm">
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

              {/* Canvas ampliado (scroll + zoom) */}
              <div
                className="flex-1 overflow-auto"
                ref={containerRef}
                onWheel={handleWheel}
                onMouseDown={handleMouseDownCanvas}
                onMouseMove={handleMouseMoveCanvas}
                onMouseUp={handleMouseUpCanvas}
                onMouseLeave={handleMouseUpCanvas}
              >
                <div
                  className="relative bg-gray-50 dark:bg-[#0f172a] w-full h-full"
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
                      <DraggableElement
                        key={element.id}
                        id={element.id}
                        data={element}
                        style={{
                          position: "absolute",
                          left: element.position.x,
                          top: element.position.y,
                          zIndex: activeId === element.id ? 1000 : 1,
                        }}
                      >
                        {renderElementAdmin(element)}
                      </DraggableElement>
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
        )}
      </DndContext>

      <ModalSillasEspeciales
        isOpen={showModalSillas}
        onClose={() => setShowModalSillas(false)}
        onConfirm={confirmarMesaConSillas}
        tipoMesa={tipoMesaModal}
        capacidadMesa={capacidadMesaModal}
      />
    </div>
  );
}
