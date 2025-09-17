import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
    Home,
  ClipboardCheck,
  Coins,
  Users,
  MessageCircle,
  Settings,
  Bell,
  Moon,
  Sun,
  Plus,
  X
} from "lucide-react";
import "../styles/pages/AdminPage.css";

// Componente del Cuestionario integrado
const CuestionarioModal = ({ isOpen, onClose, onComplete }) => {
  const [formDef, setFormDef] = useState(null);
  const [enviado, setEnviado] = useState(false);
  const [formValues, setFormValues] = useState({});

  // Mock de datos del cuestionario
  useEffect(() => {
    if (isOpen) {
      // Simular carga de datos del cuestionario
      setTimeout(() => {
        setFormDef({
          title: "Cuestionario de Planificación de Evento",
          description: "Completa este cuestionario para personalizar tu evento y obtener las mejores recomendaciones.",
          fields: [
            {
              id: "tipoEvento",
              type: "select",
              label: "Tipo de evento",
              required: true,
              options: [
                { value: "", label: "Selecciona una opción" },
                { value: "graduacion", label: "Ceremonia de Graduación" },
                { value: "gala", label: "Gala de Fin de Cursos" },
                { value: "conferencia", label: "Conferencia Académica" },
                { value: "otro", label: "Otro" }
              ]
            },
            {
              id: "presupuesto",
              type: "select",
              label: "Presupuesto estimado",
              required: true,
              options: [
                { value: "", label: "Selecciona un rango" },
                { value: "bajo", label: "Menos de $50,000" },
                { value: "medio", label: "$50,000 - $100,000" },
                { value: "alto", label: "$100,000 - $200,000" },
                { value: "premium", label: "Más de $200,000" }
              ]
            },
            {
              id: "servicios",
              type: "checkbox",
              label: "Servicios requeridos",
              options: [
                { value: "catering", label: "Servicio de catering" },
                { value: "fotografia", label: "Fotografía profesional" },
                { value: "musica", label: "Música y entretenimiento" },
                { value: "decoracion", label: "Decoración del lugar" },
                { value: "transporte", label: "Transporte para invitados" },
                { value: "seguridad", label: "Servicio de seguridad" }
              ]
            },
            {
              id: "temática",
              type: "text",
              label: "Temática o estilo preferido",
              placeholder: "Ej: Elegante, Casual, Temático, etc."
            },
            {
              id: "requerimientos",
              type: "textarea",
              label: "Requerimientos especiales",
              placeholder: "Describe cualquier necesidad específica para tu evento..."
            }
          ]
        });
      }, 500);
    }
  }, [isOpen]);

  const handleInputChange = (fieldId, value) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
    console.log('Datos del cuestionario:', formValues);
    
    setTimeout(() => {
      setEnviado(false);
      onComplete && onComplete();
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cuestionario-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cuestionario-header">
          <div className="cuestionario-logo">P</div>
          <div className="cuestionario-planoria-text">Planoria</div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="cuestionario-checklist-icon" style={{textAlign: 'center', marginBottom: '12px'}}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4AB290" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="16" height="18" rx="3"/>
            <path d="M8 9l3 3 5-5" />
          </svg>
        </div>

        {!formDef ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            Cargando formulario...
          </div>
        ) : (
          <>
            <div className="cuestionario-titulo">
              <h2>{formDef.title}</h2>
            </div>
            <div className="cuestionario-info" style={{padding: '14px 18px', fontSize: '0.97rem'}}>
              {formDef.description}
            </div>
            
            <form className="cuestionario-form" onSubmit={handleSubmit}>
              {formDef.fields.map(field => (
                <div key={field.id} className="form-group">
                  <label>{field.label} {field.required && <span style={{color: 'red'}}>*</span>}</label>
                  
                  {field.type === 'select' && (
                    <select
                      value={formValues[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      required={field.required}
                    >
                      {field.options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={formValues[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  )}
                  
                  {field.type === 'textarea' && (
                    <textarea
                      value={formValues[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      rows="4"
                    />
                  )}
                  
                  {field.type === 'checkbox' && (
                    <div className="checkbox-group">
                      {field.options.map(option => (
                        <label key={option.value} className="checkbox-label">
                          <input
                            type="checkbox"
                            value={option.value}
                            checked={formValues[field.id]?.includes(option.value) || false}
                            onChange={(e) => {
                              const currentValues = formValues[field.id] || [];
                              const newValues = e.target.checked
                                ? [...currentValues, option.value]
                                : currentValues.filter(v => v !== option.value);
                              handleInputChange(field.id, newValues);
                            }}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="cuestionario-boton-wrapper">
                <button type="submit" className="cuestionario-boton-small" disabled={enviado}>
                  {enviado ? '¡Enviado!' : 'Completar Configuración'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// Componente de Evento Creado Exitosamente
const EventoCreado = ({ isOpen, onClose, onGenerateLink }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content evento-creado-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="evento-creado-content">
          <div className="evento-creado-icon">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Partículas decorativas */}
              <circle cx="25" cy="35" r="4" fill="#4AB290" opacity="0.8"/>
              <circle cx="35" cy="25" r="3" fill="#4AB290" opacity="0.6"/>
              <circle cx="45" cy="40" r="2.5" fill="#4AB290" opacity="0.7"/>
              <circle cx="85" cy="30" r="3.5" fill="#4AB290" opacity="0.9"/>
              <circle cx="95" cy="40" r="2" fill="#4AB290" opacity="0.5"/>
              <circle cx="90" cy="20" r="2.5" fill="#4AB290" opacity="0.7"/>
              <circle cx="20" cy="85" r="3" fill="#4AB290" opacity="0.6"/>
              <circle cx="30" cy="95" r="2" fill="#4AB290" opacity="0.8"/>
              <circle cx="15" cy="75" r="2.5" fill="#4AB290" opacity="0.5"/>
              <circle cx="100" cy="80" r="4" fill="#4AB290" opacity="0.7"/>
              <circle cx="85" cy="95" r="2.5" fill="#4AB290" opacity="0.6"/>
              <circle cx="95" cy="90" r="2" fill="#4AB290" opacity="0.8"/>
              
              {/* Megáfono principal */}
              <path d="M40 45 L75 35 Q80 37 80 42 L80 78 Q80 83 75 85 L40 75 Q35 72 35 67 L35 53 Q35 48 40 45 Z" fill="#4AB290"/>
              <path d="M75 35 Q85 32 90 38 Q92 45 87 55 L87 65 Q92 75 90 82 Q85 88 75 85" stroke="#4AB290" strokeWidth="3" fill="none"/>
              
              {/* Ondas de sonido */}
              <path d="M82 50 Q87 48 89 52" stroke="#4AB290" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
              <path d="M82 60 Q87 58 89 62" stroke="#4AB290" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
              <path d="M82 70 Q87 68 89 72" stroke="#4AB290" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
            </svg>
          </div>
          
          <h2>¡Evento creado exitosamente!</h2>
          
          <p>
            Ya puedes empezar a personalizar<br />
            tu evento y compartir la información<br />
            con los asistentes.
          </p>
          
          <button 
            className="generar-enlace-btn"
            onClick={onGenerateLink}
          >
            Generar enlace<br />de cuestionario
          </button>
          
          <p className="acceso-panel-text">
            Accede al panel de administración para completar la información y<br />
            habilitar funciones como boletos, asientos y recordatorios.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function AdminPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEventoCreado, setShowEventoCreado] = useState(false);
  const [showCuestionario, setShowCuestionario] = useState(false);
  const [formData, setFormData] = useState({
    nombreEscuela: '',
    licenciatura: '',
    nombreEvento: '',
    lugarEvento: '',
    fechaHora: '',
    cantidadAsistentes: '',
    responsable: ''
  });

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos del evento:', formData);
    
    // Cerrar el modal de crear evento
    setIsModalOpen(false);
    
    // Mostrar la pantalla de evento creado exitosamente
    setShowEventoCreado(true);
    
    // Resetear el formulario
    setFormData({
      nombreEscuela: '',
      licenciatura: '',
      nombreEvento: '',
      lugarEvento: '',
      fechaHora: '',
      cantidadAsistentes: '',
      responsable: ''
    });
  };

  const handleGenerateLink = () => {
    // Cerrar la pantalla de evento creado
    setShowEventoCreado(false);
    
    // Abrir el cuestionario
    setShowCuestionario(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    // Resetear el formulario
    setFormData({
      nombreEscuela: '',
      licenciatura: '',
      nombreEvento: '',
      lugarEvento: '',
      fechaHora: '',
      cantidadAsistentes: '',
      responsable: ''
    });
  };

  const handleCuestionarioComplete = () => {
    console.log('Cuestionario completado');
    // Aquí puedes agregar lógica adicional después de completar el cuestionario
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo P*/}
        <div className="sidebar-logo-top">
          <img src="/logop.png" alt="Logo P" className="logo-p" />
        </div>

        {/* Menú navegación */}
        <nav className="sidebar-top">
          <ul>
            <li className="tooltip">
              <NavLink to="/admin" end>
                <Home size={22} />
              </NavLink>
              <span className="tooltip-pill">Inicio</span>
            </li>

            <li className="tooltip">
              <NavLink to="/admin/Evento">
                <ClipboardCheck size={22} />
              </NavLink>
              <span className="tooltip-pill">Resumen y progreso</span>
            </li>

            <li className="tooltip">
              <NavLink to="/admin/finanzas">
                <Coins size={22} />
              </NavLink>
              <span className="tooltip-pill">Módulo de pagos</span>
            </li>

            <li className="tooltip">
              <NavLink to="/admin/invitados">
                <Users size={22} />
              </NavLink>
              <span className="tooltip-pill">Módulo de asignación</span>
            </li>

            <li className="tooltip">
              <NavLink to="/admin/chat">
                <MessageCircle size={22} />
              </NavLink>
              <span className="tooltip-pill">Módulo de comunicación</span>
            </li>
          </ul>
        </nav>

        {/* Íconos inferiores */}
        <div className="sidebar-bottom">
          <NavLink to="/admin/configuracion">
            <Settings size={22} />
          </NavLink>
          <div className="sidebar-logo">
            <img src="/casa.png" alt="Logo inferior" />
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <main className="content">
        <div className="topbar">
          <div className="topbar-text">
            <h2>Hola, Instituto Villa Rica</h2>
            <p>Todo tu evento, en orden</p>
          </div>

          {/* Menu desplegable central con botón */}
          <div className="topbar-select-center">
            <select>
              <option>Graduación de Lic. Derecho 2020 - 2024</option>
              <option>Graduación de Ing. Sistemas 2021 - 2025</option>
              <option>Otro evento</option>
            </select>
            <button 
              className="create-event-btn"
              onClick={() => setIsModalOpen(true)}
              title="Crear nuevo evento"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Derecha */}
          <div className="topbar-icons">
            <Bell size={22} />
            {darkMode ? (
              <Sun size={22} onClick={() => setDarkMode(false)} />
            ) : (
              <Moon size={22} onClick={() => setDarkMode(true)} />
            )}
          </div>
        </div>

        <div className="child-content">
          <Outlet />
        </div>
      </main>

      {/* Modal de crear evento */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Crear evento</h3>
                <p>Completa los datos y comienza la organización de tu evento.</p>
              </div>
              <button 
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-group">
                <label>Nombre de la escuela o instituto</label>
                <input
                  type="text"
                  name="nombreEscuela"
                  value={formData.nombreEscuela}
                  onChange={handleInputChange}
                  placeholder="Ejemplo: Universidad Nacional, Instituto Tecnológico de Mon..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Licenciatura o especialidad</label>
                <input
                  type="text"
                  name="licenciatura"
                  value={formData.licenciatura}
                  onChange={handleInputChange}
                  placeholder="Ejemplo: Derecho, Medicina, Ingeniería en Sistemas"
                  required
                />
              </div>

              <div className="form-group">
                <label>Nombre del evento</label>
                <input
                  type="text"
                  name="nombreEvento"
                  value={formData.nombreEvento}
                  onChange={handleInputChange}
                  placeholder="Ejemplo: Ceremonia de Graduación, Gala de Fin de Cursos"
                  required
                />
              </div>

              <div className="form-group">
                <label>Lugar de evento</label>
                <input
                  type="text"
                  name="lugarEvento"
                  value={formData.lugarEvento}
                  onChange={handleInputChange}
                  placeholder="Auditorio, salón, teatro, etc."
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha y hora del evento</label>
                <input
                  type="datetime-local"
                  name="fechaHora"
                  value={formData.fechaHora}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Cantidad estimada de asistentes</label>
                <input
                  type="number"
                  name="cantidadAsistentes"
                  value={formData.cantidadAsistentes}
                  onChange={handleInputChange}
                  placeholder="Ejemplo: 100-200 asistentes"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Responsable o coordinador del evento</label>
                <input
                  type="text"
                  name="responsable"
                  value={formData.responsable}
                  onChange={handleInputChange}
                  placeholder="Ejemplo: Nombre y datos de contacto"
                  required
                />
              </div>

              <div className="form-buttons">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pantalla de Evento Creado */}
      <EventoCreado 
        isOpen={showEventoCreado}
        onClose={() => setShowEventoCreado(false)}
        onGenerateLink={handleGenerateLink}
      />

      {/* Modal del Cuestionario */}
      <CuestionarioModal 
        isOpen={showCuestionario}
        onClose={() => setShowCuestionario(false)}
        onComplete={handleCuestionarioComplete}
      />
    </div>
  );
}