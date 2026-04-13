import React, { useMemo, useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./RichTextEditor.css";
import { Button } from "@headlessui/react";
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

  // Variables predeterminadas si no se proporcionan
  const defaultVariables = [
    { name: "nombre", label: "Nombre", description: "Nombre del graduado" },
    { name: "nombre_completo", label: "Nombre Completo", description: "Nombre completo del graduado" },
    { name: "apellido_paterno", label: "Apellido Paterno", description: "Apellido paterno" },
    { name: "apellido_materno", label: "Apellido Materno", description: "Apellido materno" },
    { name: "correo", label: "Email", description: "Correo electrónico" },
    { name: "telefono", label: "Teléfono", description: "Número de teléfono" },
    { name: "numero", label: "Número", description: "Número de teléfono alternativo" },
    { name: "instituto", label: "Instituto", description: "Nombre del instituto" },
    { name: "licenciatura", label: "Licenciatura", description: "Programa académico" },
    { name: "cantidad_boletos", label: "Cantidad Boletos", description: "Número de boletos" },
    { name: "monto_total", label: "Monto Total", description: "Monto total de deuda" },
    { name: "monto_pendiente", label: "Monto Pendiente", description: "Monto pendiente de pago" },
    { name: "fecha_vencimiento_proxima", label: "Fecha Vencimiento", description: "Próxima fecha de vencimiento" },
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
      {/* Barra de variables */}
      <div className="mb-3 p-3 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            📋 Variables disponibles:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {variablesDisponibles.map((variable) => (
            <Button
              key={variable.name}
              onClick={() => insertarVariable(variable.name)}
              className="px-3 py-1 text-xs font-medium bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-600 rounded-md hover:bg-casal hover:text-white hover:border-casal transition-colors"
              title={variable.description || `Insertar {{${variable.name}}}`}
            >
              {"{"}
              {"{"}
              {variable.label || variable.name}
              {"}"}
              {"}"}
            </Button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          💡 Haz clic en una variable para insertarla en el texto
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
