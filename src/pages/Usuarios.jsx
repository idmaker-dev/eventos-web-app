import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, Shield } from 'lucide-react';
import userService from '../services/userService';
import ModalUsuario from '../components/Modales/ModalUsuario';
import { useNotifications } from '../contexts/NotificationContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/Modales/ConfirmDialog';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [rolFiltro, setRolFiltro] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showSuccess, showError } = useNotifications();

  const cargarUsuarios = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userService.getUsuarios();
      if (res.success) {
        const lista = Array.isArray(res.usuarios) ? res.usuarios : [];
        setUsuarios(lista);
        setFiltered(lista);
      } else {
        setUsuarios([]);
        setFiltered([]);
        showError(res.error || 'Error al cargar usuarios');
      }
    } catch (e) {
      setUsuarios([]);
      setFiltered([]);
      showError('Error inesperado al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => { cargarUsuarios(); }, [cargarUsuarios]);

  // Filtrado
  useEffect(() => {
    let data = [...usuarios];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(u =>
        u.nombre?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.contacto?.toLowerCase().includes(q)
      );
    }
    if (rolFiltro) {
      data = data.filter(u => {
        const r = Array.isArray(u.rol) ? u.rol[0] : u.rol;
        return r === rolFiltro;
      });
    }
    setFiltered(data);
  }, [search, rolFiltro, usuarios]);

  const handleCrear = () => { setUsuarioSeleccionado(null); setModalOpen(true); };
  const handleEditar = (u) => { setUsuarioSeleccionado(u); setModalOpen(true); };

  const handleGuardar = async (datos) => {
    setIsSubmitting(true);
    try {
      let res;
      // Si el backend espera rol como array mantenerlo, si no, enviamos string.
      // Asumimos por ahora que puede aceptar string; si se requiere array descomentar.
      const payload = { ...datos /*, rol: [datos.rol]*/ };
      res = usuarioSeleccionado
        ? await userService.actualizarUsuario(usuarioSeleccionado.id, payload)
        : await userService.crearUsuario(payload);
      if (res.success) {
        showSuccess(res.message || 'Operación exitosa');
        setModalOpen(false);
        cargarUsuarios();
      } else {
        showError(res.error || 'Error al guardar el usuario');
      }
    } catch (e) {
      showError('Error inesperado al guardar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const solicitarDesactivacion = (usuario) => {
    setUsuarioAEliminar(usuario);
    setConfirmOpen(true);
  };

  const confirmarDesactivacion = async () => {
    if (!usuarioAEliminar) return;
    setIsDeleting(true);
    try {
      const res = await userService.desactivarUsuario(usuarioAEliminar.id);
      if (res.success) {
        showSuccess(res.message || 'Usuario desactivado');
        setConfirmOpen(false);
        setUsuarioAEliminar(null);
        cargarUsuarios();
      } else {
        showError(res.error || 'Error al desactivar');
      }
    } catch (e) {
      showError('Error inesperado al desactivar usuario');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative p-6 bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-md">
      {isLoading && <LoadingSpinner overlay size="medium" />}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#206a73]" /> Usuarios
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Gestiona los usuarios del sistema</p>
        </div>
        <button onClick={handleCrear} className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-[#206a73] text-white font-semibold rounded-lg hover:bg-[#155059] transition">
          <Plus className="w-5 h-5" /> Nuevo Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o contacto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#23272e] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#246370] focus:border-transparent"
            />
        </div>
        <div>
          <select value={rolFiltro} onChange={e=>setRolFiltro(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#23272e] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#246370] focus:border-transparent">
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="operador">Operador</option>
            <option value="lugar">Lugar</option>
          </select>
        </div>
      </div>

      {!isLoading && filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">{search ? 'Sin resultados.' : 'No hay usuarios registrados.'}</p>
        </div>
      ) : !isLoading && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-[#23272e]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1e1e1e] divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map(u => {
                const rol = Array.isArray(u.rol) ? u.rol[0] : u.rol;
                return (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-[#23272e] transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{u.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-[#e1f4f1] text-[#0f5f54] dark:bg-[#1f3f3b] dark:text-[#90d5c8] capitalize">{rol}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.contacto || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditar(u)} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition" title="Editar">
                          <Pencil className="w-4 h-4" />
                          Editar
                        </button>
                        <button onClick={() => solicitarDesactivacion(u)} className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition" title="Desactivar">
                          <Trash2 className="w-4 h-4" />
                          Desactivar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Mostrando {filtered.length} de {usuarios.length} usuarios
      </div>

      <ModalUsuario
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        usuario={usuarioSeleccionado}
        onGuardar={handleGuardar}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Desactivar usuario"
        message={
          <span>
            ¿Estás seguro de que deseas desactivar al usuario
            {" "}
            <strong>{usuarioAEliminar?.nombre}</strong>? Esta acción puede revertirse reactivándolo posteriormente.
          </span>
        }
        confirmLabel="Sí, desactivar"
        cancelLabel="Cancelar"
        variant="danger"
        loading={isDeleting}
        onClose={() => { if (!isDeleting) { setConfirmOpen(false); setUsuarioAEliminar(null); } }}
        onConfirm={confirmarDesactivacion}
      />
    </div>
  );
}
