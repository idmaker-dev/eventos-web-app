import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventoPorId } from '../hooks/useEventoPorId';
import '../styles/pages/NuevoCuestionario.css';

// Componente para manejar las opciones de restricciones/preferencias
function RestriccionesAlimenticiasOpciones({ opciones, setOpciones }) {
  const handleOptionChange = (index, value) => {
    const newOptions = [...opciones];
    newOptions[index].nombre = value;
    setOpciones(newOptions);
  };

  const handleAddOption = () => {
    setOpciones([...opciones, { nombre: '', cantidad: 0 }]);
  };

  const handleRemoveOption = index => {
    const newOptions = [...opciones];
    newOptions.splice(index, 1);
    setOpciones(newOptions);
  };

  return (
    <div className="nc-section">
      <h2>Preferencias de comida</h2>
      {opciones.map((op, index) => (
        <div key={index} className="nc-opcion">
          <input
            type="text"
            value={op.nombre}
            onChange={e => handleOptionChange(index, e.target.value)}
            placeholder="Nombre de la preferencia"
            className="nc-input-restriccion"
          />
          <button
            type="button"
            className="nc-btn-eliminar"
            onClick={() => handleRemoveOption(index)}
            title="Eliminar preferencia"
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={handleAddOption} className="nc-btn-agregar">
        + Agregar preferencia
      </button>
    </div>
  );
}

export default function NuevoCuestionario() {
  const EVENTO_ID = 'mffj4jsdirg268cs1';
  const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1mb3NvdnQ2NTg4czRlNTIxIiwiZW1haWwiOiJyaDUwMDBAZ21haWwuY29tIiwicm9sIjoiYWRtaW4iLCJpYXQiOjE3NTgzNDQwMjAsImV4cCI6MTc1ODM0NzYyMH0.N6LR02r-K3WArFM9wsHdxnS4PXyrOJuicWqiq2oLtFM';

  let { evento } = useEventoPorId(EVENTO_ID, TOKEN);
  if (evento && evento.data) evento = evento.data;

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombreEvento: '',
    title: '',
    description: '',
    nombre_asistente: '',
    telefono: '',
    cantidad_boletos: 1,
    contactoEmergencia: '',
    restricciones_alimenticias_opciones: [
      { nombre: 'Vegetariano', cantidad: 0 },
      { nombre: 'Vegano', cantidad: 0 },
      { nombre: 'Sin gluten', cantidad: 0 },
      { nombre: 'Alergia a marisco', cantidad: 0 }
    ],
    lugar: '',
    fecha: '',
    carrera: '',
    escuela: ''
  });

  useEffect(() => {
    if (evento) {
      setFormData(prev => ({
        ...prev,
        nombreEvento: evento.nombreEvento || prev.nombreEvento,
        lugar: evento.lugar || prev.lugar,
        fecha: evento.fecha || prev.fecha,
        carrera: evento.licenciatura || prev.carrera,
        escuela: evento.escuela || prev.escuela
      }));
    }
  }, [evento]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRestriccionCantidad = (index, delta) => {
    const nuevas = [...formData.restricciones_alimenticias_opciones];
    nuevas[index].cantidad = Math.max(0, (nuevas[index].cantidad || 0) + delta);
    setFormData(prev => ({ ...prev, restricciones_alimenticias_opciones: nuevas }));
  };

  const handleGuardar = async () => {
    console.log('Estado actual de formData:', formData);

    const payload = {
      eventoId: EVENTO_ID,
      tipo: 'registro',
      title: formData.title,
      description: formData.description,
      fields: [
        {
          name: 'nombre_asistente',
          label: 'Nombre del asistente',
          type: 'string',
          inputType: 'text',
          required: true,
          placeholder: 'Ej. Juan Pérez'
        },
        {
          name: 'telefono',
          label: 'Teléfono de contacto',
          type: 'string',
          inputType: 'tel',
          required: true,
          verificar: true,
          placeholder: 'Ej. 5512345678'
        },
        {
          name: 'cantidad_boletos',
          label: 'Cantidad de boletos',
          type: 'number',
          inputType: 'number',
          required: true,
          min: 1,
          placeholder: 'Número de boletos'
        },
        {
          name: 'contactoEmergencia',
          label: 'Contacto de emergencia',
          type: 'string',
          inputType: 'text',
          required: false,
          placeholder: 'Ej. 5512345678'
        },
        {
          name: 'preferencias',
          label: 'Preferencias de comida',
          type: 'string',
          inputType: 'checkbox',
          required: false,
          options: formData.restricciones_alimenticias_opciones
            .filter(op => op.nombre.trim() !== '')
            .map(op => ({
              value: op.nombre.toLowerCase().replace(/\s/g, ''),
              label: op.nombre
            }))
        }
      ]
    };

    console.log('Payload que se enviará al backend:', JSON.stringify(payload, null, 2));

    try {
      const res = await fetch('http://localhost:7071/api/estructuras/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log('Respuesta del backend:', data);

      if (data && data.id) {
        navigate(`/cuestionario/${data.id}`);
      } else {
        alert('Error al guardar la estructura');
      }
    } catch (err) {
      console.error('Error en fetch:', err);
      alert('Error al guardar la estructura');
    }
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

      <nav className="nc-navbar">
        <button className="nc-btn">Configurar respuestas</button>
        <button className="nc-btn">Monitor de Chats <span className="nc-badge">6</span></button>
        <button className="nc-btn activo">Enlace cuestionario</button>
      </nav>

      <main className="nc-main">
        <aside className="nc-sidebar">
          <img src="/logoPlanoria.png" alt="LogoP" className="nc-logo-completo" />
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
      {/* 🔹 Logo superior */}
      <div className="nc-phone-header">
        <div className="nc-phone-header">
  <img src="/logoPlanoria.png" alt="Logo Planoria" className="nc-logo-completo" />
</div>
      </div>

      {/* Campos */}
      <label>Escuela o Institución</label>
      <input type="text" disabled placeholder="Tu respuesta" />

      <label>Cantidad de boletos requeridos</label>
      <select disabled>
        <option>{formData.cantidad_boletos || "6 Boletos"}</option>
      </select>

      {/* Restricciones */}
      <div className="nc-restricciones">
        <label>
          Restricciones alimenticias{" "}
          <small>(Ejemplo: vegetariano, vegano, sin gluten, alergias...)</small>
        </label>

        {formData.restricciones_alimenticias_opciones.map((op, index) => (
          <div key={index} className="nc-restriccion-item">
            <span>{op.nombre}</span>
            <span className="nc-restriccion-cantidad">{op.cantidad} personas</span>
          </div>
        ))}

        <input type="text" disabled placeholder="Añadir una restricción específica" />
      </div>

      <label>Contacto de emergencia</label>
      <input type="text" disabled placeholder="Tu respuesta" />

      {/* Botón */}
      <button className="nc-enviar">Enviar</button>
    </div>
  </div>
</section>

      </main>
    </div>
  );
}
