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

  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

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
    <div className="dashboard-container">
      <h1 className="titulo-principal">Resumen general del evento</h1>

      {/* Métricas clave */}
      <div className="metricas-grid">
        <div className="tarjeta-metrica">
          <div className="circulo">75%</div>
          <h3>% de pagos completados</h3>
          <p>750 / 1000 asistentes</p>
        </div>
        <div className="tarjeta-metrica">
          <div className="circulo">60%</div>
          <h3>Asientos Asignados</h3>
          <p>600 / 1000 asistentes</p>
        </div>
        <div className="tarjeta-metrica">
          <div className="circulo">85%</div>
          <h3>Boletos emitidos</h3>
          <p>600 / 1000 asistentes</p>
        </div>
      </div>

      <div className="contenido-grid">
        {/* Acciones requeridas */}
        <div className="acciones">
          <h2>Acciones requeridas</h2>
          <p className="subtitulo">
            Una lista de tareas urgentes para que el admin actúe
          </p>

          <div className="accion-item">
            <span className="icono alerta">⚠️</span>
            <div className="accion-texto">
              <h4>Pago Pendiente</h4>
              <p>Hay 15 nuevos comprobantes para verificar</p>
            </div>
            <button className="btn-accion">Ir a Módulo de Pagos</button>
          </div>

          <div className="accion-item">
            <span className="icono chat">💬</span>
            <div className="accion-texto">
              <h4>Chat</h4>
              <p>3 conversaciones requieren intervención humana</p>
            </div>
            <button className="btn-accion">Ir a Módulo de Comunicación</button>
          </div>

          <div className="accion-item">
            <span className="icono conflicto">❗</span>
            <div className="accion-texto">
              <h4>Conflicto de asignación</h4>
              <p>Nuevo conflicto de asignación de asientos</p>
            </div>
            <button className="btn-accion">Ir a Módulo de Asignaciones</button>
          </div>
        </div>

        {/* Calendario */}
        <div className="calendario">
          <div className="calendario-header">
            <button onClick={() => cambiarMes(-1)}>&lt;</button>
            <h2>{meses[mes]} {anio}</h2>
            <button onClick={() => cambiarMes(1)}>&gt;</button>
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
      </div>
    </div>
  )
}
