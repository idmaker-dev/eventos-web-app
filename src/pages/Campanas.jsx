import React from "react";
import CampanasInx from "../components/Campana/CampanasInx.jsx";

export default function Campanas() {
  return (
    <div className="p-3 md:p-6 bg-white dark:bg-fodoBlack rounded-3xl shadow-md min-h-screen">
      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        Módulo de Campaña
      </h1>
      <p className="text-gray-500 dark:text-gray-200">
        Automatiza y personaliza las respuestas de atención al cliente
      </p>
      <div className="mt-3">
        <CampanasInx></CampanasInx>
      </div>
    </div>
  );
}
