import { useState, useEffect, useCallback } from "react";
import eventService from "../services/eventService";
import { useAuth } from "./useAuth";
import EnvConfig from "../utils/config";

/**
 * Hook personalizado para manejar eventos
 * Proporciona funcionalidades CRUD y manejo de estado para eventos
 */
export const useEventos = () => {
  // Estados del hook
  const [eventos, setEventos] = useState([]);
  const [eventoActual, setEventoActual] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  // Estados para operaciones específicas
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Hooks externos
  const { user, isAuthenticated } = useAuth();

  /**
   * Cargar todos los eventos del usuario
   */
  const cargarEventos = useCallback(async () => {
    if (!isAuthenticated) {
      setEventos([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Cargando eventos...");
      }

      const result = await eventService.getEvents();

      if (result.success) {
        setEventos(result.events);

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ Eventos cargados:", result.events.length);
        }
      } else {
        setError(result.error);
        setEventos([]);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error al cargar eventos:", result.error);
        }
      }
    } catch (error) {
      const errorMessage = "Error al cargar eventos";
      setError(errorMessage);
      setEventos([]);

      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error inesperado al cargar eventos:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Cargar un evento específico
   */
  const cargarEvento = useCallback(async (eventoId) => {
    if (!eventoId) {
      setEventoActual(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Cargando evento:", eventoId);
      }

      const result = await eventService.getEvent(eventoId);

      if (result.success) {
        setEventoActual(result.event);

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ Evento cargado:", result.event);
        }

        return result.event;
      } else {
        setError(result.error);
        setEventoActual(null);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error al cargar evento:", result.error);
        }

        return null;
      }
    } catch (error) {
      const errorMessage = "Error al cargar evento";
      setError(errorMessage);
      setEventoActual(null);

      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error inesperado al cargar evento:", error);
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Crear un nuevo evento
   */
  const crearEvento = useCallback(
    async (datosEvento) => {
      setIsCreating(true);
      setError(null);

      try {
        if (EnvConfig.DEBUG_MODE) {
          console.log("🔄 Creando evento:", datosEvento);
        }

        // Validar datos requeridos
        const erroresValidacion = validarDatosEvento(datosEvento);
        if (erroresValidacion.length > 0) {
          setError(`Datos inválidos: ${erroresValidacion.join(", ")}`);
          setIsCreating(false);
          return { success: false, error: "Datos inválidos" };
        }

        // Preparar datos del evento
        const eventoParaCrear = {
          instituto: datosEvento.instituto,
          licenciatura: datosEvento.licenciatura,
          nombreEvento: datosEvento.nombreEvento,
          lugar_id: datosEvento.lugar_id,
          fechaHora: datosEvento.fechaHora,
          cantidadMaximaAsistentes: parseInt(datosEvento.cantidadMaximaAsistentes) || 0,
          cantidadMinimaAsistentes: parseInt(datosEvento.cantidadMinimaAsistentes) || 0,
          responsable: datosEvento.responsable,
          // Agregar datos adicionales
          usuarioId: user?.id,
          fechaCreacion: new Date().toISOString(),
          estado: "activo",
          costo: parseFloat(datosEvento.costo) || 0,
          fechas: datosEvento.fechas || [],
          requiere_tutor: datosEvento.requiere_tutor || false,
        };

        const result = await eventService.createEvent(eventoParaCrear);

        if (result.success) {
          // Actualizar lista de eventos
          setEventos((prev) => [...prev, result.event]);
          setEventoActual(result.event);

          if (EnvConfig.DEBUG_MODE) {
            console.log("✅ Evento creado exitosamente:", result.event);
          }

          return {
            success: true,
            evento: result.event,
            message: result.message,
          };
        } else {
          setError(result.error);

          if (EnvConfig.DEBUG_MODE) {
            console.error("❌ Error al crear evento:", result.error);
          }

          return { success: false, error: result.error };
        }
      } catch (error) {
        const errorMessage = "Error al crear evento";
        setError(errorMessage);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error inesperado al crear evento:", error);
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsCreating(false);
      }
    },
    [user]
  );

  /**
   * Actualizar un evento existente
   */
  const actualizarEvento = useCallback(
    async (eventoId, datosEvento) => {
      setIsUpdating(true);
      setError(null);

      try {
        if (EnvConfig.DEBUG_MODE) {
          console.log("🔄 Actualizando evento:", eventoId, datosEvento);
        }

        const result = await eventService.updateEvent(eventoId, datosEvento);

        if (result.success) {
          // Actualizar lista de eventos
          setEventos((prev) =>
            prev.map((evento) =>
              evento.id === eventoId ? result.event : evento
            )
          );

          // Actualizar evento actual si es el mismo
          if (eventoActual?.id === eventoId) {
            setEventoActual(result.event);
          }

          if (EnvConfig.DEBUG_MODE) {
            console.log("✅ Evento actualizado:", result.event);
          }

          return {
            success: true,
            evento: result.event,
            message: result.message,
          };
        } else {
          setError(result.error);

          if (EnvConfig.DEBUG_MODE) {
            console.error("❌ Error al actualizar evento:", result.error);
          }

          return { success: false, error: result.error };
        }
      } catch (error) {
        const errorMessage = "Error al actualizar evento";
        setError(errorMessage);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error inesperado al actualizar evento:", error);
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsUpdating(false);
      }
    },
    [eventoActual]
  );

  /**
   * Eliminar un evento
   */
  const eliminarEvento = useCallback(
    async (eventoId) => {
      setIsDeleting(true);
      setError(null);

      try {
        if (EnvConfig.DEBUG_MODE) {
          console.log("🔄 Eliminando evento:", eventoId);
        }

        const result = await eventService.deleteEvent(eventoId);

        if (result.success) {
          // Remover de la lista de eventos
          setEventos((prev) => prev.filter((evento) => evento.id !== eventoId));

          // Limpiar evento actual si es el mismo
          if (eventoActual?.id === eventoId) {
            setEventoActual(null);
          }

          if (EnvConfig.DEBUG_MODE) {
            console.log("✅ Evento eliminado exitosamente");
          }

          return { success: true, message: result.message };
        } else {
          setError(result.error);

          if (EnvConfig.DEBUG_MODE) {
            console.error("❌ Error al eliminar evento:", result.error);
          }

          return { success: false, error: result.error };
        }
      } catch (error) {
        const errorMessage = "Error al eliminar evento";
        setError(errorMessage);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error inesperado al eliminar evento:", error);
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsDeleting(false);
      }
    },
    [eventoActual]
  );

  /**
   * Cargar estadísticas de un evento
   */
  const cargarEstadisticas = useCallback(async (eventoId) => {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Cargando estadísticas del evento:", eventoId);
      }

      const result = await eventService.getEventStats(eventoId);

      if (result.success) {
        setStats((prev) => ({
          ...prev,
          [eventoId]: result.stats,
        }));

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ Estadísticas cargadas:", result.stats);
        }

        return result.stats;
      } else {
        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error al cargar estadísticas:", result.error);
        }

        return {};
      }
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error inesperado al cargar estadísticas:", error);
      }

      return {};
    }
  }, []);

  /**
   * Subir imagen del evento
   */
  const subirImagen = useCallback(
    async (eventoId, archivo, onProgress = null) => {
      setIsUploading(true);
      setError(null);

      try {
        if (EnvConfig.DEBUG_MODE) {
          console.log("🔄 Subiendo imagen para evento:", eventoId);
        }

        const result = await eventService.uploadEventImage(
          eventoId,
          archivo,
          onProgress
        );

        if (result.success) {
          // Actualizar evento con nueva imagen
          const eventoActualizado = {
            ...eventoActual,
            imagenUrl: result.imageUrl,
          };

          setEventoActual(eventoActualizado);

          // Actualizar en la lista
          setEventos((prev) =>
            prev.map((evento) =>
              evento.id === eventoId
                ? { ...evento, imagenUrl: result.imageUrl }
                : evento
            )
          );

          if (EnvConfig.DEBUG_MODE) {
            console.log("✅ Imagen subida exitosamente:", result.imageUrl);
          }

          return {
            success: true,
            imageUrl: result.imageUrl,
            message: result.message,
          };
        } else {
          setError(result.error);

          if (EnvConfig.DEBUG_MODE) {
            console.error("❌ Error al subir imagen:", result.error);
          }

          return { success: false, error: result.error };
        }
      } catch (error) {
        const errorMessage = "Error al subir imagen";
        setError(errorMessage);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error inesperado al subir imagen:", error);
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsUploading(false);
      }
    },
    [eventoActual]
  );

  /**
   * Limpiar errores
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Limpiar evento actual
   */
  const limpiarEventoActual = useCallback(() => {
    setEventoActual(null);
  }, []);

  // Cargar eventos al montar el componente o cambiar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      setEventos([]);
      setEventoActual(null);
      return;
    }
    if (user?.rol !== "admin") {
      // Usuarios no admin no gestionan lista global de eventos aquí
      setEventos([]);
      setEventoActual(null);
      return;
    }
    cargarEventos();
  }, [isAuthenticated, user?.rol, cargarEventos]);

  // Retornar API del hook
  return {
    // Estados
    eventos,
    eventoActual,
    isLoading,
    error,
    stats,

    // Estados de operaciones
    isCreating,
    isUpdating,
    isDeleting,
    isUploading,

    // Métodos CRUD
    cargarEventos,
    cargarEvento,
    crearEvento,
    actualizarEvento,
    eliminarEvento,

    // Métodos adicionales
    cargarEstadisticas,
    subirImagen,
    limpiarError,
    limpiarEventoActual,

    // Métodos de utilidad
    obtenerEventoPorId: (id) => eventos.find((evento) => evento.id === id),
    obtenerEventosActivos: () =>
      eventos.filter((evento) => evento.estado === "activo"),
    cantidadEventos: eventos.length,
    tieneEventos: eventos.length > 0,
  };
};

/**
 * Función para validar datos del evento
 */
const validarDatosEvento = (datos) => {
  const errores = [];

  if (!datos.instituto?.trim()) {
    errores.push("Nombre de institución requerido");
  }

  if (!datos.licenciatura?.trim()) {
    errores.push("Licenciatura requerida");
  }

  if (!datos.nombreEvento?.trim()) {
    errores.push("Nombre del evento requerido");
  }

  if (!datos.lugar_id?.trim()) {
    errores.push("Lugar del evento requerido");
  }

  if (!datos.fechaHora?.trim()) {
    errores.push("Fecha y hora requeridas");
  }

  if (!datos.responsable?.trim()) {
    errores.push("Responsable requerido");
  }

  if (datos.cantidadAsistentes && isNaN(parseInt(datos.cantidadAsistentes))) {
    errores.push("Cantidad de asistentes debe ser un número");
  }

  return errores;
};

export default useEventos;
