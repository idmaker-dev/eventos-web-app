import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/AsiganacionUser/Navbar";
import AsignacionUser from "../components/AsiganacionUser/AsiganacionUser";
import AsignacionUserWrapper from "../components/AsiganacionUser/AsignacionUserWrapper";
import ModalBienvenida from "../components/AsiganacionUser/ModalBienvenida";
import ModalEspera from "../components/AsiganacionUser/ModalEspera";
import { AlertCircle } from "lucide-react";

export default function AsignacionUserPage() {
  // Obtener IDs de la URL
  const { eventoId, invitadoId } = useParams();
  
  // 🔧 CAMBIAR AQUÍ: true = usar sistema de turnos, false = usar sistema legacy
  const [usarSistemaTurnos] = useState(true);
  
  // Estados principales para sistema LEGACY
  const [estadoSistema, setEstadoSistema] = useState('verificando'); // 'verificando', 'espera', 'activo', 'completado'
  const [temporizadorActivo, setTemporizadorActivo] = useState(false);
  
  // Configuración del usuario (normalmente viene de API/contexto)
  const usuarioConfig = React.useMemo(() => ({
    id: "user-001",
    nombre: "María González",
    horario: {
      inicio: "09:45", // Cambiar por tiempo que quieras probar
      fin: "12:50",
      duracionMinutos: 5
    }
  }), []);

  useEffect(() => {
    const verificarHorario = () => {
      // NO verificar si está en temporizador o completado
      if (estadoSistema === 'temporizador' || estadoSistema === 'completado') {
        console.log('⏸️ Pausando verificación - Estado:', estadoSistema);
        return;
      }

      const ahora = new Date();
      const [h, m] = usuarioConfig.horario.inicio.split(':');
      const [hFin, mFin] = usuarioConfig.horario.fin.split(':');
      
      const inicio = new Date();
      inicio.setHours(parseInt(h), parseInt(m), 0, 0);
      
      const fin = new Date();
      fin.setHours(parseInt(hFin), parseInt(mFin), 0, 0);

      // Verificar si ya completó asignación
      const asignacionGuardada = localStorage.getItem(`asignacion-${usuarioConfig.id}`);
      if (asignacionGuardada) {
        setEstadoSistema('completado');
        return;
      }

      // Verificar horario
      if (ahora >= inicio && ahora <= fin) {
        console.log('✅ Horario ACTIVO');
        if (estadoSistema !== 'activo') {
          setEstadoSistema('activo');
        }
      } else {
        console.log('⏳ Horario EN ESPERA');
        if (estadoSistema !== 'espera') {
          setEstadoSistema('espera');
          setTemporizadorActivo(false);
        }
      }
    };

    verificarHorario();
    const interval = setInterval(verificarHorario, 1000);
    return () => clearInterval(interval);
  }, [estadoSistema, usuarioConfig]);

  // Manejar cambios de estado
  const manejarCambio = (nuevoEstado) => {
    console.log('🔄 Cambio de estado:', nuevoEstado);
    setEstadoSistema(nuevoEstado);
    
    if (nuevoEstado === 'temporizador') {
      setTemporizadorActivo(true);
    } else if (nuevoEstado === 'completado' || nuevoEstado === 'espera') {
      setTemporizadorActivo(false);
    }
  };

  // 🎯 Renderizado condicional según el sistema seleccionado
  if (usarSistemaTurnos) {
    // Validar que tenemos los datos necesarios y que tengan el formato correcto
    // IDs de Planoria tienen formato específico (longitud mínima esperada)
    const eventoIdValido = eventoId && eventoId.length >= 17; // mgqz71bfdm7pbvqmb tiene 17 caracteres
    const invitadoIdValido = invitadoId && invitadoId.length >= 17; // mgsc33fjarcm9xewd tiene 17 caracteres
    
    if (!eventoId || !invitadoId || !eventoIdValido || !invitadoIdValido) {
      return (
        <div className="bg-fondoVs min-h-screen">
          <Navbar usuario={{ nombre: 'Usuario' }} />
          <div className="min-h-screen flex items-center justify-center bg-fondoVs p-4">
            <div className="bg-white rounded-lg shadow-lg border-2 border-yellow-300 p-8 max-w-lg">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  URL Incorrecta o Incompleta
                </h3>
                
                <p className="text-gray-600 text-base mb-6">
                  La URL proporcionada es inválida o está incompleta.
                  <br />
                  <br />
                  Por favor, verifica que hayas copiado el enlace completo enviado por el organizador del evento.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Sugerencias:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 text-left space-y-1">
                    <li>• Asegúrate de copiar la URL completa</li>
                    <li>• Verifica que no falten caracteres al final del enlace</li>
                    <li>• Usa el enlace original enviado por el organizador</li>
                    <li>• No modifiques manualmente la URL</li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 font-mono break-all">
                    {!eventoId ? 'Falta ID del evento' : !eventoIdValido ? `ID de evento incompleto: ${eventoId}` : ''}
                    {(!eventoId || !eventoIdValido) && (!invitadoId || !invitadoIdValido) && ' | '}
                    {!invitadoId ? 'Falta ID del invitado' : !invitadoIdValido ? `ID de invitado incompleto: ${invitadoId}` : ''}
                  </p>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-casal text-white rounded-lg hover:bg-casal/90 transition-all font-medium"
                >
                  Recargar Página
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-fondoVs min-h-screen">
        {/* Sistema de TURNOS (nuevo) - obtiene layout del endpoint de disponibilidad */}
        <AsignacionUserWrapper
          invitadoId={invitadoId}
          eventoId={eventoId}
          onCambioEstado={manejarCambio}
        />
      </div>
    );
  }

  // Sistema LEGACY (anterior)
  return (
    <div className="bg-fondoVs">
      <Navbar />
      
      {/* Componente principal de asignación */}
      <AsignacionUser 
        temporizadorActivo={temporizadorActivo}
        usuario={usuarioConfig}
        onCambioEstado={manejarCambio}
      />
      
      {/* Modal de Espera */}
      <ModalEspera 
        open={estadoSistema === 'espera'}
        usuario={usuarioConfig}
        horario={usuarioConfig.horario}
      />
      
      {/* Modal de Bienvenida */}
      <ModalBienvenida 
        open={estadoSistema === 'activo'}
        onClose={() => manejarCambio('temporizador')}
        usuario={usuarioConfig}
        horario={usuarioConfig.horario}
      />
    </div>
  );
}