/**
 * Configuración de filtros contextuales para automatizaciones
 * Define qué filtros son relevantes según el tipo de disparador y evento
 */

// ========== DEFINICIÓN DE TODOS LOS FILTROS DISPONIBLES ==========
export const FILTROS_DISPONIBLES = {
  // FILTROS BÁSICOS (siempre relevantes)
  tiene_telefono: {
    tipo: "boolean",
    label: "Solo usuarios con teléfono registrado",
    categoria: "basico",
    descripcion: "Filtra usuarios que tienen número de teléfono en su perfil"
  },
  tiene_email: {
    tipo: "boolean",
    label: "Solo usuarios con correo electrónico",
    categoria: "basico",
    descripcion: "Filtra usuarios que tienen email registrado"
  },
  id_evento: {
    tipo: "select",
    label: "Evento",
    categoria: "basico",
    descripcion: "Filtra por evento específico (vacío = todos los eventos)",
    placeholder: "Todos los eventos",
    opciones_dinamicas: "eventos"
  },
  
  // FILTROS DE DATOS ACADÉMICOS
  instituto: {
    tipo: "text",
    label: "Instituto/Universidad",
    categoria: "academico",
    descripcion: "Filtra por institución educativa (ej: UNAM, IPN)",
    placeholder: "Nombre del instituto"
  },
  licenciatura: {
    tipo: "text",
    label: "Licenciatura/Carrera",
    categoria: "academico",
    descripcion: "Filtra por programa académico (ej: Derecho, Medicina)",
    placeholder: "Nombre de la carrera"
  },
  escuela: {
    tipo: "text",
    label: "Escuela/Campus",
    categoria: "academico",
    descripcion: "Filtra por escuela o campus específico",
    placeholder: "Nombre de la escuela"
  },
  
  // FILTROS DE DATOS PERSONALES
  es_mayor_edad: {
    tipo: "tristate", // null, true, false
    label: "Mayor de Edad",
    categoria: "personal",
    descripcion: "Filtra por mayoría de edad",
    opciones: [
      { value: null, label: "Ambos" },
      { value: true, label: "Sí (18+)" },
      { value: false, label: "No (menor)" }
    ]
  },
  rango_edad: {
    tipo: "range",
    label: "Rango de Edad",
    categoria: "personal",
    descripcion: "Filtra por rango de edad",
    min: 0,
    max: 100
  },
  
  // FILTROS DE BOLETOS
  tiene_boletos: {
    tipo: "boolean",
    label: "Tiene boletos asignados",
    categoria: "boletos",
    descripcion: "Filtra usuarios con boletos activos"
  },
  cantidad_boletos_min: {
    tipo: "number",
    label: "Cantidad Mínima de Boletos",
    categoria: "boletos",
    descripcion: "Número mínimo de boletos",
    min: 1
  },
  
  // FILTROS DE DEUDA/PAGO
  estado_deuda: {
    tipo: "multiselect",
    label: "Estado de Deuda",
    categoria: "deuda",
    descripcion: "Filtra por estado de cuenta",
    opciones: [
      { value: "PENDIENTE", label: "Pendiente", color: "yellow" },
      { value: "PAGADA", label: "Pagada", color: "green" },
      { value: "VENCIDA", label: "Vencida", color: "red" },
      { value: "PARCIAL", label: "Parcial", color: "orange" }
    ]
  },
  monto_pendiente_min: {
    tipo: "number",
    label: "Monto Pendiente Mínimo",
    categoria: "deuda",
    descripcion: "Saldo mínimo pendiente de pago",
    min: 0,
    prefix: "$"
  },
  monto_pendiente_max: {
    tipo: "number",
    label: "Monto Pendiente Máximo",
    categoria: "deuda",
    descripcion: "Saldo máximo pendiente de pago",
    min: 0,
    prefix: "$"
  },
  dias_hasta_vencimiento: {
    tipo: "number",
    label: "Días Hasta Vencimiento",
    categoria: "deuda",
    descripcion: "Filtrar deudas que vencen en X días o menos",
    min: 0,
    max: 365
  },
  
  // FILTROS DE TURNOS
  turno_confirmado: {
    tipo: "tristate",
    label: "Turno Confirmado",
    categoria: "turnos",
    descripcion: "Filtra por confirmación de turno",
    opciones: [
      { value: null, label: "Ambos" },
      { value: true, label: "Sí" },
      { value: false, label: "No" }
    ]
  },
  tiene_turno_asignado: {
    tipo: "boolean",
    label: "Tiene turno asignado",
    categoria: "turnos",
    descripcion: "Filtra usuarios con turno activo"
  },
  
  // FILTROS DE MESAS
  mesa_seleccionada: {
    tipo: "tristate",
    label: "Mesa Seleccionada",
    categoria: "mesas",
    descripcion: "Filtra por selección de mesa",
    opciones: [
      { value: null, label: "Ambos" },
      { value: true, label: "Sí" },
      { value: false, label: "No" }
    ]
  },
  tiene_restricciones_alimentarias: {
    tipo: "boolean",
    label: "Tiene restricciones alimentarias",
    categoria: "mesas",
    descripcion: "Filtra usuarios con restricciones dietéticas registradas"
  },
  
  // FILTROS DE TUTOR
  tiene_tutor: {
    tipo: "boolean",
    label: "Tiene tutor/responsable registrado",
    categoria: "tutor",
    descripcion: "Filtra usuarios con información de tutor"
  },
  
  // FILTROS DE CONTRATO/FIRMA
  contrato_firmado: {
    tipo: "tristate",
    label: "Contrato Firmado",
    categoria: "contrato",
    descripcion: "Filtra por firma de contrato",
    opciones: [
      { value: null, label: "Ambos" },
      { value: true, label: "Sí" },
      { value: false, label: "No" }
    ]
  }
};

