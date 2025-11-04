import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LectorQR from '../components/Modales/LectorQR';

export default function LectorQRPage() {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);

  useEffect(() => {
    // TODO: En producción, hacer llamada a la API para obtener los datos del evento
    // Por ahora, crear objeto simulado
    const fetchEvento = async () => {
      try {
        // Simulación - reemplazar con llamada real a la API
        // const response = await eventService.getEventoById(eventoId);
        // setEvento(response.data);
        
        setEvento({
          id: eventoId,
          nombre_evento: `Evento ${eventoId}`,
          fecha: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error al cargar evento:', error);
        // Si hay error, podríamos redirigir o mostrar mensaje
      }
    };

    if (eventoId) {
      fetchEvento();
    }
  }, [eventoId]);

  const handleClose = () => {
    // Redirigir a la página principal o cerrar ventana
    if (window.history.length > 1) {
      navigate(-1); // Volver atrás
    } else {
      navigate('/'); // Ir a home
    }
  };

  if (!evento) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando evento...</p>
        </div>
      </div>
    );
  }

  return (
    <LectorQR 
      onClose={handleClose}
      evento={evento}
    />
  );
}
