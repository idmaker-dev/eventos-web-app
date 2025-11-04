import React, { useState, useEffect } from "react";
import Navbar from "../components/AsiganacionUser/Navbar";
import AsignacionUser from "../components/AsiganacionUser/AsiganacionUser";
import ModalBienvenida from "../components/AsiganacionUser/ModalBienvenida";
import ModalEspera from "../components/AsiganacionUser/ModalEspera";

export default function AsignacionUserPage() {
  // Estados principales
  const [estadoSistema, setEstadoSistema] = useState('verificando'); // 'verificando', 'espera', 'activo', 'completado'
  const [temporizadorActivo, setTemporizadorActivo] = useState(false);
  
  // Configuración del usuario (normalmente viene de API/contexto)
  const usuarioConfig = {
    id: "user-001",
    nombre: "María González",
    horario: {
      inicio: "09:45", // Cambiar por tiempo que quieras probar
      fin: "12:50",
      duracionMinutos: 5
    }
  };

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