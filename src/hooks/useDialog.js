import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar diálogos de confirmación
 * Uso: const { showConfirm, ConfirmDialogComponent } = useConfirm();
 */
export const useConfirm = () => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'warning',
    resolver: null
  });

  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title: options.title || 'Confirmar acción',
        message: options.message || '',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        type: options.type || 'warning',
        resolver: resolve
      });
    });
  }, []);

  const handleClose = useCallback((confirmed) => {
    if (dialogState.resolver) {
      dialogState.resolver(confirmed);
    }
    setDialogState(prev => ({ ...prev, isOpen: false }));
  }, [dialogState.resolver]);

  return {
    showConfirm,
    dialogState,
    handleClose
  };
};

/**
 * Hook personalizado para manejar diálogos de prompt (input)
 * Uso: const { showPrompt, PromptDialogComponent } = usePrompt();
 */
export const usePrompt = () => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    placeholder: '',
    defaultValue: '',
    inputType: 'text',
    min: undefined,
    max: undefined,
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    validation: null,
    resolver: null
  });

  const showPrompt = useCallback((options) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title: options.title || 'Ingresa un valor',
        message: options.message || '',
        placeholder: options.placeholder || '',
        defaultValue: options.defaultValue || '',
        inputType: options.inputType || 'text',
        min: options.min,
        max: options.max,
        confirmText: options.confirmText || 'Aceptar',
        cancelText: options.cancelText || 'Cancelar',
        validation: options.validation || null,
        resolver: resolve
      });
    });
  }, []);

  const handleClose = useCallback((value) => {
    if (dialogState.resolver) {
      dialogState.resolver(value);
    }
    setDialogState(prev => ({ ...prev, isOpen: false }));
  }, [dialogState.resolver]);

  const handleSubmit = useCallback((value) => {
    if (dialogState.resolver) {
      dialogState.resolver(value);
    }
  }, [dialogState.resolver]);

  return {
    showPrompt,
    dialogState,
    handleClose,
    handleSubmit
  };
};
