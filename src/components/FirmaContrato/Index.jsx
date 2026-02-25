"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@headlessui/react";
import { CheckCircle, FileText, Loader2, AlertCircle } from "lucide-react";
import contratoService from "../../services/contratoService";
import guestService from "../../services/guestService";
import { useNotifications } from "../../contexts/NotificationContext";
import { useSignalR } from "../../contexts/SignalRContext";
import logo from "../../assets/LOGOPLANORIA1.png";

/**
 * Componente para la firma de contrato del invitado con integración de DocuSign
 * Se muestra después del registro inicial y antes del portal de pagos
 */
export default function FirmaContrato() {
  const { invitadoId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useNotifications();
  const { connection, conectado, conectarSignalR, desconectarSignalR } = useSignalR();

  // Estados básicos
  const [invitado, setInvitado] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirmando, setIsFirmando] = useState(false);
  const [contratoFirmado, setContratoFirmado] = useState(false);
  const [error, setError] = useState(null);

  // Estados de DocuSign
  const [modoFirma, setModoFirma] = useState("embedded");
  const [signingUrl, setSigningUrl] = useState(null);
  const [envelopeId, setEnvelopeId] = useState(null);
  const [mostrarIframe, setMostrarIframe] = useState(false);
  const [contratoYaCargado, setContratoYaCargado] = useState(false);
  const [iframeRef, setIframeRef] = useState(null);

  // ==========================================
  // CONECTAR A SIGNALR AL INICIAR COMPONENTE
  // ==========================================
  useEffect(() => {
    if (invitadoId && !conectado) {
      console.log('🔌 [FirmaContrato] Conectando SignalR con invitadoId:', invitadoId);
      conectarSignalR(invitadoId);
    }

    // Desconectar cuando el componente se desmonte
    return () => {
      console.log('🔌 [FirmaContrato] Desconectando SignalR al desmontar');
      desconectarSignalR();
    };
  }, [invitadoId, conectado, conectarSignalR, desconectarSignalR]);

  // ==========================================
  // LISTENER DE SIGNALR - NOTIFICACIÓN EN TIEMPO REAL
  // ==========================================
  useEffect(() => {
    if (!connection || !conectado || !mostrarIframe || contratoFirmado) {
      if (!connection) {
        console.log("⏳ [FirmaContrato] SignalR connection no disponible aún");
      } else if (!conectado) {
        console.log("⏳ [FirmaContrato] SignalR no conectado aún");
      }
      return;
    }

    console.log("🎧 [FirmaContrato] Registrando listener SignalR para contrato firmado");
    console.log("📡 [FirmaContrato] Estado SignalR:", { conectado, hasConnection: !!connection });

    // Handler para la notificación de contrato firmado
    const handleContratoFirmado = (data) => {
      console.log("📨 [FirmaContrato] Notificación recibida - Contrato firmado:", data);
      
      // Verificar que sea para este invitado
      if (data.invitadoId === invitadoId) {
        console.log("✅ [FirmaContrato] Contrato confirmado para este invitado");
        setContratoFirmado(true);
        setMostrarIframe(false);
        showSuccess("¡Contrato firmado exitosamente!");
        
        // Redirigir después de un breve delay
        setTimeout(() => {
          navigate(`/PortalPagos/${invitadoId}`);
        }, 2000);
      } else {
        console.log("ℹ️ [FirmaContrato] Notificación es para otro invitado, ignorando");
      }
    };

    // Registrar el listener
    connection.on("contratoFirmado", handleContratoFirmado);
    console.log("✅ [FirmaContrato] Listener 'contratoFirmado' registrado exitosamente");

    // Cleanup al desmontar
    return () => {
      console.log("🔇 [FirmaContrato] Eliminando listener SignalR de contrato firmado");
      connection.off("contratoFirmado", handleContratoFirmado);
    };
  }, [connection, conectado, mostrarIframe, contratoFirmado, invitadoId, navigate, showSuccess]);

  // Detectar si DocuSign redirigió con status=completed
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'completed') {
      console.log("✅ DocuSign returnUrl detectado - Firma completada");
      setContratoFirmado(true);
      setMostrarIframe(false);
      showSuccess("¡Contrato firmado exitosamente!");
      
      // Limpiar el query parameter de la URL
      window.history.replaceState({}, '', `/firma-contrato/${invitadoId}`);
      
      // Redirigir al portal de pagos
      setTimeout(() => {
        navigate(`/PortalPagos/${invitadoId}`);
      }, 2000);
    }
  }, [searchParams, invitadoId, navigate, showSuccess]);

  // Cargar información del invitado al montar
  useEffect(() => {
    const cargarInvitado = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await guestService.getInvitadoById(invitadoId);

        if (response.success) {
          setInvitado(response.data);

          if (response.data.estado_registro === "ACTIVO") {
            showSuccess("Tu registro ya está completo");
            navigate(`/PortalPagos/${invitadoId}`);
          } else if (response.data.estado_registro === "CONTRATO_FIRMADO") {
            console.log("✅ Contrato ya firmado - Preparando redirección");
            setContratoFirmado(true);
            // Limpiar cualquier URL de firma anterior para evitar problemas de carga
            setSigningUrl(null);
            setMostrarIframe(false);
            // Redirigir automáticamente al portal de pagos después de 2 segundos
            setTimeout(() => {
              navigate(`/PortalPagos/${invitadoId}`);
            }, 2000);
          }
        } else {
          setError(response.error || "No se pudo cargar la información del invitado");
        }
      } catch (err) {
        console.error("Error al cargar invitado:", err);
        setError("Error al cargar la información. Por favor, intenta nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };

    cargarInvitado();
  }, [invitadoId, navigate, showSuccess]);

  /**
   * Envía el contrato a DocuSign
   */
  const handleFirmarContrato = useCallback(async () => {
    console.log("📝 handleFirmarContrato llamado", {
      invitadoId,
      modoFirma,
      isFirmando,
      contratoYaCargado
    });

    try {
      setIsFirmando(true);
      setError(null);

      console.log("📤 Enviando contrato a DocuSign...");
      const result = await contratoService.enviarContrato(invitadoId, modoFirma);
      console.log("📥 Respuesta del servicio:", result);

      if (result.success) {
        setEnvelopeId(result.data.envelopeId);

        if (modoFirma === "embedded") {
          console.log("✅ Modo embedded - Mostrando iframe con URL:", result.data.signingUrl);
          setSigningUrl(result.data.signingUrl);
          setMostrarIframe(true);
          showSuccess("Contrato listo para firma");
        } else {
          console.log("✅ Modo email - Contrato enviado");
          showSuccess("Contrato enviado a tu correo electrónico");
          setError("Revisa tu correo para firmar el contrato");
        }
      } else {
        console.error("❌ Error del servicio:", result.error);
        setError(result.error || "Error al enviar el contrato");
        showError(result.error || "Error al enviar el contrato");
      }
    } catch (err) {
      console.error("❌ Excepción al enviar contrato:", err);
      setError("Error al procesar el contrato. Por favor, intenta nuevamente.");
      showError("Error al procesar el contrato");
    } finally {
      setIsFirmando(false);
    }
  }, [invitadoId, modoFirma, showSuccess, showError]);

  /**
   * Maneja eventos de DocuSign (cuando se completa la firma)
   */
  const handleDocuSignEvent = (event) => {
    // Origenes permitidos de DocuSign
    const allowedOrigins = [
      "https://demo.docusign.net",
      "https://na3.docusign.net",
      "https://app.docusign.com",
      "https://apps-d.docusign.com"
    ];
    
    if (!allowedOrigins.some(origin => event.origin === origin)) {
      console.log("❌ Evento de origen no permitido:", event.origin);
      return;
    }

    console.log("📨 Evento recibido de DocuSign:", event.data);

    try {
      let data;
      
      // Intentar parsear el data (puede venir como string o objeto)
      if (typeof event.data === 'string') {
        data = JSON.parse(event.data);
      } else {
        data = event.data;
      }
      
      console.log("📋 Tipo de evento:", data.event);
      
      if (data.event === "signing_complete") {
        console.log("✅ Firma completada en DocuSign (postMessage)");
        setContratoFirmado(true);
        setMostrarIframe(false);
        showSuccess("¡Contrato firmado exitosamente!");

        setTimeout(() => {
          navigate(`/PortalPagos/${invitadoId}`);
        }, 2000);
      } else if (data.event === "cancel") {
        console.log("⚠️ Usuario canceló la firma");
        setMostrarIframe(false);
        setError("Firma cancelada. Puedes intentar nuevamente.");
        setContratoYaCargado(false); // Permitir reintento
        showError("Firma cancelada");
      } else if (data.event === "decline") {
        console.log("⚠️ Usuario rechazó la firma");
        setMostrarIframe(false);
        setError("Firma rechazada. Puedes intentar nuevamente.");
        setContratoYaCargado(false); // Permitir reintento
        showError("Firma rechazada");
      } else {
        console.log("ℹ️ Otro evento de DocuSign:", data.event);
      }
    } catch (err) {
      console.error("❌ Error al procesar evento de DocuSign:", err);
    }
  };

  // Escuchar eventos de DocuSign
  useEffect(() => {
    if (mostrarIframe) {
      console.log("🎧 Iniciando escucha de eventos de DocuSign");
      window.addEventListener("message", handleDocuSignEvent);
      
      // Timeout de seguridad: si después de 10 minutos no hay respuesta, mostrar error
      const timeout = setTimeout(() => {
        if (mostrarIframe && !contratoFirmado) {
          console.log("⏱️ Timeout de firma alcanzado");
          setError("La sesión de firma ha expirado. Por favor, intenta nuevamente.");
          setMostrarIframe(false);
          setContratoYaCargado(false);
        }
      }, 10 * 60 * 1000); // 10 minutos
      
      return () => {
        console.log("🔇 Deteniendo escucha de eventos de DocuSign");
        window.removeEventListener("message", handleDocuSignEvent);
        clearTimeout(timeout);
      };
    }
  }, [mostrarIframe, contratoFirmado]);

  // Polling del estado del invitado mientras se muestra el iframe
  // SOLO COMO FALLBACK - SignalR es el mecanismo principal
  useEffect(() => {
    if (!mostrarIframe || contratoFirmado) {
      return;
    }

    console.log("🔄 [FALLBACK] Iniciando polling reducido (SignalR es el mecanismo principal)");
    
    const verificarEstado = async () => {
      try {
        const response = await guestService.getInvitadoById(invitadoId);
        
        if (response.success && response.data) {
          const estadoActual = response.data.estado_registro;
          
          // Si el webhook ya completó el proceso
          if (estadoActual === "ACTIVO" || estadoActual === "CONTRATO_FIRMADO") {
            console.log("✅ [FALLBACK] Firma detectada por polling - Estado:", estadoActual);
            setContratoFirmado(true);
            setMostrarIframe(false);
            showSuccess("¡Contrato firmado exitosamente!");
            
            // Redirigir después de un breve delay
            setTimeout(() => {
              navigate(`/PortalPagos/${invitadoId}`);
            }, 2000);
          }
        }
      } catch (error) {
        console.error("❌ Error al verificar estado:", error);
      }
    };

    // Verificar cada 10 segundos (reducido de 3 para no saturar)
    // SignalR notificará en tiempo real, esto solo es backup
    // const intervalId = setInterval(verificarEstado, 10000);
    
    // Limpieza al desmontar o cuando cambie el estado
    return () => {
      console.log("🛑 Deteniendo polling de fallback");
      // clearInterval(intervalId);
    };
  }, [mostrarIframe, contratoFirmado, invitadoId, navigate, showSuccess]);

  // Detectar errores del iframe (indicaría que se completó la firma)
  useEffect(() => {
    if (!iframeRef || !mostrarIframe) {
      return;
    }

    const handleIframeError = () => {
      console.log("⚠️ Error detectado en iframe - Probablemente se completó la firma");
      console.log("🔄 Aumentando frecuencia de polling para detectar cambio de estado...");
      // El polling ya detectará el cambio de estado
    };

    iframeRef.addEventListener('error', handleIframeError);

    return () => {
      if (iframeRef) {
        iframeRef.removeEventListener('error', handleIframeError);
      }
    };
  }, [iframeRef, mostrarIframe]);

  // Cargar automáticamente el contrato en modo embedded
  useEffect(() => {
    console.log("🔍 useEffect auto-carga evaluando condiciones:", {
      invitado: invitado?.id,
      estado_registro: invitado?.estado_registro,
      modoFirma,
      contratoYaCargado,
      mostrarIframe,
      signingUrl: signingUrl ? "presente" : "null",
      isFirmando
    });

    const cargarContratoAutomatico = async () => {
      if (
        invitado &&
        invitado.estado_registro === "PENDIENTE_FIRMA_CONTRATO" &&
        modoFirma === "embedded" &&
        !contratoYaCargado &&
        !mostrarIframe &&
        !signingUrl &&
        !isFirmando
      ) {
        console.log("✅ Todas las condiciones cumplidas - Iniciando carga automática");
        setContratoYaCargado(true);
        await handleFirmarContrato();
      } else {
        console.log("⏭️ Condiciones no cumplidas - No se carga automáticamente");
      }
    };

    cargarContratoAutomatico();
  }, [invitado, modoFirma, contratoYaCargado, mostrarIframe, signingUrl, isFirmando, handleFirmarContrato]);

  // Estado de carga
  if (isLoading) {
    return (
      <div className="bg-porcelain min-h-screen flex flex-col items-center justify-center p-6">
        <img src={logo} alt="Logo" className="w-36 h-auto mb-8" />
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-casal mx-auto mb-4" />
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error && !invitado) {
    return (
      <div className="bg-porcelain min-h-screen flex flex-col items-center justify-center p-6">
        <img src={logo} alt="Logo" className="w-36 h-auto mb-8" />
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-casal text-white px-6 py-2 rounded-lg hover:bg-casal/80 font-semibold"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Contrato firmado exitosamente
  if (contratoFirmado) {
    return (
      <div className="bg-porcelain min-h-screen flex flex-col items-center justify-center p-6">
        <img src={logo} alt="Logo" className="w-36 h-auto mb-8" />
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Contrato Firmado!
          </h2>
          <p className="text-gray-600 mb-6">
            Tu contrato ha sido firmado exitosamente. Estamos preparando tu
            portal de pagos...
          </p>
          <Loader2 className="w-8 h-8 animate-spin text-casal mx-auto" />
        </div>
      </div>
    );
  }

  // Interfaz principal
  return (
    <div className="bg-porcelain min-h-screen flex flex-col items-center justify-center p-6">
      <img src={logo} alt="Logo" className="w-36 h-auto mb-8" />

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <FileText className="w-16 h-16 text-casal mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Firma de Contrato
          </h1>
          <p className="text-gray-600">
            Bienvenido/a, <span className="font-semibold">{invitado?.nombre_completo}</span>
          </p>
        </div>

        {/* Información del registro */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Información del Registro
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Teléfono:</span>
              <span className="font-medium text-gray-900">{invitado?.numero}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cantidad de boletos:</span>
              <span className="font-medium text-gray-900">
                {invitado?.cantidad_boletos}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estado:</span>
              <span className="inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800">
                Pendiente de Firma
              </span>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Siguiente Paso
          </h4>
          <p className="text-blue-800 text-sm">
            Para completar tu registro, es necesario que firmes el contrato del
            evento. Una vez firmado, tendrás acceso a tu portal de pagos donde
            podrás realizar tus cuotas programadas.
          </p>
        </div>

        {/* Visualización del contrato - DocuSign Iframe */}
        {mostrarIframe && signingUrl ? (
          <div className="mb-6">
            <div className="border-2 border-casal rounded-lg overflow-hidden relative">
              <iframe
                ref={setIframeRef}
                src={signingUrl}
                className="w-full h-[600px]"
                title="Firma de Contrato DocuSign"
                frameBorder="0"
                allow="camera; microphone"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Completa la firma en el documento mostrado arriba
            </p>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                {conectado ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-700 font-semibold">Conectado en tiempo real</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-xs text-gray-600">Modo estándar</span>
                  </>
                )}
              </div>
              <p className="text-xs text-blue-800 text-center">
                💡 <strong>Nota:</strong> Después de firmar, {conectado ? 'serás notificado instantáneamente' : 'la página se actualizará automáticamente'}. 
                {!conectado && ' Si ves un mensaje de error, no te preocupes - tu firma está siendo procesada. Espera un momento, si la pagina no se actualiza en 1-2 minutos, intenta recargar.'} 
              </p>
            </div>
          </div>
        ) : isFirmando ? (
          <div className="border-2 border-casal rounded-lg p-8 mb-6 text-center bg-blue-50">
            <Loader2 className="w-12 h-12 text-casal mx-auto mb-3 animate-spin" />
            <p className="text-gray-700 mb-2 font-medium">
              Preparando tu contrato...
            </p>
            <p className="text-sm text-gray-500">
              Por favor espera un momento
            </p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2 font-medium">
              Documento del Contrato
            </p>
            <p className="text-sm text-gray-500">
              {modoFirma === "embedded" 
                ? "El contrato se cargará automáticamente en un momento..."
                : "Haz clic en 'Enviar Contrato' para recibirlo por correo"}
            </p>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </p>
          </div>
        )}

        {/* Selector de modo y botón (solo si no se muestra iframe) */}
        {!mostrarIframe && (
          <div className="flex flex-col space-y-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de firma:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="modoFirma"
                    value="embedded"
                    checked={modoFirma === "embedded"}
                    onChange={(e) => setModoFirma(e.target.value)}
                    className="mr-2"
                    disabled={isFirmando}
                  />
                  <span className="text-sm text-gray-700">
                    Firmar aquí (Recomendado)
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="modoFirma"
                    value="email"
                    checked={modoFirma === "email"}
                    onChange={(e) => setModoFirma(e.target.value)}
                    className="mr-2"
                    disabled={isFirmando}
                  />
                  <span className="text-sm text-gray-700">
                    Recibir por correo
                  </span>
                </label>
              </div>
            </div>

            {/* Botón solo se muestra si el modo es email o si hay error */}
            {(modoFirma === "email" || (error && modoFirma === "embedded")) && (
              <Button
                onClick={handleFirmarContrato}
                disabled={isFirmando}
                className="w-full bg-casal text-white px-6 py-3 rounded-lg hover:bg-casal/80 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center"
              >
                {isFirmando ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {modoFirma === "email" ? "Enviando contrato..." : "Preparando contrato..."}
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    {modoFirma === "email" ? "Enviar Contrato por Email" : "Cargar Contrato"}
                  </>
                )}
              </Button>
            )}

            <p className="text-xs text-gray-500 text-center">
              Al firmar, aceptas los términos y condiciones del evento
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>¿Necesitas ayuda? Contacta al organizador del evento</p>
      </div>
    </div>
  );
}
