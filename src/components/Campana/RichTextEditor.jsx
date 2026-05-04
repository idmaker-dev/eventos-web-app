import React, { useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./RichTextEditor.css";
import { Button } from "@headlessui/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";

/**
 * Editor de texto enriquecido con soporte para variables dinámicas
 * @param {string} value - Contenido HTML del editor
 * @param {function} onChange - Callback al cambiar contenido
 * @param {string} placeholder - Texto de placeholder
 * @param {Array} variables - Lista de variables disponibles para insertar
 */
export default function RichTextEditor({ value, onChange, placeholder, variables = [] }) {
  const quillRef = useRef(null);
  
  // Estado para controlar categorías expandidas/colapsadas
  const [categoriasExpandidas, setCategoriasExpandidas] = useState({});
  
  // Toggle de expansión de categorías
  const toggleCategoria = (categoria) => {
    setCategoriasExpandidas(prev => ({
      ...prev,
      [categoria]: !prev[categoria]
    }));
  };

  // Variables predeterminadas organizadas por categorías
  const defaultVariables = [
    // ========== DATOS DEL EVENTO ==========
    { name: "evento.nombre", label: "📅 Nombre del Evento", description: "Nombre completo del evento", categoria: "Evento" },
    { name: "evento.fecha", label: "📅 Fecha del Evento", description: "Fecha en formato DD/MM/YYYY", categoria: "Evento" },
    { name: "evento.hora", label: "🕐 Hora del Evento", description: "Hora del evento (ej: 20:00 hrs)", categoria: "Evento" },
    { name: "evento.lugar", label: "📍 Lugar", description: "Nombre del lugar del evento", categoria: "Evento" },
    { name: "evento.direccion", label: "🗺️ Dirección", description: "Dirección completa del evento", categoria: "Evento" },
    { name: "evento.costo", label: "💵 Costo ($)", description: "Precio por boleto con símbolo", categoria: "Evento" },
    { name: "evento.costo_numerico", label: "💰 Costo Numérico", description: "Precio sin símbolo $", categoria: "Evento" },
    { name: "evento.institucion", label: "🏫 Institución", description: "Institución organizadora", categoria: "Evento" },
    
    // ========== DATOS DEL INVITADO ==========
    { name: "invitado.nombre_completo", label: "👤 Nombre Completo", description: "Nombre y apellidos completos", categoria: "Invitado" },
    { name: "invitado.nombre", label: "👤 Nombre(s)", description: "Nombre del invitado", categoria: "Invitado" },
    { name: "nombre", label: "👤 Nombre", description: "Nombre (alias corto)", categoria: "Invitado" },
    { name: "invitado.apellido_paterno", label: "👤 Apellido Paterno", description: "Primer apellido", categoria: "Invitado" },
    { name: "apellido_paterno", label: "👤 Ap. Paterno", description: "Apellido paterno (alias corto)", categoria: "Invitado" },
    { name: "invitado.apellido_materno", label: "👤 Apellido Materno", description: "Segundo apellido", categoria: "Invitado" },
    { name: "apellido_materno", label: "👤 Ap. Materno", description: "Apellido materno (alias corto)", categoria: "Invitado" },
    { name: "invitado.correo", label: "📧 Email", description: "Correo electrónico", categoria: "Invitado" },
    { name: "correo", label: "📧 Correo", description: "Email (alias corto)", categoria: "Invitado" },
    { name: "invitado.telefono", label: "📱 Teléfono", description: "Número de teléfono", categoria: "Invitado" },
    { name: "telefono", label: "📱 Tel", description: "Teléfono (alias corto)", categoria: "Invitado" },
    { name: "numero", label: "📱 Número", description: "Teléfono alternativo", categoria: "Invitado" },
    { name: "invitado.fecha_nacimiento", label: "🎂 Fecha Nacimiento", description: "Fecha de nacimiento", categoria: "Invitado" },
    { name: "invitado.edad", label: "🎂 Edad", description: "Edad del invitado", categoria: "Invitado" },
    { name: "invitado.es_mayor_edad", label: "🆔 Mayor de Edad", description: "Sí/No", categoria: "Invitado" },
    { name: "invitado.licenciatura", label: "🎓 Licenciatura", description: "Carrera o programa", categoria: "Invitado" },
    { name: "licenciatura", label: "🎓 Carrera", description: "Licenciatura (alias corto)", categoria: "Invitado" },
    { name: "invitado.escuela", label: "🏫 Escuela", description: "Escuela de procedencia", categoria: "Invitado" },
    { name: "instituto", label: "🏫 Instituto", description: "Instituto (alias corto)", categoria: "Invitado" },
    { name: "invitado.cantidad_boletos", label: "🎟️ Cantidad Boletos", description: "Número de boletos", categoria: "Invitado" },
    { name: "cantidad_boletos", label: "🎟️ Boletos", description: "Cantidad (alias corto)", categoria: "Invitado" },
    
    // ========== TUTOR / CONTACTO EMERGENCIA ==========
    { name: "tutor.nombre_completo", label: "👨‍👩‍👧 Nombre Tutor", description: "Nombre completo del tutor", categoria: "Tutor" },
    { name: "tutor.telefono", label: "📱 Teléfono Tutor", description: "Teléfono del tutor", categoria: "Tutor" },
    { name: "tutor.relacion", label: "👪 Relación", description: "Relación con el invitado (ej: Madre)", categoria: "Tutor" },
    
    // ========== MONTOS Y PAGOS ==========
    { name: "monto_total", label: "💵 Monto Total ($)", description: "Monto total con símbolo", categoria: "Pagos" },
    { name: "monto_total_numerico", label: "💰 Monto Total", description: "Monto sin símbolo $", categoria: "Pagos" },
    { name: "monto_pendiente", label: "⏳ Monto Pendiente", description: "Saldo por pagar", categoria: "Pagos" },
    { name: "deuda.monto_total", label: "💵 Deuda Total ($)", description: "Total de la deuda", categoria: "Pagos" },
    { name: "deuda.monto_pendiente", label: "⏳ Deuda Pendiente", description: "Saldo de deuda", categoria: "Pagos" },
    { name: "deuda.estado", label: "📊 Estado Deuda", description: "Estado (Pendiente/Pagado/Vencido)", categoria: "Pagos" },
    { name: "deuda.fecha_vencimiento_proxima", label: "📅 Próximo Vencimiento", description: "Fecha del próximo pago", categoria: "Pagos" },
    { name: "pago.numero_facturas", label: "📄 Número de Facturas", description: "Cantidad de pagos programados", categoria: "Pagos" },
    { name: "pago.fecha_primer_vencimiento", label: "📅 Primer Vencimiento", description: "Fecha del primer pago", categoria: "Pagos" },
    { name: "pago.monto_primera_factura", label: "💵 Primer Pago", description: "Monto del primer pago", categoria: "Pagos" },
    
    // ========== FECHAS DEL SISTEMA ==========
    { name: "fecha_actual", label: "📅 Fecha Actual", description: "Fecha de hoy (DD/MM/YYYY)", categoria: "Sistema" },
    { name: "dia_actual", label: "📅 Día Actual", description: "Día del mes (1-31)", categoria: "Sistema" },
    { name: "mes_actual", label: "📅 Mes Actual", description: "Número de mes (1-12)", categoria: "Sistema" },
    { name: "anio_actual", label: "📅 Año Actual", description: "Año (ej: 2026)", categoria: "Sistema" },
    { name: "mes_actual_texto", label: "📅 Mes en Texto", description: "Nombre del mes (ej: Abril)", categoria: "Sistema" },
    { name: "fecha_firma", label: "✍️ Fecha de Firma", description: "Fecha de firma del contrato", categoria: "Sistema" },
    { name: "hora_firma", label: "🕐 Hora de Firma", description: "Hora de firma del contrato", categoria: "Sistema" },
  ];

  const variablesDisponibles = variables.length > 0 ? variables : defaultVariables;

  // Configuración de módulos de Quill
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "align",
    "link",
  ];

  // Insertar variable en la posición del cursor
  const insertarVariable = (nombreVariable) => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection();
      const position = range ? range.index : editor.getLength();
      
      // Insertar la variable con formato especial
      const variableText = `{{${nombreVariable}}}`;
      editor.insertText(position, variableText, {
        color: "#2563eb", // Azul para destacar
        bold: true,
      });
      
      // Mover cursor después de la variable
      editor.setSelection(position + variableText.length);
    }
  };

  return (
    <div className="rich-text-editor-container">
      {/* Barra de variables organizadas por categorías */}
      <div className="mb-3 p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            📋 Variables disponibles - Haz clic para insertar:
          </span>
        </div>
        
        {/* Agrupar variables por categoría */}
        {(() => {
          const categorias = {};
          variablesDisponibles.forEach(variable => {
            const cat = variable.categoria || "Otras";
            if (!categorias[cat]) categorias[cat] = [];
            categorias[cat].push(variable);
          });

          return Object.entries(categorias).map(([categoria, vars]) => {
            const estaExpandida = categoriasExpandidas[categoria] !== false; // Por defecto expandida
            
            return (
              <div key={categoria} className="mb-3">
                {/* Encabezado de categoría con botón de colapsar/expandir */}
                <button
                  onClick={() => toggleCategoria(categoria)}
                  className="w-full flex items-center justify-between text-xs font-bold text-casal mb-2 uppercase tracking-wide hover:text-casal-dark transition-colors cursor-pointer group"
                >
                  <span>{categoria}</span>
                  <span className="transition-transform group-hover:scale-110">
                    {estaExpandida ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </button>
                
                {/* Variables de la categoría (colapsables) */}
                {estaExpandida && (
                  <div className="flex flex-wrap gap-2">
                    {vars.map((variable) => (
                      <Button
                        key={variable.name}
                        onClick={() => insertarVariable(variable.name)}
                        className="px-2 py-1 text-xs font-medium bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-600 rounded-md hover:bg-casal hover:text-white hover:border-casal transition-colors"
                        title={variable.description || `Insertar {{${variable.name}}}`}
                      >
                        {variable.label || variable.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          });
        })()}

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          💡 <strong>Tip:</strong> Las variables se reemplazarán automáticamente con datos reales al enviar el mensaje
        </p>
      </div>

      {/* Editor Quill */}
      <div className="quill-wrapper">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder || "Escribe tu mensaje aquí..."}
          className="bg-white dark:bg-[#2a2a2a] rounded-lg"
        />
      </div>
    </div>
  );
}
