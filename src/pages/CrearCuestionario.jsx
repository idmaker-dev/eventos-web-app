
import React, { useState } from 'react';
import { useCrearCuestionario } from '../hooks/useCrearCuestionario';
import DynamicFormCrear from '../components/DynamicFormCrear';
import '../styles/pages/CrearCuestionario.css';


// Valores de ejemplo para los campos del evento
const EVENTO_EJEMPLO = {
  id: 'evento_boletos_2025',
  nombre: 'Evento UNAM',
  institucion: 'UNAM',
  carrera: 'Ingeniería',
  lugar: 'Ciudad Universitaria',
  fecha: '2025-10-01',
  hora: '10:00',
  descripcion: 'Registro de boletos para el evento UNAM',
};


function CrearCuestionario() {
  // Estado para campos editables
  const [form, setForm] = useState({ tipo: '', title: '', description: '' });
  const [camposDinamicos, setCamposDinamicos] = useState([]);
  const { crearEstructura, loading, error } = useCrearCuestionario();
  const [guardado, setGuardado] = useState(false);

  // Maneja cambios en los campos editables
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Maneja cambios en los campos dinámicos
  const handleCamposDinamicos = (index, key, value) => {
    setCamposDinamicos((prev) => {
      const nuevos = [...prev];
      nuevos[index] = { ...nuevos[index], [key]: value };
      return nuevos;
    });
  };

  // Agregar un nuevo campo dinámico
  const agregarCampo = () => {
    setCamposDinamicos((prev) => [
      ...prev,
      {
        name: '',
        label: '',
        type: 'string',
        inputType: 'text',
        required: false,
        placeholder: '',
      },
    ]);
  };

  // Eliminar campo dinámico
  const eliminarCampo = (index) => {
    setCamposDinamicos((prev) => prev.filter((_, i) => i !== index));
  };

  // Guardar estructura
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      eventoId: EVENTO_EJEMPLO.id,
      tipo: form.tipo,
      title: form.title,
      description: form.description,
      fields: camposDinamicos,
      activo: true,
    };
    const res = await crearEstructura(payload);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
    if (res) {
      alert('Estructura creada exitosamente');
      setForm({ tipo: '', title: '', description: '' });
      setCamposDinamicos([]);
    }
  };

  return (
    <div className="crear-cuestionario-bg">
      <div className="crear-cuestionario-container">
        <h2 style={{color:'#16b6b1', textAlign:'center', marginBottom:24}}>Crear nuevo cuestionario</h2>
        <form className="crear-cuestionario-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="crear-cuestionario-section">
            <h3 style={{color:'#16b6b1'}}>Datos del evento</h3>
            <div className="crear-cuestionario-field">
              <label>ID del Evento</label>
              <input type="text" value={EVENTO_EJEMPLO.id} disabled style={{background:'#f2f6f8'}} />
            </div>
            <div className="crear-cuestionario-field">
              <label>Nombre</label>
              <input type="text" value={EVENTO_EJEMPLO.nombre} disabled style={{background:'#f2f6f8'}} />
            </div>
            <div className="crear-cuestionario-field">
              <label>Institución</label>
              <input type="text" value={EVENTO_EJEMPLO.institucion} disabled style={{background:'#f2f6f8'}} />
            </div>
            <div className="crear-cuestionario-field">
              <label>Carrera</label>
              <input type="text" value={EVENTO_EJEMPLO.carrera} disabled style={{background:'#f2f6f8'}} />
            </div>
            <div className="crear-cuestionario-field">
              <label>Lugar</label>
              <input type="text" value={EVENTO_EJEMPLO.lugar} disabled style={{background:'#f2f6f8'}} />
            </div>
            <div className="crear-cuestionario-field">
              <label>Fecha</label>
              <input type="text" value={EVENTO_EJEMPLO.fecha} disabled style={{background:'#f2f6f8'}} />
            </div>
            <div className="crear-cuestionario-field">
              <label>Hora</label>
              <input type="text" value={EVENTO_EJEMPLO.hora} disabled style={{background:'#f2f6f8'}} />
            </div>
            <div className="crear-cuestionario-field">
              <label>Descripción del evento</label>
              <input type="text" value={EVENTO_EJEMPLO.descripcion} disabled style={{background:'#f2f6f8'}} />
            </div>
          </div>
          <div className="crear-cuestionario-section">
            <h3 style={{color:'#16b6b1'}}>Configuración del cuestionario</h3>
            <div className="crear-cuestionario-field">
              <label>Título</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Ej. Registro de Boletos UNAM"
              />
            </div>
            <div className="crear-cuestionario-field">
              <label>Descripción</label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                placeholder="Describe el cuestionario"
              />
            </div>
            <div className="crear-cuestionario-field">
              <label>Tipo de cuestionario</label>
              <input
                type="text"
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                required
                placeholder="Ej. registro"
              />
            </div>
          </div>
          <div className="crear-cuestionario-section">
            <h3 style={{color:'#16b6b1'}}>Campos del cuestionario</h3>
            <DynamicFormCrear
              campos={camposDinamicos}
              onChangeCampo={handleCamposDinamicos}
              onEliminarCampo={eliminarCampo}
            />
            <button type="button" onClick={agregarCampo} className="agregar-campo">Agregar campo</button>
          </div>
          <div className="crear-cuestionario-actions">
            <button type="submit" className="guardar" disabled={loading || guardado}>{loading || guardado ? 'Guardando...' : 'Guardar cuestionario'}</button>
          </div>
          {error && <div className="crear-cuestionario-error">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default CrearCuestionario;
