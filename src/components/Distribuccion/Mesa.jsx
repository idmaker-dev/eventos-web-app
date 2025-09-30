import React from 'react';

const Mesa = ({ numeroMesa, invitadosAsignados = 0, capacidadMaxima = 8, onDrop }) => {
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
      // Silla ocupada - usar el mismo esquema de colores que la mesa
      if (porcentajeOcupacion <= 50) return 'bg-blue-500';
      if (porcentajeOcupacion <= 80) return 'bg-yellow-500';
      if (porcentajeOcupacion < 100) return 'bg-orange-500';
      return 'bg-green-500';
    }
    return 'bg-gray-300'; // Silla vacía
  };

  // Posiciones de las sillas alrededor de la mesa (en grados)
  const posicionesSillas = [
    { top: '10%', left: '50%', transform: 'translateX(-50%)' }, // Arriba
    { top: '25%', right: '20%', transform: 'translate(50%, -50%)' }, // Arriba derecha
    { top: '50%', right: '5%', transform: 'translateY(-50%)' }, // Derecha
    { bottom: '25%', right: '20%', transform: 'translate(50%, 50%)' }, // Abajo derecha
    { bottom: '10%', left: '50%', transform: 'translateX(-50%)' }, // Abajo
    { bottom: '25%', left: '20%', transform: 'translate(-50%, 50%)' }, // Abajo izquierda
    { top: '50%', left: '5%', transform: 'translateY(-50%)' }, // Izquierda
    { top: '25%', left: '20%', transform: 'translate(-50%, -50%)' }, // Arriba izquierda
  ];

  // Manejar el drop de invitados
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
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* Sillas alrededor de la mesa */}
      {posicionesSillas.slice(0, capacidadMaxima).map((posicion, index) => (
        <div
          key={index}
          className={`absolute w-4 h-4 rounded-full transition-all duration-300 ${getColorSilla(index)}`}
          style={posicion}
        />
      ))}
      
      {/* Mesa central */}
      <div
        className={`mesa rounded-full w-24 h-24 flex flex-col items-center justify-center text-center p-2 shadow-lg border-2 transition-all duration-300 cursor-pointer hover:scale-105 ${getColorMesa()}`}
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

export default Mesa;