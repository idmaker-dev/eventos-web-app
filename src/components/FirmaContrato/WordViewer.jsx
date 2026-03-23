"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, CheckCircle2, Loader2 } from "lucide-react";

/**
 * Visor de documentos Word con control de scroll
 * Muestra el documento usando Office Online Viewer y detecta si el usuario llegó al final
 */
export default function WordViewer({ 
  wordUrl, 
  onScrollComplete,
  className = "" 
}) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showManualConfirm, setShowManualConfirm] = useState(false);
  const scrollContainerRef = useRef(null);

  // URL del visor de Office Online
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(wordUrl)}`;

  useEffect(() => {
    // Timeout para mostrar confirmación manual si el iframe no carga
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setShowManualConfirm(true);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  // Detección de scroll en el contenedor
  const handleScroll = (e) => {
    const element = e.target;
    const scrolledToBottom = 
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50; // 50px de margen

    if (scrolledToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      if (onScrollComplete) {
        onScrollComplete();
      }
    }
  };

  // Si el usuario confirma manualmente que leyó el documento
  const handleManualConfirm = () => {
    setHasScrolledToBottom(true);
    if (onScrollComplete) {
      onScrollComplete();
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Indicador de progreso */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">
              {hasScrolledToBottom ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Has revisado el documento completo
                </span>
              ) : (
                "Desliza hacia abajo para leer todo el contrato"
              )}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              {hasScrolledToBottom 
                ? "Ahora puedes proceder con la aceptación del contrato."
                : "Debes leer todo el documento antes de poder aceptarlo."
              }
            </p>
          </div>
        </div>
      </div>

      {/* Visor del documento */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 bg-white rounded-lg shadow-inner overflow-auto relative"
        style={{ minHeight: "500px" }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Cargando documento...</p>
              <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos</p>
            </div>
          </div>
        )}

        {/* Iframe de Office Online Viewer */}
        <iframe
          src={officeViewerUrl}
          onLoad={handleIframeLoad}
          className="w-full h-full border-0"
          title="Vista previa del contrato"
          style={{ minHeight: "500px" }}
        />

        {/* Confirmación manual si el visor no funciona */}
        {showManualConfirm && !hasScrolledToBottom && (
          <div className="absolute bottom-4 right-4 z-20">
            <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-xs">
              <p className="text-sm text-gray-700 mb-3">
                ¿Ya descargaste y revisaste el documento completo?
              </p>
              <div className="flex gap-2">
                <a
                  href={wordUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-medium rounded transition-colors text-center"
                >
                  📥 Descargar
                </a>
                <button
                  onClick={handleManualConfirm}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
                >
                  ✓ Ya lo leí
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Indicador visual de scroll */}
      {!hasScrolledToBottom && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-sm text-amber-800">
            <svg 
              className="w-4 h-4 animate-bounce" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
            <span>Desplázate hacia abajo para continuar</span>
          </div>
        </div>
      )}
    </div>
  );
}
