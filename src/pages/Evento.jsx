import React, { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import "../styles/pages/Evento.css";

// Importa las funciones de tu cliente API
import { getAllEventos } from "../api/eventoService";

const Evento = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 3)); // Abril 2025
  const [eventos, setEventos] = useState([]); // Eventos desde backend
  const [loading, setLoading] = useState(true);

  // Cargar eventos desde el backend al montar el componente
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        const res = await getAllEventos();
        // tu backend devuelve { success, data: [...] }
        if (res.success) {
          setEventos(res.data);
        } else {
          console.error("Error al cargar eventos:", res);
        }
      } catch (err) {
        console.error("Error de red:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  const diasSemana = [
    "Lun.",
    "Mar.",
    "Mié.",
    "Juev.",
    "Vier.",
    "Sáb.",
    "Dom.",
  ];
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const diasDelMes = () => {
    const año = currentMonth.getFullYear();
    const mes = currentMonth.getMonth();
    const primerDia = new Date(año, mes, 1).getDay();
    const ultimoDia = new Date(año, mes + 1, 0).getDate();
    const días = [];

    const primerDiaSemana = primerDia === 0 ? 6 : primerDia - 1;
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const diaAnterior = new Date(año, mes, -i);
      días.push({ numero: diaAnterior.getDate(), otroMes: true });
    }

    for (let dia = 1; dia <= ultimoDia; dia++) {
      días.push({ numero: dia, otroMes: false });
    }

    const diasRestantes = 42 - días.length;
    for (let dia = 1; dia <= diasRestantes; dia++) {
      días.push({ numero: dia, otroMes: true });
    }

    return días;
  };

  const obtenerEstadoColor = (estado) => {
    switch (estado) {
      case "Finalizado":
        return "estado-finalizado";
      case "En desarrollo":
        return "estado-desarrollo";
      case "Por empezar":
        return "estado-empezar";
      default:
        return "estado-default";
    }
  };

  const navMesAnterior = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const navMesSiguiente = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
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
                    <div className="stat-item">
                      <div className="stat-number teal">
                        {
                          eventos.filter((e) => e.estado === "Por empezar")
                            .length
                        }
                      </div>
                      <p className="stat-description">
                        Eventos para iniciar este mes
                      </p>
                    </div>

                    <div className="stat-item">
                      <div className="stat-number yellow">
                        {
                          eventos.filter((e) => e.estado === "En desarrollo")
                            .length
                        }
                      </div>
                      <p className="stat-description">
                        Eventos en etapa de seguimiento
                      </p>
                    </div>

                    <div className="stat-item">
                      <div className="stat-number teal-dark">
                        {eventos.filter((e) => e.estado === "Finalizado").length}
                      </div>
                      <p className="stat-description">
                        Eventos concluidos satisfactoriamente
                      </p>
                    </div>

                    <div className="stat-item">
                      <div className="circular-progress">
                        <svg className="progress-ring" viewBox="0 0 80 80">
                          <circle
                            className="progress-ring-bg"
                            cx="40"
                            cy="40"
                            r="30"
                          />
                          <circle
                            className="progress-ring-fill"
                            cx="40"
                            cy="40"
                            r="30"
                          />
                        </svg>
                        <div className="progress-text">
                          <span className="progress-percentage">
                            {eventos.length > 0
                              ? `${Math.round(
                                  (eventos.filter(
                                    (e) => e.estado === "Finalizado"
                                  ).length /
                                    eventos.length) *
                                    100
                                )}%`
                              : "0%"}
                          </span>
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
                  {loading ? (
                    <p>Cargando eventos...</p>
                  ) : (
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
                              <span
                                className={`status-badge ${obtenerEstadoColor(
                                  evento.estado
                                )}`}
                              >
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
                                  style={{ width: `${evento.progreso || 0}%` }}
                                ></div>
                              </div>
                            </td>
                            <td className="event-id">{evento.id}</td>
                            <td>
                              <button className="ver-mas-btn">Ver más</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Calendar */}
            <div className="right-column">
              <div className="calendar-card">
                <div className="calendar-header">
                  <h3 className="calendar-title">
                    {meses[currentMonth.getMonth()]}{" "}
                    {currentMonth.getFullYear()}
                  </h3>
                  <div className="calendar-nav">
                    <button onClick={navMesAnterior} className="nav-btn">
                      <ChevronLeft className="nav-icon" />
                    </button>
                    <button onClick={navMesSiguiente} className="nav-btn">
                      <ChevronRight className="nav-icon" />
                    </button>
                  </div>
                </div>

                <div className="calendar-weekdays">
                  {diasSemana.map((dia) => (
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
                          ? "other-month"
                          : dia.numero === 7 || dia.numero === 16 || dia.numero === 24
                          ? "highlight-yellow"
                          : dia.numero === 5
                          ? "highlight-green"
                          : dia.numero === 20
                          ? "highlight-dark"
                          : "current-month"
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
