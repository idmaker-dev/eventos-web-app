import React, { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  CircleX,
  Calendar,
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Clock,
  User,
  Tag,
  Download,
  Copy,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";
import EnvConfig from "../../utils/config";
import asignacionService from "../../services/asignacionService";

export default function DetalleEvento({ open, onClose, evento }) {
  const [urlCopiada, setUrlCopiada] = useState(false);
  const [descargando, setDescargando] = useState(false);

  if (!evento) return null;

  // El objeto evento puede venir con la estructura { evento: {...}, ...otrosProps }
  // o directamente con todas las propiedades
  const eventoData = evento.evento || evento;

  // Debug: Ver qué datos estamos recibiendo
  console.log("🔍 DetalleEvento - evento completo:", evento);
  console.log("🔍 DetalleEvento - eventoData:", eventoData);

  // Validar que eventoData tenga las propiedades mínimas necesarias
  if (!eventoData || !eventoData.nombre_evento) {
    console.warn("DetalleEvento: datos de evento incompletos", evento);
    return null;
  }

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("es-MX", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const formatTime = (time) => {
    if (!time) return "-";
    try {
      const [hours, minutes] = time.split(":");
      return `${hours}:${minutes}`;
    } catch {
      return time;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "$0.00";
    if (typeof amount === "number") {
      return (
        "$" +
        amount.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }
    // Si viene como string, retornar tal cual (ya viene formateado)
    if (typeof amount === "string") {
      return amount.includes("$") ? amount : "$" + amount;
    }
    return "$0.00";
  };

  const formatPaymentDates = (fechas) => {
    if (!fechas || fechas.length === 0) return "No definidas";
    return fechas
      .map((f) => {
        try {
          const d = new Date(f);
          return d.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        } catch {
          return f;
        }
      })
      .join(", ");
  };

  const handleDescargarDistribucion = async () => {
    if (!eventoData?.id) {
      alert("No se puede descargar: ID de evento no disponible");
      return;
    }

    setDescargando(true);

    try {
      console.log(
        "📥 Descargando Excel de distribución para evento:",
        eventoData.id
      );

      // 🆕 Usar el mismo endpoint que el Monitor (descarga directa del backend)
      const blob = await asignacionService.descargarExcelSelecciones(eventoData.id);

      // Crear link de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const fechaActual = new Date().toISOString().split("T")[0];
      const nombreArchivo = `Distribucion_Mesas_${eventoData.nombre_evento || "Evento"}_${fechaActual}.xlsx`;
      
      link.setAttribute("download", nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      console.log("✅ Excel descargado exitosamente");
    } catch (error) {
      console.error("❌ Error al descargar Excel:", error);
      alert(
        `Error al descargar el Excel: ${error.message || "Error desconocido"}`
      );
    } finally {
      setDescargando(false);
    }
  };

  const handleCopiarURLLectorQR = async () => {
    try {
      // Construir la URL usando la configuración base
      const url = `${EnvConfig.BASE_URL}/lector-qr/${eventoData.id}`;

      // Copiar al portapapeles
      await navigator.clipboard.writeText(url);

      // Mostrar feedback visual
      setUrlCopiada(true);
      console.log("✅ URL copiada al portapapeles:", url);

      // Resetear el estado después de 2 segundos
      setTimeout(() => {
        setUrlCopiada(false);
      }, 2000);
    } catch (error) {
      console.error("❌ Error al copiar URL:", error);
      alert("No se pudo copiar la URL. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <Dialog
      open={open}
      as="div"
      className="relative z-50 focus:outline-none"
      onClose={onClose}
    >
      {/* Overlay con blur */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Container del modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className={clsx(
              "w-full max-w-4xl rounded-xl bg-white dark:bg-[#1a1a1a] shadow-2xl duration-300 ease-out",
              "max-h-[90vh] relative z-50 flex flex-col"
            )}
          >
            {/* Header - Fijo */}
            <div className="flex-shrink-0 bg-gradient-to-r from-[#246370] to-[#2a9d8f] px-6 py-4 rounded-t-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-bold text-white">
                    {eventoData.nombre_evento || "Sin nombre"}
                  </DialogTitle>
                  <p className="text-sm text-white/80 mt-1">
                    {eventoData.instituto || "Sin institución"}
                  </p>
                </div>
                <button
                  className="text-white/80 hover:text-white transition-colors"
                  onClick={onClose}
                  aria-label="Cerrar"
                >
                  <CircleX size={28} />
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div
              className={clsx(
                "flex-1 overflow-y-auto p-6 space-y-6",
                // Estilos personalizados de scrollbar
                "scrollbar-thin scrollbar-thumb-[#246370] scrollbar-track-gray-100",
                "dark:scrollbar-thumb-[#2a9d8f] dark:scrollbar-track-gray-800",
                "[&::-webkit-scrollbar]:w-2",
                "[&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-800",
                "[&::-webkit-scrollbar-thumb]:bg-[#246370] dark:[&::-webkit-scrollbar-thumb]:bg-[#2a9d8f]",
                "[&::-webkit-scrollbar-thumb]:rounded-full",
                "[&::-webkit-scrollbar-thumb]:hover:bg-[#1d4f5a] dark:[&::-webkit-scrollbar-thumb]:hover:bg-[#238276]"
              )}
            >
              {/* Información General */}
              <section>
                <h3 className="text-lg font-semibold text-[#246370] dark:text-[#2a9d8f] mb-4 flex items-center gap-2">
                  <Tag size={20} />
                  Información General
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard
                    icon={<Calendar className="w-5 h-5" />}
                    label="Fecha del evento"
                    value={formatDate(eventoData.fecha_evento)}
                  />
                  <InfoCard
                    icon={<Clock className="w-5 h-5" />}
                    label="Hora"
                    value={formatTime(eventoData.hora_evento)}
                  />
                  <InfoCard
                    icon={<Tag className="w-5 h-5" />}
                    label="Tipo de evento"
                    value={eventoData.tipo || "No especificado"}
                  />
                  <InfoCard
                    icon={<GraduationCap className="w-5 h-5" />}
                    label="Licenciatura"
                    value={eventoData.licenciatura || "No especificado"}
                  />
                  <InfoCard
                    icon={<User className="w-5 h-5" />}
                    label="Coordinador"
                    value={eventoData.coordinador_evento || "No especificado"}
                  />
                  <InfoCard
                    icon={<Users className="w-5 h-5" />}
                    label="Capacidad máxima"
                    value={
                      eventoData.asistentes_maximos?.toLocaleString() ||
                      "No especificado"
                    }
                  />
                </div>
              </section>

              {/* Estadísticas de Asistencia */}
              <section>
                <h3 className="text-lg font-semibold text-[#246370] dark:text-[#2a9d8f] mb-4 flex items-center gap-2">
                  <Users size={20} />
                  Asistencia
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard
                    label="Graduados"
                    value={
                      evento.asistentesAlumnos || evento.asistentes_alumnos || 0
                    }
                    color="blue"
                  />
                  {/* <StatCard
                    label="Con boletos"
                    value={evento.asistentes || evento.asistentes_boletos || evento.invitados || 0}
                    color="purple"
                  />
                  <StatCard
                    label="Ocupación"
                    value={(evento.ocupacion || 0) + '%'}
                    color="teal"
                  /> */}
                </div>
              </section>

              {/* Información Financiera */}
              <section>
                <h3 className="text-lg font-semibold text-[#246370] dark:text-[#2a9d8f] mb-4 flex items-center gap-2">
                  <DollarSign size={20} />
                  Información Financiera
                </h3>
                <div className="space-y-4">
                  {/* Costo por boleto */}
                  <div className="bg-gray-50 dark:bg-[#23272e] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Costo por boleto
                      </span>
                      <span className="text-xl font-bold text-[#246370] dark:text-[#2a9d8f]">
                        {formatCurrency(eventoData.costo)}
                      </span>
                    </div>
                  </div>

                  {/* Grid de métricas financieras */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FinancialCard
                      label="Boletos Apartados"
                      quantity={evento.boletosApartados}
                      amount={evento.boletosApartadosDinero}
                      color="gray"
                    />
                    <FinancialCard
                      label="Boletos Pagados"
                      quantity={evento.boletosPagados}
                      amount={evento.boletosPagadosDinero}
                      percentage={evento.porcentajePagados}
                      color="green"
                    />
                    <FinancialCard
                      label="Abono Realizado"
                      amount={evento.abonoRealizado}
                      percentage={evento.porcentajeAbonado}
                      color="blue"
                    />
                    <FinancialCard
                      label="Por Pagar"
                      quantity={evento.boletosPorPagar}
                      amount={evento.boletosPorPagarDinero}
                      color="amber"
                    />
                  </div>
                </div>
              </section>

              {/* Fechas de Pago */}
              <section>
                <h3 className="text-lg font-semibold text-[#246370] dark:text-[#2a9d8f] mb-4 flex items-center gap-2">
                  <Calendar size={20} />
                  Fechas de Pago
                </h3>
                <div className="bg-gray-50 dark:bg-[#23272e] rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {formatPaymentDates(eventoData.fechas)}
                  </p>
                </div>
              </section>

              {/* Indicadores de Progreso */}
              <section>
                <h3 className="text-lg font-semibold text-[#246370] dark:text-[#2a9d8f] mb-4 flex items-center gap-2">
                  <TrendingUp size={20} />
                  Progreso de Pago
                </h3>
                <div className="space-y-3">
                  <ProgressBar
                    label="Boletos pagados"
                    percentage={evento.porcentajePagados}
                    color="green"
                  />
                  <ProgressBar
                    label="Abono realizado"
                    percentage={evento.porcentajeAbonado}
                    color="blue"
                  />
                </div>
              </section>
            </div>

            {/* Footer - Fijo */}
            <div className="flex-shrink-0 bg-gray-50 dark:bg-[#23272e] px-6 py-4 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between gap-3">
                {/* Botones de acción a la izquierda */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDescargarDistribucion}
                    disabled={descargando}
                    className={clsx(
                      "px-4 py-2 rounded-lg font-semibold transition-colors shadow-md flex items-center gap-2",
                      descargando
                        ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                        : "bg-[#246370] hover:bg-[#1d4f5a] dark:bg-[#2a9d8f] dark:hover:bg-[#238276]",
                      "text-white"
                    )}
                    title={
                      descargando
                        ? "Generando reporte..."
                        : "Descargar distribución de mesas"
                    }
                  >
                    <Download
                      size={18}
                      className={descargando ? "animate-pulse" : ""}
                    />
                    <span className="hidden sm:inline">
                      {descargando ? "Descargando..." : "Distribución"}
                    </span>
                  </button>

                  <button
                    onClick={handleCopiarURLLectorQR}
                    className={clsx(
                      "px-4 py-2 rounded-lg font-semibold transition-all shadow-md flex items-center gap-2",
                      urlCopiada
                        ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                        : "bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600",
                      "text-white"
                    )}
                    title={
                      urlCopiada ? "URL copiada" : "Copiar URL del Lector QR"
                    }
                  >
                    {urlCopiada ? (
                      <>
                        <CheckCircle2 size={18} />
                        <span className="hidden sm:inline">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        <span className="hidden sm:inline">Copiar URL QR</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Botón cerrar a la derecha */}
                <button
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors shadow-md"
                  onClick={onClose}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

// Componentes auxiliares
function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-gray-50 dark:bg-[#23272e] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-3">
        <div className="text-[#246370] dark:text-[#2a9d8f] mt-1">{icon}</div>
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    teal: "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
  };

  return (
    <div className={`rounded-lg p-4 border ${colorClasses[color]}`}>
      <p className="text-xs font-medium opacity-80 uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function FinancialCard({ label, quantity, amount, percentage, color }) {
  const colorClasses = {
    gray: "border-gray-300 dark:border-gray-600",
    green: "border-green-300 dark:border-green-600",
    blue: "border-blue-300 dark:border-blue-600",
    amber: "border-amber-300 dark:border-amber-600",
  };

  const badgeColors = {
    green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  };

  const formatAmount = (amt) => {
    if (!amt && amt !== 0) return "$0.00";
    if (typeof amt === "number") {
      return (
        "$" +
        amt.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }
    // Si viene como string, retornar tal cual
    if (typeof amt === "string") {
      return amt.includes("$") ? amt : "$" + amt;
    }
    return "$0.00";
  };

  return (
    <div
      className={`bg-white dark:bg-[#1e1e1e] rounded-lg p-4 border-2 ${colorClasses[color]}`}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {label}
        </p>
        {percentage !== undefined && (
          <span
            className={`px-2 py-1 rounded-full text-xs font-bold ${
              badgeColors[color] || "bg-gray-100 text-gray-700"
            }`}
          >
            {percentage}%
          </span>
        )}
      </div>
      {quantity !== undefined && (
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
          {quantity} boletos
        </p>
      )}
      <p
        className={`text-xl font-bold ${
          color === "green"
            ? "text-green-600 dark:text-green-400"
            : color === "blue"
            ? "text-blue-600 dark:text-blue-400"
            : color === "amber"
            ? "text-amber-600 dark:text-amber-400"
            : "text-gray-700 dark:text-gray-200"
        }`}
      >
        {formatAmount(amount)}
      </p>
    </div>
  );
}

function ProgressBar({ label, percentage, color }) {
  const colorClasses = {
    green: "bg-green-500",
    blue: "bg-blue-500",
  };

  const numPercentage =
    typeof percentage === "string" ? parseFloat(percentage) : percentage;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-500 rounded-full`}
          style={{ width: `${Math.min(numPercentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
