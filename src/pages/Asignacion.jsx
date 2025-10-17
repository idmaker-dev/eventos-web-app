import React, { useState } from "react";
import DistribuccionAdmin from "../components/Distribuccion/DistribuccionAdmin.jsx";

export default function Asignacion() {
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
// Actualizar el estado inicial con numeración secuencial
const [allElements, setAllElements] = useState([
  // Mesas con numeración secuencial unificada
  { id: 'mesa-1', type: 'mesa', numero: 1, invitados: 5, capacidad: 8, position: { x: 50, y: 50 } },
  { id: 'mesa-2', type: 'mesa', numero: 2, invitados: 3, capacidad: 8, position: { x: 50, y: 150 } },
  { id: 'mesa-3', type: 'mesa', numero: 3, invitados: 6, capacidad: 8, position: { x: 50, y: 250 } },
  { id: 'mesa-4', type: 'mesa', numero: 4, invitados: 8, capacidad: 8, position: { x: 50, y: 350 } },
  { id: 'mesa-5', type: 'mesa', numero: 5, invitados: 2, capacidad: 8, position: { x: 650, y: 50 } },
  { id: 'mesa-6', type: 'mesa', numero: 6, invitados: 5, capacidad: 8, position: { x: 650, y: 150 } },
  { id: 'mesa-7', type: 'mesa', numero: 7, invitados: 0, capacidad: 8, position: { x: 650, y: 250 } },
  { id: 'mesa-8', type: 'mesa', numero: 8, invitados: 4, capacidad: 8, position: { x: 650, y: 350 } },
  
  // Elementos del layout
  { id: 'entrada-1', type: 'entrada', position: { x: 20, y: 200 } },
  { id: 'barra-1', type: 'barra', position: { x: 20, y: 300 } },
  { id: 'mesa-principal', type: 'mesa-principal', position: { x: 350, y: 50 } },
  { id: 'pista-redonda-1', type: 'pistaBaileRedonda', position: { x: 300, y: 200 } },
  { id: 'escenario-1', type: 'escenario', position: { x: 800, y: 200 } },
  { id: 'buffet-1', type: 'buffet', position: { x: 800, y: 300 } },
]);

  // Estado de invitados (para referencia en el admin)
  // Actualizar el estado de invitados para incluir necesidades especiales
const [invitados, setInvitados] = useState([
  { id: 1, nombre: "Familia García", cantidad: 4, necesidadEspecial: false },
  { id: 2, nombre: "María López", cantidad: 1, necesidadEspecial: false },
  { id: 3, nombre: "Familia Rodríguez", cantidad: 3, necesidadEspecial: true }, // Con necesidad especial
  { id: 4, nombre: "Carlos Mendez", cantidad: 1, necesidadEspecial: false },
  { id: 5, nombre: "Compañeros trabajo", cantidad: 4, necesidadEspecial: false },
  { id: 6, nombre: "Ana Sofi", cantidad: 1, necesidadEspecial: true }, // Con necesidad especial
  { id: 7, nombre: "Compañeros Padel", cantidad: 2, necesidadEspecial: false },
  { id: 8, nombre: "Familia Lara", cantidad: 7, necesidadEspecial: false },
  { id: 9, nombre: "Abuela Carmen", cantidad: 1, necesidadEspecial: true }, // Con necesidad especial
  { id: 10, nombre: "Tío Roberto (silla ruedas)", cantidad: 1, necesidadEspecial: true }, // Con necesidad especial
]);

  // Cargar layout guardado al iniciar
  React.useEffect(() => {
    const layoutGuardadoLocal = localStorage.getItem('layoutSalon');
    if (layoutGuardadoLocal) {
      try {
        const layout = JSON.parse(layoutGuardadoLocal);
        setLayoutFinal(layout);
        setLayoutGuardado(true);
        setAllElements(layout.elementos || allElements);
        setContadores(layout.contadores || contadores);
      } catch (error) {
        console.error('Error al cargar layout guardado:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-white rounded-3xl dark:bg-[#2a2a2a]">
      {/* Solo componente - Sin headers ni botones */}
      <DistribuccionAdmin
        allElements={allElements}
        setAllElements={setAllElements}
        contadores={contadores}
        setContadores={setContadores}
        layoutGuardado={layoutGuardado}
        setLayoutGuardado={setLayoutGuardado}
        layoutFinal={layoutFinal}
        setLayoutFinal={setLayoutFinal}
        invitados={invitados}
        setInvitados={setInvitados}
      />
    </div>
  );
}