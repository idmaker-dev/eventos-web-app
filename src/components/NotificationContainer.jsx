import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotifications, NotificationTypes } from '../contexts/NotificationContext';
import './NotificationContainer.css';

/**
 * Componente individual de notificación
 */
const NotificationItem = ({ notification, onRemove }) => {
  const getIcon = () => {
    switch (notification.type) {
      case NotificationTypes.SUCCESS:
        return <CheckCircle className="notification-icon success" />;
      case NotificationTypes.ERROR:
        return <AlertCircle className="notification-icon error" />;
      case NotificationTypes.WARNING:
        return <AlertTriangle className="notification-icon warning" />;
      case NotificationTypes.INFO:
      default:
        return <Info className="notification-icon info" />;
    }
  };

  const getTypeClass = () => {
    return `notification-item notification-${notification.type}`;
  };

  const handleClose = () => {
    onRemove(notification.id);
  };

  const handleActionClick = () => {
    if (notification.action && notification.action.onClick) {
      notification.action.onClick();
    }
  };

  return (
    <div className={getTypeClass()}>
      <div className="notification-content">
        <div className="notification-icon-container">
          {getIcon()}
        </div>
        
        <div className="notification-message">
          <p>{notification.message}</p>
          
          {notification.action && (
            <button 
              className="notification-action"
              onClick={handleActionClick}
            >
              {notification.action.label}
            </button>
          )}
        </div>
        
        <button 
          className="notification-close"
          onClick={handleClose}
          aria-label="Cerrar notificación"
        >
          <X size={16} />
        </button>
      </div>
      
      {!notification.persistent && notification.duration > 0 && (
        <div 
          className="notification-progress"
          style={{
            animationDuration: `${notification.duration}ms`
          }}
        />
      )}
    </div>
  );
};

/**
 * Contenedor principal de notificaciones
 */
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;