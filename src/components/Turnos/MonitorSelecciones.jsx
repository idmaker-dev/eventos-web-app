import React, { useState, useEffect } from 'react';
import { Users, Calendar, MapPin, TrendingUp, RefreshCw, UserPlus } from 'lucide-react';
import turnosService from '../../services/turnosService';
import { useNotifications } from '../../contexts/NotificationContext';
import ListaTurnos from './ListaTurnos';
import '../../styles/components/MonitorSelecciones.css';

/**
 * Monitor de selecciones - Dashboard para admin
 * Muestra estadísticas, estado de ocupación y lista de turnos
 */
const MonitorSelecciones = ({ eventoId, onSeleccionManual }) => {
  const { showNotification } = useNotifications();
  
  const [configuracion, setConfiguracion] = useState(null);
  const [estadoOcupacion, setEstadoOcupacion] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Cargar todos los datos
   */
  const cargarDatos = React.useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    
    try {
      // Cargar en paralelo
      const [configRes, ocupacionRes, turnosRes] = await Promise.all([
        turnosService.obtenerConfiguracion(eventoId),
        turnosService.obtenerEstadoOcupacion(eventoId),
        turnosService.obtenerTodosLosTurnos(eventoId)
      ]);

      if (configRes.success) setConfiguracion(configRes.data);
      if (ocupacionRes.success) setEstadoOcupacion(ocupacionRes.data);
      if (turnosRes.success) setTurnos(turnosRes.data || []);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotification('error', 'Error al cargar datos del monitor');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [eventoId, refreshing, showNotification]);

  useEffect(() => {
    if (eventoId) {
      cargarDatos();
      
      // Auto-refresh cada 30 segundos
      const interval = setInterval(cargarDatos, 30000);
      return () => clearInterval(interval);
    }
  }, [eventoId, cargarDatos]);

  const handleRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  if (isLoading) {
    return (
      <div className="monitor-loading">
        <RefreshCw className="icon-spin" size={40} />
        <p>Cargando monitor...</p>
      </div>
    );
  }

  if (!configuracion) {
    return (
      <div className="monitor-error">
        <p>No se encontró configuración de turnos para este evento</p>
      </div>
    );
  }

  // Calcular estadísticas
  const totalTurnos = turnos.length;
  const turnosCompletados = turnos.filter(t => t.estado === 'COMPLETADO').length;
  const turnosActivos = turnos.filter(t => {
    const ahora = new Date();
    const inicio = new Date(t.fecha_hora_inicio);
    const fin = new Date(t.fecha_hora_fin);
    return ahora >= inicio && ahora <= fin && t.estado === 'ASIGNADO';
  }).length;
  const turnosNoCompletados = turnos.filter(t => t.estado === 'NO_PRESENTADO').length;
  const porcentajeCompletado = totalTurnos > 0 ? Math.round((turnosCompletados / totalTurnos) * 100) : 0;

  // Calcular ocupación de mesas
  const totalMesas = estadoOcupacion?.total_mesas || 0;
  const mesasOcupadas = estadoOcupacion?.mesas_ocupadas || 0;
  const mesasParciales = estadoOcupacion?.mesas_parcialmente_ocupadas || 0;
  const mesasDisponibles = totalMesas - mesasOcupadas - mesasParciales;
  const porcentajeOcupacion = totalMesas > 0 ? Math.round((mesasOcupadas / totalMesas) * 100) : 0;

  return (
    <div className="monitor-container">
      {/* Header */}
      <div className="monitor-header">
        <div className="monitor-title-section">
          <h2 className="monitor-title">Monitor de Selecciones</h2>
          <p className="monitor-subtitle">
            Período: {new Date(configuracion.fecha_inicio).toLocaleDateString()} - {new Date(configuracion.fecha_fin).toLocaleDateString()}
          </p>
        </div>
        
        <div className="monitor-actions">
          <button 
            onClick={handleRefresh} 
            className="btn-refresh"
            disabled={refreshing}
          >
            <RefreshCw className={refreshing ? 'icon-spin' : ''} size={18} />
            Actualizar
          </button>
          <button 
            onClick={onSeleccionManual} 
            className="btn-primary"
          >
            <UserPlus size={18} />
            Hacer Selección Manual
          </button>
        </div>
      </div>

      {/* Cards de estadísticas */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">
            <Users size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total de Turnos</p>
            <p className="stat-value">{totalTurnos}</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">
            <Calendar size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Completados</p>
            <p className="stat-value">{turnosCompletados}</p>
            <p className="stat-detail">{porcentajeCompletado}% del total</p>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">
            <TrendingUp size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">En Proceso</p>
            <p className="stat-value">{turnosActivos}</p>
            <p className="stat-detail">Turnos activos ahora</p>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">
            <MapPin size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">No Completados</p>
            <p className="stat-value">{turnosNoCompletados}</p>
            <p className="stat-detail">Requieren reprogramación</p>
          </div>
        </div>
      </div>

      {/* Estado de ocupación */}
      <div className="ocupacion-section">
        <h3 className="section-title">
          <MapPin className="icon-inline" />
          Estado de Ocupación de Mesas
        </h3>
        
        <div className="ocupacion-grid">
          <div className="ocupacion-card">
            <div className="ocupacion-bar">
              <div 
                className="ocupacion-fill ocupacion-fill-completa"
                style={{ width: `${(mesasOcupadas / totalMesas) * 100}%` }}
              />
              <div 
                className="ocupacion-fill ocupacion-fill-parcial"
                style={{ 
                  width: `${(mesasParciales / totalMesas) * 100}%`,
                  left: `${(mesasOcupadas / totalMesas) * 100}%`
                }}
              />
            </div>
            
            <div className="ocupacion-legend">
              <div className="ocupacion-item">
                <span className="ocupacion-dot ocupacion-dot-completa"></span>
                <span>Completas: {mesasOcupadas}</span>
              </div>
              <div className="ocupacion-item">
                <span className="ocupacion-dot ocupacion-dot-parcial"></span>
                <span>Parciales: {mesasParciales}</span>
              </div>
              <div className="ocupacion-item">
                <span className="ocupacion-dot ocupacion-dot-disponible"></span>
                <span>Disponibles: {mesasDisponibles}</span>
              </div>
            </div>

            <div className="ocupacion-percentage">
              <span className="ocupacion-percentage-value">{porcentajeOcupacion}%</span>
              <span className="ocupacion-percentage-label">Ocupación total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de turnos */}
      <div className="turnos-section">
        <h3 className="section-title">
          <Calendar className="icon-inline" />
          Gestión de Turnos
        </h3>
        
        <ListaTurnos 
          eventoId={eventoId} 
          turnos={turnos} 
          onUpdate={cargarDatos}
        />
      </div>
    </div>
  );
};

export default MonitorSelecciones;
