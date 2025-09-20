import React, { useState } from "react";
import "../styles/pages/NuevoCuestionario.css";

export default function NuevoCuestionario() {
  const [formData, setFormData] = useState({
    nombreEvento: "",
    descripcion: "",
    lugar: "",
    fecha: "",
    nombreCompleto: "",
    carrera: "",
    escuela: "",
    boletos: "",
    restricciones: {
      vegetariano: 0,
      vegano: 0,
      sinGluten: 0,
      mariscos: 0,
      otros: "",
    },
    contactoEmergencia: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="nuevo-cuestionario">
      {/* HEADER */}
      <header className="nc-header">
        <div>
          <h1 className="nc-header-title">Módulo de comunicación</h1>
          <p className="nc-header-subtitle">
            Configuración de conversaciones y del Bot de Preguntas Frecuentes (FAQ)
          </p>
        </div>
        <input type="text" placeholder="Buscar asistente" className="nc-buscar" />
      </header>

      {/* NAVBAR */}
      <nav className="nc-navbar">
        <button className="nc-btn">Configurar respuestas</button>
        <button className="nc-btn">
          Monitor de Chats <span className="nc-badge">6</span>
        </button>
        <button className="nc-btn activo">Enlace cuestionario</button>
      </nav>

      {/* MAIN */}
      <main className="nc-main">
        {/* Columna izquierda */}
        <aside className="nc-sidebar">
          <h2>Crear invitación de cuestionario</h2>
          <p>Completa los datos y envía el enlace de tu evento.</p>

          <label>Nombre del evento</label>
          <input
            type="text"
            name="nombreEvento"
            placeholder="Ejemplo: Ceremonia de Graduación - Generación 2025"
            value={formData.nombreEvento}
            onChange={handleChange}
          />

          <label>Descripción del evento</label>
          <textarea
            name="descripcion"
            placeholder="Ejemplo: ¡Felicidades por tu próxima graduación!..."
            value={formData.descripcion}
            onChange={handleChange}
          ></textarea>

          <label>Lugar del evento</label>
          <input
            type="text"
            name="lugar"
            placeholder="Auditorio, salón, teatro, etc."
            value={formData.lugar}
            onChange={handleChange}
          />

          <label>Fecha y hora del evento</label>
          <input
            type="text"
            name="fecha"
            placeholder="Ejemplo: 25 de junio de 2025 – 17:00 hrs"
            value={formData.fecha}
            onChange={handleChange}
          />

          <h2>Datos del asistente</h2>
          <label>Nombre completo</label>
          <input
            type="text"
            name="nombreCompleto"
            placeholder="Respuesta"
            value={formData.nombreCompleto}
            onChange={handleChange}
          />

          <label>Carrera o estudios realizados</label>
          <input
            type="text"
            name="carrera"
            placeholder="Respuesta"
            value={formData.carrera}
            onChange={handleChange}
          />

          <label>Escuela o institución</label>
          <input
            type="text"
            name="escuela"
            placeholder="Respuesta"
            value={formData.escuela}
            onChange={handleChange}
          />

          <div className="nc-buttons">
            <button className="nc-btn-sec">Editar</button>
            <button className="nc-btn-sec">Cancelar</button>
            <button className="nc-btn-primario">Guardar</button>
          </div>
        </aside>

        {/* Previsualización */}
        <section className="nc-preview">
          {/* Celular 1 */}
          <div className="nc-phone">
            <div className="nc-phone-screen">
              <h2>Planoría</h2>
              <h3>Cuestionario de Registro</h3>
              <p>Instituto Villa Rica</p>
              <p className="nc-desc">Ceremonia de Graduación - Generación 2025</p>
              <p className="nc-detalle">
                ¡Felicidades por tu próxima graduación! Completa este formulario con tus datos.
              </p>
              <p className="nc-detalle">
                <strong>Fecha:</strong> 25 de junio de 2025 <br />
                <strong>Lugar:</strong> Auditorio Central, Universidad Nacional
              </p>

              <label>Nombre completo</label>
              <input type="text" placeholder="Tu respuesta" />

              <label>Carrera o estudios realizados</label>
              <input type="text" placeholder="Tu respuesta" />

              <label>Escuela o institución</label>
              <input type="text" placeholder="Tu respuesta" />
            </div>
          </div>

          {/* Celular 2 */}
          <div className="nc-phone">
            <div className="nc-phone-screen">
              <h2>Planoría</h2>

              <label>Cantidad de boletos requeridos</label>
              <input type="number" placeholder="0" />

              <label>
                Restricciones alimenticias
              </label>
              <div className="nc-restricciones">
                <p>Vegetariano ○ 0 personas</p>
                <p>Vegano ○ 0 personas</p>
                <p>Sin gluten ○ 0 personas</p>
                <p>Alergia a mariscos ○ 0 personas</p>
                <p>Añadir una restricción específica</p>
              </div>

              <label>Contacto de emergencia</label>
              <input type="text" placeholder="Tu respuesta" />

              <button className="nc-enviar">Enviar</button>
            </div>
          </div>

          {/* Switch derecha */}
          <div className="nc-switch">
            <p>Previsualización</p>
            <div className="nc-link">
              <span>Enlace de cuestionario</span>
              <button className="nc-btn-sec">Enlace</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
