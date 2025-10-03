import React from 'react';

const MesaRectangular = ({ numeroMesa, invitadosAsignados = 0, capacidadMaxima = 10, onDrop }) => {
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

  // Función para obtener el color de las sillas
  const getColorSilla = (indice) => {
    if (indice < invitadosAsignados) {
      // Silla ocupada 
      if (porcentajeOcupacion <= 50) return 'bg-blue-500';
      if (porcentajeOcupacion <= 80) return 'bg-yellow-500';
      if (porcentajeOcupacion < 100) return 'bg-orange-500';
      return 'bg-green-500';
    }
    return 'bg-gray-300'; // Silla vacía
  };

  // Posiciones de las sillas alrededor de la mesa rectangular (10 sillas)
  const posicionesSillas = [
    // Lado superior (3 sillas)
    { top: '5%', left: '25%', transform: 'translateX(-50%)' },
    { top: '5%', left: '50%', transform: 'translateX(-50%)' },
    { top: '5%', left: '75%', transform: 'translateX(-50%)' },
    
    // Lado derecho (2 sillas)
    { top: '35%', right: '5%', transform: 'translateY(-50%)' },
    { top: '65%', right: '5%', transform: 'translateY(-50%)' },
    
    // Lado inferior (3 sillas)
    { bottom: '5%', left: '75%', transform: 'translateX(-50%)' },
    { bottom: '5%', left: '50%', transform: 'translateX(-50%)' },
    { bottom: '5%', left: '25%', transform: 'translateX(-50%)' },
    
    // Lado izquierdo (2 sillas)
    { top: '65%', left: '5%', transform: 'translateY(-50%)' },
    { top: '35%', left: '5%', transform: 'translateY(-50%)' },
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

  return (
    <div className="relative w-48 h-32 flex items-center justify-center">
      {/* Sillas alrededor de la mesa */}
      {posicionesSillas.slice(0, capacidadMaxima).map((posicion, index) => (
        <div
          key={index}
          className={`absolute w-4 h-4 rounded-full transition-all duration-300 ${getColorSilla(index)}`}
          style={posicion}
        />
      ))}
      
      {/* Mesa rectangular central */}
      <div
        className={`rounded w-32 h-18 flex flex-col items-center justify-center text-center p-2 shadow-lg border-2 border-dashed transition-all duration-300 cursor-pointer hover:scale-105 ${getColorMesa()}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className={`font-bold text-sm ${getColorTexto()}`}>
          Mesa {numeroMesa}
        </div>
        <div className={`text-xs ${getColorTexto()}`}>
          {invitadosAsignados}/{capacidadMaxima}
        </div>
        
      </div>
    </div>
  );
};

export default MesaRectangular;