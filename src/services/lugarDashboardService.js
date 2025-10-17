import httpService from "./httpService";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function decodeMaybe(str) {
  if (typeof str !== "string") return str;
  try {
    // Intentar reparar UTF-8 doblemente interpretado
    return decodeURIComponent(escape(str));
  } catch {
    return str;
  }
}

function parseMoney(m) {
  if (!m) return 0;
  if (typeof m === "number") return m;
  const cleaned = m.replace(/[^0-9.,-]/g, "").replace(/,/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parsePercent(p) {
  if (!p) return 0;
  if (typeof p === "number") return p;
  const cleaned = p.replace(/%/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

async function fetchReal(lugarId) {
  const data = await httpService.get(`/lugares/${lugarId}/dashboard`);
  // Se espera estructura { success, data: {...} }
  const payload = data.data || data; // tolerar ambas formas
  const estad = payload.estadisticas || {};
  const proximos = payload.proximos_eventos || [];
  const recientes = payload.eventos_recientes || [];

  return {
    lugarNombre: decodeMaybe(payload.lugar?.nombre) || "Lugar",
    totales: {
      eventos: estad.eventos_totales ?? 0,
      asistentes: estad.asistentes_acumulados ?? 0,
      asistentesAlumnos: estad.asistentes_alumnos_acumulados ?? 0,
      ocupacionPromedio: parsePercent(estad.ocupacion_promedio),
      ingresosEstimados: parseMoney(estad.ingresos_estimados),
      // Nuevos datos de boletos
      boletosApartados: estad.boletos_apartados ?? 0,
      boletosApartadosDinero: parseMoney(estad.boletos_apartados_dinero),
      boletosPagados: estad.boletos_pagados ?? 0,
      boletosPagadosDinero: parseMoney(estad.boletos_pagados_dinero),
      boletosPorPagar: estad.boletos_por_pagar ?? 0,
      boletosPorPagarDinero: parseMoney(estad.boletos_por_pagar_dinero),
      porcentajePagados: parsePercent(estad.porcentaje_pagados),
      // Nuevos datos de abonos
      abonoRealizado: parseMoney(estad.abono_realizado),
      porcentajeAbonado: parsePercent(estad.porcentaje_abonado),
    },
    proximosEventos: proximos.map((e, idx) => ({
      id: e.id || `prox-${idx}`,
      fecha: e.fecha,
      nombre: decodeMaybe(e.nombre),
      tipo: decodeMaybe(e.tipo),
      invitados: e.asistentes ?? 0,
      asistentesAlumnos: e.asistentes_alumnos ?? 0,
      ocupacion: parsePercent(e.ocupacion),
      // Nuevos datos de boletos por evento
      boletosApartados: e.boletos_apartados ?? 0,
      boletosApartadosDinero: parseMoney(e.boletos_apartados_dinero),
      boletosPagados: e.boletos_pagados ?? 0,
      boletosPagadosDinero: parseMoney(e.boletos_pagados_dinero),
      boletosPorPagar: e.boletos_por_pagar ?? 0,
      boletosPorPagarDinero: parseMoney(e.boletos_por_pagar_dinero),
      porcentajePagados: parsePercent(e.porcentaje_pagados),
      // Nuevos datos de abonos
      abonoRealizado: parseMoney(e.abono_realizado),
      porcentajeAbonado: parsePercent(e.porcentaje_abonado),
    })),
    eventosRecientes: recientes.map((e, idx) => ({
      id: e.id || `rec-${idx}`,
      fecha: e.fecha,
      nombre: decodeMaybe(e.nombre),
      tipo: decodeMaybe(e.tipo),
      asistentes: e.asistentes ?? 0,
      asistentesAlumnos: e.asistentes_alumnos ?? 0,
      ocupacion: parsePercent(e.ocupacion),
      // Nuevos datos de boletos por evento
      boletosApartados: e.boletos_apartados ?? 0,
      boletosApartadosDinero: parseMoney(e.boletos_apartados_dinero),
      boletosPagados: e.boletos_pagados ?? 0,
      boletosPagadosDinero: parseMoney(e.boletos_pagados_dinero),
      boletosPorPagar: e.boletos_por_pagar ?? 0,
      boletosPorPagarDinero: parseMoney(e.boletos_por_pagar_dinero),
      porcentajePagados: parsePercent(e.porcentaje_pagados),
      // Nuevos datos de abonos
      abonoRealizado: parseMoney(e.abono_realizado),
      porcentajeAbonado: parsePercent(e.porcentaje_abonado),
    })),
    topTiposEventos: [], // backend aún no lo provee
    timestamp: payload.timestamp,
    raw: payload,
  };
}

async function fetchMock() {
  await delay(300);
  return {
    lugarNombre: "Salón Jardines del Lago",
    totales: {
      eventos: 42,
      asistentes: 6850,
      ocupacionPromedio: 78,
      ingresosEstimados: 125000,
      // Datos de boletos mock
      boletosApartados: 5680,
      boletosApartadosDinero: 113600,
      boletosPagados: 3420,
      boletosPagadosDinero: 68400,
      boletosPorPagar: 2260,
      boletosPorPagarDinero: 45200,
      porcentajePagados: 60,
      // Datos de abonos mock
      abonoRealizado: 22640,
      porcentajeAbonado: 20,
    },
    proximosEventos: [
      {
        id: "p1",
        fecha: "2025-10-20",
        nombre: "Boda Ramírez-Gómez",
        tipo: "Boda",
        invitados: 230,
        asistentesAlumnos: 0,
        ocupacion: 0,
        boletosApartados: 180,
        boletosApartadosDinero: 36000,
        boletosPagados: 120,
        boletosPagadosDinero: 24000,
        boletosPorPagar: 60,
        boletosPorPagarDinero: 12000,
        porcentajePagados: 67,
        abonoRealizado: 3600,
        porcentajeAbonado: 10,
      },
      {
        id: "p2",
        fecha: "2025-11-05",
        nombre: "Graduación Ingeniería",
        tipo: "Graduación",
        invitados: 480,
        asistentesAlumnos: 120,
        ocupacion: 0,
        boletosApartados: 450,
        boletosApartadosDinero: 90000,
        boletosPagados: 180,
        boletosPagadosDinero: 36000,
        boletosPorPagar: 270,
        boletosPorPagarDinero: 54000,
        porcentajePagados: 40,
        abonoRealizado: 13500,
        porcentajeAbonado: 15,
      },
      {
        id: "p3",
        fecha: "2025-11-18",
        nombre: "Cena Corporativa ACME",
        tipo: "Corporativo",
        invitados: 150,
        asistentesAlumnos: 0,
        ocupacion: 0,
        boletosApartados: 140,
        boletosApartadosDinero: 28000,
        boletosPagados: 140,
        boletosPagadosDinero: 28000,
        boletosPorPagar: 0,
        boletosPorPagarDinero: 0,
        porcentajePagados: 100,
        abonoRealizado: 0,
        porcentajeAbonado: 0,
      },
    ],
    eventosRecientes: [
      {
        id: "r1",
        fecha: "2025-09-27",
        nombre: "Expo Proveedores",
        tipo: "Feria",
        asistentes: 520,
        asistentesAlumnos: 0,
        ocupacion: 82,
        boletosApartados: 500,
        boletosApartadosDinero: 100000,
        boletosPagados: 450,
        boletosPagadosDinero: 90000,
        boletosPorPagar: 50,
        boletosPorPagarDinero: 10000,
        porcentajePagados: 90,
        abonoRealizado: 5000,
        porcentajeAbonado: 5,
      },
      {
        id: "r2",
        fecha: "2025-09-14",
        nombre: "Quinceaños Valeria",
        tipo: "Social",
        asistentes: 180,
        asistentesAlumnos: 0,
        ocupacion: 65,
        boletosApartados: 170,
        boletosApartadosDinero: 34000,
        boletosPagados: 85,
        boletosPagadosDinero: 17000,
        boletosPorPagar: 85,
        boletosPorPagarDinero: 17000,
        porcentajePagados: 50,
        abonoRealizado: 6800,
        porcentajeAbonado: 20,
      },
      {
        id: "r3",
        fecha: "2025-09-02",
        nombre: "Congreso Médicos",
        tipo: "Congreso",
        asistentes: 740,
        asistentesAlumnos: 200,
        ocupacion: 91,
        boletosApartados: 720,
        boletosApartadosDinero: 144000,
        boletosPagados: 680,
        boletosPagadosDinero: 136000,
        boletosPorPagar: 40,
        boletosPorPagarDinero: 8000,
        porcentajePagados: 94,
        abonoRealizado: 4320,
        porcentajeAbonado: 3,
      },
      {
        id: "r4",
        fecha: "2025-08-25",
        nombre: "Lanzamiento Startup X",
        tipo: "Corporativo",
        asistentes: 120,
        asistentesAlumnos: 0,
        ocupacion: 54,
        boletosApartados: 110,
        boletosApartadosDinero: 22000,
        boletosPagados: 33,
        boletosPagadosDinero: 6600,
        boletosPorPagar: 77,
        boletosPorPagarDinero: 15400,
        porcentajePagados: 30,
        abonoRealizado: 6600,
        porcentajeAbonado: 30,
      },
    ],
    topTiposEventos: [],
    timestamp: new Date().toISOString(),
    raw: null,
  };
}

const lugarDashboardService = {
  /**
   * Obtener resumen dashboard de un lugar
   * @param {string} lugarId
   * @param {object} opts { forceMock?: boolean }
   */
  async getResumen(lugarId, opts = {}) {
    const id = lugarId || "a77c16bc-2719-4d82-aa9c-10f46ce5e543"; // fallback temporal
    if (opts.forceMock) return fetchMock();
    try {
      return await fetchReal(id);
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[lugarDashboardService] fallo endpoint real, usando mock:",
          e.userMessage || e.message
        );
      }
      return fetchMock();
    }
  },
};

export default lugarDashboardService;
