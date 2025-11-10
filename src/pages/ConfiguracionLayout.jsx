import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import DistribuccionEditor from "../components/Distribuccion/DistribuccionEditor";
import { useLayouts } from "../hooks/useLayouts";
import { useNotifications } from "../contexts/NotificationContext";

/**
 * Página para configurar layouts de lugares
 * Permite crear y editar configuraciones de salones
 */
export default function ConfiguracionLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();

  // Extraer datos de navegación
  const { lugar, configuracion } = location.state || {};

  // Estados locales
  const [allElements, setAllElements] = useState([]);
  const [contadores, setContadores] = useState({
    mesa: 0,
    mesaRectangular: 0,
    barra: 0,
    buffet: 0,
    escenario: 0,
    entrada: 0,
    pistaBaileRedonda: 0,
    pistaBaileRectangular: 0,
    pistaBaileCuadrada: 0,
  });
  const [layoutGuardado, setLayoutGuardado] = useState(false);
  const [nombreConfiguracion, setNombreConfiguracion] = useState("");
  const [descripcionConfiguracion, setDescripcionConfiguracion] = useState("");
  const [mostrarFormularioNombre, setMostrarFormularioNombre] = useState(false);
  const [elementosIniciales, setElementosIniciales] = useState([]);

  // Hook para gestionar configuraciones
  const {
    crearConfiguracion,
    actualizarConfiguracion,
    obtenerConfiguracion,
    isCreating,
    isUpdating,
    error: layoutError,
  } = useLayouts(lugar?.id);

  // Inicializar elementos al cargar
  useEffect(() => {
    if (!lugar) {
      showError("No se especificó el lugar");
      navigate("/admin/lugares");
      return;
    }

    // Inicializar según el modo
    if (configuracion.modo === "editar") {
      // Modo editar - cargar configuración existente
      cargarConfiguracionExistente();
    } else if (configuracion.modo === "crear") {
      if (configuracion.tipoCreacion === "vacio") {
        // Empezar desde cero
        setLayoutGuardado(false);
      } else if (configuracion.tipoCreacion === "basado" && configuracion.configuracionBase) {
        // Basado en configuración existente
        cargarConfiguracionBase();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detectar cambios en elementos para modo edición
  useEffect(() => {
    if (configuracion?.modo === "editar" && elementosIniciales.length > 0) {
      // Comparar elementos actuales con iniciales
      const hayDiferencias = JSON.stringify(allElements) !== JSON.stringify(elementosIniciales);
      if (hayDiferencias && layoutGuardado) {
        setLayoutGuardado(false); // Mostrar botón de guardar si hay cambios
      }
    }
  }, [allElements, elementosIniciales, configuracion?.modo, layoutGuardado]);

  const cargarConfiguracionExistente = async () => {
    if (!configuracion.configuracion?.id) return;

    const result = await obtenerConfiguracion(configuracion.configuracion.id, lugar.id);
    if (result.success) {
      const elementosCargados = result.data.configuracion.elementos || [];
      setAllElements(elementosCargados);
      setElementosIniciales(JSON.parse(JSON.stringify(elementosCargados))); // Copia profunda
      setNombreConfiguracion(result.data.configuracion.nombre);
      setDescripcionConfiguracion(result.data.configuracion.descripcion || "");
      setLayoutGuardado(true);
      calcularContadores(elementosCargados);
    } else {
      showError("Error al cargar configuración");
    }
  };

  const cargarConfiguracionBase = async () => {
    if (!configuracion.configuracionBase?.id) return;

    const result = await obtenerConfiguracion(configuracion.configuracionBase.id, lugar.id);
    if (result.success) {
      // Copiar elementos pero generar nuevos IDs
      const elementosCopiados = result.data.configuracion.elementos.map((el) => ({
        ...el,
        id: `${el.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }));
      setAllElements(elementosCopiados);
      setNombreConfiguracion(`Copia de ${result.data.configuracion.nombre}`);
      setDescripcionConfiguracion(result.data.configuracion.descripcion || "");
      setLayoutGuardado(false);
      calcularContadores(elementosCopiados);
    } else {
      showError("Error al cargar configuración base");
    }
  };

  const calcularContadores = (elementos) => {
    const nuevosContadores = {
      mesa: 0,
      mesaRectangular: 0,
      barra: 0,
      buffet: 0,
      escenario: 0,
      entrada: 0,
    };

    elementos.forEach((elemento) => {
      if (elemento.type === "mesa") {
        nuevosContadores.mesa = Math.max(nuevosContadores.mesa, elemento.numero || 0);
      } else if (elemento.type === "mesaRectangular") {
        nuevosContadores.mesaRectangular = Math.max(
          nuevosContadores.mesaRectangular,
          elemento.numero || 0
        );
      } else if (nuevosContadores.hasOwnProperty(elemento.type)) {
        nuevosContadores[elemento.type]++;
      }
    });

    setContadores(nuevosContadores);
  };

  // Función que intercepta el guardado para mostrar modal de nombre
  const handleSolicitarGuardado = () => {
    // Si ya tiene nombre, mostrar el modal para confirmar/editar
    // Si no tiene nombre, mostrar el modal para pedirlo
    setMostrarFormularioNombre(true);
  };

  const handleGuardarConfiguracion = async () => {
    if (!nombreConfiguracion.trim()) {
      showError("Por favor ingresa un nombre para la configuración");
      return;
    }

    const datosConfiguracion = {
      nombre: nombreConfiguracion,
      descripcion: descripcionConfiguracion,
      elementos: allElements,
      totalMesas: allElements.filter(
        (el) => el.type === "mesa" || el.type === "mesaRectangular"
      ).length,
    };

    let result;
    if (configuracion.modo === "editar" && configuracion.configuracion?.id) {
      // Actualizar configuración existente
      result = await actualizarConfiguracion(
        configuracion.configuracion.id,
        datosConfiguracion
      );
    } else {
      // Crear nueva configuración
      result = await crearConfiguracion(datosConfiguracion);
    }

    if (result.success) {
      showSuccess(
        configuracion.modo === "editar"
          ? "Configuración actualizada exitosamente"
          : "Configuración creada exitosamente"
      );
      setLayoutGuardado(true);
      // Actualizar elementos iniciales para nueva comparación
      setElementosIniciales(JSON.parse(JSON.stringify(allElements)));
      setMostrarFormularioNombre(false);
    } else {
      showError(result.error || "Error al guardar configuración");
    }
  };

  const handleVolver = () => {
    if (!layoutGuardado && allElements.length > 1) {
      const confirmar = window.confirm(
        "Tienes cambios sin guardar. ¿Estás seguro de que deseas salir?"
      );
      if (!confirmar) return;
    }
    navigate("/admin/lugares");
  };

  if (!lugar) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300">
            No se especificó el lugar
          </p>
        </div>
      </div>
    );
  }

  const isLoading = isCreating || isUpdating;

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a]">
      {/* Header simple */}
      <div className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl py-3">
          <div className="flex items-left justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleVolver}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                title="Volver a lugares"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {configuracion.modo === "editar" ? "Editar" : "Nueva"} Configuración de Layout
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {lugar.nombre} • {lugar.direccion}
                </p>
              </div>
            </div>

            {/* {!layoutGuardado && (
              <div className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg">
                <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  Cambios sin guardar
                </span>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* Errores */}
      {layoutError && (
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-red-800 dark:text-red-300">{layoutError}</span>
          </div>
        </div>
      )}

      {/* Modal para nombre de configuración */}
      {mostrarFormularioNombre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {layoutGuardado ? "Actualizar" : "Guardar"} Configuración
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de la configuración *
                </label>
                <input
                  type="text"
                  value={nombreConfiguracion}
                  onChange={(e) => setNombreConfiguracion(e.target.value)}
                  placeholder="Ej: Salón Principal, Configuración Boda, etc."
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-casal focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={descripcionConfiguracion}
                  onChange={(e) => setDescripcionConfiguracion(e.target.value)}
                  placeholder="Breve descripción de esta configuración..."
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-casal focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setMostrarFormularioNombre(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarConfiguracion}
                disabled={isLoading || !nombreConfiguracion.trim()}
                className="px-6 py-2 bg-casal hover:bg-casal/80 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
              >
                {isLoading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <DistribuccionEditor
        allElements={allElements}
        setAllElements={setAllElements}
        contadores={contadores}
        setContadores={setContadores}
        layoutGuardado={layoutGuardado}
        setLayoutGuardado={setLayoutGuardado}
        layoutFinal={null}
        setLayoutFinal={() => {}}
        invitados={null}
        setInvitados={null}
        onGuardarLayout={handleSolicitarGuardado}
        lugar={lugar}
        configuracion={configuracion}
        esLugar={true}
      />
    </div>
  );
}
