import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/pages/ConfirmacionRegistro.css';

function ConfirmacionRegistro() {
  const location = useLocation();
  const navigate = useNavigate();
  const { nombre, eventoId, cuestionarioId } = location.state || {};

  const handleRealizarPago = () => {
    // Aquí puedes redirigir a la página de pagos o al proceso de pago
    navigate('/admin/pagos');
  };

  return (
    <div className="confirmacion-container">
      <div className="confirmacion-content">
        <div className="confirmacion-icon">
          <img
            src={process.env.PUBLIC_URL + '/Icono de cuestionario.svg'}
            alt="Icono de confirmación"
            style={{height: '64px', width: '64px'}}
          />
        </div>

        <div className="confirmacion-titulo">
          ¡Registro completado
        </div>

        <div className="confirmacion-nombre">
          {nombre || 'Usuario'}!
        </div>

        <div className="confirmacion-mensaje">
          ¡Ya casi eres parte de la Ceremonia de Graduación!
        </div>

        <div className="confirmacion-submensaje">
          Estás a un paso de asegurar tu asistencia.
          <br />
          Ahora puedes realizar el pago de tus
          <br />
          asientos para confirmar tu lugar.
        </div>

        <div className="confirmacion-boton-container">
          <button
            className="confirmacion-boton"
            onClick={handleRealizarPago}
          >
            Realizar pago · Abonar ahora
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmacionRegistro;
