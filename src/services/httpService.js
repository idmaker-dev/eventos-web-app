import axios from "axios";
import EnvConfig from "../utils/config";

/**
 * Cliente HTTP centralizado con interceptors para manejo automático de tokens
 * Funciona como middleware para todas las peticiones de la aplicación
 */
class HttpService {
  constructor() {
    // Crear instancia de Axios con configuración base
    this.api = axios.create({
      baseURL: EnvConfig.FULL_API_URL,
      timeout: 60000, // 60 segundos
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Configurar interceptors
    this.setupInterceptors();

    if (EnvConfig.DEBUG_MODE) {
      console.log(
        "🌐 HttpService initialized with base URL:",
        EnvConfig.FULL_API_URL
      );
    }
  }

  /**
   * Configurar interceptors para requests y responses
   */
  setupInterceptors() {
    // REQUEST INTERCEPTOR - Se ejecuta antes de cada petición
    this.api.interceptors.request.use(
      (config) => {
        // Obtener token del localStorage
        const token = this.getToken();

        // Agregar token al header si existe
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Agregar timestamp para debugging
        if (EnvConfig.DEBUG_MODE) {
          config.metadata = { startTime: new Date().getTime() };
          console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            data: config.data,
            params: config.params,
          });
        }

        return config;
      },
      (error) => {
        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Request interceptor error:", error);
        }
        return Promise.reject(error);
      }
    );

    // RESPONSE INTERCEPTOR - Se ejecuta después de cada respuesta
    this.api.interceptors.response.use(
      (response) => {
        // Logging de debugging
        if (EnvConfig.DEBUG_MODE && response.config.metadata) {
          const duration =
            new Date().getTime() - response.config.metadata.startTime;
          console.log(
            `✅ ${response.config.method?.toUpperCase()} ${
              response.config.url
            } (${duration}ms)`,
            {
              status: response.status,
              data: response.data,
            }
          );
        }

        return response;
      },
      (error) => {
        if (EnvConfig.DEBUG_MODE) {
          const duration = error.config?.metadata
            ? new Date().getTime() - error.config.metadata.startTime
            : 0;
          console.error(
            `❌ ${error.config?.method?.toUpperCase()} ${
              error.config?.url
            } (${duration}ms)`,
            {
              status: error.response?.status,
              data: error.response?.data,
              message: error.message,
            }
          );
        }

        // Manejo específico de errores de autenticación
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }

        // Manejo específico de errores de servidor
        if (error.response?.status >= 500) {
          this.handleServerError(error);
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  /**
   * Obtener token del localStorage
   */
  getToken() {
    return localStorage.getItem("userToken");
  }

  /**
   * Establecer token (usado después del login)
   */
  setToken(token) {
    if (token) {
      localStorage.setItem("userToken", token);
    } else {
      localStorage.removeItem("userToken");
    }
  }

  /**
   * Manejo de errores 401 (No autorizado)
   */
  handleUnauthorized() {
    // Limpiar token inválido
    this.setToken(null);
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");

    // Redirigir al login si no estamos ya allí
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }

    if (EnvConfig.DEBUG_MODE) {
      console.warn("🔐 Token expired or invalid, redirecting to login");
    }
  }

  /**
   * Manejo de errores de servidor (5xx)
   */
  handleServerError(error) {
    if (EnvConfig.DEBUG_MODE) {
      console.error("🔥 Server error:", error.response?.data);
    }

    // Aquí puedes agregar notificaciones toast, logging a servicios externos, etc.
    // this.notificationService.error('Error del servidor. Intenta nuevamente.');
  }

  /**
   * Normalizar errores para uso consistente en la app
   */
  normalizeError(error) {
    const normalized = {
      message: error.message || "Error desconocido",
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      isNetworkError: !error.response,
      isServerError: error.response?.status >= 500,
      isClientError:
        error.response?.status >= 400 && error.response?.status < 500,
      originalError: error,
    };

    // Mensajes más amigables para el usuario
    if (normalized.isNetworkError) {
      normalized.userMessage =
        "No se pudo conectar con el servidor. Verifica tu conexión.";
    } else if (normalized.status === 401) {
      normalized.userMessage =
        "Sesión expirada. Por favor inicia sesión nuevamente.";
    } else if (normalized.status === 403) {
      normalized.userMessage = "No tienes permisos para realizar esta acción.";
    } else if (normalized.status === 404) {
      normalized.userMessage = "El recurso solicitado no fue encontrado.";
    } else if (normalized.isServerError) {
      normalized.userMessage =
        "Error del servidor. Intenta nuevamente más tarde.";
    } else {
      normalized.userMessage = normalized.data?.message || normalized.message;
    }

    return normalized;
  }

  // ===== MÉTODOS HTTP =====

  /**
   * GET request
   */
  async get(url, config = {}) {
    const response = await this.api.get(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post(url, data = {}, config = {}) {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put(url, data = {}, config = {}) {
    const response = await this.api.put(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch(url, data = {}, config = {}) {
    const response = await this.api.patch(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete(url, config = {}) {
    const response = await this.api.delete(url, config);
    return response.data;
  }

  // ===== MÉTODOS ESPECIALES =====

  /**
   * Upload de archivos
   */
  async upload(url, file, onUploadProgress = null, additionalData = {}) {
    const formData = new FormData();
    formData.append("file", file);

    // Agregar datos adicionales
    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: onUploadProgress
        ? (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        : undefined,
    };

    const response = await this.api.post(url, formData, config);
    return response.data;
  }

  /**
   * Download de archivos
   */
  async download(url, filename = null, config = {}) {
    const response = await this.api.get(url, {
      ...config,
      responseType: "blob",
    });

    // Crear enlace de descarga
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    return response.data;
  }

  /**
   * Request con reintento automático
   */
  async withRetry(requestFn, maxRetries = 3, delay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        if (EnvConfig.DEBUG_MODE) {
          console.warn(
            `🔄 Request failed (attempt ${attempt}/${maxRetries}):`,
            error.userMessage
          );
        }

        // No reintentar en errores de cliente (4xx)
        if (error.isClientError) {
          throw error;
        }

        // Esperar antes del siguiente intento
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError;
  }

  // ===== UTILIDADES =====

  /**
   * Cancelar todas las peticiones pendientes
   */
  cancelAllRequests() {
    // Implementar lógica de cancelación si es necesario
    if (EnvConfig.DEBUG_MODE) {
      console.log("🛑 All pending requests cancelled");
    }
  }

  /**
   * Obtener información de salud de la API
   */
  async healthCheck() {
    try {
      const response = await this.get("/health");
      return { healthy: true, ...response };
    } catch (error) {
      return { healthy: false, error: error.userMessage };
    }
  }
}

// Crear instancia singleton
const httpService = new HttpService();

export default httpService;
