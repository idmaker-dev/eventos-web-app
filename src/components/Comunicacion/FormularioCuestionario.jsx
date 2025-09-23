import React, { useState } from "react";
import logo from "../../assets/recursos/logoTentativo2.svg";
import IconCuestionario from "../../assets/recursos/IconoCuestionario.svg";
import { Button, Field, Input, Label } from "@headlessui/react";
import clsx from "clsx";
import { Minus, Plus } from "lucide-react";
export default function FormularioCuestionario() {
  const [restricciones, setRestricciones] = useState({
    vegetariano: 0,
    vegano: 0,
    sinGluten: 0,
    alergiaMarisco: 0,
  });
  const [otra, setOtra] = useState("");

  const handleChange = (key, delta) => {
    setRestricciones((prev) => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta),
    }));
  };
  return (
    <div className="bg-porcelain min-h-full flex flex-col justify-center ">
      <div className="w-full max-w-4xl mx-auto p-6">
        <img src={logo} alt="Logo" className="w-36 h-auto mx-auto mb-5" />
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
            Por favor completa este formulario con tus datos. Esta Información
            nos ayudará a organizar de la mejor forma el evento, asignar tus
            boletos y tomar en cuenta tus necesidades.
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
              <Button className="bg-casal text-xl text-white w-[70%] mx-auto py-1 rounded-3xl hover:bg-Acapulco transition">
                Enviar
              </Button>
            </div>
          </Field>
        </div>
      </div>
    </div>
  );
}
