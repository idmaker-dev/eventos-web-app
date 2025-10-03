import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import Mesa from "./Mesa.jsx";
import MesaRectangular from "./MesaRectangular.jsx";
import DraggableElement from "./DraggableElement.jsx";
import { BadgeQuestionMark, CircleEqual, Plus } from 'lucide-react';

export default function DistribuccionAdmin({ 
  allElements, 
  setAllElements, 
  contadores, 
  setContadores, 
  onGuardarDistribucion,
  layoutGuardado,
  onEditarLayout 
}) {
  const [activeId, setActiveId] = useState(null);
  const [activeElement, setActiveElement] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const agregarElemento = (tipo) => {
    const nuevoContador = contadores[tipo] + 1;
    
    const posicionAleatoria = {
      x: Math.random() * 1400 + 100,
      y: Math.random() * 600 + 100
    };

    let nuevoElemento;

    switch (tipo) {
      case 'mesa':
        nuevoElemento = {
          id: `mesa-${nuevoContador}`,
          type: 'mesa',
          numero: nuevoContador,
          invitados: 0,
          capacidad: 8,
          position: posicionAleatoria
        };
        break;
      case 'mesaRectangular':
        nuevoElemento = {
          id: `mesa-rect-${nuevoContador}`,
          type: 'mesaRectangular',
          numero: nuevoContador,
          invitados: 0,
          capacidad: 10,
          position: posicionAleatoria
        };
        break;
      case 'barra':
        nuevoElemento = {
          id: `barra-${nuevoContador}`,
          type: 'barra',
          position: posicionAleatoria
        };
        break;
      case 'buffet':
        nuevoElemento = {
          id: `buffet-${nuevoContador}`,
          type: 'buffet',
          position: posicionAleatoria
        };
        break;
      case 'escenario':
        nuevoElemento = {
          id: `escenario-${nuevoContador}`,
          type: 'escenario',
          position: posicionAleatoria
        };
        break;
      case 'entrada':
        nuevoElemento = {
          id: `entrada-${nuevoContador}`,
          type: 'entrada',
          position: posicionAleatoria
        };
        break;
      default:
        return;
    }

    setAllElements(prev => [...prev, nuevoElemento]);
    setContadores(prev => ({ ...prev, [tipo]: nuevoContador }));
  };

  const eliminarElemento = (id) => {
    setAllElements(prev => prev.filter(element => element.id !== id));
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    
    const element = allElements.find(el => el.id === active.id);
    setActiveElement(element);
  };

  const handleDragEnd = (event) => {
    const { active, delta } = event;
    
    setActiveId(null);
    setActiveElement(null);
    
    if (!delta) return;

    const draggedElementId = active.id;

    setAllElements(prev => 
      prev.map(element => {
        if (element.id === draggedElementId) {
          return {
            ...element,
            position: {
              x: Math.max(0, Math.min(1600 - 100, element.position.x + delta.x)),
              y: Math.max(0, Math.min(800 - 100, element.position.y + delta.y)),
            }
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

  const asignarInvitadosMesa = (numeroMesa, datosInvitado) => {
    setAllElements(prev => prev.map(element => 
      element.numero === numeroMesa && (element.type === 'mesa' || element.type === 'mesaRectangular')
        ? { ...element, invitados: Math.min(element.invitados + datosInvitado.cantidad, element.capacidad) }
        : element
    ));
  };

  const renderElementAdmin = (element) => {
    if (element.type === 'mesa') {
      return (
        <div className="relative group">
          <Mesa
            numeroMesa={element.numero}
            invitadosAsignados={element.invitados}
            capacidadMaxima={element.capacidad}
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

    if (element.type === 'mesaRectangular') {
      return (
        <div className="relative group">
          <MesaRectangular
            numeroMesa={element.numero}
            invitadosAsignados={element.invitados}
            capacidadMaxima={element.capacidad}
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
        case 'entrada':
          return (
            <div className="rounded px-6 py-1 rotate-90 border flex items-center justify-center text-gray-600 font-semibold bg-gray-50 whitespace-nowrap cursor-move">
              Entrada
            </div>
          );
        case 'barra':
          return (
            <div className="border-2 border-separate border-dashed border-gray-300 w-24 h-24 flex items-center justify-center text-center p-2 rounded-md text-gray-500 font-semibold bg-white shadow cursor-move">
              Barra 
            </div>
          );
        case 'mesa-principal':
          return (
            <div className="rounded px-6 py-3 w-48 border-separate border-2 border-dashed text-center text-gray-600 font-semibold bg-gray-50 cursor-move">
              Mesa principal <br />
              <span className="text-gray-500 text-sm italic">Ana y Juan</span>
            </div>
          );
        case 'pista-baile':
          return (
            <div className="w-48 h-48 text-center border-cafe border-2 border-dashed flex items-center justify-center text-gray-600 font-semibold bg-cafe/10 cursor-move rounded-full">
              <span className="text-cafe text-xl font-bold">Pista de <br /> Baile</span>
            </div>
          );
        case 'escenario':
          return (
            <div className="border-2 border-separate border-dashed border-gray-300 w-28 h-28 flex flex-col items-center justify-center text-center p-2 rounded-md text-gray-500 font-semibold bg-white shadow cursor-move">
              <p>ESCENARIO</p>
              <p className="text-xs mt-1">DJ Música</p>
            </div>
          );
        case 'buffet':
          return (
            <div className="border-2 border-separate border-dashed border-gray-300 w-28 h-20 flex items-center justify-center text-center p-2 rounded-md text-gray-500 font-semibold bg-white shadow cursor-move">
              BUFFET 
            </div>
          );
        default:
          return null;
      }
    })();

    if (!['mesa-principal', 'pista-baile'].includes(element.type)) {
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border p-6 rounded-lg bg-white shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                A
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Panel de Administrador</h1>
                <p className="text-gray-600">Diseño y configuración del salón</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={onGuardarDistribucion}
                className="bg-green-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Guardar Layout Final
              </button>
              {layoutGuardado && (
                <button 
                  onClick={onEditarLayout}
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Editar Layout
                </button>
              )}
            </div>
          </div>

          <div className="mb-6 p-6 bg-white border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800"> Herramientas de Diseño</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => agregarElemento('mesa')}
                className="bg-blue-500 text-white px-4 py-1 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <span className="text-lg"><Plus className='w-3 h-3'></Plus></span> Mesa Redonda 
              </button>
              <button
                onClick={() => agregarElemento('mesaRectangular')}
                className="bg-cyan-500 text-white px-4 py-1 rounded-lg font-medium hover:bg-cyan-600 transition-colors flex items-center gap-2"
              >
                <span className="text-lg"><Plus className='w-3 h-3'></Plus></span> Mesa Rectangular
              </button>
              <button
                onClick={() => agregarElemento('barra')}
                className="bg-indigo-500 text-white px-4 py-1 rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center gap-2"
              >
                <span className="text-lg"><Plus className='w-3 h-3'></Plus></span> Barra
              </button>
              <button
                onClick={() => agregarElemento('buffet')}
                className="bg-green-500 text-white px-4 py-1 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <span className="text-lg"><Plus className='w-3 h-3'></Plus></span> Buffet
              </button>
              <button
                onClick={() => agregarElemento('escenario')}
                className="bg-purple-500 text-white px-4 py-1 rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <span className="text-lg"><Plus className='w-3 h-3'></Plus></span> Escenario
              </button>
              <button
                onClick={() => agregarElemento('entrada')}
                className="bg-gray-500 text-white px-4 py-1 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <span className="text-lg"><Plus className='w-3 h-3'></Plus></span> Entrada
              </button>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <BadgeQuestionMark></BadgeQuestionMark> <strong>Instrucciones:</strong> Arrastra los elementos para posicionarlos. Haz hover sobre cualquier elemento y presiona "×" para eliminarlo. Guarda el layout cuando esté listo.
              </p>
            </div>
          </div>

          {/* Área de Diseño */}
          <div className="border border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold">
                Área de Diseño - "Jardín Romántico"
              </h3>
            </div>
            
            <div className="overflow-x-auto overflow-y-auto">
              <div className="relative bg-gray-50" style={{ 
                height: '800px',
                minWidth: '1600px',
                width: '1600px'
              }}>
                {allElements.map((element) => (
                  <DraggableElement 
                    key={element.id} 
                    id={element.id} 
                    data={element}
                    style={{
                      position: 'absolute',
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
                    backgroundSize: '40px 40px'
                  }}
                />
              </div>
            </div>

            <div className="bg-blue-50 border-t border-blue-200 px-4 py-2">
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

        <DragOverlay>
          {activeElement ? (
            <div className="opacity-75 transform scale-105">
              {renderElementAdmin(activeElement)}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}