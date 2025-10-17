import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Mesa from "./Mesa.jsx";
import MesaRectangular from "./MesaRectangular.jsx";
import DraggableElement from "./DraggableElement.jsx";
import {
  Accessibility,
  BadgeQuestionMark,
  BringToFront,
  ChevronDown,
  Circle,
  CircleDashed,
  DoorOpen,
  Plus,
  RectangleHorizontal,
  Square,
  SquareDashed,
  SquareDashedTopSolid,
  SquircleDashed,
} from "lucide-react";
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Tooltip } from "../ui/Tooltip.jsx";
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

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

  // const eliminarElemento = (id) => {
  //   setAllElements((prev) => prev.filter((element) => element.id !== id));
  // };

  // Actualizar la función eliminarElemento
const eliminarElemento = (id) => {
  const elemento = allElements.find(el => el.id === id);
  
  // Si es una mesa, reorganizar números
  if (elemento && (elemento.type === 'mesa' || elemento.type === 'mesaRectangular')) {
      // Validar que la mesa esté vacía
    if (elemento.invitados > 0) {
      alert(
        `❌ No se puede eliminar la Mesa ${elemento.numero}\n\n` +
        `Esta mesa tiene ${elemento.invitados} invitado(s) asignado(s).\n`
      );
      return; // No eliminar la mesa
    }
    reorganizarNumerosMesas(id);
    
    // Actualizar contador del tipo específico
    setContadores(prev => ({
      ...prev,
      [elemento.type]: Math.max(0, prev[elemento.type] - 1)
    }));
  } else {
    // Para otros elementos, eliminación normal
    setAllElements((prev) => prev.filter((element) => element.id !== id));
  }
};

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

    setAllElements((prev) =>
      prev.map((element) => {
        if (element.id === draggedElementId) {
          return {
            ...element,
            position: {
              x: Math.max(
                0,
                Math.min(1600 - 100, element.position.x + delta.x)
              ),
              y: Math.max(0, Math.min(800 - 100, element.position.y + delta.y)),
            },
          };
        }
        return element;
      })
    );
  };

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
        "🗑️ ¿Estás seguro de que quieres resetear todo el layout?\n\nEsta acción eliminará:\n• Todo el diseño actual\n• Las asignaciones de novios\n• No se puede deshacer"
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

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveElement(null);
  };

 // Agregar función para validar asignación de silla especial
const validarAsignacionSillaEspecial = (mesa, invitado) => {
  // Si el invitado tiene necesidad especial
  if (invitado.necesidadEspecial) {
    // Verificar si la mesa tiene sillas especiales disponibles
    const sillasEspecialesDisponibles = mesa.sillasEspeciales ? mesa.sillasEspeciales.length : 0;
    
    if (sillasEspecialesDisponibles === 0) {
      return {
        permitido: false,
        mensaje: `❌ La Mesa ${mesa.numero} no tiene sillas especiales.\n\n` +
                `${invitado.nombre} requiere una silla de accesibilidad.\n` +
                `Por favor, selecciona una mesa que tenga sillas especiales disponibles.`
      };
    }
    
    // Verificar si ya hay personas asignadas a sillas especiales
    const personasConNecesidadEspecialAsignadas = mesa.invitadosEspeciales || 0;
    
    if (personasConNecesidadEspecialAsignadas >= sillasEspecialesDisponibles) {
      return {
        permitido: false,
        mensaje: `❌ Las sillas especiales de la Mesa ${mesa.numero} ya están ocupadas.\n\n` +
                `Sillas especiales: ${sillasEspecialesDisponibles}\n` +
                `Ya asignadas: ${personasConNecesidadEspecialAsignadas}\n` +
                `Busca otra mesa con sillas especiales disponibles.`
      };
    }
  }
  
  return { permitido: true };
};

