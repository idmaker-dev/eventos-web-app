import React, { useRef, useState, useEffect } from "react";
import Subir from "../../assets/recursos/SUBIR.svg";
import Advertencia from "../../assets/recursos/ADVERTENCIA.svg";
import MovibleQR from "./MovibleQR";
import Compartir from "../../assets/recursos/COMPARTIR.svg";
import Descargar from "../../assets/recursos/GUARDAR.svg";
import Editar from "../../assets/recursos/EDITAR.svg";
import html2canvas from "html2canvas";
import { QrCode } from "lucide-react";
import QRCode from "qrcode";
import { useBoletos } from "../../hooks/useBoletos";
import { useSelectedEvent } from "../../contexts/SelectedEventContext";
import InlineSpinner from "../ui/InlineSpinner";

export default function Boleto() {
  const { eventoActual } = useSelectedEvent();
  const {
    configuracion,
    loading,
    error,
    cargarConfiguracion,
    subirDiseno,
    guardarConfiguracionQR,
    descargarBoletosMasivo,
    limpiarError,
  } = useBoletos();

  const [imagen, setImagen] = useState(null);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false);
  const inputRef = useRef();
  const [seleccionQR, setSeleccionQR] = useState(false);
  const [qrConfig, setQrConfig] = useState({
    pos: { x: 100, y: 100 },
    size: 120,
  });
  const [finalizado, setFinalizado] = useState(false);
  const [qrConfigPercent, setQrConfigPercent] = useState(null);
  const qrContainerRef = useRef();
  const [showAlertaQR, setShowAlertaQR] = useState(true);
  // refs para obtener tamaño real de la imagen
  const imgRef = useRef();
  const imgFinalRef = useRef();

  // Cargar configuración existente al montar
  useEffect(() => {
    if (eventoActual?.id) {
      cargarConfiguracion(eventoActual.id);
    }
  }, [eventoActual, cargarConfiguracion]);

  // Si ya existe configuración, cargar la imagen
  useEffect(() => {
    if (configuracion?.imagen_url) {
      // Agregar timestamp para evitar caché del navegador
      const imagenConTimestamp = `${configuracion.imagen_url}?t=${Date.now()}`;
      setImagen(imagenConTimestamp);
      setFinalizado(true);
      // Resetear estados de flujo para ir directo a vista final
      setMostrarAdvertencia(false);
      setSeleccionQR(false);
      // Convertir configuración de porcentajes a píxeles para vista previa
      if (configuracion.qr_config) {
        setQrConfigPercent(configuracion.qr_config);
      }
    }
  }, [configuracion]);

  const containerStyle = {
    width: "auto",
    height: "auto",
    maxWidth: "100%",
    maxHeight: "70vh",
    aspectRatio: "5/7",
    margin: "0 auto",
    // background: "#fff",
    borderRadius: "1rem",
    overflow: "hidden",
    border: "1px solid #e0e0e0",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    borderRadius: "1rem",
    // background: "#fff",
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoImagen(file);
      setImagen(URL.createObjectURL(file));
    }
  };

  const handleSiguiente = async () => {
    if (!archivoImagen || !eventoActual?.id) {
      return;
    }

    const resultado = await subirDiseno(archivoImagen, eventoActual.id);
    if (resultado.success) {
      setMostrarAdvertencia(true);
    }
  };

  const handleGuardarAjustes = async () => {
    const img = imgRef.current;
    if (!img || !eventoActual?.id) return;

    const renderRect = img.getBoundingClientRect();
    const xPercent = qrConfig.pos.x / renderRect.width;
    const yPercent = qrConfig.pos.y / renderRect.height;
    const widthPercent = qrConfig.size / renderRect.width;
    const heightPercent = qrConfig.size / renderRect.height;

    const qrConfigData = {
      x: xPercent,
      y: yPercent,
      width: widthPercent,
      height: heightPercent,
    };

    const resultado = await guardarConfiguracionQR(qrConfigData, eventoActual.id);
    if (resultado.success) {
      setQrConfigPercent(qrConfigData);
      setFinalizado(true);
    }
  };


