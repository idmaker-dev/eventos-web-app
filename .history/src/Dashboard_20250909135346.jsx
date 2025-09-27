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
      <h1 className="dashboard-titulo">Resumen general del evento</h1>

      {/* Métricas clave */}
      <div className="dashboard-metricas">
        <div className="dashboard-metrica">
          <div className="dashboard-circulo">75%</div>
          <h3>% de pagos completados</h3>
          <p>750 / 1000 asistentes</p>
        </div>
        <div className="dashboard-metrica">
          <div className="dashboard-circulo">60%</div>
          <h3>Asientos Asignados</h3>
          <p>600 / 1000 asistentes</p>
        </div>
        <div className="dashboard-metrica">
          <div className="dashboard-circulo">85%</div>
          <h3>Boletos emitidos</h3>
          <p>600 / 1000 asistentes</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Acciones requeridas */}
        <div className="dashboard-acciones">
          <h2>Acciones requeridas</h2>
          <p className="dashboard-subtitulo">
            Una lista de tareas urgentes para que el admin actúe
          </p>

          <div className="dashboard-accion">
            <span className="dashboard-icono alerta">⚠️</span>
            <div>
              <h4>Pago Pendiente</h4>
              <p>Hay 15 nuevos comprobantes para verificar</p>
            </div>
            <button className="dashboard-btn">Ir a Módulo de Pagos</button>
          </div>

          <div className="dashboard-accion">
            <span className="dashboard-icono chat">💬</span>
            <div>
              <h4>Chat</h4>
              <p>3 conversaciones requieren intervención humana</p>
            </div>
            <button className="dashboard-btn">Ir a Módulo de Comunicación</button>
          </div>

          <div className="dashboard-accion">
            <span className="dashboard-icono conflicto">❗</span>
            <div>
              <h4>Conflicto de asignación</h4>
              <p>Nuevo conflicto de asignación de asientos</p>
            </div>
            <button className="dashboard-btn">Ir a Módulo de Asignaciones</button>
          </div>
        </div>

        
        </div>
      </div>
    </div>
  )
}
