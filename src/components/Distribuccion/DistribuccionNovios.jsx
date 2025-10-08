import React from 'react';
import Mesa from "./Mesa.jsx";
import MesaRectangular from "./MesaRectangular.jsx";
import { TriangleAlert, Save } from 'lucide-react';
import { Button } from '@headlessui/react';

export default function DistribuccionNovios({ 
  allElements = [], 
  setAllElements, 
  invitados = [], 
  layoutGuardado, 
  layoutFinal 
}) {
  
  const [activeInvitado, setActiveInvitado] = React.useState(null);
  const [invitadosSinAsignar, setInvitadosSinAsignar] = React.useState(invitados);
  const [showModal, setShowModal] = React.useState(false);
  const [modalData, setModalData] = React.useState(null);
  
  // NUEVOS ESTADOS para las funcionalidades
  const [autoAsignando, setAutoAsignando] = React.useState(false);
  const [guardando, setGuardando] = React.useState(false);
  const [distribucionesGuardadas, setDistribucionesGuardadas] = React.useState([]);

  // Cargar distribuciones guardadas del localStorage al inicio
  React.useEffect(() => {
    const distribucionesLS = localStorage.getItem('distribucionesGuardadas');
    if (distribucionesLS) {
      setDistribucionesGuardadas(JSON.parse(distribucionesLS));
    }
  }, []);

  // FUNCIÓN DE AUTO-ASIGNACIÓN INTELIGENTE
  const autoAsignarInvitados = async () => {
    if (invitadosSinAsignar.length === 0) {
      mostrarNotificacion('No hay invitados sin asignar', 'info');
      return;
    }

    setAutoAsignando(true);
    mostrarNotificacion('Iniciando asignación automática inteligente...', 'info');

    // Crear una copia de los elementos para trabajar
    let elementosTemp = [...allElements];
    let invitadosTemp = [...invitadosSinAsignar];
    let asignacionesRealizadas = [];

    // Algoritmo de asignación inteligente
    for (let i = 0; i < invitadosTemp.length; i++) {
      const invitado = invitadosTemp[i];
      
      // Buscar la mesa más adecuada (con espacio exacto o cercano)
      const mesasDisponibles = elementosTemp
        .filter(el => (el.type === 'mesa' || el.type === 'mesaRectangular'))
        .filter(el => el.capacidad - el.invitados >= invitado.cantidad)
        .sort((a, b) => {
          // Priorizar mesas con espacio más cercano a la cantidad necesaria
          const espacioA = a.capacidad - a.invitados;
          const espacioB = b.capacidad - b.invitados;
          const diferenciaA = Math.abs(espacioA - invitado.cantidad);
          const diferenciaB = Math.abs(espacioB - invitado.cantidad);
          return diferenciaA - diferenciaB;
        });

      if (mesasDisponibles.length > 0) {
        const mejorMesa = mesasDisponibles[0];
        
        // Asignar a la mejor mesa encontrada
        elementosTemp = elementosTemp.map(element => 
          element.numero === mejorMesa.numero && (element.type === 'mesa' || element.type === 'mesaRectangular')
            ? { ...element, invitados: element.invitados + invitado.cantidad }
            : element
        );

        asignacionesRealizadas.push({
          invitado: invitado.nombre,
          cantidad: invitado.cantidad,
          mesa: mejorMesa.numero
        });

        // Remover invitado de la lista temporal
        invitadosTemp = invitadosTemp.filter(inv => inv.id !== invitado.id);
      }

      // Simular delay para mostrar progreso
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Aplicar los cambios finales
    setAllElements(elementosTemp);
    setInvitadosSinAsignar(invitadosTemp);
    setAutoAsignando(false);

    // Mostrar resultado
    if (asignacionesRealizadas.length > 0) {
      const totalPersonasAsignadas = asignacionesRealizadas.reduce((total, a) => total + a.cantidad, 0);
      mostrarNotificacion(
        `Auto-asignación completada!\n` +
        `• ${asignacionesRealizadas.length} grupos asignados\n` +
        `• ${totalPersonasAsignadas} personas ubicadas\n` +
        `• ${invitadosTemp.length} grupos restantes`,
        'success'
      );
    } else {
      mostrarNotificacion('No se pudieron asignar más invitados automáticamente', 'warning');
    }
  };

  // FUNCIÓN PARA GUARDAR DISTRIBUCIÓN
  const guardarDistribucion = () => {
    setGuardando(true);

    // Crear objeto de distribución
    const nuevaDistribucion = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      fechaFormateada: new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      elementos: [...allElements],
      invitadosSinAsignar: [...invitadosSinAsignar],
      estadisticas: {
        totalInvitadosAsignados: allElements
          .filter(el => el.type === 'mesa' || el.type === 'mesaRectangular')
          .reduce((total, mesa) => total + (mesa.invitados || 0), 0),
        totalCapacidad: allElements
          .filter(el => el.type === 'mesa' || el.type === 'mesaRectangular')
          .reduce((total, mesa) => total + (mesa.capacidad || 0), 0),
        mesasOcupadas: allElements
          .filter(el => (el.type === 'mesa' || el.type === 'mesaRectangular') && el.invitados > 0)
          .length,
        totalMesas: allElements
          .filter(el => el.type === 'mesa' || el.type === 'mesaRectangular')
          .length,
        porcentajeOcupacion: Math.round((
          allElements
            .filter(el => el.type === 'mesa' || el.type === 'mesaRectangular')
            .reduce((total, mesa) => total + (mesa.invitados || 0), 0) /
          Math.max(1, allElements
            .filter(el => el.type === 'mesa' || el.type === 'mesaRectangular')
            .reduce((total, mesa) => total + (mesa.capacidad || 0), 0))
        ) * 100)
      },
      nombre: `Distribución ${new Date().toLocaleDateString('es-ES')}`
    };

    // Guardar en la lista local
    const nuevasDistribuciones = [...distribucionesGuardadas, nuevaDistribucion];
    setDistribucionesGuardadas(nuevasDistribuciones);

    // Guardar en localStorage
    localStorage.setItem('distribucionesGuardadas', JSON.stringify(nuevasDistribuciones));
    localStorage.setItem('ultimaDistribucion', JSON.stringify(nuevaDistribucion));

    setTimeout(() => {
      setGuardando(false);
      mostrarNotificacion(
        `Distribución guardada exitosamente!\n` +
        `• Fecha: ${nuevaDistribucion.fechaFormateada}\n` +
        `• ${nuevaDistribucion.estadisticas.totalInvitadosAsignados}/${nuevaDistribucion.estadisticas.totalCapacidad} invitados asignados\n` +
        `• ${nuevaDistribucion.estadisticas.porcentajeOcupacion}% de ocupación`,
        'success'
      );
    }, 1000);
  };

  // Función para mostrar lista de distribuciones guardadas
  const mostrarDistribucionesGuardadas = () => {
    if (distribucionesGuardadas.length === 0) {
      mostrarNotificacion('No hay distribuciones guardadas', 'info');
      return;
    }

    const listaDistribuciones = distribucionesGuardadas
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 5)
      .map((dist, index) => 
        `${index + 1}. ${dist.fechaFormateada} - ${dist.estadisticas.porcentajeOcupacion}% ocupación`
      ).join('\n');

    mostrarNotificacion(
      `Últimas 5 distribuciones guardadas:\n\n${listaDistribuciones}`,
      'info'
    );
  };

  // Función para verificar si hay mesa con capacidad disponible
  const encontrarMesaDisponible = (cantidadPersonas) => {
    return allElements.find(element => 
      (element.type === 'mesa' || element.type === 'mesaRectangular') &&
      (element.capacidad - element.invitados) >= cantidadPersonas
    );
  };

  // Función principal para asignar invitados a mesa
  const asignarInvitadosMesa = (numeroMesa, datosInvitado) => {
    const mesaSeleccionada = allElements.find(element => 
      element.numero === numeroMesa && (element.type === 'mesa' || element.type === 'mesaRectangular')
    );

    if (!mesaSeleccionada) return;

    const espacioDisponible = mesaSeleccionada.capacidad - mesaSeleccionada.invitados;
    const cantidadInvitados = datosInvitado.cantidad;

    // Caso 1: Caben todos perfectamente
    if (espacioDisponible >= cantidadInvitados) {
      setAllElements(prev => prev.map(element => 
        element.numero === numeroMesa && (element.type === 'mesa' || element.type === 'mesaRectangular')
          ? { ...element, invitados: element.invitados + cantidadInvitados }
          : element
      ));

      setInvitadosSinAsignar(prev => prev.filter(inv => inv.id !== datosInvitado.id));
      mostrarNotificacion(`${datosInvitado.nombre} asignado correctamente a la Mesa ${numeroMesa}`, 'success');
      return;
    }

    // Caso 2: No caben todos - mostrar modal de confirmación
    if (espacioDisponible > 0) {
      setModalData({
        invitado: datosInvitado,
        mesa: mesaSeleccionada,
        espacioDisponible,
        cantidadInvitados,
        personasSobrantes: cantidadInvitados - espacioDisponible
      });
      setShowModal(true);
    } else {
      // Caso 3: Mesa llena - buscar alternativa automáticamente
      const mesaAlternativa = encontrarMesaDisponible(cantidadInvitados);
      
      if (mesaAlternativa) {
        setAllElements(prev => prev.map(element => 
          element.numero === mesaAlternativa.numero && (element.type === 'mesa' || element.type === 'mesaRectangular')
            ? { ...element, invitados: element.invitados + cantidadInvitados }
            : element
        ));
        
        setInvitadosSinAsignar(prev => prev.filter(inv => inv.id !== datosInvitado.id));
        
        mostrarNotificacion(
          `Mesa ${numeroMesa} estaba llena. ${datosInvitado.nombre} asignado automáticamente a Mesa ${mesaAlternativa.numero}`, 
          'success'
        );
      } else {
        mostrarNotificacion(`La Mesa ${numeroMesa} está llena y no hay mesas disponibles para ${cantidadInvitados} personas`, 'error');
      }
    }
  };

  // Función para confirmar asignación parcial
  const confirmarAsignacionParcial = (aceptar) => {
    if (!modalData) return;

    const { invitado, mesa, espacioDisponible, personasSobrantes } = modalData;

    if (aceptar) {
      setAllElements(prev => prev.map(element => 
        element.numero === mesa.numero && (element.type === 'mesa' || element.type === 'mesaRectangular')
          ? { ...element, invitados: element.invitados + espacioDisponible }
          : element
      ));

      setInvitadosSinAsignar(prev => prev.filter(inv => inv.id !== invitado.id));

      const personasSobrantes_grupo = {
        ...invitado,
        id: Date.now(),
        nombre: `${invitado.nombre} (${personasSobrantes} restantes)`,
        cantidad: personasSobrantes
      };

      const mesaParaSobrantes = allElements.find(element => 
        (element.type === 'mesa' || element.type === 'mesaRectangular') &&
        element.numero !== mesa.numero && 
        (element.capacidad - element.invitados) >= personasSobrantes
      );
      
      if (mesaParaSobrantes) {
        setAllElements(prev => prev.map(element => 
          element.numero === mesaParaSobrantes.numero && (element.type === 'mesa' || element.type === 'mesaRectangular')
            ? { ...element, invitados: element.invitados + personasSobrantes }
            : element
        ));
        
        mostrarNotificacion(
          `Distribución exitosa:\n• ${espacioDisponible} personas → Mesa ${mesa.numero}\n• ${personasSobrantes} personas → Mesa ${mesaParaSobrantes.numero}`, 
          'success'
        );
      } else {
        setInvitadosSinAsignar(prev => [...prev, personasSobrantes_grupo]);
        mostrarNotificacion(
          `Asignación parcial completada:\n• ${espacioDisponible} personas → Mesa ${mesa.numero}\n• ${personasSobrantes} personas regresaron a la lista (sin mesas disponibles)`, 
          'warning'
        );
      }
    } else {
      mostrarNotificacion(`${invitado.nombre} permaneció en la lista. Busque una mesa con más capacidad`, 'info');
    }

    setShowModal(false);
    setModalData(null);
  };

  // Función para mostrar notificaciones
  const mostrarNotificacion = (mensaje, tipo) => {
    const colores = {
      success: 'bg-green-100 border-green-400 text-green-700',
      error: 'bg-red-100 border-red-400 text-red-700',
      warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
      info: 'bg-blue-100 border-blue-400 text-blue-700'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-3 rounded border-l-4 ${colores[tipo]} z-50 max-w-md shadow-lg`;
    notification.style.whiteSpace = 'pre-line';
    notification.textContent = mensaje;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
  };

  // Componente para invitados arrastrable
  const InvitadoDraggable = ({ invitado }) => {
    return (
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', JSON.stringify(invitado));
          setActiveInvitado(invitado);
        }}
        onDragEnd={() => setActiveInvitado(null)}
        className="flex justify-normal gap-3 items-center bg-white p-3 rounded-lg border-2 border-dashed border-gray-200 cursor-move hover:bg-gray-100 transition-colors hover:shadow-md"
      >
        <div className="font-medium text-gray-800">{invitado.nombre}</div>
        <div className="text-sm text-gray-600">({invitado.cantidad} personas)</div>
      </div>
    );
  };

  // Modal de confirmación
  const ModalConfirmacion = () => {
    if (!showModal || !modalData) return null;

    const { invitado, mesa, espacioDisponible, personasSobrantes } = modalData;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-lg mx-4 shadow-xl">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TriangleAlert className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Mesa con Capacidad Limitada</h3>
          </div>
          
          <div className="text-sm text-gray-600 space-y-2 mb-6">
            <p><strong>Invitado:</strong> {invitado.nombre}</p>
            <p><strong>Cantidad a asignar:</strong> {invitado.cantidad} personas</p>
            <p><strong>Mesa seleccionada:</strong> Mesa {mesa.numero}</p>
            <p><strong>Capacidad total:</strong> {mesa.capacidad} asientos</p>
            <p><strong>Ya ocupada:</strong> {mesa.invitados} asientos</p>
            <p className="text-green-600"><strong>Espacios disponibles:</strong> {espacioDisponible} asientos</p>
            <p className="text-red-600"><strong>Personas que no caben:</strong> {personasSobrantes}</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>¿Qué deseas hacer?</strong><br/>
              <br/>
              <strong>SÍ:</strong> Asignar {espacioDisponible} personas a la Mesa {mesa.numero}. 
              Las {personasSobrantes} personas restantes buscarán <u>OTRA MESA DIFERENTE</u> automáticamente.<br/>
              <br/>
              <strong>NO:</strong> Mantener todo el grupo junto en la lista para buscar otra mesa completa.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => confirmarAsignacionParcial(true)}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Sí, Dividir y Redistribuir
            </button>
            <button
              onClick={() => confirmarAsignacionParcial(false)}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              No, Mantener Junto
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Componentes estáticos para mesas
  const MesaEstatica = ({ element }) => (
    <div className="pointer-events-auto">
      <Mesa
        numeroMesa={element.numero}
        invitadosAsignados={element.invitados}
        capacidadMaxima={element.capacidad}
        onDrop={asignarInvitadosMesa}
      />
    </div>
  );

  const MesaRectangularEstatica = ({ element }) => (
    <div className="pointer-events-auto">
      <MesaRectangular
        numeroMesa={element.numero}
        invitadosAsignados={element.invitados}
        capacidadMaxima={element.capacidad}
        onDrop={asignarInvitadosMesa}
      />
    </div>
  );

  const renderElementoEstatico = (element) => {
    if (element.type === 'mesa') {
      return <MesaEstatica element={element} />;
    }

    if (element.type === 'mesaRectangular') {
      return <MesaRectangularEstatica element={element} />;
    }

    switch (element.type) {
      case 'entrada':
        return (
          <div className="rounded px-6 py-1 rotate-90 border flex items-center justify-center text-gray-600 font-semibold bg-gray-50 whitespace-nowrap pointer-events-none">
            Entrada
          </div>
        );
      case 'barra':
        return (
          <div className="border-2 border-separate border-dashed border-gray-300 w-24 h-24 flex items-center justify-center text-center p-2 rounded-md text-gray-500 font-semibold bg-white shadow pointer-events-none">
            Barra 
          </div>
        );
      case 'mesa-principal':
        return (
          <div className="rounded px-6 py-3 w-48 border-separate border-2 border-dashed text-center text-gray-600 font-semibold bg-gray-50 pointer-events-none">
            Mesa principal <br />
            <span className="text-gray-500 text-sm italic">Ana y Juan</span>
          </div>
        );
      case 'pista-baile':
        return (
          <div className="w-48 h-48 text-center border-orange-300 border-2 border-dashed flex items-center justify-center text-gray-600 font-semibold bg-orange-50 rounded-full pointer-events-none">
            <span className="text-orange-600 text-xl font-bold">Pista de <br /> Baile</span>
          </div>
        );
      case 'escenario':
        return (
          <div className="border-2 border-separate border-dashed border-gray-300 w-28 h-28 flex flex-col items-center justify-center text-center p-2 rounded-md text-gray-500 font-semibold bg-white shadow pointer-events-none">
            <p>ESCENARIO</p>
            <p className="text-xs mt-1">DJ Música</p>
          </div>
        );
      case 'buffet':
        return (
          <div className="border-2 border-separate border-dashed border-gray-300 w-28 h-20 flex items-center justify-center text-center p-2 rounded-md text-gray-500 font-semibold bg-white shadow pointer-events-none">
            BUFFET 
          </div>
        );
      default:
        return null;
    }
  };

  // Calcular estadísticas
  const totalPersonasSinAsignar = invitadosSinAsignar.reduce((total, inv) => total + inv.cantidad, 0);
  const mesas = allElements.filter(el => el.type === 'mesa' || el.type === 'mesaRectangular');
  const totalInvitadosAsignados = mesas.reduce((total, mesa) => total + (mesa.invitados || 0), 0);
  const totalCapacidad = mesas.reduce((total, mesa) => total + (mesa.capacidad || 0), 0);
  const mesasOcupadas = mesas.filter(mesa => mesa.invitados > 0).length;
  const totalMesas = mesas.length;
  const porcentajeCapacidadUtilizada = totalCapacidad > 0 
    ? Math.round((totalInvitadosAsignados / totalCapacidad) * 100) 
    : 0;

  return (
    <div className="min-h-screen">
      <div className="py-4">
        {/* BARRA DE HERRAMIENTAS MEJORADA */}
        <div className="mb-6 bg-gray-100 p-4 rounded-full shadow-sm">
          <div className="flex justify-between items-center">
            <div className='flex items-center gap-3'>
              <Button 
                onClick={mostrarDistribucionesGuardadas}
                className="bg-purple-600 text-white px-4 py-2 rounded-full font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                Layout del Salón
              </Button>
              
              <Button 
                onClick={autoAsignarInvitados}
                disabled={autoAsignando || invitadosSinAsignar.length === 0}
                className={`px-4 py-2 border rounded-full font-medium transition-colors flex items-center gap-2 ${
                  autoAsignando 
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300 cursor-not-allowed'
                    : invitadosSinAsignar.length === 0
                    ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {autoAsignando ? 'Asignando...' : 'Auto-Asignar'}
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              
                {/* onClick={guardarDistribucion} */}
              <Button 
                disabled={guardando}
                className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
                  guardando 
                    ? 'bg-green-400 text-white cursor-not-allowed'
                    : 'bg-lime-600 text-white hover:bg-lime-700'
                }`}
              >
                <Save className={`w-4 h-4 ${guardando ? 'animate-pulse' : ''}`} />
                {guardando ? 'Guardando...' : 'Guardar Distribución'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Lista de Invitados */}
          <div className="w-full xl:w-80 flex-shrink-0">
            <div className="bg-slate-50 py-6 px-3 rounded-lg shadow-sm">
              <p className="text-xl font-semibold mb-4 text-gray-700 flex items-center justify-between gap-2">
                Invitados sin Asignar
                <span className="text-sm text-gray-500 font-normal">({totalPersonasSinAsignar} personas)</span>
              </p>
              
              <div className="max-h-[32rem] overflow-y-auto">
                {invitadosSinAsignar.length > 0 ? (
                  <ul className="space-y-3">
                    {invitadosSinAsignar.map(invitado => (
                      <li key={invitado.id}>
                        <InvitadoDraggable invitado={invitado} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🎉</div>
                    <p className="font-medium">¡Todos los invitados asignados!</p>
                    <p className="text-sm">Perfecta distribución</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  Arrastra los invitados a las mesas del plano para asignar lugares.
                </p>
              </div>
            </div>
          </div>

          {/* Plano del Salón */}
          <div className="flex-1 min-w-0">
            <div className="border border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Plano del Salón - "Jardín Romántico"
                </h3>
                
              </div>
              
              <div className="overflow-x-auto overflow-y-auto">
                <div 
                  className="relative bg-gradient-to-br from-pink-25 to-blue-25" 
                  style={{ 
                    height: '600px',
                    minWidth: '1600px',
                    width: '1600px'
                  }}
                >
                  {allElements.map((element) => (
                    <div
                      key={element.id}
                      className="absolute"
                      style={{
                        left: `${element.position?.x || 0}px`,
                        top: `${element.position?.y || 0}px`,
                        cursor: (element.type === 'mesa' || element.type === 'mesaRectangular') ? 'default' : 'default',
                        userSelect: 'none'
                      }}
                    >
                      {renderElementoEstatico(element)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="mt-4 text-sm text-gray-700 bg-slate-100 px-4 py-3 rounded-lg border-gray-200 shadow-sm">
              <div className="flex items-center gap-6 text-center">
                <div>
                  <span className="font-medium text-gray-600">Invitados:</span>
                  <span className="ml-2 font-bold text-blue-600">
                    {totalInvitadosAsignados}/{totalCapacidad}
                  </span>
                  <span className="ml-2 font-medium text-gray-600">Asignados</span>
                </div>
                <div className="w-[0.2rem] h-4 bg-gray-300 rounded"></div>
                <div>
                  <span className="font-medium text-gray-600">Mesas Ocupadas:</span>
                  <span className="ml-2 font-bold text-amber-600">
                    {mesasOcupadas}/{totalMesas}   
                  </span>
                </div>
                <div className="w-[0.2rem] h-4 bg-gray-300 rounded"></div>
                <div>
                  <span className="font-medium text-gray-600">Capacidad utilizada:</span>
                  <span className={`ml-2 font-bold ${
                    porcentajeCapacidadUtilizada >= 90 ? 'text-red-600' :
                    porcentajeCapacidadUtilizada >= 70 ? 'text-orange-600' :
                    porcentajeCapacidadUtilizada >= 50 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {porcentajeCapacidadUtilizada}%
                  </span>
                </div>
                <div className="w-[0.2rem] h-4 bg-gray-300 rounded"></div>
                <div>
                  <span className="font-medium text-gray-600">Sin Asignar:</span>
                  <span className={`ml-2 font-bold ${
                    totalPersonasSinAsignar > 0 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {totalPersonasSinAsignar}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      <ModalConfirmacion />
    </div>
  );
}