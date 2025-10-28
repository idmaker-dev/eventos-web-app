import React, { useState, useRef } from "react";
import { Minus, Plus, RotateCcw, Eye, Save, Accessibility } from "lucide-react";
import { Button } from "@headlessui/react";
import { Tooltip } from "../ui/Tooltip.jsx";
import Mesa from "./Mesa.jsx";
import MesaRectangular from "./MesaRectangular.jsx";
import StatsPanel from "./StatsPanel.jsx";
import ModalMesaDetalles from "./ModalMesaDetalles.jsx";
import ModalRestricciones from "./ModalRestricciones.jsx";

export default function DistribuccionMonitor({
  allElements,
  setAllElements,
  salon,
  invitados,
  setInvitados,
}) {
  // ZOOM controls
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showMesaModal, setShowMesaModal] = useState(false);
  const [mesaSeleccionadaModal, setMesaSeleccionadaModal] = useState(null);

 // Estados para invitados (igual que en DistribuccionNovios)
 const [activeInvitado, setActiveInvitado] = useState(null);
 const [invitadosSinAsignar, setInvitadosSinAsignar] = useState(invitados || []);
 const [guardando, setGuardando] = useState(false);
 
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

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isPanningRef = useRef(false);
  const panLastRef = useRef({ x: 0, y: 0 });

  const CANVAS_WIDTH = 4000;
  const CANVAS_HEIGHT = 2400;
  const ZOOM_STEP = 0.1;
  const ZOOM_MIN = 0.1;
  const ZOOM_MAX = 4;

  // Zoom functions
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));
  const resetZoom = () => {
    setZoom(1);
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
// Función para asignar invitados a mesa
 const asignarInvitadosMesa = (numeroMesa, datosInvitado) => {
   const mesaSeleccionada = allElements.find(
     (el) => el.numero === numeroMesa && (el.type === "mesa" || el.type === "mesaRectangular")
   );
 
   if (!mesaSeleccionada) {
     mostrarNotificacion(`Mesa ${numeroMesa} no encontrada`, "error");
     return;
   }
 
   const cantidad = Number(datosInvitado?.cantidad || 1);
   const sillasEspecialesDisponibles = Array.isArray(mesaSeleccionada.sillasEspeciales)
     ? mesaSeleccionada.sillasEspeciales.length
     : typeof mesaSeleccionada.sillasEspeciales === "number"
     ? mesaSeleccionada.sillasEspeciales
     : 0;
 
   const personasEspecialesAsignadas = Number(mesaSeleccionada.invitadosEspeciales || 0);
 
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
   const espacioDisponible = Number(mesaSeleccionada.capacidad || 0) - Number(mesaSeleccionada.invitados || 0);

   if (espacioDisponible <= 0) {
     mostrarNotificacion(`❌ La Mesa ${numeroMesa} ya está llena (0 espacios disponibles).`, "error");
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
 const handleConfirmRestricciones = ({ nombre, restricciones: res, otra: otraText }) => {
   if (!pendingAsignacion) return;
   const { invitado, numeroMesa } = pendingAsignacion;
 
   const mesaSeleccionada = allElements.find(
     (el) => el.numero === numeroMesa && (el.type === "mesa" || el.type === "mesaRectangular")
  );
   if (!mesaSeleccionada) {
    mostrarNotificacion("Mesa no encontrada", "error");
     setShowRestrModal(false);
     setPendingAsignacion(null);
     return;
   }
 
  const cantidad = invitado.cantidad;
 
   setAllElements((prev) =>
     prev.map((el) =>
       el.numero === numeroMesa && (el.type === "mesa" || el.type === "mesaRectangular")
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
 
   setInvitadosSinAsignar((prev) => prev.filter((inv) => inv.id !== invitado.id));
 
   mostrarNotificacion(
     `✅ ${nombre || invitado.nombre} asignado a Mesa ${numeroMesa}`,
     "success"
   );
 
   setShowRestrModal(false);
   setPendingAsignacion(null);
  setPendingNombre("");
 };
 // Guardar asignaciones
 const guardarAsignaciones = () => {
   setGuardando(true);
  
   const asignaciones = {
     elementos: [...allElements],
     invitadosSinAsignar: [...invitadosSinAsignar],
     fecha: new Date().toISOString(),
    salon: salon?.nombre || "Monitor",
   };
 
   localStorage.setItem('asignacionesMonitor', JSON.stringify(asignaciones));
   
   setTimeout(() => {
     setGuardando(false);
     mostrarNotificacion('¡Asignaciones guardadas exitosamente!', 'success');
   }, 1000);
 };

  // Canvas pan handlers (solo visualización, no edición)
  const handleMouseDownCanvas = (e) => {
    const startPan = e.button === 1 || e.altKey || e.code === "Space" || e.shiftKey;
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
      (el) => el.numero === numeroMesa && (el.type === "mesa" || el.type === "mesaRectangular")
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
         <div className="font-medium text-gray-800 dark:text-gray-300">{invitado.nombre}</div>
         <div className="text-sm text-gray-600 dark:text-gray-400">
           <span className="font-semibold">({invitado.cantidad} personas)</span>
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
 const totalPersonasSinAsignar = invitadosSinAsignar.reduce((total, inv) => total + inv.cantidad, 0);
 const mesas = allElements.filter((el) => el.type === "mesa" || el.type === "mesaRectangular");
 const totalInvitadosAsignados = mesas.reduce((total, mesa) => total + (mesa.invitados || 0), 0);
 const totalCapacidad = mesas.reduce((total, mesa) => total + (mesa.capacidad || 0), 0);
 const mesasOcupadas = mesas.filter((mesa) => mesa.invitados > 0).length;
 const totalMesas = mesas.length;
 const porcentajeCapacidadUtilizada = totalCapacidad > 0 ? Math.round((totalInvitadosAsignados / totalCapacidad) * 100) : 0;

  // Calcular estadísticas (solo lectura)
  const calcularEstadisticas = () => {
    const mesas = allElements.filter((el) => el.type === "mesa" || el.type === "mesaRectangular");
    if (mesas.length === 0) {
      return {
        disponibles: 0, pocoLlenas: 0, medias: 0, casiLlenas: 0, ocupadas: 0,
        sillasEspeciales: 0, totalMesas: 0, totalCapacidad: 0, totalOcupados: 0,
        porcentajeCapacidadUtilizada: 0, mesasOcupadas: 0
      };
    }

    let asientosDisponibles = 0, asientosPocoLlenos = 0, asientosMedios = 0;
    let asientosCasiLlenos = 0, asientosOcupados = 0, sillasEspeciales = 0;
    let totalCapacidad = 0, totalOcupados = 0;

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
      disponibles: asientosDisponibles, pocoLlenas: asientosPocoLlenos, medias: asientosMedios,
      casiLlenas: asientosCasiLlenos, ocupadas: asientosOcupados, sillasEspeciales,
      totalMesas: mesas.length, totalCapacidad, totalOcupados,
      porcentajeCapacidadUtilizada: Math.round((totalOcupados / totalCapacidad) * 100) || 0,
      mesasOcupadas: mesas.filter((m) => m.invitados > 7).length,
    };
  };

  // Render elemento (sin botones de eliminar)
  const renderElementMonitor = (element) => {
    if (element.type === "mesa") {
      return (
        <div className="relative cursor-pointer">
          <Mesa
            numeroMesa={element.numero}
            invitadosAsignados={element.invitados}
            capacidadMaxima={element.capacidad}
            sillasEspeciales={element.sillasEspeciales || []}
            invitadosEspeciales={element.invitadosEspeciales || 0}
           onDrop={asignarInvitadosMesa}
            onDoubleClick={() => openMesaModal(element.numero)}
            readOnly={false}
          />
        </div>
      );
    }

    if (element.type === "mesaRectangular") {
      return (
        <div className="relative cursor-pointer">
          <MesaRectangular
            numeroMesa={element.numero}
            invitadosAsignados={element.invitados}
            capacidadMaxima={element.capacidad}
            sillasEspeciales={element.sillasEspeciales || []}
            invitadosEspeciales={element.invitadosEspeciales || 0}
           onDrop={asignarInvitadosMesa}
            onDoubleClick={() => openMesaModal(element.numero)}
            readOnly={false}
          />
        </div>
      );
    }

    // Renderizar otros elementos (sin botones de eliminar)
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
            <span className="text-cafe text-lg font-bold">Pista de <br /> Baile</span>
          </div>
        );
      case "pistaBaileRectangular":
        return (
          <div className="w-64 h-28 text-center border-cafe border-2 border-dashed flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold bg-cafe/10 rounded-lg">
            <span className="text-cafe text-lg font-bold">Pista de <br /> Baile</span>
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
  };

  const stats = calcularEstadisticas();

// ...existing code...
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
          <div className="w-full xl:w-80 flex-shrink-0">
            <div className="bg-fondoVs dark:bg-[#1a1a1a] py-6 px-3 rounded-lg shadow-sm">
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
                    <p className="font-medium">¡Todos los invitados asignados!</p>
                    <p className="text-sm">Perfecta distribución</p>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-white dark:bg-black border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Arrastra los invitados a las mesas del plano para asignar lugares.
                </p>
              </div>
            </div>
          </div>

          {/* Plano del Salón */}
          <div className="flex-1 min-w-0">
            <div className=" overflow-hidden shadow-sm rounded-md">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-fondoVs dark:bg-[#1a1a1a]">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Plano del Salón - "Jardín Romántico"
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-1">
                  <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                    💡 Arrastra invitados a las mesas o haz doble clic para detalles
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

              <div className="bg-fondoVs dark:bg-[#1a1a1a] border-t border-green-200 px-4 py-2">
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span className="font-medium">
                    ↔ Scroll horizontal | ↕ Scroll vertical para navegar
                  </span>
                  <span className="text-gray-500">Modo Monitor - Asignación activa</span>
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
                    <span className="font-medium text-gray-600 dark:text-gray-100">Invitados:</span>
                    <span className="ml-2 font-bold text-blue-600">
                      {totalInvitadosAsignados}/{totalCapacidad}
                    </span>
                    <span className="ml-2 font-medium text-gray-600 dark:text-gray-100">Asignados</span>
                  </div>
                  <div className="w-[0.2rem] h-4 bg-gray-300 rounded"></div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-100">Mesas Ocupadas:</span>
                    <span className="ml-2 font-bold text-amber-600">
                      {mesasOcupadas}/{totalMesas}
                    </span>
                  </div>
                  <div className="w-[0.2rem] h-4 bg-gray-300 rounded"></div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-100">Capacidad utilizada:</span>
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
                    <span className="font-medium text-gray-600 dark:text-gray-100">Sin Asignar:</span>
                    <span
                      className={`ml-2 font-bold ${
                        totalPersonasSinAsignar > 0 ? "text-red-500" : "text-green-500"
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
    </div>
  );
}