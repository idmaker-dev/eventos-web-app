import { useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { Field, Input, Label, Button } from "@headlessui/react";
import { CreditCard, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import clsx from "clsx";
import Navbar from "../components/PortalPagos/Navbar";
import InlineSpinner from "../components/ui/InlineSpinner";

export default function PagoTarjeta() {
  const { invitadoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedIds = [], total = 0 } = location.state || {};

  // Estados del formulario
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [nombreTitular, setNombreTitular] = useState("");
  const [mesExpiracion, setMesExpiracion] = useState("");
  const [anioExpiracion, setAnioExpiracion] = useState("");
  const [cvv, setCvv] = useState("");
  const [correoElectronico, setCorreoElectronico] = useState("");
  
  // Estados de UI
  const [errores, setErrores] = useState({});
  const [procesando, setProcesando] = useState(false);

  // Validar si no hay datos de pago
  if (!selectedIds || selectedIds.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#eaf0f6]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No hay cuotas seleccionadas</h2>
            <p className="text-gray-600 mb-6">Por favor selecciona las cuotas que deseas pagar</p>
            <Link
              to={`/PortalPagos/${invitadoId}`}
              className="inline-block bg-casal text-white px-6 py-2 rounded-lg hover:bg-casal/80 transition-colors"
            >
              Volver al portal de pagos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Función para limpiar error de un campo
  const limpiarError = (campo) => {
    if (errores[campo]) {
      setErrores((prev) => {
        const nuevosErrores = { ...prev };
        delete nuevosErrores[campo];
        return nuevosErrores;
      });
    }
  };

  // Formatear número de tarjeta
  const formatearNumeroTarjeta = (valor) => {
    const soloNumeros = valor.replace(/\D/g, "");
    const grupos = soloNumeros.match(/.{1,4}/g);
    return grupos ? grupos.join(" ") : soloNumeros;
  };

  const handleNumeroTarjetaChange = (e) => {
    const valor = e.target.value.replace(/\D/g, "");
    if (valor.length <= 16) {
      setNumeroTarjeta(valor);
      limpiarError("numeroTarjeta");
    }
  };

  const handleCvvChange = (e) => {
    const valor = e.target.value.replace(/\D/g, "");
    if (valor.length <= 4) {
      setCvv(valor);
      limpiarError("cvv");
    }
  };

  const handleMesChange = (e) => {
    const valor = e.target.value.replace(/\D/g, "");
    if (valor.length <= 2) {
      const mes = parseInt(valor) || 0;
      if (mes <= 12) {
        setMesExpiracion(valor);
        limpiarError("mesExpiracion");
      }
    }
  };

  const handleAnioChange = (e) => {
    const valor = e.target.value.replace(/\D/g, "");
    if (valor.length <= 2) {
      setAnioExpiracion(valor);
      limpiarError("anioExpiracion");
    }
  };

  // Detectar tipo de tarjeta
  const detectarTipoTarjeta = () => {
    const primerDigito = numeroTarjeta.charAt(0);
    if (primerDigito === "4") return "visa";
    if (primerDigito === "5") return "mastercard";
    if (primerDigito === "3") return "amex";
    return "default";
  };

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!numeroTarjeta || numeroTarjeta.length < 15) {
      nuevosErrores.numeroTarjeta = "Número de tarjeta inválido";
    }

    if (!nombreTitular.trim()) {
      nuevosErrores.nombreTitular = "El nombre del titular es obligatorio";
    }

    if (!mesExpiracion || parseInt(mesExpiracion) < 1 || parseInt(mesExpiracion) > 12) {
      nuevosErrores.mesExpiracion = "Mes inválido";
    }

    if (!anioExpiracion || anioExpiracion.length !== 2) {
      nuevosErrores.anioExpiracion = "Año inválido";
    } else {
      const anioActual = new Date().getFullYear() % 100;
      const anio = parseInt(anioExpiracion);
      if (anio < anioActual) {
        nuevosErrores.anioExpiracion = "Tarjeta expirada";
      }
    }

    if (!cvv || cvv.length < 3) {
      nuevosErrores.cvv = "CVV inválido";
    }

    if (!correoElectronico.trim()) {
      nuevosErrores.correoElectronico = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoElectronico)) {
      nuevosErrores.correoElectronico = "Correo electrónico inválido";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Procesar pago
  const handleProcesarPago = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setProcesando(true);

    try {
      // Aquí iría la lógica de integración con el procesador de pagos
      // Por ahora simulamos un delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simular respuesta exitosa
      console.log("Pago procesado:", {
        invitadoId,
        selectedIds,
        total,
        tarjeta: numeroTarjeta.slice(-4),
      });

      // Redirigir a página de confirmación o dashboard
      navigate(`/PortalPagos/${invitadoId}`, {
        state: { pagoExitoso: true },
      });
    } catch (error) {
      console.error("Error al procesar pago:", error);
      setErrores({
        general: "Error al procesar el pago. Por favor intenta nuevamente.",
      });
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaf0f6] flex flex-col">
      <Navbar invitado={{ nombre_completo: "Portal de Pagos" }} />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Botón de regreso */}
        <Link
          to={`/PortalPagos/${invitadoId}`}
          className="inline-flex items-center gap-2 text-casal hover:text-casal/80 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver al portal de pagos</span>
        </Link>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulario de pago */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-casal/10 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-casal" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-casal">Pago con tarjeta</h2>
                <p className="text-sm text-gray-600">Completa los datos de tu tarjeta</p>
              </div>
            </div>

            <form onSubmit={handleProcesarPago} className="space-y-4">
              {/* Número de tarjeta */}
              <Field>
                <Label className="text-sm font-semibold text-gray-700">
                  Número de tarjeta
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={formatearNumeroTarjeta(numeroTarjeta)}
                    onChange={handleNumeroTarjetaChange}
                    maxLength={19}
                    className={clsx(
                      "mt-2 block w-full rounded-lg border-2 bg-white px-3 py-2.5 text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-casal focus:border-transparent",
                      errores.numeroTarjeta ? "border-red-500" : "border-gray-300"
                    )}
                    placeholder="1234 5678 9012 3456"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-1">
                    <CreditCard className={clsx(
                      "w-5 h-5",
                      detectarTipoTarjeta() === "visa" ? "text-blue-600" :
                      detectarTipoTarjeta() === "mastercard" ? "text-red-600" :
                      detectarTipoTarjeta() === "amex" ? "text-blue-400" :
                      "text-gray-400"
                    )} />
                  </div>
                </div>
                {errores.numeroTarjeta && (
                  <p className="text-red-500 text-sm mt-1">{errores.numeroTarjeta}</p>
                )}
              </Field>

              {/* Nombre del titular */}
              <Field>
                <Label className="text-sm font-semibold text-gray-700">
                  Nombre del titular
                </Label>
                <Input
                  type="text"
                  value={nombreTitular}
                  onChange={(e) => {
                    setNombreTitular(e.target.value.toUpperCase());
                    limpiarError("nombreTitular");
                  }}
                  className={clsx(
                    "mt-2 block w-full rounded-lg border-2 bg-white px-3 py-2.5 text-sm uppercase",
                    "focus:outline-none focus:ring-2 focus:ring-casal focus:border-transparent",
                    errores.nombreTitular ? "border-red-500" : "border-gray-300"
                  )}
                  placeholder="NOMBRE COMO APARECE EN LA TARJETA"
                />
                {errores.nombreTitular && (
                  <p className="text-red-500 text-sm mt-1">{errores.nombreTitular}</p>
                )}
              </Field>

              {/* Fecha de expiración y CVV */}
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <Label className="text-sm font-semibold text-gray-700">
                    Fecha de expiración
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="text"
                      value={mesExpiracion}
                      onChange={handleMesChange}
                      maxLength={2}
                      className={clsx(
                        "block w-full rounded-lg border-2 bg-white px-3 py-2.5 text-sm text-center",
                        "focus:outline-none focus:ring-2 focus:ring-casal focus:border-transparent",
                        errores.mesExpiracion ? "border-red-500" : "border-gray-300"
                      )}
                      placeholder="MM"
                    />
                    <span className="text-gray-400 text-xl flex items-center">/</span>
                    <Input
                      type="text"
                      value={anioExpiracion}
                      onChange={handleAnioChange}
                      maxLength={2}
                      className={clsx(
                        "block w-full rounded-lg border-2 bg-white px-3 py-2.5 text-sm text-center",
                        "focus:outline-none focus:ring-2 focus:ring-casal focus:border-transparent",
                        errores.anioExpiracion ? "border-red-500" : "border-gray-300"
                      )}
                      placeholder="AA"
                    />
                  </div>
                  {(errores.mesExpiracion || errores.anioExpiracion) && (
                    <p className="text-red-500 text-sm mt-1">
                      {errores.mesExpiracion || errores.anioExpiracion}
                    </p>
                  )}
                </Field>

                <Field>
                  <Label className="text-sm font-semibold text-gray-700">CVV</Label>
                  <Input
                    type="text"
                    value={cvv}
                    onChange={handleCvvChange}
                    maxLength={4}
                    className={clsx(
                      "mt-2 block w-full rounded-lg border-2 bg-white px-3 py-2.5 text-sm text-center",
                      "focus:outline-none focus:ring-2 focus:ring-casal focus:border-transparent",
                      errores.cvv ? "border-red-500" : "border-gray-300"
                    )}
                    placeholder="123"
                  />
                  {errores.cvv && (
                    <p className="text-red-500 text-sm mt-1">{errores.cvv}</p>
                  )}
                </Field>
              </div>

              {/* Correo electrónico */}
              <Field>
                <Label className="text-sm font-semibold text-gray-700">
                  Correo electrónico
                </Label>
                <Input
                  type="email"
                  value={correoElectronico}
                  onChange={(e) => {
                    setCorreoElectronico(e.target.value);
                    limpiarError("correoElectronico");
                  }}
                  className={clsx(
                    "mt-2 block w-full rounded-lg border-2 bg-white px-3 py-2.5 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-casal focus:border-transparent",
                    errores.correoElectronico ? "border-red-500" : "border-gray-300"
                  )}
                  placeholder="correo@ejemplo.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enviaremos el comprobante de pago a este correo
                </p>
                {errores.correoElectronico && (
                  <p className="text-red-500 text-sm mt-1">{errores.correoElectronico}</p>
                )}
              </Field>

              {/* Error general */}
              {errores.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{errores.general}</p>
                </div>
              )}

              {/* Botón de pago */}
              <Button
                type="submit"
                disabled={procesando}
                className="w-full bg-casal text-white py-3 rounded-lg font-semibold hover:bg-casal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {procesando ? (
                  <>
                    <InlineSpinner size="sm" />
                    Procesando pago...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Pagar ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </>
                )}
              </Button>

              {/* Mensaje de seguridad */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Lock className="w-4 h-4" />
                <span>Pago seguro y encriptado</span>
              </div>
            </form>
          </div>

          {/* Resumen del pedido */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen del pago
            </h3>

            <div className="space-y-3 pb-4 border-b border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cuotas seleccionadas:</span>
                <span className="font-medium text-gray-900">{selectedIds.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">
                  ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">Total a pagar:</span>
                <span className="text-2xl font-bold text-casal">
                  ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Información importante
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-casal mt-0.5">•</span>
                  <span>El cargo aparecerá en tu estado de cuenta como "MATIZ PRODUCCIONES"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-casal mt-0.5">•</span>
                  <span>Recibirás un comprobante de pago por correo electrónico</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-casal mt-0.5">•</span>
                  <span>Tu pago será procesado de forma segura</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
