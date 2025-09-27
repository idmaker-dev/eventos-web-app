<div className="calendario-container">
  <div className="calendario-header">
    <button className="btn-mes" onClick={() => cambiarMes(-1)}>&lt;</button>
    <h3>{meses[mes]} {anio}</h3>
    <button className="btn-mes" onClick={() => cambiarMes(1)}>&gt;</button>
  </div>

  <div className="calendario-grid">
    {diasSemana.map((dia, i) => (
      <div key={i} className="calendario-dia-semana">{dia}</div>
    ))}

    {Array(primerDia).fill(null).map((_, i) => (
      <div key={"empty-" + i} className="calendario-vacio"></div>
    ))}

    {Array.from({ length: diasEnMes }, (_, i) => {
      const dia = i + 1
      const esHoy =
        dia === hoy.getDate() &&
        mes === hoy.getMonth() &&
        anio === hoy.getFullYear()
      return (
        <div key={dia} className={`calendario-dia ${esHoy ? "hoy" : ""}`}>
          {dia}
        </div>
      )
    })}
  </div>
</div>
