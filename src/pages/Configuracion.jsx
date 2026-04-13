import React, { useState, useEffect } from "react";
import { 
  MessageCircle, 
  Mail, 
  CreditCard, 
  Settings as SettingsIcon,
  Save,
  AlertCircle,
  Loader,
  Building2,
  Calendar,
  Globe,
  BotMessageSquare,
  Plus,
  Trash2
} from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";
import httpService from "../services/httpService";

/**
 * Página de configuración del sistema
 * Permite configurar WhatsApp, Email, Pagos (Toku) y opciones generales
 * Soporta configuración jerárquica: Global > Lugar > Evento
 */
export default function Configuracion() {
  const { showSuccess, showError } = useNotifications();

  // Estado para la tab activa
  const [tabActiva, setTabActiva] = useState("whatsapp");

  // Estados para scope jerárquico
  const [scope, setScope] = useState("global"); // "global" | "lugar" | "evento"
  const [lugarId, setLugarId] = useState("");
  const [eventoId, setEventoId] = useState("");
  
  // Listas para los dropdowns
  const [lugares, setLugares] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [cargandoLugares, setCargandoLugares] = useState(false);
  const [cargandoEventos, setCargandoEventos] = useState(false);

  // Estados para configuración
  const [configuracion, setConfiguracion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estados para formulario de WhatsApp
  const [whatsappData, setWhatsappData] = useState({
    numeroSoporte: "",
    habilitado: true,
    mensajesPredeterminados: {
      bienvenida: "",
      horarioAtencion: "",
    },
  });

  // Estados para formulario de Email (preparado para futuro)
  const [emailData, setEmailData] = useState({
    habilitado: true,
    mostrarBotonWhatsApp: true,
    remitente: "",
    nombreRemitente: "",
    firmaEmail: "",
  });

  // Estados para formulario de Toku (preparado para futuro)
  const [tokuData, setTokuData] = useState({
    monedaPredeterminada: "MXN",
    diasVencimientoFactura: 15,
  });

  // Estados para formulario General (preparado para futuro)
  const [generalData, setGeneralData] = useState({
    nombrePlataforma: "",
    urlBase: "",
    zonaHoraria: "",
  });

  // Estados para formulario de Bot
  const [botData, setBotData] = useState({
    preguntas_respuestas: [],
  });

  // Cargar configuración cuando cambian scope, lugarId o eventoId
  useEffect(() => {
    cargarConfiguracion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, lugarId, eventoId]);

  // Cargar lugares al montar
  useEffect(() => {
    cargarLugares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar eventos cuando cambia el lugar
  useEffect(() => {
    if (lugarId) {
      cargarEventos(lugarId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lugarId]);

  /**
   * Carga lugares desde el backend
   */
  const cargarLugares = async () => {
    try {
      setCargandoLugares(true);
      const response = await httpService.get("/lugares/activos/list");
      
      if (response.data) {
        setLugares(response.data.lugares || response.data || []);
      }
    } catch (error) {
      console.error("Error al cargar lugares:", error);
    } finally {
      setCargandoLugares(false);
    }
  };

  /**
   * Carga eventos de un lugar
   */
  const cargarEventos = async (lugarIdParam) => {
    try {
      setCargandoEventos(true);
      const response = await httpService.get(`/eventos?lugar_id=${lugarIdParam}`);
      
      if (response.data) {
        setEventos(response.data || []);
      }
    } catch (error) {
      console.error("Error al cargar eventos:", error);
      setEventos([]);
    } finally {
      setCargandoEventos(false);
    }
  };

  /**
   * Carga la configuración desde el backend según el scope seleccionado
   */
  const cargarConfiguracion = async () => {
    try {
      setCargando(true);

      // Construir query params según el scope
      const params = new URLSearchParams();
      params.append("scope", scope);
      params.append("resolved", "true"); // Obtener configuración con herencia

      if (scope === "lugar" && lugarId) {
        params.append("scopeId", lugarId);
      } else if (scope === "evento" && eventoId) {
        params.append("scopeId", eventoId);
        if (lugarId) {
          params.append("lugarId", lugarId);
        }
      }

      const response = await httpService.get(`/configuracion?${params.toString()}`);

      if (response.data) {
        const config = response.data;
        setConfiguracion(config);

        // Actualizar estados de formularios
        if (config.whatsapp) {
          setWhatsappData(config.whatsapp);
        }
        if (config.email) {
          setEmailData(config.email);
        }
        if (config.toku) {
          setTokuData(config.toku);
        }
        if (config.general) {
          setGeneralData(config.general);
        }
        if (config.bot) {
          setBotData(config.bot);
        } else {
          setBotData({ preguntas_respuestas: [] });
        }
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error);
      showError("Error al cargar la configuración del sistema");
    } finally {
      setCargando(false);
    }
  };

  /**
   * Guarda la configuración de WhatsApp según el scope seleccionado
   */
  const guardarWhatsApp = async () => {
    try {
      // Validaciones
      if (!whatsappData.numeroSoporte) {
        showError("El número de WhatsApp es requerido");
        return;
      }

      // Validar formato de número
      const numeroLimpio = whatsappData.numeroSoporte.replace(/\D/g, "");
      if (numeroLimpio.length < 10 || numeroLimpio.length > 15) {
        showError("El número debe tener entre 10 y 15 dígitos");
        return;
      }

      // Validar que se haya seleccionado lugar/evento si corresponde
      if (scope === "lugar" && !lugarId) {
        showError("Debes seleccionar un lugar");
        return;
      }
      if (scope === "evento" && !eventoId) {
        showError("Debes seleccionar un evento");
        return;
      }

      setGuardando(true);

      // Construir query params según el scope
      const params = new URLSearchParams();
      params.append("scope", scope);

      if (scope === "lugar" && lugarId) {
        params.append("scopeId", lugarId);
      } else if (scope === "evento" && eventoId) {
        params.append("scopeId", eventoId);
        if (lugarId) {
          params.append("lugarId", lugarId);
        }
      }

      const response = await httpService.put(
        `/configuracion/whatsapp?${params.toString()}`,
        whatsappData
      );

      if (response.data) {
        setConfiguracion(response.data);
        showSuccess(
          `Configuración de WhatsApp guardada exitosamente para ${
            scope === "global" ? "el sistema" : scope === "lugar" ? "el lugar" : "el evento"
          }`
        );

        // Recargar para obtener la configuración actualizada con herencia
        await cargarConfiguracion();
      }
    } catch (error) {
      console.error("Error al guardar configuración de WhatsApp:", error);
      showError(error.userMessage || "Error al guardar la configuración");
    } finally {
      setGuardando(false);
    }
  };

  /**
   * Guarda la configuración de Email según el scope seleccionado
   */
  const guardarEmail = async () => {
    try {
      // Validar que se haya seleccionado lugar/evento si corresponde
      if (scope === "lugar" && !lugarId) {
        showError("Debes seleccionar un lugar");
        return;
      }
      if (scope === "evento" && !eventoId) {
        showError("Debes seleccionar un evento");
        return;
      }

      setGuardando(true);

      // Construir query params según el scope
      const params = new URLSearchParams();
      params.append("scope", scope);

      if (scope === "lugar" && lugarId) {
        params.append("scopeId", lugarId);
      } else if (scope === "evento" && eventoId) {
        params.append("scopeId", eventoId);
        if (lugarId) {
          params.append("lugarId", lugarId);
        }
      }

      const response = await httpService.put(
        `/configuracion/email?${params.toString()}`,
        emailData
      );

      if (response.data) {
        setConfiguracion(response.data);
        showSuccess(
          `Configuración de Email guardada exitosamente para ${
            scope === "global" ? "el sistema" : scope === "lugar" ? "el lugar" : "el evento"
          }`
        );

        // Recargar para obtener la configuración actualizada con herencia
        await cargarConfiguracion();
      }
    } catch (error) {
      console.error("Error al guardar configuración de Email:", error);
      showError(error.userMessage || "Error al guardar la configuración");
    } finally {
      setGuardando(false);
    }
  };

  /**
   * Guarda la configuración del Bot (Q&A) según el scope seleccionado
   */
  const guardarBot = async () => {
    try {
      if (scope === "lugar" && !lugarId) {
        showError("Debes seleccionar un lugar");
        return;
      }
      if (scope === "evento" && !eventoId) {
        showError("Debes seleccionar un evento");
        return;
      }

      setGuardando(true);

      const params = new URLSearchParams();
      params.append("scope", scope);

      if (scope === "lugar" && lugarId) {
        params.append("scopeId", lugarId);
      } else if (scope === "evento" && eventoId) {
        params.append("scopeId", eventoId);
        if (lugarId) {
          params.append("lugarId", lugarId);
        }
      }

      const response = await httpService.put(
        `/configuracion/bot?${params.toString()}`,
        botData
      );

      if (response.data) {
        setConfiguracion(response.data);
        showSuccess(
          `Configuración del Bot guardada exitosamente para ${
            scope === "global" ? "el sistema" : scope === "lugar" ? "el lugar" : "el evento"
          }`
        );

        await cargarConfiguracion();
      }
    } catch (error) {
      console.error("Error al guardar configuración de Bot:", error);
      showError(error.userMessage || "Error al guardar la configuración");
    } finally {
      setGuardando(false);
    }
  };

  /**
   * Formatea el número de WhatsApp para mostrar
   */
  const formatearNumeroWhatsApp = (numero) => {
    if (!numero) return "";
    const limpio = numero.replace(/\D/g, "");
    
    if (limpio.length === 0) return "";
    
    // Formato: +52 1 55 1234 5678
    if (limpio.length > 12) {
      return `+${limpio.slice(0, 2)} ${limpio.slice(2, 3)} ${limpio.slice(3, 5)} ${limpio.slice(5, 9)} ${limpio.slice(9)}`;
    } else if (limpio.length > 10) {
      return `+${limpio.slice(0, 2)} ${limpio.slice(2, 3)} ${limpio.slice(3)}`;
    } else if (limpio.length > 6) {
      return `${limpio.slice(0, 2)} ${limpio.slice(2, 6)} ${limpio.slice(6)}`;
    } else if (limpio.length > 2) {
      return `${limpio.slice(0, 2)} ${limpio.slice(2)}`;
    }
    return limpio;
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader className="animate-spin" size={24} />
          <span>Cargando configuración...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <SettingsIcon size={32} className="text-[#216b6b]" />
          Configuración del Sistema
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gestiona las configuraciones globales, por lugar o por evento
        </p>
      </div>

      {/* Selector de Scope */}
      <div className="bg-white dark:bg-[#2a2a2a] rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Nivel de configuración
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Radio Global */}
          <button
            onClick={() => {
              setScope("global");
              setLugarId("");
              setEventoId("");
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              scope === "global"
                ? "border-[#216b6b] bg-[#216b6b]/10"
                : "border-gray-300 dark:border-gray-600 hover:border-[#216b6b]/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Globe size={24} className={scope === "global" ? "text-[#216b6b]" : "text-gray-400"} />
              <div className="text-left">
                <div className={`font-semibold ${scope === "global" ? "text-[#216b6b]" : "text-gray-700 dark:text-gray-300"}`}>
                  Global
                </div>
                <div className="text-xs text-gray-500">
                  Configuración predeterminada del sistema
                </div>
              </div>
            </div>
          </button>

          {/* Radio Lugar */}
          <button
            onClick={() => {
              setScope("lugar");
              setEventoId("");
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              scope === "lugar"
                ? "border-[#216b6b] bg-[#216b6b]/10"
                : "border-gray-300 dark:border-gray-600 hover:border-[#216b6b]/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Building2 size={24} className={scope === "lugar" ? "text-[#216b6b]" : "text-gray-400"} />
              <div className="text-left">
                <div className={`font-semibold ${scope === "lugar" ? "text-[#216b6b]" : "text-gray-700 dark:text-gray-300"}`}>
                  Por Lugar
                </div>
                <div className="text-xs text-gray-500">
                  Configuración por sede/institución
                </div>
              </div>
            </div>
          </button>

          {/* Radio Evento */}
          <button
            onClick={() => setScope("evento")}
            className={`p-4 rounded-lg border-2 transition-all ${
              scope === "evento"
                ? "border-[#216b6b] bg-[#216b6b]/10"
                : "border-gray-300 dark:border-gray-600 hover:border-[#216b6b]/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar size={24} className={scope === "evento" ? "text-[#216b6b]" : "text-gray-400"} />
              <div className="text-left">
                <div className={`font-semibold ${scope === "evento" ? "text-[#216b6b]" : "text-gray-700 dark:text-gray-300"}`}>
                  Por Evento
                </div>
                <div className="text-xs text-gray-500">
                  Configuración por evento específico
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Dropdowns condicionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dropdown Lugar */}
          {(scope === "lugar" || scope === "evento") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seleccionar Lugar
              </label>
              <select
                value={lugarId}
                onChange={(e) => {
                  setLugarId(e.target.value);
                  if (scope === "evento") {
                    setEventoId("");
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white"
                disabled={cargandoLugares}
              >
                <option value="">-- Seleccionar Lugar --</option>
                {lugares.map((lugar) => (
                  <option key={lugar.id} value={lugar.id}>
                    {lugar.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dropdown Evento */}
          {scope === "evento" && lugarId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seleccionar Evento
              </label>
              <select
                value={eventoId}
                onChange={(e) => setEventoId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white"
                disabled={cargandoEventos}
              >
                <option value="">-- Seleccionar Evento --</option>
                {eventos.map((evento) => (
                  <option key={evento.id} value={evento.id}>
                    {evento.nombre_evento}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-[#2a2a2a] rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setTabActiva("whatsapp")}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                tabActiva === "whatsapp"
                  ? "border-[#25D366] text-[#25D366]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <MessageCircle size={18} />
              WhatsApp
            </button>

            <button
              onClick={() => setTabActiva("email")}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                tabActiva === "email"
                  ? "border-[#216b6b] text-[#216b6b]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <Mail size={18} />
              Email
            </button>

            <button
              onClick={() => setTabActiva("pagos")}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                tabActiva === "pagos"
                  ? "border-[#216b6b] text-[#216b6b]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <CreditCard size={18} />
              Pagos
            </button>

            <button
              onClick={() => setTabActiva("bot")}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                tabActiva === "bot"
                  ? "border-[#216b6b] text-[#216b6b]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <BotMessageSquare size={18} />
              Bot
            </button>

            <button
              onClick={() => setTabActiva("general")}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                tabActiva === "general"
                  ? "border-[#216b6b] text-[#216b6b]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <SettingsIcon size={18} />
              General
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Tab WhatsApp */}
          {tabActiva === "whatsapp" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageCircle size={24} className="text-[#25D366]" />
                  Configuración de WhatsApp
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Configura las notificaciones por WhatsApp y el número de soporte.
                </p>
              </div>

              {/* Toggle Habilitado - Notificaciones */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e1e1e] rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Notificaciones por WhatsApp
                  </label>
                  <p className="text-xs text-gray-500">
                    Enviar mensajes de WhatsApp a los estudiantes cuando se registren o firmen el contrato
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappData.habilitado}
                    onChange={(e) =>
                      setWhatsappData({ ...whatsappData, habilitado: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#25D366]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                </label>
              </div>

              {/* Campo Número de WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Soporte de WhatsApp *
                </label>
                <input
                  type="text"
                  value={whatsappData.numeroSoporte}
                  onChange={(e) =>
                    setWhatsappData({ ...whatsappData, numeroSoporte: e.target.value })
                  }
                  placeholder="Ej: 5215512345678"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Formato: Código de país + número (sin espacios ni guiones). Ejemplo: 5215512345678
                </p>
                {whatsappData.numeroSoporte && (
                  <div className="mt-2 p-3 bg-[#25D366]/10 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Vista previa: {formatearNumeroWhatsApp(whatsappData.numeroSoporte)}
                    </p>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => cargarConfiguracion()}
                  disabled={guardando}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarWhatsApp}
                  disabled={guardando || !whatsappData.numeroSoporte}
                  className="px-6 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#25D366]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {guardando ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Guardar Configuración
                    </>
                  )}
                </button>
              </div>

              {/* Leyenda de herencia */}
              {scope !== "global" && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-medium">Herencia de configuración</p>
                      <p className="mt-1">
                        Si no configuras valores específicos para este {scope === "lugar" ? "lugar" : "evento"}, 
                        se usarán los valores configurados en el nivel {scope === "lugar" ? "global" : "del lugar o global"}.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Email */}
          {tabActiva === "email" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Mail size={24} className="text-[#216b6b]" />
                  Configuración de Email
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Controla si se envían notificaciones por correo electrónico y la apariencia de los emails.
                </p>
              </div>

              {/* Toggle Email Habilitado */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e1e1e] rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Notificaciones por Email
                  </label>
                  <p className="text-xs text-gray-500">
                    Enviar notificaciones por correo electrónico a los estudiantes cuando se registren o firmen el contrato
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailData.habilitado}
                    onChange={(e) =>
                      setEmailData({ ...emailData, habilitado: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#216b6b]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#216b6b]"></div>
                </label>
              </div>

              {/* Toggle Botón WhatsApp en Correos */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e1e1e] rounded-lg">
                <div className="flex items-start gap-3">
                  <MessageCircle size={20} className="text-[#25D366] flex-shrink-0 mt-1" />
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Mostrar Botón de WhatsApp en Correos
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Incluir un botón de WhatsApp en el pie de los correos electrónicos para que los estudiantes puedan contactar soporte
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailData.mostrarBotonWhatsApp}
                    onChange={(e) =>
                      setEmailData({ ...emailData, mostrarBotonWhatsApp: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#25D366]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                </label>
              </div>

              {emailData.mostrarBotonWhatsApp && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-medium">Configuración del número de WhatsApp</p>
                      <p className="mt-1">
                        Asegúrate de configurar el número de WhatsApp en la sección de <strong>WhatsApp</strong> para que el botón funcione correctamente en los correos.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => cargarConfiguracion()}
                  disabled={guardando}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarEmail}
                  disabled={guardando}
                  className="px-6 py-2 bg-[#216b6b] text-white rounded-lg hover:bg-[#216b6b]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {guardando ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Guardar Configuración
                    </>
                  )}
                </button>
              </div>

              {/* Leyenda de herencia */}
              {scope !== "global" && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-medium">Herencia de configuración</p>
                      <p className="mt-1">
                        Si no configuras valores específicos para este {scope === "lugar" ? "lugar" : "evento"}, 
                        se usarán los valores configurados en el nivel {scope === "lugar" ? "global" : "del lugar o global"}.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Bot */}
          {tabActiva === "bot" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BotMessageSquare size={24} className="text-[#216b6b]" />
                  Configuración de Bot
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Configura las preguntas frecuentes y las respuestas automáticas del bot.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-[#1e1e1e] p-5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    Respuestas Automáticas
                  </h3>
                  <button
                    onClick={() => {
                      setBotData((prev) => ({
                        ...prev,
                        preguntas_respuestas: [
                          ...(prev.preguntas_respuestas || []),
                          { pregunta: "", respuesta: "" }
                        ]
                      }));
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#216b6b]/10 text-[#216b6b] hover:bg-[#216b6b]/20 rounded-lg text-sm font-medium transition-colors border border-[#216b6b]/20"
                  >
                    <Plus size={16} />
                    Agregar Nueva Pregunta
                  </button>
                </div>

                {(!botData.preguntas_respuestas || botData.preguntas_respuestas.length === 0) ? (
                  <div className="text-center bg-white dark:bg-[#2a2a2a] rounded-lg border border-gray-200 dark:border-gray-600 py-8 shadow-sm">
                    <BotMessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2 opacity-50" />
                    <p className="text-gray-500 font-medium">No hay preguntas configuradas</p>
                    <p className="text-sm text-gray-400 mt-1">Haz clic en el botón de arriba para registrar la primera</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {botData.preguntas_respuestas.map((qa, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-[#2a2a2a] p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm relative group hover:border-[#216b6b]/30 transition-colors">
                        <div className="flex-1 space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Pregunta (Palabras Clave)</label>
                            <input
                              type="text"
                              value={qa.pregunta}
                              onChange={(e) => {
                                const newItems = [...botData.preguntas_respuestas];
                                newItems[index].pregunta = e.target.value;
                                setBotData({ ...botData, preguntas_respuestas: newItems });
                              }}
                              placeholder="Ej: horario, donde estan, precio, contacto"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#1e1e1e] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#216b6b] focus:border-transparent outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Respuesta del Bot</label>
                            <textarea
                              value={qa.respuesta}
                              onChange={(e) => {
                                const newItems = [...botData.preguntas_respuestas];
                                newItems[index].respuesta = e.target.value;
                                setBotData({ ...botData, preguntas_respuestas: newItems });
                              }}
                              placeholder="Ej: Hola, estamos ubicados en la calle principal..."
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#1e1e1e] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#216b6b] focus:border-transparent outline-none resize-y transition-all"
                            />
                          </div>
                        </div>
                        <div className="flex sm:flex-col justify-end sm:justify-start items-center ml-2 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-700 pt-3 sm:pt-0 sm:pl-3">
                          <button
                            onClick={() => {
                              const newItems = [...botData.preguntas_respuestas];
                              newItems.splice(index, 1);
                              setBotData({ ...botData, preguntas_respuestas: newItems });
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Eliminar registro"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => cargarConfiguracion()}
                  disabled={guardando}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarBot}
                  disabled={guardando}
                  className="px-6 py-2 bg-[#216b6b] text-white rounded-lg hover:bg-[#216b6b]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {guardando ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Guardar Configuración
                    </>
                  )}
                </button>
              </div>

              {/* Leyenda de herencia */}
              {scope !== "global" && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-medium">Herencia de configuración</p>
                      <p className="mt-1">
                        Si no configuras preguntas especificas para este nivel, 
                        se usarán las configuraciones de los niveles superiores.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Pagos (Placeholder) */}
          {tabActiva === "pagos" && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Configuración de Pagos
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Esta sección estará disponible próximamente
                </p>
              </div>
            </div>
          )}

          {/* Tab General (Placeholder) */}
          {tabActiva === "general" && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <SettingsIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Configuración General
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Esta sección estará disponible próximamente
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}