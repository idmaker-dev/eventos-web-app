import React from 'react'
import logo from "../../assets/recursos/logoTentativo2.svg";

export default function Navbar({ usuario = { nombre: "María González" } }) {
  
  return (
    <div className="bg-casal w-full py-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-4 sm:px-2 lg:px-8">
            <img src={logo} alt="Logo" className="w-32 h-full" />
          <p className="text-gray-50 border-l border-gray-300 pl-4 text-lg font-semibold">
            {`Hola, ${usuario.nombre}` }
          </p>
        </div>
      </div>
  )
}
