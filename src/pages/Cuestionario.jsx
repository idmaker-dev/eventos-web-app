import React, { useEffect, useState } from 'react';
import '../styles/pages/Cuestionario.css';
import '../styles/components/DynamicFormFields.css';
import DynamicFormResponder from '../components/DynamicFormResponder';
import { useEventoPorId } from '../hooks/useEventoPorId';

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
  const cuestionarioId = 'mfrotlboe5o3tnvnh';
  const EVENTO_ID = 'mffj4jsdirg268cs1';
  const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1mb3NvdnQ2NTg4czRlNTIxIiwiZW1haWwiOiJyaDUwMDBAZ21haWwuY29tIiwicm9sIjoiYWRtaW4iLCJpYXQiOjE3NTgzNDA2OTUsImV4cCI6MTc1ODM0NDI5NX0.Wl3RPPg0X0v2n-rx6i-LO7TeJCmx_xtfa9VN5Acgir0';

  const { evento, loading: loadingEvento, error: errorEvento } = useEventoPorId(EVENTO_ID, TOKEN);

  const [cuestionario, setCuestionario] = useState(null);
  const [form, setForm] = useState({});
  const [preferencias, setPreferencias] = useState([]);
  const [loadingCuestionario, setLoadingCuestionario] = useState(true);
  const [enviado, setEnviado] = useState(false);

  const loading = loadingEvento || loadingCuestionario;

  // Traer estructura del cuestionario
  useEffect(() => {
    let ignore = false;
    const fetchCuestionario = async () => {
      try {
        const res = await fetch('http://localhost:7071/api/estructuras/obtenerPorIdYEvento', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}` 
          },
          body: JSON.stringify({ eventoId: EVENTO_ID, id: cuestionarioId })
        });
        const data = await res.json();
        console.log('Datos del cuestionario recibidos:', data);
        if (!ignore && data.success && data.data) {
          setCuestionario(data.data);
          setForm({});
          // Inicializar preferencias con cantidad 0
          const pref = data.data.fields.find(f => f.name === 'preferencias')?.options || [];
          setPreferencias(pref.map(p => ({ ...p, cantidad: 0 })));
        }
      } catch (err) {
        console.error('Error cargando cuestionario:', err);
      } finally {
        if (!ignore) setLoadingCuestionario(false);
      }
    };
    fetchCuestionario();
    return () => { ignore = true; };
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setEnviado(true);
    console.log('Formulario enviado:', form, 'Preferencias:', preferencias, 'Datos evento:', evento);
    setTimeout(() => setEnviado(false), 2000);
    // Aquí enviar al backend
  };

  if (loading) return <div className="cuestionario-container">Cargando formulario...</div>;
  if (!cuestionario) return <div className="cuestionario-container">No se encontró el cuestionario.</div>;
  if (errorEvento) return <div className="cuestionario-container">Error cargando evento: {errorEvento}</div>;

  return (
    <div className="cuestionario-container">
      <div className="cuestionario-header">
        <img src={process.env.PUBLIC_URL + '/logo tentativo 2.svg'} alt="Logo" style={{height: '40px'}} />
        <span className="cuestionario-planoria-text">Planoria</span>
      </div>

      <div style={{textAlign: 'center', margin: '16px 0'}}>
        <img src={process.env.PUBLIC_URL + '/Icono de cuestionario.svg'} alt="Icono" style={{height: '48px'}} />
      </div>

      <h2 className="cuestionario-titulo">{cuestionario.title}</h2>
      <div className="cuestionario-info">{cuestionario.description}</div>

      <form className="cuestionario-form" onSubmit={handleSubmit}>
        {/* Datos del evento visibles */}
        {evento && (
          <div className="nc-section">
            <p><strong>Evento:</strong> {evento.nombreEvento}</p>
            <p><strong>Lugar:</strong> {evento.lugar}</p>
            <p><strong>Fecha:</strong> {evento.fecha}</p>
            <p><strong>Carrera:</strong> {evento.carrera || evento.licenciatura}</p>
            <p><strong>Escuela:</strong> {evento.escuela}</p>
          </div>
        )}

        {/* DynamicFormResponder para todos los fields excepto preferencias */}
        <DynamicFormResponder
          fields={cuestionario.fields.filter(f => f.name !== 'preferencias')}
          values={form}
          onChange={handleChange}
        />

        {/* Preferencias de comida con contador */}
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
