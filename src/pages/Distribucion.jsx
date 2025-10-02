import React, { useState } from "react";
import "../styles/pages/Distribucion.css";
import Mesa from "../components/Distribuccion/Mesa.jsx";

export default function Distribucion() {
  const [mesas, setMesas] = useState([
    { numero: 1, invitados: 5, capacidad: 8 },
    { numero: 2, invitados: 3, capacidad: 8 },
    { numero: 3, invitados: 6, capacidad: 8 },
    { numero: 4, invitados: 8, capacidad: 8 },
    { numero: 5, invitados: 2, capacidad: 8 },
    { numero: 6, invitados: 5, capacidad: 8 },
    { numero: 7, invitados: 0, capacidad: 8 },
    { numero: 8, invitados: 4, capacidad: 8 },
  ]);

  const [invitados, setInvitados] = useState([
    { id: 1, nombre: "Familia García", cantidad: 4 },
    { id: 2, nombre: "María López", cantidad: 1 },
    { id: 3, nombre: "Familia Rodríguez", cantidad: 3 },
    { id: 4, nombre: "Carlos Mendez", cantidad: 1 },
    { id: 5, nombre: "Compañeros trabajo", cantidad: 4 },
    { id: 6, nombre: "Ana Sofi", cantidad: 1 },
    { id: 7, nombre: "Compañeros Padel", cantidad: 2 },
    { id: 8, nombre: "Familia Lara", cantidad: 7 },
    { id: 5, nombre: "Compañeros trabajo", cantidad: 4 },
    { id: 6, nombre: "Ana Sofi", cantidad: 1 },
    { id: 7, nombre: "Compañeros Padel", cantidad: 2 },
    { id: 8, nombre: "Familia Lara", cantidad: 7 },
    { id: 5, nombre: "Compañeros trabajo", cantidad: 4 },
    { id: 6, nombre: "Ana Sofi", cantidad: 1 },
    { id: 7, nombre: "Compañeros Padel", cantidad: 2 },
    { id: 8, nombre: "Familia Lara", cantidad: 7 },
  ]);

  const asignarInvitadosMesa = (numeroMesa, datosInvitado) => {
    setMesas(prev => prev.map(mesa => 
      mesa.numero === numeroMesa 
        ? { ...mesa, invitados: Math.min(mesa.invitados + datosInvitado.cantidad, mesa.capacidad) }
        : mesa
    ));
  };

  const mitad = Math.ceil(mesas.length / 2);
  const mesasIzquierda = mesas.slice(0, mitad);
  const mesasDerecha = mesas.slice(mitad);

  const getGridClasses = (cantidadMesas) => {
    if (cantidadMesas <= 2) {
      return "grid grid-cols-1 gap-3 h-full content-center justify-items-center";
    } else if (cantidadMesas === 3) {
      return "grid grid-cols-1 gap-3 h-full content-between justify-items-center";
    } else {
      return "grid grid-cols-2 gap-3 h-full content-between";
    }
  };

  return (
    <div className="p-4">
      {/* Header con botones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 border p-4 rounded-full bg-gray-50 shadow">
        <div className="flex flex-wrap gap-2">
          <button className="bg-purple-800 text-white py-1 px-4 rounded-full text-sm sm:text-base">
            Layout del Salón
          </button>
          <button className="bg-white border text-gray-600 py-1 px-4 rounded-full text-sm sm:text-base">
            Auto-Asignar
          </button>
        </div>
        <div>
          <button className="bg-green-600 text-white py-1 px-4 rounded-full text-sm sm:text-base w-full sm:w-auto">
            Guardar Distribución
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Lista de invitados - Responsivo */}
        <div className="w-full xl:w-80 flex-shrink-0">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 flex justify-between items-center">
              Invitados sin Asignar
              <span className="text-sm text-gray-500">(20 personas)</span>
            </h3>
            <div className="max-h-80 xl:max-h-96 overflow-y-auto">
             <ul className="space-y-2">
                {invitados.map(invitado => (
                  <li key={invitado.id} className="bg-white p-2 rounded border-separate border-dashed border-2 border-gray-200">
                    {invitado.nombre} ({invitado.cantidad} personas)
                  </li>
                ))}
              </ul>
            </div>
            <p className="nota mt-3 text-sm text-gray-600">
              Arrastra los invitados a las mesas del plano para asignar lugares
            </p>
          </div>
        </div>

        {/* Plano del salón con scroll horizontal */}
        <div className="flex-1 min-w-0">
          <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                Plano del Salón - "Jardín Romántico"
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Total de mesas: {mesas.length} | Izquierda: {mesasIzquierda.length} | Derecha: {mesasDerecha.length}
              </p>
            </div>
            
            {/* Container con scroll horizontal */}
            <div className="overflow-x-auto overflow-y-hidden pr-8">
              <div className="min-w-[900px] p-4 ">
                <div className="flex gap-4 h-[500px]">
                  {/* Columna izquierda */}
                  <div className="flex flex-col justify-between w-24 flex-shrink-0">
                    <div></div>
                    {/* Mover entrada */}
                    <div className="rounded px-6 py-1 rotate-90 border flex items-center justify-center text-gray-600 font-semibold bg-gray-50 whitespace-nowrap">
                      Entrada
                    </div>
                    {/* Mover barra */}
                    <div>
                      <div className="border-2 border-separate border-dashed border-gray-300 w-24 h-24 flex items-center justify-center text-center p-2 rounded-md text-gray-500 font-semibold bg-white shadow">
                        Barra 
                      </div>
                    </div>
                  </div>

                  {/* Mesas izquierdas - Primera mitad */}
                  <div className="w-[21rem] flex-shrink-0">
                    <div className={getGridClasses(mesasIzquierda.length)}>
                      {/*Mover cada mesa */}
                      {mesasIzquierda.map((mesa) => (
                        <Mesa
                          key={`left-${mesa.numero}`}
                          numeroMesa={mesa.numero}
                          invitadosAsignados={mesa.invitados}
                          capacidadMaxima={mesa.capacidad}
                          onDrop={asignarInvitadosMesa}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Centro - Mesa principal y pista de baile */}
                  <div className="w-64 flex-shrink-0 flex flex-col justify-between items-center">
                    {/*Mover la mesa principal */}
                    <div>
                      <div className="rounded px-6 py-3 w-48 mx-auto border-separate border-2 border-dashed text-center text-gray-600 font-semibold bg-gray-50">
                        Mesa principal <br />
                        <span className="text-gray-500 text-sm italic">Ana y Juan</span>
                      </div>
                    </div>
                    {/*Mover la pista de baile */}
                    <div>
                      <div className="rounded-full w-52 h-52 text-center mx-auto border-orange-300 border-2 border-dashed flex items-center justify-center text-gray-600 font-semibold bg-gray-50">
                        <span className="text-orange-600 text-2xl">Pista de <br /> Baile</span>
                      </div>
                    </div>
                    <div></div>
                  </div>

                  {/* Mesas derechas - Segunda mitad */}
                  <div className="w-80 flex-shrink-0">
                    {/*Mover la mesas */}
                    <div className={getGridClasses(mesasDerecha.length)}>
                      {mesasDerecha.map((mesa) => (
                        <Mesa
                          key={`right-${mesa.numero}`}
                          numeroMesa={mesa.numero}
                          invitadosAsignados={mesa.invitados}
                          capacidadMaxima={mesa.capacidad}
                          onDrop={asignarInvitadosMesa}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Columna derecha */}
                  <div className="flex flex-col justify-between w-28 flex-shrink-0">
                    <div></div>
                    {/* Mover el escenario */}
                    <div>
                      <div className="border-2 border-separate border-dashed border-gray-300 w-28 h-28 flex flex-col items-center justify-center text-center p-2 rounded-md text-gray-500 font-semibold bg-white shadow">
                        <p>ESCENARIO</p>
                        <p className="text-xs mt-1">DJ Música</p>
                      </div>
                    </div>
                    {/* mover la barra de BUFFET */}
                    <div>
                      <div className="border-2 border-separate border-dashed border-gray-300 w-28 h-20 flex items-center justify-center text-center p-2 rounded-md text-gray-500 font-semibold bg-white shadow">
                        BUFFET 
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicador de scroll en móvil */}
            <div className="block lg:hidden bg-blue-50 border-t border-blue-200 px-4 py-2 text-center">
              <span className="text-xs text-blue-600 font-medium">
                ↔ Desliza horizontalmente para ver todo el plano
              </span>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="mt-4 text-xs sm:text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-full overflow-x-auto">
            <div className="whitespace-nowrap">
              Asignados: <b>27/48</b> Invitados 
              <span className="mx-1 hidden sm:inline">|</span> 
              <br className="sm:hidden" />
              Mesas Ocupados <span className="text-amber-500">{mesas.length}/8</span> 
              <span className="mx-1 hidden sm:inline">|</span> 
              <br className="sm:hidden" />
              Capacidad utilizada: <span className="text-amber-500">56%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}