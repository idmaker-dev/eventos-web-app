import React from "react";
import "../styles/pages/Pagos.css";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

export default function Pagos() {
  const data = [
    { nombre: "Ana Sofía Garza", pagado: 15000, total: 20000, estado: "Pendiente", accion: "Verificar Comprobante" },
    { nombre: "Carlos Martínez", pagado: 20000, total: 20000, estado: "Aprobado", accion: "Ver historial" },
    { nombre: "David Jiménez", pagado: 5000, total: 20000, estado: "Parcial", accion: "Ver historial" },
    { nombre: "Víctor Ocampo", pagado: 20000, total: 20000, estado: "Aprobado", accion: "Verificar Comprobante" },
    { nombre: "Juan Antonio", pagado: 20000, total: 20000, estado: "Aprobado", accion: "Ver historial" },
    { nombre: "Javier Lara Flores", pagado: 12000, total: 20000, estado: "Pendiente", accion: "Verificar Comprobante" },
    { nombre: "Esmeralda Jiménez", pagado: 3000, total: 20000, estado: "Parcial", accion: "Ver historial" },
  ];

  const getEstado = (estado) => {
    if (estado === "Pendiente")
      return (
        <span className="estado pendiente">
          <AlertCircle size={16} /> Pendiente
        </span>
      );
    if (estado === "Aprobado")
      return (
        <span className="estado aprobado">
          <CheckCircle size={16} /> Aprobado
        </span>
      );
    if (estado === "Parcial")
      return (
        <span className="estado parcial">
          <XCircle size={16} /> Parcial
        </span>
      );
  };

  const getBarraColor = (estado) => {
    if (estado === "Pendiente") return "#facc15"; // amarillo
    if (estado === "Aprobado") return "#34d399"; // verde
    if (estado === "Parcial") return "#9ca3af"; // gris
    return "#6fcf97";
  };

  return (
    <div className="pagos-container">
      <div className="pagos-header">
        {/* Izquierda: título + subtítulo */}
        <div className="pagos-info">
          <h2 className="pagos-titulo">Módulo de pagos</h2>
          <p className="pagos-subtitulo">
            Seguimiento de pagos de asistentes mediante{" "}
            <button className="btn-text">tabla de pagos</button>
          </p>
        </div>

        {/* Derecha: buscador + botón */}
        <div className="pagos-actions">
          <div className="buscar-wrapper">
            <input
              type="text"
              placeholder="Buscar asistente"
              className="buscar"
            />
          </div>
          <button className="btn-csv">Exportar en CSV</button>
        </div>
      </div>

      {/* Tabla con scroll */}
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
              <div className="nombre">{item.nombre}</div>

              <div className="barra-progreso">
                <div
                  className="barra-fill"
                  style={{
                    width: `${porcentaje}%`,
                    background: getBarraColor(item.estado),
                  }}
                ></div>
              </div>

              <div className="col-pagado">
                ${item.pagado.toLocaleString()}/{item.total.toLocaleString()}
              </div>

              <div>{getEstado(item.estado)}</div>

              <div>
                <button
                  className={`btn-accion ${
                    item.accion.includes("Verificar")
                      ? "btn-verificar"
                      : "btn-historial"
                  }`}
                >
                  {item.accion}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
