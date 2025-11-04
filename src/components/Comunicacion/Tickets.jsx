import { Button, Input } from "@headlessui/react";
import clsx from "clsx";
import { Minus, Plus, Search } from "lucide-react";
import { Tooltip } from "../ui/Tooltip.jsx";
import React, {useState} from "react";
import ListaTickets from "./Tickets/ListaTickets.jsx";
import { ticketsData } from "./Tickets/ticketsData";
import ChatTickets from "./Tickets/ChatTickets.jsx";

export default function Tickets() {
 const [ticketSeleccionado, setTicketSeleccionado] = useState(null);

 const handleSeleccionarTicket = (ticket) => {
   console.log("Ticket seleccionado:", ticket);
   setTicketSeleccionado(ticket);
 };
  return (
    <div>
      <div className="h-[80vh] bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-md">
        <div className="flex">
            <div className="w-80 h-full border-r border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    {/* <div className="flex items-center space-x-4">
                       <Tooltip content="Agregar boleto">
                         <Button
                            variant="outline"
                            className=" flex items-center justify-center gap-1 text-sm px-2 py-1 text-white font-semibold rounded-full border bg-Acapulco border-green-600 dark:border-green-800 hover:bg-casal dark:hover:bg-casal"
                        >
                            <Plus className="h-5 w-5" /> Boletos
                        </Button>
                          </Tooltip>
                         <Tooltip content="Eliminar boleto">
                            <Button
                            variant="outline"
                            className=" flex items-center justify-center gap-1 text-sm px-2 py-1 text-white font-semibold rounded-full border bg-red-500 border-red-600 dark:border-red-800 hover:bg-red-400 dark:hover:bg-red-700"
                        >
                            <Minus className="h-5 w-5" /> Boletos
                        </Button>
                            </Tooltip>
                    </div> */}
                    <div className="relative">
                        <Input 
                            type="text"
                            placeholder="Buscar..."
                            className={clsx(
                                'mt-0 block w-full rounded-3xl border bg-white/5 px-3 py-1.5 text-sm/6 text-white',
                                'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                            )}
                        />  
                        <div className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
                            <Search className="h-5 w-5" />
                        </div>
                    </div>
                </div>
                <div className="h-[calc(81.2vh-80px)] rounded-bl-3xl overflow-y-auto">
                    <ListaTickets  ticketsData={ticketsData} onSeleccionar={handleSeleccionarTicket} ticketSeleccionado={ticketSeleccionado} />
                </div>
            </div> 
            <div className="flex-1">
                {/* Aquí va el contenido del ticket seleccionado */}
                {!ticketSeleccionado ? (
                <div className="flex items-center justify-center h-full bg-fondoVs rounded-r-3xl">
                    <div className="text-center p-10">
                        <img src="/logop.png" alt="" srcset="" className="h-full w-24 mx-auto" />
                        <p className="text-4xl font-bold mb-4 text-casal">Ticket</p>
                        <p className="text-gray-400">Selecciona un ticket para ver los detalles y mensajes.</p>
                    </div>
                </div>
                ) : (
                <div>
                    <ChatTickets ticket={ticketSeleccionado}        />

                </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
