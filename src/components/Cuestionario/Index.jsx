import React, { useState, useEffect } from "react";
import InlineSpinner from "../ui/InlineSpinner";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../../assets/LOGOPLANORIA1.png";
import IconCuestionario from "../../assets/recursos/IconoCuestionario.svg";
import confirmacionWhatsapp from "../../assets/recursos/ConfirmacionWhastapp.svg";
import SolicitudCodigo from "../../assets/recursos/solicitudCodigo.svg";
import CuestionarioCreado from "../../assets/recursos/CUESTIONARIO_CREADO.svg";
import { Button, Field, Input, Label, Select } from "@headlessui/react";
import clsx from "clsx";
import { RotateCcw, AlertCircle, ChevronDown } from "lucide-react";
import { useCuestionario } from "../../hooks/useCuestionario";
import eventService from "../../services/eventService";
import { whatsappService, codigoVerificacionService } from "../../services";
import { useNotifications } from "../../contexts/NotificationContext";
import EnvConfig from "../../utils/config";

// Función para formatear fecha
const formatearFecha = (fechaString) => {
  if (!fechaString) return "25 de junio de 2025";

  try {
    const fecha = new Date(fechaString);
    const opciones = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Mexico_City",
    };

    return fecha.toLocaleDateString("es-MX", opciones);
  } catch (error) {
    return fechaString; // Retorna la fecha original si hay error
  }
};

// Función para formatear hora
const formatearHora = (fechaString) => {
  if (!fechaString) return "17:00 hrs";

  try {
    const fecha = new Date(fechaString);
    const opciones = {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Mexico_City",
    };

    return fecha.toLocaleTimeString("es-MX", opciones) + " hrs";
  } catch (error) {
    return fechaString; // Retorna la fecha original si hay error
  }
};

