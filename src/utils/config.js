// Configuración centralizada de variables de entorno
// Todas las variables de entorno de React deben empezar con REACT_APP_

class EnvConfig {
  // API Configuration
  static get API_URL() {
    return (
      process.env.REACT_APP_API_URL ||
      "https://eventosapi-v2.azurewebsites.net/api"
    );
  }

  static get API_VERSION() {
    return process.env.REACT_APP_API_VERSION || "v1";
  }

  static get FULL_API_URL() {
    return `${this.API_URL}/${this.API_VERSION}`;
  }

  // Authentication
  static get JWT_SECRET() {
    return process.env.REACT_APP_JWT_SECRET || "default-secret";
  }

  static get TOKEN_EXPIRY() {
    return process.env.REACT_APP_TOKEN_EXPIRY || "24h";
  }

  // Base URLs
  static get BASE_URL() {
    return process.env.REACT_APP_BASE_URL || window.location.origin;
  }

  static get ADMIN_URL() {
    return process.env.REACT_APP_ADMIN_URL || `${this.BASE_URL}/admin`;
  }

  // Feature Flags
  static get ENABLE_ANALYTICS() {
    return process.env.REACT_APP_ENABLE_ANALYTICS === "true";
  }

  static get ENABLE_DARK_MODE() {
    return process.env.REACT_APP_ENABLE_DARK_MODE !== "false"; // Default true
  }

  static get ENABLE_NOTIFICATIONS() {
    return process.env.REACT_APP_ENABLE_NOTIFICATIONS !== "false"; // Default true
  }

  // Third-party Services
  static get GOOGLE_MAPS_API_KEY() {
    return process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  }

  static get STRIPE_PUBLIC_KEY() {
    return process.env.REACT_APP_STRIPE_PUBLIC_KEY;
  }

  static get FIREBASE_CONFIG() {
    try {
      return JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG || "{}");
    } catch {
      return {};
    }
  }

  // Development
  static get DEBUG_MODE() {
    return (
      process.env.REACT_APP_DEBUG_MODE === "true" ||
      process.env.NODE_ENV === "development"
    );
  }

  static get LOG_LEVEL() {
    return process.env.REACT_APP_LOG_LEVEL || "info";
  }

  // Environment
  static get ENVIRONMENT() {
    return (
      process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV || "development"
    );
  }

  static get IS_DEVELOPMENT() {
    return this.ENVIRONMENT === "development";
  }

  static get IS_PRODUCTION() {
    return this.ENVIRONMENT === "production";
  }

  // Validation
  static validateRequiredEnvVars() {
    const required = ["REACT_APP_API_URL"];

    const missing = required.filter((envVar) => !process.env[envVar]);

    if (missing.length > 0) {
      console.warn("⚠️ Missing required environment variables:", missing);
    }

    return missing.length === 0;
  }

  // Debug helper
  static logConfig() {
    if (this.DEBUG_MODE) {
      console.group("🔧 Environment Configuration");
      console.log("Environment:", this.ENVIRONMENT);
      console.log("API URL:", this.FULL_API_URL);
      console.log("Base URL:", this.BASE_URL);
      console.log("Debug Mode:", this.DEBUG_MODE);
      console.log("Dark Mode:", this.ENABLE_DARK_MODE);
      console.log("Analytics:", this.ENABLE_ANALYTICS);
      console.log("Notifications:", this.ENABLE_NOTIFICATIONS);
      console.groupEnd();
    }
  }
}

// Validar al importar
EnvConfig.validateRequiredEnvVars();

export default EnvConfig;
