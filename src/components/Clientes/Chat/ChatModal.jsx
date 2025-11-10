import React, { useState, useRef, useEffect } from "react";
import { User, MessageSquare, Send, Minus, X } from "lucide-react";
import { Button } from "@headlessui/react";

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
  const messagesEndRef = useRef(null);
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

  // Función para enviar mensaje a WhatsApp
  const enviarMensajeWhatsApp = async () => {
    if (nuevoMensaje.trim() === "") return;

    const ahora = new Date();
    const hora = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Agregar mensaje del usuario al chat local
    const mensajeUsuario = {
      remitente: "Usuario",
      texto: nuevoMensaje.trim(),
      hora: hora,
      id: Date.now()
    };

    setMensajes(prev => [...prev, mensajeUsuario]);
    
    // Guardar el mensaje antes de limpiar el input
    const mensajeParaWhatsApp = nuevoMensaje.trim();
    setNuevoMensaje("");

    try {
      // Aquí iría la llamada a tu API de WhatsApp
      const response = await fetch('/api/whatsapp/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: ticket,
          mensaje: mensajeParaWhatsApp,
          remitente: "Usuario"
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar mensaje');
      }

      console.log('Mensaje enviado a WhatsApp:', mensajeParaWhatsApp);
      
    } catch (error) {
      console.error('Error al enviar mensaje a WhatsApp:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
      alert('Error al enviar mensaje. Intenta nuevamente.');
    }
  };

  // Manejar Enter para enviar
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensajeWhatsApp();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-0 right-0 md:bottom-4 md:right-4 z-50">
      {!minimized ? (
        <div className={isMobile 
          ? "w-[100vw] h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl shadow-3xl flex flex-col border-2"
          : "bg-white dark:bg-gray-900 rounded-xl shadow-3xl w-80 h-[420px] flex flex-col border-2"
        }>
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
          {/* Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 ">
            <div className="space-y-4">
              {mensajes && mensajes.length > 0 ? (
                mensajes.map((mensaje, index) => {
                  const esSoporte = mensaje.remitente === "Soporte";
                  const esUsuario = mensaje.remitente === "Usuario";
                  
                  return (
                    <div key={mensaje.id || index} className={`flex gap-3 ${(esSoporte || esUsuario) ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        esSoporte 
                          ? 'bg-casal' 
                          : esUsuario
                          ? 'bg-casal'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}>
                        {esSoporte ? (
                          <span className="text-white text-xs font-bold">S</span>
                        ) : esUsuario ? (
                          <span className="text-white text-xs font-bold">U</span>
                        ) : (
                          <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`rounded-lg p-3 shadow-lg max-w-[80%] relative ${
                          esSoporte 
                            ? 'bg-casal text-white ml-auto' 
                            : esUsuario
                            ? 'bg-casal text-white ml-auto'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                        }`}>
                          {!esSoporte && !esUsuario && (
                            <p className="text-xs font-medium text-casal dark:text-casal mb-1">
                              {mensaje.remitente}
                            </p>
                          )}
                          <p className="text-sm mb-2">{mensaje.texto}</p>
                          <p className={`text-xs mt-2 absolute bottom-0.5 right-2 ${
                            (esSoporte || esUsuario)
                              ? 'opacity-80' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {mensaje.hora}
                          </p>
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
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] rounded-b-xl">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escribe tu mensaje para WhatsApp..."
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-casal focus:border-transparent"
              />
              <button 
                onClick={enviarMensajeWhatsApp}
                disabled={nuevoMensaje.trim() === ""}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  nuevoMensaje.trim() === "" 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
                title="Enviar a WhatsApp"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-casal text-white rounded-full shadow-lg px-4 py-2 flex items-center cursor-pointer mb-4 mr-4" onClick={() => setMinimized(false)}>
          <MessageSquare className="w-5 h-5 mr-2" />
          Chat en vivo
        </div>
      )}
    </div>
  );
}