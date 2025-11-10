import React from 'react'
import CompClientes from '../components/Clientes/CompClientes.jsx';

export default function Clientes() {
  return (
    <div className="p-3 md:p-6 bg-white dark:bg-fodoBlack rounded-3xl shadow-md min-h-screen">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Módulo de Clientes</h1>
        <p className="text-gray-500 dark:text-gray-200">
            Gestiona solicitudes personalizadas de los asistentes. Cada solicitud genera un ticket que es atendido por un asesor
            humano, ideal para casos como cambios de boletos, actualizaciones de información o aclaraciones de pago
        </p>
        <div className='mt-3'>
            <CompClientes></CompClientes>
        </div>
    </div>
  )
}
