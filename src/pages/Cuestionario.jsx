import React, { useEffect, useState } from 'react';
import '../styles/pages/Cuestionario.css';
import '../styles/components/DynamicFormFields.css';
import { fetchCuestionarioMock } from '../api/cuestionarioMock';
import { useCuestionario } from '../hooks/useCuestionario';
import DynamicFormFields from '../components/DynamicFormFields';

function Cuestionario() {
  const [formDef, setFormDef] = useState(null);
  const [enviado, setEnviado] = useState(false);
  // Cargar definición del formulario (simulado)
  useEffect(() => {
    fetchCuestionarioMock().then(setFormDef);
  }, []);

  // Inicializar hook solo cuando se tenga la definición
  const cuestionario = useCuestionario(formDef?.fields || []);

  if (!formDef) {
    return <div className="cuestionario-container">Cargando formulario...</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
    // Aquí se podría enviar a la API
    setTimeout(() => setEnviado(false), 2500);
    cuestionario.resetForm();
  };

  return (
    <div className="cuestionario-container">
      <div className="cuestionario-header">
        <div className="cuestionario-logo">P</div>
        <div className="cuestionario-planoria-text">Planoria</div>
      </div>
      <div className="cuestionario-checklist-icon" aria-hidden="true" style={{textAlign: 'center', marginBottom: '12px'}}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4AB290" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="3" width="16" height="18" rx="3"/>
          <path d="M8 9l3 3 5-5" />
        </svg>
      </div>
      <div className="cuestionario-titulo">
        <h2>{formDef.title}</h2>
      </div>
      <div className="cuestionario-info" style={{padding: '14px 18px', fontSize: '0.97rem'}}>
        {formDef.description}
      </div>
      <form className="cuestionario-form" onSubmit={handleSubmit} autoComplete="off">
        <DynamicFormFields
          fields={formDef.fields}
          values={cuestionario.form}
          onChange={cuestionario.handleChange}
        />
        <div className="cuestionario-boton-wrapper">
          <button type="submit" className="cuestionario-boton-small" disabled={enviado}>
            {enviado ? '¡Enviado!' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Cuestionario;
