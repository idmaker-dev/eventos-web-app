import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Clock, Users, Calendar } from "lucide-react";
import React, { useState, useEffect } from "react";

export default function ModalEspera({ open, usuario, horario }) {
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [horaActual, setHoraActual] = useState(new Date());

  // Actualizar hora actual
  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calcular tiempo restante
  useEffect(() => {
    const calcular = () => {
      const ahora = new Date();
      const [h, m] = horario.inicio.split(':');
      const inicio = new Date();
      inicio.setHours(parseInt(h), parseInt(m), 0, 0);
      
      const diferencia = inicio - ahora;
      setTiempoRestante(Math.max(0, diferencia));
    };

    calcular();
    const interval = setInterval(calcular, 1000);
    return () => clearInterval(interval);
  }, [horario]);

  const formatearTiempo = (ms) => {
    if (ms <= 0) return "00:00";
    const minutos = Math.floor(ms / 60000);
    const segundos = Math.floor((ms % 60000) / 1000);
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onClose={() => {}} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-center text-white rounded-t-2xl">
            <div className="text-4xl mb-2">⏳</div>
            <DialogTitle className="text-xl font-bold">En Fila de Asignación</DialogTitle>
            <p className="text-blue-100 text-sm">Tu turno llegará pronto</p>
          </div>

          {/* Contenido */}
          <div className="p-6">
            {/* Info usuario */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-gray-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Hola, {usuario.nombre}
              </h2>
              <p className="text-gray-600 text-sm">
                Estás en la fila para seleccionar tu mesa
              </p>
            </div>

            {/* Horario */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tu Horario de Asignación
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Horario:</span>
                  <span className="font-medium">{horario.inicio} - {horario.fin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duración:</span>
                  <span className="font-medium">{horario.duracionMinutos} minutos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hora actual:</span>
                  <span className="font-mono font-medium">
                    {horaActual.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Contador */}
            {tiempoRestante > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-800 mb-2">Tiempo hasta tu turno:</p>
                <div className="text-3xl font-mono font-bold text-blue-600">
                  {formatearTiempo(tiempoRestante)}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 text-center rounded-b-2xl">
            <p className="text-xs text-gray-500">
              Sistema de Asignación de Mesas • Mantén esta ventana abierta
            </p>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}