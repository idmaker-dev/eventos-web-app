import httpService from "./httpService";

/**
 * Servicio de usuarios
 * Maneja todas las operaciones relacionadas con la gestión de usuarios
 */
class UserService {
  /** ================== ADMIN (CATÁLOGO DE USUARIOS) ================== */
  // Endpoints reales (según respuesta recibida):
  // GET    /usuarios/listar              -> lista usuarios (response: { success, data: { usuarios: [] }, total?, message })
  // POST   /usuarios/crear               -> crear usuario
  // PUT    /usuarios/:id                 -> actualizar usuario
  // PATCH  /usuarios/:id/desactivar      -> desactivar (soft delete / inactivar)
  // NOTA: Adaptamos parsing de forma resiliente por si el backend ajusta la forma.

  async getUsuarios() {
    try {
      const response = await httpService.get("/usuarios/listar");
      // response esperado: { success: true, data: { usuarios: [...] }, total?, message }
      const usuarios =
        response?.data?.usuarios || response?.usuarios || response?.data || [];
      const total = response?.total ?? usuarios.length;
      return {
        success: true,
        usuarios: Array.isArray(usuarios) ? usuarios : [],
        total,
        message: response?.message,
        raw: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al cargar usuarios",
        usuarios: [],
        total: 0,
      };
    }
  }

  async crearUsuario(data) {
    try {
      const response = await httpService.post("/usuarios/crear", data);
      return {
        success: response?.success !== false,
        data: response?.data || response,
        message: response?.message || "Usuario creado correctamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al crear usuario",
      };
    }
  }

  async actualizarUsuario(id, data) {
    try {
      const response = await httpService.put(`/usuarios/${id}`, data);
      return {
        success: response?.success !== false,
        data: response?.data || response,
        message: response?.message || "Usuario actualizado correctamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al actualizar usuario",
      };
    }
  }

  async desactivarUsuario(id) {
    try {
      const response = await httpService.delete(`/usuarios/${id}`);
      return {
        success: response?.success !== false,
        message: response?.message || "Usuario desactivado correctamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al desactivar usuario",
      };
    }
  }

  /**
   * Obtener perfil del usuario actual
   */
  async getProfile() {
    try {
      const response = await httpService.get("/user/profile");

      return {
        success: true,
        user: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  async updateProfile(userData) {
    try {
      const response = await httpService.put("/user/profile", userData);

      return {
        success: true,
        user: response,
        message: "Perfil actualizado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(passwordData) {
    try {
      await httpService.put("/user/change-password", passwordData);

      return {
        success: true,
        message: "Contraseña actualizada exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Subir avatar del usuario
   */
  async uploadAvatar(file) {
    try {
      const response = await httpService.upload("/user/avatar", file);

      return {
        success: true,
        avatarUrl: response.avatarUrl,
        message: "Avatar actualizado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Eliminar avatar del usuario
   */
  async deleteAvatar() {
    try {
      await httpService.delete("/user/avatar");

      return {
        success: true,
        message: "Avatar eliminado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Obtener configuraciones del usuario
   */
  async getSettings() {
    try {
      const response = await httpService.get("/user/settings");

      return {
        success: true,
        settings: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
        settings: {},
      };
    }
  }

  /**
   * Actualizar configuraciones del usuario
   */
  async updateSettings(settings) {
    try {
      const response = await httpService.put("/user/settings", settings);

      return {
        success: true,
        settings: response,
        message: "Configuraciones actualizadas exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Obtener notificaciones del usuario
   */
  async getNotifications(page = 1, limit = 20) {
    try {
      const response = await httpService.get(
        `/user/notifications?page=${page}&limit=${limit}`
      );

      return {
        success: true,
        notifications: response.data || response,
        total: response.total || response.length,
        pagination: response.pagination,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
        notifications: [],
      };
    }
  }

  /**
   * Marcar notificación como leída
   */
  async markNotificationAsRead(notificationId) {
    try {
      await httpService.patch(`/user/notifications/${notificationId}/read`);

      return {
        success: true,
        message: "Notificación marcada como leída",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllNotificationsAsRead() {
    try {
      await httpService.patch("/user/notifications/mark-all-read");

      return {
        success: true,
        message: "Todas las notificaciones marcadas como leídas",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Eliminar notificación
   */
  async deleteNotification(notificationId) {
    try {
      await httpService.delete(`/user/notifications/${notificationId}`);

      return {
        success: true,
        message: "Notificación eliminada exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Obtener actividad reciente del usuario
   */
  async getActivity(page = 1, limit = 20) {
    try {
      const response = await httpService.get(
        `/user/activity?page=${page}&limit=${limit}`
      );

      return {
        success: true,
        activities: response.data || response,
        total: response.total || response.length,
        pagination: response.pagination,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
        activities: [],
      };
    }
  }

  /**
   * Obtener estadísticas del usuario
   */
  async getUserStats() {
    try {
      const response = await httpService.get("/user/stats");

      return {
        success: true,
        stats: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
        stats: {
          totalEvents: 0,
          totalGuests: 0,
          activeEvents: 0,
          completedEvents: 0,
        },
      };
    }
  }

  /**
   * Configurar preferencias de notificaciones
   */
  async updateNotificationPreferences(preferences) {
    try {
      const response = await httpService.put(
        "/user/notification-preferences",
        preferences
      );

      return {
        success: true,
        preferences: response,
        message: "Preferencias de notificación actualizadas",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Obtener preferencias de notificaciones
   */
  async getNotificationPreferences() {
    try {
      const response = await httpService.get("/user/notification-preferences");

      return {
        success: true,
        preferences: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
        preferences: {},
      };
    }
  }

  /**
   * Desactivar cuenta temporalmente
   */
  async deactivateAccount(reason = "") {
    try {
      await httpService.post("/user/deactivate", { reason });

      return {
        success: true,
        message: "Cuenta desactivada exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Reactivar cuenta
   */
  async reactivateAccount() {
    try {
      await httpService.post("/user/reactivate");

      return {
        success: true,
        message: "Cuenta reactivada exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Solicitar eliminación de cuenta
   */
  async requestAccountDeletion(reason = "") {
    try {
      await httpService.post("/user/request-deletion", { reason });

      return {
        success: true,
        message:
          "Solicitud de eliminación enviada. Recibirás un email de confirmación.",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Confirmar eliminación de cuenta
   */
  async confirmAccountDeletion(token) {
    try {
      await httpService.post("/user/confirm-deletion", { token });

      return {
        success: true,
        message: "Cuenta eliminada exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }
}

// Crear instancia singleton
const userService = new UserService();

export default userService;
