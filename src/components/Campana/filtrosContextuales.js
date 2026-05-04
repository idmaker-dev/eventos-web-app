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
  },

  // FILTROS DE ASISTENCIA
  asistencia_confirmada: {
    tipo: "tristate",
    label: "Asistencia Confirmada",
    categoria: "asistencia",
    descripcion: "Filtra por confirmación de asistencia (código SMS/email)",
    opciones: [
      { value: null, label: "Ambos" },
      { value: true, label: "Confirmó" },
      { value: false, label: "No confirmó" }
    ]
  },

  // =====================================================
  // FILTROS DE USUARIOS DEL SISTEMA
  // Aplican cuando destinatarios_tipo incluye "usuarios"
  // =====================================================
  rol_usuario: {
    tipo: "multiselect",
    label: "Rol del usuario",
    categoria: "usuario",
    descripcion: "Filtra por tipo de usuario en el sistema",
    opciones: [
      { value: "admin", label: "Administrador" },
      { value: "novio", label: "Organizador" }
    ]
  },
  activo_usuario: {
    tipo: "boolean",
    label: "Solo usuarios activos",
    categoria: "usuario",
    descripcion: "Filtra usuarios con cuenta activa en el sistema"
  },
  lugar_id_usuario: {
    tipo: "text",
    label: "Lugar/Sede asignado",
    categoria: "usuario",
    descripcion: "Filtra usuarios asignados a una sede específica (ID o nombre)",
    placeholder: "ID del lugar..."
  }
};

// ========== MAPEO DE FILTROS POR CONTEXTO ==========

/**
 * Define qué filtros son relevantes según el tipo de disparador y evento
 */
