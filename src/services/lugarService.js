import httpService from "./httpService";

/**
 * Servicio de lugares
 * Maneja todas las operaciones relacionadas con la gestión de lugares
 */
class LugarService {
  /**
   * Obtener todos los lugares activos
   */
  async getLugares() {
    try {
      const response = await httpService.get("/lugares/activos/list");

      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al cargar lugares",
        data: [],
      };
    }
  }

  /**
   * Crear nuevo lugar
   */
  async crearLugar(lugarData) {
    try {
      const response = await httpService.post("/lugares/crear", lugarData);

      return {
        success: true,
        data: response.data || response,
        message: "Lugar creado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al crear lugar",
      };
    }
  }

  /**
   * Actualizar lugar
   */
  async actualizarLugar(id, lugarData) {
    try {
      const response = await httpService.put(`/lugares/${id}`, lugarData);

      return {
        success: true,
        data: response.data || response,
        message: "Lugar actualizado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al actualizar lugar",
      };
    }
  }

  /**
   * Eliminar (desactivar) lugar
   */
  async eliminarLugar(id) {
    try {
      await httpService.patch(`/lugares/${id}/desactivar`);

      return {
        success: true,
        message: "Lugar eliminado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al eliminar lugar",
      };
    }
  }
}

// Crear instancia singleton
const lugarService = new LugarService();

export default lugarService;
