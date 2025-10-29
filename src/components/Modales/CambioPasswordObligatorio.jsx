import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import InlineSpinner from '../ui/InlineSpinner';

/**
 * CambioPasswordObligatorio
 * Modal para cambio de contraseña obligatorio al primer inicio de sesión
 * 
 * Props:
 * - open (bool): controla si el modal está visible
 * - onPasswordChanged (function): callback cuando la contraseña se cambia exitosamente
 * - loading (bool): estado de carga durante el cambio
 */
export default function CambioPasswordObligatorio({
  open,
  onPasswordChanged,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Debug: observar cambios en open
  React.useEffect(() => {
    console.log("🔍 Modal CambioPasswordObligatorio - open:", open);
  }, [open]);

  if (!open) return null;

  // Validar fortaleza de contraseña
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const getStrengthColor = (strength) => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = (strength) => {
    if (strength < 40) return 'Débil';
    if (strength < 70) return 'Media';
    return 'Fuerte';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calcular fortaleza de la nueva contraseña
    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
    } else if (passwordStrength < 40) {
      newErrors.newPassword = 'La contraseña es muy débil';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la nueva contraseña';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (formData.currentPassword && formData.newPassword && 
        formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log("🔐 Datos del formulario de cambio de contraseña:", {
      currentPassword: formData.currentPassword ? "***" : "vacío",
      newPassword: formData.newPassword ? "***" : "vacío",
      confirmPassword: formData.confirmPassword ? "***" : "vacío",
    });
    
    if (!validateForm()) {
      console.log("❌ Validación fallida");
      return;
    }
    
    console.log("✅ Validación exitosa, llamando a onPasswordChanged");
    onPasswordChanged(formData.currentPassword, formData.newPassword);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#1f1f1f] shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Cambio de Contraseña Requerido
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Por seguridad, debes cambiar tu contraseña antes de continuar
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Contraseña Actual */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contraseña Actual
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPasswords.current ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full pl-10 pr-10 py-2.5 rounded-lg border ${
                  errors.currentPassword 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-[#206a73]'
                } bg-white dark:bg-[#2d2d2d] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 transition`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* Nueva Contraseña */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPasswords.new ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full pl-10 pr-10 py-2.5 rounded-lg border ${
                  errors.newPassword 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-[#206a73]'
                } bg-white dark:bg-[#2d2d2d] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 transition`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Barra de fortaleza */}
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Fortaleza:
                  </span>
                  <span className={`text-xs font-medium ${
                    passwordStrength < 40 ? 'text-red-600' : 
                    passwordStrength < 70 ? 'text-amber-600' : 
                    'text-green-600'
                  }`}>
                    {getStrengthLabel(passwordStrength)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>
            )}
            
            {errors.newPassword && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.newPassword}
              </p>
            )}
            
            {/* Requisitos de contraseña */}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p className="flex items-center gap-1">
                {formData.newPassword.length >= 8 ? (
                  <CheckCircle2 size={12} className="text-green-500" />
                ) : (
                  <AlertCircle size={12} className="text-gray-400" />
                )}
                Mínimo 8 caracteres
              </p>
              <p className="flex items-center gap-1">
                {/[a-z]/.test(formData.newPassword) && /[A-Z]/.test(formData.newPassword) ? (
                  <CheckCircle2 size={12} className="text-green-500" />
                ) : (
                  <AlertCircle size={12} className="text-gray-400" />
                )}
                Mayúsculas y minúsculas
              </p>
              <p className="flex items-center gap-1">
                {/\d/.test(formData.newPassword) ? (
                  <CheckCircle2 size={12} className="text-green-500" />
                ) : (
                  <AlertCircle size={12} className="text-gray-400" />
                )}
                Al menos un número
              </p>
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPasswords.confirm ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full pl-10 pr-10 py-2.5 rounded-lg border ${
                  errors.confirmPassword 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-[#206a73]'
                } bg-white dark:bg-[#2d2d2d] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 transition`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 rounded-lg bg-[#206a73] hover:bg-[#155059] text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#206a73] focus:ring-offset-2 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <InlineSpinner size="sm" />
                  <span>Cambiando contraseña...</span>
                </>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Cambiar Contraseña</span>
                </>
              )}
            </button>
            <p className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
              Esta acción es obligatoria para continuar
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
