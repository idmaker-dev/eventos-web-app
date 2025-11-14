import React, { useState } from 'react';
import { Clock, User, Calendar, MoreVertical, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import turnosService from '../../services/turnosService';
import { useNotifications } from '../../contexts/NotificationContext';

/**
 * Tabla de turnos con filtros y acciones
 */
const ListaTurnos = ({ eventoId, turnos = [], onUpdate }) => {
  const { showNotification } = useNotifications();
  
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [mostrandoReprogramar, setMostrandoReprogramar] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [reprogramando, setReprogramando] = useState(false);

  // Filtrar turnos
  const turnosFiltrados = filtroEstado === 'TODOS' 
    ? turnos 
    : turnos.filter(t => t.estado === filtroEstado);

  // Ordenar por fecha
  const turnosOrdenados = [...turnosFiltrados].sort((a, b) => 
    new Date(a.fecha_hora_inicio) - new Date(b.fecha_hora_inicio)
  );

  /**
   * Abrir modal de reprogramación
   */
  const abrirReprogramar = (turno) => {
    setMostrandoReprogramar(turno.id);
    
    // Pre-llenar con la fecha actual del turno
    const fecha = new Date(turno.fecha_hora_inicio);
    setNuevaFecha(fecha.toISOString().split('T')[0]);
    setNuevaHora(fecha.toTimeString().slice(0, 5));
  };

  /**
   * Cancelar reprogramación
   */
  const cancelarReprogramar = () => {
    setMostrandoReprogramar(null);
    setNuevaFecha('');
    setNuevaHora('');
  };

  /**
   * Confirmar reprogramación
   */
  const confirmarReprogramar = async (turno) => {
    if (!nuevaFecha || !nuevaHora) {
      showNotification('error', 'Debes seleccionar fecha y hora');
      return;
    }

    setReprogramando(true);

    try {
      // Construir fecha_hora_inicio
      const fechaHoraInicio = `${nuevaFecha}T${nuevaHora}:00`;
      
      // Calcular fecha_hora_fin (duración del turno original)
      const duracionMinutos = turno.duracion_turno_minutos || 15;
      const fechaInicio = new Date(fechaHoraInicio);
      const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000);

      const response = await turnosService.reprogramarTurno(eventoId, turno.invitado_id, {
        fecha_hora_inicio: fechaHoraInicio,
        fecha_hora_fin: fechaFin.toISOString()
      });

      if (response.success) {
        showNotification('success', 'Turno reprogramado exitosamente');
        cancelarReprogramar();
        onUpdate(); // Recargar lista
      } else {
        showNotification('error', response.message || 'Error al reprogramar turno');
      }
    } catch (error) {
      console.error('Error al reprogramar turno:', error);
      showNotification('error', 'Error al reprogramar el turno');
    } finally {
      setReprogramando(false);
    }
  };

  /**
   * Obtener color del badge según estado
   */
  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'COMPLETADO':
        return 'badge-success';
      case 'ASIGNADO':
        return 'badge-info';
      case 'NO_PRESENTADO':
        return 'badge-warning';
      case 'REPROGRAMADO':
        return 'badge-secondary';
      default:
        return 'badge-default';
    }
  };

  /**
   * Obtener icono según estado
   */
  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'COMPLETADO':
        return <CheckCircle size={16} />;
      case 'NO_PRESENTADO':
        return <XCircle size={16} />;
      case 'REPROGRAMADO':
        return <RefreshCw size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  /**
   * Verificar si el turno está activo ahora
   */
  const esTurnoActivo = (turno) => {
    const ahora = new Date();
    const inicio = new Date(turno.fecha_hora_inicio);
    const fin = new Date(turno.fecha_hora_fin);
    return ahora >= inicio && ahora <= fin && turno.estado === 'ASIGNADO';
  };

  return (
    <div className="lista-turnos">
      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtros-tabs">
          {['TODOS', 'ASIGNADO', 'COMPLETADO', 'NO_PRESENTADO', 'REPROGRAMADO'].map(estado => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`filtro-tab ${filtroEstado === estado ? 'active' : ''}`}
            >
              {estado === 'TODOS' ? 'Todos' : estado.replace('_', ' ')}
              <span className="filtro-count">
                {estado === 'TODOS' ? turnos.length : turnos.filter(t => t.estado === estado).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="tabla-container">
        {turnosOrdenados.length === 0 ? (
          <div className="tabla-empty">
            <p>No hay turnos {filtroEstado !== 'TODOS' && `con estado "${filtroEstado}"`}</p>
          </div>
        ) : (
          <table className="tabla-turnos">
            <thead>
              <tr>
                <th>#</th>
                <th>
                  <User size={16} className="icon-inline" />
                  Invitado
                </th>
                <th>
                  <Calendar size={16} className="icon-inline" />
                  Fecha Liquidación
                </th>
                <th>
                  <Clock size={16} className="icon-inline" />
                  Horario del Turno
                </th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {turnosOrdenados.map((turno, index) => {
                const esActivo = esTurnoActivo(turno);
                const estaReprogramando = mostrandoReprogramar === turno.id;

                return (
                  <React.Fragment key={turno.id}>
                    <tr className={esActivo ? 'row-active' : ''}>
                      <td className="cell-numero">{index + 1}</td>
                      <td>
                        <div className="invitado-info">
                          <p className="invitado-nombre">{turno.invitado_nombre || 'N/A'}</p>
                          <p className="invitado-id">ID: {turno.invitado_id}</p>
                        </div>
                      </td>
                      <td>
                        {turno.fecha_liquidacion 
                          ? new Date(turno.fecha_liquidacion).toLocaleDateString() 
                          : 'N/A'}
                      </td>
                      <td>
                        <div className="horario-info">
                          <p className="horario-fecha">
                            {new Date(turno.fecha_hora_inicio).toLocaleDateString()}
                          </p>
                          <p className="horario-rango">
                            {new Date(turno.fecha_hora_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(turno.fecha_hora_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {esActivo && <span className="badge-live">ACTIVO</span>}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getBadgeClass(turno.estado)}`}>
                          {getEstadoIcon(turno.estado)}
                          {turno.estado}
                        </span>
                      </td>
                      <td>
                        {(turno.estado === 'NO_PRESENTADO' || turno.estado === 'ASIGNADO') && (
                          <button
                            onClick={() => abrirReprogramar(turno)}
                            className="btn-action"
                            title="Reprogramar turno"
                          >
                            <MoreVertical size={18} />
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Fila de reprogramación */}
                    {estaReprogramando && (
                      <tr className="row-reprogramar">
                        <td colSpan="6">
                          <div className="reprogramar-form">
                            <h4 className="reprogramar-title">
                              <RefreshCw size={18} />
                              Reprogramar Turno
                            </h4>
                            
                            <div className="reprogramar-inputs">
                              <div className="form-group">
                                <label>Nueva Fecha</label>
                                <input
                                  type="date"
                                  value={nuevaFecha}
                                  onChange={(e) => setNuevaFecha(e.target.value)}
                                  className="form-input"
                                />
                              </div>
                              
                              <div className="form-group">
                                <label>Nueva Hora</label>
                                <input
                                  type="time"
                                  value={nuevaHora}
                                  onChange={(e) => setNuevaHora(e.target.value)}
                                  className="form-input"
                                />
                              </div>
                            </div>

                            <div className="reprogramar-actions">
                              <button
                                onClick={cancelarReprogramar}
                                className="btn btn-secondary"
                                disabled={reprogramando}
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => confirmarReprogramar(turno)}
                                className="btn btn-primary"
                                disabled={reprogramando}
                              >
                                {reprogramando ? 'Reprogramando...' : 'Confirmar'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ListaTurnos;
