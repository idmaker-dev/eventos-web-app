import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, CreditCard, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MetodoPagoModal({ isOpen, onClose, invitadoId, selectedIds, total }) {
  const navigate = useNavigate();

  const handleMetodoSeleccionado = (metodo) => {
    if (metodo === 'clabe') {
      navigate(`/checkout/${invitadoId}`, {
        state: {
          selectedIds: Array.from(selectedIds),
          total: total
        }
      });
    } else if (metodo === 'tarjeta') {
      navigate(`/pago-tarjeta/${invitadoId}`, {
        state: {
          selectedIds: Array.from(selectedIds),
          total: total
        }
      });
    }
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold text-casal"
                  >
                    Selecciona el método de pago
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Opción CLABE */}
                  <button
                    onClick={() => handleMetodoSeleccionado('clabe')}
                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-casal hover:bg-casal/5 transition-all group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-casal/10 rounded-full flex items-center justify-center group-hover:bg-casal/20 transition-colors">
                      <Building2 className="w-6 h-6 text-casal" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-gray-900 group-hover:text-casal transition-colors">
                        Transferencia bancaria
                      </h4>
                      <p className="text-sm text-gray-600">
                        Obtén tu CLABE única para transferir
                      </p>
                    </div>
                  </button>

                  {/* Opción Tarjeta */}
                  <button
                    onClick={() => handleMetodoSeleccionado('tarjeta')}
                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-casal hover:bg-casal/5 transition-all group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-casal/10 rounded-full flex items-center justify-center group-hover:bg-casal/20 transition-colors">
                      <CreditCard className="w-6 h-6 text-casal" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-gray-900 group-hover:text-casal transition-colors">
                        Pago con tarjeta
                      </h4>
                      <p className="text-sm text-gray-600">
                        Paga de forma segura con tu tarjeta
                      </p>
                    </div>
                  </button>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total a pagar:</span>
                    <span className="text-xl font-bold text-casal">
                      ${total?.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
