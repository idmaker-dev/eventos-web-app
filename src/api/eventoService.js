// apiEventosClient.js
// Cliente Axios para consumir los endpoints de eventos (con JWT en headers)

import axios from "axios";

// Ajusta esta URL si tu función corre en otro puerto/host
const BASE_URL = "http://localhost:7071/api/eventos";

// Token JWT inicial (el que nos mandaste). Puedes cambiarlo en tiempo de ejecución
let JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1mcWRjOXQwbjlrYWhvbzBsIiwiZW1haWwiOiJkYW5pZWxAZXhhbXBsZS5jb20iLCJyb2wiOiJhZG1pbiIsImlhdCI6MTc1ODI2MTg4MCwiZXhwIjoxNzU4MjY1NDgwfQ.Ch-LkOpiVsu1_oTFQeYuxbuC4N03S6U9HTe8-V9ET84";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${JWT_TOKEN}`,
  },
});

/**
 * Reemplaza el token usado por el cliente (útil para login dinámico)
 * @param {string} token
 */
export function setToken(token) {
  JWT_TOKEN = token;
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

/**
 * Elimina el token del cliente
 */
export function clearToken() {
  JWT_TOKEN = null;
  delete api.defaults.headers.common["Authorization"];
}

/**
 * Obtener todos los eventos
 * GET http://localhost:7071/api/eventos
 */
export async function getAllEventos() {
  try {
    const res = await api.get(""); // baseURL ya apunta a /api/eventos
    return res.data; // { success, data, message }
  } catch (error) {
    handleAxiosError(error);
  }
}

/**
 * Obtener evento por id
 * GET http://localhost:7071/api/eventos/{id}
 */
export async function getEventoById(id) {
  try {
    const res = await api.get(`/${id}`);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

/**
 * Crear evento
 * POST http://localhost:7071/api/eventos/crear
 * @param {Object} evento
 */
export async function createEvento(evento) {
  try {
    const res = await api.post(`/crear`, evento);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

/**
 * Actualizar evento
 * PUT http://localhost:7071/api/eventos/actualizar/{id}
 * @param {string} id
 * @param {Object} evento
 */
export async function updateEvento(id, evento) {
  try {
    const res = await api.put(`/actualizar/${id}`, evento);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

/**
 * Eliminar evento
 * DELETE http://localhost:7071/api/eventos/eliminar/{id}
 * @param {string} id
 */
export async function deleteEvento(id) {
  try {
    const res = await api.delete(`/eliminar/${id}`);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

// Manejo centralizado de errores para dar mensajes claros
function handleAxiosError(error) {
  if (error.response) {
    // El servidor respondió con un estado fuera de 2xx
    const status = error.response.status;
    const data = error.response.data;
    throw new Error(`API Error: ${status} - ${JSON.stringify(data)}`);
  } else if (error.request) {
    // La petición se hizo pero no hubo respuesta
    throw new Error("No hubo respuesta del servidor. Verifica que la API esté corriendo.");
  } else {
    // Algo pasó al configurar la petición
    throw new Error(`Error en la petición: ${error.message}`);
  }
}

// Export por defecto útil para importar todo junto
export default {
  setToken,
  clearToken,
  getAllEventos,
  getEventoById,
  createEvento,
  updateEvento,
  deleteEvento,
};