// Actualizar la función asignarInvitadosMesa
const asignarInvitadosMesa = (numeroMesa, datosInvitado) => {
  const mesaSeleccionada = allElements.find(element => 
    element.numero === numeroMesa && (element.type === 'mesa' || element.type === 'mesaRectangular')
  );

  if (!mesaSeleccionada) return;

  // Validar asignación de silla especial
  const validacion = validarAsignacionSillaEspecial(mesaSeleccionada, datosInvitado);
  
  if (!validacion.permitido) {
    alert(validacion.mensaje);
    return;
  }

  const espacioDisponible = mesaSeleccionada.capacidad - mesaSeleccionada.invitados;
  const cantidadInvitados = datosInvitado.cantidad;

  // Verificar si hay espacio suficiente
  if (espacioDisponible >= cantidadInvitados) {
    setAllElements(prev => prev.map(element => 
      element.numero === numeroMesa && (element.type === 'mesa' || element.type === 'mesaRectangular')
        ? { 
            ...element, 
            invitados: element.invitados + cantidadInvitados,
            // Actualizar contador de personas con necesidades especiales
            invitadosEspeciales: datosInvitado.necesidadEspecial 
              ? (element.invitadosEspeciales || 0) + cantidadInvitados
              : (element.invitadosEspeciales || 0)
          }
        : element
    ));

    // Mostrar confirmación específica para necesidades especiales
    if (datosInvitado.necesidadEspecial) {
      alert(
        `✅ ${datosInvitado.nombre} asignado correctamente a la Mesa ${numeroMesa}\n\n` +
        `🦽 Silla especial reservada para persona con necesidades de accesibilidad.\n` +
        `La mesa cuenta con ${mesaSeleccionada.sillasEspeciales?.length || 0} silla(s) especial(es).`
      );
    } else {
      alert(`✅ ${datosInvitado.nombre} asignado correctamente a la Mesa ${numeroMesa}`);
    }
  } else {
    alert(
      `❌ No hay suficiente espacio en la Mesa ${numeroMesa}\n\n` +
      `Espacio disponible: ${espacioDisponible} asientos\n` +
      `Personas a asignar: ${cantidadInvitados}`
    );
  }
};

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
    [tipo]: prev[tipo] + 1 
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
    let mesasDisponibles = 0; // Mesas 0% ocupación
    let mesasPocoLlenas = 0; // Mesas 1-50% ocupación
    let mesasMedias = 0; // Mesas 51-80% ocupación
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
        asientosOcupados += mesa.invitados; // Todos ocupados
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


  // Agregar función para obtener el siguiente número de mesa disponible
