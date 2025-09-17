import React, { useState } from "react";
import "../styles/pages/Pagos.css";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

export default function Pagos({ darkMode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

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
    if (estado === "Aprobado") return "#34d399"; 
    if (estado === "Parcial") return "#9ca3af"; // gris
    return "#6fcf97";
  };

  const abrirModal = (item) => {
    setModalData(item);
    setModalOpen(true);
  };

  return (
    <div className={`pagos-container ${darkMode ? "dark" : ""}`}>
      <div className="pagos-header">
        <div className="pagos-info">
          <h2 className="pagos-titulo">Módulo de pagos</h2>
          <p className="pagos-subtitulo">
            Seguimiento de pagos de asistentes mediante{" "}
            <button className="btn-text">tabla de pagos</button>
          </p>
        </div>

        <div className="pagos-actions">
          <div className="buscar-wrapper">
            <input type="text" placeholder="Buscar asistente" className="buscar" />
          </div>
          <button className="btn-csv">Exportar en CSV</button>
        </div>
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
              <div className="col" data-label="Asistente">
                <span className="nombre">{item.nombre}</span>
              </div>

              <div className="col" data-label="Progreso">
                <div className="barra-progreso">
                  <div
                    className="barra-fill"
                    style={{
                      width: `${porcentaje}%`,
                      background: getBarraColor(item.estado),
                    }}
                  ></div>
                </div>
              </div>

              <div className="col" data-label="Total pagado">
                ${item.pagado.toLocaleString("es-MX")}/{item.total.toLocaleString("es-MX")}
              </div>

              <div className="col" data-label="Estado">
                {getEstado(item.estado)}
              </div>

              <div className="col" data-label="Acción">
                <button
                  onClick={() => abrirModal(item)}
                  className={`btn-accion ${
                    item.accion.includes("Verificar") ? "btn-verificar" : "btn-historial"
                  }`}
                >
                  {item.accion}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && modalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{modalData.accion}</h3>
            {modalData.accion.includes("Verificar") ? (
              <div>
                <p><strong>Asistente:</strong> {modalData.nombre}</p>
                <p><strong>Monto pagado:</strong> ${modalData.pagado.toLocaleString("es-MX")}</p>
                <p><strong>Total:</strong> ${modalData.total.toLocaleString("es-MX")}</p>
                <button className="btn-confirmar">Confirmar comprobante</button>
              </div>
            ) : (
              <div>
                <p><strong>Historial de pagos de {modalData.nombre}</strong></p>
                <ul>
                  <li>Pago inicial: ${modalData.pagado.toLocaleString("es-MX")}</li>
                  <li>Total requerido: ${modalData.total.toLocaleString("es-MX")}</li>
                  <li>Estado actual: {modalData.estado}</li>
                </ul>
              </div>
            )}
            <button className="btn-cerrar" onClick={() => setModalOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
