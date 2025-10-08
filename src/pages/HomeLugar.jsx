import React, { useEffect, useState } from 'react';
import InlineSpinner from '../components/ui/InlineSpinner';
import { BarChart2, Calendar, Users, TrendingUp, LogOut, RefreshCw } from 'lucide-react';
import lugarDashboardService from '../services/lugarDashboardService';
import { useAuth } from '../hooks/useAuth';

/**
 * Home para usuarios con rol 'lugar'
 * Muestra resumen de eventos realizados en ese lugar + estadísticas básicas
 */
export default function HomeLugar() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const formatDate = (iso) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  };

  const loadData = async (lugarId, { refreshing = false } = {}) => {
    if (refreshing) setIsRefreshing(true); else setLoading(true);
    try {
      const res = await lugarDashboardService.getResumen(lugarId);
      setData(res);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError('No se pudo cargar el resumen');
    } finally {
      if (refreshing) setIsRefreshing(false); else setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return; // esperar usuario disponible
      const lugarId = user?.lugarId || user?.lugar_id || null;
      if (!mounted) return;
      await loadData(lugarId);
    })();
    return () => { mounted = false; };
  }, [user]);

  const handleRefresh = async () => {
    if (isRefreshing || !user) return;
    const lugarId = user?.lugarId || user?.lugar_id || null;
    await loadData(lugarId, { refreshing: true });
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try { await logout(); } catch (e) { setIsLoggingOut(false); }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-gray-600 dark:text-gray-200">
        <InlineSpinner size="sm" /> Cargando resumen...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!data) {
    return <div className="p-8">Sin datos disponibles.</div>;
  }

  const { lugarNombre, totales, proximosEventos, eventosRecientes, topTiposEventos } = data;

  return (
    <div className="p-6 space-y-8">
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-[#216b6b]">Resumen de tu lugar</h1>
          <p className="text-gray-500 dark:text-gray-300">{lugarNombre}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Última actualización: {lastUpdated ? formatDate(lastUpdated.toISOString()) : '—'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRefresh} disabled={isRefreshing || loading} aria-busy={isRefreshing}
            className="w-10 h-10 bg-white dark:bg-gray-200 rounded-full flex items-center justify-center shadow disabled:opacity-60 disabled:cursor-not-allowed">
            {isRefreshing ? <InlineSpinner size="xs" /> : <RefreshCw className="text-gray-600 dark:text-gray-800" />}
          </button>
          <button onClick={handleLogout} disabled={isLoggingOut} aria-busy={isLoggingOut}
            className="acciones-distribucion w-10 h-10 bg-white dark:bg-gray-200 rounded-full flex items-center justify-center shadow disabled:opacity-60 disabled:cursor-not-allowed">
            {isLoggingOut ? <InlineSpinner size="xs" /> : <LogOut className="text-gray-600 dark:text-gray-800" />}
          </button>
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard icon={<Calendar className="w-6 h-6" />} label="Eventos totales" value={totales.eventos} />
        <KpiCard icon={<Users className="w-6 h-6" />} label="Asistentes acumulados" value={totales.asistentes} />
        <KpiCard icon={<TrendingUp className="w-6 h-6" />} label="Ocupación promedio" value={totales.ocupacionPromedio + '%'} />
        <KpiCard icon={<BarChart2 className="w-6 h-6" />} label="Ingresos estimados" value={'$' + totales.ingresosEstimados.toLocaleString()} />
      </section>

      {/* Próximos eventos */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Próximos eventos</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-[#23272e]">
              <tr>
                <Th>Fecha</Th>
                <Th>Nombre</Th>
                <Th>Tipo</Th>
                <Th>Invitados</Th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1e1e1e] divide-y divide-gray-100 dark:divide-gray-800">
              {proximosEventos.length === 0 && (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">No hay eventos próximos</td></tr>
              )}
              {proximosEventos.map(ev => (
                <tr key={ev.id} className="hover:bg-gray-50 dark:hover:bg-[#23272e] transition">
                  <Td>{formatDate(ev.fecha)}</Td>
                  <Td className="font-medium">{ev.nombre}</Td>
                  <Td>{ev.tipo}</Td>
                  <Td>{ev.invitados}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Eventos recientes + Top tipos */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Eventos recientes</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-[#23272e]">
                <tr>
                  <Th>Fecha</Th>
                  <Th>Nombre</Th>
                  <Th>Tipo</Th>
                  <Th>Asistentes</Th>
                  <Th>Ocupación</Th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#1e1e1e] divide-y divide-gray-100 dark:divide-gray-800">
                {eventosRecientes.length === 0 && (
                  <tr><td colSpan={5} className="p-4 text-center text-gray-500">No hay eventos registrados</td></tr>
                )}
                {eventosRecientes.map(ev => (
                  <tr key={ev.id} className="hover:bg-gray-50 dark:hover:bg-[#23272e] transition">
                    <Td>{formatDate(ev.fecha)}</Td>
                    <Td className="font-medium">{ev.nombre}</Td>
                    <Td>{ev.tipo}</Td>
                    <Td>{ev.asistentes}</Td>
                    <Td>{ev.ocupacion}%</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Sección Top tipos de evento comentada a petición */}
        {false && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Top tipos de evento</h2>
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <ul className="space-y-3">
                {topTiposEventos.map(t => (
                  <li key={t.tipo} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-200">{t.tipo}</span>
                    <span className="text-gray-500 dark:text-gray-400">{t.cantidad} ({t.porcentaje}%)</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function KpiCard({ icon, label, value }) {
  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 border border-gray-200 dark:border-gray-700 flex flex-col gap-2">
      <div className="flex items-center gap-3 text-[#206a73]">{icon}<span className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span></div>
      <div className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{value}</div>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{children}</th>;
}
function Td({ children, className='' }) {
  return <td className={`px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-200 ${className}`}>{children}</td>;
}
