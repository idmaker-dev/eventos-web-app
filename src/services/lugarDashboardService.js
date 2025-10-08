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
      ocupacionPromedio: parsePercent(estad.ocupacion_promedio),
      ingresosEstimados: parseMoney(estad.ingresos_estimados),
    },
    proximosEventos: proximos.map((e, idx) => ({
      id: e.id || `prox-${idx}`,
      fecha: e.fecha,
      nombre: decodeMaybe(e.nombre),
      tipo: decodeMaybe(e.tipo),
      invitados: e.asistentes ?? 0,
    })),
    eventosRecientes: recientes.map((e, idx) => ({
      id: e.id || `rec-${idx}`,
      fecha: e.fecha,
      nombre: decodeMaybe(e.nombre),
      tipo: decodeMaybe(e.tipo),
      asistentes: e.asistentes ?? 0,
      ocupacion: parsePercent(e.ocupacion),
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
    },
    proximosEventos: [
      {
        id: "p1",
        fecha: "2025-10-20",
        nombre: "Boda Ramírez-Gómez",
        tipo: "Boda",
        invitados: 230,
      },
      {
        id: "p2",
        fecha: "2025-11-05",
        nombre: "Graduación Ingeniería",
        tipo: "Graduación",
        invitados: 480,
      },
      {
        id: "p3",
        fecha: "2025-11-18",
        nombre: "Cena Corporativa ACME",
        tipo: "Corporativo",
        invitados: 150,
      },
    ],
    eventosRecientes: [
      {
        id: "r1",
        fecha: "2025-09-27",
        nombre: "Expo Proveedores",
        tipo: "Feria",
        asistentes: 520,
        ocupacion: 82,
      },
      {
        id: "r2",
        fecha: "2025-09-14",
        nombre: "Quinceaños Valeria",
        tipo: "Social",
        asistentes: 180,
        ocupacion: 65,
      },
      {
        id: "r3",
        fecha: "2025-09-02",
        nombre: "Congreso Médicos",
        tipo: "Congreso",
        asistentes: 740,
        ocupacion: 91,
      },
      {
        id: "r4",
        fecha: "2025-08-25",
        nombre: "Lanzamiento Startup X",
        tipo: "Corporativo",
        asistentes: 120,
        ocupacion: 54,
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
