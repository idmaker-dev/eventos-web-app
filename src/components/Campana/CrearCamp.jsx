import { Button, Dialog, DialogPanel } from '@headlessui/react';
import { useState, useEffect } from 'react';

export default function CrearCamp({ isOpen, onClose, onSuccess, tareaInicial }) {
  const [descripcion, setDescripcion] = useState(tareaInicial || '');

  useEffect(() => {
    if (tareaInicial) {
      setDescripcion(tareaInicial);
    }
  }, [tareaInicial]);

  const handleCrear = () => {
    if (descripcion.trim()) {
      const nuevaCampana = {
        id: Date.now(),
        title: descripcion,
        categoria: 'pregunta-frecuente'
      };
      onSuccess(nuevaCampana);
      onClose(); 
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-casal/20 backdrop-blur-sm" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl p-6">
          <h3 className="text-lg font-medium text-gray-400 dark:text-gray-300 mb-4">
            ¿Qué quieres automatizar?
          </h3>
          
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full h-24 p-3 text-gray-600 dark:text-gray-300 placeholder-gray-400 border-none outline-none resize-none bg-transparent"
            placeholder="Ej. Quiero realizar un flujo de respuestas automáticas de pagos"
          />
          
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleCrear}
              className="bg-casal text-xl font-semibold hover:bg-casal/90 text-white px-8 py-1.5 rounded-full font-medium transition-colors"
            >
              Crear
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}