// src/Dashboard.jsx
import React from "react"

export default function Dashboard() {
  return (
    <div>
      <h3>Métricas clave</h3>
      <div className="cards">
        <div className="card">75% Pagos completados</div>
        <div className="card">60% Asientos asignados</div>
        <div className="card">85% Boletos emitidos</div>
      </div>

      <h3>Acciones requeridas</h3>
      <ul>
        <li>Pago pendiente (15 comprobantes)</li>
        <li>Chat (3 conversaciones)</li>
        <li>Conflicto de asignación (1 nuevo conflicto)</li>
      </ul>
    </div>
  )
}
