import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Phone,
  MapPin,
  Settings,
  Users,
} from "lucide-react";
import lugarService from "../services/lugarService";
import ModalLugar from "../components/Modales/ModalLugar";
import ConfirmDialog from "../components/Modales/ConfirmDialog";
import { useNotifications } from "../contexts/NotificationContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Tooltip } from "../components/ui/Tooltip";
import ModalInicioAsignacion from "../components/Distribuccion/ModalInicioAsignacion";
import { useNavigate } from "react-router-dom";

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
  const [isAsignacionModalOpen, setIsAsignacionModalOpen] = useState(false);
  const [lugarParaAsignacion, setLugarParaAsignacion] = useState(null);
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();

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
          lugar.numero_contacto
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
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

  // Configurar módulo de asignación para un lugar
  const handleConfigurarAsignacion = (lugar) => {
    setLugarParaAsignacion(lugar);
    setIsAsignacionModalOpen(true);
  };

  return (
    <div className="relative p-6 bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-md">
      {isLoading && <LoadingSpinner overlay size="medium" />}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Catálogo de Lugares
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gestiona los lugares disponibles para tus eventos
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Tooltip content="Crear nuevo lugar">
            <button
              onClick={handleCrear}
              className="md:mt-0 inline-flex items-center gap-2 px-1.5 py-1.5 bg-casal text-white font-semibold rounded-full hover:bg-[#5fa090] transition"
            >
              <Plus className="w-6 h-6" />
            </button>
          </Tooltip>

          {/* Barra de búsqueda */}
          <div className="">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, dirección o contacto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-96 pl-10 pr-4 py-1.5 border-2 border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-[#23272e] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#246370] focus:border-transparent"
              />
            </div>
          </div>
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
      ) : (
        !isLoading && (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black dark:text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black dark:text-gray-300 uppercase tracking-wider">
                    Dirección
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black dark:text-gray-300 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-black dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#1e1e1e] divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLugares.map((lugar, index) => (
                  <tr
                    key={lugar.id}
                    className={`transition ${
                      index % 2 === 0
                        ? "bg-fondoVs dark:bg-[#1e1e1e] rounded-3xl"
                        : "bg-transparent dark:bg-slate-800/30"
                    } hover:bg-casal/20 dark:hover:bg-casal/50`}
                  >
                    <td className="px-6 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {lugar.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      <div className="text-sm text-gray-700  dark:text-gray-400 max-w-md flex items-center gap-2">
                        <div>
                          <MapPin className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          {lugar.direccion}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-700 dark:text-gray-400 flex gap-2 items-center">
                        <Phone className="w-4 h-4 text-gray-600" />
                        {lugar.numero_contacto}
                      </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Tooltip
                          content="Configurar Módulo de Asignación"
                          position="top"
                        >
                          <button
                            onClick={() => handleConfigurarAsignacion(lugar)}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-Acapulco text-white rounded-full hover:bg-casalds-700 transition"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Editar lugar" position="top">
                          <button
                            onClick={() => handleEditar(lugar)}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-casal text-white rounded-full hover:bg-casal/80 transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Eliminar lugar" position="top">
                          <button
                            onClick={() => solicitarEliminar(lugar)}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
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
        message={
          <span>
            ¿Seguro que deseas eliminar el lugar{" "}
            <strong>{lugarAEliminar?.nombre}</strong>? Esta acción lo
            desactivará para nuevos eventos.
          </span>
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        loading={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setConfirmOpen(false);
            setLugarAEliminar(null);
          }
        }}
        onConfirm={confirmarEliminar}
      />
      <ModalInicioAsignacion
        isOpen={isAsignacionModalOpen}
        onClose={() => setIsAsignacionModalOpen(false)}
        direccionEvento={lugarParaAsignacion?.direccion || ""}
        salonesExistentes={
          lugarParaAsignacion?.asignaciones?.length > 0
            ? lugarParaAsignacion.asignaciones
            : []
        }
        onIniciar={() => {
          setIsAsignacionModalOpen(false);
          navigate("/admin/asignacion", { state: { skipModal: true } });
        }}
      />
    </div>
  );
}
