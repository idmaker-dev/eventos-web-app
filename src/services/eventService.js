import httpService from "./httpService";

/**
 * Servicio de eventos
 * Maneja todas las operaciones relacionadas con la gestión de eventos
 */
class EventService {
  /**
   * Obtener todos los eventos del usuario
   */
  async getEvents() {
    try {
      const response = await httpService.get("/eventos");

      return {
        success: true,
        events: response.data || response,
        total: response.total || response.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
        events: [],
      };
    }
  }

  /**
   * Obtener un evento específico
   */
  async getEvent(eventId) {
    try {
      const response = await httpService.get(`/eventos/${eventId}`);

      return {
        success: true,
        event: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Obtener un evento específico para el cuestionario
   */
  async getEventCuestionario(eventId) {
    try {
      const response = await httpService.get(
        `/eventos/cuestionario/${eventId}`
      );

      return {
        success: true,
        event: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Crear nuevo evento
   */
  async createEvent(eventData) {
    try {
      const response = await httpService.post("/eventos/crear", eventData);

      return {
        success: true,
        event: response,
        message: "Evento creado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Actualizar evento
   */
  async updateEvent(eventId, eventData) {
    try {
      const response = await httpService.put(`/eventos/actualizar/${eventId}`, eventData);

      return {
        success: true,
        event: response.data || response,
        message: "Evento actualizado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Eliminar evento
   */
  async deleteEvent(eventId) {
    try {
      await httpService.delete(`/eventos/${eventId}`);

      return {
        success: true,
        message: "Evento eliminado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Obtener estadísticas del evento
   */
  async getEventStats(eventId) {
    try {
      const response = await httpService.get(`/eventos/${eventId}/stats`);

      return {
        success: true,
        stats: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
        stats: {},
      };
    }
  }

  /**
   * Obtener estadísticas del dashboard del evento
   */
  async getDashboardStats(eventId) {
    try {
      const response = await httpService.get(
        `/dashboard/evento?evento_id=${eventId}`
      );

      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
        data: null,
      };
    }
  }

  /**
   * Subir imagen del evento
   */
  async uploadEventImage(eventId, imageFile, onProgress = null) {
    try {
      const response = await httpService.upload(
        `/eventos/${eventId}/image`,
        imageFile,
        onProgress
      );

      return {
        success: true,
        imageUrl:
          response.imageUrl || (response.data && response.data.imageUrl),
        message: "Imagen subida exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Obtener deudas del evento
   */
  async getEventDebts(eventId) {
    try {
      const response = await httpService.get(
        `/eventos/deudas?evento_id=${eventId}`
      );

      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
        data: null,
      };
    }
  }

  /**
   * Obtener lugares disponibles para select
   */
  async getLugares() {
    try {
      const response = await httpService.get("/lugares/select/options");

      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
        data: [],
      };
    }
  }

  /**
   * Obtener estado de invitados y turnos por evento
   * Incluye estadísticas y lista de invitados agrupados por estado
   *
   * @param {string} eventId - ID del evento
   * @returns {Promise<Object>} - Estado completo de invitados con turnos
   */
  async getEstadoInvitados(eventId) {
    try {
      const response = await httpService.get(
        `/eventos/${eventId}/seleccion-mesas/estado-invitados`
      );

      return {
        success: true,
        data: response.data || response,
        estadisticas: response.data?.estadisticas || {},
        invitados: response.data?.invitados || [],
        porEstado: response.data?.por_estado || {},
      };
    } catch (error) {
      console.error("Error al obtener estado de graduados:", error);
      return {
        success: false,
        error: error.userMessage || "Error al cargar estado de graduados",
        data: null,
        estadisticas: {},
        invitados: [],
        porEstado: {},
      };
    }
  }

  /**
   * Bloquear o desbloquear una mesa
   *
   * @param {string} eventId - ID del evento
   * @param {string} mesaId - ID de la mesa (ej: "mesa-165")
   * @param {boolean} bloqueada - true para bloquear, false para desbloquear
   * @param {string} motivo - Motivo del bloqueo (opcional)
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async bloquearMesa(eventId, mesaId, bloqueada, motivo = "") {
    try {
      const url = `/eventos/${eventId}/seleccion-mesas/bloquear-mesa`;
      const payload = {
        mesa_id: mesaId,
        bloqueada,
        motivo,
      };

      console.log("🔒 [bloquearMesa] Datos de la petición:", {
        eventId,
        mesaId,
        bloqueada,
        motivo,
        url,
        payload,
      });

      const response = await httpService.post(url, payload);

      return {
        success: true,
        data: response.data || response,
        message: bloqueada
          ? "Mesa bloqueada exitosamente"
          : "Mesa desbloqueada exitosamente",
      };
    } catch (error) {
      console.error("Error al bloquear/desbloquear mesa:", error);
      return {
        success: false,
        error: error.userMessage || "Error al modificar estado de la mesa",
      };
    }
  }

  /**
   * Actualizar cantidad de boletos de un invitado
   * @param {string} invitadoId - ID del invitado
   * @param {number} nuevaCantidad - Nueva cantidad de boletos
   * @param {string} opcionProrrateo - Opción de prorrateo ('prorratear' o 'crear_nuevas')
   */
  async updateInvitadoBoletos(
    invitadoId,
    nuevaCantidad,
    opcionProrrateo = "crear_nuevas",
    ticket_id,
    accion
  ) {
    try {
      const response = await httpService.patch(
        `/invitadosAlumnos/${invitadoId}/boletos`,
        {
          id_invitado: invitadoId,
          nueva_cantidad_boletos: nuevaCantidad,
          opcion_prorrateo: opcionProrrateo,
          ticket_id: ticket_id,
          accion: accion,
        }
      );

      return {
        success: true,
        data: response.data || response,
        message: "Boletos actualizados correctamente",
      };
    } catch (error) {
      console.error("Error al actualizar boletos:", error);
      return {
        success: false,
        error: error?.data?.error || "Error al actualizar boletos",
      };
    }
  }

  /**
   * Eliminar un invitado/graduado
   * @param {string} invitadoId - ID del invitado a eliminar
   */
  async deleteInvitadoAlumnos(invitadoId) {
    try {
      const response = await httpService.delete(
        `/invitadosAlumnos/eliminar-alumno/${invitadoId}`
      );

      return {
        success: true,
        data: response.data || response,
        message: "Graduado eliminado exitosamente",
      };
    } catch (error) {
      console.error("Error al eliminar graduado:", error);
      return {
        success: false,
        error: error?.data?.error || error.userMessage || "Error al eliminar graduado",
      };
    }
  }

  /**
   * Aplicar devolución a un invitado
   * @param {string} invitadoId - ID del invitado
   * @param {number} monto - Monto de la devolución
   * @param {string} ticket_id - ID del ticket asociado
   * @param {string} accion - Acción de la devolución
   * @param {string} nombreSolicitante - Nombre de la persona que solicita la devolución
   */
  async devolucion(invitadoId, monto, ticket_id, accion, nombreSolicitante) {
    try {
      const response = await httpService.post(`/proceso-devolucion`, {
        monto: monto,
        id_invitado: invitadoId,
        ticket_id: ticket_id,
        accion: accion,
        nombre_solicitante: nombreSolicitante,
      });
      return response?.data || response;
    } catch (error) {
      console.error("Error al aplicar devolución:", error);
      throw error;
    }
  }

  /**
   * Exportar pagos de un evento por rango de fechas en formato CSV
   * @param {string} eventoId - ID del evento
   * @param {string} fechaInicio - Fecha de inicio en formato YYYY-MM-DD
   * @param {string} fechaFin - Fecha de fin en formato YYYY-MM-DD
   * @returns {Promise<Blob>} - Archivo CSV como Blob
   */
  async exportPaymentsByDateRange(eventoId, fechaInicio, fechaFin) {
    try {
      const blob = await httpService.get(
        `/eventos/${eventoId}/pagos/exportar?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`,
        { responseType: "blob" }
      );

      return {
        success: true,
        data: blob,
        message: "Pagos exportados exitosamente",
      };
    } catch (error) {
      console.error("Error al exportar pagos:", error);

      if (error.response?.data instanceof Blob) {
        const errorText = await error.response.data.text();
        try {
          const errorJson = JSON.parse(errorText);
          return { success: false, error: errorJson.message || "Error al exportar pagos" };
        } catch {
          return { success: false, error: errorText || "Error al exportar pagos" };
        }
      }

      return {
        success: false,
        error: error.userMessage || error.message || "Error al exportar pagos",
      };
    }
  }

  /**
   * Descargar reporte Excel de pagos por alumno para un evento.
   * Las columnas de facturas son dinámicas según la cantidad del evento.
   * @param {string} eventoId - ID del evento
   * @returns {Promise<{success: boolean, data?: Blob, error?: string}>}
   */
  async descargarReportePagosAlumnos(eventoId) {
    try {
      const blob = await httpService.get(
        `/eventos/${eventoId}/reporte-pagos`,
        { responseType: "blob" }
      );
      return { success: true, data: blob };
    } catch (error) {
      console.error("Error al descargar reporte de pagos:", error);
      if (error.response?.data instanceof Blob) {
        const errorText = await error.response.data.text();
        try {
          const errorJson = JSON.parse(errorText);
          return { success: false, error: errorJson.message || "Error al generar reporte" };
        } catch {
          return { success: false, error: errorText || "Error al generar reporte" };
        }
      }
      return { success: false, error: error.userMessage || error.message || "Error al generar reporte" };
    }
  }

  /**
   * Solicitar la cancelación de boletos (Módulo de Cancelaciones)
   * @param {Object} data - Datos de la cancelación (invitadoId, cantidad, banco, etc.)
   */
  async solicitarCancelacion(data) {
    try {
      const response = await httpService.post("/pagos/cancelar-boletos", data);

      return {
        success: true,
        data: response.data || response,
        message: "Solicitud de cancelación enviada correctamente",
      };
    } catch (error) {
      console.error("Error al solicitar cancelación:", error);
      return {
        success: false,
        error: error?.data?.error || error.userMessage || "Error al solicitar cancelación",
      };
    }
  }

  /**
   * Obtener el listado de cancelaciones de un invitado
   * @param {string} invitadoId - ID del invitado
   */
  async getCancelacionesPorInvitado(invitadoId) {
    try {
      const response = await httpService.get(
        `/pagos/cancelaciones?id_invitado=${invitadoId}`
      );

      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      console.error("Error al obtener cancelaciones:", error);
      return {
        success: false,
        error: error.userMessage || "Error al obtener cancelaciones",
        data: [],
      };
    }
  }

  /**
   * Editar solicitud de cancelación
   */
  async editarCancelacion(id, data) {
    try {
      const response = await httpService.put(`/pagos/cancelaciones/${id}`, data);
      return {
        success: true,
        data: response.data || response,
        message: "Cancelación actualizada exitosamente",
      };
    } catch (error) {
      console.error("Error al editar cancelación:", error);
      return {
        success: false,
        error: error?.data?.error || error.userMessage || "Error al editar cancelación",
      };
    }
  }

  /**
   * Obtener un invitado por ID
   */
  async getInvitadoById(id) {
    try {
      const response = await httpService.get(`/invitadosAlumnos/${id}`);
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      console.error("Error al obtener invitado:", error);
      return {
        success: false,
        error: error.userMessage || "Error al obtener invitado",
      };
    }
  }

  /**
   * Obtener deudas de un invitado especifico
   */
  async getDeudasByInvitado(invitadoId) {
    try {
      const response = await httpService.get(`/deudas?id_invitado=${invitadoId}`);
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      console.error("Error al obtener deudas del invitado:", error);
      return {
        success: false,
        error: error.userMessage || "Error al obtener deudas",
      };
    }
  }

  /**
   * Procesar/Confirmar devolución
   */
  async procesarDevolucion(id, data) {
    try {
      const response = await httpService.post(`/pagos/cancelaciones/${id}/procesar`, data);
      return {
        success: true,
        data: response.data || response,
        message: "Devolución procesada exitosamente",
      };
    } catch (error) {
      console.error("Error al procesar devolución:", error);
      return {
        success: false,
        error: error?.data?.error || error.userMessage || "Error al procesar devolución",
      };
    }
  }
}

// Crear instancia singleton
const eventService = new EventService();

export default eventService;
