

import '../styles/pages/NuevoCuestionario.css';
import React from "react";
import "./NuevoCuestionario.css";

export default function NuevoCuestionario() {
  return (
    <div className="modulo-comunicacion-bg">
      <div className="modulo-comunicacion-container">
        {/* ===== Header ===== */}
        <div className="modulo-comunicacion-header">
          <h1>Módulo de comunicación</h1>
          <p>Configuración de conversaciones y del Bot de Preguntas Frecuentes (FAQ)</p>
        </div>

        {/* ===== Tabs ===== */}
        <div className="modulo-comunicacion-tabs">
          <button className="tab">Configurar respuestas</button>
          <button className="tab">Monitor de Chats</button>
          <button className="tab active">Enlace cuestionario</button>
        </div>

        {/* ===== Main layout ===== */}
        <div className="modulo-comunicacion-main">
          {/* Panel izquierdo */}
          <div className="modulo-comunicacion-form-section">
            <h2>Crear invitación de cuestionario</h2>
            <p>Completa los datos básicos de tu evento.</p>

            <form className="crear-cuestionario-form">
              <label>Nombre del evento</label>
              <input type="text" placeholder="Ejemplo: Ceremonia de Graduación - Generación 2025" />

              <label>Descripción del evento</label>
              <textarea rows="3" placeholder="Ejemplo: ¡Felicidades por tu próxima graduación!..."></textarea>

              <label>Lugar del evento</label>
              <input type="text" placeholder="Auditorio, salón, etc." />

              <label>Fecha y hora del evento</label>
              <input type="text" placeholder="Ejemplo: 25 de junio de 2025 – 17:00 hrs" />

              <h3>Datos del asistente</h3>
              <label>Nombre completo</label>
              <input type="text" placeholder="Respuesta" />

              <label>Carrera o estudios realizados</label>
              <input type="text" placeholder="Respuesta" />

              <label>Escuela o institución</label>
              <input type="text" placeholder="Respuesta" />

              <div className="form-buttons">
                <button type="button" className="cancelar">Cancelar</button>
                <button type="submit" className="guardar">Guardar</button>
              </div>
            </form>
          </div>

          {/* Panel derecho */}
          <div className="modulo-comunicacion-preview-section">
            <h2>Previsualización</h2>
            <button className="enlace-cuestionario-btn">Enlace de cuestionario</button>

            <div className="preview-mockups">
              {/* Teléfono izquierdo */}
              <div className="phone-mockup">
                <div className="phone-header">
                  <h3>Cuestionario de Registro</h3>
                  <p>Instituto Villa Rica</p>
                  <p>Ceremonia de Graduación - Generación 2025</p>
                </div>
                <p className="phone-text">
                  ¡Felicidades por tu próxima graduación! Por favor completa este
                  cuestionario con tus datos y los de tus invitados para poder
                  atenderte mejor el día del evento.
                </p>
                <p className="phone-event">
                  Fecha: 25 de junio de 2025 <br />
                  Hora: 17:00 hrs <br />
                  Lugar: Auditorio Central, Universidad Nacional
                </p>

                <input type="text" placeholder="Nombre completo" />
                <input type="text" placeholder="Carrera o estudios realizados" />
                <input type="text" placeholder="Escuela o institución" />
              </div>

              {/* Teléfono derecho */}
              <div className="phone-mockup">
                <div className="phone-header">
                  <h3>Cuestionario de Registro</h3>
                </div>

                <label>Cantidad de boletos requeridos</label>
                <select>
                  <option>8 Boletos</option>
                </select>

                <label>Restricciones alimenticias</label>
                <div className="restricciones-box">
                  <p>Vegetariano - 0 personas</p>
                  <p>Vegano - 0 personas</p>
                  <p>Alergia a mariscos - 0 personas</p>
                  <p>Otra - 0 personas</p>
                </div>

                <label>Contacto de emergencia</label>
                <input type="text" placeholder="Nombre y teléfono" />

                <button>Enviar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
