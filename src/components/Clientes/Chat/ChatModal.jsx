import React, { useState, useRef, useEffect } from "react";
import {
  User,
  MessageSquare,
  Send,
  Minus,
  X,
  EllipsisVertical,
  CheckCircle,
  Clock,
  Ellipsis,
  Eye,
} from "lucide-react";
import { Button, Input } from "@headlessui/react";
import EmojiSelector from "./EmojiSelector";
import FileUploader from "./FileUploader";
import FilePreview from "./FilePreview";
import { Tooltip } from "../../ui/Tooltip";
import ticketsService from "../../../services/ticketsService";
import { formatearFechaHora } from "../../../utils/ticketsHelpers";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
}

export default function ChatModal({ open, onClose, chatData = [], ticket, telefono, estatus, onCerrarTicket, onMensajeEnviado }) {
  const [minimized, setMinimized] = useState(false);
  const [mensajes, setMensajes] = useState(chatData);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const isMobile = useIsMobile();

  const isImageUrl = (text) => {
    if (!text || typeof text !== "string") return false;
    const trimmed = text.trim();
    // Regex para detectar URLs de imágenes comunes
    return (
      trimmed.match(/^https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg)(?:\?.*)?$/i) != null ||
      trimmed.startsWith("https://images.unsplash.com") ||
      trimmed.startsWith("data:image/")
    );
  };

  const isClosed = estatus?.toLowerCase() === "cerrado";

  // Scroll automático al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  // Actualizar mensajes cuando cambie chatData
  useEffect(() => {
    setMensajes(chatData);
  }, [chatData]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Función para cerrar ticket
  const handleCerrarTicket = () => {
    setShowConfirm(true);
    setShowMenu(false);
  };

  const confirmarCierreTicket = async () => {
    console.log("Cerrando ticket:", ticket);
    if (onCerrarTicket) {
      await onCerrarTicket();
    } else {
      alert("Ticket cerrado correctamente");
    }
    setShowConfirm(false);
    onClose();
  };

  // Función para dejar ticket pendiente
  const handleTicketPendiente = () => {
    console.log("Dejando ticket pendiente:", ticket);
    alert("Ticket marcado como pendiente");
    setShowMenu(false);
  };

  // Manejar emojis
  const handleEmojiSelect = (emoji) => {
    setNuevoMensaje(prev => prev + emoji);
  };

  // Manejar archivos
  const handleFileSelect = (fileData) => {
    setAttachedFiles(prev => [...prev, fileData]);
  };

  const handleRemoveFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handlePreviewFile = (fileData) => {
    setPreviewFile(fileData);
  };

  // Función para enviar mensaje a WhatsApp
  const enviarMensajeWhatsApp = async () => {
    if (nuevoMensaje.trim() === "" && attachedFiles.length === 0) return;

    const mensajeTexto = nuevoMensaje.trim();
    const ahora = new Date();

    // Agregar mensaje inmediatamente a la UI como "Soporte" (optimistic update)
    const mensajeSoporte = {
      remitente: "Soporte",
      nombre: "Soporte",
      texto: mensajeTexto,
      hora: formatearFechaHora(ahora.toISOString()),
      id: `temp-${Date.now()}`,
      from: "sistema",
      leido: false,
      archivos: attachedFiles.length > 0 ? [...attachedFiles] : null
    };

    setMensajes((prev) => [...prev, mensajeSoporte]);
    
    // Limpiar formulario inmediatamente
    const archivosParaEnviar = [...attachedFiles];
    setNuevoMensaje("");
    setAttachedFiles([]);
    setShowAttachmentMenu(false);

    try {
      // Enviar mensaje al bot de WhatsApp
      const resultado = await ticketsService.sendMessage({
        ticket: ticket,
        telefono: telefono,
        mensaje: mensajeTexto,
      });

      if (!resultado.success) {
        throw new Error(resultado.error || "Error al enviar mensaje");
      }

      console.log("✅ Mensaje enviado exitosamente al bot:", resultado);
      
      // Notificar al padre para que persista el mensaje en el estado global
      if (onMensajeEnviado) {
        onMensajeEnviado(mensajeSoporte);
      }

      // TODO: Si hay archivos adjuntos, implementar lógica para subirlos
      if (archivosParaEnviar.length > 0) {
        console.warn("⚠️ Archivos adjuntos aún no implementados:", archivosParaEnviar.length);
      }

    } catch (error) {
      console.error("❌ Error al enviar mensaje:", error);
      
      // Remover el mensaje optimista si falla
      setMensajes((prev) => prev.filter(m => m.id !== mensajeSoporte.id));
      
      // Restaurar el texto en el input
      setNuevoMensaje(mensajeTexto);
      
      alert("Error al enviar el mensaje. Por favor, intenta nuevamente.");
    }
  };

  // Manejar Enter para enviar
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensajeWhatsApp();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-0 right-0 md:bottom-4 md:right-4 z-50">
      {/* Modal de vista previa */}
      {previewFile && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-[100] animate-in fade-in duration-300"
          onClick={() => setPreviewFile(null)}
        >
          <div className="absolute top-4 right-4 flex gap-4">
            <button
              onClick={() => setPreviewFile(null)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              title="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div 
            className="max-w-[95vw] max-h-[85vh] flex items-center justify-center p-4 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewFile.preview || previewFile.url}
              alt={previewFile.name || "Vista previa"}
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
            />
          </div>
          
          {previewFile.name && (
            <div className="absolute bottom-10 px-6 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-sm">
              {previewFile.name}
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Confirmar acción
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              ¿Estás seguro de que quieres cerrar este ticket?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmarCierreTicket}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Cerrar ticket
              </Button>
            </div>
          </div>
        </div>
      )}

      {!minimized ? (
        <div
          className={
            isMobile
              ? "w-[100vw] h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl shadow-3xl flex flex-col border-2"
              : "bg-white dark:bg-gray-900 rounded-xl shadow-3xl w-96 h-[480px] flex flex-col border-2 shadow-xl relative"
          }
        >
          {/* Header */}
          <div className="flex justify-between items-center p-3 bg-fondoVs dark:bg-[#1a1a1a] text-casal rounded-t-xl gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
              <div className="bg-gray-400 dark:bg-gray-400 p-1 rounded-full flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
              <Tooltip content={`No. Ticket ${ticket || "N/A"}`} position="bottom">
                <p className="text-sm font-medium truncate">
                  No. Ticket {ticket || "N/A"}
                  {isClosed && <span className="ml-2 text-xs font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">CERRADO</span>}
                </p>
              </Tooltip>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <Button
                className="text-casal text-base p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                onClick={() => setMinimized(true)}
                title="Minimizar"
              >
                <Minus className="w-5 h-5" />
              </Button>
              <Button
                className="text-casal text-base p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                onClick={onClose}
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Menú desplegable */}
          {!isClosed && (
            <div className="absolute top-12 right-0 z-10">
              <div
                className="flex justify-end py-1 bg-white/80 dark:bg-white/10 shadow-xl rounded-bl-lg relative"
                ref={menuRef}
              >
                <Tooltip content="Más opciones" position="left">
                  <Button
                    className="mx-1 text-casal text-base p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-400"
                  
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <Ellipsis className="w-5 h-5" />
                  </Button>
                </Tooltip>

                {showMenu && (
                  <div className="absolute top-10 right-4 bg-fondoVs dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl py-2 min-w-[140px] z-50">
                    <Button
                      onClick={handleCerrarTicket}
                      className="w-full px-4 py-2 text-left text-sm font-semibold text-casal dark:text-Acapulco hover:bg-casalds-50 dark:hover:bg-casalds-50/20 flex items-center gap-2"
                    >
                      Cerrar ticket
                    </Button>
                    <Button
                      onClick={handleTicketPendiente}
                      className="w-full px-4 py-2 text-left text-sm font-semibold text-casal dark:text-Acapulco hover:bg-casalds-50 dark:hover:bg-casalds-50/20 flex items-center gap-2"
                    >
                      Dejar pendiente
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="space-y-3">
              {mensajes && mensajes.length > 0 ? (
                mensajes.map((mensaje, index) => {
                  const esSoporte = mensaje.remitente === "Soporte" || mensaje.from === "sistema";
                  const esCliente = mensaje.remitente === "Cliente" || mensaje.from === "usuario";

                  return (
                    <div key={mensaje.id || index} className="flex flex-col">
                      {/* Fecha y hora del mensaje */}
                      <div className={`text-xs text-gray-500 mb-1 ${
                        esSoporte ? "text-right" : "text-left"
                      }`}>
                        {mensaje.hora}
                      </div>

                      {/* Contenedor del mensaje */}
                      <div
                        className={`flex gap-2 ${
                          esSoporte ? "flex-row-reverse" : ""
                        }`}
                      >
                        {/* Avatar solo para cliente */}
                        {esCliente && (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-300 dark:bg-gray-600">
                            <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </div>
                        )}

                        {/* Burbuja del mensaje */}
                        <div className="flex-1">
                          <div
                            className={`rounded-2xl p-3 max-w-[75%] ${
                              esSoporte
                                ? "bg-blue-500 text-white ml-auto"
                                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                            }`}
                          >
                            {mensaje.texto && (
                              isImageUrl(mensaje.texto) ? (
                                <div className="cursor-pointer overflow-hidden rounded-lg group relative" onClick={() => handlePreviewFile({ preview: mensaje.texto, name: "" })}>
                                  <img 
                                    src={mensaje.texto} 
                                    alt="Imagen del chat" 
                                    className="max-w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <Eye className="text-white opacity-0 group-hover:opacity-100 w-8 h-8 drop-shadow-lg" />
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm">{mensaje.texto}</p>
                              )
                            )}
                            
                            {/* Archivos en mensajes */}
                            {mensaje.archivos && mensaje.archivos.length > 0 && (
                              <div className="space-y-2 mt-2">
                                {mensaje.archivos.map((archivo, idx) => (
                                  <div key={idx} className="flex items-center gap-2 p-2 bg-black bg-opacity-10 rounded cursor-pointer hover:bg-opacity-20 transition-colors">
                                    {archivo.preview ? (
                                      <img 
                                        src={archivo.preview} 
                                        alt={archivo.name} 
                                        className="w-8 h-8 object-cover rounded" 
                                        onClick={() => handlePreviewFile(archivo)}
                                      />
                                    ) : (
                                      <div className="w-8 h-8 flex items-center justify-center text-white">
                                        📎
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <span className="text-xs truncate block">{archivo.name}</span>
                                      <span className="text-xs opacity-70">{(archivo.size / 1024).toFixed(1)} KB</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay mensajes en esta conversación</p>
                    <p className="text-xs mt-1">Los mensajes aparecerán aquí cuando inicies la conversación</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input para responder */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] rounded-b-xl">
            {/* Preview de archivos adjuntos */}
            <FilePreview 
              files={attachedFiles} 
              onRemove={handleRemoveFile}
              onPreview={handlePreviewFile}
            />
            
            <div className="flex gap-1 relative">
              {isClosed && (
                <div className="absolute inset-0 bg-white/60 dark:bg-black/60 z-20 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    🔒 Ticket cerrado
                  </span>
                </div>
              )}
              <EmojiSelector
                onEmojiSelect={handleEmojiSelect}
                inputRef={inputRef}
                disabled={isClosed}
              />
              
              <Input
                ref={inputRef}
                type="text"
                placeholder={isClosed ? "No se pueden enviar mensajes a un ticket cerrado" : "Escribe tu mensaje para WhatsApp..."}
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isClosed}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-casal focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900"
              />
              <FileUploader
                onFileSelect={handleFileSelect}
                onAttachmentMenuToggle={setShowAttachmentMenu}
                showAttachmentMenu={showAttachmentMenu}
                disabled={isClosed}
              />
              <Button
                onClick={enviarMensajeWhatsApp}
                disabled={isClosed || (nuevoMensaje.trim() === "" && attachedFiles.length === 0)}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isClosed || (nuevoMensaje.trim() === "" && attachedFiles.length === 0)
                    ? "bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-casal text-white hover:bg-casalds-600"
                }`}
                title={isClosed ? "Ticket cerrado" : "Enviar a WhatsApp"}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="bg-casal text-white rounded-full shadow-lg px-4 py-2 flex items-center cursor-pointer mb-4 mr-4"
          onClick={() => setMinimized(false)}
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Chat en vivo
        </div>
      )}
    </div>
  );
}