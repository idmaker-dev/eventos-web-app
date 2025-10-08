import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useEventos } from '../hooks/useEventos';
import { useAuth } from '../hooks/useAuth';

const SelectedEventContext = createContext(null);

export const SelectedEventProvider = ({ children }) => {
  const eventosHook = useEventos();
  const { user } = useAuth();
  const { cargarEvento } = eventosHook;

  const isAdmin = user?.rol === 'admin';

  const selectEvent = useCallback((id) => {
    if (!isAdmin) return; // sólo admins pueden seleccionar/cargar eventos globales
    if (!id) return;
    cargarEvento(id);
    try { localStorage.setItem('selectedEventId', id); } catch (e) {}
  }, [cargarEvento, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return; // no intentar restaurar selección si no es admin
    const stored = (() => {
      try { return localStorage.getItem('selectedEventId'); } catch (e) { return null; }
    })();
    if (stored) selectEvent(stored);
  }, [selectEvent, isAdmin]);

  return (
    <SelectedEventContext.Provider value={{ ...eventosHook, selectEvent, isAdmin }}>
      {children}
    </SelectedEventContext.Provider>
  );
};

export const useSelectedEvent = () => {
  const ctx = useContext(SelectedEventContext);
  if (!ctx) {
    throw new Error('useSelectedEvent must be used within SelectedEventProvider');
  }
  return ctx;
};

export default SelectedEventContext;
