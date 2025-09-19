import { useEffect, useState } from 'react';

// Hook para cargar un evento por ID con autenticación provisional
export function useEventoPorId(eventoId, token) {
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventoId || !token) return;
    setLoading(true);
    setError(null);
  fetch(`http://localhost:7071/api/eventos/${eventoId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar evento');
        return res.json();
      })
      .then(data => {
        console.log('Evento cargado:', data);
        setEvento(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [eventoId, token]);

  return { evento, loading, error };
}
