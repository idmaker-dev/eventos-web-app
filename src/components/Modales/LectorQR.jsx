import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  CircleX, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  User,
  Ticket,
  Clock,
  AlertCircle
} from "lucide-react";
import clsx from "clsx";
import { Html5Qrcode } from "html5-qrcode";
import "./LectorQR.css";

export default function LectorQR({ onClose, evento }) {
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [boletosConfirmar, setBoletosConfirmar] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [boletosRegistrados, setBoletosRegistrados] = useState({}); // usado via setBoletosRegistrados para sync UI con ref
  const html5QrCodeRef = useRef(null);
  const scannerIdRef = useRef("qr-reader");
  const lastScanTextRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const boletosRegistradosRef = useRef({}); // Ref sincronizado con el estado

  // Función para procesar el código QR escaneado (useCallback para estabilidad)
  const onScanSuccess = useCallback(async (decodedText, decodedResult) => {
    // Evitar escaneos duplicados - ignorar si es el mismo código en los últimos 2 segundos
    if (lastScanTextRef.current === decodedText) {
      console.log('⏭️ Ignorando escaneo duplicado:', decodedText);
      return;
    }

    console.log('✅ QR Code detectado:', decodedText, decodedResult);
    
    // Guardar el último código escaneado
    lastScanTextRef.current = decodedText;
    
    // Limpiar timeout anterior si existe
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    
    // Permitir escanear el mismo código después de 2 segundos
    scanTimeoutRef.current = setTimeout(() => {
      lastScanTextRef.current = null;
      console.log('🔄 Listo para escanear nuevamente');
    }, 2000);
    
    // Simular consulta a API para obtener información del invitado
    try {
      console.log('🔍 Consultando información del invitado con ID:', decodedText);
      
      // TODO: Reemplazar con llamada real a API
      // const response = await fetch(`/api/eventos/${evento?.id}/invitados/${decodedText}`);
      // const data = await response.json();
      
      // SIMULACIÓN: Generar datos mock basados en el ID del QR
      const mockInvitados = [
        { 
          id: 'INV001', 
          nombre: 'Juan Pérez García', 
          mesa: 5, 
          boletos: 2, 
          valido: true,
          restricciones: {
            vegetarianos: 1,
            alergicosMariscos: 0,
            celiaco: 0,
            alergicosLactosa: 0
          }
        },
        { 
          id: 'INV002', 
          nombre: 'María López Rodríguez', 
          mesa: 12, 
          boletos: 4, 
          valido: true,
          restricciones: {
            vegetarianos: 2,
            alergicosMariscos: 1,
            celiaco: 0,
            alergicosLactosa: 0
          }
        },
        { 
          id: 'INV003', 
          nombre: 'Carlos Hernández Sánchez', 
          mesa: 8, 
          boletos: 3, 
          valido: true,
          restricciones: {
            vegetarianos: 0,
            alergicosMariscos: 1,
            celiaco: 1,
            alergicosLactosa: 0
          }
        },
        { 
          id: 'INV004', 
          nombre: 'Ana Martínez González', 
          mesa: 15, 
          boletos: 2, 
          valido: true,
          restricciones: {
            vegetarianos: 0,
            alergicosMariscos: 0,
            celiaco: 0,
            alergicosLactosa: 1
          }
        },
        { 
          id: 'INV005', 
          nombre: 'Luis Ramírez Torres', 
          mesa: 3, 
          boletos: 5, 
          valido: true,
          restricciones: {
            vegetarianos: 1,
            alergicosMariscos: 0,
            celiaco: 1,
            alergicosLactosa: 1
          }
        },
        { 
          id: 'INVALID', 
          nombre: 'Invitación No Válida', 
          mesa: null, 
          boletos: 0, 
          valido: false,
          restricciones: {
            vegetarianos: 0,
            alergicosMariscos: 0,
            celiaco: 0,
            alergicosLactosa: 0
          }
        },
      ];
      
      // Buscar invitado por ID o simular uno aleatorio si no existe en la lista
      let invitadoData = mockInvitados.find(inv => inv.id === decodedText);
      
      if (!invitadoData) {
        // Simular invitado con datos generados del QR
        const randomMesa = Math.floor(Math.random() * 20) + 1;
        const randomBoletos = Math.floor(Math.random() * 5) + 1;
        
        // Generar restricciones aleatorias basadas en el número de boletos
        const restriccionesAleatorias = {
          vegetarianos: Math.floor(Math.random() * (randomBoletos + 1)),
          alergicosMariscos: Math.floor(Math.random() * (randomBoletos + 1)),
          celiaco: Math.floor(Math.random() * (randomBoletos + 1)),
          alergicosLactosa: Math.floor(Math.random() * (randomBoletos + 1))
        };
        
        invitadoData = {
          id: decodedText,
          nombre: `Graduado ${decodedText.substring(0, 6)}`,
          mesa: randomMesa,
          boletos: randomBoletos,
          valido: true,
          restricciones: restriccionesAleatorias
        };
      }
      
      console.log('✅ Información del graduado encontrada:', invitadoData);
      
      // Calcular boletos restantes (total - ya usados)
      const boletosYaUsados = boletosRegistradosRef.current[invitadoData.id] || 0;
      const boletosRestantes = invitadoData.boletos - boletosYaUsados;
      
      console.log(`📊 Estado de boletos para ${invitadoData.id}:`, {
        total: invitadoData.boletos,
        yaUsados: boletosYaUsados,
        restantes: boletosRestantes,
        registrados: boletosRegistradosRef.current
      });
      
      if (boletosRestantes <= 0) {
        // No quedan boletos disponibles
        console.warn('⚠️ No quedan boletos disponibles para este graduado');
        
        const scanData = {
          id: `QR-${Date.now()}`,
          timestamp: new Date().toISOString(),
          invitadoId: invitadoData.id,
          invitado: invitadoData.nombre,
          mesa: invitadoData.mesa,
          boletos: 0,
          boletosTotal: invitadoData.boletos,
          boletosUsados: boletosYaUsados,
          restricciones: invitadoData.restricciones || {
            vegetarianos: 0,
            alergicosMariscos: 0,
            celiaco: 0,
            alergicosLactosa: 0
          },
          valido: false,
          evento: evento?.nombre_evento || 'Evento',
          error: 'Todos los boletos ya fueron utilizados'
        };
        
        setLastScan(scanData);
        setScanHistory(prev => [scanData, ...prev].slice(0, 10));
        return;
      }
      
      // Mostrar modal de confirmación con boletos restantes
      console.log(`📋 Solicitando confirmación: ${boletosRestantes} boleto(s) disponible(s)`);
      
      setPendingConfirmation({
        invitadoData: invitadoData,
        boletosRestantes: boletosRestantes,
        boletosYaUsados: boletosYaUsados
      });
      
      // Establecer el valor inicial de boletos a confirmar
      setBoletosConfirmar(Math.min(boletosRestantes, 1));
      
    } catch (error) {
      console.error('❌ Error al consultar información del graduado:', error);
      
      // En caso de error, mostrar invitación no válida
      const errorScanData = {
        id: `QR-${Date.now()}`,
        timestamp: new Date().toISOString(),
        invitadoId: decodedText,
        invitado: 'Error al validar invitación',
        mesa: null,
        boletos: 0,
        restricciones: {
          vegetarianos: 0,
          alergicosMariscos: 0,
          celiaco: 0,
          alergicosLactosa: 0
        },
        valido: false,
        evento: evento?.nombre_evento || 'Evento'
      };
      
      setLastScan(errorScanData);
      setScanHistory(prev => [errorScanData, ...prev].slice(0, 10));
    }
  }, [evento]);

  const onScanError = useCallback((errorMessage) => {
    // Silenciar errores de escaneo continuo (son normales)
    // console.warn('QR Scan error:', errorMessage);
  }, []);

  // Iniciar escaneo con html5-qrcode
  const handleStartScan = async () => {
    try {
      setScanning(true);
      
      // Limpiar instancia anterior si existe
      if (html5QrCodeRef.current) {
        try {
          const state = html5QrCodeRef.current.getState();
          // Solo intentar detener si está en estado SCANNING (2)
          if (state === 2) {
            await html5QrCodeRef.current.stop();
          }
          await html5QrCodeRef.current.clear();
        } catch (err) {
          console.log('Limpiando instancia anterior:', err.message);
        }
        html5QrCodeRef.current = null;
      }

      // Crear nueva instancia de Html5Qrcode
      html5QrCodeRef.current = new Html5Qrcode(scannerIdRef.current);

      // Configuración del escáner optimizada para mejor detección
      const config = {
        fps: 10, // Frames per second
        qrbox: { width: 250, height: 250 }, // Área de escaneo
        aspectRatio: 1.777778, // 16:9
        disableFlip: false, // Permitir flip horizontal
        videoConstraints: {
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 }
        },
        // Mejoras para detección
        formatsToSupport: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], // Todos los formatos
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };

      // Intentar con diferentes estrategias de cámara
      let scannerStarted = false;
      
      // Estrategia 1: Intentar con cámara trasera
      if (!scannerStarted) {
        try {
          console.log('🔄 Intentando iniciar con cámara trasera...');
          await html5QrCodeRef.current.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            onScanError
          );
          console.log('✓ Escáner iniciado con cámara trasera - Listo para escanear');
          scannerStarted = true;
        } catch (error) {
          console.log('✗ Cámara trasera no disponible:', error.message);
        }
      }

      // Estrategia 2: Intentar con cámara frontal
      if (!scannerStarted) {
        try {
          console.log('🔄 Intentando iniciar con cámara frontal...');
          // Limpiar instancia y crear una nueva para evitar conflictos de transición
          await html5QrCodeRef.current.clear();
          html5QrCodeRef.current = null;
          html5QrCodeRef.current = new Html5Qrcode(scannerIdRef.current);
          
          await html5QrCodeRef.current.start(
            { facingMode: "user" },
            config,
            onScanSuccess,
            onScanError
          );
          console.log('✓ Escáner iniciado con cámara frontal - Listo para escanear');
          scannerStarted = true;
        } catch (error) {
          console.log('✗ Cámara frontal no disponible:', error.message);
        }
      }

      // Estrategia 3: Usar la primera cámara disponible por ID
      if (!scannerStarted) {
        try {
          console.log('🔄 Obteniendo lista de cámaras disponibles...');
          // Limpiar instancia y crear una nueva
          if (html5QrCodeRef.current) {
            await html5QrCodeRef.current.clear();
            html5QrCodeRef.current = null;
          }
          
          const devices = await Html5Qrcode.getCameras();
          console.log('📷 Cámaras encontradas:', devices.length, devices);
          
          if (devices && devices.length > 0) {
            html5QrCodeRef.current = new Html5Qrcode(scannerIdRef.current);
            const cameraId = devices[0].id;
            
            console.log('🔄 Iniciando con cámara:', devices[0].label || cameraId);
            await html5QrCodeRef.current.start(
              cameraId,
              config,
              onScanSuccess,
              onScanError
            );
            console.log('✓ Escáner iniciado con dispositivo - Listo para escanear:', devices[0].label || cameraId);
            scannerStarted = true;
          } else {
            throw new Error('No se encontraron cámaras disponibles en el dispositivo');
          }
        } catch (error) {
          console.log('✗ Error al usar cámara por ID:', error.message);
          throw error;
        }
      }

      if (!scannerStarted) {
        throw new Error('No se pudo iniciar el escáner con ninguna estrategia disponible');
      }

    } catch (error) {
      console.error('Error al iniciar el escáner:', error);
      
      let errorMessage = 'No se pudo acceder a la cámara.';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Permiso de cámara denegado. Por favor permite el acceso a la cámara en la configuración de tu navegador.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No se encontró ninguna cámara en tu dispositivo.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError' || error.name === 'AbortError') {
        errorMessage = 'La cámara está siendo usada por otra aplicación o hay un problema de hardware. Cierra otras aplicaciones que puedan estar usando la cámara e intenta de nuevo.';
      } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
        errorMessage = 'No se pudo satisfacer los requisitos de la cámara. Intenta con otra cámara.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
      setScanning(false);
      
      // Limpiar la instancia en caso de error
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.clear();
        } catch (clearError) {
          console.log('Error al limpiar:', clearError.message);
        }
        html5QrCodeRef.current = null;
      }
    }
  };

  const handleStopScan = async () => {
    try {
      // Limpiar timeout de escaneo
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }
      lastScanTextRef.current = null;
      
      if (html5QrCodeRef.current) {
        // Verificar si el escáner está realmente corriendo
        const state = html5QrCodeRef.current.getState();
        if (state === 2) { // 2 = SCANNING state
          await html5QrCodeRef.current.stop();
          console.log('Escáner detenido exitosamente');
        }
        await html5QrCodeRef.current.clear();
      }
    } catch (error) {
      console.error('Error al detener el escáner:', error);
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmarBoletos = () => {
    if (!pendingConfirmation) return;

    const { invitadoData, boletosYaUsados } = pendingConfirmation;
    
    const nuevoTotal = boletosYaUsados + boletosConfirmar;
    
    // Actualizar el ref inmediatamente (sincrónico)
    boletosRegistradosRef.current = {
      ...boletosRegistradosRef.current,
      [invitadoData.id]: nuevoTotal
    };
    
    // Actualizar el estado para UI
    setBoletosRegistrados(boletosRegistradosRef.current);
    
    console.log(`✅ Boletos actualizados para ${invitadoData.id}:`, {
      confirmados: boletosConfirmar,
      yaUsados: boletosYaUsados,
      nuevoTotal: nuevoTotal,
      registrados: boletosRegistradosRef.current
    });

    // Crear objeto con la información del escaneo
    const scanData = {
      id: `QR-${Date.now()}`,
      timestamp: new Date().toISOString(),
      invitadoId: invitadoData.id,
      invitado: invitadoData.nombre,
      mesa: invitadoData.mesa,
      boletos: boletosConfirmar,
      boletosTotal: invitadoData.boletos,
      boletosUsados: nuevoTotal,
      restricciones: invitadoData.restricciones || {
        vegetarianos: 0,
        alergicosMariscos: 0,
        celiaco: 0,
        alergicosLactosa: 0
      },
      valido: true,
      evento: evento?.nombre_evento || 'Evento'
    };

    setLastScan(scanData);
    setScanHistory(prev => [scanData, ...prev].slice(0, 10));
    
    // Limpiar estado de confirmación pendiente
    setPendingConfirmation(null);
    setBoletosConfirmar(1);

    console.log(`✅ ${boletosConfirmar} boleto(s) confirmado(s) para ${invitadoData.nombre}`);
  };

  const handleCancelarConfirmacion = () => {
    setPendingConfirmation(null);
    setBoletosConfirmar(1);
    console.log('❌ Confirmación cancelada');
  };


  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      // Limpiar timeout de escaneo
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      
      // Detener el escáner al desmontar
      if (html5QrCodeRef.current) {
        try {
          const state = html5QrCodeRef.current.getState();
          if (state === 2) { // Solo detener si está escaneando
            html5QrCodeRef.current.stop().catch(err => console.error('Error stopping scanner:', err));
          }
        } catch (err) {
          console.log('Error en cleanup:', err.message);
        }
      }
    };
  }, []);

  const handleClose = () => {
    handleStopScan();
    onClose();
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Container principal - ocupa toda la pantalla */}
      <div className={clsx(
        "w-full h-full bg-white dark:bg-[#1a1a1a]",
        "flex flex-col"
      )}>
          {/* Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-teal-600 to-teal-500 dark:from-teal-500 dark:to-teal-400 px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <QrCode className="w-7 h-7 text-white" />
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Lector de Códigos QR
                  </h1>
                  <p className="text-sm text-white/80 mt-1">
                    {evento?.nombre_evento || 'Escanea las invitaciones'}
                  </p>
                </div>
              </div>
              {onClose && (
                <button
                  className="text-white/80 hover:text-white transition-colors"
                  onClick={handleClose}
                  aria-label="Cerrar"
                >
                  <CircleX size={28} />
                </button>
              )}
            </div>
          </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 h-full">
                {/* Columna izquierda: Cámara y controles */}
                <div className="flex flex-col space-y-4 h-full">
                  <div className="bg-gray-50 dark:bg-[#23272e] rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <QrCode size={20} className="text-teal-600 dark:text-teal-400" />
                      Escáner
                    </h3>
                    
                    {/* Área de video/preview */}
                    <div className="relative bg-black rounded-lg overflow-hidden flex-1 mb-4 min-h-[400px] max-h-[500px]">
                      {/* Contenedor para html5-qrcode - siempre presente */}
                      <div 
                        id="qr-reader"
                        className="w-full h-full"
                      />
                      
                      {/* Placeholder cuando no está escaneando - overlay absoluto */}
                      {!scanning && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black">
                          <div className="text-center text-gray-400">
                            <QrCode size={64} className="mx-auto mb-3 opacity-50" />
                            <p className="text-sm">Presiona "Iniciar Escaneo" para comenzar</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Controles */}
                    <div className="flex gap-3">
                      {!scanning ? (
                        <button
                          onClick={handleStartScan}
                          className="flex-1 px-4 py-3 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg font-semibold transition-colors shadow-md"
                        >
                          Iniciar Escaneo
                        </button>
                      ) : (
                        <button
                          onClick={handleStopScan}
                          className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-md"
                        >
                          Detener Escaneo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Última lectura */}
                  {lastScan && (
                    <div className={clsx(
                      "rounded-xl p-4 border-2 overflow-y-auto max-h-96",
                      lastScan.valido 
                        ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600"
                        : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600"
                    )}>
                      <div className="flex items-start gap-3">
                        {lastScan.valido ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className={clsx(
                            "font-bold text-lg mb-2",
                            lastScan.valido ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                          )}>
                            {lastScan.valido ? '✓ Invitación Válida' : '✗ Invitación No Válida'}
                          </h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <User size={16} />
                              <span className="font-semibold">{lastScan.invitado}</span>
                            </div>
                            {lastScan.mesa && (
                              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                                  <path d="M3 9h18"/>
                                  <path d="M9 21V9"/>
                                </svg>
                                <span>Mesa {lastScan.mesa}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <Ticket size={16} />
                              <span>{lastScan.boletos} boleto{lastScan.boletos !== 1 ? 's' : ''}</span>
                              {lastScan.boletosTotal && (
                                <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full">
                                  {lastScan.boletosUsados}/{lastScan.boletosTotal} confirmados
                                </span>
                              )}
                              {lastScan.error && (
                                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">
                                  {lastScan.error}
                                </span>
                              )}
                            </div>
                            
                            {/* Restricciones Alimentarias */}
                            {lastScan.restricciones && (lastScan.restricciones.vegetarianos > 0 || 
                              lastScan.restricciones.alergicosMariscos > 0 || 
                              lastScan.restricciones.celiaco > 0 || 
                              lastScan.restricciones.alergicosLactosa > 0) && (
                              <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2a10 10 0 0 0-9.95 9h11.64L9.74 7.22a1 1 0 0 1 1.41-1.41l3.68 3.68a2 2 0 0 1 0 2.83l-3.68 3.68a1 1 0 0 1-1.41-1.41l3.95-3.95H2.05A10 10 0 1 0 12 2Z"/>
                                  </svg>
                                  Restricciones Alimentarias:
                                </div>
                                <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                                  {lastScan.restricciones.vegetarianos > 0 && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                      <span>Vegetarianos: <strong>{lastScan.restricciones.vegetarianos}</strong></span>
                                    </div>
                                  )}
                                  {lastScan.restricciones.alergicosMariscos > 0 && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                      <span>Alérgicos a mariscos: <strong>{lastScan.restricciones.alergicosMariscos}</strong></span>
                                    </div>
                                  )}
                                  {lastScan.restricciones.celiaco > 0 && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                      <span>Celiacos: <strong>{lastScan.restricciones.celiaco}</strong></span>
                                    </div>
                                  )}
                                  {lastScan.restricciones.alergicosLactosa > 0 && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                      <span>Alérgicos a lactosa: <strong>{lastScan.restricciones.alergicosLactosa}</strong></span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
                              <Clock size={14} />
                              <span>{new Date(lastScan.timestamp).toLocaleTimeString('es-MX')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Columna derecha: Historial */}
                <div className="flex flex-col space-y-4 overflow-hidden h-full">
                  <div className="bg-gray-50 dark:bg-[#23272e] rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex-1 flex flex-col overflow-hidden">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2 flex-shrink-0">
                      <Clock size={20} className="text-gray-600 dark:text-gray-400" />
                      Historial de Escaneos
                    </h3>
                    
                    {scanHistory.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Aún no hay escaneos registrados</p>
                      </div>
                    ) : (
                      <div className="space-y-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent flex-1">
                        {scanHistory.map((scan, index) => (
                          <div
                            key={scan.id}
                            className={clsx(
                              "p-3 rounded-lg border transition-all",
                              scan.valido
                                ? "bg-white dark:bg-[#1e1e1e] border-green-200 dark:border-green-800"
                                : "bg-white dark:bg-[#1e1e1e] border-red-200 dark:border-red-800",
                              index === 0 && "ring-2 ring-teal-500 dark:ring-teal-400"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {scan.valido ? (
                                    <CheckCircle2 size={16} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                                  ) : (
                                    <XCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0" />
                                  )}
                                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                                    {scan.invitado}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                  {scan.mesa && (
                                    <span className="flex items-center gap-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="18" height="18" x="3" y="3" rx="2"/>
                                        <path d="M3 9h18"/>
                                        <path d="M9 21V9"/>
                                      </svg>
                                      Mesa {scan.mesa}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Ticket size={12} />
                                    {scan.boletos}
                                    {scan.boletosTotal && (
                                      <span className="text-xs text-gray-500 dark:text-gray-500">
                                        de {scan.boletosTotal} ({scan.boletosUsados || scan.boletos}/{scan.boletosTotal})
                                      </span>
                                    )}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(scan.timestamp).toLocaleTimeString('es-MX', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                                
                                {/* Restricciones compactas */}
                                {scan.restricciones && (scan.restricciones.vegetarianos > 0 || 
                                  scan.restricciones.alergicosMariscos > 0 || 
                                  scan.restricciones.celiaco > 0 || 
                                  scan.restricciones.alergicosLactosa > 0) && (
                                  <div className="flex items-center gap-2 mt-1 text-xs">
                                    {scan.restricciones.vegetarianos > 0 && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                                        🥬 {scan.restricciones.vegetarianos}
                                      </span>
                                    )}
                                    {scan.restricciones.alergicosMariscos > 0 && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded">
                                        🦐 {scan.restricciones.alergicosMariscos}
                                      </span>
                                    )}
                                    {scan.restricciones.celiaco > 0 && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">
                                        🌾 {scan.restricciones.celiaco}
                                      </span>
                                    )}
                                    {scan.restricciones.alergicosLactosa > 0 && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                                        🥛 {scan.restricciones.alergicosLactosa}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Estadísticas */}
                  <div className="grid grid-cols-2 gap-3 flex-shrink-0">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Escaneados</div>
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {scanHistory.length}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Boletos Totales</div>
                      <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                        {scanHistory.reduce((sum, scan) => sum + scan.boletos, 0)}
                      </div>
                    </div>
                  </div>

                  {/* Restricciones Alimentarias Totales */}
                  {scanHistory.length > 0 && (() => {
                    const totales = scanHistory.reduce((acc, scan) => {
                      if (scan.restricciones) {
                        acc.vegetarianos += scan.restricciones.vegetarianos || 0;
                        acc.alergicosMariscos += scan.restricciones.alergicosMariscos || 0;
                        acc.celiaco += scan.restricciones.celiaco || 0;
                        acc.alergicosLactosa += scan.restricciones.alergicosLactosa || 0;
                      }
                      return acc;
                    }, { vegetarianos: 0, alergicosMariscos: 0, celiaco: 0, alergicosLactosa: 0 });

                    const tieneRestricciones = totales.vegetarianos > 0 || 
                      totales.alergicosMariscos > 0 || 
                      totales.celiaco > 0 || 
                      totales.alergicosLactosa > 0;

                    return tieneRestricciones ? (
                      <div className="bg-white dark:bg-[#1e1e1e] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a10 10 0 0 0-9.95 9h11.64L9.74 7.22a1 1 0 0 1 1.41-1.41l3.68 3.68a2 2 0 0 1 0 2.83l-3.68 3.68a1 1 0 0 1-1.41-1.41l3.95-3.95H2.05A10 10 0 1 0 12 2Z"/>
                          </svg>
                          Restricciones Alimentarias Totales
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {totales.vegetarianos > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span className="text-gray-600 dark:text-gray-400">Vegetarianos:</span>
                              <span className="font-bold text-gray-800 dark:text-gray-100">{totales.vegetarianos}</span>
                            </div>
                          )}
                          {totales.alergicosMariscos > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                              <span className="text-gray-600 dark:text-gray-400">Mariscos:</span>
                              <span className="font-bold text-gray-800 dark:text-gray-100">{totales.alergicosMariscos}</span>
                            </div>
                          )}
                          {totales.celiaco > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                              <span className="text-gray-600 dark:text-gray-400">Celiacos:</span>
                              <span className="font-bold text-gray-800 dark:text-gray-100">{totales.celiaco}</span>
                            </div>
                          )}
                          {totales.alergicosLactosa > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              <span className="text-gray-600 dark:text-gray-400">Lactosa:</span>
                              <span className="font-bold text-gray-800 dark:text-gray-100">{totales.alergicosLactosa}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-gray-50 dark:bg-[#23272e] px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  💡 <span className="font-medium">Tip:</span> Coloca el código QR frente a la cámara para escanearlo
                </p>
                {onClose && (
                  <button
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors shadow-md"
                    onClick={handleClose}
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>

      {/* Modal de Confirmación de Boletos */}
      {pendingConfirmation && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 dark:bg-black/60" onClick={handleCancelarConfirmacion} />
          
          <div className="relative z-[71] mx-auto w-full max-w-md rounded-xl bg-white dark:bg-[#1e1e1e] shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                Confirmar Boletos
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {/* Información del Invitado */}
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-teal-500 dark:bg-teal-600 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 dark:text-gray-100">
                      {pendingConfirmation.invitadoData.nombre}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Mesa: <span className="font-semibold">{pendingConfirmation.invitadoData.mesa}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total de boletos: <span className="font-semibold">{pendingConfirmation.invitadoData.boletos}</span>
                    </div>
                    {pendingConfirmation.boletosYaUsados > 0 && (
                      <div className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                        Ya usados: <span className="font-semibold">{pendingConfirmation.boletosYaUsados}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Selector de Boletos */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ¿Cuántos boletos desea confirmar?
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setBoletosConfirmar(Math.max(1, boletosConfirmar - 1))}
                      disabled={boletosConfirmar <= 1}
                      className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-xl transition-colors"
                    >
                      −
                    </button>
                    
                    <div className="flex-1 text-center">
                      <input
                        type="number"
                        min="1"
                        max={pendingConfirmation.boletosRestantes}
                        value={boletosConfirmar}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          setBoletosConfirmar(Math.min(Math.max(1, value), pendingConfirmation.boletosRestantes));
                        }}
                        className="w-full text-center text-4xl font-bold bg-white dark:bg-[#2d2d30] border-2 border-teal-500 dark:border-teal-600 rounded-lg py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        de {pendingConfirmation.boletosRestantes} disponible(s)
                      </div>
                    </div>

                    <button
                      onClick={() => setBoletosConfirmar(Math.min(pendingConfirmation.boletosRestantes, boletosConfirmar + 1))}
                      disabled={boletosConfirmar >= pendingConfirmation.boletosRestantes}
                      className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-xl transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCancelarConfirmacion}
                    className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmarBoletos}
                    className="flex-1 px-4 py-3 bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors shadow-md"
                  >
                    Confirmar {boletosConfirmar} boleto{boletosConfirmar !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