// ========== MAPEO DE FILTROS POR CONTEXTO ==========

/**
 * Define qué filtros son relevantes según el tipo de disparador y evento
 */
export const FILTROS_POR_CONTEXTO = {
  // DISPARADORES DE TIPO "EVENTO"
  evento: {
    // Cuando se crea un nuevo invitado
    invitado_creado: {
      categorias_permitidas: ["basico", "academico", "personal", "tutor"],
      filtros_recomendados: ["tiene_telefono", "tiene_email", "id_evento", "instituto", "licenciatura", "es_mayor_edad"],
      filtros_excluidos: ["estado_deuda", "turno_confirmado", "mesa_seleccionada", "contrato_firmado"],
      mensaje_ayuda: "Recién se creó el invitado. Solo están disponibles datos básicos y académicos."
    },
    
    // Cuando se actualiza un invitado
    invitado_actualizado: {
      categorias_permitidas: ["basico", "academico", "personal", "tutor"],
      filtros_recomendados: ["tiene_telefono", "tiene_email", "instituto", "licenciatura"],
      filtros_excluidos: [],
      mensaje_ayuda: "Pueden aplicarse la mayoría de filtros excepto los específicos de pago o turno si aún no se han generado."
    },
    
    // Eventos de pago
    pago_completado: {
      categorias_permitidas: ["basico", "deuda", "boletos"],
      filtros_recomendados: ["tiene_telefono", "id_evento", "estado_deuda", "monto_pendiente_min"],
      filtros_excluidos: [],
      mensaje_ayuda: "El pago se completó. Puedes filtrar por estado de deuda y montos."
    },
    
    pago_parcial: {
      categorias_permitidas: ["basico", "deuda", "boletos"],
      filtros_recomendados: ["tiene_telefono", "id_evento", "estado_deuda", "monto_pendiente_min"],
      filtros_excluidos: [],
      mensaje_ayuda: "Se registró un pago parcial. Filtros de deuda disponibles."
    },
    
    deuda_vencida: {
      categorias_permitidas: ["basico", "deuda", "boletos"],
      filtros_recomendados: ["tiene_telefono", "id_evento", "estado_deuda", "monto_pendiente_min", "dias_hasta_vencimiento"],
      filtros_excluidos: [],
      mensaje_ayuda: "La deuda venció. Puedes filtrar por monto y días de vencimiento."
    },
    
    // Eventos de turnos
    turno_asignado: {
      categorias_permitidas: ["basico", "academico", "personal", "deuda", "turnos", "boletos"],
      filtros_recomendados: ["tiene_telefono", "id_evento", "tiene_turno_asignado", "turno_confirmado"],
      filtros_excluidos: ["mesa_seleccionada"],
      mensaje_ayuda: "Se asignó un turno. Los filtros de mesa aún no aplican hasta que se confirme el turno."
    },
    
    turno_confirmado: {
      categorias_permitidas: ["basico", "academico", "personal", "deuda", "turnos", "mesas", "boletos"],
      filtros_recomendados: ["tiene_telefono", "id_evento", "turno_confirmado", "mesa_seleccionada"],
      filtros_excluidos: [],
      mensaje_ayuda: "El turno se confirmó. Ya puedes filtrar por selección de mesa."
    },
    
    // Eventos de mesas
    mesa_seleccionada: {
      categorias_permitidas: ["basico", "academico", "personal", "deuda", "turnos", "mesas", "boletos"],
      filtros_recomendados: ["tiene_telefono", "id_evento", "mesa_seleccionada", "tiene_restricciones_alimentarias"],
      filtros_excluidos: [],
      mensaje_ayuda: "Se seleccionó una mesa. Todos los filtros están disponibles."
    },
    
    // Eventos de contrato
    contrato_firmado: {
      categorias_permitidas: ["basico", "deuda", "boletos", "contrato"],
      filtros_recomendados: ["tiene_telefono", "id_evento", "contrato_firmado"],
      filtros_excluidos: [],
      mensaje_ayuda: "Se firmó el contrato. Filtros de turnos/mesas no aplican."
    }
  },
  
  // DISPARADORES DE TIPO "PROGRAMADO" (cron)
  programado: {
    default: {
      categorias_permitidas: ["basico", "academico", "personal", "deuda", "turnos", "mesas", "boletos", "tutor", "contrato"],
      filtros_recomendados: ["tiene_telefono", "id_evento", "estado_deuda"],
      filtros_excluidos: [],
      mensaje_ayuda: "Ejecución programada. Todos los filtros están disponibles según el contexto de tu automatización."
    }
  },
  
  // DISPARADORES DE TIPO "FECHA_RELATIVA"
  fecha_relativa: {
    default: {
      categorias_permitidas: ["basico", "academico", "personal", "deuda", "turnos", "boletos", "tutor"],
      filtros_recomendados: ["tiene_telefono", "id_evento", "estado_deuda", "dias_hasta_vencimiento"],
      filtros_excluidos: [],
      mensaje_ayuda: "Disparador relativo a fecha. Típicamente usado para recordatorios de pago o turnos."
    }
  }
};

