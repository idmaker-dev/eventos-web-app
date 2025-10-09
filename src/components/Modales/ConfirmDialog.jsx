import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

/**
 * ConfirmDialog
 * Props:
 * - open (bool)
 * - title (string)
 * - message (string | ReactNode)
 * - confirmLabel (string)
 * - cancelLabel (string)
 * - variant: 'danger' | 'default'
 * - loading (bool)
 * - onClose () => void
 * - onConfirm () => void
 */
export default function ConfirmDialog({
  open,
  title = 'Confirmar',
  message = '¿Estás seguro?',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  const colorClasses = variant === 'danger'
    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';

  const buttonDanger = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    : 'bg-[#206a73] hover:bg-[#155059] focus:ring-[#206a73]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#1f1f1f] shadow-xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pt-4 pb-2">
          <div className={`text-sm rounded-lg px-3 py-2 ${colorClasses}`}>
            {message}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex justify-end gap-3 bg-gray-50 dark:bg-[#242424] rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 transition ${buttonDanger}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Procesando...
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
