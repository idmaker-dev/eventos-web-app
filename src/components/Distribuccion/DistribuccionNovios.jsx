import React from 'react';
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

export default function DistribuccionNovios({ 
  allElements, 
  setAllElements, 
  invitados, 
  layoutGuardado, 
  layoutFinal 
}) {
  
  const [activeInvitado, setActiveInvitado] = React.useState(null);

  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const asignarInvitadosMesa = (numeroMesa, datosInvitado) => {
    setAllElements(prev => prev.map(element => 
      element.numero === numeroMesa && (element.type === 'mesa' || element.type === 'mesaRectangular')
        ? { ...element, invitados: Math.min(element.invitados + datosInvitado.cantidad, element.capacidad) }
        : element
    ));
  };

  // Componente para invitados arrastrable
  const InvitadoDraggable = ({ invitado }) => {
    const handleDragStart = (event) => {
      setActiveInvitado(invitado);
    };

    const handleDragEnd = (event) => {
      setActiveInvitado(null);
    };

    return (
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', JSON.stringify(invitado));
          setActiveInvitado(invitado);
        }}
        onDragEnd={() => setActiveInvitado(null)}
        className="bg-white p-3 rounded-lg border-2 border-dashed border-gray-200 cursor-move hover:bg-gray-100 transition-colors hover:shadow-md"
      >
        <div className="font-medium text-gray-800">{invitado.nombre}</div>
        <div className="text-sm text-gray-600">({invitado.cantidad} personas)</div>
      </div>
    );
  };

  // Componentes estáticos (NO arrastrables) para mesas y elementos
  const MesaEstatica = ({ element }) => (
    <div className="pointer-events-auto">
      <Mesa
        numeroMesa={element.numero}
        invitadosAsignados={element.invitados}
        capacidadMaxima={element.capacidad}
        onDrop={asignarInvitadosMesa}
      />
    </div>
  );

  const MesaRectangularEstatica = ({ element }) => (
    <div className="pointer-events-auto">
      <MesaRectangular
        numeroMesa={element.numero}
        invitadosAsignados={element.invitados}
        capacidadMaxima={element.capacidad}
        onDrop={asignarInvitadosMesa}
      />
    </div>
  );

  const renderElementoEstatico = (element) => {
    if (element.type === 'mesa') {
      return <MesaEstatica element={element} />;
    }

    if (element.type === 'mesaRectangular') {
      return <MesaRectangularEstatica element={element} />;
    }

    switch (element.type) {
      case 'entrada':
        return (
          <div className="rounded px-6 py-1 rotate-90 border flex items-center justify-center text-gray-600 font-semibold bg-gray-50 whitespace-nowrap pointer-events-none">
            Entrada
          </div>
        );
      case 'barra':
        return (
          <div className="border-2 border-separate border-dashed border-gray-300 w-24 h-24 flex items-center justify-center text-center p-2 rounded-md text-gray-500 font-semibold bg-white shadow pointer-events-none">
            Barra 
          </div>
        );
      case 'mesa-principal':
        return (
          <div className="rounded px-6 py-3 w-48 border-separate border-2 border-dashed text-center text-gray-600 font-semibold bg-gray-50 pointer-events-none">
            Mesa principal <br />
            <span className="text-gray-500 text-sm italic">Ana y Juan</span>
          </div>
        );
      case 'pista-baile':
        return (
          <div className="w-48 h-48 text-center border-cafe border-2 border-dashed flex items-center justify-center text-gray-600 font-semibold bg-cafe/10 rounded-full pointer-events-none">
            <span className="text-cafe text-xl font-bold">Pista de <br /> Baile</span>
          </div>
        );
      case 'escenario':
        return (
          <div className="border-2 border-separate border-dashed border-gray-300 w-28 h-28 flex flex-col items-center justify-center text-center p-2 rounded-md text-gray-500 font-semibold bg-white shadow pointer-events-none">
            <p>ESCENARIO</p>
            <p className="text-xs mt-1">DJ Música</p>
          </div>
        );
      case 'buffet':
        return (
          <div className="border-2 border-separate border-dashed border-gray-300 w-28 h-20 flex items-center justify-center text-center p-2 rounded-md text-gray-500 font-semibold bg-white shadow pointer-events-none">
            BUFFET 
          </div>
        );
      default:
        return null;
    }
  };

  const elementosFinales = layoutGuardado ? layoutFinal.elementos : allElements;
  
  return (
    <div className="min-h-screen ">
      <div className="p-4">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Lista de Invitados */}
          <div className="w-full xl:w-80 flex-shrink-0">
            <div className="bg-slate-50 py-6 px-3 rounded-lg shadow-sm ">
              <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
                 Invitados sin Asignar
                <span className="text-sm text-gray-500 font-normal">(20 personas)</span>
              </h3>
              <div className="max-h-96 overflow-y-auto">
               <ul className="space-y-3">
                  {invitados.map(invitado => (
                    <li key={invitado.id}>
                      <InvitadoDraggable invitado={invitado} />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  Arrastra los invitados a las mesas del plano para asignar lugares.
                </p>
                
              </div>
            </div>
          </div>

          {/* Plano del Salón - ELEMENTOS ESTÁTICOS */}
          <div className="flex-1 min-w-0">
            <div className="border border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200 ">
                <h3 className="text-lg font-semibold text-gray-800">
                    Plano del Salón - "Jardín Romántico"
                </h3>
              </div>
              
              <div className="overflow-x-auto overflow-y-auto">
                <div 
                  className="relative bg-gradient-to-br from-pink-25 to-blue-25" 
                  style={{ 
                    height: '800px',
                    minWidth: '1600px',
                    width: '1600px'
                  }}
                >
                  {/* Elementos COMPLETAMENTE ESTÁTICOS - No arrastrables */}
                  {elementosFinales.map((element) => (
                    <div
                      key={element.id}
                      className="absolute"
                      style={{
                        left: `${element.position.x}px`,
                        top: `${element.position.y}px`,
                        cursor: (element.type === 'mesa' || element.type === 'mesaRectangular') ? 'default' : 'default',
                        userSelect: 'none'
                      }}
                    >
                      {renderElementoEstatico(element)}
                    </div>
                  ))}
                  
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-0"
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

            
            </div>

            {/* Estadísticas */}
            <div className="mt-4 text-sm text-gray-700 bg-slate-100 px-4 py-3 rounded-full border-gray-200 shadow-sm">
              <div className="flex justify-normal items-center gap-3 text-center">
                <div>
                  <span className="font-semibold text-gray-600">Invitados Asignados:</span>
                  <span className="ml-2 font-bold">
                    {elementosFinales
                      .filter(el => el.type === 'mesa' || el.type === 'mesaRectangular')
                      .reduce((total, mesa) => total + mesa.invitados, 0)
                    }/
                    {elementosFinales
                      .filter(el => el.type === 'mesa' || el.type === 'mesaRectangular')
                      .reduce((total, mesa) => total + mesa.capacidad, 0)
                    }
                  </span>
                </div>
                <div className="w-1 h-4 bg-gray-300 rounded"></div>
                <div>
                  <span className="font-semibold text-gray-600">Mesas Ocupado:</span>
                  <span className="ml-2 font-bold text-amber-500">
                  4/6
                  </span>
                </div>
                <div className="w-1 h-4 bg-gray-300 rounded"></div>
                <div>
                  <span className="font-semibold text-gray-600">Capacidad:</span>
                  <span className="ml-2 font-bold text-amber-500">
                    {Math.round(
                      (elementosFinales
                        .filter(el => el.type === 'mesa' || el.type === 'mesaRectangular')
                        .reduce((total, mesa) => total + mesa.invitados, 0) /
                      elementosFinales
                        .filter(el => el.type === 'mesa' || el.type === 'mesaRectangular')
                        .reduce((total, mesa) => total + mesa.capacidad, 0)) * 100
                    )}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}