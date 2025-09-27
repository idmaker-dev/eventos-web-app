import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, MessageCircle, AlertOctagon } from "lucide-react"

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
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      <h1 className="text-center text-lg font-semibold text-gray-700">
        Resumen general del evento
      </h1>

      {/* Métricas clave */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <CardHeader>
            <CardTitle>% de pagos completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">75%</div>
            <p className="text-gray-500">750 / 1000 asistentes</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <CardTitle>Asientos Asignados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">60%</div>
            <p className="text-gray-500">600 / 1000 asistentes</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <CardTitle>Boletos emitidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">85%</div>
            <p className="text-gray-500">600 / 1000 asistentes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Acciones requeridas */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Acciones requeridas</CardTitle>
            <p className="text-sm text-gray-500">
              Una lista de tareas urgentes para que el admin actúe
            </p>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-200">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-yellow-500" />
                  <div>
                    <p className="font-semibold">Pago Pendiente</p>
                    <p className="text-sm text-gray-500">
                      Hay 15 nuevos comprobantes para verificar
                    </p>
                  </div>
                </div>
                <Button variant="outline">Ir a Módulo de Pagos</Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <MessageCircle className="text-pink-500" />
                  <div>
                    <p className="font-semibold">Chat</p>
                    <p className="text-sm text-gray-500">
                      3 conversaciones requieren intervención humana
                    </p>
                  </div>
                </div>
                <Button variant="outline">Ir a Módulo de Comunicación</Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <AlertOctagon className="text-cyan-500" />
                  <div>
                    <p className="font-semibold">Conflicto de asignación</p>
                    <p className="text-sm text-gray-500">
                      Nuevo conflicto de asignación de asientos
                    </p>
                  </div>
                </div>
                <Button variant="outline">Ir a Módulo de Asignaciones</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendario */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>{meses[mes]} {anio}</CardTitle>
            <div className="space-x-2">
              <Button size="sm" onClick={() => cambiarMes(-1)}>&lt;</Button>
              <Button size="sm" onClick={() => cambiarMes(1)}>&gt;</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {diasSemana.map((dia, i) => (
                <div key={i} className="font-medium text-gray-600">{dia}</div>
              ))}

              {Array(primerDia).fill(null).map((_, i) => (
                <div key={"empty-" + i}></div>
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
                    className={`rounded-lg py-1 ${esHoy ? "bg-blue-500 text-white font-bold" : "text-gray-700"}`}
                  >
                    {dia}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
