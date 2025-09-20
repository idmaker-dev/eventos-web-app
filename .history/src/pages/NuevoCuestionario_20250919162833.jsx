import React, { useState } from "react";
import "./NuevoCuestionario.css";

export default function NuevoCuestionario() {
  const [formData, setFormData] = useState({
    nombre: "",
    carrera: "",
    escuela: "",
    boletos: "",
    contactoEmergencia: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Formulario enviado ✅");
  };

  return (
    <div className="preview-container">
      {/* Celular 1 */}
      <div className="phone-frame">
        <div className="phone-notch"></div>
        <div className="phone-screen">
          <header className="app-header">Planoría</header>

          <div className="form-header">
            <h3>Cuestionario de Registro</h3>
            <p>Instituto Villa Rica</p>
            <h4>Ceremonia de Graduación - Generación 2025</h4>
          </div>

          <div className="form-description">
            <p>
              ¡Felicidades por tu próxima graduación! Por favor completa este
              formulario con tus datos. Esto nos ayudará a organizar de la
              mejor manera tu evento, asignar los boletos y atender tus
              necesidades.
            </p>
            <p>
              <strong>Fecha:</strong> 25 de junio de 2025 <br />
              <strong>Lugar:</strong> Auditorio Central, Universidad Nacional
            </p>
          </div>

          <form className="formulario" onSubmit={handleSubmit}>
            <label>Nombre completo</label>
            <input
              type="text"
              name="nombre"
              placeholder="Tu respuesta"
              value={formData.nombre}
              onChange={handleChange}
            />

            <label>Carrera o estudios realizados</label>
            <input
              type="text"
              name="carrera"
              placeholder="Tu respuesta"
              value={formData.carrera}
              onChange={handleChange}
            />

            <label>Escuela o institución</label>
            <input
              type="text"
              name="escuela"
              placeholder="Tu respuesta"
              value={formData.escuela}
              onChange={handleChange}
            />
          </form>
        </div>
      </div>

      {/* Celular 2 */}
      <div className="phone-frame">
        <div className="phone-notch"></div>
        <div className="phone-screen">
          <header className="app-header">Planoría</header>

          <form className="formulario" onSubmit={handleSubmit}>
            <label>Cantidad de boletos requeridos</label>
            <select
              name="boletos"
              value={formData.boletos}
              onChange={handleChange}
            >
              <option value="">Selecciona</option>
              <option value="1">1 boleto</option>
              <option value="2">2 boletos</option>
              <option value="3">3 boletos</option>
              <option value="4">4 boletos</option>
            </select>

            <div className="restricciones">
              <h4>
                Restricciones alimenticias{" "}
                <span>(Ejemplo: vegetarianos, veganos, alergias, etc.)</span>
              </h4>
              <div className="restriccion-item">
                <span>Vegetariano</span>
                <span>0 personas</span>
              </div>
              <div className="restriccion-item">
                <span>Vegano</span>
                <span>0 personas</span>
              </div>
              <div className="restriccion-item">
                <span>Sin gluten</span>
                <span>0 personas</span>
              </div>
              <div className="restriccion-item">
                <span>Alergia a mariscos</span>
                <span>0 personas</span>
              </div>
              <div className="restriccion-item">
                <span>Añadir una restricción específica</span>
              </div>
            </div>

            <label>Contacto de emergencia</label>
            <input
              type="text"
              name="contactoEmergencia"
              placeholder="Tu respuesta"
              value={formData.contactoEmergencia}
              onChange={handleChange}
            />

            <button type="submit" className="btn-enviar">
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
