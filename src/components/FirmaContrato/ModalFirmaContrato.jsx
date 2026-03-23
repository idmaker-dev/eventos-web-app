"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@headlessui/react";
import { X, Check, RotateCcw, FileText } from "lucide-react";
import WordViewer from "./WordViewer";

/**
 * Modal de firma de contrato INTERNO
 * Muestra el HTML del contrato y permite firmarlo con canvas o solo aceptarlo
 * Soporta plantillas Word (con visor embebido y control de scroll)
 */
export default function ModalFirmaContrato({
  isOpen,
  onClose,
  contratoHTML,
  contratoCSS,
  modoFirma, // "SOLO_ACEPTAR" | "FIRMA_DIGITAL"
  plantillaNombre,
  onAceptar,
  onFirmar,
  isSubmitting = false,
  esPlantillaWord = false, // Nueva prop para detectar plantillas Word
  plantillaWordInfo = null, // Info de la plantilla Word
  previewWordUrl = null, // URL del preview Word generado
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [haCompletadoLectura, setHaCompletadoLectura] = useState(false); // Para plantillas Word con scroll tracking

  // Callback cuando el usuario completa la lectura del documento Word
  const handleScrollComplete = () => {
    setHaCompletadoLectura(true);
  };

  // Reset del estado cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setHaCompletadoLectura(false);
      setAceptoTerminos(false);
      setHasDrawn(false);
    }
  }, [isOpen]);

  // Configurar canvas cuando se abre el modal
  useEffect(() => {
    if (isOpen && modoFirma === "FIRMA_DIGITAL" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Configurar canvas con dimensiones responsivas
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Configurar estilo de dibujo
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Fondo blanco
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [isOpen, modoFirma]);

  // Handlers de dibujo en canvas
  const startDrawing = (e) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    setIsDrawing(true);
    setHasDrawn(true);

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Handlers para touch (móvil)
  const startDrawingTouch = (e) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];

    setIsDrawing(true);
    setHasDrawn(true);

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawTouch = (e) => {
    e.preventDefault();
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const limpiarFirma = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSubmit = () => {
    if (modoFirma === "FIRMA_DIGITAL") {
      if (!hasDrawn) {
        alert("Por favor, firma el contrato antes de continuar");
        return;
      }
      if (!aceptoTerminos) {
        alert("Debes aceptar los términos del contrato");
        return;
      }

      // Convertir canvas a base64
      const canvas = canvasRef.current;
      const firmaBase64 = canvas.toDataURL("image/png");
      onFirmar(firmaBase64);
    } else {
      // SOLO_ACEPTAR
      if (!aceptoTerminos) {
        alert("Debes aceptar los términos del contrato");
        return;
      }
      onAceptar();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Contrato de Participación</h2>
              {plantillaNombre && (
                <p className="text-sm text-gray-500 mt-1">{plantillaNombre}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Contenido del contrato */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {esPlantillaWord ? (
            // Visor de documento Word embebido con scroll tracking
            <WordViewer 
              wordUrl={previewWordUrl}
              onScrollComplete={handleScrollComplete}
              className="h-full"
            />
          ) : (
            // Preview HTML tradicional
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <style>{contratoCSS}</style>
              <div
                className="contrato-html prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: contratoHTML }}
              />
            </div>
          )}
        </div>

        {/* Sección de firma (solo si modo = FIRMA_DIGITAL) */}
        {modoFirma === "FIRMA_DIGITAL" && (
          <div className="p-6 border-t bg-gray-50">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Tu firma digital
                </label>
                <button
                  onClick={limpiarFirma}
                  disabled={isSubmitting}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpiar
                </button>
              </div>
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawingTouch}
                onTouchMove={drawTouch}
                onTouchEnd={stopDrawing}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair bg-white touch-none"
                style={{ touchAction: "none" }}
              />
              <p className="text-xs text-gray-500 mt-2">
                Dibuja tu firma con el mouse o con el dedo en dispositivos táctiles
              </p>
            </div>
          </div>
        )}

        {/* Footer con checkbox y botones */}
        <div className="p-6 border-t bg-white">
          <div className="mb-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={aceptoTerminos}
                onChange={(e) => setAceptoTerminos(e.target.checked)}
                disabled={isSubmitting || (esPlantillaWord && !haCompletadoLectura)}
                className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {modoFirma === "FIRMA_DIGITAL"
                  ? "He leído y acepto todos los términos y condiciones del contrato, y confirmo que mi firma digital es válida."
                  : "He leído y acepto todos los términos y condiciones del contrato."}
              </span>
            </label>
            {esPlantillaWord && !haCompletadoLectura && (
              <p className="text-xs text-amber-600 mt-2 ml-8">
                ⚠️ Debes leer todo el contrato hasta el final antes de poder aceptar
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !aceptoTerminos ||
                (modoFirma === "FIRMA_DIGITAL" && !hasDrawn) ||
                isSubmitting
              }
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Procesando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {modoFirma === "FIRMA_DIGITAL" ? "Firmar Contrato" : "Aceptar Contrato"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
