import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventoPorId } from '../hooks/useEventoPorId';
import '../styles/pages/NuevoCuestionario.css';
// Componente reutilizable para restricciones alimenticias


// Componente para editar opciones de restricciones alimenticias (solo en creación)
function RestriccionesAlimenticiasOpciones({ opciones, setOpciones }) {
  const [nueva, setNueva] = useState('');
  const handleAdd = () => {
    const val = nueva.trim();
    if (val && !opciones.includes(val)) {
      setOpciones([...opciones, val]);
      setNueva('');
    }
  };
  const handleRemove = idx => {
    setOpciones(opciones.filter((_, i) => i !== idx));
  };
  return (
    <div className="restricciones-alimenticias-box" style={{background:'#f4fafd',borderRadius:10,padding:14,marginBottom:18}}>
      <div style={{color:'#1a8',fontWeight:600,marginBottom:2}}>Opciones de restricciones alimenticias <span style={{fontWeight:400, color:'#666', fontSize:'0.97em'}}>Ejemplo: vegetariano, vegano, sin gluten, alergias, etc.</span></div>
      <div style={{margin:'10px 0'}}>
        {opciones.map((op, idx) => (
          <div key={op} style={{display:'flex',alignItems:'center',marginBottom:6}}>
            <span style={{flex:1}}>{op}</span>
            <button type="button" onClick={()=>handleRemove(idx)} style={{marginLeft:8}}>Eliminar</button>
          </div>
        ))}
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <input type="text" value={nueva} onChange={e=>setNueva(e.target.value)} placeholder="Añadir nueva opción" style={{flex:1}} />
          <button type="button" onClick={handleAdd}>Agregar</button>
        </div>
      </div>
    </div>
  );
}
function NuevoCuestionario() {

  // Cargar evento real usando el hook
  const EVENTO_ID = 'mffj4jsdirg268cs1';
  const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1mb3NvdnQ2NTg4czRlNTIxIiwiZW1haWwiOiJyaDUwMDBAZ21haWwuY29tIiwicm9sIjoiYWRtaW4iLCJpYXQiOjE3NTgzMTIxMjgsImV4cCI6MTc1ODMxNTcyOH0.LzNEKAeCpOPg18MjQprqEdQZi6vus3ItSuayJZTjLkQ';
  let { evento, loading: loadingEvento, error: errorEvento } = useEventoPorId(EVENTO_ID, TOKEN);
  if (evento && evento.data) {
    evento = evento.data;
  }
  // Permitir seleccionar el evento (en el futuro puede haber más)
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [previewMode, setPreviewMode] = useState('mobile');


  // Estado para la estructura del cuestionario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    nombre_asistente: '',
    telefono: '',
    cantidad_boletos: 1,
    restricciones_alimenticias_opciones: ['Vegetariano', 'Vegano', 'Sin gluten', 'Alergia a marisco'],
    invitados_veganos: false
  });

  const navigate = useNavigate();

  // Opciones para cantidad de boletos
  const boletosOptions = Array.from({length: 10}, (_, i) => i + 1);

  // Handlers para campos principales
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      dynamicFields: Array.isArray(prev.dynamicFields) ? prev.dynamicFields : []
    }));
  };


  // Campos dinámicos (adicionales)
  const handleDynamicFieldChange = (idx, key, value) => {
    setFormData(prev => {
  const dynamicFields = (prev.dynamicFields || []).map((f, i) => i === idx ? { ...f, [key]: value } : f);
      return { ...prev, dynamicFields };
    });
  };
  const handleAddDynamicField = () => {
    setFormData(prev => ({
      ...prev,
      dynamicFields: [
        ...prev.dynamicFields,
        { name: '', label: '', type: 'string', inputType: 'text', placeholder: '', required: false }
      ]
    }));
  };
  const handleRemoveDynamicField = (idx) => {
    setFormData(prev => ({
      ...prev,
      dynamicFields: prev.dynamicFields.filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className="modulo-comunicacion-bg">
      <div
        className="modulo-comunicacion-container"
        style={{
          maxWidth: '1850px',
          minWidth: '1200px',
          width: '98vw',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <div className="modulo-comunicacion-header">
          <h1>Módulo de comunicación</h1>
          <p>Configuración de conversaciones y del Bot de Preguntas Frecuentes (FAQ)</p>
        </div>
        <div className="modulo-comunicacion-tabs">
          <button className="tab active">Enlace cuestionario</button>
        </div>
        <div
          className="modulo-comunicacion-main"
          style={{
            display: 'flex',
            gap: 56,
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            width: '100%',
          }}
        >
          {/* Info del evento y enlace para crear cuestionario */}
          <div
            className="modulo-comunicacion-form-section"
            style={{
              maxHeight: '760px',
              minHeight: '520px',
              overflowY: 'auto',
              minWidth: 340,
              maxWidth: 480,
              flex: '0 0 420px',
              width: '100%',
              boxSizing: 'border-box',
              marginLeft: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 24,
            }}
          >
            <h2>Crear nuevo cuestionario</h2>
            <form className="crear-cuestionario-form" style={{width: '100%', background: '#f2f6f8', borderRadius: 10, padding: 18, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '650px', overflowY: 'auto'}}>
              {loadingEvento && <div style={{color: '#888'}}>Cargando evento...</div>}
              {errorEvento && <div style={{color: 'red'}}>Error: {errorEvento}</div>}
              {/* Título del cuestionario */}
              <div>
                <label><b>Título del cuestionario:</b></label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Ej. Ceremonia de Graduación - Generación 2025" style={{width: '100%', borderRadius: 5, padding: 6, marginTop: 2}} required />
              </div>
              <div>
                <label><b>Descripción del evento:</b></label>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Ejemplo: ¡Felicidades por tu próxima graduación!..." style={{width: '100%', borderRadius: 5, padding: 6, marginTop: 2}} />
              </div>
              {/* Selección de evento */}
              {evento && (
                <div style={{
                  background: '#f7fafd',
                  borderRadius: 10,
                  padding: '10px 18px',
                  margin: '10px 0 18px 0',
                  border: '1px solid #e0e0e0',
                  color: '#222',
                  fontSize: '1rem',
                  boxShadow: '0 1px 2px #0001',
                  width: '100%',
                  lineHeight: 1.6,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}>
                  <label style={{marginBottom: 6}}>
                    <input
                      type="radio"
                      name="eventoSeleccionado"
                      checked={eventoSeleccionado === evento.id || (!eventoSeleccionado && evento.id)}
                      onChange={() => setEventoSeleccionado(evento.id)}
                    />{' '}
                    <b>Seleccionar este evento</b>
                  </label>
                  <div><b>Lugar:</b> {evento.lugar || '-'}</div>
                  <div><b>Fecha:</b> {evento.fecha || '-'}</div>
                  <div><b>Escuela:</b> {evento.escuela || '-'}</div>
                  <div><b>Licenciatura:</b> {evento.licenciatura || '-'}</div>
                </div>
              )}
              {/* Campos obligatorios */}
              <div>
                <label><b>Nombre del asistente:</b></label>
                <input type="text" name="nombre_asistente" value={formData.nombre_asistente} onChange={handleChange} placeholder="Ej. Juan Pérez" style={{width: '100%', borderRadius: 5, padding: 6, marginTop: 2}} required />
              </div>
              <div>
                <label><b>Teléfono de contacto:</b></label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Ej. 5512345678" style={{width: '100%', borderRadius: 5, padding: 6, marginTop: 2}} required />
              </div>
              <div>
                <label><b>Cantidad de boletos:</b></label>
                <input type="number" name="cantidad_boletos" value={formData.cantidad_boletos} min={1} onChange={handleChange} placeholder="Número de boletos" style={{width: '100%', borderRadius: 5, padding: 6, marginTop: 2}} required />
              </div>
              <RestriccionesAlimenticiasOpciones
                opciones={formData.restricciones_alimenticias_opciones}
                setOpciones={opciones => setFormData(prev => ({ ...prev, restricciones_alimenticias_opciones: opciones }))}
              />
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <input type="checkbox" id="invitados_veganos" name="invitados_veganos" checked={formData.invitados_veganos} onChange={e => setFormData(prev => ({ ...prev, invitados_veganos: e.target.checked }))} />
                <label htmlFor="invitados_veganos"><b>¿Hay invitados veganos?</b></label>
              </div>
              <div>
                <label><b>Contacto de emergencia:</b></label>
                <input type="text" name="contactoEmergencia" value={formData.contactoEmergencia} onChange={handleChange} placeholder="Respuesta" style={{width: '100%', borderRadius: 5, padding: 6, marginTop: 2}} />
              </div>
              {/* Campos dinámicos adicionales */}
              <div style={{margin: '10px 0'}}>
                <label><b>Campos adicionales del cuestionario:</b></label>
                {(Array.isArray(formData.dynamicFields) ? formData.dynamicFields : []).map((campo, idx) => (
                  <div key={idx} style={{display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6}}>
                    <input type="text" value={campo.label} onChange={e => handleDynamicFieldChange(idx, 'label', e.target.value)} placeholder="Etiqueta" style={{flex: 2, borderRadius: 5, padding: 6}} />
                    <select value={campo.inputType} onChange={e => handleDynamicFieldChange(idx, 'inputType', e.target.value)} style={{flex: 1, borderRadius: 5, padding: 6}}>
                      <option value="text">Texto</option>
                      <option value="number">Número</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                    <button type="button" onClick={() => handleRemoveDynamicField(idx)} style={{background: '#e57373', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer'}}>Eliminar</button>
                  </div>
                ))}
                <button type="button" onClick={handleAddDynamicField} style={{marginTop: 8, background: '#72B7A4', color: '#fff', border: 'none', borderRadius: 5, padding: '6px 14px', cursor: 'pointer'}}>Agregar campo</button>
              </div>
              <button className="guardar" type="button" style={{marginTop: 12}}
                onClick={async () => {
                  // Construir estructura para el backend
                  const estructura = {
                    eventoId: eventoSeleccionado || (evento && evento.id) || EVENTO_ID,
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
                        name: 'restricciones_alimenticias',
                        label: 'Restricciones alimenticias',
                        type: 'object',
                        inputType: 'select',
                        required: false,
                        placeholder: '',
                        formato: 'restriccionesAlimenticiasV2',
                        opciones: formData.restricciones_alimenticias_opciones
                      },
                      {
                        name: 'invitados_veganos',
                        label: '¿Hay invitados veganos?',
                        type: 'boolean',
                        inputType: 'checkbox',
                        required: false,
                        options: [
                          { value: 'si', label: 'Sí' }
                        ]
                      }
                    ]
                  };
                  try {
                    console.log('Estructura enviada al backend:', estructura);
                    const res = await fetch('http://localhost:7071/api/estructuras/crear', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(estructura)
                    });
                    const data = await res.json();
                    if (data && data.id) {
                      // Redirigir a la página del cuestionario creado
                      navigate(`/cuestionario/${data.id}`);
                    } else {
                      alert('Error al guardar la estructura');
                    }
                  } catch (err) {
                    alert('Error al guardar la estructura');
                  }
                }}
              >Guardar cuestionario</button>
            </form>
          </div>
          {/* Previsualización */}
          <div
            className="modulo-comunicacion-preview-section"
            style={{
              minWidth: 420,
              maxWidth: 700,
              flex: '1 1 600px',
              height: '760px',
              maxHeight: '760px',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              position: 'relative',
              background: '#f8fafb',
              borderRadius: 12,
              border: '1px solid #e0e0e0',
              marginLeft: 0
            }}
          >
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 16,
              position: 'absolute',
              top: 18,
              right: 24,
              zIndex: 2,
            }}>
              <span style={{color: '#fff', fontWeight: 500, fontSize: '1.08rem', marginRight: 8}}>Previsualización</span>
              <div className="modulo-comunicacion-preview-toggle" style={{display: 'flex', gap: 4}}>
                <button
                  className={previewMode === 'mobile' ? 'active' : ''}
                  onClick={() => setPreviewMode('mobile')}
                  type="button"
                  aria-label="Vista móvil"
                  style={{padding: 4, background: 'none', border: 'none', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18"><rect x="5" y="2" width="8" height="14" rx="2" fill={previewMode==='mobile' ? '#72B7A4' : '#fff'} stroke="#fff" strokeWidth="1.2"/></svg>
                </button>
                <button
                  className={previewMode === 'desktop' ? 'active' : ''}
                  onClick={() => setPreviewMode('desktop')}
                  type="button"
                  aria-label="Vista escritorio"
                  style={{padding: 4, background: 'none', border: 'none', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                >
                  {/* Icono minimalista desktop */}
                  <svg width="22" height="18" viewBox="0 0 22 18"><rect x="2" y="3" width="18" height="10" rx="2" fill={previewMode==='desktop' ? '#72B7A4' : '#fff'} stroke="#fff" strokeWidth="1.2"/><rect x="8" y="14" width="6" height="2" rx="1" fill={previewMode==='desktop' ? '#72B7A4' : '#fff'} stroke="#fff" strokeWidth="1.2"/></svg>
                </button>
              </div>
              <button className="enlace-cuestionario-btn" style={{fontSize: '0.95rem', padding: '5px 14px', minWidth: 0, height: 32, borderRadius: 7}}>Enlace</button>
            </div>
            <div style={{height: '100%', paddingTop: 60, overflowY: 'auto', paddingLeft: 32, paddingRight: 32}}>
              {/* Previsualización en tiempo real del cuestionario */}
              <div style={{maxWidth: 600, margin: '0 auto'}}>
                <h2 style={{marginBottom: 8, color: '#333'}}>{formData.title || 'Título del cuestionario'}</h2>
                <div style={{marginBottom: 12, color: '#555'}}>{formData.description || 'Descripción del cuestionario'}</div>
                {evento && (
                  <div style={{marginBottom: 12, fontSize: '1rem', color: '#444'}}>
                    <div><b>Lugar:</b> {evento.lugar || '-'}</div>
                    <div><b>Fecha:</b> {evento.fecha || '-'}</div>
                    <div><b>Escuela:</b> {evento.escuela || '-'}</div>
                    <div><b>Licenciatura:</b> {evento.licenciatura || '-'}</div>
                  </div>
                )}
                <div style={{marginBottom: 10}}>
                  <b>Nombre completo del asistente:</b>
                  <input type="text" disabled placeholder="Ej. Ana López" style={{width: '100%', borderRadius: 5, padding: 6, marginTop: 2, marginBottom: 8}} />
                </div>
                <div style={{marginBottom: 10}}>
                  <b>Cantidad de boletos:</b>
                  <select disabled style={{width: '100%', borderRadius: 5, padding: 6, marginTop: 2, marginBottom: 8}}>
                    {(boletosOptions || []).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div style={{marginBottom: 10}}>
                  <b>Restricciones alimenticias:</b>
                  {(formData.restricciones || []).map((r, idx) => r.count > 0 && (
                    <div key={r.name} style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4}}>
                      <span>{r.name}: <b>{r.count}</b></span>
                    </div>
                  ))}
                  {formData.restriccionEspecifica && (
                    <div style={{marginTop: 4}}>
                      <span>Otra: {formData.restriccionEspecifica}</span>
                    </div>
                  )}
                </div>
                <div style={{marginBottom: 10}}>
                  <b>Contacto de emergencia:</b>
                  <input type="text" disabled placeholder="Ej. 5551234567" style={{width: '100%', borderRadius: 5, padding: 6, marginTop: 2, marginBottom: 8}} />
                </div>
                {/* Campos adicionales */}
                {(Array.isArray(formData.dynamicFields) && formData.dynamicFields.length > 0) && <div style={{marginTop: 18, marginBottom: 8}}><b>Campos adicionales:</b></div>}
                {(Array.isArray(formData.dynamicFields) ? formData.dynamicFields : []).map((campo, idx) => (
                  <div key={idx} style={{marginBottom: 10}}>
                    <label>{campo.label || 'Campo adicional'}:</label>
                    {campo.inputType === 'text' && <input type="text" disabled style={{width: '100%', borderRadius: 5, padding: 6, marginTop: 2}} />}
                    {campo.inputType === 'number' && <input type="number" disabled style={{width: '100%', borderRadius: 5, padding: 6, marginTop: 2}} />}
                    {campo.inputType === 'checkbox' && <input type="checkbox" disabled style={{marginLeft: 8}} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NuevoCuestionario;