import React, { useEffect, useState } from 'react';
import '../styles/pages/Cuestionario.css';
import '../styles/components/DynamicFormFields.css';
import DynamicFormResponder from '../components/DynamicFormResponder';
import { useEventoPorId } from '../hooks/useEventoPorId';
import { useCuestionario } from '../hooks/useCuestionario';

// Componente para preferencias de comida con contador
function PreferenciasComida({ opciones, setOpciones }) {
  const handleCantidad = (index, delta) => {
    const nuevas = [...opciones];
    nuevas[index].cantidad = Math.max(0, (nuevas[index].cantidad || 0) + delta);
    setOpciones(nuevas);
  };

  return (
    <div className="nc-section">
      <h4>Preferencias de comida</h4>
      {opciones.map((op, index) => (
        <div key={index} className="nc-preview-opcion">
          <span>{op.label}</span>
          <div className="nc-btns-cantidad">
            <button type="button" onClick={() => handleCantidad(index, -1)} className="nc-btn-cantidad">–</button>
            <span className="nc-cantidad">{op.cantidad || 0}</span>
            <button type="button" onClick={() => handleCantidad(index, +1)} className="nc-btn-cantidad">+</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Cuestionario() {
  const cuestionarioId = 'mfrt3938ifudjpad5';
  const EVENTO_ID = 'mffj4jsdirg268cs1';
  const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1mb3NvdnQ2NTg4czRlNTIxIiwiZW1haWwiOiJyaDUwMDBAZ21haWwuY29tIiwicm9sIjoiYWRtaW4iLCJpYXQiOjE3NTgzNDg4NDgsImV4cCI6MTc1ODM1MjQ0OH0.ILmuVXlHjZgsTDcLbhcYtyIx67xSeKICq-xOGzoNjjg';

  const { evento, loading: loadingEvento, error: errorEvento } = useEventoPorId(EVENTO_ID, TOKEN);


  const { form, setForm, handleChange, submitRegistro, setResult } = useCuestionario([]);

  const [cuestionario, setCuestionario] = useState(null);
  const [preferencias, setPreferencias] = useState([]);
  const [loadingCuestionario, setLoadingCuestionario] = useState(true);
  const [enviado, setEnviado] = useState(false);

  const loading = loadingEvento || loadingCuestionario;


  useEffect(() => {
    let ignore = false;

    const cargarCuestionario = async () => {
      try {
        const data = await fetch('http://localhost:7071/api/estructuras/obtenerPorIdYEvento', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
          },
          body: JSON.stringify({ eventoId: EVENTO_ID, id: cuestionarioId })
        }).then(res => res.json());

        if (!ignore && data.success && data.data) {
          setCuestionario(data.data);
          setForm({}); 

    
          const prefField = data.data.fields.find(f => f.name === 'preferencias');
          setPreferencias(prefField?.options.map(p => ({ ...p, cantidad: 0 })) || []);
        }
      } catch (err) {
        console.error('Error cargando cuestionario:', err);
      } finally {
        if (!ignore) setLoadingCuestionario(false);
      }
    };

    cargarCuestionario();
    return () => { ignore = true; };
  }, [cuestionarioId, setForm, TOKEN]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviado(true);

    const respuestasCompletas = { ...form, preferencias };
    await submitRegistro(EVENTO_ID, cuestionarioId, respuestasCompletas);
    setTimeout(() => setEnviado(false), 2000);
  };

  if (loading) return <div className="cuestionario-container">Cargando formulario...</div>;
  if (!cuestionario) return <div className="cuestionario-container">No se encontró el cuestionario.</div>;
  if (errorEvento) return <div className="cuestionario-container">Error cargando evento: {errorEvento}</div>;

  const eventoInfo = evento?.data ? (Array.isArray(evento.data) ? evento.data[0] : evento.data) : null;

  return (
    <div className="cuestionario-container">
      <div className="cuestionario-header">
        <img src={process.env.PUBLIC_URL + '/logo tentativo 2.svg'} alt="Logo" style={{height: '40px'}} />
      </div>

      <div style={{textAlign: 'center', margin: '16px 0'}}>
        <img src={process.env.PUBLIC_URL + '/Icono de cuestionario.svg'} alt="Icono" style={{height: '48px'}} />
      </div>

      <h2 className="cuestionario-titulo">{cuestionario.title}</h2>
      <div className="cuestionario-info">{cuestionario.description}</div>

      <form className="cuestionario-form" onSubmit={handleSubmit}>
        {eventoInfo && (
          <div className="nc-section">
            <p><strong>Evento:</strong> {eventoInfo.nombreEvento}</p>
            <p><strong>Lugar:</strong> {eventoInfo.lugar}</p>
            <p><strong>Fecha:</strong> {eventoInfo.fecha}</p>
            <p><strong>Carrera:</strong> {eventoInfo.carrera || eventoInfo.licenciatura}</p>
            <p><strong>Escuela:</strong> {eventoInfo.escuela}</p>
          </div>
        )}

        <DynamicFormResponder
          fields={cuestionario.fields.filter(f => f.name !== 'preferencias')}
          values={form}
          onChange={handleChange}
        />

        <PreferenciasComida opciones={preferencias} setOpciones={setPreferencias} />

        <div style={{textAlign: 'center', marginTop: '20px'}}>
          <button type="submit" className="cuestionario-boton-small" disabled={enviado}>
            {enviado ? '¡Enviado!' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Cuestionario;
