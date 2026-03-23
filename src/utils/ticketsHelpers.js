/**
 * Funciones de utilidad para el módulo de Tickets/Clientes
 * Transformación de datos entre el API y la UI
 */

/**
 * Calcular tiempo transcurrido desde una fecha
 * @param {string} fechaISO - Fecha en formato ISO 8601
 * @returns {string} - Tiempo transcurrido en formato legible
 */
export function calcularTiempoTranscurrido(fechaISO) {
  if (!fechaISO) return "";

  const ahora = new Date();
  const fecha = new Date(fechaISO);
  const diff = ahora - fecha;
  const minutos = Math.floor(diff / 60000);

  if (minutos < 1) return "Hace menos de 1 minuto";
  if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? "s" : ""}`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} hora${horas > 1 ? "s" : ""}`;

  const dias = Math.floor(horas / 24);
  if (dias < 30) return `Hace ${dias} día${dias > 1 ? "s" : ""}`;

  const meses = Math.floor(dias / 30);
  return `Hace ${meses} mes${meses > 1 ? "es" : ""}`;
}

/**
 * Mapear estado del ticket desde API a UI
 * @param {string} estatusAPI - Estado del ticket en el API ('activo', 'cerrado')
 * @returns {string} - Estado para la UI ('activo', 'cerrado')
 */
export function mapearEstadoTicket(estatusAPI) {
  // Normalizar el estado a solo dos opciones
  const estadoNormalizado = estatusAPI?.toLowerCase();

  // Mapear cualquier variación a activo o cerrado
  if (
    estadoNormalizado === "cerrado" ||
    estadoNormalizado === "closed" ||
    estadoNormalizado === "resuelto"
  ) {
    return "cerrado";
  }

  return "activo"; // Por defecto, cualquier otro estado es activo
}

/**
 * Obtener color según estado del ticket
 * @param {string} estatusAPI - Estado del ticket en el API
 * @returns {string} - Color en formato hexadecimal
 */
export function getColorEstado(estatusAPI) {
  const estado = mapearEstadoTicket(estatusAPI);
  const colores = {
    activo: "#3b82f6", // Azul para activo
    cerrado: "#6b7280", // Gris para cerrado
  };
  return colores[estado] || "#3b82f6";
}

/**
 * Formatear fecha ISO a formato legible en español
 * @param {string} fechaISO - Fecha en formato ISO 8601
 * @returns {string} - Fecha en formato DD/MM/YYYY
 */
