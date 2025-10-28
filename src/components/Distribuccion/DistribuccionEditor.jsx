import React, { useState, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { BadgeQuestionMark, Minus, Plus, RotateCcw, Scan } from "lucide-react";
import { Button } from "@headlessui/react";
import { Tooltip } from "../ui/Tooltip.jsx";
import Mesa from "./Mesa.jsx";
import MesaRectangular from "./MesaRectangular.jsx";
import DraggableElement from "./DraggableElement.jsx";
import DesignTools from "./DesignTools.jsx";
import StatsPanel from "./StatsPanel.jsx";
import ModalSillasEspeciales from "./ModalSillasEspeciales.jsx";

export default function DistribuccionEditor({
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
  console.log("🔍 DistribuccionEditor recibió:", {
    allElementsLength: allElements?.length || 0,
    elementos:
      allElements?.map((el) => ({
        id: el.id,
        type: el.type,
        numero: el.numero,
      })) || [],
    layoutGuardado,
    contadores,
  });

  const [activeId, setActiveId] = useState(null);
  const [activeElement, setActiveElement] = useState(null);
  const [showModalSillas, setShowModalSillas] = useState(false);
  const [tipoMesaModal, setTipoMesaModal] = useState("");
  const [capacidadMesaModal, setCapacidadMesaModal] = useState(8);

  // ZOOM & FULLSCREEN modal
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showDesignModal, setShowDesignModal] = useState(false);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isPanningRef = useRef(false);
  const panLastRef = useRef({ x: 0, y: 0 });

  const CANVAS_WIDTH = 4000;
  const CANVAS_HEIGHT = 2400;
  const ZOOM_STEP = 0.1;
  const ZOOM_MIN = 0.1;
  const ZOOM_MAX = 4;

  const openDesignModal = () => setShowDesignModal(true);
  const closeDesignModal = () => setShowDesignModal(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Zoom functions
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const zoomIn = () =>
    setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () =>
    setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));
  const resetZoom = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Obtener siguiente número de mesa disponible
  const obtenerSiguienteNumeroMesa = () => {
    const mesas = allElements.filter(
      (el) => el.type === "mesa" || el.type === "mesaRectangular"
    );
    if (mesas.length === 0) return 1;
    const numerosOcupados = mesas
      .map((mesa) => mesa.numero)
      .sort((a, b) => a - b);
    for (let i = 1; i <= numerosOcupados.length + 1; i++) {
      if (!numerosOcupados.includes(i)) {
        return i;
      }
    }
    return numerosOcupados.length + 1;
  };

  // Agregar elemento
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

  // Eliminar elemento
  const eliminarElemento = (id) => {
    const elemento = allElements.find((el) => el.id === id);
    if (
      elemento &&
      (elemento.type === "mesa" || elemento.type === "mesaRectangular")
    ) {
      if (elemento.invitados > 0) {
        alert(
          `No se puede eliminar la Mesa ${elemento.numero}\n\n` +
            `Esta mesa tiene ${elemento.invitados} invitado(s) asignado(s).\n`
        );
        return;
      }
      reorganizarNumerosMesas(id);
      setContadores((prev) => ({
        ...prev,
        [elemento.type]: Math.max(0, prev[elemento.type] - 1),
      }));
    } else {
      setAllElements((prev) => prev.filter((element) => element.id !== id));
    }
  };

  // Reorganizar números de mesas
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
    const elementosActualizados = allElements
      .map((element) => {
        if (element.id === mesaEliminadaId) {
          return null;
        }
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
      .filter((element) => element !== null);

    setAllElements(elementosActualizados);
  };

  // Asignar invitados a mesa
  const asignarInvitadosMesa = (numeroMesa, datosInvitado) => {
    const mesaSeleccionada = allElements.find(
      (element) =>
        element.numero === numeroMesa &&
        (element.type === "mesa" || element.type === "mesaRectangular")
    );

    if (!mesaSeleccionada) return;

    const espacioDisponible =
      mesaSeleccionada.capacidad - mesaSeleccionada.invitados;
    const cantidadInvitados = datosInvitado.cantidad;

    if (espacioDisponible >= cantidadInvitados) {
      setAllElements((prev) =>
        prev.map((element) =>
          element.numero === numeroMesa &&
          (element.type === "mesa" || element.type === "mesaRectangular")
            ? {
                ...element,
                invitados: element.invitados + cantidadInvitados,
                invitadosEspeciales: datosInvitado.necesidadEspecial
                  ? (element.invitadosEspeciales || 0) + cantidadInvitados
                  : element.invitadosEspeciales || 0,
              }
            : element
        )
      );
      alert(
        `✅ ${datosInvitado.nombre} asignado correctamente a la Mesa ${numeroMesa}`
      );
    } else {
      alert(
        `No hay suficiente espacio en la Mesa ${numeroMesa}\n\n` +
          `Espacio disponible: ${espacioDisponible} asientos\n` +
          `Personas a asignar: ${cantidadInvitados}`
      );
    }
  };

  // DnD Handlers
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

  // Canvas pan handlers
  const handleMouseDownCanvas = (e) => {
    if (activeId) return;
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
    // Implementar lógica de fit to view aquí
    resetZoom();
  };

  // Confirmar mesa con sillas
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
    setContadores((prev) => ({ ...prev, [tipo]: prev[tipo] + 1 }));
    setShowModalSillas(false);
  };

  // Calcular estadísticas
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

  // Guardar distribución
  const guardarDistribucion = () => {
    const layoutConDatos = {
      elementos: [...allElements],
      contadores: { ...contadores },
      fechaCreacion: new Date().toISOString(),
      totalMesas: allElements.filter(
        (el) => el.type === "mesa" || el.type === "mesaRectangular"
      ).length,
    };
    setLayoutFinal(layoutConDatos);
    setLayoutGuardado(true);
    localStorage.setItem("layoutSalon", JSON.stringify(layoutConDatos));
    alert("🎉 ¡Layout guardado exitosamente!");
  };

  // Render elemento
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

    // Renderizar otros elementos (barra, buffet, etc.)
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
            <div className="w-40 h-40 text-center border-cafe border-2 border-dashed flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold bg-cafe/10 cursor-move rounded-full">
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

  const stats = calcularEstadisticas();

  const saveFromModal = () => {
    guardarDistribucion && guardarDistribucion(); // reutiliza la función existente si está definida
    closeDesignModal();
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Módulo de Asignación - Gestionar Layout
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Diseño y Gestión de Asientos
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {!layoutGuardado && (
                <Button
                  onClick={guardarDistribucion}
                  className="flex items-center gap-2 bg-casal text-white py-2 px-6 rounded-lg font-semibold hover:bg-casal/80 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Guardar Layout
                </Button>
              )}
            </div>
          </div>

          {/* Información del salón */}
          <div className="block md:flex md:justify-between lg:justify-between gap-10 px-4 pb-4 mt-6">
            <div className="dark:text-gray-100 mb-4 md:mb-0">
              <h3 className="text-xl font-semibold">
                Plano del Salón - "Jardín Romántico"
              </h3>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                Evento: "Graduación ITESM 2025"
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
              <DesignTools agregarElemento={agregarElemento} />
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
                    Modo Gestionar - Edición completa
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
                // onWheel={handleWheel}
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
