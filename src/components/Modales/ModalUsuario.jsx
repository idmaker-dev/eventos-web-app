import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
// Import original lugarService sólo si se requiere; para el select usaremos el endpoint de eventService
// porque devuelve directamente las opciones usadas también en creación de eventos.
// import lugarService from '../../services/lugarService';
import InlineSpinner from '../ui/InlineSpinner';

/* ModalUsuario
   Props:
   - open
   - onClose
   - usuario (obj | null)
   - onGuardar(datos)
   - isLoading (bool)
*/
export default function ModalUsuario({ open, onClose, usuario = null, onGuardar, isLoading = false }) {
  const esEdicion = Boolean(usuario?.id);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'admin',
    contacto: '',
    direccion: '',
    lugar_id: ''
  });
  const [errores, setErrores] = useState({});
  const [lugares, setLugares] = useState([]);
  const [cargandoLugares, setCargandoLugares] = useState(false);

  useEffect(() => {
    if (open && form.rol === 'lugar') {
      cargarLugares();
    }
  }, [open, form.rol]);

  useEffect(() => {
    if (usuario && open) {
      setForm({
        nombre: usuario.nombre || '',
        email: usuario.email || '',
        password: '', // no se muestra en edición
        rol: Array.isArray(usuario.rol) ? usuario.rol[0] : (usuario.rol || 'admin'),
        contacto: usuario.contacto || '',
        direccion: usuario.direccion || '',
        lugar_id: usuario.lugar_id || usuario.lugar?.id || ''
      });
    } else if (open) {
      setForm({ nombre: '', email: '', password: '', rol: 'admin', contacto: '', direccion: '', lugar_id: '' });
      setErrores({});
    }
  }, [usuario, open]);

  const cargarLugares = async () => {
    try {
      setCargandoLugares(true);
      // Carga dinámica para no incrementar el bundle inicial
      const eventService = (await import('../../services/eventService')).default;
      const res = await eventService.getLugares();
      if (res.success) {
        // res.data puede ser: [ ... ]  ó  { lugares: [...] }
        const lista = Array.isArray(res.data)
          ? res.data
          : (Array.isArray(res.data?.lugares) ? res.data.lugares : []);
        setLugares(lista);
      } else {
        setLugares([]);
      }
    } catch (e) {
      setLugares([]);
    } finally {
      setCargandoLugares(false);
    }
  };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Nombre requerido';
    if (!form.email.trim()) e.email = 'Email requerido';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Email inválido';
    if (!esEdicion && form.rol !== 'lugar' && !form.password.trim()) e.password = 'Contraseña requerida';
    if (form.rol === 'lugar' && !form.lugar_id) e.lugar_id = 'Selecciona un lugar';
    if (!form.rol) e.rol = 'Rol requerido';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    const payload = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      rol: form.rol, // aunque API espera array, adaptamos en página si es necesario
      contacto: form.contacto.trim(),
      direccion: form.direccion.trim(),
      ...(form.rol === 'lugar' ? { lugar_id: form.lugar_id } : {}),
      ...(!esEdicion && form.rol !== 'lugar' ? { password: form.password } : {})
    };
    onGuardar(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-xl p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-1 text-gray-800 dark:text-gray-100">
          {esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {esEdicion ? 'Actualiza los datos necesarios.' : 'Completa la información para registrar un usuario.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 relative">

          <div>
            <label className="block text-sm font-medium mb-1">Nombre *</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} disabled={isLoading}
              className={`w-full px-3 py-2 rounded-lg border ${errores.nombre ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-[#262626] text-sm`} />
            {errores.nombre && <p className="text-xs text-red-500 mt-1">{errores.nombre}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} disabled={isLoading || esEdicion}
              className={`w-full px-3 py-2 rounded-lg border ${errores.email ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-[#262626] text-sm`} />
            {errores.email && <p className="text-xs text-red-500 mt-1">{errores.email}</p>}
          </div>

          {form.rol !== 'lugar' && !esEdicion && (
            <div>
              <label className="block text-sm font-medium mb-1">Contraseña *</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} disabled={isLoading}
                className={`w-full px-3 py-2 rounded-lg border ${errores.password ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-[#262626] text-sm`} />
              {errores.password && <p className="text-xs text-red-500 mt-1">{errores.password}</p>}
              {form.rol === 'lugar' && <p className="text-[11px] text-gray-500 mt-1">La contraseña se generará automáticamente.</p>}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rol *</label>
              <select name="rol" value={form.rol} onChange={handleChange} disabled={isLoading}
                className={`w-full px-3 py-2 rounded-lg border ${errores.rol ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-[#262626] text-sm`}>
                <option value="admin">Administrador</option>
                <option value="operador">Operador</option>
                <option value="lugar">Lugar</option>
              </select>
              {errores.rol && <p className="text-xs text-red-500 mt-1">{errores.rol}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contacto</label>
              <input name="contacto" value={form.contacto} onChange={handleChange} disabled={isLoading}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#262626] text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Dirección</label>
            <input name="direccion" value={form.direccion} onChange={handleChange} disabled={isLoading}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#262626] text-sm" />
          </div>

          {form.rol === 'lugar' && (
            <div>
              <label className="block text-sm font-medium mb-1">Lugar asignado *</label>
              {cargandoLugares ? (
                <div className="text-sm text-gray-500">Cargando lugares...</div>
              ) : (
                <select name="lugar_id" value={form.lugar_id} onChange={handleChange} disabled={isLoading}
                  className={`w-full px-3 py-2 rounded-lg border ${errores.lugar_id ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-[#262626] text-sm`}>
                  <option value="">Seleccione un lugar</option>
                  {Array.isArray(lugares) && lugares.map(l => (
                    <option key={l.id} value={l.id}>{l.nombre}</option>
                  ))}
                </select>
              )}
              {errores.lugar_id && <p className="text-xs text-red-500 mt-1">{errores.lugar_id}</p>}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] transition">Cancelar</button>
            <button type="submit" disabled={isLoading}
              className="px-5 py-2.5 rounded-lg bg-[#206a73] text-white text-sm font-semibold hover:bg-[#155059] disabled:opacity-60 transition flex items-center gap-2">
              {isLoading && <InlineSpinner size="sm" />}
              {isLoading ? (esEdicion ? 'Guardando...' : 'Creando...') : (esEdicion ? 'Guardar Cambios' : 'Crear Usuario')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
