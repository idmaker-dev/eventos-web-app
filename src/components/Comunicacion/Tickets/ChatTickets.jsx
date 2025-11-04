import React from 'react';
import { User, Clock, AlertCircle, Phone, Mail, MessageSquare, Send } from 'lucide-react';
import { Button, Input } from '@headlessui/react';
import clsx from 'clsx';

export default function ChatTickets({ ticket }) {
  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-full bg-fondoVs rounded-r-3xl">
        <div className="text-center p-10">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-xl font-bold mb-2 text-gray-600">Chat de Tickets</p>
          <p className="text-gray-400">Selecciona un ticket para ver la conversación.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-fondoVs rounded-r-3xl flex flex-col">
      {/* Header del Chat */}
      <div className="p-4 border-b border-gray-200 rounded-tr-3xl dark:border-gray-700 bg-white dark:bg-[#1a1a1a]">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              ticket.estado === 'urgente' ? 'bg-red-500' : 'bg-blue-500'
            }`}></div>
          </div>
          
          {/* Información del usuario */}
          <div className="flex-1">
            <p className="text-xl font-semibold text-casal dark:text-white flex items-center gap-2 ">
                <AlertCircle className="w-5 h-5" />
                Ticket {ticket.ticket}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                 {ticket.nombre}
              </span>
              
            </div>
          </div>
          
          {/* Estado */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            ticket.estado === 'urgente' 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            {ticket.estado === 'urgente' ? 'Urgente' : 'Activo'}
          </div>
        </div>
      </div>

      {/* Información adicional del ticket */}
      {/* <div className="p-4 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Phone className="w-4 h-4" />
            <span>+52 {ticket.telefono || '555 123 4567'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Mail className="w-4 h-4" />
            <span>{ticket.email || `${ticket.nombre.toLowerCase().replace(' ', '.')}@email.com`}</span>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Problema:</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {ticket.problema || "No puedo acceder a mi cuenta, me aparece error al iniciar sesión."}
          </p>
        </div>
      </div> */}

          {/* Área de mensajes */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="space-y-4">

         {/* Renderizar mensajes reales del ticket */}
         {ticket.mensajes && ticket.mensajes.length > 0 ? (
           ticket.mensajes.map((mensaje, index) => {
             const esSoporte = mensaje.remitente === "Soporte";

             return (
               <div key={index} className={`flex gap-3 ${esSoporte ? 'flex-row-reverse' : ''}`}>
                 {/* Avatar */}
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                   esSoporte 
                     ? 'bg-casal' 
                     : 'bg-gray-300 dark:bg-gray-600'
                 }`}>
                   {esSoporte ? (
                     <span className="text-white text-xs font-bold">S</span>
                   ) : (
                     <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                   )}
                 </div>

                 {/* Mensaje */}
                 <div className="flex-1">
                   <div className={`rounded-lg p-3 shadow-sm max-w-[80%] relative ${
                     esSoporte 
                       ? 'bg-casal text-white ml-auto' 
                       : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                   }`}>
                     {/* Nombre del remitente (solo para cliente) */}
                     {!esSoporte && (
                       <p className="text-xs font-medium text-casal dark:text-casal mb-1">
                         {mensaje.remitente}
                       </p>
                     )}

                     {/* Texto del mensaje */}
                     <p className="text-sm">
                       {mensaje.texto}
                     </p>

                     {/* Hora */}
                     <p className={`text-xs mt-1 absolute bottom-1 right-2 ${
                       esSoporte 
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
           /* Mensaje por defecto si no hay mensajes */
           <div className="flex items-center justify-center h-32 text-gray-500">
             <div className="text-center">
               <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
               <p className="text-sm">No hay mensajes en esta conversación</p>
               <p className="text-xs mt-1">Los mensajes aparecerán aquí cuando inicies la conversación</p>
             </div>
           </div>
         )}
        </div>
      </div>

      {/* Input para responder */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a]">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Escribe tu respuesta..."
            className={clsx(
              'flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm',
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
              'focus:outline-none focus:ring-2 focus:ring-casal focus:border-transparent'
            )}
          />
          <Button className="px-4 py-2 bg-casal text-white rounded-lg hover:bg-casal/90 transition-colors flex items-center gap-2">
            <Send className="w-4 h-4" />
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
}