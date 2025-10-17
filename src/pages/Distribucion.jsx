import React, { useState, useEffect } from "react";
import DistribuccionNovios from "../components/Distribuccion/DistribuccionNovios.jsx";

export default function Distribucion() {
  // Estado de invitados que los novios pueden gestionar
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

  // Estados del layout del admin
  const [layoutFinal, setLayoutFinal] = useState(null);
  const [layoutDisponible, setLayoutDisponible] = useState(false);
  const [allElements, setAllElements] = useState([]);

  // Cargar layout del admin al iniciar
  useEffect(() => {
    const layoutGuardado = localStorage.getItem('layoutSalon');
    if (layoutGuardado) {
      try {
        const layout = JSON.parse(layoutGuardado);
        setLayoutFinal(layout);
        setAllElements(layout.elementos || []);
        setLayoutDisponible(true);
      } catch (error) {
        console.error('Error al cargar layout:', error);
        setLayoutDisponible(false);
      }
    } else {
      setLayoutDisponible(false);
    }
  }, []);

  // Función para guardar asignaciones de los novios
  const guardarAsignaciones = () => {
    const asignaciones = {
      invitados: invitados,
      fechaAsignacion: new Date().toISOString(),
      estadisticas: {
        totalInvitados: invitados.reduce((total, inv) => total + inv.cantidad, 0),
        invitadosAsignados: invitados.filter(inv => inv.mesaAsignada).reduce((total, inv) => total + inv.cantidad, 0),
        invitadosSinAsignar: invitados.filter(inv => !inv.mesaAsignada).reduce((total, inv) => total + inv.cantidad, 0),
        mesasOcupadas: new Set(invitados.filter(inv => inv.mesaAsignada).map(inv => inv.mesaAsignada)).size
      }
    };

    localStorage.setItem('asignacionesNovios', JSON.stringify(asignaciones));
    alert('¡Asignaciones guardadas exitosamente!');
  };

  // Cargar asignaciones previas
  useEffect(() => {
    const asignacionesGuardadas = localStorage.getItem('asignacionesNovios');
    if (asignacionesGuardadas) {
      try {
        const asignaciones = JSON.parse(asignacionesGuardadas);
        setInvitados(asignaciones.invitados || invitados);
      } catch (error) {
        console.error('Error al cargar asignaciones:', error);
      }
    }
  }, []);

  if (!layoutDisponible) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Layout No Disponible
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              El administrador aún no ha configurado el layout del salón. Por favor, espera a que el layout esté disponible para poder asignar a tus invitados.
            </p>
            
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Verificar Nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      {/* Header de Novios */}
      <div className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Distribución de Invitados
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Asigna a tus invitados en las mesas disponibles
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Layout creado: {new Date(layoutFinal.fechaCreacion).toLocaleDateString()}
              </div>
              
              <button 
                onClick={guardarAsignaciones}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
              >
                Guardar Asignaciones
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de Invitados */}
      <div className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="text-sm">
              <div className="font-semibold text-gray-900 dark:text-white">
                {invitados.reduce((total, inv) => total + inv.cantidad, 0)}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Total Invitados</div>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-green-600 dark:text-green-400">
                {invitados.filter(inv => inv.mesaAsignada).reduce((total, inv) => total + inv.cantidad, 0)}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Asignados</div>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-orange-600 dark:text-orange-400">
                {invitados.filter(inv => !inv.mesaAsignada).reduce((total, inv) => total + inv.cantidad, 0)}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Sin Asignar</div>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-blue-600 dark:text-blue-400">
                {new Set(invitados.filter(inv => inv.mesaAsignada).map(inv => inv.mesaAsignada)).size}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Mesas Ocupadas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Componente de Novios */}
      <DistribuccionNovios
        allElements={allElements}
        setAllElements={setAllElements}
        invitados={invitados}
        setInvitados={setInvitados}
        layoutDisponible={layoutDisponible}
        layoutFinal={layoutFinal}
        onGuardarAsignaciones={guardarAsignaciones}
      />
    </div>
  );
}