export const FILTROS_POR_CONTEXTO = {
  // DISPARADORES DE TIPO "EVENTO"
  evento: {
    // Formulario enviado — siempre al crear (alias semántico de invitado_creado)
    registro_iniciado: {
      categorias_permitidas: ["basico", "personal", "tutor"],
      filtros_recomendados: ["tiene_telefono", "tiene_email", "id_evento"],
      filtros_excluidos: ["estado_deuda", "contrato_firmado", "turno_confirmado", "mesa_seleccionada"],
      mensaje_ayuda: "El graduado acaba de enviar su formulario. Solo están disponibles datos básicos del perfil."
    },
    
    // Flujo CON firma: graduado creado pero esperando firmar contrato
    pendiente_firma_contrato: {
      categorias_permitidas: ["basico", "personal", "tutor", "contrato"],
      filtros_recomendados: ["tiene_telefono", "tiene_email", "id_evento"],
      filtros_excluidos: ["estado_deuda", "turno_confirmado", "mesa_seleccionada"],
      mensaje_ayuda: "El graduado llenó el formulario y está esperando firmar. Ideal para enviar el enlace de firma o un recordatorio de que falta completar el registro."
    },
    
    // Registro completamente listo — con deuda generada (SIN firma al crearse; CON firma al firmar)
    registro_completo: {
      categorias_permitidas: ["basico", "personal", "deuda", "boletos", "contrato", "tutor"],
      filtros_recomendados: ["tiene_telefono", "tiene_email", "id_evento", "estado_deuda"],
      filtros_excluidos: ["turno_confirmado", "mesa_seleccionada", "asistencia_confirmada"],
      mensaje_ayuda: "El registro está completo y la deuda ha sido generada. Ideal para bienvenidas, instrucciones de pago o resumen de boletos."
    },

    // Cuando se crea un nuevo invitado
    invitado_creado: {
      categorias_permitidas: ["basico", "personal", "tutor"],
      filtros_recomendados: ["tiene_telefono", "tiene_email", "id_evento", "es_mayor_edad"],
      filtros_excluidos: ["estado_deuda", "turno_confirmado", "mesa_seleccionada", "contrato_firmado"],
      mensaje_ayuda: "Recién se creó el invitado. Solo están disponibles datos básicos y académicos."
    },
    
    // Cuando se actualiza un invitado
    invitado_actualizado: {
      categorias_permitidas: ["basico", "personal", "tutor"],
      filtros_recomendados: ["tiene_telefono", "tiene_email"],
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
      categorias_permitidas: ["basico", "personal", "deuda", "turnos", "boletos"],
      filtros_recomendados: ["tiene_telefono", "id_evento", "tiene_turno_asignado", "turno_confirmado"],
      filtros_excluidos: ["mesa_seleccionada"],
      mensaje_ayuda: "Se asignó un turno. Los filtros de mesa aún no aplican hasta que se confirme el turno."
    },
    
    turno_confirmado: {
      categorias_permitidas: ["basico", "personal", "deuda", "turnos", "mesas", "boletos"],
      filtros_recomendados: ["tiene_telefono", "id_evento", "turno_confirmado", "mesa_seleccionada"],
      filtros_excluidos: [],
      mensaje_ayuda: "El turno se confirmó. Ya puedes filtrar por selección de mesa."
    },
    
    // Eventos de mesas
    mesa_seleccionada: {
      categorias_permitidas: ["basico", "personal", "deuda", "turnos", "mesas", "boletos"],
      filtros_recomendados: ["tiene_telefono", "id_evento", "mesa_seleccionada", "tiene_restricciones_alimentarias"],
      filtros_excluidos: [],
      mensaje_ayuda: "Se seleccionó una mesa. Todos los filtros están disponibles."
    },
    
    // Eventos de contrato
    contrato_firmado: {
      categorias_permitidas: ["basico", "deuda", "boletos", "contrato"],
      filtros_recomendados: ["tiene_telefono", "id_evento", "contrato_firmado"],
      filtros_excluidos: [],
      mensaje_ayuda: "El invitado acabó de firmar su contrato. Puedes verificar su estado de pago y boletos."
    },

    // Confirmación de asistencia
    asistencia_confirmada: {
      categorias_permitidas: ["basico", "boletos", "turnos", "mesas", "asistencia"],
      filtros_recomendados: ["tiene_telefono", "id_evento", "asistencia_confirmada", "tiene_turno_asignado"],
      filtros_excluidos: ["contrato_firmado", "estado_deuda"],
      mensaje_ayuda: "El invitado confirmó su asistencia. Útil para enviar recordatorios finales o instrucciones del evento."
    }
  },
  
  // DISPARADORES DE TIPO "PROGRAMADO" (cron)
  programado: {
    default: {
      categorias_permitidas: ["basico", "personal", "deuda", "turnos", "mesas", "boletos", "tutor", "contrato", "asistencia"],
      filtros_recomendados: ["tiene_telefono", "id_evento", "estado_deuda"],
      filtros_excluidos: [],
      mensaje_ayuda: "Ejección programada. Todos los filtros de invitados están disponibles."
    }
  },
  
  // DISPARADORES DE TIPO "FECHA_RELATIVA"
  fecha_relativa: {
    default: {
      categorias_permitidas: ["basico", "personal", "deuda", "turnos", "boletos", "tutor"],
      filtros_recomendados: ["tiene_telefono", "id_evento", "estado_deuda", "dias_hasta_vencimiento"],
      filtros_excluidos: [],
      mensaje_ayuda: "Disparador relativo a fecha. Típicamente utilizado para recordatorios de pago o vencimientos."
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

/**
 * Frecuencia recomendada según el tipo de disparador.
 * Ayuda al usuario a elegir la opción correcta en el paso 4.
 */
export const FRECUENCIA_RECOMENDADA = {
  evento: {
    registro_iniciado: { tipo: "unica", razon: "El formulario fue enviado: envío único de confirmación de recepción." },
    pendiente_firma_contrato: { tipo: "recurrente", razon: "El invitado aún no firmó. Enviar recordatorio cada 24–48h hasta que firme." },
    registro_completo: { tipo: "unica", razon: "El registro quedó completo con deuda. Bienvenida definitiva, envío único." },
    invitado_creado: { tipo: "unica", razon: "Bienvenida única por invitado al ser registrado." },
    invitado_actualizado: { tipo: "continua", razon: "Se dispara con cada actualización; considera usar \'Recurrente\' con intervalo si puede ser frecuente." },
    pago_completado: { tipo: "unica", razon: "Confirmación de pago, se envía una sola vez al completarse." },
    pago_parcial: { tipo: "recurrente", razon: "Puede ocurrir varias veces; recomendado con intervalo de 24h mínimo." },
    deuda_vencida: { tipo: "recurrente", razon: "Recordatorio de deuda vencida; intervalos de 48–72h evitan spam." },
    turno_asignado: { tipo: "unica", razon: "Notificación de asignación, ocurre una vez por invitado." },
    turno_confirmado: { tipo: "unica", razon: "Confirmación de turno, ocurre una sola vez." },
    mesa_seleccionada: { tipo: "unica", razon: "Confirmación de mesa seleccionada, envío único." },
    contrato_firmado: { tipo: "unica", razon: "El contrato se firma una sola vez; envío único de bienvenida." },
    asistencia_confirmada: { tipo: "unica", razon: "Confirmación de asistencia, envío único con detalles finales." },
  },
  programado: { tipo: "continua", razon: "Ejecución programada: corre cada vez que llega el horario configurado." },
  fecha_relativa: { tipo: "unica", razon: "Envía una sola vez X días antes del vencimiento de cada deuda." },
};

/**
 * Devuelve la recomendación de frecuencia para el disparador dado.
 */
export function obtenerFrecuenciaRecomendada(tipoDisparador, eventoTipo = null) {
  if (tipoDisparador === "evento" && eventoTipo) {
    return FRECUENCIA_RECOMENDADA.evento[eventoTipo] || null;
  }
  return FRECUENCIA_RECOMENDADA[tipoDisparador] || null;
}

/**
 * Retorna los filtros que aplican a USUARIOS DEL SISTEMA (no a invitados).
 * Se muestran cuando destinatarios_tipo incluye "usuarios".
 */
export function obtenerFiltrosUsuario() {
  return Object.entries(FILTROS_DISPONIBLES)
    .filter(([, filtro]) => filtro.categoria === "usuario")
    .reduce((acc, [key, filtro]) => {
      acc[key] = { ...filtro, es_recomendado: key === "activo_usuario" };
      return acc;
    }, {});
}