const handleDescargar = async () => {
  if (!eventoActual?.id) return;

  await descargarBoletosMasivo(eventoActual.id);
};

  const handleEditar = () => {
    setFinalizado(false);
    setSeleccionQR(true);
  };

  // Vista 1: Subir imagen
  if (!imagen) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-fondoVs dark:bg-[#1a1a1a] rounded-xl p-4">
        <div className="w-full max-w-5xl flex flex-col items-center">
          {error && (
            <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}
          <div className="w-full flex flex-col items-center justify-center">
            <div
              className="w-full h-96 flex flex-col items-center space-y-8 justify-center border-2 border-dashed border-casal/40 rounded-xl bg-[#e2fff6] cursor-pointer hover:border-casal transition mb-6"
              onClick={() => !loading && inputRef.current.click()}
            >
              {loading ? (
                <InlineSpinner size="large" />
              ) : (
                <>
                  <img src={Subir} className="w-36 h-36 " alt="" />
                  <span className="text-white bg-casal px-10 py-2 rounded-full font-semibold">
                    Haz clic o arrastra tu imagen aquí
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                ref={inputRef}
                onChange={handleImagenChange}
                className="hidden"
                disabled={loading}
              />
              <p className="text-gray-500 mb-6 text-center">
                Ejemplo: el diseño de invitación puede ser en formato JPEG, PNG
                O PDF <br />
                Un limite maximo de 100 MB de archivo
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista 5: Boleto final con QR en la posición/tamaño elegidos (EVALUAR PRIMERO)
  if (finalizado && qrConfigPercent) {
    return (
      <div className="min-h-min flex flex-col items-center justify-center bg-fondoVs p-4">
        <div className="w-full max-w-5xl flex flex-row items-center justify-center gap-8">
          {error && (
            <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}
          <div className="bg-white rounded-3xl shadow-2xl p-8 relative" style={{ minWidth: 400 }}>
            <div className="text-2xl font-bold text-casal text-center mb-4">BOLETO DE GRADUACIÓN</div>
            <div ref={qrContainerRef} style={containerStyle}>
              <img
                ref={imgFinalRef}
                src={imagen}
                alt="Previsualización"
                style={imgStyle}
              />
              <FinalQROverlay imgRef={imgFinalRef} qrConfigPercent={qrConfigPercent} />
            </div>
          </div>
          {/* Botones de acción */}
          <div className="flex flex-col gap-4 items-center justify-center">
            <button 
              className="bg-casal text-white px-8 py-3 rounded-full text-lg font-semibold shadow hover:bg-casal/90 transition flex items-center gap-2 w-full justify-center"
              disabled={loading}
            >
              <img src={Compartir} className="w-5 h-5" alt="" srcSet="" />
              Compartir
            </button>
            <button 
              onClick={handleEditar} 
              className="bg-Acapulco text-white px-8 py-3 rounded-full text-lg font-semibold shadow hover:bg-Acapulco/90 transition flex items-center gap-2 w-full justify-center disabled:opacity-50"
              disabled={loading}
            >
              <img src={Editar} className="w-5 h-5" alt="" srcSet="" />
              Editar
            </button>
            <button 
              onClick={handleDescargar} 
              className="bg-Acapulco text-white px-8 py-3 rounded-full text-lg font-semibold shadow hover:bg-Acapulco/90 transition flex items-center gap-2 w-full justify-center disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <InlineSpinner size="small" color="white" />
                  Descargando...
                </>
              ) : (
                <>
                  <img src={Descargar} className="w-5 h-5" alt="" srcSet="" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista 4: Selección QR con controles
  if (seleccionQR && !finalizado) {
    return (
      <div className="min-h-min flex flex-col items-center justify-center bg-fondoVs dark:bg-[#1a1a1a] rounded-xl p-4">
        <div className="w-full max-w-5xl flex flex-col items-center">
          {error && (
            <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}
          <div style={containerStyle}>
            <img
              ref={imgRef}
              src={imagen}
              alt="Previsualización"
              style={imgStyle}
            />
            <MovibleQR
              onChange={(data) => setQrConfig(data)}
              initialPos={qrConfig.pos}
              initialSize={qrConfig.size}
            />
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleGuardarAjustes}
              disabled={loading}
              className="bg-casal text-white px-8 py-3 rounded-full text-lg font-semibold shadow hover:bg-casal/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <InlineSpinner size="small" color="white" />
                  Guardando...
                </>
              ) : (
                "Guardar ajustes"
              )}
            </button>
            <button
              onClick={() => {
                setSeleccionQR(false);
                setMostrarAdvertencia(false);
                setQrConfig({ pos: { x: 100, y: 100 }, size: 120 });
              }}
              disabled={loading}
              className="bg-gray-300 text-casal px-8 py-3 rounded-full text-lg font-semibold shadow hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista 3: Advertencia después de "Siguiente"
  if (mostrarAdvertencia && !seleccionQR && !finalizado) {
    return (
      <div className="min-h-min flex flex-col items-center justify-center bg-fondoVs p-4">
        <div className="w-full max-w-5xl flex flex-col items-center space-y-4">
          <div className="w-3/4 h-72 rounded-3xl shadow-2xl flex bg-white items-center animate-fade-in">
            <div className="w-72 h-72 p-6 rounded-l-2xl bg-Acapulco flex justify-between items-center">
              <img src={Advertencia} className="w-48 h-48 object-contain" alt="" />
            </div>
            <div className="flex w-full justify-center items-center text-center">
              <p className="text-3xl font-semibold text-casal">
                Alerta indique en el <br />
                cuadro donde se <br />
                colocara el <span className="font-bold">Código QR</span> <br />
                de la invitacion.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSeleccionQR(true)}
            className="bg-casal text-white px-8 py-3 rounded-full text-lg font-semibold shadow hover:bg-casal/90 transition"
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  }

  // Vista 2: Previsualización y botón Siguiente
  if (imagen && !mostrarAdvertencia && !finalizado) {
    return (
      <div className="min-h-min flex flex-col items-center justify-center bg-fondoVs p-4">
        <div className="w-full max-w-5xl flex flex-col items-center">
          {error && (
            <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}
          <div className="w-full flex flex-col items-center animate-fade-in">
            <div style={containerStyle}>
              <img src={imagen} alt="Previsualización" style={imgStyle} />
            </div>
            <button
              onClick={handleSiguiente}
              disabled={loading}
              className="bg-casal text-white px-8 py-3 rounded-full text-lg font-semibold shadow hover:bg-casal/90 transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <InlineSpinner size="small" color="white" />
                  Subiendo...
                </>
              ) : (
                "Siguiente"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista 4: Selección QR con controles
  if (seleccionQR && !finalizado) {
    return (
      <div className="min-h-min flex flex-col items-center justify-center bg-fondoVs dark:bg-[#1a1a1a] rounded-xl p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none mx-auto">
          {Array.from({ length: 12 }).map((_, row) =>
            Array.from({ length: 21 }).map((_, col) => (
              <div
                key={`${row}-${col}`}
                className="w-1 h-1 bg-Acapulco/50 rounded-full absolute opacity-20"
                style={{
                  top: `${(row * 100) / 12}%`,
                  left: `${(col * 100) / 21}%`,
                }}
              ></div>
            ))
          )}
        </div>
        {/* Modal de alerta */}
        {showAlertaQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="min-h-min flex flex-col items-center justify-center relative">
              <button
                className="absolute top-2 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                onClick={() => setShowAlertaQR(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
              <div className=" flex flex-col  items-center space-y-4">
                <div className=" w-full h-72 rounded-3xl shadow-2xl flex bg-white dark:bg-[#1a1a1a] items-center animate-fade-in">
                  <div className="hidden md:block w-72 h-72 p-6 rounded-l-2xl bg-Acapulco flex justify-between items-center">
                    <img
                      src={Advertencia}
                      className="w-48 h-48 object-contain"
                      alt=""
                    />
                  </div>
                  <div className="flex w-full justify-center items-center text-center p-6 md:p-0">
                    <p className="text-3xl font-semibold text-casal">
                      Alerta indique en el <br />
                      cuadro donde se <br />
                      colocara el <span className="font-bold">
                        Código QR
                      </span>{" "}
                      <br />
                      de la invitacion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-5xl flex flex-col items-center">
          {error && (
            <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}
          <div style={containerStyle}>
            <img
              ref={imgRef}
              src={imagen}
              alt="Previsualización"
              style={imgStyle}
            />
            <MovibleQR
              onChange={(data) => setQrConfig(data)}
              initialPos={qrConfig.pos}
              initialSize={qrConfig.size}
            />
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleGuardarAjustes}
              disabled={loading}
              className="bg-casal text-white px-8 py-3 rounded-full text-lg font-semibold shadow hover:bg-casal/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <InlineSpinner size="small" color="white" />
                  Guardando...
                </>
              ) : (
                "Guardar ajustes"
              )}
            </button>
            <button
              onClick={() => {
                setSeleccionQR(false);
                setMostrarAdvertencia(false);
                setQrConfig({ pos: { x: 100, y: 100 }, size: 120 });
              }}
              disabled={loading}
              className="bg-gray-300 text-casal px-8 py-3 rounded-full text-lg font-semibold shadow hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // fallback
  return null;
}

function FinalQROverlay({ imgRef, qrConfigPercent }) {
  const [style, setStyle] = useState({ display: "none" });

  React.useEffect(() => {
    function update() {
      const img = imgRef.current;
      if (img && qrConfigPercent) {
        const rect = img.getBoundingClientRect();
        setStyle({
          position: "absolute",
          left: rect.width * qrConfigPercent.x,
          top: rect.height * qrConfigPercent.y,
          width: rect.width * qrConfigPercent.width,
          height: rect.height * qrConfigPercent.height,
          border: "3px dashed #0a9d8c",
          borderRadius: "1rem",
          background: "rgba(255,255,255,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        });
      }
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [imgRef, qrConfigPercent]);
  return (
    <div style={style}>
      <QrCode className="m-2" size="100%" color="#0a9d8c" strokeWidth={2} />
    </div>
  );
}
