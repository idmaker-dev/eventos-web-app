import React, { useState } from "react";
import "../styles/pages/Distribucion.css";
import Mesa from "../components/Distribuccion/Mesa.jsx";

export default function Distribucion() {

  const [mesas, setMesas] = useState([
    { numero: 1, invitados: 5, capacidad: 8 },
    { numero: 2, invitados: 3, capacidad: 8 },
    // { numero: 3, invitados: 6, capacidad: 8 },
    // { numero: 4, invitados: 8, capacidad: 8 },
    // { numero: 5, invitados: 2, capacidad: 8 },
    // { numero: 6, invitados: 5, capacidad: 8 },
    // { numero: 7, invitados: 0, capacidad: 8 },
    // { numero: 8, invitados: 4, capacidad: 8 },
  ]);

   const asignarInvitadosMesa = (numeroMesa, datosInvitado) => {
    setMesas(prev => prev.map(mesa => 
      mesa.numero === numeroMesa 
        ? { ...mesa, invitados: Math.min(mesa.invitados + datosInvitado.cantidad, mesa.capacidad) }
        : mesa
    ));
  };


  return (
    <div>
      <div>
        <div className="flex justify-between items-center mb-4 border p-4 rounded-full bg-gray-50 shadow">
          <div className="flex space-x-2">
            <button className="bg-purple-800 text-white py-1 px-4 rounded-full text-base">
              Layout del Salón
            </button>
            <button className="bg-white border text-gray-600 py-1 px-4 rounded-full text-base ">
              Auto-Asignar
            </button>
          </div>
          <div>
            <button className="bg-green-600 text-white py-1 px-4 rounded-full text-base">
              Guardar Distribución
            </button>
          </div>
        </div>
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="xl:w-80 flex flex-col md:flex-row lg:flex-col justify-center">
            <div className="bg-gray-50 p-4 rounded-lg  mb-4 md:mb-0 md:mr-4 lg:mb-4 lg:mr-0">
              <h3 className="text-lg font-semibold mb-2 flex justify-between items-center">
                Invitados sin Asignar
                <span className="text-sm text-gray-500">(20 personas)</span>
              </h3>
              <ul className=" space-y-2">
                <li className="bg-white p-2 rounded border-separate border-dashed border-2 border-gray-200">
                  Familia García (4 personas)
                </li>
                <li className="bg-white p-2 rounded border-separate border-dashed border-2 border-gray-200">
                  María López (1 persona)
                </li>
                <li className="bg-white p-2 rounded border-separate border-dashed border-2 border-gray-200">
                  Familia Rodríguez (3 personas)
                </li>
                <li className="bg-white p-2 rounded border-separate border-dashed border-2 border-gray-200">
                  Carlos Mendez (1 persona)
                </li>
                <li className="bg-white p-2 rounded border-separate border-dashed border-2 border-gray-200">
                  Compañeros trabajo (4 personas)
                </li>
                <li className="bg-white p-2 rounded border-separate border-dashed border-2 border-gray-200">
                  Ana Sofi (1 persona)
                </li>
                <li className="bg-white p-2 rounded border-separate border-dashed border-2 border-gray-200">
                  Compañeros Padel (2 personas)
                </li>
                <li className="bg-white p-2 rounded border-separate border-dashed border border-gray-200">
                  Familia Lara (7 personas)
                </li>
              </ul>
              <p className="nota">
                Arrastra los invitados a las mesas del plano para asignar
                lugares
              </p>
            </div>
          </div>
          <div className="flex-1">
            <div className="p-2 border border-gray-300 rounded-lg relative w-full min-h-[500px] bg-white">
              <div className="">
                {/* absolute top-2 transform */}
                <h3 className="text-lg font-semibold mb-4">
                  Plano del Salón - "Jardín Romántico"
                </h3>
              </div>
              <div className="flex gap-1 relative w-full min-h-[480px] overflow-auto ">
                <div className="grid content-between relative">
                  <div></div>
                  <div className="rounded px-6 py-1 rotate-90 border flex items-center justify-center text-gray-600 font-semibold bg-gray-50">
                    Entrada
                  </div>
                  <div>
                    <div className="border-2 border-separate border-dashed border-gray-300 w-24 h-24 flex items-center justify-center text-center p-2 rounded-md text-gray-500 font-semibold bg-white shadow">
                      Barra 
                    </div>
                  </div>
                </div>
                <div className="w-80 border grid grid-cols-2 gap-3">
                  {mesas.map((mesa) => (
                    <Mesa
                      key={mesa.numero}
                      numeroMesa={mesa.numero}
                      invitadosAsignados={mesa.invitados}
                      capacidadMaxima={mesa.capacidad}
                      onDrop={asignarInvitadosMesa}
                    />
                  ))}
                </div>
                <div className="w-64 grid grid-cols-1 content-between justify-center items-center">
                  <div>
                    <div className="rounded px-6 py-1 w-40 mx-auto border-separate border-2 border-dashed text-center text-gray-600 font-semibold bg-gray-50">
                      Mesa principal <br />
                      <span className="text-gray-500 minion-medium-italic">Ana y Juan </span>
                    </div>
                  </div>
                  <div>
                    <div className="rounded-full w-52 h-52 p-2 mx-auto border-separate border-4 border-dashed flex items-center justify-center text-gray-600 font-semibold bg-gray-50">
                      Escenario
                    </div>
                  </div>
                  <div></div>
                </div>
                <div></div>
                <div></div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
              Asignados: <b>27/48</b> Invitados <span className="mx-1">|</span> Mesas Ocupados <span className="text-amber-500">4/8</span> <span className="mx-1">|</span> Capacidad utilizada: <span className="text-amber-500">56%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
