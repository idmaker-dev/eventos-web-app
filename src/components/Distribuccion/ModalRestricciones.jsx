import React, { useState, useEffect, useRef } from "react";
import { X, User, ChevronRight, ChevronLeft, CheckIcon } from "lucide-react";
import { Button, Checkbox } from "@headlessui/react";

export default function ModalRestricciones({
  isOpen,
  onClose,
  invitado,
  cantidadPersonasEspecifica, // ✅ Nueva prop: cantidad específica para esta mesa
  personasPreconfiguradas, // ✅ Personas ya configuradas del modal de espera
  mesaNumero,
  restricciones,
  setRestricciones,
  otra,
  setOtra,
  nombre,
  setNombre,
  tipoMenu,
  setTipoMenu,
  onConfirm,
  configuracionTurnos = null, // ✅ Configuración de turnos para obtener tipos_menu
  subtitulo = null, // ✅ Subtítulo opcional adicional
}) {
  const [personaActual, setPersonaActual] = useState(0);
  const [datosPersonas, setDatosPersonas] = useState([]);
  // ✅ Usar cantidad específica si se proporciona, si no usar cantidad total del invitado
  const cantidadPersonas = cantidadPersonasEspecifica ?? invitado?.cantidad ?? 1;
  const carruselRef = useRef(null); // ✅ Ref para el carrusel

  // Inicializar datos para cada persona
  useEffect(() => {
    if (isOpen && cantidadPersonas > 0) {
      console.log('🔍 [ModalRestricciones] Inicializando:', { 
        cantidadPersonas, 
        tienePreconfiguradas: !!personasPreconfiguradas,
        cantidadPreconfiguradas: personasPreconfiguradas?.length 
      });
      
      let inicializarDatos;
      
      // ✅ Si hay personas pre-configuradas, usarlas
      if (personasPreconfiguradas && personasPreconfiguradas.length > 0) {
        inicializarDatos = personasPreconfiguradas.map((persona, index) => ({
          nombre: persona.nombre || "",
          tipoMenu: persona.tipoMenu || "normal",
          restricciones: persona.restricciones || {},
          otraRestriccion: persona.otraRestriccion || "",
          necesidadesEspeciales: {
            requiereAccesibilidad: persona.necesidadesEspeciales?.requiereAccesibilidad || false,
            comentarios: persona.necesidadesEspeciales?.comentarios || ""
          }
        }));
        console.log('✅ Usando personas pre-configuradas:', inicializarDatos);
      } else {
        // Sin pre-configuración: inicializar vacío
        inicializarDatos = Array.from(
          { length: cantidadPersonas },
          (_, index) => ({
            nombre: "",
            tipoMenu: "normal",
            restricciones: {},
            otraRestriccion: "",
            necesidadesEspeciales: {
              requiereAccesibilidad: false,
              comentarios: ""
            }
          })
        );
      }
      
      setDatosPersonas(inicializarDatos);
      setPersonaActual(0);
    }
  }, [isOpen, cantidadPersonas, configuracionTurnos, personasPreconfiguradas]);

  // ✅ Obtener tipos de menú desde configuración o usar defaults
  // DEBE estar ANTES del early return para cumplir con las reglas de hooks
  const opcionesMenu = React.useMemo(() => {
    console.log('🍽️ [ModalRestricciones] Generando opcionesMenu:', configuracionTurnos?.tipos_menu);
    
    if (configuracionTurnos?.tipos_menu && configuracionTurnos.tipos_menu.length > 0) {
      return configuracionTurnos.tipos_menu.map(tipo => {
        // Manejar si tipo es string o objeto
        const tipoId = typeof tipo === 'string' ? tipo : tipo.id || tipo.value;
        const tipoLabel = typeof tipo === 'string' 
          ? `Menú ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}` 
          : tipo.label || tipo.nombre || `Menú ${tipoId}`;
        
        return {
          id: tipoId,
          label: tipoLabel,
          descripcion: `Opción de menú ${tipoId}`,
        };
      });
    }
    
    // Fallback a opciones por defecto
    return [
      {
        id: "normal",
        label: "Menú Normal",
        descripcion: "Menú completo estándar",
      },
      {
        id: "infantil",
        label: "Menú Infantil",
        descripcion: "Adaptado para niños",
      },
      { id: "especial", label: "Menú Especial", descripcion: "Opciones gourmet" },
      {
        id: "celiaco",
        label: "Menú Celíaco",
        descripcion: "Sin gluten certificado",
      },
    ];
  }, [configuracionTurnos]);

  if (!isOpen) return null;

  // Manejar cambios para la persona actual
  const handleNombreChange = (valor) => {
    setDatosPersonas((prev) =>
      prev.map((persona, index) =>
        index === personaActual ? { ...persona, nombre: valor } : persona
      )
    );
  };

  const handleTipoMenuChange = (tipo) => {
    setDatosPersonas((prev) =>
      prev.map((persona, index) =>
        index === personaActual ? { ...persona, tipoMenu: tipo } : persona
      )
    );
  };

  const handleRestriccionChange = (key, checked) => {
    setDatosPersonas((prev) =>
      prev.map((persona, index) =>
        index === personaActual
          ? {
              ...persona,
              restricciones: { ...persona.restricciones, [key]: checked },
            }
          : persona
      )
    );
  };

  const handleOtraRestriccionChange = (valor) => {
    setDatosPersonas((prev) =>
      prev.map((persona, index) =>
        index === personaActual
          ? { ...persona, otraRestriccion: valor }
          : persona
      )
    );
  };

  const handleAccesibilidadChange = (checked) => {
    setDatosPersonas((prev) =>
      prev.map((persona, index) =>
        index === personaActual
          ? {
              ...persona,
              necesidadesEspeciales: {
                ...persona.necesidadesEspeciales,
                requiereAccesibilidad: checked
              }
            }
          : persona
      )
    );
  };

  const handleComentariosEspecialesChange = (valor) => {
    setDatosPersonas((prev) =>
      prev.map((persona, index) =>
        index === personaActual
          ? {
              ...persona,
              necesidadesEspeciales: {
                ...persona.necesidadesEspeciales,
                comentarios: valor
              }
            }
          : persona
      )
    );
  };

  // Navegación entre personas con scroll automático
  const irSiguientePersona = () => {
    if (personaActual < cantidadPersonas - 1) {
      const nuevaPersona = personaActual + 1;
      setPersonaActual(nuevaPersona);
      scrollToPersona(nuevaPersona);
    }
  };

  const irPersonaAnterior = () => {
    if (personaActual > 0) {
      const nuevaPersona = personaActual - 1;
      setPersonaActual(nuevaPersona);
      scrollToPersona(nuevaPersona);
    }
  };

  const irAPersona = (index) => {
    setPersonaActual(index);
    scrollToPersona(index);
  };

  // Scroll automático al botón de la persona seleccionada
  const scrollToPersona = (index) => {
    if (carruselRef.current) {
      const buttons = carruselRef.current.children;
      if (buttons[index]) {
        buttons[index].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  };

  // Confirmar asignación (nombre ahora es opcional)
  const handleConfirmar = () => {
    console.log('🔍 [ModalRestricciones] Enviando datosPersonas:', JSON.parse(JSON.stringify(datosPersonas)));
    onConfirm({
      personas: datosPersonas,
      cantidadTotal: cantidadPersonas,
    });
  };

  const personaActualData = datosPersonas[personaActual] || {};

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-3xl shadow-lg overflow-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <p className="text-lg font-semibold dark:text-white">
              Información de Invitados
            </p>
            <p className="text-xs dark:text-gray-400">
              Mesa {mesaNumero} • {cantidadPersonas}{" "}
              {cantidadPersonas === 1 ? "persona" : "personas"}
              {subtitulo && <span className="ml-2 text-purple-600 dark:text-purple-400 font-medium">• {subtitulo}</span>}
            </p>
          </div>
          <Button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navegador de personas */}
        {cantidadPersonas > 1 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Configurando persona {personaActual + 1} de {cantidadPersonas}
              </h3>

              <div className="flex gap-2">
                <Button
                  onClick={irPersonaAnterior}
                  disabled={personaActual === 0}
                  className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={irSiguientePersona}
                  disabled={personaActual === cantidadPersonas - 1}
                  className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Indicadores de personas con scroll horizontal */}
            <div 
              ref={carruselRef}
              className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
            >
              {Array.from({ length: cantidadPersonas }, (_, index) => (
                <button
                  key={index}
                  onClick={() => irAPersona(index)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
                    index === personaActual
                      ? "bg-purple-500 text-white"
                      : datosPersonas[index]?.nombre?.trim()
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-white text-gray-600 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <User className="w-3 h-3" />
                  <span>
                    {datosPersonas[index]?.nombre?.trim() ||
                      `Persona ${index + 1}`}
                  </span>
                  {datosPersonas[index]?.nombre?.trim() && (
                    <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Formulario para la persona actual */}
        <div className="p-6 space-y-6">
          {/* Nombre de la persona */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nombre completo{" "}
              {cantidadPersonas > 1 && `(Persona ${personaActual + 1})`}
              <span className="text-xs font-normal text-gray-500 ml-2">(opcional)</span>
            </label>
            <input
              value={personaActualData.nombre || ""}
              onChange={(e) => handleNombreChange(e.target.value)}
              className="block w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 px-4 py-3 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              placeholder={`Nombre de la persona ${personaActual + 1} (opcional)`}
            />
          </div>

          {/* Tipo de Menú */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-3">
              Tipo de Menú{" "}
              <span className="text-xs font-normal text-gray-500">
                (selecciona uno)
              </span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {opcionesMenu.map((opcion) => (
                <div
                  key={opcion.id}
                  className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    personaActualData.tipoMenu === opcion.id
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => handleTipoMenuChange(opcion.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          personaActualData.tipoMenu === opcion.id
                            ? "border-purple-500 bg-purple-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {personaActualData.tipoMenu === opcion.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {opcion.label}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {opcion.descripcion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Necesidades Especiales / Accesibilidad */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-3">
              Necesidades Especiales{" "}
              <span className="text-xs font-normal text-gray-500">
                (accesibilidad y otras necesidades)
              </span>
            </label>
            <div className="p-4 border-2 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 space-y-3">
              {/* Checkbox para silla de ruedas */}
              <label className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                personaActualData.necesidadesEspeciales?.requiereAccesibilidad
                  ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700'
                  : 'bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-800 border-transparent hover:border-blue-200 dark:hover:border-gray-700'
              }`}>
                <Checkbox
                  checked={personaActualData.necesidadesEspeciales?.requiereAccesibilidad || false}
                  onChange={handleAccesibilidadChange}
                  className="group relative flex h-6 w-6 cursor-pointer rounded-md bg-white/10 text-white p-1 ring-1 ring-blue-400 dark:ring-blue-600 ring-inset transition duration-200 ease-in-out focus:outline-none data-[focus]:outline-2 data-[focus]:outline-blue-500 data-[checked]:bg-blue-600"
                >
                  <CheckIcon className="hidden h-4 w-4 fill-blue-600 group-data-[checked]:block" />
                </Checkbox>

                <div className="flex-1">
                  <span className={`font-medium text-base transition-colors ${
                    personaActualData.necesidadesEspeciales?.requiereAccesibilidad
                      ? 'text-blue-800 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    ♿ Requiere silla de ruedas / accesibilidad
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Necesita espacio especial para silla de ruedas o movilidad reducida
                  </p>
                </div>
              </label>

              {/* Campo de comentarios adicionales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comentarios o necesidades adicionales
                </label>
                <textarea
                  value={personaActualData.necesidadesEspeciales?.comentarios || ""}
                  onChange={(e) => handleComentariosEspecialesChange(e.target.value)}
                  placeholder="Ej: Necesita estar cerca de la salida, prefiere mesa con espacio amplio, usa andadera, etc."
                  rows={3}
                  className="block w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 px-3 py-2 text-sm dark:bg-gray-900 dark:text-white text-gray-700 placeholder:italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  💡 Esta información ayudará al organizador a preparar mejor la mesa
                </p>
              </div>
            </div>
          </div>

          {/* Restricciones alimenticias */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-3">
              Restricciones alimenticias{" "}
              <span className="text-xs font-normal text-gray-500">
                (puedes seleccionar varias)
              </span>
            </label>
            <div className="p-4 border-2 rounded-2xl bg-white dark:bg-gray-950 space-y-3">
              {[
                {
                  label: "Vegetariano",
                  key: "vegetariano",
                  descripcion: "No consume carne ni pescado",
                },
                {
                  label: "Vegano",
                  key: "vegano",
                  descripcion: "No consume productos de origen animal",
                },
                {
                  label: "Sin gluten",
                  key: "sinGluten",
                  descripcion: "Intolerancia al gluten",
                },
                {
                  label: "Alergia a marisco",
                  key: "alergiaMarisco",
                  descripcion: "Alérgico a mariscos y crustáceos",
                },
              ].map((item) => {
                const isChecked = personaActualData.restricciones?.[item.key] || false;

                return (
                  <label
                    key={item.key}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                       isChecked 
                       ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700' 
                       : 'hover:bg-purple-50 dark:hover:bg-gray-800 border-transparent hover:border-purple-200 dark:hover:border-gray-700'
                   }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onChange={(checked) => handleRestriccionChange(item.key, checked)}
                      className="group relative flex h-6 w-6 cursor-pointer rounded-md bg-white/10 text-white p-1 ring-1 ring-gray-300 dark:ring-gray-600 ring-inset transition duration-200 ease-in-out focus:outline-none data-[focus]:outline-2 data-[focus]:outline-purple-500 data-[checked]:bg-purple-500"
                    >
                      <CheckIcon className="hidden h-4 w-4 fill-purple-500 group-data-[checked]:block" />
                    </Checkbox>

                    <div className="flex-1">
                      <span className={`font-medium transition-colors ${
                         isChecked 
                           ? 'text-purple-800 dark:text-purple-200' 
                           : 'text-gray-700 dark:text-gray-300'
                       }`}>
                        {item.label}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.descripcion}
                      </p>
                    </div>
                  </label>
                );
              })}

              {/* Restricción personalizada */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Restricción específica adicional
                </label>
                <input
                  type="text"
                  value={personaActualData.otraRestriccion || ""}
                  onChange={(e) => handleOtraRestriccionChange(e.target.value)}
                  placeholder="Ej: Alergia a frutos secos, intolerancia a la lactosa..."
                  className="block w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 px-3 py-2 text-sm dark:bg-gray-900 dark:text-white text-gray-700 placeholder:italic focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Progreso */}
          {cantidadPersonas > 1 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Progreso:{" "}
                  {datosPersonas.filter((p) => p.nombre?.trim()).length} de{" "}
                  {cantidadPersonas} personas configuradas
                </span>
                <div className="flex gap-1">
                  {datosPersonas.map((persona, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        persona.nombre?.trim()
                          ? "bg-green-500"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-between items-center gap-3 p-4 pt-0">
          <div className="flex gap-2">
            {cantidadPersonas > 1 && (
              <>
                <Button
                  onClick={irPersonaAnterior}
                  disabled={personaActual === 0}
                  className="px-4 py-2 rounded-lg border bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Anterior
                </Button>
                <Button
                  onClick={irSiguientePersona}
                  disabled={personaActual === cantidadPersonas - 1}
                  className="px-4 py-2 rounded-lg border bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente →
                </Button>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border bg-slate-200 text-gray-700 border-gray-300 hover:bg-slate-300 transition-colors"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmar}
              className="px-6 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 font-medium transition-colors"
            >
              Guardar {cantidadPersonas} {cantidadPersonas === 1 ? "persona" : "personas"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}