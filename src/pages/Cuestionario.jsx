
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/pages/Cuestionario.css';
import '../styles/components/DynamicFormFields.css';
import DynamicFormResponder from '../components/DynamicFormResponder';
import { useCuestionario } from '../hooks/useCuestionario';


function Cuestionario() {
  // IDs requeridos por el endpoint
  const eventoId = 'mffj4jsdirg268cs1';
  const params = useParams();
  const cuestionarioId = params.id || 'mfpv6o4fuq8erh8vp';
  const [enviado, setEnviado] = React.useState(false);
  // Estado local para los fields y la definición del cuestionario
  const [formDef, setFormDef] = useState(null);
  const [loading, setLoading] = useState(true);
  // Inicializa el hook con los fields reales cuando estén listos
  const fields = formDef && Array.isArray(formDef.fields) ? formDef.fields : [];
  const {
    form,
    setForm,
    handleChange,
    resetForm
  } = useCuestionario(fields);

  useEffect(() => {
    setLoading(true);
    setFormDef(null);
    setForm({});
    let ignore = false;
    const fetchEstructura = async () => {
      try {
        const res = await fetch('http://localhost:7071/api/estructuras/obtenerPorIdYEvento', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventoId, id: cuestionarioId }),
        });
        const data = await res.json();
        console.log('Respuesta cuestionario:', data);
        if (!ignore) {
          if (data.success && data.data) {
            let estructura = data.data;
            if (!Array.isArray(estructura.fields) && estructura.formDef && Array.isArray(estructura.formDef.fields)) {
              estructura.fields = estructura.formDef.fields;
            }
            if (!Array.isArray(estructura.fields)) {
              estructura.fields = [];
            }
            setFormDef(estructura);
          } else {
            setFormDef(null);
            console.error('No se pudo cargar la estructura del cuestionario', data);
          }
        }
      } catch (err) {
        if (!ignore) console.error('Error al cargar cuestionario', err);
        setFormDef(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchEstructura();
    return () => { ignore = true; };
    // eslint-disable-next-line
  }, [cuestionarioId]);

  // Cuando los fields cambian, reinicializar el form
  useEffect(() => {
    if (fields && fields.length > 0) {
      resetForm && resetForm(fields);
    }
    // eslint-disable-next-line
  }, [fields]);

  if (loading) {
    return <div className="cuestionario-container">Cargando formulario...</div>;
  }
  if (!fields || fields.length === 0) {
    return <div className="cuestionario-container">No se encontró el cuestionario o no tiene campos.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviado(true);
    // Aquí podrías enviar las respuestas a la API si lo deseas
    setTimeout(() => setEnviado(false), 2500);
    setForm({});
  };

  return (
    <div className="cuestionario-container">
      <div style={{textAlign: 'center', color: '#888', fontSize: '0.95em', marginBottom: 8}}>
        <b>ID del cuestionario:</b> {cuestionarioId}
      </div>
      <div className="cuestionario-header">
        <div className="cuestionario-logo">
          <img src={process.env.PUBLIC_URL + '/logo tentativo 2.svg'} alt="Logo Planoria" style={{height: '40px', width: 'auto'}} />
        </div>
        <div className="cuestionario-planoria-text">Planoria</div>
      </div>
      <div className="cuestionario-icono-encabezado" style={{textAlign: 'center', marginBottom: '12px'}}>
        <img src={process.env.PUBLIC_URL + '/Icono de cuestionario.svg'} alt="Icono Cuestionario" style={{height: '48px', width: '48px'}} />
      </div>
      <div className="cuestionario-titulo">
  <h2>{formDef && formDef.title}</h2>
      </div>
      <div className="cuestionario-info" style={{padding: '14px 18px', fontSize: '0.97rem'}}>
  {formDef && formDef.description}
      </div>
      <form className="cuestionario-form" onSubmit={handleSubmit} autoComplete="off">
        <DynamicFormResponder
          fields={formDef.fields}
          values={form}
          onChange={handleChange}
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
