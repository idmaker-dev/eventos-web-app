import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import "../styles/pages/Evento.css";

const Evento = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 3)); // Abril 2025
  
  // Función para generar ID aleatorio
  const generarIdAleatorio = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let resultado = '';
    for (let i = 0; i < 8; i++) {
      resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return resultado;
  };

  const eventos = [
    {
      id: generarIdAleatorio(),
      nombre: 'Boda de Jessica y Armando',
      estado: 'Finalizado',
      telefono: '921102435',
      email: 'dg.juansol@gmail.com',
      progreso: 100
    },
    {
      id: generarIdAleatorio(),
      nombre: 'XV de Gaby Zambrano',
      estado: 'En desarrollo',
      telefono: '897458932',
      email: 'duendenorock@gmail.com',
      progreso: 65
    },
    {
      id: generarIdAleatorio(),
      nombre: 'Cumpleaños de Jesús Martín',
      estado: 'Por empezar',
      telefono: '885465234',
      email: 'panmoso@gmail.com',
      progreso: 15
    },
    {
      id: generarIdAleatorio(),
      nombre: 'Baby Shower de Gissell Adelay',
      estado: 'Finalizado',
      telefono: '921102435',
      email: 'uvero896@gmail.com',
      progreso: 100
    }
  ];

  const diasSemana = ['Lun.', 'Mar.', 'Mié.', 'Juev.', 'Vier.', 'Sáb.', 'Dom.'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  const diasDelMes = () => {
    const año = currentMonth.getFullYear();
    const mes = currentMonth.getMonth();
    const primerDia = new Date(año, mes, 1).getDay();
    const ultimoDia = new Date(año, mes + 1, 0).getDate();
    const días = [];
    
    // Días del mes anterior
    const primerDiaSemana = primerDia === 0 ? 6 : primerDia - 1;
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const diaAnterior = new Date(año, mes, -i);
      días.push({ numero: diaAnterior.getDate(), otroMes: true });
    }
    
    // Días del mes actual
    for (let dia = 1; dia <= ultimoDia; dia++) {
      días.push({ numero: dia, otroMes: false });
    }
    
    // Días del mes siguiente para completar la semana
    const diasRestantes = 42 - días.length;
    for (let dia = 1; dia <= diasRestantes; dia++) {
      días.push({ numero: dia, otroMes: true });
    }
    
    return días;
  };

  const obtenerEstadoColor = (estado) => {
    switch (estado) {
      case 'Finalizado':
        return 'estado-finalizado';
      case 'En desarrollo':
        return 'estado-desarrollo';
      case 'Por empezar':
        return 'estado-empezar';
      default:
        return 'estado-default';
    }
  };

  const navMesAnterior = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const navMesSiguiente = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="dashboard-container">
      <div className="main-layout">
        {/* Main Content */}
        <div className="main-content">
          <div className="content-grid">
            
            {/* Left Column - Stats and Events */}
            <div className="left-column">
              
              {/* Resumen general */}
              <div className="stats-card">
                <h3 className="stats-subtitle">Resumen general de los eventos</h3>
                
                {/* Progress Section */}
                <div className="progress-section">
                  <h4 className="progress-title">Progreso de los eventos</h4>
                  <div className="stats-grid">
                    
                    {/* Por empezar */}
                    <div className="stat-item">
                      <div className="stat-number teal">5</div>
                      <p className="stat-description">Eventos para iniciar este mes</p>
                    </div>
                    
                    {/* En desarrollo */}
                    <div className="stat-item">
                      <div className="stat-number yellow">3</div>
                      <p className="stat-description">Eventos en etapa de seguimiento</p>
                    </div>
                    
                    {/* Finalizados */}
                    <div className="stat-item">
                      <div className="stat-number teal-dark">35</div>
                      <p className="stat-description">Eventos concluidos satisfactoriamente</p>
                    </div>
                    
                    {/* Estadística circular */}
                    <div className="stat-item">
                      <div className="circular-progress">
                        <svg className="progress-ring" viewBox="0 0 80 80">
                          <circle className="progress-ring-bg" cx="40" cy="40" r="30" />
                          <circle className="progress-ring-fill" cx="40" cy="40" r="30" />
                        </svg>
                        <div className="progress-text">
                          <span className="progress-percentage">85%</span>
                        </div>
                      </div>
                      <p className="progress-label">realizados</p>
                      <p className="progress-sublabel">de 100 %</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabla de eventos */}
              <div className="events-table-card">
                <div className="table-header">
                  <div className="table-header-content">
                    <h3 className="table-title">Tabla de eventos</h3>
                    <div className="table-search">
                      <Search className="table-search-icon" />
                      <input 
                        type="text" 
                        placeholder="Buscar" 
                        className="table-search-input"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="table-container">
                  <table className="events-table">
                    <thead>
                      <tr>
                        <th>Nombre de evento</th>
                        <th>Estatus</th>
                        <th>Datos de contacto</th>
                        <th>Progreso</th>
                        <th>ID</th>
                        <th>Resumen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventos.map((evento, index) => (
                        <tr key={index}>
                          <td>
                            <div className="event-name">{evento.nombre}</div>
                          </td>
                          <td>
                            <span className={`status-badge ${obtenerEstadoColor(evento.estado)}`}>
                              {evento.estado}
                            </span>
                          </td>
                          <td className="contact-info">
                            <div>{evento.telefono}</div>
                            <div className="email">{evento.email}</div>
                          </td>
                          <td>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{width: `${evento.progreso}%`}}
                              ></div>
                            </div>
                          </td>
                          <td className="event-id">
                            {evento.id}
                          </td>
                          <td>
                            <button className="ver-mas-btn">
                              Ver más
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column - Calendar */}
            <div className="right-column">
              <div className="calendar-card">
                <div className="calendar-header">
                  <h3 className="calendar-title">
                    {meses[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <div className="calendar-nav">
                    <button 
                      onClick={navMesAnterior}
                      className="nav-btn"
                    >
                      <ChevronLeft className="nav-icon" />
                    </button>
                    <button 
                      onClick={navMesSiguiente}
                      className="nav-btn"
                    >
                      <ChevronRight className="nav-icon" />
                    </button>
                  </div>
                </div>
                
                <div className="calendar-weekdays">
                  {diasSemana.map(dia => (
                    <div key={dia} className="weekday">
                      {dia}
                    </div>
                  ))}
                </div>
                
                <div className="calendar-grid">
                  {diasDelMes().map((dia, index) => (
                    <div 
                      key={index} 
                      className={`calendar-day ${
                        dia.otroMes 
                          ? 'other-month' 
                          : dia.numero === 7 || dia.numero === 16 || dia.numero === 24 
                          ? 'highlight-yellow' 
                          : dia.numero === 5 
                          ? 'highlight-green'
                          : dia.numero === 20
                          ? 'highlight-dark'
                          : 'current-month'
                      }`}
                    >
                      {dia.numero}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Evento;