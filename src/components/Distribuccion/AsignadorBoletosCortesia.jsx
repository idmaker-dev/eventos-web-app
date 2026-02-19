import React, { useState, useEffect } from "react";
import {
  X,
  Ticket,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Minus,
  Table,
} from "lucide-react";
import { Button } from "@headlessui/react";
import { useBoletosCortesia } from "../../hooks/useBoletosCortesia";
import EnvConfig from "../../utils/config";
import ModalRestricciones from "./ModalRestricciones";

/**
 * Modal para asignar boletos de cortesía a mesas del evento
 * Permite seleccionar mesas y la cantidad de asientos a ocupar por mesa
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {function} props.onClose - Callback para cerrar el modal
 * @param {string} props.eventoId - ID del evento
 * @param {Array} props.mesas - Array de mesas disponibles
 * @param {Object} props.configuracionTurnos - Configuración de menús y restricciones del evento
 * @param {function} props.onAsignacionExitosa - Callback cuando la asignación es exitosa
 */
export default function AsignadorBoletosCortesia({
  isOpen,
  onClose,
  eventoId,
  mesas = [],
  configuracionTurnos,
  onAsignacionExitosa,
}) {
  // Hook de boletos de cortesía
  const { estado, isAssigning, fetchEstado, asignar, error, clearError } =
    useBoletosCortesia(eventoId);

  // Estados locales
  const [seleccionesMesas, setSeleccionesMesas] = useState({});
  // Formato: { mesaId: { cantidad: number, mesa: mesaObject } }
  const [mensajeExito, setMensajeExito] = useState("");
  const [errorLocal, setErrorLocal] = useState("");
  
  // Estados para configuración de personas
  const [mesaEnConfiguracion, setMesaEnConfiguracion] = useState(null);
  const [configuracionesMesas, setConfiguracionesMesas] = useState({});
  // Formato: { mesaId: { personas: [...] } }
  const [mesasPendientesConfig, setMesasPendientesConfig] = useState([]);

  // Cargar estado al abrir el modal
  useEffect(() => {
    if (isOpen && eventoId) {
      fetchEstado();
      setSeleccionesMesas({});
      setConfiguracionesMesas({});
      setMesaEnConfiguracion(null);
      setMesasPendientesConfig([]);
      setMensajeExito("");
      setErrorLocal("");
      clearError();
    }
  }, [isOpen, eventoId, fetchEstado, clearError]);

  /**
   * Calcular total de asientos seleccionados
   */
  const calcularTotalSeleccionado = () => {
    return Object.values(seleccionesMesas).reduce(
      (total, sel) => total + sel.cantidad,
      0
    );
  };

  /**
   * Verificar si una mesa tiene espacio disponible
   */
  const obtenerEspacioDisponible = (mesa) => {
    const ocupados = mesa.disponibilidad?.asientos_ocupados || 0;
    return mesa.capacidad - ocupados;
  };

  /**
   * Agregar o actualizar selección de mesa
   */
  const actualizarSeleccionMesa = (mesa, cantidad) => {
    if (cantidad <= 0) {
      // Remover mesa de la selección
      const nuevasSelecciones = { ...seleccionesMesas };
      delete nuevasSelecciones[mesa.id];
      setSeleccionesMesas(nuevasSelecciones);
    } else {
      // Agregar o actualizar mesa
      setSeleccionesMesas({
        ...seleccionesMesas,
        [mesa.id]: {
          cantidad,
          mesa,
        },
      });
    }
    setErrorLocal("");
    clearError();
  };

  /**
   * Incrementar cantidad en una mesa
   */
  const incrementarCantidad = (mesa) => {
    const seleccionActual = seleccionesMesas[mesa.id];
    const cantidadActual = seleccionActual ? seleccionActual.cantidad : 0;
    const espacioDisponible = obtenerEspacioDisponible(mesa);
    const totalActual = calcularTotalSeleccionado();
    const disponibles = estado.boletos_disponibles;

    if (cantidadActual >= espacioDisponible) {
      setErrorLocal(
        `Mesa ${mesa.numero} no tiene más espacio disponible (${espacioDisponible} asientos libres)`
      );
      return;
    }

    if (totalActual >= disponibles) {
      setErrorLocal(
        `No hay más boletos de cortesía disponibles (${disponibles} restantes)`
      );
      return;
    }

    actualizarSeleccionMesa(mesa, cantidadActual + 1);
  };

  /**
   * Decrementar cantidad en una mesa
   */
  const decrementarCantidad = (mesa) => {
    const seleccionActual = seleccionesMesas[mesa.id];
    if (!seleccionActual) return;

    actualizarSeleccionMesa(mesa, seleccionActual.cantidad - 1);
  };

  /**
   * Manejar asignación de boletos
   */
  const handleAsignar = async () => {
    const totalSeleccionado = calcularTotalSeleccionado();

    if (totalSeleccionado === 0) {
      setErrorLocal("Debes seleccionar al menos un asiento");
      return;
    }

    if (totalSeleccionado > estado.boletos_disponibles) {
      setErrorLocal(
        `Has seleccionado ${totalSeleccionado} asientos pero solo hay ${estado.boletos_disponibles} boletos disponibles`
      );
      return;
    }

    // Iniciar flujo de configuración mesa por mesa
    const mesasSeleccionadasArray = Object.entries(seleccionesMesas).map(
      ([mesaId, data]) => ({
        mesaId,
        ...data,
      })
    );

    setMesasPendientesConfig(mesasSeleccionadasArray);
    setConfiguracionesMesas({});
    
    // Abrir modal de configuración para la primera mesa
    if (mesasSeleccionadasArray.length > 0) {
      setMesaEnConfiguracion(mesasSeleccionadasArray[0]);
    }
  };

  /**
   * Manejar confirmación de configuración de una mesa
   */
  const handleConfirmarConfiguracion = ({ personas }) => {
    // Guardar configuración para esta mesa
    setConfiguracionesMesas((prev) => ({
      ...prev,
      [mesaEnConfiguracion.mesaId]: {
        mesa: mesaEnConfiguracion.mesa,
        cantidad: mesaEnConfiguracion.cantidad,
        personas: personas,
      },
    }));

    // Remover mesa actual de la cola
    const remaining = mesasPendientesConfig.slice(1);
    setMesasPendientesConfig(remaining);

    if (remaining.length > 0) {
      // Hay más mesas por configurar
      setMesaEnConfiguracion(remaining[0]);
    } else {
      // Todas las mesas configuradas, proceder con asignación
      setMesaEnConfiguracion(null);
      realizarAsignacionFinal({
        ...configuracionesMesas,
        [mesaEnConfiguracion.mesaId]: {
          mesa: mesaEnConfiguracion.mesa,
          cantidad: mesaEnConfiguracion.cantidad,
          personas: personas,
        },
      });
    }
  };

  /**
   * Cancelar configuración (usuario cierra modal)
   */
  const handleCancelarConfiguracion = () => {
    setMesaEnConfiguracion(null);
    setMesasPendientesConfig([]);
    setConfiguracionesMesas({});
  };

  /**
   * Realizar asignación final con todas las configuraciones
   */
  const realizarAsignacionFinal = async (configuracionesCompletas) => {
    // Construir mesas_seleccionadas con todas las configuraciones
    const mesasSeleccionadas = Object.entries(configuracionesCompletas).map(
      ([mesaId, config]) => ({
        mesa_id: config.mesa.id,
        numero_mesa: config.mesa.numero,
        cantidad_personas: config.personas.length,
        tipo_mesa: config.mesa.type || "mesa",
        personas: config.personas,
      })
    );

    // Construir array plano de personas
    const todasLasPersonas = mesasSeleccionadas.flatMap(
      (mesa) => mesa.personas
    );

    const payload = {
      mesas_seleccionadas: mesasSeleccionadas,
      personas: todasLasPersonas,
    };

    const exito = await asignar(payload);

    if (exito) {
      // Limpiar estados
      setSeleccionesMesas({});
      setConfiguracionesMesas({});
      setMesasPendientesConfig([]);
      setMesaEnConfiguracion(null);
      
      // Notificar asignación exitosa para refrescar datos del panel
      if (onAsignacionExitosa) {
        onAsignacionExitosa();
      }
      
      onClose();
    }
  };

  /**
   * Filtrar mesas disponibles (que tengan espacio)
   */
  const mesasDisponibles = mesas.filter((mesa) => {
    const espacioDisponible = obtenerEspacioDisponible(mesa);
    return espacioDisponible > 0;
  });

  // No renderizar si no está abierto
  if (!isOpen) return null;

  const totalSeleccionado = calcularTotalSeleccionado();
  const puedeAsignar =
    totalSeleccionado > 0 &&
    totalSeleccionado <= estado.boletos_disponibles &&
    !isAssigning;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="bg-casal rounded-lg p-2">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Asignar Boletos de Cortesía
              </h3>
              <p className="text-sm text-gray-600">
                Selecciona mesas y cantidad de asientos
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            disabled={isAssigning}
            className="text-gray-500 p-2 border bg-white rounded-lg hover:text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Información de boletos disponibles */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-300">
              <p className="text-sm text-gray-600 font-medium mb-1">
                Disponibles
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {estado.boletos_disponibles}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-300">
              <p className="text-sm text-gray-600 font-medium mb-1">
                Seleccionados
              </p>
              <p className="text-2xl font-bold text-casal">
                {totalSeleccionado}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-300">
              <p className="text-sm text-gray-600 font-medium mb-1">
                Restantes
              </p>
              <p className="text-2xl font-bold text-green-600">
                {Math.max(0, estado.boletos_disponibles - totalSeleccionado)}
              </p>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {(error || errorLocal) && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error || errorLocal}</p>
          </div>
        )}

        {mensajeExito && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{mensajeExito}</p>
          </div>
        )}

        {/* Lista de mesas */}
        <div className="flex-1 overflow-y-auto p-6">
          {mesasDisponibles.length === 0 ? (
            <div className="text-center py-12">
              <Table className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                No hay mesas con espacio disponible
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {mesasDisponibles.map((mesa) => {
                const espacioDisponible = obtenerEspacioDisponible(mesa);
                const seleccion = seleccionesMesas[mesa.id];
                const cantidadSeleccionada = seleccion ? seleccion.cantidad : 0;

                return (
                  <div
                    key={mesa.id}
                    className={`border rounded-lg p-4 transition-all ${
                      cantidadSeleccionada > 0
                        ? "bg-blue-50 border-casal"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`rounded-lg p-3 ${
                            cantidadSeleccionada > 0
                              ? "bg-casal"
                              : "bg-gray-100"
                          }`}
                        >
                          <Table
                            className={`w-6 h-6 ${
                              cantidadSeleccionada > 0
                                ? "text-white"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            Mesa {mesa.numero}
                          </h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {espacioDisponible} / {mesa.capacidad} libres
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {cantidadSeleccionada > 0 && (
                          <div className="bg-casal/10 text-casal font-semibold px-3 py-1 rounded-full text-sm border border-casal/30">
                            {cantidadSeleccionada} asiento
                            {cantidadSeleccionada > 1 ? "s" : ""}
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => decrementarCantidad(mesa)}
                            disabled={cantidadSeleccionada === 0 || isAssigning}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <div className="w-12 text-center font-semibold text-lg">
                            {cantidadSeleccionada}
                          </div>

                          <button
                            onClick={() => incrementarCantidad(mesa)}
                            disabled={
                              cantidadSeleccionada >= espacioDisponible ||
                              totalSeleccionado >= estado.boletos_disponibles ||
                              isAssigning
                            }
                            className="p-2 rounded-lg border border-casal bg-casal text-white hover:bg-casal/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isAssigning}
              className="flex-1 py-3 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>

            <button
              onClick={handleAsignar}
              disabled={!puedeAsignar}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                puedeAsignar
                  ? "bg-casal hover:bg-casal/90 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isAssigning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Asignando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Asignar {totalSeleccionado} Boleto{totalSeleccionado > 1 ? "s" : ""}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de configuración por mesa */}
      {mesaEnConfiguracion && (
        <ModalRestricciones
          isOpen={!!mesaEnConfiguracion}
          onClose={handleCancelarConfiguracion}
          mesaNumero={mesaEnConfiguracion.mesa.numero}
          cantidadPersonasEspecifica={mesaEnConfiguracion.cantidad}
          onConfirm={handleConfirmarConfiguracion}
          configuracionTurnos={configuracionTurnos}
          subtitulo={`Configurando Mesa ${Object.keys(configuracionesMesas).length + 1} de ${Object.keys(seleccionesMesas).length}`}
        />
      )}
    </div>
  );
}

