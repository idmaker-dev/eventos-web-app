import React, { useState, useEffect } from "react";
import { Send, Paperclip, Camera, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

export default function MonitordeChats() {
  const usuarios = [
    { id: 1, nombre: "María Fernanda de la Vega Montemayor", ultimoMensaje: "Hola información del evento..." },
    { id: 2, nombre: "Ana Sofía Quintana", ultimoMensaje: "Cómo agrego otro boleto..." },
    { id: 3, nombre: "Santiago Eduardo", ultimoMensaje: "Ya no necesito otro boleto..." },
    { id: 4, nombre: "Isabela Torres", ultimoMensaje: "Quiero otro boleto más para..." },
  ];

  const conversacionesIniciales = {
    1: [
      { id: 1, remitente: "contacto", texto: "Hola, ¿me puedes decir cuándo es la graduación?", tiempo: "Hace 9 minutos" },
      { id: 2, remitente: "yo", texto: "¡Hola María! Tu ceremonia será el 15 de junio de 2025 a las 6:00 PM. 👍", tiempo: "Hace 5 minutos" },
    ],
    2: [
      { id: 1, remitente: "contacto", texto: "¿Cómo agrego otro boleto?", tiempo: "Hace 3 minutos" },
      { id: 2, remitente: "yo", texto: "Puedes hacerlo desde el portal en la sección 'Mis boletos'.", tiempo: "Hace 1 minuto" },
    ],
  };

  const [chatSeleccionado, setChatSeleccionado] = useState(1);
  const [conversaciones, setConversaciones] = useState({});
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [mostrarEmojis, setMostrarEmojis] = useState(false);

  // Cargar conversaciones desde localStorage
  useEffect(() => {
    const guardado = localStorage.getItem("conversaciones");
    if (guardado) {
      setConversaciones(JSON.parse(guardado));
    } else {
      setConversaciones(conversacionesIniciales);
    }
  }, []);

  // Guardar conversaciones en localStorage
  useEffect(() => {
    if (Object.keys(conversaciones).length > 0) {
      localStorage.setItem("conversaciones", JSON.stringify(conversaciones));
    }
  }, [conversaciones]);

  const enviarMensaje = () => {
    if (!nuevoMensaje.trim()) return;

    const nuevo = {
      id: Date.now(),
      remitente: "yo",
      texto: nuevoMensaje,
      tiempo: "Hace unos segundos",
    };

    setConversaciones((prev) => ({
      ...prev,
      [chatSeleccionado]: [...(prev[chatSeleccionado] || []), nuevo],
    }));

    setNuevoMensaje("");
    setMostrarEmojis(false);
  };

  const agregarEmoji = (emojiObject) => {
    setNuevoMensaje((prev) => prev + emojiObject.emoji);
  };

  // Adjuntar archivo
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const nuevo = {
        id: Date.now(),
        remitente: "yo",
        texto: `📎 Archivo adjunto: ${file.name}`,
        tiempo: "Hace unos segundos",
      };
      setConversaciones((prev) => ({
        ...prev,
        [chatSeleccionado]: [...(prev[chatSeleccionado] || []), nuevo],
      }));
    }
  };

  // Adjuntar foto
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const nuevo = {
        id: Date.now(),
        remitente: "yo",
        texto: `📷 Foto enviada: ${file.name}`,
        tiempo: "Hace unos segundos",
      };
      setConversaciones((prev) => ({
        ...prev,
        [chatSeleccionado]: [...(prev[chatSeleccionado] || []), nuevo],
      }));
    }
  };

  return (
    <div className="h-[600px] w-full bg-white rounded-xl shadow-lg flex overflow-hidden">
      {/* Panel izquierdo */}
      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        <div className="p-3 border-b">
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {usuarios.map((u) => (
            <div
              key={u.id}
              className={`px-4 py-3 cursor-pointer border-b hover:bg-gray-100 ${
                chatSeleccionado === u.id ? "bg-gray-200" : ""
              }`}
              onClick={() => setChatSeleccionado(u.id)}
            >
              <p className="font-medium text-sm text-gray-900 truncate">{u.nombre}</p>
              <p className="text-xs text-gray-500 truncate">{u.ultimoMensaje}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho */}
      <div className="w-2/3 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white font-semibold text-gray-800">
          {usuarios.find((u) => u.id === chatSeleccionado)?.nombre || "Selecciona un chat"}
        </div>

        {/* Mensajes */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-100">
          {(conversaciones[chatSeleccionado] || []).map((m) => (
            <div key={m.id} className={`flex ${m.remitente === "yo" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow-sm text-sm ${
                  m.remitente === "yo" ? "bg-gray-200 text-gray-800" : "bg-green-100 text-gray-900"
                }`}
              >
                <p>{m.texto}</p>
                <span className="block text-xs text-gray-500 mt-1">{m.tiempo}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t flex items-center space-x-2 bg-white relative">
          {/* Emoji */}
          <button onClick={() => setMostrarEmojis(!mostrarEmojis)} className="p-2 text-gray-500 hover:text-gray-700">
            <Smile className="w-5 h-5" />
          </button>
          {mostrarEmojis && (
            <div className="absolute bottom-14 left-2 z-50">
              <EmojiPicker onEmojiClick={agregarEmoji} />
            </div>
          )}

          {/* Clip */}
          <label className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer">
            <Paperclip className="w-5 h-5" />
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>

          {/* Cámara */}
          <label className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer">
            <Camera className="w-5 h-5" />
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
          </label>

          {/* Caja de texto */}
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            className="flex-1 px-4 py-2 text-sm border rounded-full focus:outline-none focus:ring focus:ring-blue-200"
          />

          {/* Botón enviar */}
          <button onClick={enviarMensaje} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
