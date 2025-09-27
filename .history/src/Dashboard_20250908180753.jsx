import React, { useState } from "react"
import "./Dashboard.css"

export default function Dashboard() {
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const primerDia = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()

  const cambiarMes = (offset) => {
    let nuevoMes = mes + offset
    let nuevoAnio = anio
    if (nuevoMes < 0) {
      nuevoMes = 11
      nuevoAnio--
    } else if (nuevoMes > 11) {
      nuevoMes = 0
      nuevoAnio++
    }
    setMes(nuevoMes)
    setAnio(nuevoAnio)
  }

  return (
    <div className="calendario-container">
      <div className="calendario-header">
  <button onClick={() => cambiarMes(-1)}>&lt;</button>  {/* menor que */}
  <h2>{meses[mes]} {anio}</h2>
  <button onClick={() => cambiarMes(1)}>&gt;</button>   {/* mayor que */}
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
            <div
              key={dia}
              className={`calendario-dia ${esHoy ? "hoy" : ""}`}
            >
              {dia}
            </div>
          )
        })}
      </div>
    </div>
  )
}
