import React, { useState } from "react";
import "../styles/pages/Comunicacion.css";
import { Search, User, Calendar, Clock, Users } from "lucide-react";

export default function Comunicacion() {
  const [activeTab, setActiveTab] = useState('configurar');
  const [formData, setFormData] = useState({
    nombreEvento: "Graduación de Lic. Derecho 2020 - 2024",
    descripcionEvento: "",
    logoEvento: "",
    fechaHoraEvento: "25 de junio de 2025 - 18:00 hrs",
    nombreCompleto: "Tu nombre",
    carreraEstudios: "Tu carrera"
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderConfiguracionForm = () => (
    <div className="comunicacion-form-container">
      <h3 className="form-section-title">Crear invitación de cuestionario</h3>
      
      {/* Datos del evento */}
      <div className="form-section">
        <h4 className="form-subsection-title">Datos del evento</h4>
        
        <div className="form-field">
          <label className="form-label">Nombre del evento</label>
          <input
            type="text"
            value={formData.nombreEvento}
            onChange={(e) => handleInputChange('nombreEvento', e.target.value)}
            className="form-input"
            placeholder="Ejemplo: Graduación de Lic. Derecho - Generación 2024"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Descripción del evento</label>
          <textarea
            value={formData.descripcionEvento}
            onChange={(e) => handleInputChange('descripcionEvento', e.target.value)}
            className="form-textarea"
            rows="4"
            placeholder="Ejemplo: ¡Finalmente llegó el momento! Por favor complete este formulario con sus datos. Esta información nos ayudará a hacer de su ceremonia de graduación una experiencia inolvidable. Recuerde que todos los campos con * son obligatorios para su registro."
          />
        </div>

        <div className="form-field">
          <label className="form-label">Logo del evento</label>
          <div className="form-file-upload">
            <input
              type="file"
              accept="image/*"
              className="form-file-input"
              onChange={(e) => handleInputChange('logoEvento', e.target.files[0])}
            />
            <span className="form-file-text">
              {formData.logoEvento ? formData.logoEvento.name : "Seleccionar archivo"}
            </span>
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Fecha y hora del evento</label>
          <input
            type="text"
            value={formData.fechaHoraEvento}
            onChange={(e) => handleInputChange('fechaHoraEvento', e.target.value)}
            className="form-input"
            placeholder="Ejemplo: 25 de junio de 2025 - 18:00 hrs"
          />
        </div>
      </div>

      {/* Datos del graduado */}
      <div className="form-section">
        <h4 className="form-subsection-title">Datos del graduado</h4>
        
        <div className="form-field">
          <label className="form-label">Nombre completo</label>
          <select className="form-select">
            <option value="required">Tu nombre</option>
            <option value="optional">Campo opcional</option>
            <option value="hidden">No mostrar</option>
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Carrera o estudios realizados</label>
          <select className="form-select">
            <option value="required">Tu carrera</option>
            <option value="optional">Campo opcional</option>
            <option value="hidden">No mostrar</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn-secondary">Cancelar</button>
        <button className="btn-primary">Guardar</button>
      </div>
    </div>
  );

  const renderMonitorChats = () => (
    <div className="chat-monitor-container">
      <div className="chat-search-bar">
        <div className="search-input-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar graduado"
            className="chat-search-input"
          />
        </div>
      </div>

      <div className="chat-conversations-list">
        {/* Lista de conversaciones */}
        <div className="conversation-item active">
          <div className="conversation-avatar">
            <User size={24} />
          </div>
          <div className="conversation-details">
            <h4 className="conversation-name">María José García</h4>
            <p className="conversation-last-message">¿A qué hora empieza la ceremonia?</p>
            <span className="conversation-time">Hace 5 min</span>
          </div>
          <div className="conversation-status unread">3</div>
        </div>

        <div className="conversation-item">
          <div className="conversation-avatar">
            <User size={24} />
          </div>
          <div className="conversation-details">
            <h4 className="conversation-name">Carlos Mendoza</h4>
            <p className="conversation-last-message">Necesito cambiar mi asiento</p>
            <span className="conversation-time">Hace 15 min</span>
          </div>
        </div>

        <div className="conversation-item">
          <div className="conversation-avatar">
            <User size={24} />
          </div>
          <div className="conversation-details">
            <h4 className="conversation-name">Ana Rodríguez</h4>
            <p className="conversation-last-message">¿Dónde puedo encontrar mi boleto?</p>
            <span className="conversation-time">Hace 1 hora</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEnlaceCuestionario = () => (
    <div className="cuestionario-container">
      <div className="cuestionario-info">
        <h3>Enlace del cuestionario generado</h3>
        <p>Comparte este enlace con los graduados para que llenen el cuestionario</p>
        
        <div className="link-container">
          <input
            type="text"
            value="https://eventos.villa-rica.edu.mx/cuestionario/abc123"
            readOnly
            className="link-input"
          />
          <button className="btn-copy">Copiar</button>
        </div>

        <div className="qr-section">
          <h4>Código QR</h4>
          <div className="qr-placeholder">
            <div className="qr-code">
              {/* Aquí iría el QR code */}
              <div className="qr-squares">
                {Array.from({ length: 100 }, (_, i) => (
                  <div key={i} className={`qr-square ${Math.random() > 0.6 ? 'filled' : ''}`}></div>
                ))}
              </div>
            </div>
          </div>
          <button className="btn-download">Descargar QR</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="comunicacion-container">
      {/* Header */}
      <div className="comunicacion-header">
        <div>
          <h1 className="comunicacion-title">Módulo de comunicación</h1>
          <p className="comunicacion-subtitle">
            Configuración de conversaciones y del Bot de Preguntas Frecuentes (FAQ)
          </p>
        </div>
        
        <div className="comunicacion-search">
          <div className="search-input-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Buscar graduado"
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="comunicacion-tabs">
        <button
          className={`tab-button ${activeTab === 'configurar' ? 'active' : ''}`}
          onClick={() => setActiveTab('configurar')}
        >
          Configurar respuestas
        </button>
        <button
          className={`tab-button ${activeTab === 'monitor' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitor')}
        >
          Monitor de Chats
          <span className="chat-badge">6</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'enlace' ? 'active' : ''}`}
          onClick={() => setActiveTab('enlace')}
        >
          Enlace cuestionario
        </button>
      </div>

      {/* Content */}
      <div className="comunicacion-content">
        <div className="comunicacion-main">
          <div className="comunicacion-left">
            {activeTab === 'configurar' && renderConfiguracionForm()}
            {activeTab === 'monitor' && renderMonitorChats()}
            {activeTab === 'enlace' && renderEnlaceCuestionario()}
          </div>

          {/* Preview móviles - solo visible en configurar */}
          {activeTab === 'configurar' && (
            <div className="comunicacion-right">
              <div className="mobile-preview-section">
                <h3 className="preview-title">Previsualización</h3>
                
                <div className="mobile-previews">
                  {/* Móvil 1 - Cuestionario */}
                  <div className="mobile-frame">
                    <div className="mobile-header">
                      <div className="mobile-notch"></div>
                    </div>
                    <div className="mobile-content">
                      <div className="mobile-form">
                        <div className="mobile-logo">
                          <div className="logo-placeholder"></div>
                        </div>
                        <h4 className="mobile-title">Cuestionario de Registro</h4>
                        <h5 className="mobile-subtitle">Instituto Villa Rica</h5>
                        <p className="mobile-event">Ceremonia de Graduación - Generación 2024</p>
                        
                        <div className="mobile-form-fields">
                          <div className="mobile-field">
                            <label>Número completo</label>
                            <div className="mobile-input">Tu nombre</div>
                          </div>
                          <div className="mobile-field">
                            <label>Carrera</label>
                            <div className="mobile-input">Tu carrera</div>
                          </div>
                          <div className="mobile-field">
                            <label>Documentación</label>
                            <div className="mobile-input">Tu respuesta</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Móvil 2 - Confirmación */}
                  <div className="mobile-frame">
                    <div className="mobile-header">
                      <div className="mobile-notch"></div>
                    </div>
                    <div className="mobile-content">
                      <div className="mobile-confirmation">
                        <h4 className="mobile-title">Tu registro</h4>
                        <p className="mobile-subtitle">Cantidad de boletos requeridos</p>
                        
                        <div className="mobile-info-cards">
                          <div className="info-card">
                            <Users size={16} />
                            <span>4 personas</span>
                          </div>
                          <div className="info-card">
                            <Calendar size={16} />
                            <span>25 junio</span>
                          </div>
                          <div className="info-card">
                            <Clock size={16} />
                            <span>6 personas</span>
                          </div>
                        </div>

                        <div className="mobile-attendees">
                          <p>Listado de graduados adicionales firmante responsable o elegirle de familia, AC)</p>
                        </div>

                        <div className="mobile-emergency">
                          <h5>Contacto de emergencia</h5>
                          <p>Tu respuesta</p>
                        </div>

                        <button className="mobile-button">Enviar</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}