export default function Cuestionario() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { crearInvitado } = useCuestionario();
  const { showSuccess, showError } = useNotifications();

  const [event, setEvent] = useState(null);
  const [code, setCode] = useState("");
  const [licenciaturas, setLicenciaturas] = useState([]);
  // const [restricciones, setRestricciones] = useState({
  //   vegetariano: 0,
  //   vegano: 0,
  //   sinGluten: 0,
  //   alergiaMarisco: 0,
  // });
  // const [otra, setOtra] = useState("");
  const [pasoActual, setPasoActual] = useState(0);
  const [nombre, setNombre] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [licenciatura, setLicenciatura] = useState("");
  const [correo, setCorreo] = useState("");
  const [carrera, setCarrera] = useState("");
  const [escuela, setEscuela] = useState("");
  const [telefono, setTelefono] = useState("");
  const [boletos, setBoletos] = useState("");
  const [contactoEmergencia, setContactoEmergencia] = useState("");
  const [nombreTutor, setNombreTutor] = useState("");
  const [apellidoPaternoTutor, setApellidoPaternoTutor] = useState("");
  const [apellidoMaternoTutor, setApellidoMaternoTutor] = useState("");
  const [fechaNacimientoTutor, setFechaNacimientoTutor] = useState("");
  const [correoTutor, setCorreoTutor] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [esMayorDeEdad, setEsMayorDeEdad] = useState(false);
  const [aceptaResponsabilidadTutor, setAceptaResponsabilidadTutor] =
    useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const tutorRequerido = event?.requiere_tutor;
  // Estados para errores de validación
  const [errores, setErrores] = useState({});

  // Estados adicionales para WhatsApp
  const [isGenerandoCodigo, setIsGenerandoCodigo] = useState(false);
  const [isVerificandoCodigo, setIsVerificandoCodigo] = useState(false);
  const [isReenviandoCodigo, setIsReenviandoCodigo] = useState(false);
  const [codigoGenerado, setCodigoGenerado] = useState(null);
  const [tiempoExpiracion, setTiempoExpiracion] = useState(null);
  const [intentosRestantes, setIntentosRestantes] = useState(3);
  const [codigoVerificado, setCodigoVerificado] = useState(false);
  const [mostrarCamposCodigo, setMostrarCamposCodigo] = useState(false);
  const [isEnviandoFormulario, setIsEnviandoFormulario] = useState(false);

  useEffect(() => {
    if (eventId) {
      eventService.getEventCuestionario(eventId).then((res) => {
        if (res.success) {
          setEvent(res.event);
          setLicenciaturas(res.event?.licenciatura?.split(",").map((l) => l.trim()));
          console.log(res.event);
        }
      });
    }
  }, [eventId]);

  // Función para calcular la edad y verificar mayoría de edad
  const calcularEdad = (fechaNac) => {
    if (!fechaNac) return 0;

    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  };

  // Efecto para verificar mayoría de edad cuando cambia la fecha de nacimiento
  useEffect(() => {
    if (fechaNacimiento) {
      const edad = calcularEdad(fechaNacimiento);
      setEsMayorDeEdad(edad >= 18);

      // Si es mayor de edad, resetear el checkbox de responsabilidad del tutor
      if (edad >= 18) {
        setAceptaResponsabilidadTutor(false);
      }
    } else {
      setEsMayorDeEdad(false);
      setAceptaResponsabilidadTutor(false);
    }
  }, [fechaNacimiento]);

  // Función para generar código WhatsApp
  const handleGenerarCodigoWhatsApp = async () => {
    if (!telefono.trim()) {
      showError("Por favor ingresa tu número de teléfono");
      return;
    }

    setIsGenerandoCodigo(true);
    try {
      const response = await whatsappService.generarCodigo(telefono.trim());

      if (response.status === "ok") {
        setCodigoGenerado(response.codigo);
        setTiempoExpiracion(response.expira);
        setMostrarCamposCodigo(true);
        showSuccess("Código enviado por WhatsApp. Revisa tu teléfono.");
      } else {
        showError("Error al generar el código de verificación");
      }
    } catch (error) {
      console.error("Error al generar código WhatsApp:", error);
      showError("Error al enviar el código por WhatsApp. Intenta nuevamente.");
    } finally {
      setIsGenerandoCodigo(false);
    }
  };

  // Función para reenviar código
  const handleReenviarCodigo = async () => {
    setIsReenviandoCodigo(true);
    try {
      const response = await whatsappService.reenviarCodigo(telefono);

      if (response.status === "ok") {
        setCodigoGenerado(response.codigo);
        setTiempoExpiracion(response.expira);
        setIntentosRestantes(3); // Resetear intentos
        showSuccess("Nuevo código enviado por WhatsApp");
      } else {
        showError("Error al reenviar el código");
      }
    } catch (error) {
      console.error("Error al reenviar código:", error);
      showError("Error al reenviar el código. Intenta nuevamente.");
    } finally {
      setIsReenviandoCodigo(false);
    }
  };

  // Función para verificar código
  const handleVerificarCodigo = async () => {
    if (!code.trim()) {
      showError("Por favor ingresa el código de verificación");
      return;
    }

    setIsVerificandoCodigo(true);
    try {
      const response = await codigoVerificacionService.verificarCodigo(
        telefono,
        code,
      );

      if (response.success) {
        setCodigoVerificado(true);
        showSuccess(
          "Teléfono verificado correctamente. Ahora puedes enviar el formulario.",
        );
      }
    } catch (error) {
      console.error("Error al verificar código:", error);

      // Manejar errores específicos
      if (error.message.includes("máximo de intentos")) {
        setIntentosRestantes(0);
        showError(
          "Has alcanzado el máximo de intentos. Solicita un nuevo código.",
        );
      } else if (error.message.includes("expirado")) {
        showError("El código ha expirado. Solicita un nuevo código.");
      } else if (error.message.includes("incorrecto")) {
        setIntentosRestantes((prev) => Math.max(0, prev - 1));
        showError(
          `Código incorrecto. Te quedan ${intentosRestantes - 1} intentos.`,
        );
      } else {
        showError(error.message);
      }

      // Limpiar código si es incorrecto
      setCode("");
    } finally {
      setIsVerificandoCodigo(false);
    }
  };

  // Función para limpiar error de un campo específico
  const limpiarError = (campo) => {
    if (errores[campo]) {
      setErrores((prev) => {
        const nuevosErrores = { ...prev };
        delete nuevosErrores[campo];
        return nuevosErrores;
      });
    }
  };

  // Función para validar campos obligatorios
  const validarCampos = () => {
    const nuevosErrores = {};

    // Validar campos básicos
    if (!nombre.trim())
      nuevosErrores.nombre = "El nombre completo es obligatorio";

    if (!apellidoPaterno.trim())
      nuevosErrores.apellidoPaterno = "El apellido paterno es obligatorio";

    if (!apellidoMaterno.trim())
      nuevosErrores.apellidoMaterno = "El apellido materno es obligatorio";

    if (!correo.trim())
      nuevosErrores.correo = "El correo electrónico es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      nuevosErrores.correo = "El correo electrónico no es válido";
    }

    if (licenciaturas.length > 1 && !licenciatura.trim()) {
      nuevosErrores.licenciatura = "La licenciatura es obligatoria";
    }

    // if (!carrera.trim()) nuevosErrores.carrera = "La carrera es obligatoria";
    // if (!escuela.trim())
    //   nuevosErrores.escuela = "La escuela o institución es obligatoria";
    if (!boletos || parseInt(boletos) <= 0)
      nuevosErrores.boletos = "La cantidad de boletos es obligatoria";

    if (!fechaNacimiento)
      nuevosErrores.fechaNacimiento = "La fecha de nacimiento es obligatoria";

    // Validar teléfono y código
    if (!telefono.trim())
      nuevosErrores.telefono = "El número de teléfono es obligatorio";

    if (!codigoVerificado)
      nuevosErrores.codigoVerificado = "Debes verificar tu número de teléfono";

    if (tutorRequerido) {
      if (!contactoEmergencia.trim())
        nuevosErrores.contactoEmergencia =
          "El contacto de emergencia es obligatorio";
      // Validar datos del tutor
      if (!nombreTutor.trim())
        nuevosErrores.nombreTutor = "El nombre del tutor es obligatorio";
      if (!apellidoPaternoTutor.trim())
        nuevosErrores.apellidoPaternoTutor =
          "El apellido paterno del tutor es obligatorio";
      if (!apellidoMaternoTutor.trim())
        nuevosErrores.apellidoMaternoTutor =
          "El apellido materno del tutor es obligatorio";
      if (!correoTutor.trim())
        nuevosErrores.correoTutor = "El correo del tutor es obligatorio";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoTutor)) {
        nuevosErrores.correoTutor = "El correo electrónico no es válido";
      }

      // Validar fecha de nacimiento del tutor
      if (!fechaNacimientoTutor) {
        nuevosErrores.fechaNacimientoTutor =
          "La fecha de nacimiento del tutor es obligatoria";
      } else {
        const edad = calcularEdad(fechaNacimientoTutor);
        if (edad < 18) {
          nuevosErrores.fechaNacimientoTutor =
            "El tutor debe ser mayor de edad";
        }
      }
    }

    // Validar que si es menor de edad, acepte la responsabilidad del tutor
    if (!esMayorDeEdad && fechaNacimiento && !aceptaResponsabilidadTutor) {
      nuevosErrores.aceptaResponsabilidadTutor =
        "Debes aceptar que un tutor legal se hará responsable";
    }

    // Validar términos y condiciones
    if (!aceptaTerminos) {
      nuevosErrores.aceptaTerminos = "Debes aceptar los términos y condiciones";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Función para enviar el formulario completo
  const handleEnviarFormulario = async () => {
    // Validar campos obligatorios antes de enviar
    if (!validarCampos()) {
      showError("Por favor completa todos los campos obligatorios");
      return;
    }

    setIsEnviandoFormulario(true);

    const payload = {
      id_evento: eventId,
      numero: telefono,
      nombre_completo: nombre,
      apellido_paterno: apellidoPaterno,
      apellido_materno: apellidoMaterno,
      licenciatura: licenciatura,
      correo: correo,
      // licenciatura: carrera,
      instituto: escuela,
      cantidad_boletos: parseInt(boletos) || 0,
      // contacto_emergencias: contactoEmergencia,
      fecha_nacimiento: fechaNacimiento,
      tutor: {
        nombre: nombreTutor,
        apellidoPaterno: apellidoPaternoTutor,
        apellidoMaterno: apellidoMaternoTutor,
        fecha_nacimiento: fechaNacimientoTutor,
        correo: correoTutor,
        numero_contacto: contactoEmergencia,
      },
      // Restricciones comentadas temporalmente
      // restricciones: [
      //   {
      //     vegetariano: restricciones.vegetariano,
      //     vegano: restricciones.vegano,
      //     sin_gluten: restricciones.sinGluten,
      //     alergias_mariscos: restricciones.alergiaMarisco,
      //     otra: otra ? 1 : 0,
      //     otra: otra ? 1 : 0,
      //   }
      // ]
      requiere_tutor: tutorRequerido,
    };

    try {
      const res = await crearInvitado(payload);
      if (res.success) {
        setCustomerId(res.invitado.id || "");

        // Enviar confirmación de registro exitoso por WhatsApp
        // try {
        //   await whatsappService.confirmarRegistro(telefono);
        //   console.log("Mensaje de confirmación enviado por WhatsApp");
        // } catch (whatsappError) {
        //   console.error(
        //     "Error al enviar confirmación por WhatsApp:",
        //     whatsappError,
        //   );
        //   // No mostramos error al usuario ya que el registro fue exitoso
        // }

        showSuccess("¡Registro completado exitosamente!");

        // Redirigir a la página de firma de contrato
        setTimeout(() => {
          navigate(`/firma-contrato/${res.invitado.id}`);
        }, 1500);
      } else {
        console.error("Error al guardar:", res.error);
        showError("Error al completar el registro. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al crear invitado:", error);
      showError("Error al completar el registro. Intenta nuevamente.");
    } finally {
      setIsEnviandoFormulario(false);
    }
  };

  // Función comentada temporalmente - para restricciones alimenticias
  // const handleChange = (key, delta) => {
  //   setRestricciones((prev) => ({
  //     ...prev,
  //     [key]: Math.max(0, prev[key] + delta),
  //   }));
  // };

  const handleIrAPortalPagos = async () => {
    //navegar en una nueva pestaña al portal de pagos
    window.open(EnvConfig.BASE_URL + "/PortalPagos/" + customerId, "_blank");
  };

  return (
    <div className="bg-porcelain min-h-screen flex flex-col justify-center ">
      <div>
        <div className="w-full max-w-4xl mx-auto p-6 ">
          <div className="flex-1">
            <img src={logo} alt="Logo" className="w-36 h-auto mx-auto mb-5" />
            {/* Paso uno: Cuestionario que debe llenar el invitado */}
            {pasoActual === 0 && (
              <div>
                <img
                  src={IconCuestionario}
                  alt="Icono Cuestionario"
                  className="w-20 h-auto mx-auto"
                />
                <h1 className="text-3xl font-semibold mt-4 text-center text-dark-sienna mb-6 text-casal">
                  {`Cuestionario de Registro ${
                    event?.instituto || "Instituto Villa Rica"
                  }`}
                </h1>
                <h1 className="text-xl font-semibold mt-4 text-center text-gray-800 mb-6 text-grey-800">
                  {event?.nombre_evento ||
                    "Ceremonia de Graduación - Generación 2025"}
                </h1>
                <div className="bg-white p-6 rounded-lg shadow-md w-full mx-auto">
                  <p className="text-casal font-bold text-center">
                    ¡Felicidades por tu próxima graduación!
                  </p>
                  <p className="text-gray-900 mt-4 text-justify">
                    Por favor completa este formulario con tus datos. Esta
                    Información nos ayudará a organizar de la mejor forma el
                    evento, asignar tus boletos y tomar en cuenta tus
                    necesidades.
                  </p>
                  <p className="text-gray-900 mt-4 text-justify">
                    <b> Fecha: </b> {formatearFecha(event?.fecha_evento)}
                  </p>
                  <p className="text-gray-900 mt-0 text-justify">
                    <b>Hora:</b> {formatearHora(event?.fecha_evento)}
                  </p>
                  <p className="text-gray-900 mt-0 text-justify">
                    <b>Lugar:</b>{" "}
                    {event?.lugar?.nombre ||
                      event?.lugar_evento ||
                      "Auditorio Central, Universidad Nacional"}
                  </p>
                </div>
                <div className="w-full mx-auto mt-6">
                  <Field>
                    <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                      Datos del graduado
                    </Label>
                    <div className="p-4 border-2 rounded-2xl bg-white/30 border-[#bcd6e4] grid grid-cols-1 lg:grid-cols-6 gap-2">
                      <div className="mb-3 lg:col-span-2">
                        <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                          Nombre (s)
                        </Label>
                        <Input
                          type="text"
                          value={nombre}
                          onChange={(e) => {
                            setNombre(e.target.value);
                            limpiarError("nombre");
                          }}
                          className={clsx(
                            "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                            "placeholder:italic",
                            "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                            errores.nombre ? "border-red-500" : "",
                          )}
                          placeholder="Tu Respuesta"
                        />
                        {errores.nombre && (
                          <p className="text-red-500 text-sm mt-1">
                            {errores.nombre}
                          </p>
                        )}
                      </div>

                      <div className="mb-3 lg:col-span-2">
                        <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                          Apellido paterno
                        </Label>
                        <Input
                          type="text"
                          value={apellidoPaterno}
                          onChange={(e) => {
                            setApellidoPaterno(e.target.value);
                            limpiarError("apellidoPaterno");
                          }}
                          className={clsx(
                            "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                            "placeholder:italic",
                            "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                            errores.nombre ? "border-red-500" : "",
                          )}
                          placeholder="Tu Respuesta"
                        />
                        {errores.nombre && (
                          <p className="text-red-500 text-sm mt-1">
                            {errores.nombre}
                          </p>
                        )}
                      </div>

                      <div className="mb-3 lg:col-span-2">
                        <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                          Apellido materno
                        </Label>
                        <Input
                          type="text"
                          value={apellidoMaterno}
                          onChange={(e) => {
                            setApellidoMaterno(e.target.value);
                            limpiarError("apellidoMaterno");
                          }}
                          className={clsx(
                            "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                            "placeholder:italic",
                            "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                            errores.apellidoMaterno ? "border-red-500" : "",
                          )}
                          placeholder="Tu Respuesta"
                        />
                        {errores.nombre && (
                          <p className="text-red-500 text-sm mt-1">
                            {errores.nombre}
                          </p>
                        )}
                      </div>

                      <div className="mb-3 lg:col-span-6">
                        <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                          Fecha de nacimiento
                        </Label>
                        <Input
                          type="date"
                          value={fechaNacimiento}
                          onChange={(e) => {
                            setFechaNacimiento(e.target.value);
                            limpiarError("fechaNacimiento");
                          }}
                          className={clsx(
                            "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                            "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                            errores.fechaNacimiento ? "border-red-500" : "",
                          )}
                        />
                        {errores.fechaNacimiento && (
                          <p className="text-red-500 text-sm mt-1">
                            {errores.fechaNacimiento}
                          </p>
                        )}

                        {/* Checkbox para menor de edad */}
                        {fechaNacimiento && !esMayorDeEdad && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <label className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={aceptaResponsabilidadTutor}
                                onChange={(e) => {
                                  setAceptaResponsabilidadTutor(
                                    e.target.checked,
                                  );
                                  limpiarError("aceptaResponsabilidadTutor");
                                }}
                                className="mt-1 w-4 h-4 text-casal border-gray-300 rounded focus:ring-casal"
                              />
                              <span className="text-sm text-gray-700">
                                Confirmo que un tutor legal se hará responsable
                              </span>
                            </label>
                            {errores.aceptaResponsabilidadTutor && (
                              <p className="text-red-500 text-sm mt-1 ml-6">
                                {errores.aceptaResponsabilidadTutor}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mb-3 lg:col-span-6">
                        <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                          Correo electrónico personal (No institucional)
                        </Label>
                        <Input
                          type="email"
                          value={correo}
                          onChange={(e) => {
                            setCorreo(e.target.value);
                            limpiarError("correo");
                          }}
                          className={clsx(
                            "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                            "placeholder:italic",
                            "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                            errores.correo ? "border-red-500" : "",
                          )}
                          placeholder="correo@ejemplo.com"
                        />
                        {errores.correo && (
                          <p className="text-red-500 text-sm mt-1">
                            {errores.correo}
                          </p>
                        )}
                      </div>

                      {licenciaturas.length > 1 && (
                        <div className="mb-3 lg:col-span-6">
                          <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300">
                            Licenciatura o especialidad
                          </label>
                          <div className="">
                            <Select
                              value={licenciatura}
                              onChange={(e) => setLicenciatura(e.target.value)}
                              // disabled={isLoadingLugares}
                              className={clsx(
                                "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                                "placeholder:italic",
                                "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                                errores.licenciatura ? "border-red-500" : "",
                              )}
                            >
                              <option value="">
                                {"Seleccionar licenciatura"}
                              </option>
                              {licenciaturas.map((licenciatura) => (
                                <option key={licenciatura} value={licenciatura}>
                                  {licenciatura}
                                </option>
                              ))}
                            </Select>
                            <ChevronDown
                              className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                              aria-hidden="true"
                            />
                            {errores.licenciatura && (
                              <p className="text-red-500 text-sm mt-1">
                                {errores.licenciatura}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* <div className="mb-3">
                      <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                        Carrera o estudios o realizados
                      </Label>
                      <Input
                        type="text"
                        value={carrera}
                        onChange={(e) => {
                          setCarrera(e.target.value);
                          limpiarError("carrera");
                        }}
                        className={clsx(
                          "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                          "placeholder:italic",
                          "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                          errores.carrera ? "border-red-500" : ""
                        )}
                        placeholder="Tu Respuesta"
                      />
                      {errores.carrera && (
                        <p className="text-red-500 text-sm mt-1">
                          {errores.carrera}
                        </p>
                      )}
                    </div>
                    <div className="mb-3">
                      <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                        Escuela o institución
                      </Label>
                      <Input
                        type="text"
                        value={escuela}
                        onChange={(e) => {
                          setEscuela(e.target.value);
                          limpiarError("escuela");
                        }}
                        className={clsx(
                          "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                          "placeholder:italic",
                          "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                          errores.escuela ? "border-red-500" : ""
                        )}
                        placeholder="Tu Respuesta"
                      />
                      {errores.escuela && (
                        <p className="text-red-500 text-sm mt-1">
                          {errores.escuela}
                        </p>
                      )}
                    </div> */}
                      <div className="mb-3 lg:col-span-6">
                        <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                          Número aproximado de boletos a solicitar con graduado
                          incluido
                        </Label>
                        <Input
                          type="number"
                          value={boletos}
                          onChange={(e) => {
                            setBoletos(e.target.value);
                            limpiarError("boletos");
                          }}
                          min={1}
                          max={8}
                          className={clsx(
                            "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                            "placeholder:italic",
                            "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                            errores.boletos ? "border-red-500" : "",
                          )}
                          placeholder="Tu Respuesta"
                        />
                        {errores.boletos && (
                          <p className="text-red-500 text-sm mt-1">
                            {errores.boletos}
                          </p>
                        )}
                      </div>
                      {/* RESTRICCIONES ALIMENTICIAS - COMENTADO TEMPORALMENTE */}
                      {/* <div className="mb-3">
                      <Label className="text-sm/6">
                        <span className="text-casal font-semibold dark:text-towerGray">
                          Restricciones alimenticias
                        </span>{" "}
                        <span className="text-gray-800 dark:text-gray-200">
                          {" "}
                          Ejemplo: vegetarianos, vegano, sin gluten, alergias a
                          mariscos, etc
                        </span>
                      </Label>
                      <div className="p-4 border-2 rounded-2xl bg-white border-[#bcd6e4]">
                        {[
                          { label: "Vegetariano", key: "vegetariano" },
                          { label: "Vegano", key: "vegano" },
                          { label: "Sin gluten", key: "sinGluten" },
                          { label: "Alergia a marisco", key: "alergiaMarisco" },
                        ].map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center justify-between mb-2"
                          >
                            <span className="text-gray-600 font-medium w-40">
                              {item.label}
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                className="w-6 h-6 rounded-full border border-gray-400 text-gray-600 flex items-center justify-center hover:bg-gray-100"
                                onClick={() => handleChange(item.key, -1)}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                className="w-6 h-6 rounded-full border border-gray-400 text-gray-600  flex items-center justify-center hover:bg-gray-100"
                                onClick={() => handleChange(item.key, 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <span className="text-gray-600  w-24 text-right">
                              {restricciones[item.key]} personas
                            </span>
                          </div>
                        ))}
                        <div className="mt-3 mb-1 text-gray-600 font-medium">
                          Añadir una restricción específica
                        </div>
                        <input
                          type="text"
                          value={otra}
                          onChange={(e) => setOtra(e.target.value)}
                          placeholder="Tu Respuesta"
                          className={clsx(
                            "mt-2 block w-full rounded-3xl border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                            "placeholder:italic",
                            "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                          )}
                        />
                      </div>
                    </div> */}
                      {/* <div className="mb-3">
                      <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                        Contacto de emergencia
                      </Label>
                      <Input
                        type="text"
                        value={contactoEmergencia}
                        onChange={(e) => {
                          setContactoEmergencia(e.target.value);
                          limpiarError('contactoEmergencia');
                        }}
                        className={clsx(
                          "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                          "placeholder:italic",
                          "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                          errores.contactoEmergencia ? "border-red-500" : ""
                        )}
                        placeholder="Tu Respuesta"
                      />
                      {errores.contactoEmergencia && (
                        <p className="text-red-500 text-sm mt-1">{errores.contactoEmergencia}</p>
                      )}
                    </div> */}
                    </div>

                    {tutorRequerido && (
                      <div className="mb-3 mt-5">
                        <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                          Datos del tutor o responsable
                        </Label>
                        <div className="p-4 border-2 rounded-2xl bg-white/30 border-[#bcd6e4] grid grid-cols-1 lg:grid-cols-3 gap-2">
                          <div className="mb-3">
                            <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                              Nombre (s)
                            </Label>
                            <Input
                              type="text"
                              value={nombreTutor}
                              onChange={(e) => {
                                setNombreTutor(e.target.value);
                                limpiarError("nombreTutor");
                              }}
                              className={clsx(
                                "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6  text-gray-700",
                                "placeholder:italic",
                                "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                                errores.nombreTutor ? "border-red-500" : "",
                              )}
                              placeholder="Nombre(s) de la persona responsable"
                            />
                            {errores.nombreTutor && (
                              <p className="text-red-500 text-sm mt-1">
                                {errores.nombreTutor}
                              </p>
                            )}
                          </div>
                          <div className="mb-3">
                            <Label className="text-sm/6 font-semibold text-casal">
                              Apellido paterno
                            </Label>
                            <Input
                              value={apellidoPaternoTutor}
                              onChange={(e) => {
                                setApellidoPaternoTutor(e.target.value);
                                limpiarError("apellidoPaternoTutor");
                              }}
                              type="text"
                              className={clsx(
                                "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 text-gray-700",
                                "placeholder:italic",
                                "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                                errores.apellidoPaternoTutor
                                  ? "border-red-500"
                                  : "",
                              )}
                              placeholder="Apellido paterno de la persona responsable"
                            />
                            {errores.apellidoPaternoTutor && (
                              <p className="text-red-500 text-sm mt-1">
                                {errores.apellidoPaternoTutor}
                              </p>
                            )}
                          </div>
                          <div className="mb-3">
                            <Label className="text-sm/6 font-semibold text-casal">
                              Apellido materno
                            </Label>
                            <Input
                              type="text"
                              value={apellidoMaternoTutor}
                              onChange={(e) => {
                                setApellidoMaternoTutor(e.target.value);
                                limpiarError("apellidoMaternoTutor");
                              }}
                              className={clsx(
                                "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 text-gray-700",
                                "placeholder:italic",
                                "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                                errores.apellidoMaternoTutor
                                  ? "border-red-500"
                                  : "",
                              )}
                              placeholder="Apellido materno de la persona responsable"
                            />
                            {errores.apellidoMaternoTutor && (
                              <p className="text-red-500 text-sm mt-1">
                                {errores.apellidoMaternoTutor}
                              </p>
                            )}
                          </div>
                          <div className="mb-3 lg:col-span-6">
                            <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                              Correo electrónico del tutor
                            </Label>
                            <Input
                              type="email"
                              value={correoTutor}
                              onChange={(e) => {
                                setCorreoTutor(e.target.value);
                                limpiarError("correoTutor");
                              }}
                              className={clsx(
                                "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6  text-gray-700",
                                "placeholder:italic",
                                "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                                errores.correoTutor ? "border-red-500" : "",
                              )}
                              placeholder="correo@ejemplo.com"
                            />
                            {errores.correoTutor && (
                              <p className="text-red-500 text-sm mt-1">
                                {errores.correoTutor}
                              </p>
                            )}
                          </div>
                          <div className="mb-3 lg:col-span-6">
                            <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                              Fecha de nacimiento del tutor
                            </Label>
                            <Input
                              type="date"
                              value={fechaNacimientoTutor}
                              onChange={(e) => {
                                setFechaNacimientoTutor(e.target.value);
                                limpiarError("fechaNacimientoTutor");
                              }}
                              className={clsx(
                                "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                                "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                                errores.fechaNacimientoTutor
                                  ? "border-red-500"
                                  : "",
                              )}
                            />
                            {errores.fechaNacimientoTutor && (
                              <p className="text-red-500 text-sm mt-1">
                                {errores.fechaNacimientoTutor}
                              </p>
                            )}
                          </div>
                          <div className="mb-3 lg:col-span-3">
                            <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                              Teléfono
                            </Label>
                            <Input
                              type="text"
                              value={contactoEmergencia}
                              onChange={(e) => {
                                setContactoEmergencia(e.target.value);
                                limpiarError("contactoEmergencia");
                              }}
                              className={clsx(
                                "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                                "placeholder:italic",
                                "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                                errores.contactoEmergencia
                                  ? "border-red-500"
                                  : "",
                              )}
                              placeholder="Tu Respuesta"
                            />
                            {errores.contactoEmergencia && (
                              <p className="text-red-500 text-sm mt-1">
                                {errores.contactoEmergencia}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-3 mt-4">
                      <div className="p-4 border-2 rounded-2xl bg-white border-[#bcd6e4]">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={aceptaTerminos}
                            onChange={(e) => {
                              setAceptaTerminos(e.target.checked);
                              limpiarError("aceptaTerminos");
                            }}
                            className="mt-1 w-5 h-5 text-casal border-gray-300 rounded focus:ring-casal"
                          />
                          <span className="text-sm text-gray-700">
                            Acepto los{" "}
                            <button
                              type="button"
                              className="text-casal underline font-semibold hover:text-Acapulco"
                              onClick={() => {
                                // Aquí puedes abrir un modal o redirigir a la página de términos
                                console.log("Abrir términos y condiciones");
                              }}
                            >
                              términos y condiciones
                            </button>
                          </span>
                        </label>
                        {errores.aceptaTerminos && (
                          <p className="text-red-500 text-sm mt-2 ml-8">
                            {errores.aceptaTerminos}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Sección de verificación de teléfono */}
                    <div className="mb-3">
                      <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                        Número de teléfono (WhatsApp)
                      </Label>
                      <div className="flex gap-2 items-start">
                        <div className="flex-1">
                          <Input
                            type="text"
                            value={telefono}
                            onChange={(e) => {
                              setTelefono(e.target.value);
                              limpiarError("telefono");
                              // Reset estados si cambia el teléfono
                              if (codigoVerificado) {
                                setCodigoVerificado(false);
                                setMostrarCamposCodigo(false);
                                setCode("");
                              }
                            }}
                            disabled={codigoVerificado}
                            className={clsx(
                              "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                              "placeholder:italic",
                              "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                              "disabled:bg-gray-100 disabled:cursor-not-allowed",
                              errores.telefono ? "border-red-500" : "",
                            )}
                            placeholder="+52 (55) 1234 5678"
                          />
                          {errores.telefono && (
                            <p className="text-red-500 text-sm mt-1">
                              {errores.telefono}
                            </p>
                          )}
                        </div>
                        {!codigoVerificado && (
                          <Button
                            type="button"
                            onClick={handleGenerarCodigoWhatsApp}
                            disabled={isGenerandoCodigo || !telefono.trim()}
                            className="mt-2 bg-green-600 text-white px-4 py-1.5 rounded-3xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-sm font-medium flex items-center gap-1 whitespace-nowrap"
                          >
                            {isGenerandoCodigo ? (
                              <>
                                <InlineSpinner size="sm" />
                                Enviando...
                              </>
                            ) : mostrarCamposCodigo ? (
                              <>
                                <RotateCcw className="w-4 h-4" />
                                Reenviar
                              </>
                            ) : (
                              "Enviar código"
                            )}
                          </Button>
                        )}
                        {codigoVerificado && (
                          <div className="mt-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-3xl text-sm font-medium flex items-center gap-1">
                            ✓ Verificado
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Campo de código de verificación */}
                    {mostrarCamposCodigo && !codigoVerificado && (
                      <div className="mb-3 p-4 bg-green-50 border-2 border-green-200 rounded-2xl">
                        <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                          Código de verificación
                        </Label>
                        <p className="text-gray-600 text-xs mt-1 mb-2">
                          Introduce el código que te enviamos por WhatsApp
                        </p>
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 rounded">
                          <p className="text-xs text-blue-800">
                            <strong>💡 Tip:</strong> Agrega el número que te envió el código a tus contactos. 
                            Por ese medio recibirás actualizaciones importantes sobre tu registro y el evento.
                          </p>
                        </div>
                        <div className="flex gap-2 items-start">
                          <div className="flex-1">
                            <Input
                              type="text"
                              value={code}
                              onChange={(e) => setCode(e.target.value)}
                              className={clsx(
                                "block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 text-gray-700 text-center font-medium",
                                "placeholder:italic",
                                "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                              )}
                              placeholder="123456"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={handleVerificarCodigo}
                            disabled={
                              isVerificandoCodigo ||
                              !code.trim() ||
                              intentosRestantes === 0
                            }
                            className="bg-casal text-white px-4 py-1.5 rounded-3xl hover:bg-Acapulco transition disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-1"
                          >
                            {isVerificandoCodigo ? (
                              <>
                                <InlineSpinner size="sm" />
                                Verificando...
                              </>
                            ) : (
                              "Verificar"
                            )}
                          </Button>
                        </div>

                        {/* Información de intentos y expiración */}
                        {intentosRestantes < 3 && intentosRestantes > 0 && (
                          <div className="mt-2">
                            <p className="text-yellow-600 text-xs flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Te quedan {intentosRestantes} intentos
                            </p>
                          </div>
                        )}
                        {intentosRestantes === 0 && (
                          <div className="mt-2">
                            <p className="text-red-600 text-xs flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Sin intentos restantes. Solicita un nuevo código.
                            </p>
                          </div>
                        )}
                        {tiempoExpiracion && (
                          <div className="mt-2">
                            <p className="text-gray-600 text-xs">
                              El código expira el{" "}
                              {new Date(tiempoExpiracion).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {errores.codigoVerificado && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errores.codigoVerificado}
                        </p>
                      </div>
                    )}

                    <div className="my-5 flex justify-center">
                      <Button
                        onClick={handleEnviarFormulario}
                        disabled={!codigoVerificado || isEnviandoFormulario}
                        className="bg-casal text-xl text-white w-[70%] mx-auto py-2 font-semibold rounded-3xl hover:bg-Acapulco transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isEnviandoFormulario ? (
                          <>
                            <InlineSpinner size="sm" />
                            Enviando...
                          </>
                        ) : (
                          "Enviar"
                        )}
                      </Button>
                    </div>
                  </Field>
                </div>
              </div>
            )}

            {/* paso dos debe de confirmar su numero de whatsapp */}
            {pasoActual === 1 && (
              <div className="space-y-9">
                <img
                  src={confirmacionWhatsapp}
                  alt="Icono Cuestionario"
                  className="w-20 h-auto mx-auto mt-10"
                />

                <div className="p-6  w-full mx-auto">
                  <h1 className="text-3xl font-semibold mt-4 text-center text-dark-sienna mb-3 text-casal">
                    Confirma tu número de WhatsApp para continuar
                  </h1>
                  <p className="text-gray-900 mt-4 text-center w-full lg:w-3/4 mx-auto">
                    Introduce tu número telefono con el que deseas recibir
                    notificaciones y accesos relacionados con tu graduación.
                  </p>
                </div>
                <div>
                  <Field>
                    <div className="mb-3 w-full mx-auto px-6">
                      <Input
                        type="text"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        className={clsx(
                          "mt-2 block w-full lg:w-3/4 mx-auto rounded-3xl border-2 bg-white px-4 py-2 text-lg font-semibold dark:text-white text-gray-700",
                          "placeholder:italic",
                          "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                        )}
                        placeholder="+52 (55) 1234 5678"
                      />
                    </div>
                    <div className="my-5 flex justify-center">
                      <Button
                        onClick={handleGenerarCodigoWhatsApp}
                        disabled={isGenerandoCodigo || !telefono.trim()}
                        className="bg-green-600 text-xl text-white w-[70%] lg:w-2/5 mx-auto py-2 font-semibold rounded-3xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                      >
                        {isGenerandoCodigo ? (
                          <>
                            <InlineSpinner size="sm" />
                            Enviando código...
                          </>
                        ) : (
                          "Enviar código por WhatsApp"
                        )}
                      </Button>
                    </div>
                  </Field>
                </div>
              </div>
            )}

            {/* paso tres: debe de confirmar el codigo de verificacion */}
            {pasoActual === 2 && (
              <div className="space-y-9">
                <img
                  src={SolicitudCodigo}
                  alt="Icono Cuestionario"
                  className="w-20 h-auto mx-auto mt-10"
                />
                <h1 className="text-3xl font-semibold mt-4 text-center text-dark-sienna mb-3 text-casal">
                  Introduce el código de confirmación que te enviamos a tu
                  WhatsApp
                </h1>

                <div>
                  <Field>
                    <div className="mb-3 w-full mx-auto px-6">
                      <Input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className={clsx(
                          "mt-2 block w-full lg:w-3/4 mx-auto rounded-3xl border-2 text-center bg-white px-4 py-2 text-xl font-semibold dark:text-white text-casal",
                          "placeholder:italic",
                          "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent",
                        )}
                        placeholder="123456"
                      />
                    </div>
                    <div className="my-5 flex justify-center">
                      <Button
                        onClick={handleVerificarCodigo}
                        disabled={
                          isVerificandoCodigo ||
                          !code.trim() ||
                          intentosRestantes === 0
                        }
                        aria-busy={isVerificandoCodigo}
                        className="bg-casal text-xl text-white w-[70%] lg:w-2/5 mx-auto py-2 font-semibold rounded-3xl hover:bg-Acapulco transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isVerificandoCodigo && <InlineSpinner size="sm" />}
                        {isVerificandoCodigo
                          ? "Verificando..."
                          : "Verificar código"}
                      </Button>
                    </div>

                    {/* Botón para reenviar código */}
                    <div className="my-3 flex justify-center">
                      <Button
                        onClick={handleReenviarCodigo}
                        disabled={isReenviandoCodigo}
                        className="bg-gray-100 text-gray-700 w-[70%] lg:w-2/5 mx-auto py-2 font-medium rounded-3xl hover:bg-gray-200 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isReenviandoCodigo ? (
                          <>
                            <InlineSpinner size="sm" />
                            Reenviando...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4" />
                            Reenviar código
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Mostrar información de intentos */}
                    {intentosRestantes < 3 && intentosRestantes > 0 && (
                      <div className="text-center mt-3">
                        <p className="text-yellow-600 text-sm">
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          Te quedan {intentosRestantes} intentos
                        </p>
                      </div>
                    )}
                    {intentosRestantes === 0 && (
                      <div className="text-center mt-3">
                        <p className="text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          Sin intentos restantes. Solicita un nuevo código.
                        </p>
                      </div>
                    )}

                    {/* Mostrar información de expiración */}
                    {tiempoExpiracion && (
                      <div className="text-center mt-3">
                        <p className="text-gray-600 text-sm">
                          El código expira el{" "}
                          {new Date(tiempoExpiracion).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </Field>
                </div>
              </div>
            )}
            {/* paso Cuatro: finalizacion de completado */}
            {pasoActual === 3 && (
              <div className="space-y-6 ">
                <img
                  src={CuestionarioCreado}
                  alt="Icono Cuestionario"
                  className="w-20 h-auto mx-auto mt-10"
                />
                <h1 className="text-3xl font-bold mt-4 text-center text-dark-sienna mb-3 text-casal">
                  ¡Registro completado <br /> {nombre}!
                </h1>
                <div className="p-6 w-full mx-auto">
                  <p className="text-casal mt-4 text-center font-semibold">
                    ¡Ya casi eres parte de la Ceremonia de Graduación! <br />
                    Estás a un paso de asegurar tu asistencia.
                  </p>
                  <p className="text-gray-800 mt-4 text-center font-semibold">
                    Ahora puedes realizar el pago de tus <br /> asientos para
                    confirmar tu lugar.
                  </p>
                </div>
                <div>
                  <Field>
                    <div className="my-5 flex justify-center">
                      <Button
                        onClick={handleIrAPortalPagos}
                        className="bg-casal text-xl text-white w-[90%] lg:w-2/5 mx-auto py-2 font-semibold rounded-3xl hover:bg-Acapulco transition"
                      >
                        Realizar pago · Abonar ahora
                      </Button>
                    </div>
                  </Field>
                </div>
              </div>
            )}
          </div>
          <div className="mt-auto">
            <p className="text-gray-500 text-sm text-center mt-10">
              Información de privacidad y dudas{" "}
              <button className="text-casal underline">accede aquí</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
