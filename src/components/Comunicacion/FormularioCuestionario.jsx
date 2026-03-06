import React, { useState, useEffect } from "react";
import logo from "../../assets/LOGOPLANORIA1.png";
import IconCuestionario from "../../assets/recursos/IconoCuestionario.svg";
import { Button, Field, Input, Label, Select } from "@headlessui/react";
import clsx from "clsx";
import { Minus, Plus, ChevronDown } from "lucide-react";

// Función para formatear fecha
const formatearFecha = (fechaString) => {
  if (!fechaString) return "25 de junio de 2025";
  
  try {
    const fecha = new Date(fechaString);
    const opciones = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'America/Mexico_City'
    };
    
    return fecha.toLocaleDateString('es-MX', opciones);
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
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'America/Mexico_City'
    };
    
    return fecha.toLocaleTimeString('es-MX', opciones);
  } catch (error) {
    return fechaString; // Retorna la fecha original si hay error
  }
};

export default function FormularioCuestionario({ modoVista, eventoData }) {
  const [nombre, setNombre] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [licenciatura, setLicenciatura] = useState("");
  const [esMayorDeEdad, setEsMayorDeEdad] = useState(false);
  const [aceptaResponsabilidadTutor, setAceptaResponsabilidadTutor] = useState(false);

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

  useEffect(() => {
    if (fechaNacimiento) {
      const edad = calcularEdad(fechaNacimiento);
      setEsMayorDeEdad(edad >= 18);
    } else {
      setEsMayorDeEdad(false);
    }
  }, [fechaNacimiento]);

  useEffect(() => {
    const licenciaturas = eventoData?.licenciatura?.split(",").map(l => l.trim()) || [];
    if (licenciaturas.length > 0) {
      setLicenciatura(licenciaturas[0]);
    }
  }, [eventoData]);

  const licenciaturasDisponibles = eventoData?.licenciatura?.split(",").map(l => l.trim()) || [];
  const tutorRequerido = eventoData?.requiere_tutor;

  return (
    <div className="bg-porcelain min-h-full flex flex-col justify-center font-sans">
      <div className="w-full max-w-4xl mx-auto p-6">
        <img src={logo} alt="Logo" className="w-36 h-auto mx-auto mb-5" />
        <img
          src={IconCuestionario}
          alt="Icono Cuestionario"
          className="w-16 h-auto mx-auto"
        />
        <h1 className="text-3xl font-bold mt-4 text-center text-dark-sienna mb-2 text-casal">
          {"Cuestionario de Registro " + (eventoData?.instituto || "Matiz")}
        </h1>
        <h1 className="text-xl font-semibold text-center text-gray-800 mb-6">
          {eventoData?.nombre_evento || "Evento de Graduación"}
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-md w-full mx-auto">
          <p className="text-casal font-bold text-center">
            ¡Felicidades por tu próxima graduación!
          </p>
          <p className="text-gray-900 mt-4 text-justify leading-relaxed">
            Por favor completa este formulario con tus datos. Esta información
            nos ayudará a organizar de la mejor forma el evento, asignar tus
            boletos y tomar en cuenta tus necesidades.
          </p>
          <div className="mt-4 text-justify text-gray-900">
            <p>
              <b>Fecha:</b> {formatearFecha(eventoData?.fecha_evento)}
            </p>
            <p>
              <b>Hora:</b> {formatearHora(eventoData?.fecha_evento)}
            </p>
            <p>
              <b>Lugar:</b> {eventoData?.lugar?.nombre || eventoData?.lugar_evento || "Salón de Eventos"}
            </p>
          </div>
        </div>

        <div className="w-full mx-auto mt-8">
          <Field>
            <div className="mb-6">
              <Label className="text-sm font-bold text-casal dark:text-gray-200">
                Datos del graduado
              </Label>
              <div className={clsx(
                "mt-2 p-4 border-2 rounded-2xl bg-white/30 border-[#bcd6e4] gap-2",
                modoVista === "telefono" ? "flex flex-col" : "grid grid-cols-1 lg:grid-cols-6"
              )}>
                <div className="lg:col-span-2 flex flex-col mb-3">
                  <Label className="text-sm font-semibold text-casal">Nombre (s)</Label>
                  <Input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={clsx(
                      "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 text-gray-700",
                      "placeholder:italic focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                    )}
                    placeholder="Tu Respuesta"
                  />
                </div>
                <div className="lg:col-span-2 flex flex-col mb-3">
                  <Label className="text-sm font-semibold text-casal">Apellido paterno</Label>
                  <Input
                    type="text"
                    value={apellidoPaterno}
                    onChange={(e) => setApellidoPaterno(e.target.value)}
                    className={clsx(
                      "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 text-gray-700",
                      "placeholder:italic focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                    )}
                    placeholder="Tu Respuesta"
                  />
                </div>
                <div className="lg:col-span-2 flex flex-col mb-3">
                  <Label className="text-sm font-semibold text-casal">Apellido materno</Label>
                  <Input
                    type="text"
                    value={apellidoMaterno}
                    onChange={(e) => setApellidoMaterno(e.target.value)}
                    className={clsx(
                      "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 text-gray-700",
                      "placeholder:italic focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                    )}
                    placeholder="Tu Respuesta"
                  />
                </div>

                <div className="lg:col-span-6 flex flex-col mb-3">
                  <Label className="text-sm font-semibold text-casal">Fecha de nacimiento</Label>
                  <Input
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className={clsx(
                      "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 text-gray-700",
                      "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                    )}
                  />
                  {fechaNacimiento && !esMayorDeEdad && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={aceptaResponsabilidadTutor}
                          onChange={(e) => setAceptaResponsabilidadTutor(e.target.checked)}
                          className="mt-1 w-4 h-4 text-casal border-gray-300 rounded focus:ring-casal"
                        />
                        <span className="text-sm text-gray-700">
                          Confirmo que un tutor legal se hará responsable
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-6 flex flex-col mb-3">
                  <Label className="text-sm font-semibold text-casal">Correo electrónico personal (No institucional)</Label>
                  <Input
                    type="email"
                    className={clsx(
                      "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 text-gray-700",
                      "placeholder:italic focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                    )}
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                {licenciaturasDisponibles.length > 1 && (
                  <div className="lg:col-span-6 flex flex-col mb-3">
                    <Label className="text-sm font-semibold text-casal">Licenciatura o especialidad</Label>
                    <div className="relative mt-2">
                      <Select
                        value={licenciatura}
                        onChange={(e) => setLicenciatura(e.target.value)}
                        className={clsx(
                          "block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 text-gray-700 appearance-none",
                          "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                        )}
                      >
                        <option value="">Seleccionar licenciatura</option>
                        {licenciaturasDisponibles.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </Select>
                      <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div className="lg:col-span-6 flex flex-col mb-3">
                  <Label className="text-sm font-semibold text-casal">Número aproximado de boletos a solicitar con graduado incluido</Label>
                  <Input
                    type="number"
                    className={clsx(
                      "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 text-gray-700",
                      "placeholder:italic focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                    )}
                    placeholder="Tu Respuesta"
                  />
                </div>
              </div>
            </div>

            {tutorRequerido && (
              <div className="mb-6 mt-5">
                <Label className="text-sm font-bold text-casal dark:text-gray-200">
                  Datos del tutor o responsable
                </Label>
                <div className={clsx(
                  "mt-2 p-4 border-2 rounded-2xl bg-white/30 border-[#bcd6e4] gap-2",
                  modoVista === "telefono" ? "flex flex-col" : "grid grid-cols-1 lg:grid-cols-3"
                )}>
                  <div className="flex flex-col mb-3">
                    <Label className="text-sm font-semibold text-casal">Nombre (s)</Label>
                    <Input
                      type="text"
                      className={clsx(
                        "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 text-gray-700",
                        "placeholder:italic focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                      )}
                      placeholder="Nombre(s) de la persona responsable"
                    />
                  </div>
                  <div className="flex flex-col mb-3">
                    <Label className="text-sm font-semibold text-casal">Apellido paterno</Label>
                    <Input
                      type="text"
                      className={clsx(
                        "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 text-gray-700",
                        "placeholder:italic focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                      )}
                      placeholder="Apellido paterno de la persona responsable"
                    />
                  </div>
                  <div className="flex flex-col mb-3">
                    <Label className="text-sm font-semibold text-casal">Apellido materno</Label>
                    <Input
                      type="text"
                      className={clsx(
                        "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 text-gray-700",
                        "placeholder:italic focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                      )}
                      placeholder="Apellido materno de la persona responsable"
                    />
                  </div>
                  <div className="lg:col-span-3 flex flex-col mb-3">
                    <Label className="text-sm font-semibold text-casal">Correo electrónico del tutor</Label>
                    <Input
                      type="email"
                      className={clsx(
                        "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 text-gray-700",
                        "placeholder:italic focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                      )}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div className="lg:col-span-3 flex flex-col mb-3">
                    <Label className="text-sm font-semibold text-casal">Fecha de nacimiento del tutor</Label>
                    <Input
                      type="date"
                      className={clsx(
                        "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 text-gray-700",
                        "focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                      )}
                    />
                  </div>
                  <div className="lg:col-span-3 flex flex-col mb-3">
                    <Label className="text-sm font-semibold text-casal">Teléfono</Label>
                    <Input
                      type="text"
                      className={clsx(
                        "mt-2 block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm/6 text-gray-700",
                        "placeholder:italic focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                      )}
                      placeholder="Tu Respuesta"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6 mt-4">
              <div className="p-4 border-2 rounded-2xl bg-white border-[#bcd6e4]">
                <p className="text-sm text-gray-700">
                  Para continuar, debes leer y aceptar el{" "}
                  <button type="button" className="text-casal underline font-semibold hover:text-Acapulco">
                    Aviso de Privacidad
                  </button>
                </p>
              </div>
            </div>

            <div className="mb-6">
              <Label className="text-sm font-bold text-casal dark:text-gray-200">
                Número de teléfono (WhatsApp)
              </Label>
              <div className="flex gap-2 items-start mt-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    className={clsx(
                      "block w-full rounded-3xl border-2 bg-white px-3 py-1.5 text-sm text-gray-700",
                      "placeholder:italic focus:outline-none focus:ring-2 focus:ring-towerGray focus:border-transparent"
                    )}
                    placeholder="Ejemplo: 5512345678"
                    maxLength="10"
                  />
                </div>
                <Button
                  type="button"
                  className="bg-green-600 text-white px-4 py-1.5 rounded-3xl hover:bg-green-700 transition text-sm font-medium flex items-center gap-1 whitespace-nowrap"
                >
                  Enviar código
                </Button>
              </div>
            </div>

            <div className="my-8 flex justify-center">
              <Button className="bg-casal text-xl font-bold text-white w-[80%] mx-auto py-2.5 rounded-3xl hover:bg-Acapulco transition shadow-md">
                Enviar
              </Button>
            </div>
          </Field>
        </div>
      </div>
    </div>
  );
}
