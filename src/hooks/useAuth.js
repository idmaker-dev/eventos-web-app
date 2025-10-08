import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import EnvConfig from "../utils/config";
import authService from "../services/authService";

// Contexto de autenticación
const AuthContext = createContext();

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Verificar si hay un token guardado al cargar la aplicación
  useEffect(() => {
    const loadUserFromStorage = async () => {
      const token = localStorage.getItem("userToken");
      const userRole = localStorage.getItem("userRole");
      const userEmail = localStorage.getItem("userEmail");
      const userId = localStorage.getItem("userId"); // ✅ Recuperar ID del usuario

      if (token) {
        // Construir objeto user desde localStorage
        const userData = {
          id: userId, // ✅ Incluir ID en el objeto user
          token,
          rol: userRole,
          email: userEmail || "usuario@ejemplo.com",
        };

        if (EnvConfig.DEBUG_MODE) {
          console.log("🔍 Loading user from localStorage:", userData);
        }

        setUser(userData);
        setIsAuthenticated(true);

        // TODO: Opcional - verificar si el token es válido con el servidor
        // try {
        //   const result = await authService.getProfile();
        //   if (result.success) {
        //     // Token válido, actualizar con datos del servidor
        //     setUser({
        //       ...result.user,
        //       token,
        //       rol: result.user.rol || userRole,
        //       email: result.user.email || userEmail,
        //     });
        //   }
        // } catch (error) {
        //   if (EnvConfig.DEBUG_MODE) {
        //     console.warn("⚠️ No se pudo verificar token con servidor:", error);
        //   }
        // }
      }

      setIsLoading(false);
    };

    loadUserFromStorage();
  }, []);

  // Función de login
  const login = async (email, password) => {
    setIsLoading(true);

    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔐 Attempting login with:", {
          email,
          apiUrl: EnvConfig.FULL_API_URL,
        });
      }

      // Usar el servicio de autenticación
      const result = await authService.login(email, password);

      if (result.success) {
        console.log("🔍 Auth service result:", result);
        console.log("🔍 User from auth service:", result.user);

        // Guardar datos del usuario en localStorage
        localStorage.setItem("userToken", result.token);
        localStorage.setItem("userRole", result.user.rol);
        localStorage.setItem("userEmail", result.user.email);
        localStorage.setItem("userId", result.user.id); // ✅ Guardar ID del usuario

        // Actualizar estado
        const userData = {
          ...result.user,
          token: result.token,
        };
        setUser(userData);
        setIsAuthenticated(true);

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ Login successful:", {
            rol: result.user.rol,
            redirectUrl:
              result.user.rol === "admin"
                ? EnvConfig.ADMIN_URL
                : EnvConfig.BASE_URL,
          });
        }

        setIsLoading(false);
        return { success: true, user: userData };
      } else {
        setIsLoading(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Login failed:", error);
      }
      setIsLoading(false);
      return { success: false, error: "Error al iniciar sesión" };
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      // Intentar cerrar sesión en el servidor
      await authService.logout();
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.warn("⚠️ Error al cerrar sesión en servidor:", error);
      }
    } finally {
      // Limpiar datos locales independientemente del resultado
      localStorage.removeItem("userToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId"); // ✅ Limpiar ID del usuario
      setUser(null);
      setIsAuthenticated(false);
      navigate("/login");
    }
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return user?.rol === role;
  };

  // Verificar si el usuario está autenticado y tiene uno de los roles especificados
  const hasAnyRole = (roles) => {
    return isAuthenticated && roles.includes(user?.rol);
  };

  // Función para registrar un nuevo usuario
  const register = async (userData) => {
    setIsLoading(true);

    try {
      const result = await authService.register(userData);

      if (result.success) {
        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ Registration successful");
        }
        setIsLoading(false);
        return { success: true, message: result.message };
      } else {
        setIsLoading(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Registration failed:", error);
      }
      setIsLoading(false);
      return { success: false, error: "Error al registrar usuario" };
    }
  };

  // Función para recuperar contraseña
  const forgotPassword = async (email) => {
    setIsLoading(true);

    try {
      const result = await authService.forgotPassword(email);
      setIsLoading(false);
      return result;
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Forgot password failed:", error);
      }
      setIsLoading(false);
      return {
        success: false,
        error: "Error al solicitar recuperación de contraseña",
      };
    }
  };

  // Función para restablecer contraseña
  const resetPassword = async (token, newPassword) => {
    setIsLoading(true);

    try {
      const result = await authService.resetPassword(token, newPassword);
      setIsLoading(false);
      return result;
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Reset password failed:", error);
      }
      setIsLoading(false);
      return { success: false, error: "Error al restablecer contraseña" };
    }
  };

  // Función para actualizar el perfil del usuario
  const updateProfile = async (profileData) => {
    setIsLoading(true);

    try {
      const result = await authService.updateProfile(profileData);

      if (result.success) {
        // Actualizar usuario en el estado local
        setUser((prevUser) => ({
          ...prevUser,
          ...result.user,
        }));

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ Profile updated successfully");
        }
      }

      setIsLoading(false);
      return result;
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Update profile failed:", error);
      }
      setIsLoading(false);
      return { success: false, error: "Error al actualizar perfil" };
    }
  };

  // Función para refrescar el token
  const refreshToken = async () => {
    try {
      const result = await authService.refreshToken();

      if (result.success) {
        localStorage.setItem("userToken", result.token);
        setUser((prevUser) => ({
          ...prevUser,
          token: result.token,
        }));
        return { success: true };
      } else {
        // Token inválido, cerrar sesión
        logout();
        return { success: false };
      }
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Token refresh failed:", error);
      }
      logout();
      return { success: false };
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    updateProfile,
    refreshToken,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }

  return context;
};

// Hook para redireccionar si no está autenticado
export const useRequireAuth = (redirectTo = "/login") => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
};

// Hook para redireccionar si no tiene el rol requerido
export const useRequireRole = (requiredRole, redirectTo = "/") => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/login");
      } else if (user?.rol !== requiredRole) {
        navigate(redirectTo);
      }
    }
  }, [user, isAuthenticated, isLoading, navigate, requiredRole, redirectTo]);

  return {
    hasAccess: isAuthenticated && user?.rol === requiredRole,
    isLoading,
  };
};

export default useAuth;