export function formatearFecha(fechaISO) {
  if (!fechaISO) return "";

  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formatear hora desde fecha ISO
 * @param {string} fechaISO - Fecha en formato ISO 8601
 * @returns {string} - Hora en formato HH:MM AM/PM
 */
export function formatearHora(fechaISO) {
  if (!fechaISO) return "";

  const fecha = new Date(fechaISO);
  return fecha.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Formatear fecha y hora completa
 * @param {string} fechaISO - Fecha en formato ISO 8601
 * @returns {string} - Fecha y hora en formato legible
 */
export function formatearFechaHora(fechaISO) {
  if (!fechaISO) return "";

  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Formatear monto en pesos mexicanos
 * @param {number} monto - Monto numérico
 * @returns {string} - Monto formateado como $X,XXX MXN
 */
export function formatearMonto(monto) {
  if (monto === null || monto === undefined) return "$0 MXN";

  return `$${monto.toLocaleString("es-MX")} MXN`;
}

/**
 * Transformar datos de ticket del API para la UI
 * @param {Object} ticketAPI - Ticket desde el API
 * @returns {Object} - Ticket formateado para la UI
 */
export function transformarTicketParaUI(ticketAPI) {
  if (!ticketAPI) return null;

  return {
    id: ticketAPI.id,
    ticket: ticketAPI.ticket,
    nombre: ticketAPI.nombre,
    telefono: ticketAPI.telefono,
    tiempo: calcularTiempoTranscurrido(ticketAPI.fecha_creacion),
    estado: mapearEstadoTicket(ticketAPI.estatus),
    color: getColorEstado(ticketAPI.estatus),
    estatus: ticketAPI.estatus, // Mantener el original
    mensaje: ticketAPI.mensaje,
    ultimo_mensaje: ticketAPI.ultimo_mensaje,
    fecha_creacion: ticketAPI.fecha_creacion,
    fecha_cierre: ticketAPI.fecha_cierre,
    promotor_asignado: ticketAPI.promotor_asignado,
    canalizado_por_bot: ticketAPI.canalizado_por_bot,
    leido: ticketAPI.leido === true, // Solo true si explícitamente es true
  };
}

/**
 * Transformar información del cliente para la UI
 * @param {Object} clientInfoAPI - Información del cliente desde el API
 * @returns {Object} - Información formateada para la UI
 */
export function transformarClienteParaUI(clientInfoAPI) {
  if (!clientInfoAPI) return null;

  const { datos_personales, informacion_boletos, informacion_pago } =
    clientInfoAPI;

  return {
    nombre: datos_personales?.nombre_completo || "",
    estudios: datos_personales?.estudios || "No especificado",
    institución: datos_personales?.institucion || "No especificado",
    catidadPedido: informacion_boletos?.cantidad_solicitada?.toString() || "0",
    contactoErme: {
      telefonoER: datos_personales?.contacto_emergencia_telefono || "",
      tutorER: datos_personales?.contacto_emergencia_nombre || "",
    },
    contacto: {
      telefono: datos_personales?.telefono || "",
      tutor: datos_personales?.tutor_nombre || "",
    },
    boletos:
      informacion_boletos?.boletos?.map((b) => ({
        codigo: b.codigo,
        asiento: b.asiento || "Sin asiento",
        status: b.estado === "confirmado",
        retriciones: b.restricciones?.map((r) => ({ item: r })) || [
          { item: null },
        ],
      })) || [],
  };
}

/**
 * Transformar información de pago para la UI
 * @param {Object} informacionPago - Información de pago desde el API
 * @returns {Object} - Información de pago formateada para la UI
 */
export function transformarPagoParaUI(informacionPago) {
  if (!informacionPago) return null;

  return {
    estadoGeneral: informacionPago.estado_pago || "Pendiente",
    formaPago: informacionPago.metodo_pago || "No especificado",
    totalBoletos: informacionPago.cantidad_confirmada || 0,
    fechaDePago: formatearFecha(informacionPago.transacciones?.[0]?.fecha),
    totalPagado: formatearMonto(informacionPago.monto_pagado),
    fechaVencimiento: "", // No viene en el API
    transacciones:
      informacionPago.transacciones?.map((t) => ({
        fecha: formatearFecha(t.fecha),
        monto: formatearMonto(t.monto),
        método: t.metodo,
        estado: t.estado,
      })) || [],
    adicional: {
      devoluciones: Array.isArray(informacionPago.devoluciones)
        ? informacionPago.devoluciones.map((d) => ({
          ...d,
          fecha: formatearFecha(d.date),
        }))
        : informacionPago.devoluciones || "No registradas",
      opcionesDevolucion: [], // Depende de la lógica de negocio
      progresoPago: calcularProgresoPago(
        informacionPago.monto_pagado,
        informacionPago.monto_total
      ),
      últimaActualización: "", // No viene en el API
      responsableRegistro: "", // No viene en el API
    },
  };
}

/**
 * Calcular progreso de pago
 * @param {number} montoPagado - Monto pagado
 * @param {number} montoTotal - Monto total
 * @returns {string} - Progreso en formato "XX%"
 */
function calcularProgresoPago(montoPagado, montoTotal) {
  if (!montoTotal || montoTotal === 0) return "0%";
  const progreso = (montoPagado / montoTotal) * 100;
  return `${Math.round(progreso)}%`;
}

/**
 * Transformar historial de acciones para la UI
 * @param {Array} historialAcciones - Historial de acciones desde el API
 * @returns {Array} - Historial formateado para la UI
 */
export function transformarHistorialParaUI(historialAcciones) {
  if (!historialAcciones || !Array.isArray(historialAcciones)) return [];

  return historialAcciones.map((accion) => ({
    fecha: formatearFecha(accion.created_at),
    hora: formatearHora(accion.created_at),
    evento: accion.accion,
    detalle: accion.descripcion,
    // responsable: accion.admin_nombre || "Sistema automático",
  }));
}

/**
 * Transformar mensajes del chat para la UI
 * @param {Array} mensajes - Mensajes desde el API
 * @param {string} nombreCliente - Nombre del cliente
 * @returns {Array} - Mensajes formateados para la UI
 */
export function transformarMensajesParaUI(mensajes, nombreCliente = "Cliente") {
  if (!mensajes || !Array.isArray(mensajes)) return [];

  return mensajes.map((msg) => ({
    remitente: msg.es_admin ? "Soporte" : "Cliente",
    nombre: msg.es_admin ? msg.admin_nombre || "Soporte" : nombreCliente,
    texto: msg.texto,
    hora: formatearFechaHora(msg.fecha || msg.timestamp),
    from: msg.from || (msg.es_admin ? "admin" : "usuario"),
    leido: msg.leido === true, // Solo true si es explícitamente true
    id: msg.id,
  }));
}

/**
 * Mapear tipo de acción a formato legible
 * @param {string} tipoAccion - Tipo de acción desde el API
 * @returns {string} - Tipo de acción legible
 */
export function mapearTipoAccion(tipoAccion) {
  const mapeo = {
    registro_completado: "Registro completado",
    solicitud_boletos: "Solicitud de boletos",
    devolucion: "Devolución",
    cambio_boleto: "Cambio de boleto",
    cancelar_boleto: "Cancelación de boleto",
    pago_completado: "Pago completado",
    devolucion_parcial: "Devolución parcial",
    actualizacion_datos: "Actualización de datos",
    generacion_comprobante: "Generación de comprobante",
    revision_estatus: "Revisión de estatus",
    validacion_manual: "Validación manual",
  };

  return mapeo[tipoAccion] || tipoAccion;
}

/**
 * Validar si un ticket tiene mensajes no leídos
 * @param {Object} estadisticas - Estadísticas del chat
 * @returns {boolean} - True si hay mensajes no leídos
 */
export function tieneMensajesNoLeidos(estadisticas) {
  return estadisticas?.mensajes_no_leidos > 0;
}

/**
 * Obtener badge de estado del ticket
 * @param {string} estatus - Estado del ticket
 * @returns {Object} - Configuración del badge (color, texto)
 */
export function getBadgeEstado(estatus) {
  const estado = mapearEstadoTicket(estatus);
  const badges = {
    activo: {
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      texto: "Activo",
    },
    cerrado: {
      color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
      texto: "Cerrado",
    },
  };

  return badges[estatus] || badges.abierto;
}

/**
 * Crear estructura de ticket compatible con el componente Destalles
 * cuando solo tenemos los datos básicos del listado
 * @param {Object} ticketAPI - Ticket simple del API
 * @returns {Object} - Ticket con estructura completa para el componente
 */
export function crearEstructuraTicketBasico(ticketAPI) {
  if (!ticketAPI) return null;

  return {
    id: ticketAPI.id,
    ticket: ticketAPI.ticket,
    nombre: ticketAPI.nombre,
    tiempo: calcularTiempoTranscurrido(ticketAPI.fecha_creacion),
    estado: mapearEstadoTicket(ticketAPI.estatus),
    color: getColorEstado(ticketAPI.estatus),
    detalle: {
      fechaTicket: formatearFecha(ticketAPI.fecha_creacion),
      nombreAsistente: ticketAPI.nombre || "Sin nombre",
      nombreEvento: "Cargando...",
      estadoDelTicket: ticketAPI.estatus,
      movimiento: ticketAPI.mensaje || "Sin descripción",
      descripcion: ticketAPI.ultimo_mensaje || ticketAPI.mensaje || "",
      boletos: {
        anteriores: [],
        adicionales: [],
      },
      cantidadPagada: "$0 MXN",
      formaPago: "N/A",
      responsableCambio: ticketAPI.nombre_promotor || "Sin asignar",
      fechaPago: "N/A",
      lugarPago: "N/A",
      fechaEvento: "N/A",
      boletosTotales: 0,
      precioBoleto: "$0 MXN",
      fechaDePagos: "N/A",
      coordinadorEvento: "N/A",
    },
    cliente: {
      nombre: ticketAPI.nombre,
      estudios: "N/A",
      institución: "N/A",
      boletos: [],
      responsable: ticketAPI.nombre_promotor || "Sin asignar",
      catidadPedido: "0",
      contactoErme: {
        telefonoER: "",
        tutorER: "",
      },
      contacto: {
        telefono: ticketAPI.telefono || "",
        tutor: "",
      },
    },
    ticketHistorial: [],
    historialSecuencial: [],
    chat: [],
    pago: {
      estado: "pendiente",
      progreso: 0,
      monto_pagado: 0,
      monto_total: 0,
    },
  };
}

/**
 * Transformar datos completos del API (endpoint 2 + 3) a estructura UI
 * @param {Object} ticketDetail - Datos del endpoint GET /tickets/{ticketId}
 * @param {Object} clientInfo - Datos del endpoint GET /tickets/cliente?telefono={telefono}
 * @returns {Object} - Ticket con estructura completa para el componente Destalles
 */
export function transformarTicketCompletoParaUI(ticketDetail, clientInfo) {
  if (!ticketDetail?.ticket) return null;

  console.log(
    "🔄 [transformarTicketCompletoParaUI] Transformando datos del ticket y cliente para la UI",
    { ticketDetail, clientInfo }
  );

  const ticket = ticketDetail.ticket;
  const invitado = ticketDetail.invitado || {};
  const historialAcciones = ticketDetail.historial_acciones || [];
  const conversacion = ticketDetail.conversacion || {};

  const datosPersonales = clientInfo?.datos_personales || {};
  const evento = clientInfo?.evento || {};
  const lugar = evento?.lugar || {};
  const informacionPago = clientInfo?.informacion_pago || {};
  const informacionBoletos = clientInfo?.informacion_boletos || {};
  const historialAccionesCliente =
    clientInfo?.historial_acciones?.acciones || [];
  const historialTickets = clientInfo?.tickets?.lista || [];

  // Formatear boletos para la UI
  let boletosFormateados = (informacionBoletos.boletos || []).map((boleto) => ({
    codigo: boleto.codigo,
    asiento: boleto.mesa_numero ? `Mesa ${boleto.mesa_numero}` : "Sin asignar",
    menu: boleto.menu || "No especificado",
    status: true,
    retriciones: boleto.restricciones
      ? boleto.restricciones.map((r) => ({ item: r }))
      : [],
  }));

  // Ajustar la cantidad de boletos para coincidir con la cantidad solicitada
  // Esto maneja el caso donde el backend actualiza el contador pero aún no genera los registros individuales
  const cantidadSolicitada =
    parseInt(informacionBoletos.cantidad_solicitada) ||
    boletosFormateados.length;

  if (boletosFormateados.length < cantidadSolicitada) {
    // Faltan boletos (recién agregados), agregar placeholders
    const faltantes = cantidadSolicitada - boletosFormateados.length;
    for (let i = 0; i < faltantes; i++) {
      boletosFormateados.push({
        codigo: `Pendiente-${Date.now()}-${i}`, // ID temporal único
        asiento: "Procesando...",
        menu: "No especificado",
        status: false, // Marcar como incompleto/pendiente
        retriciones: [],
      });
    }
  } else if (boletosFormateados.length > cantidadSolicitada) {
    // Sobran boletos (recién eliminados), recortar la lista
    // Asumimos que se eliminan los últimos (o el backend los eliminará pronto)
    boletosFormateados = boletosFormateados.slice(0, cantidadSolicitada);
  }

  // Formatear historial de tickets del cliente (endpoint 3)
  const historialTicketsFormateado = historialTickets.map((t) => ({
    motivo: t.mensaje || "Sin descripción",
    fecha: formatearFecha(t.fecha_creacion),
    estado: mapearEstadoTicket(t.estatus),
    ticket: t.ticket,
    responsable: t.nombre_promotor || "Sin asignar",
  }));

  // Formatear historial de acciones
  const historialFormateado = [
    ...historialAcciones,
    ...historialAccionesCliente,
  ].map((accion) => ({
    fecha: formatearFecha(accion.fecha_accion),
    hora: formatearHora(accion.fecha_accion),
    evento: mapearTipoAccion(accion.tipo_accion),
    detalle: accion.descripcion || "Sin detalles",
    responsable: accion.responsable || "Sistema",
  }));

  // Formatear mensajes del chat
  const mensajesFormateados = (conversacion.mensajes || []).map((msg) => ({
    id: msg.id,
    remitente: msg.from === "usuario" ? "Cliente" : "Soporte",
    from: msg.from,
    texto: msg.texto,
    hora: formatearFechaHora(msg.timestamp),
    timestamp: msg.timestamp,
    leido: msg.leido,
  }));

  return {
    id: ticket.id,
    ticket: ticket.ticket,
    nombre: ticket.nombre,
    tiempo: calcularTiempoTranscurrido(ticket.fecha_creacion),
    estado: mapearEstadoTicket(ticket.estatus),
    color: getColorEstado(ticket.estatus),
    detalle: {
      fechaTicket: formatearFecha(ticket.fecha_creacion),
      nombreAsistente: invitado.nombre_completo || ticket.nombre,
      nombreEvento: evento.descripcion || "Evento principal",
      estadoDelTicket: ticket.estatus,
      movimiento: ticket.mensaje,
      escuela: evento.instituto || "N/A",
      descripcion: ticket.ultimo_mensaje || ticket.mensaje,
      boletos: {
        anteriores: boletosFormateados.slice(
          0,
          Math.floor(boletosFormateados.length / 2)
        ),
        adicionales: boletosFormateados.slice(
          Math.floor(boletosFormateados.length / 2)
        ),
      },
      cantidadPagada: `$${informacionPago.progreso?.monto_pagado || 0} MXN`,
      formaPago: "Tarjeta vinculada - Toku",
      responsableCambio: ticket.nombre_promotor || "Sin asignar",
      fechaPago: informacionPago.ultima_actualizacion
        ? formatearFecha(informacionPago.ultima_actualizacion)
        : "N/A",
      lugarPago: lugar.nombre || "Portal de pagos",
      fechaEvento: evento.fecha_evento
        ? formatearFechaHora(evento.fecha_evento)
        : "N/A",
      boletosTotales: informacionBoletos.cantidad_solicitada || 0,
      precioBoleto: informacionPago.progreso?.monto_total
        ? `$${Math.floor(
          informacionPago.progreso.monto_total /
          (informacionBoletos.cantidad_solicitada || 1)
        )} MXN`
        : "$0 MXN",
      fechaDePagos: informacionPago.cuotas?.lista_cuotas?.[0]?.fecha_vencimiento
        ? formatearFecha(
          informacionPago.cuotas.lista_cuotas[0].fecha_vencimiento
        )
        : "N/A",
      coordinadorEvento: lugar.numero_contacto || "N/A",
    },
    cliente: {
      nombre: datosPersonales.nombre_completo || ticket.nombre,
      estudios: datosPersonales.estudios?.licenciatura || "N/A",
      institución: datosPersonales.estudios?.instituto || "N/A",
      boletos: boletosFormateados,
      responsable: ticket.nombre_promotor || "Sin asignar",
      catidadPedido: String(informacionBoletos.cantidad_solicitada || 0),
      contactoErme: {
        telefonoER: datosPersonales.contacto_emergencia?.telefono || "",
        tutorER: datosPersonales.tutor?.nombre_completo || "",
      },
      contacto: {
        telefono: datosPersonales.numero_telefono || ticket.telefono,
        tutor: datosPersonales.tutor?.nombre_completo || "",
      },
    },
    ticketHistorial: historialTicketsFormateado, // Historial de tickets del cliente
    historialSecuencial: historialFormateado, // Historial de acciones
    chat: mensajesFormateados,
    pago: {
      estadoGeneral:
        informacionPago.cuotas?.vencidas > 0
          ? "Con cuotas vencidas"
          : informacionPago.cuotas?.pendientes > 0
            ? "Pago pendiente"
            : "Al corriente",
      totalBoletos: informacionBoletos.cantidad_asignada || 0,
      totalPagado: formatearMonto(informacionPago.progreso?.monto_pagado || 0),
      formaPago: informacionPago.detalle_transacciones?.at(-1)?.tipo || "Tarjeta vinculada - Toku",
      fechaDePago: informacionPago.ultima_actualizacion
        ? formatearFecha(informacionPago.ultima_actualizacion)
        : "N/A",
      fechaVencimiento: informacionPago.cuotas?.lista_cuotas?.[0]
        ?.fecha_vencimiento
        ? formatearFecha(
          informacionPago.cuotas.lista_cuotas[0].fecha_vencimiento
        )
        : "N/A",
      transacciones: (informacionPago.detalle_transacciones || []).map(
        (tx) => ({
          fecha: formatearFecha(tx.fecha),
          monto: formatearMonto(tx.monto),
          método: tx.tipo || "Tarjeta",
          estado: tx.estado || "Pendiente",
        })
      ),
      adicional: {
        devoluciones: Array.isArray(informacionPago.devoluciones)
          ? informacionPago.devoluciones.map((d) => ({
            ...d,
            fecha: formatearFecha(d.date),
          }))
          : informacionPago.devoluciones || "No registradas",
        opcionesDevolucion: [],
        progresoPago: `${informacionPago.progreso?.porcentaje || 0}%`,
        últimaActualización: informacionPago.ultima_actualizacion
          ? formatearFechaHora(informacionPago.ultima_actualizacion)
          : "N/A",
        responsableRegistro:
          informacionPago.responsable_registro || "Sistema automático",
      },
      detalleExtra: (informacionPago.cuotas?.lista_cuotas || []).map(
        (cuota) => ({
          fecha: formatearFecha(cuota.fecha_vencimiento),
          detalle: `${cuota.descripcion} - ${cuota.estado_display}`,
        })
      ),
      // Datos originales para uso interno
      estado: informacionPago.estado_deuda || "PENDIENTE",
      progreso: informacionPago.progreso?.porcentaje || 0,
      monto_pagado: informacionPago.progreso?.monto_pagado || 0,
      monto_total: informacionPago.progreso?.monto_total || 0,
      monto_pendiente: informacionPago.progreso?.monto_pendiente || 0,
      cuotas: informacionPago.cuotas || {},
    },
    invitado_id: clientInfo?.invitado_id || null,
  };
}
