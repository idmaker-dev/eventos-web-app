import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import lugarService from "../services/lugarService";
import ModalLugar from "../components/Modales/ModalLugar";
import ConfirmDialog from "../components/Modales/ConfirmDialog";
import { useNotifications } from "../contexts/NotificationContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function Lugares() {
  const [lugares, setLugares] = useState([]);
  const [filteredLugares, setFilteredLugares] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lugarSeleccionado, setLugarSeleccionado] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lugarAEliminar, setLugarAEliminar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showSuccess, showError } = useNotifications();

  // Cargar lugares
  const cargarLugares = useCallback(async () => {
    setIsLoading(true);
    try {
      const resultado = await lugarService.getLugares();

      if (resultado.success) {
        // const data = Array.isArray(resultado.data) ? resultado.data : [];
        setLugares(resultado.data.lugares);
        setFilteredLugares(resultado.data.lugares);
      } else {
        setLugares([]);
        setFilteredLugares([]);
        showError(resultado.error || "Error al cargar lugares");
      }
    } catch (error) {
      setLugares([]);
      setFilteredLugares([]);
      showError("Error inesperado al cargar lugares");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    cargarLugares();
  }, [cargarLugares]);

  // Filtrar lugares por búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredLugares(lugares);
    } else {
      const filtered = lugares.filter(
        (lugar) =>
          lugar.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lugar.direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lugar.numero_contacto?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLugares(filtered);
    }
  }, [searchTerm, lugares]);

  // Abrir modal para crear
  const handleCrear = () => {
    setLugarSeleccionado(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEditar = (lugar) => {
    setLugarSeleccionado(lugar);
    setIsModalOpen(true);
  };

  // Guardar lugar (crear o actualizar)
  const handleGuardar = async (datos) => {
    setIsSubmitting(true);
    try {
      let resultado;

      if (lugarSeleccionado) {
        // Actualizar
        resultado = await lugarService.actualizarLugar(
          lugarSeleccionado.id,
          datos
        );
      } else {
        // Crear
        resultado = await lugarService.crearLugar(datos);
      }

      if (resultado.success) {
        showSuccess(
          resultado.message ||
            (lugarSeleccionado
              ? "Lugar actualizado exitosamente"
              : "Lugar creado exitosamente")
        );
        setIsModalOpen(false);
        cargarLugares();
      } else {
        showError(resultado.error || "Error al guardar el lugar");
      }
    } catch (error) {
      showError("Error inesperado al guardar el lugar");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar lugar
  const solicitarEliminar = (lugar) => {
    setLugarAEliminar(lugar);
    setConfirmOpen(true);
  };

  const confirmarEliminar = async () => {
    if (!lugarAEliminar) return;
    setIsDeleting(true);
    try {
      const resultado = await lugarService.eliminarLugar(lugarAEliminar.id);
      if (resultado.success) {
        showSuccess(resultado.message || "Lugar eliminado exitosamente");
        setConfirmOpen(false);
        setLugarAEliminar(null);
        cargarLugares();
      } else {
        showError(resultado.error || "Error al eliminar el lugar");
      }
    } catch (error) {
      showError("Error inesperado al eliminar el lugar");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative p-6 bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-md">
      {isLoading && (
        <LoadingSpinner overlay size="medium" />
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Catálogo de Lugares
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gestiona los lugares disponibles para tus eventos
          </p>
        </div>
        <button
          onClick={handleCrear}
          className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-[#72B7A4] text-white font-semibold rounded-lg hover:bg-[#5fa090] transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo Lugar
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, dirección o contacto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#23272e] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#246370] focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla de lugares */}
      {!isLoading && filteredLugares.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {searchTerm
              ? "No se encontraron lugares con ese criterio de búsqueda"
              : "No hay lugares registrados. Crea uno nuevo para comenzar."}
          </p>
        </div>
      ) : !isLoading && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-[#23272e]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1e1e1e] divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLugares.map((lugar) => (
                <tr
                  key={lugar.id}
                  className="hover:bg-gray-50 dark:hover:bg-[#23272e] transition"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {lugar.nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                      {lugar.direccion}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {lugar.numero_contacto}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditar(lugar)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => solicitarEliminar(lugar)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resumen */}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Mostrando {filteredLugares.length} de {lugares.length} lugares
      </div>

      {/* Modal */}
      <ModalLugar
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lugar={lugarSeleccionado}
        onGuardar={handleGuardar}
        isLoading={isSubmitting}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar lugar"
        message={<span>¿Seguro que deseas eliminar el lugar <strong>{lugarAEliminar?.nombre}</strong>? Esta acción lo desactivará para nuevos eventos.</span>}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        loading={isDeleting}
        onClose={() => { if (!isDeleting) { setConfirmOpen(false); setLugarAEliminar(null);} }}
        onConfirm={confirmarEliminar}
      />
    </div>
  );
}
