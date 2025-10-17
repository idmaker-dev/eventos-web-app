import React from 'react';
import { Accessibility } from 'lucide-react';

const Mesa = ({ numeroMesa, invitadosAsignados = 0, capacidadMaxima = 8, sillasEspeciales = [], invitadosEspeciales = 0, onDrop }) => {
  // Calcular porcentaje de ocupación
  const porcentajeOcupacion = (invitadosAsignados / capacidadMaxima) * 100;
  
  // Función para determinar el color según la ocupación
  const getColorMesa = () => {
    if (porcentajeOcupacion === 0) return 'bg-white border-gray-300'; // Vacía
    if (porcentajeOcupacion <= 50) return 'bg-blue-100 border-blue-300'; // Poco llena
    if (porcentajeOcupacion <= 80) return 'bg-yellow-100 border-yellow-400'; // Media
    if (porcentajeOcupacion < 100) return 'bg-orange-100 border-orange-400'; // Casi llena
    return 'bg-green-100 border-green-500'; // Completa
  };

  // Función para el color del texto
  const getColorTexto = () => {
    if (porcentajeOcupacion === 0) return 'text-gray-600';
    if (porcentajeOcupacion <= 50) return 'text-blue-700';
    if (porcentajeOcupacion <= 80) return 'text-yellow-700';
    if (porcentajeOcupacion < 100) return 'text-orange-700';
    return 'text-green-700';
  };

  // Función para obtener el color de las sillas normales
  const getColorSilla = (indice) => {
    if (indice < invitadosAsignados) {
      // Silla ocupada 
      if (porcentajeOcupacion <= 50) return 'bg-blue-500';
      if (porcentajeOcupacion <= 80) return 'bg-yellow-500';
      if (porcentajeOcupacion < 100) return 'bg-orange-500';
      return 'bg-green-500';
    }
    return 'bg-gray-300 dark:bg-gray-400'; // Silla vacía
  };

  // Verificar si una posición tiene silla especial
  const esSillaEspecial = (posicion) => {
    return sillasEspeciales && sillasEspeciales.includes(posicion + 1);
  };

  // Verificar si una silla especial está ocupada
  const esSillaEspecialOcupada = (posicion) => {
    if (!esSillaEspecial(posicion)) return false;
    
    // Contar cuántas sillas especiales hay antes de esta posición
    const sillasEspecialesAnteriores = sillasEspeciales.filter(pos => pos <= posicion + 1).length;
    
    // Si hay personas con necesidades especiales, ocupan las sillas especiales en orden
    return sillasEspecialesAnteriores <= (invitadosEspeciales || 0);
  };

  const posicionesSillas = [
    { top: '10%', left: '50%', transform: 'translateX(-50%)' }, // Posición 1
    { top: '25%', right: '20%', transform: 'translate(50%, -50%)' }, // Posición 2
    { top: '50%', right: '5%', transform: 'translateY(-50%)' }, // Posición 3
    { bottom: '25%', right: '20%', transform: 'translate(50%, 50%)' }, // Posición 4
    { bottom: '10%', left: '50%', transform: 'translateX(-50%)' }, // Posición 5
    { bottom: '25%', left: '20%', transform: 'translate(-50%, 50%)' }, // Posición 6
    { top: '50%', left: '5%', transform: 'translateY(-50%)' }, // Posición 7
    { top: '25%', left: '20%', transform: 'translate(-50%, -50%)' }, // Posición 8
  ];

  const handleDrop = (e) => {
    e.preventDefault();
    const invitadoData = JSON.parse(e.dataTransfer.getData('text/plain'));
    if (onDrop) {
      onDrop(numeroMesa, invitadoData);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Calcular estadísticas de sillas especiales
  const totalSillasEspeciales = sillasEspeciales ? sillasEspeciales.length : 0;
  const sillasEspecialesOcupadas = Math.min(invitadosEspeciales || 0, totalSillasEspeciales);
  const sillasEspecialesDisponibles = totalSillasEspeciales - sillasEspecialesOcupadas;

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* Sillas alrededor de la mesa */}
      {posicionesSillas.slice(0, capacidadMaxima).map((posicion, index) => {
        const esSillaEspecialPos = esSillaEspecial(index);
        const estaOcupada = esSillaEspecialPos ? esSillaEspecialOcupada(index) : index < invitadosAsignados;
        
        return (
          <div
            key={index}
            className={`absolute w-4 h-4 transition-all duration-300 flex items-center justify-center border-2 ${
              esSillaEspecialPos 
                ? estaOcupada
                  ? 'bg-blue-600 border-blue-700 rounded' // Silla especial ocupada
                  : 'bg-blue-100 border-blue-400 rounded' // Silla especial disponible
                : estaOcupada
                  ? getColorSilla(index) + ' rounded-full border-transparent' // Silla normal ocupada
                  : 'bg-gray-200 border-gray-300 rounded-full' // Silla normal disponible
            }`}
            style={posicion}
            title={
              esSillaEspecialPos 
                ? `Silla especial ${estaOcupada ? 'ocupada' : 'disponible'} (Posición ${index + 1})`
                : `Silla normal ${estaOcupada ? 'ocupada' : 'disponible'} (Posición ${index + 1})`
            }
          >
            {/* Icono de accesibilidad para sillas especiales */}
            {esSillaEspecialPos && (
              <Accessibility 
                className={`w-3 h-3 ${estaOcupada ? 'text-white' : 'text-blue-600'}`} 
              />
            )}
          </div>
        );
      })}
      
      {/* Mesa central */}
      <div
        className={`border-dashed rounded-full w-20 h-20 flex flex-col items-center justify-center text-center p-2 shadow-lg border-2 transition-all duration-300 cursor-pointer hover:scale-105 bg-white dark:bg-gray-800 ${
          totalSillasEspeciales > 0 ? 'border-blue-500' : 'border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className={`font-bold text-sm ${getColorTexto()}`}>
          Mesa {numeroMesa}
        </div>
        <div className={`text-xs ${getColorTexto()}`}>
          {invitadosAsignados}/{capacidadMaxima}
        </div>
        
        {/* Información de sillas especiales */}
        {totalSillasEspeciales > 0 && (
          <div className="text-xs text-blue-600 font-medium mt-1">
            🦽 {sillasEspecialesOcupadas}/{totalSillasEspeciales}
          </div>
        )}
      </div>

      {/* Indicador de mesa con sillas especiales */}
      {totalSillasEspeciales > 0 && (
        <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-1 shadow-lg">
          <Accessibility className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Etiqueta informativa al hacer hover */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          {totalSillasEspeciales > 0 
            ? `Mesa con ${totalSillasEspeciales} silla(s) especial(es)` 
            : 'Mesa estándar'
          }
        </div>
      </div>
    </div>
  );
};

export default Mesa;