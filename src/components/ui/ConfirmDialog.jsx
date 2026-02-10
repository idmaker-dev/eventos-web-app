import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

/**
 * ConfirmDialog - Modal de confirmación personalizado
 * Reemplaza window.confirm() con un diseño consistente con la app
 */
const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar acción",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning" // "warning" | "info" | "success"
}) => {
  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(true);
    onClose(true);
  };

  const handleCancel = () => {
    onClose(false);
  };

  const icons = {
    warning: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
    info: <AlertTriangle className="w-12 h-12 text-blue-500" />,
    success: <CheckCircle className="w-12 h-12 text-green-500" />
  };

  const colors = {
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-700',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-700',
      button: 'bg-green-600 hover:bg-green-700'
    }
  };

  const style = colors[type] || colors.warning;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        {/* Header con icono */}
        <div className={`flex flex-col items-center pt-6 pb-4 px-6 ${style.bg} border-b ${style.border} rounded-t-xl`}>
          {icons[type]}
          <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
            {title}
          </h3>
        </div>

        {/* Mensaje */}
        <div className="p-6">
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line text-center leading-relaxed">
            {message}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2.5 ${style.button} text-white rounded-lg font-medium transition-colors`}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
