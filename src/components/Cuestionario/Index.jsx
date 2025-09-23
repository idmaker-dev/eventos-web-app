import React, { useState } from "react";
import logo from "../../assets/recursos/logoTentativo2.svg";
import IconCuestionario from "../../assets/recursos/IconoCuestionario.svg";
import confirmacionWhatsapp from "../../assets/recursos/ConfirmacionWhastapp.svg";
import SolicitudCodigo from "../../assets/recursos/solicitudCodigo.svg";
import CuestionarioCreado from "../../assets/recursos/CUESTIONARIO_CREADO.svg";
import { Button, Field, Input, Label } from "@headlessui/react";
import clsx from "clsx";
import { Minus, Plus } from "lucide-react";

export default function Cuestionario() {
  const [restricciones, setRestricciones] = useState({
    vegetariano: 0,
    vegano: 0,
    sinGluten: 0,
    alergiaMarisco: 0,
  });
  const [otra, setOtra] = useState("");
  const [pasoActual, setPasoActual] = useState(0);

  const handleChange = (key, delta) => {
    setRestricciones((prev) => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta),
    }));
  };
  return (
    <div className="bg-porcelain min-h-screen flex flex-col justify-center ">
      <div>
        <div className="w-full max-w-4xl mx-auto p-6 ">
          <div  className="flex-1">
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
                  {"Cuestionario de Registro Intituto Villa Rica"}
                </h1>
                <h1 className="text-xl font-semibold mt-4 text-center text-gray-800 mb-6 text-grey-800">
                  {"Ceremonia de Graduación - Generación 2025"}
                </h1>
                <div className="bg-white p-6 rounded-lg shadow-md w-full mx-auto">
                  <p className="text-casal font-bold text-center">
                    !Felicidades por tu próxima graduación!
                  </p>
                  <p className="text-gray-900 mt-4 text-justify">
                    Por favor completa este formulario con tus datos. Esta
                    Información nos ayudará a organizar de la mejor forma el
                    evento, asignar tus boletos y tomar en cuenta tus
                    necesidades.
                  </p>
                  <p className="text-gray-900 mt-4 text-justify">
                    <b> Fecha:</b> 25 de junio de 2025
                  </p>
                  <p className="text-gray-900 mt-0 text-justify">
                    <b>Hora:</b> 17:00 hrs
                  </p>
                  <p className="text-gray-900 mt-0 text-justify">
                    <b>Lugar:</b> Auditorio Central, Universidad Nacional
                  </p>
                </div>
                <div className="w-full mx-auto mt-6">
                  <Field>
                    <div className="mb-3">
                      <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                        Nombre completo
                      </Label>
                      <Input
                        type="text"
                        className={clsx(
                          "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                          "placeholder:italic",
                          "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                        )}
                        placeholder="Tu Respuesta"
                      />
                    </div>
                    <div className="mb-3">
                      <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                        Carrera o estudios o realizados
                      </Label>
                      <Input
                        type="text"
                        className={clsx(
                          "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                          "placeholder:italic",
                          "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                        )}
                        placeholder="Tu Respuesta"
                      />
                    </div>
                    <div className="mb-3">
                      <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                        Escuela o institución
                      </Label>
                      <Input
                        type="text"
                        className={clsx(
                          "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                          "placeholder:italic",
                          "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                        )}
                        placeholder="Tu Respuesta"
                      />
                    </div>
                    <div className="mb-3">
                      <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                        Cantidad de boletos requeridos
                      </Label>
                      <Input
                        type="number"
                        className={clsx(
                          "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                          "placeholder:italic",
                          "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                        )}
                        placeholder="Tu Respuesta"
                      />
                    </div>
                    <div className="mb-3">
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
                    </div>
                    <div className="mb-3">
                      <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                        Contacto de emergencia
                      </Label>
                      <Input
                        type="text"
                        className={clsx(
                          "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                          "placeholder:italic",
                          "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                        )}
                        placeholder="Tu Respuesta"
                      />
                    </div>
                    <div className="my-5 flex justify-center">
                      <Button
                        onClick={() => setPasoActual(1)}
                        className="bg-casal text-xl text-white w-[70%] mx-auto py-2 font-semibold rounded-3xl hover:bg-Acapulco transition"
                      >
                        Enviar
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
                        className={clsx(
                          "mt-2 block w-full lg:w-3/4 mx-auto rounded-3xl border-2 bg-white px-4 py-2 text-lg font-semibold dark:text-white text-gray-700",
                          "placeholder:italic",
                          "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                        )}
                        placeholder="+52 (55) 1234 5678"
                      />
                    </div>
                    <div className="my-5 flex justify-center">
                      <Button
                        onClick={() => setPasoActual(2)}
                        className="bg-casal text-xl text-white w-[70%] lg:w-2/5 mx-auto py-2 font-semibold rounded-3xl hover:bg-Acapulco transition"
                      >
                        Confirmar
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
                        className={clsx(
                          "mt-2 block w-full lg:w-3/4 mx-auto rounded-3xl border-2 text-center bg-white px-4 py-2 text-xl font-semibold dark:text-white text-casal",
                          "placeholder:italic",
                          "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                        )}
                        placeholder="123456"
                      />
                    </div>
                    <div className="my-5 flex justify-center">
                      <Button
                        onClick={() => setPasoActual(3)}
                        className="bg-casal text-xl text-white w-[70%] lg:w-2/5 mx-auto py-2 font-semibold rounded-3xl hover:bg-Acapulco transition"
                      >
                        Verificar y confirmar
                      </Button>
                    </div>
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
                  ¡Registro completado <br /> María Sofía!
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
                      <Button className="bg-casal text-xl text-white w-[90%] lg:w-2/5 mx-auto py-2 font-semibold rounded-3xl hover:bg-Acapulco transition">
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
              <a href="#" className="text-casal">
                accede aquí
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
