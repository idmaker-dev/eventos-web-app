import React, { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
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

export default function LectorQR({ open, onClose, evento }) {
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const html5QrCodeRef = useRef(null);
  const scannerIdRef = useRef("qr-reader");
  const lastScanTextRef = useRef(null);
  const scanTimeoutRef = useRef(null);

  // Función para procesar el código QR escaneado (useCallback para estabilidad)
  const onScanSuccess = useCallback((decodedText, decodedResult) => {
    // Evitar escaneos duplicados - ignorar si es el mismo código en los últimos 2 segundos
    if (lastScanTextRef.current === decodedText) {
      console.log('⏭️ Ignorando escaneo duplicado:', decodedText);
      return;
    }

    console.log('✅ QR Code detectado y procesado:', decodedText, decodedResult);
    
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
    
    // Procesar el código QR (aquí puedes agregar lógica de validación con API)
    const mockData = {
      id: `QR-${Date.now()}`,
      timestamp: new Date().toISOString(),
      invitado: decodedText, // Usar el texto del QR real
      boletos: Math.floor(Math.random() * 5) + 1, // Esto vendrá del API
      alumno: evento?.nombre_evento || 'Evento',
      valido: true // Esto vendrá del API después de validar
    };

    setLastScan(mockData);
    setScanHistory(prev => [mockData, ...prev].slice(0, 10));
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

  // Cleanup cuando se cierra el modal
  useEffect(() => {
    if (!open && html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        if (state === 2 && scanning) { // Solo detener si está escaneando
          html5QrCodeRef.current.stop()
            .then(() => {
              console.log('Scanner detenido al cerrar modal');
              setScanning(false);
            })
            .catch(err => {
              console.error('Error stopping scanner:', err);
              setScanning(false);
            });
        } else if (scanning) {
          // Si scanning es true pero el escáner no está corriendo, solo actualizar estado
          setScanning(false);
        }
      } catch (err) {
        console.log('Error verificando estado:', err.message);
        setScanning(false);
      }
    }
  }, [open, scanning]);

  const handleClose = () => {
    handleStopScan();
    onClose();
  };

  return (
    <Dialog
      open={open}
      as="div"
      className="relative z-[60] focus:outline-none"
      onClose={handleClose}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      
      {/* Container del modal */}
      <div className="fixed inset-0 z-[60] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className={clsx(
              "w-full max-w-5xl rounded-xl bg-white dark:bg-[#1a1a1a] shadow-2xl duration-300 ease-out",
              "max-h-[95vh] relative z-[60] flex flex-col"
            )}
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-teal-600 to-teal-500 dark:from-teal-500 dark:to-teal-400 px-6 py-4 rounded-t-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <QrCode className="w-7 h-7 text-white" />
                  <div>
                    <DialogTitle className="text-2xl font-bold text-white">
                      Lector de Códigos QR
                    </DialogTitle>
                    <p className="text-sm text-white/80 mt-1">
                      {evento?.nombre_evento || 'Escanea las invitaciones'}
                    </p>
                  </div>
                </div>
                <button
                  className="text-white/80 hover:text-white transition-colors"
                  onClick={handleClose}
                  aria-label="Cerrar"
                >
                  <CircleX size={28} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Columna izquierda: Cámara y controles */}
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-[#23272e] rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <QrCode size={20} className="text-teal-600 dark:text-teal-400" />
                      Escáner
                    </h3>
                    
                    {/* Área de video/preview */}
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4">
                      {/* Contenedor para html5-qrcode */}
                      <div 
                        id="qr-reader"
                        className={clsx(
                          "w-full h-full",
                          !scanning && "hidden"
                        )}
                      />
                      
                      {/* Placeholder cuando no está escaneando */}
                      {!scanning && (
                        <div className="w-full h-full flex items-center justify-center">
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
                      "rounded-xl p-4 border-2",
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
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <Ticket size={16} />
                              <span>{lastScan.boletos} boleto{lastScan.boletos !== 1 ? 's' : ''}</span>
                            </div>
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
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-[#23272e] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Clock size={20} className="text-gray-600 dark:text-gray-400" />
                      Historial de Escaneos
                    </h3>
                    
                    {scanHistory.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Aún no hay escaneos registrados</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
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
                                  <span className="flex items-center gap-1">
                                    <Ticket size={12} />
                                    {scan.boletos}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(scan.timestamp).toLocaleTimeString('es-MX', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Estadísticas */}
                  <div className="grid grid-cols-2 gap-3">
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
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-gray-50 dark:bg-[#23272e] px-6 py-4 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  💡 <span className="font-medium">Tip:</span> Coloca el código QR frente a la cámara para escanearlo
                </p>
                <button
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors shadow-md"
                  onClick={handleClose}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
