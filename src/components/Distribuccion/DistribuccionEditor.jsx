import React, { useState, useRef, useEffect, useCallback } from "react";
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
import ModalAgregarMesasMultiples from "./ModalAgregarMesasMultiples.jsx";
import ModalRenumerarMesas from "./ModalRenumerarMesas.jsx";

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
  onGuardarLayout,
  esLugar = true,
  lugar = null,
  configuracion = null,
  nombreSalon = null,
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
  const [showModalSillas, setShowModalSillas] = useState(false);
  const [tipoMesaModal, setTipoMesaModal] = useState("");
  const [capacidadMesaModal, setCapacidadMesaModal] = useState(8);
  const [showModalMesasMultiples, setShowModalMesasMultiples] = useState(false);
  const [showModalRenumerar, setShowModalRenumerar] = useState(false);
  
  // Selección múltiple
  const [selectedElements, setSelectedElements] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);

  // Control de transformaciones
  const [rotationInput, setRotationInput] = useState(0);
  const [scaleInput, setScaleInput] = useState(100);
  const [widthInput, setWidthInput] = useState(100);
  const [heightInput, setHeightInput] = useState(100);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  // ZOOM & FULLSCREEN modal
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showDesignModal, setShowDesignModal] = useState(false);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isPanningRef = useRef(false);
  const panLastRef = useRef({ x: 0, y: 0 });

  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 4000,
    height: 2400
  });
  const ZOOM_STEP = 0.1;
  const ZOOM_MIN = 0.1;
  const ZOOM_MAX = 4;

  const openDesignModal = () => setShowDesignModal(true);
  const closeDesignModal = () => setShowDesignModal(false);
  
  // Calcular dimensiones del canvas basadas en el contenido
  const calcularDimensionesCanvas = useCallback(() => {
    if (allElements.length === 0) {
      return { width: 5000, height: 2400 };
    }

    let maxX = 0;
    let maxY = 0;
    const margen = 500; // Margen adicional

    allElements.forEach((el) => {
      if (el.position) {
        maxX = Math.max(maxX, el.position.x);
        maxY = Math.max(maxY, el.position.y);
      }
    });

    return {
      width: Math.max(5000, maxX + margen),
      height: Math.max(2400, maxY + margen),
    };
  }, [allElements]);

  // Actualizar dimensiones del canvas cuando cambian los elementos
  useEffect(() => {
    const newDimensions = calcularDimensionesCanvas();
    setCanvasDimensions(newDimensions);
  }, [allElements, calcularDimensionesCanvas]);

  // Actualizar valores de controles cuando cambia la selección
  useEffect(() => {
    if (selectedElements.length > 0) {
      const firstSelected = allElements.find(el => el.id === selectedElements[0]);
      if (firstSelected) {
        setRotationInput(firstSelected.rotation || 0);
        
        const scale = firstSelected.scale || 1;
        const scaleX = firstSelected.scaleX || scale;
        const scaleY = firstSelected.scaleY || scale;
        
        setScaleInput(Math.round(scale * 100));
        setWidthInput(Math.round(scaleX * 100));
        setHeightInput(Math.round(scaleY * 100));
      }
    }
  }, [selectedElements, allElements]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Atajos de teclado para selección y rotación
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorar atajos si el usuario está escribiendo en un input, textarea o select
      const elementoActivo = document.activeElement;
      const esInputOTextarea = elementoActivo && (
        elementoActivo.tagName === 'INPUT' ||
        elementoActivo.tagName === 'TEXTAREA' ||
        elementoActivo.tagName === 'SELECT' ||
        elementoActivo.isContentEditable
      );

      // Solo permitir Escape si está en un input/textarea (para poder salir del campo)
      if (esInputOTextarea && e.key !== 'Escape') {
        return; // No procesar otros atajos cuando está escribiendo
      }

      // Ctrl+A o Cmd+A: Seleccionar todos los elementos
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        selectAllMesas();
      }
      // Escape: Limpiar selección
      if (e.key === 'Escape') {
        clearSelection();
      }
      // Delete o Backspace: Eliminar mesas seleccionadas (con confirmación)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElements.length > 0) {
        e.preventDefault();
        const confirmar = window.confirm(
          `¿Deseas eliminar ${selectedElements.length} mesa${selectedElements.length > 1 ? 's' : ''}?`
        );
        if (confirmar) {
          eliminarElementosSeleccionados();
        }
      }
      // R: Rotar elementos seleccionados (Shift+R para antihorario)
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        const antihorario = e.shiftKey;
        if (selectedElements.length > 0) {
          rotarElementosSeleccionados(antihorario);
        }
      }
      // Flechas del teclado: Mover elementos seleccionados
      if (selectedElements.length > 0 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const incremento = e.shiftKey ? 20 : 10; // Shift+Flecha = movimiento más rápido
        let deltaX = 0;
        let deltaY = 0;

        switch (e.key) {
          case 'ArrowUp':
            deltaY = -incremento;
            break;
          case 'ArrowDown':
            deltaY = incremento;
            break;
          case 'ArrowLeft':
            deltaX = -incremento;
            break;
          case 'ArrowRight':
            deltaX = incremento;
            break;
          default:
            break;
        }

        moverElementosSeleccionados(deltaX, deltaY);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElements]);

  // Zoom functions
  // const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
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
          rotation: 0,
          scale: 1,
        };
        break;
      case "buffet":
        nuevoElemento = {
          id: `buffet-${nuevoContador}`,
          type: "buffet",
          position: posicionAleatoria,
          rotation: 0,
          scale: 1,
        };
        break;
      case "escenario":
        nuevoElemento = {
          id: `escenario-${nuevoContador}`,
          type: "escenario",
          position: posicionAleatoria,
          rotation: 0,
          scale: 1,
        };
        break;
      case "entrada":
        nuevoElemento = {
          id: `entrada-${nuevoContador}`,
          type: "entrada",
          position: posicionAleatoria,
          rotation: 0,
          scale: 1,
        };
        break;
      case "pistaBaileRedonda":
        nuevoElemento = {
          id: `pista-redonda-${nuevoContador}`,
          type: "pistaBaileRedonda",
          position: posicionAleatoria,
          rotation: 0,
          scale: 1,
        };
        break;
      case "pistaBaileRectangular":
        nuevoElemento = {
          id: `pista-rect-${nuevoContador}`,
          type: "pistaBaileRectangular",
          position: posicionAleatoria,
          rotation: 0,
          scale: 1,
        };
        break;
      case "pistaBaileCuadrada":
        nuevoElemento = {
          id: `pista-cuad-${nuevoContador}`,
          type: "pistaBaileCuadrada",
          position: posicionAleatoria,
          rotation: 0,
          scale: 1,
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

    // ✅ CASO 1: Espacio suficiente para todos los boletos
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
      
      // Actualizar invitado: reducir cantidad o eliminarlo si se asignaron todos
      setInvitados((prev) =>
        prev.map((inv) =>
          inv.id === datosInvitado.id
            ? { ...inv, cantidad: 0, asignado: true }
            : inv
        )
      );
      
      alert(
        `✅ ${datosInvitado.nombre} (${cantidadInvitados} personas) asignado a Mesa ${numeroMesa}`
      );
      return;
    }

    // 🆕 CASO 2: Espacio insuficiente - ASIGNACIÓN PARCIAL
    if (espacioDisponible > 0 && espacioDisponible < cantidadInvitados) {
      const maxAsignable = espacioDisponible;
      
      const respuesta = window.confirm(
        `⚠️ Espacio insuficiente en Mesa ${numeroMesa}\n\n` +
        `${datosInvitado.nombre} tiene ${cantidadInvitados} boletos\n` +
        `La mesa tiene ${espacioDisponible} espacios disponibles\n\n` +
        `¿Deseas asignar ${maxAsignable} personas a esta mesa?\n` +
        `(Quedarán ${cantidadInvitados - maxAsignable} boletos pendientes)`
      );

      if (!respuesta) return;

      // Preguntar cuántos desea asignar (máximo = espacioDisponible)
      const cantidadInput = prompt(
        `¿Cuántas personas de ${datosInvitado.nombre} deseas asignar a Mesa ${numeroMesa}?\n\n` +
        `Máximo permitido: ${maxAsignable}`,
        maxAsignable.toString()
      );

      if (cantidadInput === null) return; // Usuario canceló

      const cantidadAsignar = parseInt(cantidadInput, 10);

      if (isNaN(cantidadAsignar) || cantidadAsignar < 1 || cantidadAsignar > maxAsignable) {
        alert(`Cantidad inválida. Debe ser entre 1 y ${maxAsignable}`);
        return;
      }

      // Asignar la cantidad especificada a la mesa
      setAllElements((prev) =>
        prev.map((element) =>
          element.numero === numeroMesa &&
          (element.type === "mesa" || element.type === "mesaRectangular")
            ? {
                ...element,
                invitados: element.invitados + cantidadAsignar,
                invitadosEspeciales: datosInvitado.necesidadEspecial
                  ? (element.invitadosEspeciales || 0) + cantidadAsignar
                  : element.invitadosEspeciales || 0,
              }
            : element
        )
      );

      // Actualizar invitado: reducir cantidad
      const nuevaCantidad = cantidadInvitados - cantidadAsignar;
      setInvitados((prev) =>
        prev.map((inv) =>
          inv.id === datosInvitado.id
            ? { ...inv, cantidad: nuevaCantidad, asignado: nuevaCantidad === 0 }
            : inv
        )
      );

      alert(
        `✅ ${cantidadAsignar} personas de ${datosInvitado.nombre} asignadas a Mesa ${numeroMesa}\n\n` +
        `Boletos restantes: ${nuevaCantidad}`
      );
      return;
    }

    // ❌ CASO 3: Mesa llena
    alert(
      `❌ La Mesa ${numeroMesa} está llena\n\n` +
      `No hay espacios disponibles`
    );
  };

  // Selección múltiple
  const toggleElementSelection = (elementId, event) => {
    const element = allElements.find((el) => el.id === elementId);
    // Verificar que el elemento existe
    if (!element) {
      return;
    }

    if (event?.ctrlKey || event?.metaKey) {
      // Ctrl+Click: agregar/quitar de selección
      setSelectedElements((prev) =>
        prev.includes(elementId)
          ? prev.filter((id) => id !== elementId)
          : [...prev, elementId]
      );
    } else {
      // Click normal: seleccionar solo este
      setSelectedElements([elementId]);
    }
  };

  const clearSelection = () => {
    setSelectedElements([]);
  };

  const selectAllMesas = () => {
    // Seleccionar todos los elementos (no solo mesas)
    const todosIds = allElements.map((el) => el.id);
    setSelectedElements(todosIds);
  };

  // Rotación de elementos
  // Función individual (disponible para uso futuro)
  // const rotarElemento = (elementId, antihorario = false) => {
  //   setAllElements((prev) =>
  //     prev.map((el) => {
  //       if (el.id === elementId) {
  //         const rotacionActual = el.rotation || 0;
  //         const incremento = antihorario ? -90 : 90;
  //         let nuevaRotacion = (rotacionActual + incremento) % 360;
  //         if (nuevaRotacion < 0) nuevaRotacion += 360;
  //         return { ...el, rotation: nuevaRotacion };
  //       }
  //       return el;
  //     })
  //   );
  //   setLayoutGuardado(false);
  // };

  const rotarElementosSeleccionados = (antihorario = false) => {
    if (selectedElements.length === 0) return;
    
    setAllElements((prev) =>
      prev.map((el) => {
        if (selectedElements.includes(el.id)) {
          const rotacionActual = el.rotation || 0;
          const incremento = antihorario ? -90 : 90;
          let nuevaRotacion = (rotacionActual + incremento) % 360;
          if (nuevaRotacion < 0) nuevaRotacion += 360;
          return { ...el, rotation: nuevaRotacion };
        }
        return el;
      })
    );
    setLayoutGuardado(false);
  };

  // Establecer rotación exacta para elementos seleccionados
  const setRotacionElementosSeleccionados = (angulo) => {
    if (selectedElements.length === 0) return;
    
    let anguloNormalizado = angulo % 360;
    if (anguloNormalizado < 0) anguloNormalizado += 360;
    
    setAllElements((prev) =>
      prev.map((el) => {
        if (selectedElements.includes(el.id)) {
          return { ...el, rotation: anguloNormalizado };
        }
        return el;
      })
    );
    setLayoutGuardado(false);
  };

  // Cambiar escala de elementos seleccionados
  const setEscalaElementosSeleccionados = (escala) => {
    if (selectedElements.length === 0) return;
    
    const escalaValida = Math.max(0.1, Math.min(5, escala)); // Entre 10% y 500%
    
    setAllElements((prev) =>
      prev.map((el) => {
        if (selectedElements.includes(el.id)) {
          return { ...el, scale: escalaValida };
        }
        return el;
      })
    );
    setLayoutGuardado(false);
  };

  // Cambiar ancho de elementos seleccionados
  const setAnchoElementosSeleccionados = (porcentaje) => {
    if (selectedElements.length === 0) return;
    
    const anchoValido = Math.max(10, Math.min(500, porcentaje));
    
    setAllElements((prev) =>
      prev.map((el) => {
        if (selectedElements.includes(el.id)) {
          const nuevoWidth = anchoValido / 100;
          if (lockAspectRatio) {
            // Mantener proporción
            return { ...el, scale: nuevoWidth };
          } else {
            // Cambiar solo ancho
            return { ...el, scaleX: nuevoWidth };
          }
        }
        return el;
      })
    );
    setLayoutGuardado(false);
  };

  // Cambiar alto de elementos seleccionados
  const setAltoElementosSeleccionados = (porcentaje) => {
    if (selectedElements.length === 0) return;
    
    const altoValido = Math.max(10, Math.min(500, porcentaje));
    
    setAllElements((prev) =>
      prev.map((el) => {
        if (selectedElements.includes(el.id)) {
          const nuevoHeight = altoValido / 100;
          if (lockAspectRatio) {
            // Mantener proporción
            return { ...el, scale: nuevoHeight };
          } else {
            // Cambiar solo alto
            return { ...el, scaleY: nuevoHeight };
          }
        }
        return el;
      })
    );
    setLayoutGuardado(false);
  };

  const moverElementosSeleccionados = (deltaX, deltaY) => {
    if (selectedElements.length === 0) return;
    
    setAllElements((prev) =>
      prev.map((el) => {
        if (selectedElements.includes(el.id)) {
          return {
            ...el,
            position: {
              x: Math.max(0, el.position.x + deltaX),
              y: Math.max(0, el.position.y + deltaY),
            },
          };
        }
        return el;
      })
    );
    setLayoutGuardado(false);
  };

  const eliminarElementosSeleccionados = () => {
    if (selectedElements.length === 0) return;

    // Verificar si alguna mesa tiene invitados asignados
    const mesasConInvitados = allElements.filter(
      (el) => selectedElements.includes(el.id) && el.invitados > 0
    );

    if (mesasConInvitados.length > 0) {
      const nombresMesas = mesasConInvitados
        .map((mesa) => `Mesa ${mesa.numero} (${mesa.invitados} invitados)`)
        .join('\n');
      alert(
        `No se pueden eliminar las siguientes mesas porque tienen invitados asignados:\n\n${nombresMesas}`
      );
      return;
    }

    // Filtrar los elementos a eliminar
    const idsAEliminar = new Set(selectedElements);
    const elementosFiltrados = allElements.filter((el) => !idsAEliminar.has(el.id));

    // Reorganizar números de mesas
    const mesas = elementosFiltrados.filter(
      (el) => el.type === "mesa" || el.type === "mesaRectangular"
    );

    // Renumerar mesas en orden
    const mesasRenumeradas = mesas
      .sort((a, b) => a.numero - b.numero)
      .map((mesa, index) => ({
        ...mesa,
        numero: index + 1,
        id: mesa.type === "mesa" ? `mesa-${index + 1}` : `mesa-rect-${index + 1}`,
      }));

    // Combinar mesas renumeradas con otros elementos
    const otrosElementos = elementosFiltrados.filter(
      (el) => el.type !== "mesa" && el.type !== "mesaRectangular"
    );

    setAllElements([...mesasRenumeradas, ...otrosElementos]);

    // Actualizar contadores
    const contadoresMesa = {};
    mesasRenumeradas.forEach((mesa) => {
      contadoresMesa[mesa.type] = (contadoresMesa[mesa.type] || 0) + 1;
    });

    setContadores((prev) => ({
      ...prev,
      mesa: contadoresMesa.mesa || 0,
      mesaRectangular: contadoresMesa.mesaRectangular || 0,
    }));

    clearSelection();
    setLayoutGuardado(false);
  };

  // Verificar si hay intersección con rectángulo de selección (disponible para uso futuro)
  // const isInSelectionRect = (elementPos) => {
  //   if (!selectionStart || !selectionEnd) return false;

  //   const minX = Math.min(selectionStart.x, selectionEnd.x);
  //   const maxX = Math.max(selectionStart.x, selectionEnd.x);
  //   const minY = Math.min(selectionStart.y, selectionEnd.y);
  //   const maxY = Math.max(selectionStart.y, selectionEnd.y);

  //   return (
  //     elementPos.x >= minX &&
  //     elementPos.x <= maxX &&
  //     elementPos.y >= minY &&
  //     elementPos.y <= maxY
  //   );
  // };

  // DnD Handlers
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);

    // Si el elemento arrastrado está en la selección, mover todos
    if (selectedElements.includes(active.id)) {
      // Ya está seleccionado, se moverán todos juntos
    } else {
      // No está seleccionado, limpiar selección
      setSelectedElements([]);
    }
  };

  const handleDragEnd = (event) => {
    const { active, delta } = event;
    setActiveId(null);
    if (!delta) return;

    const draggedElementId = active.id;
    const adjDeltaX = delta.x / (zoom || 1);
    const adjDeltaY = delta.y / (zoom || 1);

    setAllElements((prev) =>
      prev.map((element) => {
        // Si hay elementos seleccionados y este es uno de ellos, moverlos todos
        if (selectedElements.length > 0 && selectedElements.includes(element.id)) {
          return {
            ...element,
            position: {
              x: Math.max(0, element.position.x + adjDeltaX),
              y: Math.max(0, element.position.y + adjDeltaY),
            },
          };
        }
        // Si no hay selección múltiple, mover solo el elemento arrastrado
        if (element.id === draggedElementId && selectedElements.length === 0) {
          return {
            ...element,
            position: {
              x: Math.max(0, element.position.x + adjDeltaX),
              y: Math.max(0, element.position.y + adjDeltaY),
            },
          };
        }
        return element;
      })
    );
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Canvas pan handlers y selección por arrastre
  const handleMouseDownCanvas = (e) => {
    if (activeId) return;
    if (!canvasRef.current) return; // Validación para evitar error

    const isCanvasBackground = 
      e.target === e.currentTarget || 
      e.target === canvasRef.current ||
      e.target.classList.contains('bg-gray-50') || 
      e.target.classList.contains('dark:bg-[#1a1a1a]') ||
      e.target.closest('.absolute.inset-0');

    // Determinar si es pan o selección
    const startPan = e.button === 1 || e.altKey || e.code === "Space" || e.shiftKey;
    
    if (startPan) {
      // Modo pan (mover canvas)
      isPanningRef.current = true;
      panLastRef.current = { x: e.clientX, y: e.clientY };
      if (containerRef.current) containerRef.current.style.cursor = "grabbing";
    } else if (isCanvasBackground && !startPan) {
      // Modo selección por arrastre
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - offset.x) / zoom;
      const y = (e.clientY - rect.top - offset.y) / zoom;
      
      setIsSelecting(true);
      setSelectionStart({ x, y });
      setSelectionEnd({ x, y });
      
      // Si no se mantiene Ctrl, limpiar selección previa
      if (!e.ctrlKey && !e.metaKey) {
        clearSelection();
      }
    }
  };

  const handleMouseMoveCanvas = (e) => {
    if (isPanningRef.current) {
      // Pan mode
      const dx = (e.clientX - panLastRef.current.x) / zoom;
      const dy = (e.clientY - panLastRef.current.y) / zoom;
      panLastRef.current = { x: e.clientX, y: e.clientY };
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    } else if (isSelecting && selectionStart && canvasRef.current) {
      // Selection mode
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - offset.x) / zoom;
      const y = (e.clientY - rect.top - offset.y) / zoom;
      
      setSelectionEnd({ x, y });
    }
  };

  const handleMouseUpCanvas = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      if (containerRef.current) containerRef.current.style.cursor = "default";
    } else if (isSelecting) {
      // Finalizar selección por arrastre
      if (selectionStart && selectionEnd) {
        const minX = Math.min(selectionStart.x, selectionEnd.x);
        const maxX = Math.max(selectionStart.x, selectionEnd.x);
        const minY = Math.min(selectionStart.y, selectionEnd.y);
        const maxY = Math.max(selectionStart.y, selectionEnd.y);

        // Seleccionar mesas dentro del rectángulo
        const mesasEnRectangulo = allElements
          .filter((el) => {
            if (el.type !== "mesa" && el.type !== "mesaRectangular") return false;
            
            const mesaX = el.position.x;
            const mesaY = el.position.y;
            
            return mesaX >= minX && mesaX <= maxX && mesaY >= minY && mesaY <= maxY;
          })
          .map((el) => el.id);

        // Si se mantiene Ctrl, agregar a la selección actual
        if (window.event?.ctrlKey || window.event?.metaKey) {
          setSelectedElements((prev) => {
            const newSelection = [...prev];
            mesasEnRectangulo.forEach((id) => {
              if (!newSelection.includes(id)) {
                newSelection.push(id);
              }
            });
            return newSelection;
          });
        } else {
          // Sin Ctrl, reemplazar selección
          setSelectedElements(mesasEnRectangulo);
        }
      }

      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
    }
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
        rotation: 0,
        scale: 1,
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
        rotation: 0,
        scale: 1,
      };
    }

    setAllElements((prev) => [...prev, nuevoElemento]);
    setContadores((prev) => ({ ...prev, [tipo]: prev[tipo] + 1 }));
    setShowModalSillas(false);
  };

  // Agregar mesas múltiples
  const agregarMesasMultiples = (config) => {
    const { cantidad, capacidad, tipo, distribucion, direccionNumeracion = "horizontal-derecha-abajo", numeroVuelta = null } = config;
    console.log('Cantidad: ' + cantidad);
    
    const nuevasMesas = [];
    let numeroInicial = obtenerSiguienteNumeroMesa();

    // Espaciado fijo entre mesas (píxeles)
    const ESPACIO_HORIZONTAL = 150; // Espacio fijo entre mesas horizontalmente
    const ESPACIO_VERTICAL = 150;   // Espacio fijo entre filas
    const MARGEN_INICIAL_X = 300;   // Margen desde el borde izquierdo
    const MARGEN_INICIAL_Y = 300;   // Margen desde el borde superior

    if (distribucion === "automatica") {
      // Calcular número óptimo de columnas/filas según dirección
      const colsIdeal = numeroVuelta != null ? numeroVuelta : Math.ceil(Math.sqrt(cantidad * 1.5)); // Más columnas que filas
      console.log('ColsIdeal: '+ colsIdeal);
      
      const filasTotal = Math.ceil(cantidad / colsIdeal);
      console.log('FilasTotal: '+ filasTotal);
      

      // Crear array de posiciones según la dirección
      const posiciones = [];
      
      // Función helper para obtener dirección inversa
      const obtenerDireccionInversa = (direccion) => {
        const inversas = {
          "horizontal-derecha-abajo": "horizontal-izquierda-abajo",
          "horizontal-izquierda-abajo": "horizontal-derecha-abajo",
          "horizontal-derecha-arriba": "horizontal-izquierda-arriba",
          "horizontal-izquierda-arriba": "horizontal-derecha-arriba",
          "vertical-abajo-derecha": "vertical-abajo-izquierda",
          "vertical-abajo-izquierda": "vertical-abajo-derecha",
          "vertical-arriba-derecha": "vertical-arriba-izquierda",
          "vertical-arriba-izquierda": "vertical-arriba-derecha",
          "zigzag-horizontal": "zigzag-horizontal",
          "zigzag-horizontal-arriba": "zigzag-horizontal-arriba",
          "zigzag-vertical": "zigzag-vertical",
        };
        return inversas[direccion] || direccion;
      };
      
      for (let i = 0; i < cantidad; i++) {
        let columna, fila;
        const numeroMesa = numeroInicial + i;
        
        // Determinar si debemos usar la dirección inversa
        const usarDireccionInversa = false;//numeroVuelta !== null && numeroMesa > numeroVuelta;
        
        // Cuando no hay vuelta, usar i directamente
        // Cuando hay vuelta, calcular cuántas mesas han pasado desde la vuelta
        const indiceParaCalculo = usarDireccionInversa 
          ? (numeroMesa - numeroVuelta - 1) 
          : i;
        
        const direccionActual = usarDireccionInversa ? obtenerDireccionInversa(direccionNumeracion) : direccionNumeracion;
        
        switch (direccionActual) {
          case "horizontal-derecha-abajo":
            // Izquierda → Derecha, luego abajo (1→2→3, 4→5→6)
            columna = indiceParaCalculo % colsIdeal;
            fila = Math.floor(indiceParaCalculo / colsIdeal);
            break;
            
          case "horizontal-izquierda-abajo":
            // Derecha → Izquierda, luego abajo (3→2→1, 6→5→4)
            fila = Math.floor(indiceParaCalculo / colsIdeal);
            columna = (colsIdeal - 1) - (indiceParaCalculo % colsIdeal);
            break;
            
          case "vertical-abajo-derecha":
            // Arriba → Abajo, luego derecha (1↓2↓3, 4↓5↓6)
            columna = Math.floor(indiceParaCalculo / filasTotal);
            fila = indiceParaCalculo % filasTotal;
            break;
            
          case "vertical-arriba-derecha":
            // Abajo → Arriba, luego derecha (3↑2↑1, 6↑5↑4)
            columna = Math.floor(indiceParaCalculo / filasTotal);
            fila = (filasTotal - 1) - (indiceParaCalculo % filasTotal);
            break;
            
          case "zigzag-horizontal":
            // Zigzag horizontal empezando arriba: 1→2→3, 6←5←4, 7→8→9
            fila = Math.floor(indiceParaCalculo / colsIdeal);
            const posEnFila = indiceParaCalculo % colsIdeal;
            // Si la fila es impar, invertir dirección
            columna = (fila % 2 === 0) ? posEnFila : (colsIdeal - 1 - posEnFila);
            break;

          case "zigzag-horizontal-arriba":
            // Zigzag horizontal empezando abajo: 4→5→6, 3←2←1
            fila = (filasTotal - 1) - Math.floor(indiceParaCalculo / colsIdeal);
            const posEnFilaArriba = indiceParaCalculo % colsIdeal;
            // Si la fila (desde abajo) es impar, invertir dirección
            const filaDesdeAbajo = Math.floor(indiceParaCalculo / colsIdeal);
            columna = (filaDesdeAbajo % 2 === 0) ? posEnFilaArriba : (colsIdeal - 1 - posEnFilaArriba);
            break;
            
          case "zigzag-vertical":
            // Zigzag vertical: 1↓2↓3, 6↑5↑4, 7↓8↓9
            columna = Math.floor(indiceParaCalculo / filasTotal);
            const posEnCol = indiceParaCalculo % filasTotal;
            // Si la columna es impar, invertir dirección
            fila = (columna % 2 === 0) ? posEnCol : (filasTotal - 1 - posEnCol);
            break;

          case "horizontal-derecha-arriba":
            // Izquierda → Derecha, desde abajo hacia arriba (4→5→6, 1→2→3)
            columna = indiceParaCalculo % colsIdeal;
            fila = (filasTotal - 1) - Math.floor(indiceParaCalculo / colsIdeal);
            break;

          case "horizontal-izquierda-arriba":
            // Derecha → Izquierda, desde abajo hacia arriba (6→5→4, 3→2→1)
            fila = (filasTotal - 1) - Math.floor(indiceParaCalculo / colsIdeal);
            columna = (colsIdeal - 1) - (indiceParaCalculo % colsIdeal);
            break;

          case "vertical-abajo-izquierda":
            // Arriba → Abajo, desde derecha hacia izquierda (4↓5↓6, 1↓2↓3)
            columna = (colsIdeal - 1) - Math.floor(indiceParaCalculo / filasTotal);
            fila = indiceParaCalculo % filasTotal;
            break;

          case "vertical-arriba-izquierda":
            // Abajo → Arriba, desde derecha hacia izquierda (6↑5↑4, 3↑2↑1)
            columna = (colsIdeal - 1) - Math.floor(indiceParaCalculo / filasTotal);
            fila = (filasTotal - 1) - (indiceParaCalculo % filasTotal);
            break;
            
          default:
            // Por defecto: horizontal izquierda a derecha
            columna = indiceParaCalculo % colsIdeal;
            fila = Math.floor(indiceParaCalculo / colsIdeal);
        }
        
        posiciones.push({
          columna,
          fila,
          numeroMesa,
          position: {
            x: MARGEN_INICIAL_X + (columna * ESPACIO_HORIZONTAL),
            y: MARGEN_INICIAL_Y + (fila * ESPACIO_VERTICAL),
          }
        });
      }

      // Crear las mesas con sus posiciones y números
      posiciones.forEach((pos) => {
        const nuevaMesa = {
          id: tipo === "mesa" ? `mesa-${pos.numeroMesa}` : `mesa-rect-${pos.numeroMesa}`,
          type: tipo,
          numero: pos.numeroMesa,
          invitados: 0,
          capacidad: capacidad,
          sillasEspeciales: [],
          position: pos.position,
          rotation: 0,
          scale: 1,
        };

        nuevasMesas.push(nuevaMesa);
      });
    } else {
      // Modo manual: distribución aleatoria
      for (let i = 0; i < cantidad; i++) {
        const nuevaMesa = {
          id: tipo === "mesa" ? `mesa-${numeroInicial + i}` : `mesa-rect-${numeroInicial + i}`,
          type: tipo,
          numero: numeroInicial + i,
          invitados: 0,
          capacidad: capacidad,
          sillasEspeciales: [],
          position: {
            x: Math.random() * 3000 + 200,
            y: Math.random() * 1800 + 200,
          },
          rotation: 0,
          scale: 1,
        };

        nuevasMesas.push(nuevaMesa);
      }
    }

    setAllElements((prev) => [...prev, ...nuevasMesas]);
    setContadores((prev) => ({
      ...prev,
      [tipo]: prev[tipo] + cantidad,
    }));
    setShowModalMesasMultiples(false);
  };

  // Renumerar mesas manteniendo posiciones
  const renumerarMesas = (direccion) => {
    console.log("🔢 Renumerando mesas con dirección:", direccion);
    
    // Obtener solo las mesas (redondas y rectangulares)
    const mesas = allElements.filter(
      (el) => el.type === "mesa" || el.type === "mesaRectangular"
    );
    
    if (mesas.length === 0) {
      alert("No hay mesas para renumerar");
      return;
    }

    // Ordenar mesas según la dirección seleccionada
    let mesasOrdenadas = [...mesas];
    
    switch (direccion) {
      case "horizontal-derecha-abajo":
        // Izquierda a derecha, arriba a abajo
        mesasOrdenadas.sort((a, b) => {
          if (Math.abs(a.position.y - b.position.y) < 50) {
            return a.position.x - b.position.x; // Mismo nivel Y, ordenar por X
          }
          return a.position.y - b.position.y; // Diferente Y, ordenar por Y
        });
        break;
        
      case "horizontal-izquierda-abajo":
        // Derecha a izquierda, arriba a abajo
        mesasOrdenadas.sort((a, b) => {
          if (Math.abs(a.position.y - b.position.y) < 50) {
            return b.position.x - a.position.x; // Mismo nivel Y, ordenar por X descendente
          }
          return a.position.y - b.position.y; // Diferente Y, ordenar por Y
        });
        break;
        
      case "horizontal-derecha-arriba":
        // Izquierda a derecha, abajo a arriba
        mesasOrdenadas.sort((a, b) => {
          if (Math.abs(a.position.y - b.position.y) < 50) {
            return a.position.x - b.position.x; // Mismo nivel Y, ordenar por X
          }
          return b.position.y - a.position.y; // Diferente Y, ordenar por Y descendente
        });
        break;
        
      case "horizontal-izquierda-arriba":
        // Derecha a izquierda, abajo a arriba
        mesasOrdenadas.sort((a, b) => {
          if (Math.abs(a.position.y - b.position.y) < 50) {
            return b.position.x - a.position.x; // Mismo nivel Y, ordenar por X descendente
          }
          return b.position.y - a.position.y; // Diferente Y, ordenar por Y descendente
        });
        break;
        
      case "vertical-abajo-derecha":
        // Arriba a abajo, izquierda a derecha
        mesasOrdenadas.sort((a, b) => {
          if (Math.abs(a.position.x - b.position.x) < 50) {
            return a.position.y - b.position.y; // Mismo nivel X, ordenar por Y
          }
          return a.position.x - b.position.x; // Diferente X, ordenar por X
        });
        break;
        
      case "vertical-abajo-izquierda":
        // Arriba a abajo, derecha a izquierda
        mesasOrdenadas.sort((a, b) => {
          if (Math.abs(a.position.x - b.position.x) < 50) {
            return a.position.y - b.position.y; // Mismo nivel X, ordenar por Y
          }
          return b.position.x - a.position.x; // Diferente X, ordenar por X descendente
        });
        break;
        
      case "vertical-arriba-derecha":
        // Abajo a arriba, izquierda a derecha
        mesasOrdenadas.sort((a, b) => {
          if (Math.abs(a.position.x - b.position.x) < 50) {
            return b.position.y - a.position.y; // Mismo nivel X, ordenar por Y descendente
          }
          return a.position.x - b.position.x; // Diferente X, ordenar por X
        });
        break;
        
      case "vertical-arriba-izquierda":
        // Abajo a arriba, derecha a izquierda
        mesasOrdenadas.sort((a, b) => {
          if (Math.abs(a.position.x - b.position.x) < 50) {
            return b.position.y - a.position.y; // Mismo nivel X, ordenar por Y descendente
          }
          return b.position.x - a.position.x; // Diferente X, ordenar por X descendente
        });
        break;
        
      case "zigzag-horizontal-derecha-abajo":
        // Zigzag horizontal: izquierda→derecha (arriba→abajo)
        // Empieza arriba-izquierda, alterna en cada fila
        const filasDerechaAbajo = {};
        mesas.forEach(mesa => {
          const filaKey = Math.round(mesa.position.y / 50) * 50;
          if (!filasDerechaAbajo[filaKey]) filasDerechaAbajo[filaKey] = [];
          filasDerechaAbajo[filaKey].push(mesa);
        });
        
        const filasOrdenadasDerechaAbajo = Object.keys(filasDerechaAbajo)
          .sort((a, b) => parseFloat(a) - parseFloat(b)) // Arriba → Abajo
          .map((key, index) => {
            const mesasFila = filasDerechaAbajo[key];
            // Alternar: pares izq→der, impares der→izq
            mesasFila.sort((a, b) => 
              index % 2 === 0 
                ? a.position.x - b.position.x 
                : b.position.x - a.position.x
            );
            return mesasFila;
          });
        
        mesasOrdenadas = filasOrdenadasDerechaAbajo.flat();
        break;
        
      case "zigzag-horizontal-izquierda-abajo":
        // Zigzag horizontal: derecha→izquierda (arriba→abajo)
        // Empieza arriba-derecha, alterna en cada fila
        const filasIzquierdaAbajo = {};
        mesas.forEach(mesa => {
          const filaKey = Math.round(mesa.position.y / 50) * 50;
          if (!filasIzquierdaAbajo[filaKey]) filasIzquierdaAbajo[filaKey] = [];
          filasIzquierdaAbajo[filaKey].push(mesa);
        });
        
        const filasOrdenadasIzquierdaAbajo = Object.keys(filasIzquierdaAbajo)
          .sort((a, b) => parseFloat(a) - parseFloat(b)) // Arriba → Abajo
          .map((key, index) => {
            const mesasFila = filasIzquierdaAbajo[key];
            // Alternar: pares der→izq, impares izq→der
            mesasFila.sort((a, b) => 
              index % 2 === 0 
                ? b.position.x - a.position.x 
                : a.position.x - b.position.x
            );
            return mesasFila;
          });
        
        mesasOrdenadas = filasOrdenadasIzquierdaAbajo.flat();
        break;
        
      case "zigzag-horizontal-derecha-arriba":
        // Zigzag horizontal: izquierda→derecha (abajo→arriba)
        // Empieza abajo-izquierda, alterna en cada fila
        const filasDerechaArriba = {};
        mesas.forEach(mesa => {
          const filaKey = Math.round(mesa.position.y / 50) * 50;
          if (!filasDerechaArriba[filaKey]) filasDerechaArriba[filaKey] = [];
          filasDerechaArriba[filaKey].push(mesa);
        });
        
        const filasOrdenadasDerechaArriba = Object.keys(filasDerechaArriba)
          .sort((a, b) => parseFloat(b) - parseFloat(a)) // Abajo → Arriba
          .map((key, index) => {
            const mesasFila = filasDerechaArriba[key];
            // Alternar: pares izq→der, impares der→izq
            mesasFila.sort((a, b) => 
              index % 2 === 0 
                ? a.position.x - b.position.x 
                : b.position.x - a.position.x
            );
            return mesasFila;
          });
        
        mesasOrdenadas = filasOrdenadasDerechaArriba.flat();
        break;
        
      case "zigzag-horizontal-izquierda-arriba":
        // Zigzag horizontal: derecha→izquierda (abajo→arriba)
        // Empieza abajo-derecha, alterna en cada fila
        const filasIzquierdaArriba = {};
        mesas.forEach(mesa => {
          const filaKey = Math.round(mesa.position.y / 50) * 50;
          if (!filasIzquierdaArriba[filaKey]) filasIzquierdaArriba[filaKey] = [];
          filasIzquierdaArriba[filaKey].push(mesa);
        });
        
        const filasOrdenadasIzquierdaArriba = Object.keys(filasIzquierdaArriba)
          .sort((a, b) => parseFloat(b) - parseFloat(a)) // Abajo → Arriba
          .map((key, index) => {
            const mesasFila = filasIzquierdaArriba[key];
            // Alternar: pares der→izq, impares izq→der
            mesasFila.sort((a, b) => 
              index % 2 === 0 
                ? b.position.x - a.position.x 
                : a.position.x - b.position.x
            );
            return mesasFila;
          });
        
        mesasOrdenadas = filasOrdenadasIzquierdaArriba.flat();
        break;
        
      case "zigzag-vertical-abajo-derecha":
        // Zigzag vertical: arriba→abajo (izquierda→derecha)
        // Empieza arriba-izquierda, alterna en cada columna
        const columnasAbajoDerecha = {};
        mesas.forEach(mesa => {
          const colKey = Math.round(mesa.position.x / 50) * 50;
          if (!columnasAbajoDerecha[colKey]) columnasAbajoDerecha[colKey] = [];
          columnasAbajoDerecha[colKey].push(mesa);
        });
        
        const columnasOrdenadasAbajoDerecha = Object.keys(columnasAbajoDerecha)
          .sort((a, b) => parseFloat(a) - parseFloat(b)) // Izquierda → Derecha
          .map((key, index) => {
            const mesasColumna = columnasAbajoDerecha[key];
            // Alternar: pares arriba→abajo, impares abajo→arriba
            mesasColumna.sort((a, b) => 
              index % 2 === 0 
                ? a.position.y - b.position.y 
                : b.position.y - a.position.y
            );
            return mesasColumna;
          });
        
        mesasOrdenadas = columnasOrdenadasAbajoDerecha.flat();
        break;
        
      case "zigzag-vertical-abajo-izquierda":
        // Zigzag vertical: arriba→abajo (derecha→izquierda)
        // Empieza arriba-derecha, alterna en cada columna
        const columnasAbajoIzquierda = {};
        mesas.forEach(mesa => {
          const colKey = Math.round(mesa.position.x / 50) * 50;
          if (!columnasAbajoIzquierda[colKey]) columnasAbajoIzquierda[colKey] = [];
          columnasAbajoIzquierda[colKey].push(mesa);
        });
        
        const columnasOrdenadasAbajoIzquierda = Object.keys(columnasAbajoIzquierda)
          .sort((a, b) => parseFloat(b) - parseFloat(a)) // Derecha → Izquierda
          .map((key, index) => {
            const mesasColumna = columnasAbajoIzquierda[key];
            // Alternar: pares arriba→abajo, impares abajo→arriba
            mesasColumna.sort((a, b) => 
              index % 2 === 0 
                ? a.position.y - b.position.y 
                : b.position.y - a.position.y
            );
            return mesasColumna;
          });
        
        mesasOrdenadas = columnasOrdenadasAbajoIzquierda.flat();
        break;
        
      case "zigzag-vertical-arriba-derecha":
        // Zigzag vertical: abajo→arriba (izquierda→derecha)
        // Empieza abajo-izquierda, alterna en cada columna
        const columnasArribaDerecha = {};
        mesas.forEach(mesa => {
          const colKey = Math.round(mesa.position.x / 50) * 50;
          if (!columnasArribaDerecha[colKey]) columnasArribaDerecha[colKey] = [];
          columnasArribaDerecha[colKey].push(mesa);
        });
        
        const columnasOrdenadasArribaDerecha = Object.keys(columnasArribaDerecha)
          .sort((a, b) => parseFloat(a) - parseFloat(b)) // Izquierda → Derecha
          .map((key, index) => {
            const mesasColumna = columnasArribaDerecha[key];
            // Alternar: pares abajo→arriba, impares arriba→abajo
            mesasColumna.sort((a, b) => 
              index % 2 === 0 
                ? b.position.y - a.position.y 
                : a.position.y - b.position.y
            );
            return mesasColumna;
          });
        
        mesasOrdenadas = columnasOrdenadasArribaDerecha.flat();
        break;
        
      case "zigzag-vertical-arriba-izquierda":
        // Zigzag vertical: abajo→arriba (derecha→izquierda)
        // Empieza abajo-derecha, alterna en cada columna
        const columnasArribaIzquierda = {};
        mesas.forEach(mesa => {
          const colKey = Math.round(mesa.position.x / 50) * 50;
          if (!columnasArribaIzquierda[colKey]) columnasArribaIzquierda[colKey] = [];
          columnasArribaIzquierda[colKey].push(mesa);
        });
        
        const columnasOrdenadasArribaIzquierda = Object.keys(columnasArribaIzquierda)
          .sort((a, b) => parseFloat(b) - parseFloat(a)) // Derecha → Izquierda
          .map((key, index) => {
            const mesasColumna = columnasArribaIzquierda[key];
            // Alternar: pares abajo→arriba, impares arriba→abajo
            mesasColumna.sort((a, b) => 
              index % 2 === 0 
                ? b.position.y - a.position.y 
                : a.position.y - b.position.y
            );
            return mesasColumna;
          });
        
        mesasOrdenadas = columnasOrdenadasArribaIzquierda.flat();
        break;
        
      case "espiral-horaria":
      case "espiral-antihoraria":
        // Ordenamiento en espiral desde el centro
        const centroX = mesas.reduce((sum, m) => sum + m.position.x, 0) / mesas.length;
        const centroY = mesas.reduce((sum, m) => sum + m.position.y, 0) / mesas.length;
        
        mesasOrdenadas.sort((a, b) => {
          const distA = Math.sqrt(Math.pow(a.position.x - centroX, 2) + Math.pow(a.position.y - centroY, 2));
          const distB = Math.sqrt(Math.pow(b.position.x - centroX, 2) + Math.pow(b.position.y - centroY, 2));
          
          if (Math.abs(distA - distB) < 30) {
            // Misma distancia al centro, ordenar por ángulo
            const anguloA = Math.atan2(a.position.y - centroY, a.position.x - centroX);
            const anguloB = Math.atan2(b.position.y - centroY, b.position.x - centroX);
            return direccion === "espiral-horaria" 
              ? anguloA - anguloB 
              : anguloB - anguloA;
          }
          return distA - distB; // Ordenar por distancia
        });
        break;
        
      default:
        // Por defecto: horizontal derecha-abajo
        mesasOrdenadas.sort((a, b) => {
          if (Math.abs(a.position.y - b.position.y) < 50) {
            return a.position.x - b.position.x;
          }
          return a.position.y - b.position.y;
        });
    }

    // Asignar nuevos números manteniendo las posiciones y propiedades
    const mesasRenumeradas = mesasOrdenadas.map((mesa, index) => ({
      ...mesa,
      numero: index + 1,
      id: mesa.type === "mesa" ? `mesa-${index + 1}` : `mesa-rect-${index + 1}`,
    }));

    // Obtener otros elementos (no mesas)
    const otrosElementos = allElements.filter(
      (el) => el.type !== "mesa" && el.type !== "mesaRectangular"
    );

    // Actualizar elementos
    setAllElements([...mesasRenumeradas, ...otrosElementos]);
    setLayoutGuardado(false);
    
    console.log("✅ Mesas renumeradas:", mesasRenumeradas.length);
    alert(`✅ ${mesasRenumeradas.length} mesas renumeradas correctamente`);
    setShowModalRenumerar(false);
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
    const metadata = {
      contadores: { ...contadores },
      fechaCreacion: new Date().toISOString(),
      totalMesas: allElements.filter(
        (el) => el.type === "mesa" || el.type === "mesaRectangular"
      ).length,
    };

    // Si se proporciona una función personalizada de guardado, usarla
    if (onGuardarLayout) {
      onGuardarLayout(allElements, metadata);
      return;
    }

    // Comportamiento por defecto (para mantener compatibilidad)
    const layoutConDatos = {
      elementos: [...allElements],
      ...metadata,
    };
    setLayoutFinal(layoutConDatos);
    setLayoutGuardado(true);
    localStorage.setItem("layoutSalon", JSON.stringify(layoutConDatos));
    alert("🎉 ¡Layout guardado exitosamente!");
  };

  // Render elemento
  const renderElementAdmin = (element) => {
    const isSelected = selectedElements.includes(element.id);
    const rotation = element.rotation || 0;
    const scale = element.scale || 1;
    const scaleX = element.scaleX || scale;
    const scaleY = element.scaleY || scale;
    
    // Combinar rotación y escala en una sola transformación
    const transformStyle = { 
      transform: `rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`,
      transformOrigin: 'center center'
    };
    
    if (element.type === "mesa") {
      return (
        <div 
          className={`relative group cursor-pointer ${isSelected ? 'ring-4 ring-blue-500 ring-opacity-50 rounded-full' : ''}`}
          style={transformStyle}
          onClick={(e) => toggleElementSelection(element.id, e)}
        >
          <Mesa
            numeroMesa={element.numero}
            invitadosAsignados={element.invitados}
            capacidadMaxima={element.capacidad}
            sillasEspeciales={element.sillasEspeciales || []}
            invitadosEspeciales={element.invitadosEspeciales || 0}
            onDrop={asignarInvitadosMesa}
          />
          {isSelected && (
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
          )}
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
        <div 
          className={`relative group cursor-pointer ${isSelected ? 'ring-4 ring-blue-500 ring-opacity-50 rounded-lg' : ''}`}
          style={transformStyle}
          onClick={(e) => toggleElementSelection(element.id, e)}
        >
          <MesaRectangular
            numeroMesa={element.numero}
            invitadosAsignados={element.invitados}
            capacidadMaxima={element.capacidad}
            sillasEspeciales={element.sillasEspeciales || []}
            invitadosEspeciales={element.invitadosEspeciales || 0}
            onDrop={asignarInvitadosMesa}
          />
          {isSelected && (
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
          )}
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
        case "pistaBaileCuadrada":
          return (
            <div className="w-40 h-40 text-center border-cafe border-2 border-dashed flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold bg-cafe/10 cursor-move rounded-md">
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
        <div 
          className={`relative group cursor-pointer ${isSelected ? 'ring-4 ring-blue-500 ring-opacity-50 rounded-lg' : ''}`}
          style={transformStyle}
          onClick={(e) => toggleElementSelection(element.id, e)}
        >
          {elementContent}
          {isSelected && (
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
          )}
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
    return (
      <div 
        className={`relative ${isSelected ? 'ring-4 ring-blue-500 ring-opacity-50 rounded-lg' : ''}`}
        style={transformStyle}
        onClick={(e) => toggleElementSelection(element.id, e)}
      >
        {elementContent}
        {isSelected && (
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
        )}
      </div>
    );
  };

  const stats = calcularEstadisticas();

  const saveFromModal = () => {
    guardarDistribucion(); // reutiliza la función existente
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
                  Módulo de Distribución - Gestionar Layout
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Diseño y Gestión de Asientos
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedElements.length > 0 && (
                <>
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-1">
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {selectedElements.length} elemento{selectedElements.length > 1 ? 's' : ''} seleccionado{selectedElements.length > 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => rotarElementosSeleccionados(false)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium flex items-center gap-1"
                      title="Rotar 90° (R)"
                    >
                      <RotateCcw className="w-4 h-4" />
                      +90°
                    </button>
                    <button
                      onClick={clearSelection}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
                    >
                      Limpiar
                    </button>
                  </div>

                  {/* Panel de Transformaciones */}
                  <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg px-3 py-1">
                    {/* Rotación Exacta */}
                    <div className="flex items-center gap-1">
                      <label className="text-xs font-medium text-purple-700 dark:text-purple-300">Rotación:</label>
                      <input
                        type="number"
                        value={rotationInput}
                        onChange={(e) => setRotationInput(Number(e.target.value))}
                        onBlur={() => setRotacionElementosSeleccionados(rotationInput)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setRotacionElementosSeleccionados(rotationInput);
                          }
                        }}
                        className="w-16 px-2 py-1 text-xs border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        min="0"
                        max="359"
                        step="1"
                      />
                      <span className="text-xs text-purple-600 dark:text-purple-400">°</span>
                    </div>

                    {/* Escala */}
                    <div className="flex items-center gap-1 border-l border-purple-300 dark:border-purple-600 pl-2">
                      <label className="text-xs font-medium text-purple-700 dark:text-purple-300">Escala:</label>
                      <input
                        type="number"
                        value={scaleInput}
                        onChange={(e) => setScaleInput(Number(e.target.value))}
                        onBlur={() => setEscalaElementosSeleccionados(scaleInput / 100)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEscalaElementosSeleccionados(scaleInput / 100);
                          }
                        }}
                        className="w-16 px-2 py-1 text-xs border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        min="10"
                        max="500"
                        step="5"
                      />
                      <span className="text-xs text-purple-600 dark:text-purple-400">%</span>
                    </div>

                    {/* Bloquear proporción */}
                    <button
                      onClick={() => setLockAspectRatio(!lockAspectRatio)}
                      className={`text-xs px-2 py-1 rounded ${
                        lockAspectRatio 
                          ? 'bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                      title={lockAspectRatio ? "Proporción bloqueada" : "Proporción libre"}
                    >
                      {lockAspectRatio ? "🔒" : "🔓"}
                    </button>

                    {/* Ancho y Alto (solo si proporción está desbloqueada) */}
                    {!lockAspectRatio && (
                      <>
                        <div className="flex items-center gap-1 border-l border-purple-300 dark:border-purple-600 pl-2">
                          <label className="text-xs font-medium text-purple-700 dark:text-purple-300">Ancho:</label>
                          <input
                            type="number"
                            value={widthInput}
                            onChange={(e) => setWidthInput(Number(e.target.value))}
                            onBlur={() => setAnchoElementosSeleccionados(widthInput)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setAnchoElementosSeleccionados(widthInput);
                              }
                            }}
                            className="w-16 px-2 py-1 text-xs border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            min="10"
                            max="500"
                            step="5"
                          />
                          <span className="text-xs text-purple-600 dark:text-purple-400">%</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <label className="text-xs font-medium text-purple-700 dark:text-purple-300">Alto:</label>
                          <input
                            type="number"
                            value={heightInput}
                            onChange={(e) => setHeightInput(Number(e.target.value))}
                            onBlur={() => setAltoElementosSeleccionados(heightInput)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setAltoElementosSeleccionados(heightInput);
                              }
                            }}
                            className="w-16 px-2 py-1 text-xs border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            min="10"
                            max="500"
                            step="5"
                          />
                          <span className="text-xs text-purple-600 dark:text-purple-400">%</span>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
              <Button
                onClick={selectAllMesas}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Seleccionar Todo
              </Button>
              <Button
                onClick={() => setShowModalRenumerar(true)}
                className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200 py-2 px-4 rounded-lg font-semibold hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-all duration-200 border border-purple-300 dark:border-purple-700"
                title="Renumerar mesas manteniendo sus posiciones"
              >
                <RotateCcw className="w-4 h-4" />
                Renumerar Mesas
              </Button>
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
                { esLugar ? lugar?.nombre || "Plano del Salón" : nombreSalon || "Plano del Evento"}
                {configuracion?.modo === "editar" && configuracion?.configuracion?.nombre && (
                  <span className="text-gray-600 dark:text-gray-400 font-normal">
                    {" - "}{configuracion.configuracion.nombre}
                  </span>
                )}
              </h3>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                {esLugar ? "Modo Lugar" : "Modo Evento"}
              </h3>
            </div>
            <div className="relative flex items-center gap-3">
              <div className="group relative">
                <Button className="size-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
                  <BadgeQuestionMark />
                </Button>
                <div className="absolute w-80 -right-6 top-20 -translate-y-1/2 px-3 py-2 bg-white border dark:bg-gray-600 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                  <p className="text-sm text-yellow-800 dark:text-gray-200">
                    <strong>Instrucciones:</strong><br/>
                    • Arrastra elementos para moverlos<br/>
                    • Click para seleccionar<br/>
                    • Ctrl+Click para selección múltiple<br/>
                    • <strong>Arrastra en espacio vacío para seleccionar área</strong><br/>
                    • Ctrl+A: Seleccionar todos los elementos<br/>
                    • <strong>Flechas ←↑→↓: Mover (pixel a pixel)</strong><br/>
                    • <strong>Shift+Flechas: Mover rápido (10px)</strong><br/>
                    • <strong>R: Rotar 90°</strong><br/>
                    • Shift+R: Rotar antihorario<br/>
                    • <strong>Panel morado: Rotación exacta y escala</strong><br/>
                    • <strong>🔒: Bloquear/desbloquear proporción</strong><br/>
                    • Esc: Limpiar selección<br/>
                    • Delete: Eliminar seleccionadas<br/>
                    • Hover + "×" para eliminar individual
                  </p>
                </div>
              </div>
              <DesignTools 
                agregarElemento={agregarElemento} 
                onAgregarMesasMultiples={() => setShowModalMesasMultiples(true)}
              />
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
                    height: `${canvasDimensions.height}px`,
                    minHeight: `${canvasDimensions.height}px`,
                    minWidth: `${canvasDimensions.width}px`,
                    width: `${canvasDimensions.width}px`,
                  }}
                >
                  <div
                    ref={canvasRef}
                    className="absolute left-0 top-0 origin-top-left"
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                      transformOrigin: "0 0",
                      width: `${canvasDimensions.width}px`,
                      height: `${canvasDimensions.height}px`,
                    }}
                  >
                    {allElements.map((element) => (
                      <DraggableElement
                        key={element.id}
                        id={element.id}
                        data={element}
                        zoom={zoom}
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
                    
                    {/* Rectángulo de selección */}
                    {isSelecting && selectionStart && selectionEnd && (
                      <div
                        className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none"
                        style={{
                          left: `${Math.min(selectionStart.x, selectionEnd.x)}px`,
                          top: `${Math.min(selectionStart.y, selectionEnd.y)}px`,
                          width: `${Math.abs(selectionEnd.x - selectionStart.x)}px`,
                          height: `${Math.abs(selectionEnd.y - selectionStart.y)}px`,
                        }}
                      />
                    )}
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
                    {isSelecting 
                      ? "🔵 Seleccionando mesas..." 
                      : isPanningRef.current 
                      ? "✋ Moviendo vista..." 
                      : "↔ Scroll horizontal | ↕ Scroll vertical para navegar"}
                  </span>
                  <span className="text-blue-500">
                    {isSelecting 
                      ? "Arrastrando para seleccionar"
                      : selectedElements.length > 0
                      ? `${selectedElements.length} mesa${selectedElements.length > 1 ? 's' : ''} seleccionada${selectedElements.length > 1 ? 's' : ''}`
                      : "Modo Gestionar - Edición completa"}
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
          {/* Ghost image desactivada para permitir drag preciso con zoom */}
          {null}
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
                    <DesignTools 
                      agregarElemento={agregarElemento}
                      onAgregarMesasMultiples={() => setShowModalMesasMultiples(true)}
                    />
                    {selectedElements.length > 0 && (
                      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-1">
                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                          {selectedElements.length} mesa{selectedElements.length > 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => rotarElementosSeleccionados(false)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium flex items-center gap-1"
                          title="Rotar 90° (R)"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={clearSelection}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
                        >
                          ×
                        </button>
                      </div>
                    )}
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
                    height: `${canvasDimensions.height}px`,
                    minHeight: `${canvasDimensions.height}px`,
                    minWidth: `${canvasDimensions.width}px`,
                    width: `${canvasDimensions.width}px`,
                  }}
                >
                  <div
                    ref={canvasRef}
                    className="absolute left-0 top-0 origin-top-left"
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                      transformOrigin: "0 0",
                      width: `${canvasDimensions.width}px`,
                      height: `${canvasDimensions.height}px`,
                    }}
                  >
                    {allElements.map((element) => (
                      <DraggableElement
                        key={element.id}
                        id={element.id}
                        data={element}
                        zoom={zoom}
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
                    
                    {/* Rectángulo de selección en modal fullscreen */}
                    {isSelecting && selectionStart && selectionEnd && (
                      <div
                        className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none"
                        style={{
                          left: `${Math.min(selectionStart.x, selectionEnd.x)}px`,
                          top: `${Math.min(selectionStart.y, selectionEnd.y)}px`,
                          width: `${Math.abs(selectionEnd.x - selectionStart.x)}px`,
                          height: `${Math.abs(selectionEnd.y - selectionStart.y)}px`,
                        }}
                      />
                    )}
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

      <ModalAgregarMesasMultiples
        isOpen={showModalMesasMultiples}
        onClose={() => setShowModalMesasMultiples(false)}
        onConfirm={agregarMesasMultiples}
      />

      <ModalRenumerarMesas
        isOpen={showModalRenumerar}
        onClose={() => setShowModalRenumerar(false)}
        onConfirm={renumerarMesas}
      />
    </div>
  );
}