const obtenerSiguienteNumeroMesa = () => {
  const mesas = allElements.filter(el => el.type === 'mesa' || el.type === 'mesaRectangular');
  
  if (mesas.length === 0) return 1;
  
  // Obtener todos los números ocupados y ordenarlos
  const numerosOcupados = mesas
    .map(mesa => mesa.numero)
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

// Función para reorganizar números al eliminar una mesa
const reorganizarNumerosMesas = (mesaEliminadaId) => {
  const mesaEliminada = allElements.find(el => el.id === mesaEliminadaId);
  if (!mesaEliminada || (mesaEliminada.type !== 'mesa' && mesaEliminada.type !== 'mesaRectangular')) {
    return;
  }

  const numeroEliminado = mesaEliminada.numero;
  
  // Obtener todas las mesas que tienen número mayor al eliminado
  const mesasAReorganizar = allElements
    .filter(el => 
      (el.type === 'mesa' || el.type === 'mesaRectangular') && 
      el.numero > numeroEliminado
    )
    .sort((a, b) => a.numero - b.numero);

  // Reorganizar los números (bajar en 1 cada mesa posterior)
  const elementosActualizados = allElements.map(element => {
    if (element.id === mesaEliminadaId) {
      return null; // Marcar para eliminación
    }
    
    // Si es una mesa con número mayor, reducir en 1
    if ((element.type === 'mesa' || element.type === 'mesaRectangular') && 
        element.numero > numeroEliminado) {
      return {
        ...element,
        numero: element.numero - 1,
        id: element.type === 'mesa' 
          ? `mesa-${element.numero - 1}` 
          : `mesa-rect-${element.numero - 1}`
      };
    }
    
    return element;
  }).filter(element => element !== null); // Eliminar el elemento marcado

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
                  className="flex items-center gap-2 bg-casal text-white py-2 px-6 rounded-lg font-semibold hover:bg-casal/80 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
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
              <div className="top-24 right-2 w-62 text-right">
                <Menu>
                  <MenuButton className="inline-flex  items-center gap-2 border rounded-md bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm/6 font-semibold text-gray-700 dark:text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-700 data-open:bg-gray-700">
                    Herramientas de Diseño
                    <ChevronDown className="size-4 fill-white/60" />
                  </MenuButton>

                  <MenuItems
                    transition
                    anchor="bottom end"
                    className="w-52 mt-2 origin-top-right rounded-xl border border-gray-200 dark:border-gray-500 bg-white dark:bg-gray-800 p-1 text-sm/6 text-gray-700 dark:text-white  transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0 z-10"
                  >
                    <MenuItem>
                      <Button
                        onClick={() => agregarElemento("mesa")}
                        className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Circle className="size-4 fill-white/30" />
                        Mesa Redonda
                      </Button>
                    </MenuItem>
                    <MenuItem>
                      <Button
                        onClick={() => agregarElemento("mesaRectangular")}
                        className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <RectangleHorizontal className="size-4 fill-white/30 " />
                        Mesa Rectangular
                      </Button>
                    </MenuItem>
                    <MenuItem>
                      <Button
                        onClick={() => agregarElemento("pistaBaileRedonda")}
                        className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <CircleDashed className="size-4 fill-white/50" />
                        Pista Redonda
                      </Button>
                    </MenuItem>
                    <MenuItem>
                      <Button
                        onClick={() => agregarElemento("pistaBaileRectangular")}
                        className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="w-5 h-4 border-gray-500 dark:fill-white/50 border-2 rounded border-dashed"></div>
                        Pista Rectangular
                      </Button>
                    </MenuItem>
                    <MenuItem>
                      <Button
                        onClick={() => agregarElemento("barra")}
                        className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <SquareDashed className="size-4 fill-white/30" />
                        Barra
                      </Button>
                    </MenuItem>
                    <MenuItem>
                      <Button
                        onClick={() => agregarElemento("buffet")}
                        className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <SquareDashed className="size-4 fill-white/30" />
                        Buffet
                      </Button>
                    </MenuItem>
                    <MenuItem>
                      <Button
                        onClick={() => agregarElemento("escenario")}
                        className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <SquareDashedTopSolid className="size-4 fill-white/30" />
                        Escenario
                      </Button>
                    </MenuItem>
                    <MenuItem>
                      <Button
                        onClick={() => agregarElemento("entrada")}
                        className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <DoorOpen className="size-4 fill-white/30" />
                        Entrada
                      </Button>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="border rounded-3xl dark:border-gray-700 lg:w-40 bg-gray-100 dark:bg-[#1a1a1a] flex flex-col">
              <div className="text-2xl p-4 border-b text-center font-semibold text-gray-700 dark:text-white">
                Asientos
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="border-2 border-gray-300 rounded-lg w-8 h-8 bg-gray-200 "></div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                      Disponible
                    </p>
                    <p className="text-xs text-gray-500">
                      ({stats.disponibles} Asiento )
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ">
                  <div className="border-2 border-blue-500 rounded-lg w-8 h-8 bg-blue-400 "></div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                      Poco llena
                    </p>
                    <p className="text-xs text-gray-500">
                      ({stats.pocoLlenas} Asiento)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="border-2 border-yellow-700 rounded-lg w-8 h-8 bg-yellow-500 "></div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                      Media
                    </p>
                    <p className="text-xs text-gray-500">
                      ({stats.medias} Asiento)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="border-2 border-orange-700 rounded-lg w-8 h-8 bg-orange-500 "></div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                      Casi lleno
                    </p>
                    <p className="text-xs text-gray-500">
                      ({stats.casiLlenas} Asiento)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="border-2 border-green-700 rounded-lg w-8 h-8 bg-green-500 "></div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-semibold">
                      Ocupado
                    </p>
                    <p className="text-xs text-gray-500">
                      ({stats.ocupadas} Asiento)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="border-2 border-gray-300 rounded-lg w-8 h-8 bg-gray-200 ">
                    <Accessibility className="w-5 h-5 text-gray-500 m-auto mt-1"></Accessibility>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                      Silla de rueda
                    </p>
                    <p className="text-xs text-gray-500">
                      ({stats.sillasEspeciales} Asiento)
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 font-semibold">
                    Mesas Ocupadas:
                  </p>
                  <p className="text-casal text-3xl font-semibold">
                    {stats.mesasOcupadas}/{stats.totalMesas}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300  font-semibold">
                    Capacidad Utilizada:
                  </p>
                  <p
                    className={`text-3xl font-semibold ${
                      stats.porcentajeCapacidadUtilizada >= 90
                        ? "text-red-600"
                        : stats.porcentajeCapacidadUtilizada >= 70
                        ? "text-orange-600"
                        : stats.porcentajeCapacidadUtilizada >= 50
                        ? "text-yellow-600"
                        : stats.porcentajeCapacidadUtilizada > 0
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                  >
                    {stats.porcentajeCapacidadUtilizada}%
                  </p>
                </div>
              </div>
            </div>

            {/* Área de Diseño */}
            <div className="flex-1 border border-gray-300 rounded-3xl overflow-hidden shadow-sm">
              <div
                className="overflow-x-auto overflow-y-auto"
                style={{ height: "600px", maxHeight: "600px" }}
              >
                <div
                  className="relative bg-gray-50 dark:bg-[#1a1a1a]"
                  style={{
                    height: "800px",
                    minHeight: "800px",
                    minWidth: "1600px",
                    width: "1600px",
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
