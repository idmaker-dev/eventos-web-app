import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../contexts/NotificationContext";
import "../styles/pages/Login.css";
import { Eye, EyeOff, User, Lock, Heart } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading: authLoading } = useAuth();
  const { showError, showSuccess } = useNotifications();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

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
        showSuccess("¡Bienvenido! Has iniciado sesión exitosamente");
        
        // Obtener la ruta de origen si existe (desde ProtectedRoute)
        const from = location.state?.from?.pathname || '/';
        
        // Redirigir a la ruta de origen o según el rol
        if (from !== '/' && from !== '/login') {
          navigate(from, { replace: true });
        } else if (result.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
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
          >
            {authLoading ? (
              <div className="login-spinner"></div>
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
    </div>
  );
}