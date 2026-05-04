import React, { useState, useEffect } from "react";
import InlineSpinner from "../ui/InlineSpinner";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../../assets/LOGOPLANORIA1.png";
import IconCuestionario from "../../assets/recursos/IconoCuestionario.svg";
import confirmacionWhatsapp from "../../assets/recursos/ConfirmacionWhastapp.svg";
import SolicitudCodigo from "../../assets/recursos/solicitudCodigo.svg";
import CuestionarioCreado from "../../assets/recursos/CUESTIONARIO_CREADO.svg";
import { Button, Field, Input, Label, Select, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import clsx from "clsx";
import { RotateCcw, AlertCircle, ChevronDown, X, MessageCircle } from "lucide-react";
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
  if (!fechaString) return "17:00";

  try {
    const fecha = new Date(fechaString);
    const opciones = {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Mexico_City",
    };

    return fecha.toLocaleTimeString("es-MX", opciones);
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
  const [mostrarModalPrivacidad, setMostrarModalPrivacidad] = useState(false);
  const [haLeidoPrivacidad, setHaLeidoPrivacidad] = useState(false);

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

  // Estados flotante de soporte
  const [mostrarMenuSoporte, setMostrarMenuSoporte] = useState(false);

  const enviarMensajeWp = (tipo) => {
    let mensaje = "";
    if (tipo === 1) mensaje = "Hola, el código de verificación de mi número no me llega.";
    else if (tipo === 2) mensaje = "Hola, la página no me deja registrarme.";
    
    const url = EnvConfig.formatWhatsappLink(mensaje);
    window.open(url, "_blank");
    setMostrarMenuSoporte(false);
  };

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

    // Validar que sean exactamente 10 dígitos
    if (!/^\d{10}$/.test(telefono.trim())) {
      showError("El número de teléfono debe tener exactamente 10 dígitos sin espacios ni caracteres especiales");
      return;
    }

    // Validar que el correo esté presente para el respaldo
    if (!correo.trim()) {
      showError("Por favor ingresa tu correo electrónico antes de solicitar el código");
      return;
    }

    // Validar formato de correo
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      showError("Por favor ingresa un correo electrónico válido");
      return;
    }

    setIsGenerandoCodigo(true);
    try {
      // 1. Generar código y enviar por WhatsApp (API externa)
      const response = await whatsappService.generarCodigo(telefono.trim());

      if (response.status === "ok") {
        setCodigoGenerado(response.codigo);
        console.log("Código generado:", response.codigo);
        setTiempoExpiracion(response.expira);
        setMostrarCamposCodigo(true);

        // 2. Enviar también por email como respaldo (nuestra API)
        try {
          const emailResponse = await codigoVerificacionService.enviarCodigoPorEmail(
            correo.trim(),
            response.codigo,
            nombre.trim() || ''
          );

          if (emailResponse.success) {
            showSuccess("Código enviado por WhatsApp y correo electrónico. Revisa ambos para obtener tu código.");
          } else {
            // Si falla el email, no es crítico
            console.warn("No se pudo enviar código por email:", emailResponse.error);
            showSuccess("Código enviado por WhatsApp. Revisa tu teléfono.");
          }
        } catch (emailError) {
          // Si falla el email, no es crítico, el usuario aún tiene WhatsApp
          console.warn("Error al enviar código por email:", emailError);
          showSuccess("Código enviado por WhatsApp. Revisa tu teléfono.");
        }
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
      // 1. Reenviar código por WhatsApp (API externa)
      const response = await whatsappService.reenviarCodigo(telefono);

      if (response.status === "ok") {
        setCodigoGenerado(response.codigo);
        setTiempoExpiracion(response.expira);
        setIntentosRestantes(3); // Resetear intentos

        // 2. Reenviar también por email como respaldo (nuestra API)
        try {
          const emailResponse = await codigoVerificacionService.enviarCodigoPorEmail(
            correo.trim(),
            response.codigo,
            nombre.trim() || ''
          );

          if (emailResponse.success) {
            showSuccess("Nuevo código enviado por WhatsApp y correo electrónico");
          } else {
            console.warn("No se pudo reenviar código por email:", emailResponse.error);
            showSuccess("Nuevo código enviado por WhatsApp");
          }
        } catch (emailError) {
          console.warn("Error al reenviar código por email:", emailError);
          showSuccess("Nuevo código enviado por WhatsApp");
        }
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

  // Función para detectar cuando el usuario ha scrolleado hasta el final del aviso de privacidad
  const handleScrollPrivacidad = (e) => {
    const elemento = e.target;
    const scrollTop = elemento.scrollTop;
    const scrollHeight = elemento.scrollHeight;
    const clientHeight = elemento.clientHeight;
    
    // Detectar si está a menos de 50px del final (tolerancia)
    if (scrollHeight - scrollTop - clientHeight < 50) {
      setHaLeidoPrivacidad(true);
    }
  };

  // Función para abrir el modal y resetear el estado de lectura si es necesario
  const handleAbrirModalPrivacidad = () => {
    // Solo resetear si el usuario aún no ha aceptado los términos
    if (!aceptaTerminos) {
      setHaLeidoPrivacidad(false);
    }
    setMostrarModalPrivacidad(true);
  };

  // Función para cerrar el modal
  const handleCerrarModalPrivacidad = () => {
    setMostrarModalPrivacidad(false);
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
    if (!telefono.trim()) {
      nuevosErrores.telefono = "El número de teléfono es obligatorio";
    } else if (!/^\d{10}$/.test(telefono.trim())) {
      nuevosErrores.telefono = "El número debe tener exactamente 10 dígitos sin espacios ni caracteres especiales";
    }

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

        // Redirigir según el next_step que devuelve el backend
        const nextStepUrl = res.next_step?.contrato_url || res.next_step?.toku_url || `/firma-contrato/${res.invitado.id}`;
        
        setTimeout(() => {
          navigate(nextStepUrl);
        }, 1500);
      } else {
        console.error("Error al guardar:", res.error);
        showError(res.error || "Error al completar el registro. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al crear invitado:", error);
      showError(error.message || "Error al completar el registro. Intenta nuevamente.");
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
                        <p className="text-sm text-gray-700">
                          Para continuar, debes leer y aceptar el{" "}
                          <button
                            type="button"
                            className="text-casal underline font-semibold hover:text-Acapulco"
                            onClick={handleAbrirModalPrivacidad}
                          >
                            Aviso de Privacidad
                          </button>
                          {aceptaTerminos && (
                            <span className="ml-2 text-green-600 font-semibold">✓ Aceptado</span>
                          )}
                        </p>
                        {errores.aceptaTerminos && (
                          <p className="text-red-500 text-sm mt-2">
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
                              // Solo permitir dígitos y máximo 10 caracteres
                              const valor = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setTelefono(valor);
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
                            placeholder="Ejemplo: 5512345678"
                            maxLength="10"
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
                          Introduce el código que te enviamos por WhatsApp y correo electrónico
                        </p>
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-3 mb-3 rounded">
                          <p className="text-xs text-amber-800">
                            <strong>📧 Importante:</strong> Si no recibiste el código por WhatsApp, revisa tu correo electrónico ({correo}). 
                            El código también fue enviado a tu bandeja de entrada.
                          </p>
                        </div>
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
                        disabled={!codigoVerificado || isEnviandoFormulario || !aceptaTerminos}
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
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-4 mx-auto w-full lg:w-3/4 rounded">
                    <p className="text-xs text-blue-800">
                      <strong>📧 Nota:</strong> Recibirás tu código de verificación por WhatsApp y también por correo electrónico como respaldo.
                    </p>
                  </div>
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
                          "Enviar código de verificación"
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
                  Introduce el código de confirmación que te enviamos
                </h1>
                <p className="text-center text-gray-600 text-sm mb-4 px-6">
                  Revisa tu WhatsApp y tu correo electrónico ({correo})
                </p>

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

        {/* Modal de Aviso de Privacidad */}
        <Dialog
          open={mostrarModalPrivacidad}
          onClose={handleCerrarModalPrivacidad}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="mx-auto max-w-4xl max-h-[90vh] w-full rounded-2xl bg-white p-6 shadow-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <DialogTitle className="text-2xl font-bold text-casal">
                  Aviso de Privacidad
                </DialogTitle>
                <button
                  onClick={handleCerrarModalPrivacidad}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Indicador de que debe scrollear hasta el final */}
              {!haLeidoPrivacidad && (
                <div className="mb-3 bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
                  <p className="text-sm text-amber-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Por favor, desplázate hasta el final del documento para poder aceptar los términos</span>
                  </p>
                </div>
              )}
              
              <div 
                className="overflow-y-auto flex-1 prose prose-sm max-w-none"
                onScroll={handleScrollPrivacidad}
              >
                <div className="space-y-4 text-gray-700">
                  <p className="text-center font-semibold">
                    GRADUACIONES Y EVENTOS.<br />
                    MATIZ PRODUCCIONES,<br />
                    PLATAFORMAS DIGITALES.
                  </p>
                  
                  <p className="text-right text-sm">
                    <strong>Fecha de actualización:</strong> febrero de 2026.
                  </p>

                  <h3 className="text-lg font-bold text-casal mt-6">1. IDENTIDAD Y DOMICILIO DEL RESPONSABLE.</h3>
                  <p>
                    Operadora de Eventos Matiz México, S.A. de C.V. (en lo sucesivo, "Matiz"), con domicilio en J. Enrique Pestalozzi 1204, interior 506, Col. Del Valle Centro, Alcaldía Benito Juárez, C.P. 03100, Ciudad de México, es responsable del tratamiento de sus datos personales conforme a lo dispuesto en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, su Reglamento y demás normativa aplicable.
                  </p>
                  <p>
                    Para el equipo de Matiz, es de gran importancia la privacidad, protección y uso lícito de los datos personales de cada uno de nuestros clientes, proveedores, aliados comerciales y cualquier otra persona relacionada con nuestras actividades (cualquiera de ellos, el "Titular"). Por lo tanto, en cumplimiento de lo dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, su Reglamento y los Lineamientos del Aviso de Privacidad (en lo sucesivo "Marco Legal Aplicable"), ponemos a disposición suya y del público general el presente Aviso de Privacidad Integral (en lo sucesivo el "Aviso de Privacidad").
                  </p>

                  <h4 className="font-semibold text-casal mt-4">Plataformas Digitales:</h4>
                  <p>
                    El presente Aviso de Privacidad resulta aplicable a las actividades comerciales de Matiz en general, así como a la información y datos personales del Titular que sean recabados a través de cualquiera de las plataformas digitales y herramientas tecnológicas utilizadas por Matiz, incluyendo aquélla conocida como "Planoria" (disponible en www.planoria.com.mx) y "Brindoo" (disponible en www.brindoo.com).
                  </p>
                  <p>
                    Los datos e información del Titular que sean recabados a través de dichas plataformas digitales estarán sujetos a las reglas establecidas en el presente Aviso de Privacidad.
                  </p>

                  <h3 className="text-lg font-bold text-casal mt-6">2. DATOS PERSONALES QUE RECABAMOS.</h3>
                  <p>
                    Para la adecuada atención de nuestras relaciones comerciales con usted, hacemos de su conocimiento que el equipo Matiz podrá recabar las siguientes categorías de datos:
                  </p>
                  
                  <h4 className="font-semibold text-casal mt-4">a) Datos de identificación y contacto.</h4>
                  <p>
                    Nombre completo, nacionalidad, domicilio, RFC, CURP, teléfono fijo o móvil, correo electrónico, datos profesionales o académicos, empresa y cargo.
                  </p>

                  <h4 className="font-semibold text-casal mt-4">b) Datos financieros.</h4>
                  <p>
                    Por regla general, Matiz no recabará sus datos financieros o patrimoniales. No obstante, aquellas operaciones que requieran que Matiz realice pagos o devoluciones en favor del Titular, será necesario recabar la información bancaria necesaria. En este caso, el Titular voluntariamente podrá compartir con Matiz información relativa a su cuenta bancaria, CLABE, institución bancaria y titular de la cuenta, exclusivamente cuando sea necesario para pagos o cobros.
                  </p>

                  <h4 className="font-semibold text-casal mt-4">c) Datos personales sensibles.</h4>
                  <p>
                    En ninguna circunstancia Matiz recabará del Titular cualquier tipo de dato o información considerada como sensible por el Marco Legal Aplicable. No obstante, si de manera excepcional llegaré a ser necesario Matiz requerirá al Titular que otorgue su consentimiento expreso y por escrito para tal efecto; indicando claramente la finalidad, justificación y reglas aplicables al tratamiento de sus datos sensibles.
                  </p>

                  <h3 className="text-lg font-bold text-casal mt-6">3. FINALIDADES DEL TRATAMIENTO.</h3>
                  
                  <h4 className="font-semibold text-casal mt-4">a) Finalidades primarias (necesarias).</h4>
                  <p>
                    La finalidad primaria que justifica la necesidad de obtener los datos personales del Titular se relaciona con: (i) la prestación de servicios relacionados con la industria del entretenimiento, incluyendo graduaciones, bodas, convenciones y otros eventos sociales o corporativos; y (ii) la realización de las actividades comerciales de Matiz.
                  </p>
                  <p>Por lo tanto, en consideración de dichas finalidades primarias, sus datos personales serán utilizados para:</p>
                  <ul className="list-disc pl-6">
                    <li>Identificarle y contactarle.</li>
                    <li>Permitir la adecuada realización de las actividades que el Titular encomiende a Matiz.</li>
                    <li>Elaborar y administrar contratos.</li>
                    <li>Verificar identidad y, en su caso, facultades de representación.</li>
                    <li>Gestionar pagos, facturación y cobranza.</li>
                    <li>Proveer los servicios contratados.</li>
                    <li>Gestionar acceso a eventos o instalaciones.</li>
                    <li>Atender dudas, aclaraciones o quejas.</li>
                    <li>Cumplir obligaciones legales y contractuales.</li>
                  </ul>
                  <p>
                    Si el Titular no desea que sus datos sean tratados para estas finalidades necesarias, no será posible establecer o continuar la relación jurídica con Matiz.
                  </p>

                  <h4 className="font-semibold text-casal mt-4">b) Finalidades secundarias (no necesarias).</h4>
                  <p>Adicionalmente, podremos utilizar sus datos para:</p>
                  <ul className="list-disc pl-6">
                    <li>Enviar información sobre eventos, cursos, promociones o servicios.</li>
                    <li>Realizar invitaciones.</li>
                    <li>Actividades de mercadotecnia, publicidad y propaganda.</li>
                    <li>Evaluar la calidad de nuestros servicios.</li>
                    <li>Compartirlos para fines estadísticos y mercadológicos con las personas con las que mantenemos una relación comercial</li>
                  </ul>
                  <p>
                    Usted puede negarse al tratamiento de sus datos para estas finalidades secundarias enviando su solicitud por correo electrónico a: <a href="mailto:legal@matizmx.com" className="text-casal underline">legal@matizmx.com</a>
                  </p>
                  <p>
                    La negativa o rechazo de estas finalidades secundarias no afectará la prestación de los servicios contratados.
                  </p>

                  <h3 className="text-lg font-bold text-casal mt-6">4. TRANSFERENCIAS DE DATOS PERSONALES.</h3>
                  <p>Matiz podrá transferir sus datos sin requerir su consentimiento en los siguientes casos:</p>
                  <ul className="list-disc pl-6">
                    <li>A autoridades competentes cuando sea legalmente exigido.</li>
                    <li>A empresas del mismo grupo corporativo que operen bajo las mismas políticas de protección de datos.</li>
                    <li>A proveedores que actúen como encargados del tratamiento para cumplir las finalidades descritas (por ejemplo, servicios contables, plataformas de pago, logística de eventos).</li>
                    <li>A empresas con las cuales Matiz tenga alianzas comerciales para la promoción de eventos, productos o servicios.</li>
                    <li>A los cesionarios o causahabientes de las relaciones contractuales de Matiz.</li>
                  </ul>
                  <p>
                    En caso de realizar transferencias que requieran su consentimiento conforme a la ley, se lo solicitaremos previamente.
                  </p>

                  <h3 className="text-lg font-bold text-casal mt-6">5. DERECHOS ARCO.</h3>
                  <p>
                    En términos de lo establecido en el Marco Legal Aplicable, en todo momento el Titular tiene derecho a:
                  </p>
                  <ul className="list-disc pl-6">
                    <li>Acceder a sus datos personales.</li>
                    <li>Rectificarlos si son inexactos o incompletos.</li>
                    <li>Cancelarlos cuando considere que no se requieren.</li>
                    <li>Oponerse a su tratamiento para fines específicos.</li>
                  </ul>
                  <p>
                    Para ejercer sus derechos ARCO, el Titular deberá enviar una solicitud al correo: <a href="mailto:legal@matizmx.com" className="text-casal underline">legal@matizmx.com</a>, indicando:
                  </p>
                  <ul className="list-disc pl-6">
                    <li>Nombre completo.</li>
                    <li>Medio para comunicar la respuesta.</li>
                    <li>Descripción clara del derecho que desea ejercer.</li>
                    <li>Documento que acredite su identidad o representación.</li>
                  </ul>
                  <p>
                    Matiz dará respuesta en un plazo máximo de 20 días hábiles y, de resultar procedente, hará efectiva la determinación dentro de los 15 días hábiles siguientes, conforme a lo establecido en el Marco Legal Aplicable.
                  </p>

                  <h3 className="text-lg font-bold text-casal mt-6">6. REVOCACIÓN DEL CONSENTIMIENTO.</h3>
                  <p>
                    En cualquier momento, el Titular puede revocar el consentimiento o autorización relacionada con sus datos personales que previamente haya otorgado a Matiz. Para tal efecto, será necesario enviar una solicitud al correo electrónico: <a href="mailto:legal@matizmx.com" className="text-casal underline">legal@matizmx.com</a>
                  </p>
                  <p>
                    La revocación no tendrá efectos retroactivos y puede no proceder cuando exista una disposición legal que obligue a Matiz a conservar los datos.
                  </p>

                  <h3 className="text-lg font-bold text-casal mt-6">7. OPCIONES PARA LIMITAR EL USO O DIVULGACIÓN.</h3>
                  <p>Adicionalmente, en todo momento el Titular tendrá derecho de:</p>
                  <ul className="list-disc pl-6">
                    <li>Solicitar su inclusión en nuestra lista interna de exclusión para fines promocionales.</li>
                    <li>Solicitar por escrito que sus datos no sean tratados para finalidades secundarias.</li>
                    <li>Inscribirse en el Registro Público para Evitar Publicidad (PROFECO), cuando aplique.</li>
                  </ul>

                  <h3 className="text-lg font-bold text-casal mt-6">8. USO DE TECNOLOGÍAS DE RASTREO EN SITIOS WEB.</h3>
                  <p>
                    Tanto el sitio web de Matiz, como los sitios web de las plataformas digitales de apoyo utilizadas por Matiz (Brindoo y Planoria) pueden utilizar cookies, web beacons u otras tecnologías digitales para:
                  </p>
                  <ul className="list-disc pl-6">
                    <li>Mejorar la experiencia del usuario.</li>
                    <li>Analizar navegación.</li>
                    <li>Generar estadísticas de uso.</li>
                  </ul>
                  <p>
                    Los datos recabados pueden incluir tipo de navegador, sistema operativo, páginas visitadas y dirección IP. Usted puede deshabilitar estas tecnologías desde la configuración de su navegador. Adicionalmente, el Titular puede abstenerse de utilizar los sitios web antes mencionados, estando facultado para solicitar al equipo de Matiz asistencia personalizada, soluciones y alternativas.
                  </p>

                  <h3 className="text-lg font-bold text-casal mt-6">9. CONSERVACIÓN Y SEGURIDAD DE LOS DATOS.</h3>
                  <p>
                    Por regla general, los datos personales del Titular serán conservados durante el tiempo necesario para cumplir las finalidades descritas y las obligaciones legales aplicables. No obstante, el Titular podrá ejercer los derechos conferidos por el Marco Legal Aplicable, relativos a la conservación de sus datos personales.
                  </p>
                  <p>
                    Los sistemas de almacenamiento (físico y digital) utilizados por Matiz, incluyendo aquéllos correspondientes a las plataformas digitales de apoyo que utiliza para realizar sus actividades (Brindoo y Planoria) cuentan con medidas de seguridad administrativas, técnicas, físicas y digitales razonablemente suficientes para proteger la información del Titular contra daño, pérdida, alteración o acceso no autorizado.
                  </p>

                  <h3 className="text-lg font-bold text-casal mt-6">10. DATOS DE MENORES DE EDAD.</h3>
                  <p>
                    Por regla general, Matiz no recaba datos personales de menores de edad o personas sujetas a incapacidad legal. No obstante, en caso de que Matiz sea contratada para la realización de alguna graduación o evento social que involucre menores o incapaces, resultando absolutamente necesario recabar sus datos personales; Matiz deberá de obtener el consentimiento de quien ejerza la patria potestad o tutela. En caso de identificar que se han recabado datos personales de cualquier menor o incapaz sin contar con el consentimiento de sus padres o tutores, Matiz buscará remediar la situación irregular y, de no ser posible, se procederá de inmediato a su eliminación.
                  </p>

                  <h3 className="text-lg font-bold text-casal mt-6">11. MODIFICACIONES AL AVISO.</h3>
                  <p>
                    En cualquier momento, Matiz podrá actualizar o modificar el presente Aviso de Privacidad, unilateralmente y según considere necesario o conveniente. La versión más reciente del Aviso de Privacidad estará disponible en el sitio web de Matiz (www.matizmx.com), así como en el sitio web de las plataformas digitales de apoyo utilizadas por Matiz (www.planoria.com.mx y www.brindoo.com).
                  </p>
                  <p>
                    El Titular podrá solicitar a Matiz el envío de versiones anteriores del Aviso de Privacidad, enviando requerimiento detallado a la dirección de correo: <a href="mailto:legal@matizmx.com" className="text-casal underline">legal@matizmx.com</a>
                  </p>

                  <h3 className="text-lg font-bold text-casal mt-6">12. CONSENTIMIENTO.</h3>
                  
                  <h4 className="font-semibold text-casal mt-4">a) Consentimiento tácito.</h4>
                  <p>
                    Cuando el Marco Legal Aplicable lo permita, se presumirá que el Titular conoce y acepta el contenido del presente instrumento, consintiendo que Matiz recabe, conserve, trate y transmita sus datos personales en términos de lo establecido en este Aviso de Privacidad. De manera enunciativa, resultará aplicable esta presunción cuando:
                  </p>
                  <ul className="list-disc pl-6">
                    <li>El Titular envíe o proporcione voluntariamente sus datos personales a Matiz, a través de cualquier medio.</li>
                    <li>El Titular acceda, navegue y/o utilice el sitio web o las plataformas digitales contempladas en el presente Aviso de Privacidad (www.matizmx.com, www.brindoo.com, www.planoria.com.mx).</li>
                  </ul>

                  <h4 className="font-semibold text-casal mt-4">b) Consentimiento expreso.</h4>
                  <p>
                    Cuando el Marco Legal Aplicable así lo requiera, Matiz deberá de solicitar al Titular el otorgamiento de su consentimiento expreso y por escrito a los términos del presente Aviso de Privacidad.
                  </p>
                </div>
              </div>

              {/* Checkbox de aceptación dentro del modal */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aceptaTerminos}
                    disabled={!haLeidoPrivacidad}
                    onChange={(e) => {
                      setAceptaTerminos(e.target.checked);
                      limpiarError("aceptaTerminos");
                    }}
                    className={clsx(
                      "mt-1 w-5 h-5 text-casal border-gray-300 rounded focus:ring-casal",
                      !haLeidoPrivacidad && "opacity-50 cursor-not-allowed"
                    )}
                  />
                  <span className="text-sm text-gray-700 font-semibold">
                    He leído y acepto el Aviso de Privacidad
                  </span>
                </label>
                {!haLeidoPrivacidad && (
                  <p className="text-amber-600 text-xs mt-2 ml-8 flex items-start gap-1">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Debes desplazarte hasta el final del documento para poder aceptar</span>
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-3">
                <Button
                  onClick={handleCerrarModalPrivacidad}
                  disabled={!aceptaTerminos}
                  className={clsx(
                    "px-6 py-2 rounded-3xl transition font-semibold",
                    aceptaTerminos
                      ? "bg-casal text-white hover:bg-Acapulco cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  )}
                >
                  {aceptaTerminos ? "Aceptar y Continuar" : "Debes aceptar para continuar"}
                </Button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Botón flotante de soporte */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {mostrarMenuSoporte && (
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-3 mb-4 w-72 flex flex-col gap-2 transition-all transform origin-bottom-right">
              <h3 className="text-casal font-semibold font-sm mb-1 px-2">¿En qué podemos ayudarte?</h3>
              <button
                onClick={() => enviarMensajeWp(1)}
                className="text-left bg-gray-50 hover:bg-gray-100 text-gray-800 text-sm px-3 py-2 rounded-lg transition"
              >
                El código de verificación de mi número no me llega
              </button>
              <button
                onClick={() => enviarMensajeWp(2)}
                className="text-left bg-gray-50 hover:bg-gray-100 text-gray-800 text-sm px-3 py-2 rounded-lg transition"
              >
                La página no deja registrarme
              </button>
              <button
                onClick={() => enviarMensajeWp(3)}
                className="text-left bg-gray-50 hover:bg-gray-100 text-gray-800 text-sm px-3 py-2 rounded-lg transition"
              >
                Otro detalle o duda
              </button>
            </div>
          )}
          <button
            onClick={() => setMostrarMenuSoporte(!mostrarMenuSoporte)}
            className="bg-[#25D366] hover:bg-[#128C7E] text-white p-3.5 rounded-full shadow-lg transition transform hover:scale-105 flex items-center justify-center"
            aria-label="Soporte por WhatsApp"
          >
            {mostrarMenuSoporte ? (
              <X className="w-7 h-7" />
            ) : (
              <svg 
                className="w-7 h-7"
                viewBox="0 0 24 24" 
                fill="currentColor" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
