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
            <svg width="120" height="120" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="m90.87,150.24l-67.49,28.41c-2.13.89-4.36,1.34-6.56,1.34-4.37,0-8.65-1.72-11.88-4.94-4.86-4.86-6.28-12.1-3.61-18.44l28.41-67.5,61.13,61.13h0Zm30.68-43.2l-48.6-48.59c-4.78-4.79-11.6-6.86-18.23-5.56-6.63,1.31-12.16,5.79-14.78,12.03l-3.91,9.29,69.77,69.77,9.29-3.91c6.23-2.63,10.73-8.15,12.02-14.78,1.3-6.64-.78-13.46-5.56-18.23h0Zm-3.09-50.01c5.48-7.22,8.51-14.88,9.02-22.81,1.29-20.23-13.46-32.12-14.09-32.62-3.23-2.54-7.88-2-10.47,1.22-2.58,3.21-2.06,7.92,1.13,10.52.38.31,9.24,7.69,8.46,19.92-.32,4.93-2.33,9.87-5.99,14.69-2.51,3.3-1.86,8,1.44,10.51,1.36,1.03,2.95,1.52,4.53,1.52,2.27,0,4.51-1.03,5.98-2.97h0Zm58.36,46.61c3.39-2.39,4.2-7.07,1.81-10.46-2.8-3.97-10.4-10.68-21.13-10.68-5.82,0-11.29,1.8-15.81,5.21-3.31,2.49-3.96,7.2-1.47,10.5,2.5,3.3,7.19,3.97,10.51,1.46,1.92-1.45,4.2-2.18,6.77-2.18,5.47,0,8.7,4.11,8.93,4.4,1.46,2.03,3.75,3.1,6.08,3.1,1.49,0,3-.45,4.31-1.37v.02Zm-19.32-92.38c0,6.21,5.04,11.25,11.25,11.25s11.25-5.04,11.25-11.25-5.04-11.25-11.25-11.25-11.25,5.04-11.25,11.25Zm-15,37.5c0,6.21,5.04,11.25,11.25,11.25s11.25-5.04,11.25-11.25-5.04-11.25-11.25-11.25-11.25,5.04-11.25,11.25ZM59.99,18.74c0,6.21,5.04,11.25,11.25,11.25s11.25-5.04,11.25-11.25-5.04-11.25-11.25-11.25-11.25,5.04-11.25,11.25Zm90.01,120c0,6.21,5.04,11.25,11.25,11.25s11.25-5.04,11.25-11.25-5.04-11.25-11.25-11.25-11.25,5.04-11.25,11.25ZM7.48,26.24c0,6.21,5.04,11.25,11.25,11.25s11.25-5.04,11.25-11.25-5.04-11.25-11.25-11.25-11.25,5.04-11.25,11.25Zm105.01,142.51c0,6.21,5.04,11.25,11.25,11.25s11.25-5.04,11.25-11.25-5.04-11.25-11.25-11.25-11.25,5.04-11.25,11.25Z" 
                fill="#72b7a4"
              />
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
              <svg width="20" height="20" viewBox="0 0 97.48 97.48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m0,77.17c.01,11.21,9.1,20.29,20.31,20.31h56.86c11.21-.01,20.29-9.1,20.31-20.31v-36.55H0v36.55Zm69.05-18.28c3.36,0,6.09,2.73,6.09,6.09s-2.73,6.09-6.09,6.09-6.09-2.73-6.09-6.09,2.73-6.09,6.09-6.09Zm-20.31,0c3.36,0,6.09,2.73,6.09,6.09s-2.73,6.09-6.09,6.09-6.09-2.73-6.09-6.09,2.73-6.09,6.09-6.09Zm-20.31,0c3.36,0,6.09,2.73,6.09,6.09s-2.73,6.09-6.09,6.09-6.09-2.73-6.09-6.09,2.73-6.09,6.09-6.09Z" fill="currentColor"/>
                <path d="m77.17,8.12h-4.06v-4.06c0-2.24-1.82-4.06-4.06-4.06s-4.06,1.82-4.06,4.06v4.06h-32.49v-4.06c0-2.24-1.82-4.06-4.06-4.06s-4.06,1.82-4.06,4.06v4.06h-4.06C9.1,8.14.01,17.22,0,28.43v4.06h97.48v-4.06c-.01-11.21-9.1-20.29-20.31-20.31Z" fill="currentColor"/>
              </svg>
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