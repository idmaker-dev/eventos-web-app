import { Button, Field, Input, Label, Textarea } from "@headlessui/react";
import clsx from "clsx";
import React, { useState } from "react";
import FormularioCuestionario from "./FormularioCuestionario";
import { LaptopIcon, Smartphone, Plus, Minus, ChevronRight, ChevronLeft } from "lucide-react";
import ModalConfimacion from "./ModalConfimacion";
import { DeviceFrameset } from "react-device-frameset";
import "react-device-frameset/styles/marvel-devices.min.css";

export default function ConfigurarRespuesta() {
  const [restricciones, setRestricciones] = useState({
    vegetariano: 0,
    vegano: 0,
    sinGluten: 0,
    alergiaMarisco: 0,
  });
  const [otra, setOtra] = useState("");
  const [modoVista, setModoVista] = useState("laptop"); // "laptop" o "telefono"
  const [modalOpen, setModalOpen] = useState(false);
  const [Ocultar, setOcultar] = useState(false);

  const handleChange = (key, delta) => {
    setRestricciones((prev) => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta),
    }));
  };

  return (
    <div className="grid grid-cols-1  lg:grid-cols-3 md:gap-0 ">
      <div className={clsx("md:col-span-1 relative", Ocultar && "hidden")}>
        
        <div className="h-full  lg:h-[72vh] mb-14 md:mb-14 lg:mb-0 overflow-y-auto pr-2">
          <div className="p-4 border-b-2">
            <h2 className="text-lg font-semibold  text-casal dark:text-Acapulco mb-0">
              Crear invitación de cuestionario
            </h2>
            <p className="text-gray-500 dark:text-gray-200 mb-4">
              Completa los campos y envia enlace de tu evento.
            </p>
            <p className="text-gray-800 dark:text-gray-200 mb-4 text-lg font-semibold">
              Datos del evento
            </p>
            <div>
              <Field>
                <div className="mb-3">
                  <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                    Nombre del evento
                  </Label>
                  <Input
                    type="text"
                    className={clsx(
                      "mt-2 block w-full rounded-3xl border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                      "placeholder:italic",
                      "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                    )}
                    placeholder="Ejemplo: Ceremonia de Graduación - Generación 2025"
                  />
                </div>
                <div className="mb-3">
                  <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                    Descripción del evento
                  </Label>
                  <Textarea
                    type="text"
                    className={clsx(
                      "mt-2 block w-full rounded-lg border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                      "placeholder:italic",
                      "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                    )}
                    rows={4}
                    placeholder="Ejemplo: ¡Felicidades por tu próxima graduación! Por favor completa este formulario con tus datos. Esta información nos ayudará a organizar de la mejor forma el evento, asignar tus boletos y tomar en cuenta tus necesidades."
                  />
                </div>
                <div className="mb-3">
                  <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                    Lugar de vento
                  </Label>
                  <Input
                    type="text"
                    className={clsx(
                      "mt-2 block w-full rounded-3xl border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                      "placeholder:italic",
                      "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                    )}
                    placeholder="Auditorio, salón, teatro, etc."
                  />
                </div>
                <div className="mb-3">
                  <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                    Fecha y hora del evento
                  </Label>
                  <Input
                    type="datetime-local"
                    className={clsx(
                      "mt-2 block w-full rounded-3xl border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                      "placeholder:italic",
                      "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                    )}
                    placeholder="Ejamplo: 25 de junio de 2025 - 19:00 hrs"
                  />
                </div>
              </Field>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <p className="text-gray-800 dark:text-gray-200 mb-4 text-lg font-semibold">
              Datos de asistentes
            </p>
            <Field>
              <div className="mb-3">
                <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                  Nombre completo
                </Label>
                <Input
                  type="text"
                  className={clsx(
                    "mt-2 block w-full rounded-3xl border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                    "placeholder:italic",
                    "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                  )}
                  placeholder="Respuesta"
                />
              </div>
              <div className="mb-3">
                <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                  Carrera o estudios o realizados
                </Label>
                <Input
                  type="text"
                  className={clsx(
                    "mt-2 block w-full rounded-3xl border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                    "placeholder:italic",
                    "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                  )}
                  placeholder="Respuesta"
                />
              </div>
              <div className="mb-3">
                <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                  Escuela o institución
                </Label>
                <Input
                  type="text"
                  className={clsx(
                    "mt-2 block w-full rounded-3xl border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                    "placeholder:italic",
                    "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                  )}
                  placeholder="Respuesta"
                />
              </div>
              <div className="mb-3">
                <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                  Cantidad de boletos requeridos
                </Label>
                <Input
                  type="number"
                  className={clsx(
                    "mt-2 block w-full rounded-3xl border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                    "placeholder:italic",
                    "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                  )}
                  placeholder="6 Boletos"
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
                <div className="p-4 border-2 rounded-2xl bg-transparent border-[#bcd6e4]">
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
                      <span className="text-gray-600 dark:text-gray-300 font-medium w-40">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="w-6 h-6 rounded-full border border-gray-400 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-100"
                          onClick={() => handleChange(item.key, -1)}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="w-6 h-6 rounded-full border border-gray-400 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-100"
                          onClick={() => handleChange(item.key, 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-gray-600 dark:text-gray-300 w-24 text-right">
                        {restricciones[item.key]} personas
                      </span>
                    </div>
                  ))}
                  <div className="mt-3 mb-1 text-gray-600 dark:text-gray-300 font-medium">
                    Añadir una restricción específica
                  </div>
                  <input
                    type="text"
                    value={otra}
                    onChange={(e) => setOtra(e.target.value)}
                    placeholder="Respuesta"
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
                    "mt-2 block w-full rounded-3xl border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                    "placeholder:italic",
                    "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                  )}
                  placeholder="Respuesta"
                />
              </div>
              <div className="mb-3">
                <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                Datos del tutor o responsable
                </Label>
                <div className="p-4 border-2 rounded-2xl bg-transparent border-[#bcd6e4]">
                  <div className="mb-3">
                    <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                      Nombre completo
                    </Label>
                    <Input
                      type="text"
                      className={clsx(
                        "mt-2 block w-full rounded-3xl border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                        "placeholder:italic",
                        "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                      )}
                      placeholder="Respuesta"
                    />
                  </div>
                  <div className="mb-3">
                    <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                      Apellido paterno
                    </Label>
                    <Input
                      type="text"
                      className={clsx(
                        "mt-2 block w-full rounded-3xl border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                        "placeholder:italic",
                        "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                      )}
                      placeholder="Respuesta"
                    />
                  </div>
                  <div className="mb-3">
                    <Label className="text-sm/6 font-semibold text-casal dark:text-gray-200">
                      Apellido materno
                    </Label>
                    <Input
                      type="text"
                      className={clsx(
                        "mt-2 block w-full rounded-3xl border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700",
                        "placeholder:italic",
                        "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                      )}
                      placeholder="Respuesta"
                    />
                  </div>
                </div>
              </div>
            </Field>
          </div>
        </div>
        <div className="p-4 border-t-2 absolute bottom-0 w-full bg-white dark:bg-gray-800 rounded-b-xl">
          <div className="flex justify-between space-x-2">
            <div>
              <Button
                className={clsx(
                  "bg-gray-300 dark:bg-gray-600 text-white px-4 py-1 rounded-3xl hover:bg-green-500 dark:hover:bg-green-500 transition"
                )}
              >
                Editar
              </Button>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                className={clsx(
                  "bg-gray-300 dark:bg-gray-600 text-white px-4 py-1 rounded-3xl hover:bg-red-600 dark:hover:bg-red-600 transition"
                )}
              >
                Cancelar
              </Button>
              <Button
                className="bg-casal  text-white px-4 py-1 rounded-3xl hover:bg-Acapulco transition"
                onClick={() => setModalOpen(true)}
              >
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* <   Presentaciones del formulario */}
      <div className={clsx("md:col-span-2  h-[85vh] overflow-y-auto  lg:border-l-2 bg-[#5c8287] dark:bg-[#2a9d8f]/5 rounded-r-xl p-4 relative", Ocultar ? "md:col-span-3 rounded-l-xl " : "md:col-span-2",)}>
        <div className="absolute top-0 left-0 flex space-x-2 z-10">
          <Button
            onClick={() => setOcultar(!Ocultar)}
            className={clsx("p-2 bg-casal text-white hover:bg-casal/80 transition shadow-sm relative group", Ocultar ? "rounded-br-lg rounded-tl-xl " : "rounded-br-lg")}
          >
             {!Ocultar ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
             {Ocultar ? 
              <span className="absolute left-16 -translate-x-1/2 -bottom-8 z-10 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition">Mostrar formulario</span> : 
              <span className="absolute left-16 -translate-x-1/2 -bottom-8 z-10 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition">Ocultar formulario</span>
             }
          </Button>
        </div>
        <div className="flex-col lg:flex-row lg:space-x-4 lg:space-y-0 space-y-4 flex">
          {/* estos son los detalles del cuestionario pero con los botones se puede hacer para modal celular y laptop */}
          <div className="flex justify-center gap-3 mb-4 lg:hidden">
            <div className="relative group">
              <Button
                onClick={() => setModoVista("laptop")}
                className={clsx(
                  "text-white px-3 py-1 rounded",
                  "focus:outline-none transition",
                  modoVista === "laptop" ? "bg-Acapulco" : "bg-casal"
                )}
              >
                <LaptopIcon className="w-6 h-6" />
              </Button>
              <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 z-10 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition">
                Vista laptop
              </span>
            </div>
            <div className="relative group">
              <Button
                onClick={() => setModoVista("telefono")}
                className={clsx(
                  "text-white px-3 py-1 rounded",
                  "focus:outline-none transition",
                  modoVista === "telefono" ? "bg-Acapulco" : "bg-casal"
                )}
              >
                <Smartphone className="w-6 h-6" />
              </Button>
              <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 z-10 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition">
                Vista teléfono
              </span>
            </div>
            <div className="">
              <Button className="bg-casal  w-full text-white px-4 py-1 rounded hover:bg-Acapulco transition">
                Enlace de cuestionario
              </Button>
            </div>
          </div>
          <div className="w-full ">
            <div
              className={clsx(
                "flex justify-center items-start transition-all duration-300 mx-auto me-2"
              )}
            >
              <DeviceFrameset
                device={modoVista === "laptop" ? "MacBook Pro" : "iPhone X"}
                color={modoVista === "laptop" ? "silver" : "black"}
                height={modoVista === "laptop" ? 600 : 750}
                width={modoVista === "telefono" ? 370 : undefined}
                landscape={modoVista === "laptop"}
              >
                <div
                  className={clsx(
                    "h-full overflow-y-auto ",
                    modoVista === "telefono" ? "max-h-[800px]" : "max-h-[600px]"
                  )}
                >
                  <FormularioCuestionario modoVista={modoVista}/>
                </div>
              </DeviceFrameset>
            </div>
          </div>
          {/* botones para cambiar vista Modo*/}
          <div className="w-full lg:w-40 lg:space-y-3 flex lg:flex-col gap-3 lg:block hidden">
            <div className="flex justify-center gap-3">
              <div className="relative group">
                <Button
                  onClick={() => setModoVista("laptop")}
                  className={clsx(
                    "text-white px-3 py-1 rounded",
                    "focus:outline-none transition",
                    modoVista === "laptop" ? "bg-Acapulco" : "bg-casal"
                  )}
                >
                  <LaptopIcon className="w-6 h-6" />
                </Button>
                <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 z-10 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition">
                  Vista laptop
                </span>
              </div>
              <div className="relative group">
                <Button
                  onClick={() => setModoVista("telefono")}
                  className={clsx(
                    "text-white px-3 py-1 rounded",
                    "focus:outline-none transition",
                    modoVista === "telefono" ? "bg-Acapulco" : "bg-casal"
                  )}
                >
                  <Smartphone className="w-6 h-6" />
                </Button>

                <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 z-10 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition">
                  Vista teléfono
                </span>
              </div>
            </div>
            <div className="">
              <Button className="bg-casal  w-full text-white px-4 py-1 rounded hover:bg-Acapulco transition">
                Enlace de cuestionario
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ModalConfimacion open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
