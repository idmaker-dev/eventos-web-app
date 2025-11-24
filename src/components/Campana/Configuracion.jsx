import React, { useState } from "react";
import {
  ChevronLeft,
  MoreHorizontal,
  Edit,
  Send,
  CircleCheckBig,
  Link,
  Laugh,
  X,
  Check,
} from "lucide-react";
import { Button, Dialog, DialogPanel } from "@headlessui/react";

export default function Configuracion({ campana, onVolver }) {
  const [pasos, setPasos] = useState([
    {
      id: 1,
      tipo: "usuario",
      titulo: "Paso 1: Recibo un mensaje (Usuario)",
      completado: false,
      activo: true,
    },
    {
      id: 2,
      tipo: "admin",
      titulo: "Paso 2: Redactar respuesta (Adm)",
      completado: true,
      activo: false,
    },
    {
      id: 3,
      tipo: "usuario",
      titulo: "Paso 3: Recibo un mensaje (Usuario)",
      completado: false,
      activo: false,
    },
    {
      id: 4,
      tipo: "admin",
      titulo: "Paso 4: Redactar respuesta( Adm)",
      completado: true,
      activo: false,
    },
  ]);

  // Variables del mensaje editables
  const [mensajeConfig, setMensajeConfig] = useState({
    nombreUsuario: "Nombre Usuario",
    nombreEvento: "nombre evento",
    fechaHora: "fecha y hora",
    lugar: "lugar",
    precio: "$800",
    enlaceGenerado: "enlace generado",
  });

  // Estado para el modal de edición
  const [modalEdicion, setModalEdicion] = useState(false);
  const [configTemporal, setConfigTemporal] = useState({});

  const [pasoSeleccionado, setPasoSeleccionado] = useState(2);

  const agregarPaso = () => {
    const nuevoPaso = {
      id: pasos.length + 1,
      tipo: pasos.length % 2 === 0 ? "usuario" : "admin",
      titulo: `Paso ${pasos.length + 1}: ${
        pasos.length % 2 === 0
          ? "Recibo un mensaje (Usuario)"
          : "Redactar respuesta (Adm)"
      }`,
      completado: false,
      activo: false,
    };
    setPasos([...pasos, nuevoPaso]);
  };

  // Función para abrir el modal de edición
  const abrirModalEdicion = () => {
    setConfigTemporal({ ...mensajeConfig });
    setModalEdicion(true);
  };

  // Función para guardar cambios
  const guardarCambios = () => {
    setMensajeConfig({ ...configTemporal });
    setModalEdicion(false);
  };

  // Función para actualizar variable temporal
  const actualizarVariable = (key, value) => {
    setConfigTemporal((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const generarMensaje = () => {
    return `Hola (${mensajeConfig.nombreUsuario}), tu evento (${mensajeConfig.nombreEvento}) se llevará a cabo el (${mensajeConfig.fechaHora}) en (${mensajeConfig.lugar}). El precio del boleto es ${mensajeConfig.precio} mxn por persona, para seleccionar tu mesa o asiento, primero debes realizar tu pago oportuno, por medio de un ${mensajeConfig.enlaceGenerado}, en breve te compartimos el enlace de pago. Cualquier duda o consulta, estamos para ayudarte en este chat.`;
  };

  return (
    <div className="min-h-screen border rounded-3xl p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel Izquierdo - Flujo de Pasos */}
          <div className="lg:col-span-2 bg-fondoVs dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm">
            {/* Header */}
            <div className="flex gap-3 items-center mb-6">
              <Button
                onClick={onVolver}
                className="flex items-center gap-2 text-white bg-casal px-2 rounded-lg py-1 hover:bg-casal/80 font-medium"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="bg-white dark:bg-[#2a2a2a] rounded-full px-5 py-1 text-Acapulco font-semibold">
                Automatizar respuesta: Pagos
              </span>
            </div>

            <div>
              <div className="text-left l-8 mb-8">
                <h2 className="text-xl font-semibold text-casal mb-2">
                  Editar el flujo
                </h2>
              </div>

              {/* Lista de Pasos */}
              <div className="space-y-4 max-w-4xl">
                {pasos.map((paso, index) => (
                  <div key={paso.id} className="relative">
                    {/* Línea conectora */}
                    <div className="hidden sm:block ">
                      {index < pasos.length - 1 && (
                        <div className="absolute left-1/2 top-14 w-1 h-5 bg-Acapulco "></div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Icono del paso */}
                      <div
                        className={`w-10 h-10 flex items-center justify-center ${
                          paso.completado
                            ? "bg-casal/10 rounded-full"
                            : paso.tipo === "usuario"
                            ? "bg-casal rounded-t-full rounded-br-full"
                            : "bg-gray-400 rounded-t-full rounded-br-full"
                        }`}
                      >
                        {paso.completado ? (
                          <CircleCheckBig className="h-6 w-6 text-Acapulco" />
                        ) : (
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        )}
                      </div>

                      {/* Contenido del paso */}
                      <div className="flex-1 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 flex items-center justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {paso.titulo}
                        </span>
                        <Button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Botón Agregar Paso */}
                <div className="flex justify-center pt-6">
                  <Button
                    onClick={agregarPaso}
                    className="flex items-center gap-2 bg-white dark:bg-[#2a2a2a] rounded-3xl px-3 py-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium"
                  >
                    <span className="text-2xl">+</span>
                    Agregar paso
                  </Button>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="justify-center flex mt-8">
              <div className="flex gap-4 p-3 bg-white dark:bg-[#2a2a2a] rounded-full shadow-md">
                <Button className="bg-casal hover:bg-casal/90 text-white px-6 py-2 rounded-3xl font-medium">
                  Guardar cambios
                </Button>
                <Button className="flex items-center gap-2 bg-fondoVs rounded-3xl dark:bg-[#1a1a1a] text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 px-6 py-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Desactivar
                </Button>
              </div>
            </div>
          </div>

          {/* Panel Derecho - Configuración */}
          <div className="space-y-6">
            {/* Editor de Mensaje */}
            <div className="rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xl font-semibold">
                  <span className="text-casal">Configuración de</span>{" "}
                  <span className="text-Acapulco">Paso 2</span>
                </h3>
              </div>

              <div className="flex items-center gap-2 mb-4"></div>

              <div className=" border-2 relative rounded-3xl shadow-sm p-4">
                <div className="absolute -top-4 left-5 bg-white dark:bg-[#2a2a2a] px-3 text-gray-600 dark:text-gray-300 font-medium text-lg">
                  Editar mensaje
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-300 leading-relaxed">
                    Hola (
                    <span className="text-casal font-medium">
                      {mensajeConfig.nombreUsuario}
                    </span>
                    ), tu evento (
                    <span className="text-casal font-medium">
                      {mensajeConfig.nombreEvento}
                    </span>
                    ) se llevará a cabo el (
                    <span className="text-casal font-medium">
                      {mensajeConfig.fechaHora}
                    </span>
                    ) en (
                    <span className="text-casal font-medium">
                      {mensajeConfig.lugar}
                    </span>
                    ). El precio del boleto es {mensajeConfig.precio} mxn por
                    persona, para seleccionar tu mesa o asiento, primero debes
                    realizar tu pago oportuno, por medio de un{" "}
                    <span className="text-casal font-medium">
                      {mensajeConfig.enlaceGenerado}
                    </span>
                    , en breve te compartimos el enlace de pago. Cualquier duda
                    o consulta, estamos para ayudarte en este chat.
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={abrirModalEdicion}
                    className="bg-casal dark:bg-gray-500 text-white px-2 py-1 rounded text-sm flex items-center gap-1 hover:bg-casal/80"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button className="text-casal hover:text-casal/80">
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button className="text-casal hover:text-casal/80">
                    <Laugh className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Acciones y Etiquetas */}
              <div className="p-6 relative rounded-3xl shadow-sm border-2">
                <div className="absolute -top-4 left-5 bg-white dark:bg-[#2a2a2a] px-3 text-gray-600 dark:text-gray-300 font-medium text-lg">
                  Agregar acción / etiqueta
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">
                    Generar un{" "}
                    <span className="text-casal dark:text-Acapulco font-semibold">
                      enlace de pago
                    </span>{" "}
                    para el usuario
                  </p>
                </div>

                <Button className="w-full bg-Acapulco hover:bg-Acapulco/80 text-white py-3 rounded-lg font-semibold">
                  Generar enlace de pago a evento (***)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edición de Variables */}
      <Dialog
        open={modalEdicion}
        onClose={() => setModalEdicion(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Editar Variables del Mensaje
              </h3>
              <Button
                onClick={() => setModalEdicion(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Formulario de Variables */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Usuario
                </label>
                <input
                  type="text"
                  value={configTemporal.nombreUsuario || ""}
                  onChange={(e) =>
                    actualizarVariable("nombreUsuario", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-casal focus:border-transparent"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Evento
                </label>
                <input
                  type="text"
                  value={configTemporal.nombreEvento || ""}
                  onChange={(e) =>
                    actualizarVariable("nombreEvento", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-casal focus:border-transparent"
                  placeholder="Ej: Graduación ITESM 2025"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha y Hora
                  </label>
                  <input
                    type="text"
                    value={configTemporal.fechaHora || ""}
                    onChange={(e) =>
                      actualizarVariable("fechaHora", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-casal focus:border-transparent"
                    placeholder="Ej: 15 de Diciembre 2024, 7:00 PM"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lugar
                  </label>
                  <input
                    type="text"
                    value={configTemporal.lugar || ""}
                    onChange={(e) =>
                      actualizarVariable("lugar", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-casal focus:border-transparent"
                    placeholder="Ej: Centro de Convenciones"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Precio
                  </label>
                  <input
                    type="text"
                    value={configTemporal.precio || ""}
                    onChange={(e) =>
                      actualizarVariable("precio", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-casal focus:border-transparent"
                    placeholder="Ej: $800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Enlace
                  </label>
                  <input
                    type="text"
                    value={configTemporal.enlaceGenerado || ""}
                    onChange={(e) =>
                      actualizarVariable("enlaceGenerado", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-casal focus:border-transparent"
                    placeholder="Ej: enlace de pago seguro"
                  />
                </div>
              </div>
            </div>

            {/* Preview del mensaje */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vista Previa del Mensaje
              </label>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Hola (
                  <span className="text-casal font-medium">
                    {configTemporal.nombreUsuario || "Nombre Usuario"}
                  </span>
                  ), tu evento (
                  <span className="text-casal font-medium">
                    {configTemporal.nombreEvento || "nombre evento"}
                  </span>
                  ) se llevará a cabo el (
                  <span className="text-casal font-medium">
                    {configTemporal.fechaHora || "fecha y hora"}
                  </span>
                  ) en (
                  <span className="text-casal font-medium">
                    {configTemporal.lugar || "lugar"}
                  </span>
                  ). El precio del boleto es {configTemporal.precio || "$800"}{" "}
                  mxn por persona, para seleccionar tu mesa o asiento, primero
                  debes realizar tu pago oportuno, por medio de un{" "}
                  <span className="text-casal font-medium">
                    {configTemporal.enlaceGenerado || "enlace generado"}
                  </span>
                  , en breve te compartimos el enlace de pago. Cualquier duda o
                  consulta, estamos para ayudarte en este chat.
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                onClick={() => setModalEdicion(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
              >
                Cancelar
              </Button>
              <Button
                onClick={guardarCambios}
                className="flex items-center gap-2 bg-casal hover:bg-casal/90 text-white px-6 py-2 rounded-lg font-medium"
              >
                <Check className="h-4 w-4" />
                Guardar Cambios
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
