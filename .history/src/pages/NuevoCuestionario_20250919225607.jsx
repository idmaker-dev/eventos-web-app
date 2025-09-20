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
      <header className="nc-header">
        <div>
          <h1 className="nc-header-title">Módulo de comunicación</h1>
          <p className="nc-header-subtitle">Configuración de conversaciones, asistentes y cuestionarios</p>
        </div>
        <input type="text" placeholder="Buscar asistente" className="nc-buscar" />
      </header>

<<<<<<< HEAD
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

  {/* Bloque Datos del evento */}
  <div className="nc-section">
    <h2>Datos del evento</h2>

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
  </div>

  {/* Bloque Datos del asistente */}
  <div className="nc-section">
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
  </div>

  {/* Botones */}
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
    <h2>Planoria</h2>
    <h3>Cuestionario de Registro</h3>
    <p>Instituto Villa Rica</p>
    <p><strong>Ceremonia de Graduación - Generación 2025</strong></p>
    <p>
      ¡Felicidades por tu próxima graduación! Completa este formulario con tus datos.
    </p>
    <p>
      <strong>Fecha:</strong> 25 de junio de 2025 – 17:00 hrs<br />
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
    <h2>Planoria</h2>

    <label>Cantidad de boletos requeridos</label>
    <input type="number" placeholder="0" />

    <label>Restricciones alimenticias</label>
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

       
=======
      <nav className="nc-navbar">
        <button className="nc-btn">Configurar respuestas</button>
        <button className="nc-btn">Monitor de Chats <span className="nc-badge">6</span></button>
        <button className="nc-btn activo">Enlace cuestionario</button>
      </nav>

      <main className="nc-main">
        <aside className="nc-sidebar">
          <h2>Crear invitación de cuestionario</h2>
          <p>Completa los datos y envía el enlace de tu evento.</p>

          <div className="nc-section">
            <h2>Datos del evento</h2>
            <label>Nombre del evento</label>
            <input name="nombreEvento" value={formData.nombreEvento || ''} onChange={handleChange} readOnly />

            <label>Nombre del cuestionario</label>
            <input name="title" value={formData.title || ''} onChange={handleChange} />

            <label>Descripción</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} />

            <label>Lugar del evento</label>
            <input name="lugar" value={formData.lugar || ''} onChange={handleChange} />

            <label>Fecha y hora del evento</label>
            <input name="fecha" value={formData.fecha || ''} onChange={handleChange} />

            <label>Carrera o estudios realizados</label>
            <input name="carrera" value={formData.carrera || ''} onChange={handleChange} />

            <label>Escuela o institución</label>
            <input name="escuela" value={formData.escuela || ''} onChange={handleChange} />
          </div>

          <div className="nc-section">
            <h2>Datos del asistente</h2>
            <label>Nombre</label>
            <input name="nombre_asistente" value={formData.nombre_asistente} onChange={handleChange} />

            <label>Teléfono</label>
            <input name="telefono" value={formData.telefono} onChange={handleChange} />

            <label>Cantidad de boletos</label>
            <input type="number" name="cantidad_boletos" value={formData.cantidad_boletos} min={1} onChange={handleChange} />

            <RestriccionesAlimenticiasOpciones
              opciones={formData.restricciones_alimenticias_opciones}
              setOpciones={op => setFormData(prev => ({ ...prev, restricciones_alimenticias_opciones: op }))}
            />

            <label>Contacto de emergencia</label>
            <input name="contactoEmergencia" value={formData.contactoEmergencia} onChange={handleChange} />
          </div>

          <div className="nc-buttons">
            <button className="nc-btn-sec">Editar</button>
            <button className="nc-btn-sec">Cancelar</button>
            <button className="nc-btn-primario" onClick={handleGuardar}>Guardar</button>
          </div>
        </aside>

        <section className="nc-preview">
          <div className="nc-phone">
            <div className="nc-phone-screen">
              <h2>{formData.title || 'Título del cuestionario'}</h2>
              <p>{formData.description || 'Descripción del cuestionario'}</p>

              <p><strong>Evento:</strong> {formData.nombreEvento}</p>
              <p><strong>Lugar:</strong> {formData.lugar}</p>
              <p><strong>Fecha:</strong> {formData.fecha}</p>
              <p><strong>Carrera:</strong> {formData.carrera}</p>
              <p><strong>Escuela:</strong> {formData.escuela}</p>

              <label>Nombre completo</label>
              <input type="text" disabled placeholder="Tu respuesta" />

              <label>Teléfono</label>
              <input type="text" disabled placeholder="Tu respuesta" />

              <label>Cantidad de boletos</label>
              <input type="number" disabled placeholder={formData.cantidad_boletos} />

              <div className="nc-preview-restricciones">
                <h4>Preferencias de comida</h4>
                {formData.restricciones_alimenticias_opciones.map((op, index) => (
                  <div key={index} className="nc-preview-opcion">
                    <span>{op.nombre}</span>
                    <div className="nc-btns-cantidad">
                      <button type="button" className="nc-btn-cantidad" onClick={() => handleRestriccionCantidad(index, -1)}>–</button>
                      <span className="nc-cantidad">{op.cantidad}</span>
                      <button type="button" className="nc-btn-cantidad" onClick={() => handleRestriccionCantidad(index, +1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              <label>Contacto de emergencia</label>
              <input type="text" disabled placeholder="Tu respuesta" />
            </div>
          </div>
>>>>>>> origin/cuestionarioRegistro
        </section>
      </main>
    </div>
  );
}
