import React, { useState } from "react";
import DistribuccionAdmin from "../components/Distribuccion/DistribuccionAdmin.jsx";
import DistribuccionNovios from "../components/Distribuccion/DistribuccionNovios.jsx";

export default function Distribucion() {
  // Estado para controlar qué vista mostrar
  const [vistaActual, setVistaActual] = useState('admin'); // 'admin' o 'novios'
  
  // Estado para controlar si el diseño está guardado
  const [layoutGuardado, setLayoutGuardado] = useState(false);
  const [layoutFinal, setLayoutFinal] = useState(null);
  
  // Contadores para IDs únicos
  const [contadores, setContadores] = useState({
    mesa: 8,
    mesaRectangular: 0,
    barra: 1,
    buffet: 1,
    escenario: 1,
    entrada: 1
  });

  // Estado con posiciones absolutas para cada elemento
  const [allElements, setAllElements] = useState([
    // Mesas con posiciones iniciales
    { id: 'mesa-1', type: 'mesa', numero: 1, invitados: 5, capacidad: 8, position: { x: 50, y: 50 } },
    { id: 'mesa-2', type: 'mesa', numero: 2, invitados: 3, capacidad: 8, position: { x: 50, y: 150 } },
    { id: 'mesa-3', type: 'mesa', numero: 3, invitados: 6, capacidad: 8, position: { x: 50, y: 250 } },
    { id: 'mesa-4', type: 'mesa', numero: 4, invitados: 8, capacidad: 8, position: { x: 50, y: 350 } },
    { id: 'mesa-5', type: 'mesa', numero: 5, invitados: 2, capacidad: 8, position: { x: 650, y: 50 } },
    { id: 'mesa-6', type: 'mesa', numero: 6, invitados: 5, capacidad: 8, position: { x: 650, y: 150 } },
    { id: 'mesa-7', type: 'mesa', numero: 7, invitados: 0, capacidad: 8, position: { x: 650, y: 250 } },
    { id: 'mesa-8', type: 'mesa', numero: 8, invitados: 4, capacidad: 8, position: { x: 650, y: 350 } },
    
    // Elementos del layout con posiciones iniciales
    { id: 'entrada-1', type: 'entrada', position: { x: 20, y: 200 } },
    { id: 'barra-1', type: 'barra', position: { x: 20, y: 300 } },
    { id: 'mesa-principal', type: 'mesa-principal', position: { x: 350, y: 50 } },
    { id: 'pista-baile', type: 'pista-baile', position: { x: 300, y: 200 } },
    { id: 'escenario-1', type: 'escenario', position: { x: 800, y: 200 } },
    { id: 'buffet-1', type: 'buffet', position: { x: 800, y: 300 } },
  ]);

  // ¡ASEGÚRATE DE QUE ESTE ESTADO ESTÉ DEFINIDO!
  const [invitados, setInvitados] = useState([
    { id: 1, nombre: "Familia García", cantidad: 4 },
    { id: 2, nombre: "María López", cantidad: 1 },
    { id: 3, nombre: "Familia Rodríguez", cantidad: 3 },
    { id: 4, nombre: "Carlos Mendez", cantidad: 1 },
    { id: 5, nombre: "Compañeros trabajo", cantidad: 4 },
    { id: 6, nombre: "Ana Sofi", cantidad: 1 },
    { id: 7, nombre: "Compañeros Padel", cantidad: 2 },
    { id: 8, nombre: "Familia Lara", cantidad: 7 },
  ]);

  // Función para cambiar entre vistas
  const cambiarVista = (vista) => {
    setVistaActual(vista);
  };

  // Función para guardar el layout final
  const guardarDistribucion = () => {
    const layoutConDatos = {
      elementos: [...allElements],
      contadores: { ...contadores },
      fechaCreacion: new Date().toISOString(),
      totalMesas: allElements.filter(el => el.type === 'mesa' || el.type === 'mesaRectangular').length,
      estadisticas: {
        mesasRedondas: allElements.filter(el => el.type === 'mesa').length,
        mesasRectangulares: allElements.filter(el => el.type === 'mesaRectangular').length,
        barras: allElements.filter(el => el.type === 'barra').length,
        buffets: allElements.filter(el => el.type === 'buffet').length,
        escenarios: allElements.filter(el => el.type === 'escenario').length,
        entradas: allElements.filter(el => el.type === 'entrada').length,
      }
    };
    
    setLayoutFinal(layoutConDatos);
    setLayoutGuardado(true);
    
    localStorage.setItem('layoutSalon', JSON.stringify(layoutConDatos));
    
    alert('¡Layout guardado exitosamente! Ahora está disponible para los novios.');
  };

  // Función para editar el layout (volver al modo de diseño)
  const editarLayout = () => {
    setLayoutGuardado(false);
  };

  return (
    <div className="min-h-screen">
      {/* Selector de Vista */}
      <div className=" border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-center">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => cambiarVista('admin')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  vistaActual === 'admin'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Vista Admin
              </button>
              <button
                onClick={() => cambiarVista('novios')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  vistaActual === 'novios'
                    ? 'bg-blue-500  text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Vista Novios
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estado del Layout */}
      {layoutGuardado && vistaActual === 'admin' && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-800">Layout Guardado Exitosamente</h4>
                <p className="text-sm text-green-700">
                  Guardado: {new Date(layoutFinal.fechaCreacion).toLocaleString()} | 
                  Elementos: {layoutFinal.elementos.length}
                </p>
              </div>
              <button 
                onClick={editarLayout}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Editar Layout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renderizar Vista Seleccionada */}
      {vistaActual === 'admin' ? (
        <DistribuccionAdmin
          allElements={allElements}
          setAllElements={setAllElements}
          contadores={contadores}
          setContadores={setContadores}
          onGuardarDistribucion={guardarDistribucion}
          layoutGuardado={layoutGuardado}
          onEditarLayout={editarLayout}
        />
      ) : (
        <DistribuccionNovios
          allElements={allElements}
          setAllElements={setAllElements}
          invitados={invitados} 
          layoutGuardado={layoutGuardado}
          layoutFinal={layoutFinal}
        />
      )}
    </div>
  );
}