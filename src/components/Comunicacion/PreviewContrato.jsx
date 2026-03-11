import React, { useEffect, useState } from "react";
import { FileText, FileWarning, Loader2, AlertCircle } from "lucide-react";
import contratoConfigService from "../../services/contratoConfigService";

export default function PreviewContrato({ eventoData, modoVista }) {
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configuracion, setConfiguracion] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [errorObteniendoPdf, setErrorObteniendoPdf] = useState(null);

  // 1️⃣ Primero cargar la configuración para saber si hay template_id
  useEffect(() => {
    const cargarConfig = async () => {
      if (!eventoData?.id) {
        setLoadingConfig(false);
        return;
      }
      try {
        const configResponse = await contratoConfigService.obtenerConfiguracion(eventoData.id);
        if (configResponse && configResponse.template_id) {
          setConfiguracion(configResponse);
        }
      } catch (error) {
        console.error("Error al obtener config de contrato en preview:", error);
      } finally {
        setLoadingConfig(false);
      }
    };
    cargarConfig();
  }, [eventoData]);

  // 2️⃣ Si hay template_id, pedir la previsualización del PDF real al nuevo endpoint
  useEffect(() => {
    const obtenerBorradorPdf = async () => {
      // Solo disparar si ya sabemos que tiene configuración válida y no hemos cargado el PDF aún
      if (configuracion?.template_id && eventoData?.id && !pdfData) {
        setLoadingPdf(true);
        setErrorObteniendoPdf(null);
        try {
          const response = await contratoConfigService.previewContrato(eventoData.id);
          // Verificar si el endpoint devuelve properties directas o dentro de 'data' como es común
          const base64Data = response?.data?.pdfBase64 || response?.pdfBase64;
          
          if (base64Data) {
            setPdfData(base64Data);
          } else {
            console.error("No se encontró pdfBase64 en la respuesta:", response);
            setErrorObteniendoPdf("No se pudo obtener el archivo de previsualización.");
          }
        } catch (error) {
          console.error("Error al solicitar el PDF Preview:", error);
          setErrorObteniendoPdf(error.userMessage || "Error al cargar el documento de plantilla");
        } finally {
          setLoadingPdf(false);
        }
      }
    };

    obtenerBorradorPdf();
  }, [configuracion, eventoData, pdfData]);

  if (loadingConfig) {
    return (
      <div className="bg-gray-50 h-[600px] flex flex-col items-center justify-center rounded-lg">
        <Loader2 className="animate-spin text-casal w-10 h-10 mb-4" />
        <span className="text-gray-500 font-medium text-sm">Validando configuración...</span>
      </div>
    );
  }

  // NO tiene contrato configurado
  if (!configuracion?.template_id) {
    return (
      <div className={`bg-gray-50 h-[600px] flex flex-col items-center justify-center ${modoVista === "telefono" ? "p-4" : "p-8"} rounded-lg border-2 border-dashed border-gray-300`}>
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-sm w-full text-center border border-gray-100">
          <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileWarning className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sin contrato asignado</h2>
          <p className="text-gray-500 text-sm mb-0 leading-relaxed">
            Este evento no tiene contrato configurado. Primero debes vincular la plantilla de DocuSign en la sección de configuración.
          </p>
        </div>
      </div>
    );
  }

  // SÍ tiene contrato configurado -> Intentar mostrar PDF
  return (
    <div className={`bg-gray-100 h-full min-h-[600px] flex flex-col items-center justify-center p-4 rounded-lg`}>
      <div className="w-full h-full min-h-[600px] max-w-4xl bg-white shadow-md rounded-lg flex flex-col overflow-hidden border border-gray-200">
        
        {/* Cabecera del Documento */}
        <div className="bg-gray-800 text-gray-100 py-3 px-4 flex justify-between items-center text-xs sm:text-sm shadow-md z-10">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-300" />
            <span className="font-semibold tracking-wide truncate">Plantilla: {eventoData?.nombre_evento}</span>
          </div>
          <div className="opacity-70 font-mono hidden sm:block bg-gray-900 px-2 py-1 rounded">
            ID: {configuracion.template_id.substring(0, 12)}...
          </div>
        </div>

        {/* Área del iFrame o Loader */}
        <div className="flex-1 bg-[#525659] flex items-center justify-center relative">
          
          {loadingPdf ? (
            <div className="flex flex-col items-center justify-center text-white bg-gray-800/80 p-8 rounded-xl backdrop-blur-sm">
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-400" />
              <p className="font-medium">Generando borrador en DocuSign...</p>
              <p className="text-xs text-gray-400 mt-2 max-w-xs text-center">
                Soliciando la plantilla con todos los campos disponibles para previsualizar.
              </p>
            </div>
          ) : errorObteniendoPdf ? (
            <div className="bg-white p-6 max-w-sm text-center rounded-lg shadow border-l-4 border-red-500 text-gray-700">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2 text-gray-900">Error al cargar visualización</h3>
              <p className="text-sm text-gray-500">{errorObteniendoPdf}</p>
            </div>
          ) : pdfData ? (
             <iframe 
                src={`data:application/pdf;base64,${pdfData}#toolbar=0&navpanes=0&view=FitH`}
                title="Previsualización de Contrato"
                className="w-full h-full min-h-[600px] border-none"
             />
          ) : (
            <div className="text-white">Iniciando visor...</div>
          )}

        </div>
      </div>
    </div>
  );
}
