import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import '../styles/pages/AccessDenied.css';

const AccessDenied = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="access-denied-container">
      <div className="access-denied-content">
        <div className="access-denied-icon">
          <Shield size={80} />
        </div>
        
        <h1 className="access-denied-title">
          Acceso Denegado
        </h1>
        
        <p className="access-denied-message">
          No tienes permisos para acceder a esta página. 
          Ponte en contacto con el administrador si crees que esto es un error.
        </p>
        
        <div className="access-denied-actions">
          <button 
            onClick={goBack}
            className="btn-secondary"
          >
            <ArrowLeft size={20} />
            Volver Atrás
          </button>
          
          <button 
            onClick={goHome}
            className="btn-primary"
          >
            <Home size={20} />
            Ir al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;