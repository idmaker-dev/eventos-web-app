import React, { useState, useEffect } from "react";
import DistribuccionAdmin from "../components/Distribuccion/DistribuccionAdmin.jsx";
import ModalInicioAsignacion from "../components/Distribuccion/ModalInicioAsignacion.jsx";
import { useSelectedEvent } from "../contexts/SelectedEventContext.jsx";
import DistribuccionEditor from "../components/Distribuccion/DistribuccionEditor.jsx";
import DistribuccionMonitor from "../components/Distribuccion/DistribuccionMonitor.jsx";
import { useNavigate, useLocation } from "react-router-dom";

export default function Asignacion() {
  const { eventoActual } = useSelectedEvent();
  const navigate = useNavigate();
  const location = useLocation();
  const skipModal = location.state?.skipModal;

  const [showModalInicio, setShowModalInicio] = useState(!skipModal);
  const [configuracion, setConfiguracion] = useState(null);

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
  });

  const handleCloseModal = () => {
    navigate(-1);
  };

  const [invitados, setInvitados] = useState(getInvitadosIniciales());

  // Datos mock de salones existentes por evento
  const getSalonesExistentes = (evento) => {
    console.log("🔍 Buscando salones para evento:", evento?.nombre_evento);
    
    // Verificar si es el evento de prueba
    if (evento?.nombre_evento === "EVENTO DE PRUEBA") {
      return [
          {
          id: "salon-1",
          nombre: "Configuración Poliforum Principal",
          descripcion: "Layout tradicional con mesas redondas",
          totalMesas: 12,
          direccion: "Tuxtla gutierrez",
          elementos: [
            {
              id: "mesa-1",
              type: "mesa",
              numero: 1,
              invitados: 0,
              capacidad: 8,
              position: { x: 100, y: 100 },
            },
            {
              id: "mesa-2",
              type: "mesa",
              numero: 2,
              invitados: 0,
              capacidad: 8,
              position: { x: 200, y: 100 },
            },
            {
              id: "mesa-3",
              type: "mesa",
              numero: 3,
              invitados: 0,
              capacidad: 8,
              position: { x: 300, y: 100 },
            },
            {
              id: "mesa-4",
              type: "mesa",
              numero: 4,
              invitados: 0,
              capacidad: 8,
              position: { x: 400, y: 100 },
            },
            {
              id: "mesa-5",
              type: "mesa",
              numero: 5,
              invitados: 0,
              capacidad: 8,
              position: { x: 100, y: 200 },
            },
            {
              id: "mesa-6",
              type: "mesa",
              numero: 6,
              invitados: 0,
              capacidad: 8,
              position: { x: 200, y: 200 },
            },
            {
              id: "mesa-7",
              type: "mesa",
              numero: 7,
              invitados: 0,
              capacidad: 8,
              position: { x: 300, y: 200 },
            },
            {
              id: "mesa-8",
              type: "mesa",
              numero: 8,
              invitados: 0,
              capacidad: 8,
              position: { x: 400, y: 200 },
            },
            {
              id: "mesa-9",
              type: "mesa",
              numero: 9,
              invitados: 0,
              capacidad: 8,
              position: { x: 100, y: 300 },
            },
            {
              id: "mesa-10",
              type: "mesa",
              numero: 10,
              invitados: 0,
              capacidad: 8,
              position: { x: 200, y: 300 },
            },
            {
              id: "mesa-11",
              type: "mesa",
              numero: 11,
              invitados: 0,
              capacidad: 8,
              position: { x: 300, y: 300 },
            },
            {
              id: "mesa-12",
              type: "mesa",
              numero: 12,
              invitados: 0,
              capacidad: 8,
              position: { x: 400, y: 300 },
            },
            { id: "entrada-1", type: "entrada", position: { x: 50, y: 150 } },
            { id: "barra-1", type: "barra", position: { x: 50, y: 250 } },
            {
              id: "mesa-principal",
              type: "mesa-principal",
              position: { x: 250, y: 50 },
            },
            {
              id: "pista-redonda-1",
              type: "pistaBaileRedonda",
              position: { x: 250, y: 250 },
            },
            {
              id: "escenario-1",
              type: "escenario",
              position: { x: 450, y: 150 },
            },
            { id: "buffet-1", type: "buffet", position: { x: 450, y: 250 } },
          ],
        },
        {
          id: "salon-2",
          nombre: "Configuración Graduación Poliforum",
          descripcion: "Layout con mesas rectangulares y escenario central",
          totalMesas: 8,
          direccion: "Tuxtla gutierrez",
          elementos: [
            {
              id: "mesa-rect-1",
              type: "mesaRectangular",
              numero: 1,
              invitados: 0,
              capacidad: 10,
              position: { x: 80, y: 80 },
            },
            {
              id: "mesa-rect-2",
              type: "mesaRectangular",
              numero: 2,
              invitados: 0,
              capacidad: 10,
              position: { x: 300, y: 80 },
            },
            {
              id: "mesa-rect-3",
              type: "mesaRectangular",
              numero: 3,
              invitados: 0,
              capacidad: 10,
              position: { x: 80, y: 200 },
            },
            {
              id: "mesa-rect-4",
              type: "mesaRectangular",
              numero: 4,
              invitados: 0,
              capacidad: 10,
              position: { x: 300, y: 200 },
            },
            {
              id: "mesa-rect-5",
              type: "mesaRectangular",
              numero: 5,
              invitados: 0,
              capacidad: 10,
              position: { x: 80, y: 320 },
            },
            {
              id: "mesa-rect-6",
              type: "mesaRectangular",
              numero: 6,
              invitados: 0,
              capacidad: 10,
              position: { x: 300, y: 320 },
            },
            {
              id: "mesa-rect-7",
              type: "mesaRectangular",
              numero: 7,
              invitados: 0,
              capacidad: 10,
              position: { x: 80, y: 440 },
            },
            {
              id: "mesa-rect-8",
              type: "mesaRectangular",
              numero: 8,
              invitados: 0,
              capacidad: 10,
              position: { x: 300, y: 440 },
            },
            {
              id: "mesa-principal",
              type: "mesa-principal",
              position: { x: 190, y: 40 },
            },
            {
              id: "escenario-central",
              type: "escenario",
              position: { x: 190, y: 260 },
            },
            { id: "buffet-1", type: "buffet", position: { x: 450, y: 200 } },
            { id: "barra-1", type: "barra", position: { x: 20, y: 200 } },
          ],
        },
      ];
    }

    // Buscar por dirección para otros eventos
    const direccion = evento?.lugar?.direccion;
    const salonesDisponibles = {
      

      "Jardín Romántico, Calle Principal 123": [
        {
          id: "salon-1",
          nombre: "Configuración Boda Clásica",
          descripcion: "Layout tradicional con mesas redondas",
          totalMesas: 8,
          direccion: "Jardín Romántico, Calle Principal 123",
          elementos: [
            {
              id: "mesa-1",
              type: "mesa",
              numero: 1,
              invitados: 0,
              capacidad: 8,
              position: { x: 50, y: 50 },
            },
            {
              id: "mesa-2",
              type: "mesa",
              numero: 2,
              invitados: 0,
              capacidad: 8,
              position: { x: 50, y: 150 },
            },
            {
              id: "mesa-principal",
              type: "mesa-principal",
              position: { x: 350, y: 50 },
            },
          ],
        },
        {
          id: "salon-2",
          nombre: "Configuración Graduación",
          descripcion: "Layout con mesas rectangulares y escenario central",
          totalMesas: 6,
          direccion: "Jardín Romántico, Calle Principal 123",
          elementos: [
            // ... elementos diferentes
          ],
        },
      ],
    };

    // console.log("🏛️ Salones encontrados por dirección:", salonesDisponibles[direccion]?.length || 0);
    return salonesDisponibles[direccion] || [];
  };

  // Elementos iniciales para salón vacío
  const elementosVacios = [
    {
      id: "mesa-principal",
      type: "mesa-principal",
      position: { x: 250, y: 50 },
    },
  ];

  const handleIniciarAsignacion = (config) => {
    // console.log("🚀 Configuración recibida:", config);
    setConfiguracion(config);

    if (config.modo === "monitor") {
      const salon = config.salon;
      // console.log("📺 Modo monitor - Salon:", salon);
      setAllElements(salon.elementos || []);
      setLayoutGuardado(true);
      setLayoutFinal(salon);
    } else if (config.modo === "crear") {
      if (config.tipoCreacion === "vacio") {
        // console.log("🏗️ Creando salón vacío - Solo mesa principal");
        localStorage.removeItem("layoutSalon");
        setAllElements([...elementosVacios]);
        // console.log(
        //   "📋 Elementos cargados (vacío):",
        //   elementosVacios.length,
        //   "elementos"
        // );
        setInvitados(getInvitadosIniciales());
        setContadores({
          mesa: 0,
          mesaRectangular: 0,
          barra: 0,
          buffet: 0,
          escenario: 0,
          entrada: 0,
        });
        setLayoutGuardado(false);
        setLayoutFinal(null);
      } else if (config.tipoCreacion === "basado") {
        const salonBase = config.salonBase;
        // console.log("📋 Usando salón como base:", salonBase.nombre);
        const elementosLimpios = salonBase.elementos.map((elemento) => {
          if (elemento.type === "mesa" || elemento.type === "mesaRectangular") {
            return {
              ...elemento,
              invitados: 0,
              invitadosEspeciales: 0,
              assignedGuests: [],
            };
          }
          return elemento;
        });
        setAllElements([...elementosLimpios]);
        // console.log("📋 Elementos cargados (base):", elementosLimpios.length, "elementos");
        setInvitados(getInvitadosIniciales());
        const contadoresCalculados = calcularContadores(elementosLimpios);
        setContadores(contadoresCalculados);
        setLayoutGuardado(false);
        setLayoutFinal(null);
      }
    }

    setShowModalInicio(false);
    // console.log("✅ Modal cerrado, configuración guardada");
  };

  const calcularContadores = (elementos) => {
    const contadores = {
      mesa: 0,
      mesaRectangular: 0,
      barra: 0,
      buffet: 0,
      escenario: 0,
      entrada: 0,
    };

    elementos.forEach((elemento) => {
      if (elemento.type === "mesa") {
        contadores.mesa = Math.max(contadores.mesa, elemento.numero || 0);
      } else if (elemento.type === "mesaRectangular") {
        contadores.mesaRectangular = Math.max(
          contadores.mesaRectangular,
          elemento.numero || 0
        );
      } else if (contadores.hasOwnProperty(elemento.type)) {
        contadores[elemento.type]++;
      }
    });

    return contadores;
  };

  // Cargar layout guardado al iniciar (solo si no se mostró el modal)
  useEffect(() => {
    if (!showModalInicio && !configuracion) {
      const layoutGuardadoLocal = localStorage.getItem("layoutSalon");
      if (layoutGuardadoLocal) {
        try {
          const layout = JSON.parse(layoutGuardadoLocal);
          setLayoutFinal(layout);
          setLayoutGuardado(true);
          setAllElements(layout.elementos || []);
          setContadores(layout.contadores || contadores);
          // console.log("💾 Layout cargado desde localStorage");
        } catch (error) {
          console.error("Error al cargar layout guardado:", error);
        }
      } else {
        console.log(" No hay layout guardado en localStorage");
      }
    } else {
      console.log("No cargando localStorage - Modal activo o configuración existente");
    }
  }, [showModalInicio, configuracion]);

  // Obtener información del evento actual
  const direccionEvento = eventoActual?.lugar?.direccion || "Dirección no especificada";

  
  const salonesExistentes = getSalonesExistentes(eventoActual);

  if (showModalInicio) {
    return (
      <ModalInicioAsignacion
        isOpen={showModalInicio}
        onClose={handleCloseModal}
        direccionEvento={direccionEvento}
        salonesExistentes={salonesExistentes}
        onIniciar={handleIniciarAsignacion}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white rounded-3xl dark:bg-[#2a2a2a]">
        {/* <DistribuccionAdmin
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
        configuracionInicial={configuracion}
      /> */}
      {configuracion?.modo === "monitor" ? (
        <DistribuccionMonitor
          allElements={allElements}
          setAllElements={setAllElements}
          salon={configuracion.salon}
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
        />
      )}
    </div>
  );
}