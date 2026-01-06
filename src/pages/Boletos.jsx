import React from "react";
import Boleto from "../components/Boletos/Boleto";
import { useAuth } from "../hooks/useAuth";

export default function Boletos() {
  const { user } = useAuth();

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#121212] rounded-2xl py-6">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-casal mb-2">
            Configuración de Boletos
          </h1>
          <p className="text-gray-600">
            {user?.role === "admin" 
              ? "Sube el diseño de invitación y configura la posición del código QR"
              : "Genera tu boleto con código QR personalizado"}
          </p>
        </div>
        
        <Boleto />
      </div>
    </div>
  );
}
