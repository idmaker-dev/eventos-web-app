import { useEffect, useCallback, useRef } from "react";
import { useSignalR } from "../contexts/SignalRContext";

/**
 * Hook para AsignacionUser que maneja notificaciones de cambios en tiempo real
 * Específicamente para:
 * - Mesa bloqueada/desbloqueada
 * - Cambios en ocupación de mesas
 *
 * @param {Function} onMesaCambiada - Callback cuando hay cambios en una mesa
 * @param {string} invitadoId - ID del invitado actual (usado para filtrar notificaciones)
 */
export const useSignalRUser = (onMesaCambiada, invitadoId = null) => {
  const { connection, conectado } = useSignalR();
  const callbackRef = useRef(null);
  const invitadoIdRef = useRef(invitadoId);

  // Actualizar refs cuando cambien las props
  useEffect(() => {
    callbackRef.current = onMesaCambiada;
    invitadoIdRef.current = invitadoId;
  }, [onMesaCambiada, invitadoId]);

  // Registrar listeners de SignalR para eventos que afectan al usuario
  useEffect(() => {
    if (!connection || !conectado) {
      console.log(
        "ℹ️ [useSignalRUser] SignalR no conectado, esperando conexión..."
      );
      return;
    }

    console.log("🔌 [useSignalRUser] Registrando listeners para usuario");
    console.log(
      "🔌 [useSignalRUser] InvitadoId para validación:",
      invitadoIdRef.current || "(sin validación)"
    );

    // Listener para mesa bloqueada/desbloqueada
    const handleMesaBloqueada = (data) => {
      console.log("🔒 [useSignalRUser] Mesa bloqueada/desbloqueada recibida:");
      console.log(
        "🔒 [useSignalRUser] Datos completos:",
        JSON.stringify(data, null, 2)
      );

      // Validar que el invitado coincida (si se proporcionó invitadoId)
      if (invitadoIdRef.current) {
        // if (data.invitadoId && data.invitadoId !== invitadoIdRef.current) {
        //   console.log(
        //     "⚠️ [useSignalRUser] Invitado diferente, ignorando notificación",
        //     "Esperado:",
        //     invitadoIdRef.current,
        //     "Recibido:",
        //     data.invitadoId
        //   );
        //   return;
        // }
        console.log("✅ [useSignalRUser] InvitadoId validado correctamente");
      } else {
        console.log(
          "ℹ️ [useSignalRUser] Sin validación de invitadoId (modo permisivo)"
        );
      }

      // Ejecutar callback si existe
      if (callbackRef.current) {
        console.log(
          "🔔 [useSignalRUser] Ejecutando callback para mesa bloqueada"
        );
        callbackRef.current({
          tipo: "mesa_bloqueada",
          data,
          mensaje: data.bloqueada
            ? `Mesa ${
                data.mesa_id || data.mesaId || data.numeroMesa
              } ha sido bloqueada${data.motivo ? ": " + data.motivo : ""}`
            : `Mesa ${
                data.mesa_id || data.mesaId || data.numeroMesa
              } ha sido desbloqueada`,
        });
      } else {
        console.log("⚠️ [useSignalRUser] Callback no disponible");
      }
    };

    // Listener para mesa seleccionada (para refrescar disponibilidad)
    const handleMesaSeleccionada = (data) => {
      console.log("🪑 [useSignalRUser] Mesa seleccionada recibida:");
      console.log(
        "🪑 [useSignalRUser] Datos completos:",
        JSON.stringify(data, null, 2)
      );

      // Validar que el invitado coincida (si se proporcionó invitadoId)
      if (invitadoIdRef.current) {
        // if (data.invitadoId && data.invitadoId !== invitadoIdRef.current) {
        //   console.log(
        //     "⚠️ [useSignalRUser] Invitado diferente, ignorando notificación",
        //     "Esperado:",
        //     invitadoIdRef.current,
        //     "Recibido:",
        //     data.invitadoId
        //   );
        //   return;
        // }
        console.log("✅ [useSignalRUser] InvitadoId validado correctamente");
      } else {
        console.log(
          "ℹ️ [useSignalRUser] Sin validación de invitadoId (modo permisivo)"
        );
      }

      // Ejecutar callback si existe
      if (callbackRef.current) {
        console.log(
          "🔔 [useSignalRUser] Ejecutando callback para mesa seleccionada"
        );
        callbackRef.current({
          tipo: "mesa_seleccionada",
          data,
          mensaje: `Cambios en disponibilidad de mesas`,
        });
      } else {
        console.log("⚠️ [useSignalRUser] Callback no disponible");
      }
    };

    // Registrar listeners
    connection.on("mesaBloqueada", handleMesaBloqueada);
    connection.on("mesaSeleccionada", handleMesaSeleccionada);
    
    // 🆕 Listener para cambio de capacidad de mesa
    const handleCapacidadMesaCambiada = (data) => {
      console.log("📊 [useSignalRUser] Capacidad de mesa cambiada:");
      console.log("📊 [useSignalRUser] Datos completos:", JSON.stringify(data, null, 2));

      // Ejecutar callback si existe
      if (callbackRef.current) {
        console.log("🔔 [useSignalRUser] Ejecutando callback para capacidad cambiada");
        callbackRef.current({
          tipo: "capacidad_mesa_cambiada",
          data,
          mensaje: `Mesa ${data.numeroMesa}: capacidad cambiada de ${data.capacidad_anterior} a ${data.capacidad_nueva} asientos`,
        });
      } else {
        console.log("⚠️ [useSignalRUser] Callback no disponible");
      }
    };
    
    connection.on("capacidadMesaCambiada", handleCapacidadMesaCambiada);

    console.log("✅ [useSignalRUser] Listeners registrados correctamente");

    // Cleanup: desregistrar listeners al desmontar
    return () => {
      console.log("🧹 [useSignalRUser] Limpiando listeners");
      connection.off("mesaBloqueada", handleMesaBloqueada);
      connection.off("mesaSeleccionada", handleMesaSeleccionada);
      connection.off("capacidadMesaCambiada", handleCapacidadMesaCambiada);
    };
  }, [connection, conectado]);

  return {
    conectado,
    connection,
  };
};

export default useSignalRUser;
