import React from "react";
import "../styles/pages/Nuevo.css";

export default function CuestionarioUI() {
  return (
    <div className="h-screen w-full flex flex-col bg-gray-100 font-sans">
      {/* HEADER */}
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Módulo de comunicación</h1>
          <p className="text-gray-500 text-sm">
            Configuración de conversaciones y del Bot de Preguntas Frecuentes (FAQ)
          </p>
        </div>
        <input
          type="text"
          placeholder="Buscar asistente"
          className="border border-gray-300 rounded-full px-4 py-1 text-sm w-64"
        />
      </header>

      {/* BOTONES SUPERIORES */}
      <div className="bg-white border-b px-6 py-2 flex gap-4">
        <button className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium">
          Configurar respuestas
        </button>
        <button className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium">
          Monitor de Chats <span className="ml-1 bg-gray-500 text-white rounded-full px-2">6</span>
        </button>
        <button className="px-4 py-2 rounded-lg bg-teal-700 text-white text-sm font-medium">
          Enlace cuestionario
        </button>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR IZQUIERDA */}
        <aside className="w-1/3 bg-white border-r p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Crear invitación de cuestionario
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Completa los datos y envía el enlace de tu evento.
          </p>

          {/* FORMULARIO */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Nombre del evento</label>
              <input
                type="text"
                placeholder="Ejemplo: Ceremonia de Graduación - Generación 2025"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Descripción del evento</label>
              <textarea
                placeholder="Ejemplo: ¡Felicitaciones por tu próxima graduación!..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Lugar de evento</label>
              <input
                type="text"
                placeholder="Ejemplo: Auditorio central"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Fecha y hora del evento
              </label>
              <input
                type="text"
                placeholder="Ejemplo: 25 de junio de 2025 – 17:00 hrs"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <h3 className="text-sm font-semibold text-gray-700 mt-6">Datos del asistente</h3>

            <div>
              <label className="text-sm font-medium text-gray-600">Nombre completo</label>
              <input
                type="text"
                placeholder="Respuesta"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Carrera o estudios realizados
              </label>
              <input
                type="text"
                placeholder="Respuesta"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-between mt-6">
              <button className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Editar</button>
              <button className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancelar</button>
              <button className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm">
                Guardar
              </button>
            </div>
          </div>
        </aside>

        {/* PREVISUALIZACIÓN */}
        <main className="flex-1 bg-teal-800 flex items-center justify-center gap-10 relative">
          {/* CELULAR 1 */}
          <div className="bg-black rounded-3xl w-[280px] h-[580px] p-2 shadow-lg">
            <div className="bg-white rounded-3xl w-full h-full p-6 text-center overflow-y-auto">
              <h2 className="text-lg font-bold text-gray-700">Planoria</h2>
              <h3 className="text-base font-semibold text-teal-700 mt-4">
                Cuestionario de Registro <br /> Instituto Villa Rica
              </h3>
              <p className="text-gray-500 text-xs mt-2">
                Ceremonia de Graduación – Generación 2025
              </p>
              <p className="text-gray-600 text-xs mt-3">
                ¡Felicitaciones por tu próxima graduación! Por favor completa este formulario con tus datos...
              </p>
              <div className="mt-4 text-left space-y-3">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Carrera o estudios realizados"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Escuela o institución"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* CELULAR 2 */}
          <div className="bg-black rounded-3xl w-[280px] h-[580px] p-2 shadow-lg">
            <div className="bg-white rounded-3xl w-full h-full p-6 text-center overflow-y-auto">
              <h2 className="text-lg font-bold text-gray-700">Planoria</h2>
              <div className="mt-4 text-left space-y-3">
                <input
                  type="text"
                  placeholder="Cantidad de boletos requeridos"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <div className="text-left">
                  <p className="text-xs text-gray-600 mb-2">
                    Restricciones alimenticias (Ejemplo: vegetariano, vegano...)
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>Vegetariano - 0 personas</li>
                    <li>Vegano - 0 personas</li>
                    <li>Sin gluten - 0 personas</li>
                    <li>Alergia a marisco - 0 personas</li>
                  </ul>
                </div>
                <input
                  type="text"
                  placeholder="Contacto de emergencia"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <button className="mt-6 w-full bg-teal-700 text-white py-2 rounded-lg">
                Enviar
              </button>
            </div>
          </div>

          {/* SWITCH DERECHA */}
          <div className="absolute right-6 top-6 bg-white rounded-lg p-4 shadow-lg">
            <p className="text-xs font-medium text-gray-600 mb-2">Previsualización</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Enlace de cuestionario</span>
              <button className="bg-teal-700 text-white text-xs px-3 py-1 rounded-lg">
                Copiar
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
