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
} from "lucide-react";
import { Button, Input } from "@headlessui/react";
import EmojiSelector from "./EmojiSelector";
import FileUploader from "./FileUploader";
import FilePreview from "./FilePreview";
import { Tooltip } from "../../ui/Tooltip";

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

export default function ChatModal({ open, onClose, chatData = [], ticket }) {
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

  const confirmarCierreTicket = () => {
    console.log("Cerrando ticket:", ticket);
    alert("Ticket cerrado correctamente");
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

    const ahora = new Date();
    const hora = ahora.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const mensajeUsuario = {
      remitente: "Usuario",
      texto: nuevoMensaje.trim(),
      hora: hora,
      id: Date.now(),
      archivos: attachedFiles.length > 0 ? [...attachedFiles] : null
    };

    setMensajes((prev) => [...prev, mensajeUsuario]);

    const mensajeParaWhatsApp = nuevoMensaje.trim();
    const archivosParaEnviar = [...attachedFiles];
    
    // Limpiar formulario
    setNuevoMensaje("");
    setAttachedFiles([]);
    setShowAttachmentMenu(false);

    try {
      const formData = new FormData();
      formData.append('ticketId', ticket);
      formData.append('mensaje', mensajeParaWhatsApp);
      formData.append('remitente', 'Usuario');

      archivosParaEnviar.forEach((fileData, index) => {
        formData.append(`archivo_${index}`, fileData.file);
      });

      const response = await fetch("/api/whatsapp/send-message", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al enviar mensaje");
      }

      console.log("Mensaje enviado a WhatsApp:", {
        mensaje: mensajeParaWhatsApp,
        archivos: archivosParaEnviar.length
      });
    } catch (error) {
      console.error("Error al enviar mensaje a WhatsApp:", error);
      alert("Error al enviar mensaje. Intenta nuevamente.");
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70]">
          <div className="max-w-4xl max-h-[90vh] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {previewFile.name}
                </h3>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 max-h-[70vh] overflow-auto">
                {previewFile.preview ? (
                  <img
                    src={previewFile.preview}
                    alt={previewFile.name}
                    className="max-w-full max-h-full object-contain mx-auto"
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Vista previa no disponible para este tipo de archivo</p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
          <div className="flex justify-between items-center p-3 bg-fondoVs dark:bg-[#1a1a1a] text-casal rounded-t-xl">
            <div className="flex items-center gap-1">
              <div className="bg-gray-400 dark:bg-gray-400 p-1 rounded-full">
                <User className="w-4 h-4" />
              </div>
              <p className="text-base font-medium">No. Ticket {ticket}</p>
            </div>
            <div>
              <Button
                className="mx-1 text-casal text-base"
                onClick={() => setMinimized(true)}
                title="Minimizar"
              >
                <Minus className="w-5 h-5" />
              </Button>
              <Button
                className="mx-1 text-casal text-base"
                onClick={onClose}
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Menú desplegable */}
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

          {/* Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="space-y-4">
              {mensajes && mensajes.length > 0 ? (
                mensajes.map((mensaje, index) => {
                  const esSoporte = mensaje.remitente === "Soporte";
                  const esCliente = mensaje.remitente === "Cliente";
                  const esUsuario = mensaje.remitente === "Usuario";

                  return (
                    <div key={mensaje.id || index}>
                      <div className="flex justify-center mb-2">
                        <span className="text-xs text-gray-500 px-3 py-1 rounded-full">
                          {mensaje.hora}
                        </span>
                      </div>

                      <div
                        className={`flex gap-2 ${
                          esSoporte || esUsuario ? "flex-row-reverse" : ""
                        }`}
                      >
                        {esCliente && (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-300 dark:bg-gray-600">
                            <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </div>
                        )}

                        <div className="flex-1">
                          <div
                            className={`rounded-lg p-3 shadow-lg max-w-[80%] relative ${
                              esSoporte
                                ? "bg-casal text-white ml-auto"
                                : esUsuario
                                ? "bg-casal text-white ml-auto"
                                : esCliente
                                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            }`}
                          >
                            {mensaje.texto && (
                              <p className="text-sm mb-2">{mensaje.texto}</p>
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
            
            <div className="flex gap-1">
              <EmojiSelector
                onEmojiSelect={handleEmojiSelect}
                inputRef={inputRef}
              />
              
              <Input
                ref={inputRef}
                type="text"
                placeholder="Escribe tu mensaje para WhatsApp..."
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-casal focus:border-transparent"
              />
              <FileUploader
                onFileSelect={handleFileSelect}
                onAttachmentMenuToggle={setShowAttachmentMenu}
                showAttachmentMenu={showAttachmentMenu}
              />
              <Button
                onClick={enviarMensajeWhatsApp}
                disabled={nuevoMensaje.trim() === "" && attachedFiles.length === 0}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  nuevoMensaje.trim() === "" && attachedFiles.length === 0
                    ? "bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-casal text-white hover:bg-casalds-600"
                }`}
                title="Enviar a WhatsApp"
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