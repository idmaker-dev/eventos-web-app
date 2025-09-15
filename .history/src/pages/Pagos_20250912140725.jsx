const data = [
  { nombre: "Ana Sofía Garza", pagado: 15000, total: 20000, estado: "Pendiente", accion: "Verificar Comprobante" },
  { nombre: "Carlos Martínez", pagado: 20000, total: 20000, estado: "Aprobado", accion: "Ver historial" },
  { nombre: "David Jiménez", pagado: 5000, total: 20000, estado: "Parcial", accion: "Ver historial" },
  { nombre: "Víctor Ocampo", pagado: 20000, total: 20000, estado: "Aprobado", accion: "Verificar Comprobante" },
  { nombre: "Juan Antonio", pagado: 20000, total: 20000, estado: "Aprobado", accion: "Ver historial" },
  { nombre: "Javier Lara Flores", pagado: 12000, total: 20000, estado: "Pendiente", accion: "Verificar Comprobante" },
  { nombre: "Esmeralda Jiménez", pagado: 3000, total: 20000, estado: "Parcial", accion: "Ver historial" },
];

// Función para asignar color de barra según estado
const getBarraColor = (estado) => {
  switch (estado.toLowerCase()) {
    case "aprobado": return "#15803d";
    case "pendiente": return "#ca8a04";
    case "parcial": return "#b91c1c";
    default: return "#0369a1";
  }
};

// Función para renderizar estado con estilo
const getEstado = (estado) => {
  const estadoClass = estado.toLowerCase();
  return <span className={`estado ${estadoClass}`}>{estado}</span>;
};

export default function PagosTabla() {
  return (
    <div className="pagos-container">
      <div className="pagos-header">
        <div>
          <h2 className="pagos-titulo">Pagos</h2>
          <p className="pagos-subtitulo">Detalles de los pagos registrados</p>
        </div>
        <div className="pagos-actions">
          <input type="text" placeholder="Buscar asistente" className="buscar" />
          <button className="btn-csv">Exportar CSV</button>
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
              {/* Nombre */}
              <div className="nombre">{item.nombre}</div>

              {/* Barra de progreso */}
              <div className="barra-progreso">
                <div
                  className="barra-fill"
                  style={{
                    width: `${porcentaje}%`,
                    background: getBarraColor(item.estado),
                  }}
                ></div>
              </div>

              {/* Pagado / Total con formato de miles */}
              <div className="col-pagado">
                ${item.pagado.toLocaleString("es-MX")}/{item.total.toLocaleString("es-MX")}
              </div>

              {/* Estado */}
              <div>{getEstado(item.estado)}</div>

              {/* Botón acción */}
              <div>
                <button
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
    </div>
  );
}
