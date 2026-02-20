"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@headlessui/react";
import { CheckCircle, FileText, Loader2, AlertCircle } from "lucide-react";
import contratoService from "../../services/contratoService";
import guestService from "../../services/guestService";
import { useNotifications } from "../../contexts/NotificationContext";
import logo from "../../assets/LOGOPLANORIA1.png";

/**
 * Componente para la firma de contrato del invitado
 * Se muestra después del registro inicial y antes del portal de pagos
 */
export default function FirmaContrato() {
  const { invitadoId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();

  // Estados
  const [invitado, setInvitado] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirmando, setIsFirmando] = useState(false);
  const [contratoFirmado, setContratoFirmado] = useState(false);
  const [error, setError] = useState(null);

  // Cargar información del invitado al montar
  useEffect(() => {
    const cargarInvitado = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Obtener información del invitado
        const response = await guestService.getInvitadoById(invitadoId);

        if (response.success) {
          setInvitado(response.data);

          // Verificar estado del invitado
          if (response.data.estado_registro === "ACTIVO") {
            // Ya completó todo el proceso, redirigir al portal de pagos
            showSuccess("Tu registro ya está completo");
            navigate(`/PortalPagos/${invitadoId}`);
          } else if (response.data.estado_registro === "CONTRATO_FIRMADO") {
            // El contrato ya fue firmado pero aún no se ha completado el proceso
            setContratoFirmado(true);
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
   * Maneja la firma del contrato
   * En producción, esto abrirá DocuSign
   * Por ahora, simula la firma
   */
  const handleFirmarContrato = async () => {
    try {
      setIsFirmando(true);
      setError(null);

      // TODO: Integrar con DocuSign
      // Por ahora, simulamos la firma del contrato
      const result = await contratoService.simularFirmaContrato(invitadoId);

      if (result.success) {
        setContratoFirmado(true);
        showSuccess("¡Contrato firmado exitosamente!");

        // Esperar 2 segundos y redirigir al portal de pagos
        setTimeout(() => {
          navigate(`/PortalPagos/${invitadoId}`);
        }, 2000);
      } else {
        setError(result.error || "Error al firmar el contrato");
        showError(result.error || "Error al firmar el contrato");
      }
    } catch (err) {
      console.error("Error al firmar contrato:", err);
      setError("Error al procesar la firma. Por favor, intenta nuevamente.");
      showError("Error al procesar la firma");
    } finally {
      setIsFirmando(false);
    }
  };

  /**
   * Renderiza el estado de carga
   */
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

  /**
   * Renderiza el estado de error
   */
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

  /**
   * Renderiza el estado de contrato firmado exitosamente
   */
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

  /**
   * Renderiza la interfaz principal de firma de contrato
   */
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

        {/* Información del evento */}
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

        {/* Visualización del contrato (Placeholder) */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2 font-medium">
            Documento del Contrato
          </p>
          <p className="text-sm text-gray-500">
            {/* TODO: Integrar visualización de DocuSign aquí */}
            El contrato se mostrará aquí cuando se integre con DocuSign
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </p>
          </div>
        )}

        {/* Botón de firma */}
        <div className="flex flex-col space-y-3">
          <Button
            onClick={handleFirmarContrato}
            disabled={isFirmando}
            className="w-full bg-casal text-white px-6 py-3 rounded-lg hover:bg-casal/80 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center"
          >
            {isFirmando ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Procesando firma...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Firmar Contrato
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Al firmar, aceptas los términos y condiciones del evento
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>¿Necesitas ayuda? Contacta al organizador del evento</p>
      </div>
    </div>
  );
}
