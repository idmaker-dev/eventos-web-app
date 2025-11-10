import React, { useState, useEffect } from "react";
import ModalInicioAsignacion from "../components/Distribuccion/ModalInicioAsignacion.jsx";
import { useSelectedEvent } from "../contexts/SelectedEventContext.jsx";
import DistribuccionEditor from "../components/Distribuccion/DistribuccionEditor.jsx";
import DistribuccionMonitor from "../components/Distribuccion/DistribuccionMonitor.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { useLayoutEvento } from "../hooks/useLayoutEvento";
import { useLayouts } from "../hooks/useLayouts";
import { useNotifications } from "../contexts/NotificationContext";

export default function Asignacion() {
  const { eventoActual } = useSelectedEvent();
  const navigate = useNavigate();
  const location = useLocation();
  const skipModal = location.state?.skipModal;

  const [showModalInicio, setShowModalInicio] = useState(!skipModal);
  const [configuracion, setConfiguracion] = useState(null);
  const [nombreSalon, setNombreSalon] = useState("");

  // Función para generar lista inicial de invitados
  const getInvitadosIniciales = () => [
    { id: 1, nombre: "Familia García", cantidad: 4, necesidadEspecial: false },
    { id: 2, nombre: "María López", cantidad: 1, necesidadEspecial: false },
    {
      id: 3,
      nombre: "Familia Rodríguez",
      cantidad: 3,
      necesidadEspecial: true,
    },
    { id: 4, nombre: "Carlos Mendez", cantidad: 1, necesidadEspecial: false },
    {
      id: 5,
      nombre: "Compañeros trabajo",
      cantidad: 4,
      necesidadEspecial: false,
    },
    { id: 6, nombre: "Ana Sofi", cantidad: 1, necesidadEspecial: true },
    {
      id: 7,
      nombre: "Compañeros Padel",
      cantidad: 2,
      necesidadEspecial: false,
    },
    { id: 8, nombre: "Familia Lara", cantidad: 7, necesidadEspecial: false },
    { id: 9, nombre: "Abuela Carmen", cantidad: 1, necesidadEspecial: true },
    {
      id: 10,
      nombre: "Tío Roberto (silla ruedas)",
      cantidad: 1,
      necesidadEspecial: true,
    },
  ];

  // Estados del salon actual
  const [layoutGuardado, setLayoutGuardado] = useState(false);
  const [layoutFinal, setLayoutFinal] = useState(null);
  const [allElements, setAllElements] = useState([]);
  const [contadores, setContadores] = useState({
    mesa: 0,
    mesaRectangular: 0,
    barra: 1,
    buffet: 1,
    escenario: 1,
    entrada: 1,
    pistaBaileRedonda: 0,
    pistaBaileRectangular: 0,
    pistaBaileCuadrada: 0,
  });

  // Hooks para obtener datos del backend
  const eventoId = eventoActual?.id;
  const lugarId = eventoActual?.lugar?.id;

  console.log("🔍 Asignacion - eventoId:", eventoId, "lugarId:", lugarId);

  const {
    layout: layoutEvento,
    isLoading: loadingLayoutEvento,
    asignarConfiguracionBase,
    cargarLayout,
    guardarLayoutPersonalizado,
  } = useLayoutEvento(eventoId);

  const {
    configuraciones: layoutsDisponibles,
    isLoading: loadingLayouts,
  } = useLayouts(lugarId);

  console.log("📊 Layouts disponibles desde hook:", layoutsDisponibles);

  const { showSuccess, showError } = useNotifications();

  const [invitados, setInvitados] = useState(getInvitadosIniciales());
  const [configuraciones, setConfiguraciones] = useState([]);
  const [tieneLayoutAsignado, setTieneLayoutAsignado] = useState(false);
  const [layoutActual, setLayoutActual] = useState(null);
  const [isLoadingModal, setIsLoadingModal] = useState(true);

  const handleCloseModal = () => {
    navigate(-1);
  };

  // Cargar configuraciones disponibles del lugar
  useEffect(() => {
    console.log("🔄 useEffect configuraciones - layoutsDisponibles:", layoutsDisponibles);
    if (layoutsDisponibles && layoutsDisponibles.length > 0) {
      setConfiguraciones(layoutsDisponibles);
      console.log("✅ Configuraciones cargadas en estado:", layoutsDisponibles.length);
    } else {
      console.log("⚠️ No hay layoutsDisponibles o está vacío");
    }
  }, [layoutsDisponibles]);

  // Verificar si el evento ya tiene un layout asignado
  useEffect(() => {
    const verificarLayoutExistente = async () => {
      setIsLoadingModal(true);
      
      if (layoutEvento) {
        console.log("✅ Layout de evento encontrado:", layoutEvento);
        
        // Verificar si realmente tiene configuración asignada
        const tieneConfig = layoutEvento.tiene_configuracion === true || 
                           (layoutEvento.elementos && layoutEvento.elementos.length > 0) ||
                           layoutEvento.configuracion_lugar_base_id;
        
        console.log("🔍 ¿Tiene configuración?", tieneConfig);
        setTieneLayoutAsignado(tieneConfig);
        setLayoutActual(tieneConfig ? layoutEvento : null);
      } else {
        console.log("ℹ️ No hay layout asignado para este evento");
        setTieneLayoutAsignado(false);
        setLayoutActual(null);
      }
      
      setIsLoadingModal(false);
    };

    if (eventoId && !loadingLayoutEvento) {
      verificarLayoutExistente();
    }
  }, [eventoId, layoutEvento, loadingLayoutEvento]);

  // Función auxiliar para calcular contadores basados en elementos
  const calcularContadoresDesdeElementos = (elementos) => {
    const nuevosContadores = {
      mesa: 0,
      mesaRectangular: 0,
      barra: 0,
      buffet: 0,
      escenario: 0,
      entrada: 0,
      pistaBaileRedonda: 0,
      pistaBaileRectangular: 0,
      pistaBaileCuadrada: 0,
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

    return nuevosContadores;
  };

  const handleIniciarAsignacion = async (config) => {
    console.log("🚀 Configuración recibida:", config);
    setConfiguracion(config);

    try {
      let elementosCargados = [];

      if (config.modo === "monitor") {
        // Modo monitor: solo visualización
        console.log("📺 Modo monitor");
        const result = await cargarLayout();
        if (result && result.success) {
          elementosCargados = result.data?.layout?.elementos || [];
          console.log("📋 Elementos cargados para monitor:", elementosCargados.length);
          setAllElements(elementosCargados);
          setNombreSalon(result.data?.layout?.configuracion_lugar_base_nombre || "");
          setContadores(calcularContadoresDesdeElementos(elementosCargados));
          setLayoutGuardado(true);
          setLayoutFinal(result.data?.layout);
        } else {
          showError("No se pudo cargar el layout del evento");
          return;
        }
      } else if (config.modo === "seleccionar") {
        // Seleccionar configuración base
        console.log("🎯 Seleccionando configuración:", config.configuracionId);
        const resultado = await asignarConfiguracionBase(config.configuracionId);
        
        if (resultado && resultado.success) {
          showSuccess("Configuración asignada correctamente");
          
          // Esperar un momento para que el backend procese
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const result = await cargarLayout();
          if (result && result.success) {
            elementosCargados = result.data?.layout?.elementos || [];
            console.log("📋 Elementos cargados tras asignación:", elementosCargados.length, elementosCargados);
            setAllElements(elementosCargados);
            setNombreSalon(result.data?.layout?.configuracion_lugar_base_nombre || "");
            setContadores(calcularContadoresDesdeElementos(elementosCargados));
            setLayoutGuardado(false);
            setLayoutFinal(null);
            setInvitados(getInvitadosIniciales());
          } else {
            showError("No se pudo cargar el layout asignado");
            return;
          }
        } else {
          showError(resultado?.error || "Error al asignar configuración");
          return;
        }
      } else if (config.modo === "personalizar") {
        // Personalizar el layout actual
        console.log("✏️ Modo personalizar");
        const result = await cargarLayout();
        console.log("🔍 Resultado de cargarLayout():", result);
        
        if (result && result.success) {
          elementosCargados = result.data?.layout?.elementos || [];
          console.log("📋 Elementos cargados para personalizar:", elementosCargados.length);
          console.log("📦 Estructura completa del layout:", result.data?.layout);
          console.log("🎨 Elementos individuales:", elementosCargados);
          
          setAllElements(elementosCargados);
          setContadores(calcularContadoresDesdeElementos(elementosCargados));
          setNombreSalon(result.data?.layout?.configuracion_lugar_base_nombre || "");
          setLayoutGuardado(false);
          setLayoutFinal(null);
          setInvitados(getInvitadosIniciales());
        } else {
          console.error("❌ Error al cargar layout:", result);
          showError("No se pudo cargar el layout para personalizar");
          return;
        }
      } else if (config.modo === "reseleccionar") {
        // Volver a seleccionar (se maneja desde el modal)
        console.log("🔄 Modo reseleccionar - volviendo al modal");
        setTieneLayoutAsignado(false);
        return; // No cerrar el modal aún
      }

      setShowModalInicio(false);
      console.log("✅ Modal cerrado, configuración guardada. Elementos finales:", elementosCargados.length);
    } catch (error) {
      console.error("❌ Error al iniciar asignación:", error);
      showError(error.message || "Error al iniciar la asignación");
    }
  };

  const handleGuardarLayout = async (elementos, metadata) => {
    try {
      if (!elementos || !Array.isArray(elementos)) {
        console.error("❌ Elementos inválidos:", elementos);
        showError("No hay elementos para guardar");
        return;
      }

      console.log("💾 Guardando layout personalizado:", elementos.length, "elementos");
      console.log("📦 Metadata:", metadata);
      
      const resultado = await guardarLayoutPersonalizado(elementos, metadata);
      
      if (resultado && resultado.success) {
        showSuccess("Layout guardado correctamente");
        setLayoutGuardado(true);
        setLayoutFinal({ elementos, metadata });
      } else {
        showError(resultado?.error || "Error al guardar el layout");
      }
    } catch (error) {
      console.error("❌ Error al guardar layout:", error);
      showError(error.message || "Error al guardar el layout");
    }
  };

  // Obtener información del evento actual
  const direccionEvento = eventoActual?.lugar?.direccion || "Dirección no especificada";

  if (showModalInicio) {
    console.log("🎭 Renderizando modal con configuraciones:", configuraciones);
    console.log("📍 Estado modal - tieneLayoutAsignado:", tieneLayoutAsignado, "isLoading:", isLoadingModal || loadingLayouts);
    
    return (
      <ModalInicioAsignacion
        isOpen={showModalInicio}
        onClose={handleCloseModal}
        direccionEvento={direccionEvento}
        configuraciones={configuraciones}
        tieneLayoutAsignado={tieneLayoutAsignado}
        layoutActual={layoutActual}
        isLoading={isLoadingModal || loadingLayouts}
        onIniciar={handleIniciarAsignacion}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white rounded-3xl dark:bg-[#2a2a2a]">
      {configuracion?.modo === "monitor" ? (
        <DistribuccionMonitor
          allElements={allElements}
          setAllElements={setAllElements}
          salon={layoutFinal}
          invitados={invitados}
          setInvitados={setInvitados}
        />
      ) : (
        <DistribuccionEditor
          allElements={allElements}
          setAllElements={setAllElements}
          contadores={contadores}
          setContadores={setContadores}
          layoutGuardado={layoutGuardado}
          setLayoutGuardado={setLayoutGuardado}
          layoutFinal={layoutFinal}
          setLayoutFinal={setLayoutFinal}
          invitados={invitados}
          setInvitados={setInvitados}
          onGuardarLayout={handleGuardarLayout}
          esLugar={false}
          nombreSalon={nombreSalon}
        />
      )}
    </div>
  );
}
