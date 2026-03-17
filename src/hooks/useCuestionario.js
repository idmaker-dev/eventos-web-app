import { useState, useCallback } from "react";
import cuestService from "../services/cuestService";

export const useCuestionario = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [invitadoActual, setInvitadoActual] = useState(null);

  const crearInvitado = useCallback(async (datos) => {
    setIsCreating(true);
    setError(null);

    try {
      const result = await cuestService.createInvitado(datos);

      if (result.success) {
        setInvitadoActual(result.invitado);
        return {
          success: true,
          invitado: result.invitado,
          message: result.message,
        };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const msg = "Error al crear graduado";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsCreating(false);
    }
  }, []);

  return {
    crearInvitado,
    isCreating,
    error,
    invitadoActual,
  };
};

export default useCuestionario;
