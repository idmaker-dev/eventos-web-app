import React from "react";
import "../styles/pages/Pagos.css";

export default function Pagos() {
  const data = [
    {
      nombre: "Ana Sofía Garza",
      pagado: 15000,
      total: 20000,
      estado: "Pendiente",
      accion: "Verificar Comprobante",
    },
    {
      nombre: "Carlos Martínez",
      pagado: 20000,
      total: 20000,
      estado: "Aprobado",
      accion: "Ver historial",
    },
    {
      nombre: "David Jiménez",
      pagado: 5000,
      total: 20000,
      estado: "Parcial",
      accion: "Ver historial",
    },
    {
      nombre: "Victor Ocampo",
      pagado: 20000,
      total: 20000,
      estado: "Aprobado",
      accion: "Verificar Comprobante",
    },
    {
      nombre: "Juan Antonio",
      pagado: 20000,
      total: 20000,
      estado: "Aprobado",
      accion: "Ver historial",
    },
    {
      nombre: "Javier Lara Flores",
      pagado: 12000,
      total: 20000,
      estado: "Pendiente",
      accion: "Verificar Comprobante",
    },
    {
      nombre: "Esmeralda Jiménez",
      pagado: 3000,
      total: 20000,
      estado: "Parcial",
      accion: "Ver historial",
    },
  ];

  const getEstadoClass = (estado) => {
    if (estado === "Pendiente") return "estado pendiente";
    if (estado === "Aprobado") return "estado aprobado";
    if (estado === "Parcial") return "estado parcial";
    return "";
  };

  return (
    <div className="pagos-container">
      <h2 className="pagos-titulo">Módulo de pagos</h2>
      <p className="pagos-subtitulo">
        Seguimiento de pagos de asistentes mediante <a href="#">tabla de pagos</a>
      </p>

      <div className="pagos-header">
        <input type="text" placeholder="Buscar asistente" className="buscar" />
        <button className="btn-csv">Exportar en CSV</button>
      </div>

      <div className="pagos-tabla">
        <div className="pagos-encabezados">
          <div>Asistente</div>
          <div>Progreso</div>
          <div>Total pagado</div>
          <div>Estado</div>
          <div>Acción</div>
        </div>

        {data.map((item, idx) => {
          const porcentaje = (item.pagado / item.total) * 100;
          return (
            <div key={idx} className="pagos-fila">
              <div>{item.nombre}</div>

              {/* Barra de progreso */}
              <div className="barra-progreso">
                <div
                  className="barra-fill"
                  style={{ width: `${porcentaje}%` }}
                ></div>
              </div>

              <div className="col-pagado">
                ${item.pagado.toLocaleString()}/${item.total.toLocaleString()}
              </div>

              <div className={getEstadoClass(item.estado)}>
                {item.estado}
              </div>

              <div>
                <button className="btn-accion">{item.accion}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
