import React, { useState } from "react";
import { Send } from "lucide-react";

export default function MonitordeChats() {
  // Estado para saber qué chat está abierto
  const [chatSeleccionado, setChatSeleccionado] = useState(0);

  // Lista de usuarios simulada
  const usuarios = [
    { id: 1, nombre: "María Fernanda de la Vega Montemayor", ultimoMensaje: "Hola información del evento...", tiempo: "Hace 2 minutos" },
    { id: 2, nombre: "Ana Sofía Quintana", ultimoMensaje: "Cómo agrego otro boleto...", tiempo: "Hace 2 minutos" },
    { id: 3, nombre: "Santiago Eduardo", ultimoMensaje: "Ya no necesito otro un boleto...", tiempo: "Hace 2 minutos" },
    { id: 4, nombre: "Isabela Torres", ultimoMensaje: "Quiero otro boleto más para un...", tiempo: "Hace 2 minutos" },
  ];

  // Mensajes simulados
  const mensajes = [
    { id: 1, remitente: "usuario", texto: "Hola, ¿me puedes decir cuándo es la graduación?", tiempo: "Hace 9 minutos" },
    { id: 2, remitente: "bot", texto: "¡Hola María! Tu ceremonia de graduación está programada para el 15 de junio de 2025 a las 6:00 PM. 👍", tiempo: "Hace 5 minutos" },
    { id: 3, remitente: "usuario", texto: "¿Dónde será el evento?", tiempo: "Hace 4 minutos" },
    { id: 4, remitente: "bot", texto: "El evento se llevará a cabo en el Auditorio Principal de la Universidad, ubicado en Av. Central #123. 😀", tiempo: "Hace 2 minutos" },
  ];

  return (
    <div className="h-[600px] w-full bg-white rounded-xl shadow-lg flex overflow-hidden">
      {/* Panel izquierdo - Lista de chats */}
      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        {/* Buscador */}
        <div className="p-3 border-b">
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        {/* Lista de usuarios */}
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

      {/* Panel derecho - Conversación */}
      <div className="w-2/3 flex flex-col">
        {/* Encabezado del chat */}
        <div className="p-4 border-b bg-white font-semibold text-gray-800">
          {usuarios.find((u) => u.id === chatSeleccionado)?.nombre ||
            "Selecciona un chat"}
        </div>

        {/* Mensajes */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-100">
          {mensajes.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.remitente === "usuario" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow-sm text-sm ${
                  m.remitente === "usuario"
                    ? "bg-green-100 text-gray-900"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p>{m.texto}</p>
                <span className="block text-xs text-gray-500 mt-1">{m.tiempo}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input de mensaje */}
        <div className="p-3 border-t flex items-center space-x-2 bg-white">
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 text-sm border rounded-full focus:outline-none focus:ring focus:ring-blue-200"
          />
          <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
