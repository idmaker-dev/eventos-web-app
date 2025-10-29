import React, { useState } from "react";
import InlineSpinner from "../components/ui/InlineSpinner";
import CambioPasswordObligatorio from "../components/Modales/CambioPasswordObligatorio";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../contexts/NotificationContext";
import "../styles/pages/Login.css";
import { Eye, EyeOff, User, Lock, Heart } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, changePassword, isLoading: authLoading } = useAuth();
  const { showError, showSuccess } = useNotifications();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  
  // Leer el flag de localStorage en lugar de usar state local
  const debeCambiarPassword = localStorage.getItem("debe_cambiar_password") === "true";
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(debeCambiarPassword);

  // Debug: observar cambios en showPasswordChangeModal
  React.useEffect(() => {
    console.log("🔍 showPasswordChangeModal cambió a:", showPasswordChangeModal);
  }, [showPasswordChangeModal]);

  // Efecto para sincronizar el modal con localStorage
  React.useEffect(() => {
    const debeCambiar = localStorage.getItem("debe_cambiar_password") === "true";
    if (debeCambiar && !showPasswordChangeModal) {
      console.log("🔧 Abriendo modal desde useEffect");
      setShowPasswordChangeModal(true);
    }
  }, [showPasswordChangeModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }
    
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Verificar si debe cambiar contraseña
        if (result.debe_cambiar_password) {
          console.log("✅ Debe cambiar contraseña - Abriendo modal");
          setTimeout(() => {
            setShowPasswordChangeModal(true);
          }, 0);
          return;
        }
        
        // Si no debe cambiar contraseña, proceder con la navegación normal
        showSuccess("¡Bienvenido! Has iniciado sesión exitosamente");
        
        // Obtener la ruta de origen si existe (desde ProtectedRoute)
        const from = location.state?.from?.pathname || '/';
        const userRol = result.user.rol;
        const isAdminRoute = from.startsWith('/admin');

        if (userRol === 'admin') {
          navigate('/admin', { replace: true });
        } else if (userRol === 'lugar') {
          // Siempre dirigir a /lugar, ignorando from si era admin o raíz
          navigate('/lugar', { replace: true });
        } else if (from !== '/' && from !== '/login' && !isAdminRoute) {
          navigate(from, { replace: true });
        } else {
          navigate('/');
        }
      } else {
        showError(result.error || "Error al iniciar sesión");
        setErrors({ submit: result.error || "Error al iniciar sesión. Intenta nuevamente." });
      }
    } catch (error) {
      const errorMessage = "Error de conexión. Verifica tu conexión a internet.";
      showError(errorMessage);
      setErrors({ submit: errorMessage });
    }
  };

  const handlePasswordChanged = async (currentPassword, newPassword) => {
    setPasswordChangeLoading(true);
    
    console.log("🔐 handlePasswordChanged recibió:", {
      currentPassword: currentPassword ? "***" : "vacío",
      newPassword: newPassword ? "***" : "vacío",
      currentPasswordLength: currentPassword?.length,
      newPasswordLength: newPassword?.length,
    });
    
    try {
      const result = await changePassword(currentPassword, newPassword);
      
      if (result.success) {
        showSuccess("¡Contraseña cambiada exitosamente! Redirigiendo...");
        setShowPasswordChangeModal(false);
        
        // Obtener rol del usuario para navegar
        const userRole = localStorage.getItem("userRole") || 'lugar';
        const from = location.state?.from?.pathname || '/';
        const isAdminRoute = from.startsWith('/admin');

        // Limpiar cualquier flag residual
        localStorage.removeItem("debe_cambiar_password");
        localStorage.removeItem("pending_user_data");

        setTimeout(() => {
          if (userRole === 'admin') {
            navigate('/admin', { replace: true });
          } else if (userRole === 'lugar') {
            navigate('/lugar', { replace: true });
          } else if (from !== '/' && from !== '/login' && !isAdminRoute) {
            navigate(from, { replace: true });
          } else {
            navigate('/');
          }
        }, 1000);
      } else {
        showError(result.error || "Error al cambiar la contraseña");
      }
    } catch (error) {
      showError("Error al cambiar la contraseña. Intenta nuevamente.");
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-decoration"></div>
        <div className="login-decoration-2"></div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Heart className="login-heart-icon" />
            <h1>Planoria</h1>
          </div>
          <p className="login-subtitle">Inicia sesión para gestionar tu evento perfecto</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="email" className="login-label">
              Email
            </label>
            <div className="login-input-wrapper">
              <User className="login-input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`login-input ${errors.email ? 'error' : ''}`}
                placeholder="tu-email@ejemplo.com"
                disabled={authLoading}
              />
            </div>
            {errors.email && <span className="login-error">{errors.email}</span>}
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">
              Contraseña
            </label>
            <div className="login-input-wrapper">
              <Lock className="login-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`login-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                disabled={authLoading}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={togglePasswordVisibility}
                disabled={authLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className="login-error">{errors.password}</span>}
          </div>

          {errors.submit && (
            <div className="login-submit-error">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            className={`login-submit ${authLoading ? 'loading' : ''}`}
            disabled={authLoading}
            aria-busy={authLoading}
          >
            {authLoading ? (
              <span className="flex items-center gap-2 justify-center">
                <InlineSpinner size="sm" />
                <span>Iniciando...</span>
              </span>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-demo-info">
            <strong>Demo:</strong> Usa cualquier email válido. 
            Para admin usa un email que contenga "admin".
          </p>
          <p className="login-help">
            ¿Problemas para acceder? <button type="button" className="login-link" onClick={() => alert('Contacta a soporte en: soporte@eventplanner.com')}>Contacta soporte</button>
          </p>
        </div>
      </div>

      {/* Modal de cambio de contraseña obligatorio */}
      <CambioPasswordObligatorio
        open={showPasswordChangeModal}
        onPasswordChanged={handlePasswordChanged}
        loading={passwordChangeLoading}
      />
    </div>
  );
}