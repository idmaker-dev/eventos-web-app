import React, { useState } from "react";
import "../styles/pages/Mesas.css";

export default function Mesas() {
  const [invitados] = useState([
  { id: 1, nombre: "Familia García (4 personas)" },
  { id: 2, nombre: "María López" },
  { id: 3, nombre: "Familia Rodríguez (3 personas)" },
  { id: 4, nombre: "Carlos Mendez" },
  { id: 5, nombre: "Compañeros trabajo (4 personas)" },
  { id: 6, nombre: "Ana Sofi" },
  { id: 7, nombre: "Compañeros Padel" },
  { id: 8, nombre: "Familia Lara (7 personas)" },
]);


  const mesas = [
    { id: 1, nombre: "Mesa 1", ocupados: 8, capacidad: 8 },
    { id: 2, nombre: "Mesa 2", ocupados: 6, capacidad: 8 },
    { id: 3, nombre: "Mesa 3", ocupados: 0, capacidad: 8 },
    { id: 4, nombre: "Mesa 4", ocupados: 0, capacidad: 8 },
    { id: 5, nombre: "Mesa 5", ocupados: 5, capacidad: 8 },
    { id: 6, nombre: "Mesa 6", ocupados: 8, capacidad: 8 },
    { id: 7, nombre: "Mesa 7", ocupados: 6, capacidad: 8 },
    { id: 9, nombre: "Mesa 9", ocupados: 3, capacidad: 8 },
  ];

  return (
    <div className="distribucion-container">
      {/* Barra superior */}
      <div className="toolbar">
        <div className="toolbar-left">
          <button className="btn">Layout del Salón</button>
          <button className="btn">Auto-Asignar</button>
        </div>
        <button className="btn-guardar">Guardar Distribución</button>
      </div>

      <div className="layout">
        {/* Invitados sin asignar */}
        <div className="invitados">
          <h3>Invitados sin Asignar <span>(20 personas)</span></h3>
          <ul>
            {invitados.map((i) => (
              <li key={i.id}>{i.nombre}</li>
            ))}
          </ul>
          <p className="arrastre">Arrastra los invitados a las mesas del plano para asignar lugares</p>
        </div>

        {/* Plano del salón */}
        <div className="salon">
          <h3>Plano del Salón - "Jardín Romántico"</h3>
          <div className="plano">
            {mesas.map((mesa) => (
              <div key={mesa.id} className="mesa">
                <p>{mesa.nombre}</p>
                <span>
                  {mesa.ocupados}/{mesa.capacidad}
                </span>
              </div>
            ))}
            <div className="mesa-principal">Mesa Principal <br/> Ana & Juan</div>
            <div className="pista">PISTA DE BAILE</div>
            <div className="escenario">ESCENARIO<br/>DJ Música</div>
            <div className="barra">BARRA</div>
            <div className="buffet">BUFFET</div>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="resumen">
        Asignados: <strong>27/48 invitados</strong> | 
        Mesas ocupadas: <strong>4/6</strong> | 
        Capacidad utilizada: <span className="porcentaje">56%</span>
      </div>
    </div>
  );
}
