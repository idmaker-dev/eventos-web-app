import React, { useState } from 'react';
import { Accessibility, X } from 'lucide-react';
import { Button } from '@headlessui/react';

const ModalSillasEspeciales = ({ isOpen, onClose, onConfirm, tipoMesa, capacidadMesa }) => {
  const [tieneSillasEspeciales, setTieneSillasEspeciales] = useState(false);
  const [posicionesSeleccionadas, setPosicionesSeleccionadas] = useState([]);

  const handlePosicionToggle = (posicion) => {
    setPosicionesSeleccionadas(prev => 
      prev.includes(posicion) 
        ? prev.filter(p => p !== posicion)
        : [...prev, posicion]
    );
  };

  const handleConfirmar = () => {
    onConfirm(tieneSillasEspeciales ? posicionesSeleccionadas : []);
    handleCerrar();
  };

  const handleCerrar = () => {
    setTieneSillasEspeciales(false);
    setPosicionesSeleccionadas([]);
    onClose();
  };

  if (!isOpen) return null;

  // Generar posiciones según el tipo de mesa
  const posiciones = Array.from({ length: capacidadMesa }, (_, i) => i + 1);

  // Descripción de posiciones para mesa redonda (8 asientos)
  const descripcionesMesaRedonda = {
    1: 'Arriba',
    2: 'Arriba Derecha', 
    3: 'Derecha',
    4: 'Abajo Derecha',
    5: 'Abajo',
    6: 'Abajo Izquierda',
    7: 'Izquierda',
    8: 'Arriba Izquierda'
  };

  // Descripción de posiciones para mesa rectangular (10 asientos)
  const descripcionesMesaRectangular = {
    1: 'Superior Izquierda',
    2: 'Superior Centro',
    3: 'Superior Derecha',
    4: 'Derecha Superior',
    5: 'Derecha Inferior',
    6: 'Inferior Derecha',
    7: 'Inferior Centro',
    8: 'Inferior Izquierda',
    9: 'Izquierda Inferior',
    10: 'Izquierda Superior'
  };

  const descripciones = tipoMesa === 'mesa' ? descripcionesMesaRedonda : descripcionesMesaRectangular;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-casal/30 rounded-full flex items-center justify-center">
              <Accessibility className="w-6 h-6 text-casal" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Configurar Sillas Especiales
              </h3>
              <p className="text-gray-600 text-sm">
                Mesa {tipoMesa === 'mesa' ? 'Redonda' : 'Rectangular'} - {capacidadMesa} asientos
              </p>
            </div>
          </div>
          <button
            onClick={handleCerrar}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pregunta inicial */}
        <div className="mb-6">
          <p className="text-lg font-medium text-gray-800 mb-4">
            ¿Esta mesa tendrá sillas especiales para personas con movilidad reducida?
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={() => {
                setTieneSillasEspeciales(true);
                setPosicionesSeleccionadas([]);
              }}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                tieneSillasEspeciales
                  ? 'border-casal/80 bg-casal/20 text-casal'
                  : 'border-gray-300 hover:border-casal/80 text-gray-700 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Accessibility className="w-5 h-5" />
                <span className="font-medium">Sí, tendrá sillas especiales</span>
              </div>
            </button>
            
            <button
              onClick={() => {
                setTieneSillasEspeciales(false);
                setPosicionesSeleccionadas([]);
              }}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                !tieneSillasEspeciales
                  ? 'border-Acapulco bg-Acapulco/20 text-casal'
                  : 'border-gray-300 hover:border-Acapulco text-gray-700 hover:shadow-md'
              }`}
            >
              <span className="font-medium">No, solo sillas regulares</span>
            </button>
          </div>
        </div>

        {/* Selección de posiciones */}
        {tieneSillasEspeciales && (
          <div className="mb-6">
            <p className="text-lg font-medium text-gray-800 mb-4">
              Selecciona las posiciones para las sillas especiales:
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {posiciones.map(posicion => (
                <button
                  key={posicion}
                  onClick={() => handlePosicionToggle(posicion)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    posicionesSeleccionadas.includes(posicion)
                      ? 'border-Acapulco bg-fondoVs text-casal'
                      : 'border-gray-300 hover:border-amber-400 text-gray-700 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 flex items-center justify-center ${
                      posicionesSeleccionadas.includes(posicion)
                        ? 'bg-Acapulco rounded-lg'
                        : 'bg-gray-300 rounded-lg'
                    }`}>
                      {posicionesSeleccionadas.includes(posicion) && (
                        <Accessibility className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">Posición {posicion}</div>
                      <div className="text-xs text-gray-500">
                        {descripciones[posicion]}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {posicionesSeleccionadas.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Seleccionadas:</strong> {posicionesSeleccionadas.length} silla(s) especial(es) 
                  en posicion(es): {posicionesSeleccionadas.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleCerrar}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            className="px-6 py-2 bg-casal text-white rounded-lg hover:bg-casal/80 transition-colors"
          >
            Confirmar y Agregar Mesa
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalSillasEspeciales;