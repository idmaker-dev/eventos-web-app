import React from "react";
import { Accessibility } from "lucide-react";

export default function StatsPanel({ stats = {} }) {
  return (
    <div className="border rounded-3xl dark:border-gray-700 lg:w-40 bg-gray-50 dark:bg-[#1a1a1a] flex flex-col">
      <div className="text-2xl p-4 border-b text-center font-semibold text-gray-700 dark:text-white">
        Asientos
      </div>
      <div className="p-4 flex flex-col gap-4">
        <StatRow color="gray" label="Disponible" value={`${stats.disponibles} Asiento`} />
        <StatRow color="blue" label="Poco llena" value={`${stats.pocoLlenas} Asiento`} />
        <StatRow color="yellow" label="Media" value={`${stats.medias} Asiento`} />
        <StatRow color="orange" label="Casi lleno" value={`${stats.casiLlenas} Asiento`} />
        <StatRow color="green" label="Ocupado" value={`${stats.ocupadas} Asiento`} />
        <div className="flex items-center gap-2">
          <div className="border-2 border-gray-300 rounded-lg w-8 h-8 bg-gray-200 flex items-center justify-center">
            <Accessibility className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Silla de rueda</p>
            <p className="text-xs text-gray-500">({stats.sillasEspeciales} Asiento)</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 font-semibold">Mesas Ocupadas:</p>
          <p className="text-casal text-3xl font-semibold">{stats.mesasOcupadas}/{stats.totalMesas}</p>
        </div>

        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Capacidad Utilizada:</p>
          <p className={`text-3xl font-semibold ${
            stats.porcentajeCapacidadUtilizada >= 90 ? "text-red-600" :
            stats.porcentajeCapacidadUtilizada >= 70 ? "text-orange-600" :
            stats.porcentajeCapacidadUtilizada >= 50 ? "text-yellow-600" :
            stats.porcentajeCapacidadUtilizada > 0 ? "text-blue-600" :
            "text-gray-600"
          }`}>{stats.porcentajeCapacidadUtilizada}%</p>
        </div>
        
        {/* 🆕 Cuotas de Capacidades */}
        {stats.cuotas && stats.cuotas.length > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-2">Distribución de Capacidades</p>
            <div className="space-y-2">
              {stats.cuotas.map((cuota, index) => {
                const porcentajeAsignado = cuota.cantidad > 0 ? Math.round((cuota.asignadas / cuota.cantidad) * 100) : 0;
                const disponibles = cuota.cantidad - cuota.asignadas;
                return (
                  <div key={index} className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{cuota.capacidad} asientos</span>
                      <span className={`font-bold ${
                        disponibles === 0 ? "text-red-600" :
                        disponibles <= 3 ? "text-orange-600" :
                        "text-green-600"
                      }`}>
                        {cuota.asignadas}/{cuota.cantidad}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full ${
                          porcentajeAsignado === 100 ? "bg-red-500" :
                          porcentajeAsignado >= 80 ? "bg-orange-500" :
                          "bg-green-500"
                        }`}
                        style={{ width: `${porcentajeAsignado}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {disponibles} disponible{disponibles !== 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({ color, label, value }) {
  const bg = color === "gray" ? "bg-gray-200 border-gray-300" :
             color === "blue" ? "bg-blue-400 border-blue-500" :
             color === "yellow" ? "bg-yellow-500 border-yellow-700" :
             color === "orange" ? "bg-orange-500 border-orange-700" :
             "bg-green-500 border-green-700";
  return (
    <div className="flex items-center gap-2">
      <div className={`border-2 rounded-lg w-8 h-8 ${bg}`}></div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">{label}</p>
        <p className="text-xs text-gray-500">{value}</p>
      </div>
    </div>
  );
}