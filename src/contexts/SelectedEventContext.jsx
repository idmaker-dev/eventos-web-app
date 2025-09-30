import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useEventos } from '../hooks/useEventos';

const SelectedEventContext = createContext(null);

export const SelectedEventProvider = ({ children }) => {
 
  const eventosHook = useEventos();
  const { cargarEvento } = eventosHook;

  const selectEvent = useCallback((id) => {
    if (!id) return;
    cargarEvento(id);
    try { localStorage.setItem('selectedEventId', id); } catch (e) {}
  }, [cargarEvento]);

  useEffect(() => {
    const stored = (() => {
      try { return localStorage.getItem('selectedEventId'); } catch (e) { return null; }
    })();
    if (stored) selectEvent(stored);
  }, [selectEvent]);

  return (
    <SelectedEventContext.Provider value={{ ...eventosHook, selectEvent }}>
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
