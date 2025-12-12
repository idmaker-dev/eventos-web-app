import React from 'react'
import CompBoletos from '../components/Boletos/Boleto.jsx';

export default function Boletos() {
  return (
    <div className="p-3 md:p-6 bg-white dark:bg-fodoBlack rounded-3xl shadow-md min-h-full">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Módulo de Boletos</h1>
        <p className="text-gray-500 dark:text-gray-200">
           Carga el diseño de tu boleto y personalízalo fácilmente. <br />
Añade el código QR, ajusta los datos necesarios y descarga los boletos listos para enviar a tus asistentes.
        </p>
        <div className='mt-3'>
            <CompBoletos></CompBoletos>
        </div>
    </div>
  )
}
