import React from "react";
import "../styles/pages/Distribucion.css";

export default function Distribucion() {
  return (
    <div className="distribucion-container">
      {/* Encabezado de acciones */}
      <div className="acciones-header">
        <div className="acciones-botones">
          <button className="btn-morado">Layout del Salón</button>
          <button className="btn-gris">Auto-Asignar</button>
        </div>
        <button className="btn-verde">Guardar Distribución</button>
      </div>

      <div className="contenido">
        {/* Columna izquierda - Invitados sin asignar */}
        <div className="columna invitados">
          <h3>
            Invitados sin Asignar <span>(20 personas)</span>
          </h3>
          <ul className="lista-invitados">
            <li>
              <strong>Familia García</strong> (4 personas)
              <ul>
                <li>María López</li>
              </ul>
            </li>
            <li>
              <strong>Familia Rodríguez</strong> (3 personas)
            </li>
            <li>Carlos Mendez</li>
            <li>
              <strong>Compañeros trabajo</strong> (4 personas)
            </li>
            <li>Ana Sofi</li>
            <li>Compañeros Padel</li>
            <li>
              <strong>Familia Lara</strong> (7 personas)
            </li>
          </ul>
          <p className="nota">
            Arrastra los invitados a las mesas del plano para asignar lugares
          </p>
        </div>

        {/* Columna derecha - Plano del salón */}
        <div className="columna salon">
          <h3>Plano del Salón - "Jardín Romántico"</h3>

          {/* Contenedor con scroll */}
          <div className="plano-wrapper">
            <div className="plano">
              {/* Elementos fijos */}
              <div className="entrada">ENTRADA</div>
              <div className="barra">BARRA</div>
              <div className="pista">PISTA DE BAILE</div>
              <div className="escenario">
                ESCENARIO
                <br />
                DJ Música
              </div>
              <div className="buffet">BUFFET</div>

              {/* Mesas distribuidas */}
              <div className="mesa" style={{ top: "60px", left: "200px" }}>
                <span className="mesa-nombre">Mesa 3</span>
                <span className="mesa-info">0/8</span>
              </div>

              <div className="mesa ocupada" style={{ top: "60px", left: "400px" }}>
                <span className="mesa-nombre">Mesa 1</span>
                <span className="mesa-info">8/8</span>
              </div>

              <div className="mesa ocupada" style={{ top: "60px", left: "600px" }}>
                <span className="mesa-nombre">Mesa 7</span>
                <span className="mesa-info">6/8</span>
              </div>

              <div className="mesa ocupada" style={{ top: "60px", left: "800px" }}>
                <span className="mesa-nombre">Mesa 2</span>
                <span className="mesa-info">6/8</span>
              </div>

              <div className="mesa ocupada" style={{ bottom: "80px", left: "200px" }}>
                <span className="mesa-nombre">Mesa 9</span>
                <span className="mesa-info">3/8</span>
              </div>

              <div className="mesa" style={{ bottom: "80px", left: "400px" }}>
                <span className="mesa-nombre">Mesa 4</span>
                <span className="mesa-info">0/8</span>
              </div>

              <div className="mesa ocupada" style={{ bottom: "80px", left: "600px" }}>
                <span className="mesa-nombre">Mesa 6</span>
                <span className="mesa-info">8/8</span>
              </div>

              <div className="mesa ocupada" style={{ bottom: "80px", left: "800px" }}>
                <span className="mesa-nombre">Mesa 5</span>
                <span className="mesa-info">5/8</span>
              </div>

              {/* Mesa principal */}
              <div className="mesa-principal">
                Mesa Principal
                <br />
                Ana & Juan
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="resumen">
            Asignados: <strong>27/48 invitados</strong> | Mesas ocupadas:{" "}
            <strong>4/6</strong> | Capacidad utilizada:{" "}
            <span className="porcentaje">56%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