/**
 * Obtiene la configuración de filtros para un disparador específico
 */
export function obtenerFiltrosRelevantes(tipoDisparador, eventoTipo = null) {
  if (tipoDisparador === "evento" && eventoTipo) {
    return FILTROS_POR_CONTEXTO.evento[eventoTipo] || FILTROS_POR_CONTEXTO.evento.invitado_actualizado;
  }
  
  if (tipoDisparador === "programado") {
    return FILTROS_POR_CONTEXTO.programado.default;
  }
  
  if (tipoDisparador === "fecha_relativa") {
    return FILTROS_POR_CONTEXTO.fecha_relativa.default;
  }
  
  // Default: permitir todos los filtros básicos
  return {
    categorias_permitidas: ["basico"],
    filtros_recomendados: ["tiene_telefono", "id_evento"],
    filtros_excluidos: [],
    mensaje_ayuda: "Selecciona un tipo de disparador para ver filtros relevantes."
  };
}

/**
 * Obtiene los filtros que deben mostrarse según el contexto
 */
export function obtenerFiltrosDisponibles(tipoDisparador, eventoTipo = null) {
  const contexto = obtenerFiltrosRelevantes(tipoDisparador, eventoTipo);
  
  return Object.entries(FILTROS_DISPONIBLES)
    .filter(([key, filtro]) => {
      // Excluir filtros específicamente bloqueados
      if (contexto.filtros_excluidos.includes(key)) {
        return false;
      }
      
      // Incluir solo filtros de categorías permitidas
      return contexto.categorias_permitidas.includes(filtro.categoria);
    })
    .reduce((acc, [key, filtro]) => {
      acc[key] = {
        ...filtro,
        es_recomendado: contexto.filtros_recomendados.includes(key)
      };
      return acc;
    }, {});
}

/**
 * Obtiene el mensaje de ayuda contextual
 */
export function obtenerMensajeAyuda(tipoDisparador, eventoTipo = null) {
  const contexto = obtenerFiltrosRelevantes(tipoDisparador, eventoTipo);
  return contexto.mensaje_ayuda;
}
