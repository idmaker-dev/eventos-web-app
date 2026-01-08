// obtener el historial de acciones de un invitado específico
import httpService from "./httpService";

class HistorialAccionesService {
  async getHistorialPorParametros(registro_id, user_id, acciones, modulos) {
    try {
      const response = await httpService.get(`/historial-acciones?registro_id=${registro_id}&user_id=${user_id}&acciones=${acciones}&modulos=${modulos}`);
      
      return response.data || response;
    } catch (error) {
      throw error;
    }
  }
}

const historialAccionesService = new HistorialAccionesService();

export default historialAccionesService;
