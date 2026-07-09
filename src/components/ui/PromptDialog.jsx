import React, { useEffect, useRef, useState } from 'react';
import { Edit3, X } from 'lucide-react';

/**
 * PromptDialog - Modal de input personalizado
 * Reemplaza window.prompt() con un diseño consistente con la app
 */
const PromptDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title = "Ingresa un valor",
  message,
  placeholder = "",
  defaultValue = "",
  inputType = "text", // "text" | "number"
  min,
  max,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  validation // función opcional de validación
}) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Resetear valor cuando se abre
  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setError("");
      // Auto-focus en el input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultValue]);

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    // Validación básica
    if (!value || value.toString().trim() === "") {
      setError("Este campo es requerido");
      return;
    }

    // Validación de números
    if (inputType === "number") {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        setError("Debe ser un número válido");
        return;
      }
      if (min !== undefined && numValue < min) {
        setError(`El valor debe ser al menos ${min}`);
        return;
      }
      if (max !== undefined && numValue > max) {
        setError(`El valor no puede ser mayor a ${max}`);
        return;
      }
    }

    // Validación personalizada
    if (validation) {
      const validationError = validation(value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Todo OK
    onSubmit(inputType === "number" ? Number(value) : value);
    onClose(value);
  };

  const handleCancel = () => {
    setValue(defaultValue);
    setError("");
    onClose(null);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Edit3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Mensaje */}
          {message && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
              {message}
            </p>
          )}

          {/* Input */}
          <div className="mb-4">
            <input
              ref={inputRef}
              type={inputType}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
              placeholder={placeholder}
              min={min}
              max={max}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all
                ${error 
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                }
                text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500`}
            />
            {error && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromptDialog;
