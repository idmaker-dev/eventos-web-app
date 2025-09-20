import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEventoPorId } from "../hooks/useEventoPorId";
import "../styles/pages/NuevoCuestionario.css";

// Componente para manejar las opciones de restricciones/preferencias
function RestriccionesAlimenticiasOpciones({ opciones, setOpciones }) {
  const handleOptionChange = (index, value) => {
    const newOptions = [...opciones];
    newOptions[index].nombre = value;
    setOpciones(newOptions);
  };

  const handleAddOption = () => {
    setOpciones([...opciones, { nombre: "", cantidad: 0 }]);
  };

  const handleRemoveOption = (index) => {
    const newOptions = [...opciones];
    newOptions.splice(index, 1);
    setOpciones(newOptions);
  };

  return (
    <div className="nc-section">
      <h2>Restricciones alimenticias</h2>
      {opciones.map((op, index) => (
        <div key={index} className="nc-opcion">
          <input
            type="text"
            value={op.nombre}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            placeholder="Nombre de la restricción"
            className="nc-input-restriccion"
          />
          <button
            type="button"
            className="nc-btn-eliminar"
            onClick={() => handleRemoveOption(index)}
            title="Eliminar restricción"
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={handleAddOption} className="nc-btn-agregar">
        + Agregar restricción
      </button>
    </div>
  );
}

export default function NuevoCuestionario() {
  const EVENTO_ID = "mffj4jsdirg268cs1";
  const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1mb3NvdnQ2NTg4czRlNTIxIiwiZW1haWwiOiJyaDUwMDBAZ21haWwuY29tIiwicm9sIjoiYWRtaW4iLCJpYXQiOjE3NTgzNDQwMjAsImV4cCI6MTc1ODM0NzYyMH0.N6LR02r-K3WArFM9wsHdxnS4PXyrOJuicWqiq2oLtFM";

  let { evento } = useEventoPorId(EVENTO_ID, TOKEN);
  if (evento && evento.data) evento = evento.data;

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombreEvento: "",
    descripcion: "",
    lugar: "",
    fecha: "",
    nombreCompleto: "",
    carrera: "",
    escuela: "",
    boletos: "",
    contactoEmergencia: "",
    restricciones: [
      { nombre: "Vegetariano", cantidad: 0 },
      { nombre: "Vegano", cantidad: 0 },
      { nombre: "Sin gluten", cantidad: 0 },
      { nombre: "Alergia a mariscos", cantidad: 0 },
    ],
  });

  useEffect(() => {
    if (evento) {
      setFormData((prev) => ({
        ...prev,
        nombreEvento: evento.nombreEvento || prev.nombreEvento,
        lugar: evento.lugar || prev.lugar,
        fecha: evento.fecha || prev.fecha,
        carrera: evento.licenciatura || prev.carrera,
        escuela: evento.escuela || prev.escuela,
      }));
    }
  }, [evento]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRestriccionCantidad = (index, delta) => {
    const nuevas = [...formData.restricciones];
    nuevas[index].cantidad = Math.max(0, (nuevas[index].cantidad || 0) + delta);
    setFormData((prev) => ({ ...prev, restricciones: nuevas }));
  };

  const handleGuardar = async () => {
    console.log("Estado actual de formData:", formData);

    const payload = {
      eventoId: EVENTO_ID,
      tipo: "registro",
      title: formData.nombreEvento,
      description: formData.descripcion,
      fields: [
        {
          name: "nombreCompleto",
          label: "Nombre completo",
          type: "string",
          inputType: "text",
          required: true,
        },
        {
          name: "carrera",
          label: "Carrera o estudios",
          type: "string",
          inputType: "text",
          required: true,
        },
        {
          name: "escuela",
          label: "Escuela o institución",
          type: "string",
          inputType: "text",
          required: true,
        },
        {
          name: "boletos",
          label: "Cantidad de boletos",
          type: "number",
          inputType: "number",
          required: true,
          min: 1,
        },
        {
          name: "restricciones",
          label: "Restricciones alimenticias",
          type: "string",
          inputType: "checkbox",
          options: formData.restricciones
            .filter((op) => op.nombre.trim() !== "")
            .map((op) => ({
              value: op.nombre.toLowerCase().replace(/\s/g, ""),
              label: op.nombre,
            })),
        },
      ],
    };

    console.log("Payload que se enviará al backend:", JSON.stringify(payload, null, 2));

    try {
      const res = await fetch("http://localhost:7071/api/estructuras/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("Respuesta del backend:", data);

      if (data && data.id) {
        navigate(`/cuestionario/${data.id}`);
      } else {
        alert("Error al guardar la estructura");
      }
    } catch (err) {
      console.error("Error en fetch:", err);
      alert("Error al guardar la estructura");
    }
  };

  return (
    <div className="nuevo-cuestionario">
      <header className="nc-header">
        <div>
          <h1 className="nc-header-title">Módulo de comunicación</h1>
          <p className="nc-header-subtitle">
            Configuración de conversaciones y del Bot de Preguntas Frecuentes (FAQ)
          </p>
        </div>
        <input type="text" placeholder="Buscar asistente" className="nc-buscar" />
      </header>

      <nav className="nc-navbar">
        <button className="nc-btn">Configurar respuestas</button>
        <button className="nc-btn">
          Monitor de Chats <span className="nc-badge">6</span>
        </button>
        <button className="nc-btn activo">Enlace cuestionario</button>
      </nav>

      <main className="nc-main">
        <aside className="nc-sidebar">
          <h2>Crear invitación de cuestionario</h2>
          <p>Completa los datos y envía el enlace de tu evento.</p>

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
              value={formData.lugar}
              onChange={handleChange}
            />

            <label>Fecha y hora del evento</label>
            <input
              type="text"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
            />
          </div>

          <div className="nc-section">
            <h2>Datos del asistente</h2>
            <label>Nombre completo</label>
            <input
              type="text"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
            />

            <label>Carrera o estudios realizados</label>
            <input
              type="text"
              name="carrera"
              value={formData.carrera}
              onChange={handleChange}
            />

            <label>Escuela o institución</label>
            <input
              type="text"
              name="escuela"
              value={formData.escuela}
              onChange={handleChange}
            />

            <label>Cantidad de boletos</label>
            <input
              type="number"
              name="boletos"
              value={formData.boletos}
              onChange={handleChange}
              min={1}
            />

            <RestriccionesAlimenticiasOpciones
              opciones={formData.restricciones}
              setOpciones={(op) => setFormData((prev) => ({ ...prev, restricciones: op }))}
            />

            <label>Contacto de emergencia</label>
            <input
              type="text"
              name="contactoEmergencia"
              value={formData.contactoEmergencia}
              onChange={handleChange}
            />
          </div>

          <div className="nc-buttons">
            <button className="nc-btn-sec">Editar</button>
            <button className="nc-btn-sec">Cancelar</button>
            <button className="nc-btn-primario" onClick={handleGuardar}>
              Guardar
            </button>
          </div>
        </aside>

        <section className="nc-preview">
          <div className="nc-phone">
            <div className="nc-phone-screen">
              <h2>{formData.nombreEvento || "Título del evento"}</h2>
              <p>{formData.descripcion || "Descripción del evento"}</p>

              <p>
                <strong>Fecha:</strong> {formData.fecha}
              </p>
              <p>
                <strong>Lugar:</strong> {formData.lugar}
              </p>
              <p>
                <strong>Carrera:</strong> {formData.carrera}
              </p>
              <p>
                <strong>Escuela:</strong> {formData.escuela}
              </p>

              <label>Nombre completo</label>
              <input type="text" disabled placeholder="Tu respuesta" />

              <label>Cantidad de boletos</label>
              <input type="number" disabled placeholder={formData.boletos} />

              <div className="nc-preview-restricciones">
                <h4>Restricciones alimenticias</h4>
                {formData.restricciones.map((op, index) => (
                  <div key={index} className="nc-preview-opcion">
                    <span>{op.nombre}</span>
                    <div className="nc-btns-cantidad">
                      <button
                        type="button"
                        className="nc-btn-cantidad"
                        onClick={() => handleRestriccionCantidad(index, -1)}
                      >
                      </button>
                      <span className="nc-cantidad">{op.cantidad}</span>
                      <button
                        type="button"
                        className="nc-btn-cantidad"
                        onClick={() => handleRestriccionCantidad(index, +1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <label>Contacto de emergencia</label>
              <input type="text" disabled placeholder="Tu respuesta" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
