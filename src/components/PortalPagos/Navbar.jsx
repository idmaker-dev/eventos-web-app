import React from 'react'
import logo from "../../assets/recursos/logoTentativo2.svg";
import { Link, useParams } from 'react-router-dom';

export default function Navbar({ invitado }) {
  const { invitadoId } = useParams();
  
  return (
    <div className="bg-casal w-full py-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-4 sm:px-2 lg:px-8">
          <Link to={`/PortalPagos/${invitadoId}`}>
            <img src={logo} alt="Logo" className="w-32 h-full" />
          </Link>
          <p className="text-gray-50 border-l border-gray-300 pl-4 text-lg font-semibold">
            {invitado?.nombre_completo || "Invitado"}
          </p>
        </div>
      </div>
  )
}
