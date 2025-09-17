import React, { useEffect, useState } from 'react';
import Cuestionario from './Cuestionario';
import { fetchCuestionarioMock } from '../api/cuestionarioMock';
import DynamicFormFields from '../components/DynamicFormFields';
import '../styles/pages/NuevoCuestionario.css';

function NuevoCuestionario() {
  // Estado para los campos del formulario de invitación
  const [evento, setEvento] = useState({
    nombre: '',
    descripcion: '',
    lugar: '',
    fecha: '',
    nombreAsistente: '',
    carrera: '',
  });
  const [guardado, setGuardado] = useState(false);
  const [previewMode, setPreviewMode] = useState('mobile'); // 'mobile' | 'desktop'
  const [formDef, setFormDef] = useState(null);

  useEffect(() => {
    fetchCuestionarioMock().then(setFormDef);
  }, []);

  const handleChange = (e) => {
    setEvento({ ...evento, [e.target.name]: e.target.value });
  };

  const handleGuardar = (e) => {
    e.preventDefault();
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
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
          {/* Formulario de invitación */}
          <div
            className="modulo-comunicacion-form-section"
            style={{
              maxHeight: '760px',
              minHeight: '520px',
              overflowY: 'auto',
              minWidth: 340,
              maxWidth: 390,
              flex: '0 0 370px',
              width: '100%',
              boxSizing: 'border-box',
              marginLeft: 0,
            }}
          >
            <form className="modulo-comunicacion-form" onSubmit={handleGuardar}>
              <h2>Crear invitación de cuestionario</h2>
              <p className="modulo-comunicacion-form-desc">Completa los datos y envía enlace de tu evento.</p>
              <div className="modulo-comunicacion-form-group">
                <label>Nombre del evento</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Ejemplo: Ceremonia de Graduación - Generación 2025"
                  value={evento.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="modulo-comunicacion-form-group">
                <label>Descripción del evento</label>
                <textarea
                  name="descripcion"
                  placeholder="Ejemplo: ¡Felicidades por tu próxima graduación!..."
                  value={evento.descripcion}
                  onChange={handleChange}
                  rows={3}
                  required
                />
              </div>
              <div className="modulo-comunicacion-form-group">
                <label>Lugar de evento</label>
                <input
                  type="text"
                  name="lugar"
                  placeholder="Auditorio, salón, teatro, etc."
                  value={evento.lugar}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="modulo-comunicacion-form-group">
                <label>Fecha y hora del evento</label>
                <input
                  type="text"
                  name="fecha"
                  placeholder="Ejemplo: 25 de junio de 2025 – 17:00 hrs"
                  value={evento.fecha}
                  onChange={handleChange}
                  required
                />
              </div>
              <h3>Datos del asistente</h3>
              <div className="modulo-comunicacion-form-group">
                <label>Nombre completo</label>
                <input
                  type="text"
                  name="nombreAsistente"
                  placeholder="Respuesta"
                  value={evento.nombreAsistente}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="modulo-comunicacion-form-group">
                <label>Carrera o estudios realizados</label>
                <input
                  type="text"
                  name="carrera"
                  placeholder="Respuesta"
                  value={evento.carrera}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="modulo-comunicacion-form-actions">
                <button type="button" className="cancelar">Cancelar</button>
                <button type="submit" className="guardar" disabled={guardado}>{guardado ? 'Guardado' : 'Guardar'}</button>
              </div>
            </form>
          </div>
          {/* Previsualización */}
          <div
            className="modulo-comunicacion-preview-section"
            style={{
              minWidth: 700,
              maxWidth: 1200,
              flex: '1 1 1000px',
              height: '760px',
              maxHeight: '760px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              position: 'relative',
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
                  {/* Icono minimalista móvil */}
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
            {previewMode === 'mobile' ? (
              <div
                className="modulo-comunicacion-preview-mobile"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 40,
                  width: '100%',
                  height: '100%',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  alignItems: 'stretch',
                  boxSizing: 'border-box',
                  paddingTop: 60,
                }}
              >
                {formDef && (
                  <>
                    {/* Pantalla 1: primera mitad de campos */}
                    <div style={{background: '#eaf0f3', borderRadius: 24, boxShadow: '0 2px 12px #0001', minWidth: 370, maxWidth: 440, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                      <div className="cuestionario-header" style={{padding: '18px 18px 0 18px'}}>
                        <div className="cuestionario-logo">P</div>
                        <div className="cuestionario-planoria-text">Planoria</div>
                      </div>
                      <div className="cuestionario-titulo" style={{padding: '0 18px'}}>
                        <h2 style={{fontSize: '1.1rem'}}>{formDef.title}</h2>
                      </div>
                      <div className="cuestionario-info" style={{padding: '10px 18px', fontSize: '0.97rem'}}>
                        {formDef.description}
                      </div>
                      <form className="cuestionario-form" autoComplete="off" style={{padding: '0 18px'}}>
                        <DynamicFormFields
                          fields={formDef.fields.slice(0, Math.ceil(formDef.fields.length/2))}
                          values={{}}
                          onChange={()=>{}}
                        />
                      </form>
                    </div>
                    {/* Pantalla 2: segunda mitad de campos */}
                    <div style={{background: '#eaf0f3', borderRadius: 24, boxShadow: '0 2px 12px #0001', minWidth: 370, maxWidth: 440, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                      <form className="cuestionario-form" autoComplete="off" style={{padding: '18px'}}>
                        <DynamicFormFields
                          fields={formDef.fields.slice(Math.ceil(formDef.fields.length/2))}
                          values={{}}
                          onChange={()=>{}}
                        />
                        <div style={{textAlign: 'center', marginTop: 24}}>
                          <button type="button" className="cuestionario-boton-small" disabled>Enviar</button>
                        </div>
                      </form>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="modulo-comunicacion-preview-desktop" style={{height: '100%', paddingTop: 60, overflowY: 'auto'}}>
                <Cuestionario />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NuevoCuestionario;