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

  const _handleRestriccionChange = (tipo, value) => {
    setFormData({
      ...formData,
      restricciones: {
        ...formData.restricciones,
        [tipo]: value,
      },
    });
  };

  return (
    <div className="nuevo-cuestionario">
      {/* HEADER */}
      <header className="header">
        <div>
          <h1 className="header-title">Módulo de comunicación</h1>
          <p className="header-subtitle">
            Configuración de conversaciones y del Bot de Preguntas Frecuentes
            (FAQ)
          </p>
        </div>
        <input type="text" placeholder="Buscar asistente" />
      </header>

      {/* NAVBAR */}
      <nav className="navbar">
        <button>Configurar respuestas</button>
        <button>
          Monitor de Chats <span>6</span>
        </button>
        <button>Enlace cuestionario</button>
      </nav>

      {/* MAIN */}
      <main className="main">
        {/* SIDEBAR IZQUIERDA */}
        <aside className="sidebar">
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

          <label>Lugar de evento</label>
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

          <label>Cantidad de boletos requeridos</label>
          <input
            type="number"
            name="boletos"
            placeholder="0"
            value={formData.boletos}
            onChange={handleChange}
          />

          <h2>Restricciones alimenticias</h2>
          <label>Vegetariano</label>
          <input
            type="number"
            value={formData.restricciones.vegetariano}
            onChange={(e) =>
              _handleRestriccionChange("vegetariano", e.target.value)
            }
          />

          <label>Vegano</label>
          <input
            type="number"
            value={formData.restricciones.vegano}
            onChange={(e) => _handleRestriccionChange("vegano", e.target.value)}
          />

          <label>Sin gluten</label>
          <input
            type="number"
            value={formData.restricciones.sinGluten}
            onChange={(e) =>
              _handleRestriccionChange("sinGluten", e.target.value)
            }
          />

          <label>Alergia a mariscos</label>
          <input
            type="number"
            value={formData.restricciones.mariscos}
            onChange={(e) => _handleRestriccionChange("mariscos", e.target.value)}
          />

          <label>Otra restricción</label>
          <input
            type="text"
            value={formData.restricciones.otros}
            onChange={(e) => _handleRestriccionChange("otros", e.target.value)}
          />

          <label>Contacto de emergencia</label>
          <input
            type="text"
            name="contactoEmergencia"
            placeholder="Tu respuesta"
            value={formData.contactoEmergencia}
            onChange={handleChange}
          />

          <div className="buttons">
            <button>Editar</button>
            <button>Cancelar</button>
            <button>Guardar</button>
          </div>
        </aside>

        {/* PREVISUALIZACIÓN */}
        <section className="preview">
          {/* CELULAR 1 */}
          <div className="phone">
            <div className="phone-screen">
              <h2>Planoría</h2>
              <h3>Cuestionario de Registro</h3>
              <p>Instituto Villa Rica</p>
              <p className="desc">
                Ceremonia de Graduación - Generación 2025
              </p>
              <p className="detalle">
                ¡Felicidades por tu próxima graduación! Por favor completa este
                formulario con tus datos...
              </p>
              <p className="detalle">
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

          {/* CELULAR 2 */}
          <div className="phone">
            <div className="phone-screen">
              <h2>Planoría</h2>

              <label>Cantidad de boletos requeridos</label>
              <input type="number" placeholder="0" />

              <label>
                Restricciones alimenticias (Ejemplo: vegetariano, vegano, sin
                gluten, alergias a mariscos, etc.)
              </label>
              <div className="restricciones-box">
                <p>Vegetariano ○ {formData.restricciones.vegetariano} personas</p>
                <p>Vegano ○ {formData.restricciones.vegano} personas</p>
                <p>Sin gluten ○ {formData.restricciones.sinGluten} personas</p>
                <p>Alergia a mariscos ○ {formData.restricciones.mariscos} personas</p>
                <p>{formData.restricciones.otros && `Otra: ${formData.restricciones.otros}`}</p>
              </div>

              <label>Contacto de emergencia</label>
              <input type="text" placeholder="Tu respuesta" />

              <button className="enviar">Enviar</button>
            </div>
          </div>

          {/* SWITCH DERECHA */}
          <div className="switch-box">
            <p>Previsualización</p>
            <div className="link">
              <span>Enlace de cuestionario</span>
              <button>Enlace</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
