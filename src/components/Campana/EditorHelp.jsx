import React, { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { Button } from "@headlessui/react";

/**
 * Componente de ayuda flotante para el editor de texto enriquecido
 */
export default function EditorHelp() {
  const [mostrar, setMostrar] = useState(false);

  if (!mostrar) {
    return (
      <Button
        onClick={() => setMostrar(true)}
        className="fixed bottom-6 right-6 bg-casal hover:bg-casal/90 text-white p-3 rounded-full shadow-lg transition-all z-50"
        title="Ayuda del editor"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-casal text-white p-4 flex justify-between items-center">
        <h3 className="font-bold text-lg">📝 Ayuda del Editor</h3>
        <Button
          onClick={() => setMostrar(false)}
          className="hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto text-sm">
        <section className="mb-4">
          <h4 className="font-semibold text-casal mb-2">🎨 Formato de Texto</h4>
          <ul className="space-y-1 text-gray-700 dark:text-gray-300">
            <li>• <strong>Negrita</strong>: Resalta texto importante</li>
            <li>• <em>Cursiva</em>: Énfasis en palabras clave</li>
            <li>• <u>Subrayado</u>: Destacar información</li>
            <li>• <span className="line-through">Tachado</span>: Marcar texto obsoleto</li>
          </ul>
        </section>

        <section className="mb-4">
          <h4 className="font-semibold text-casal mb-2">📋 Variables Dinámicas</h4>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Haz clic en los botones de variables para insertarlas en tu mensaje:
          </p>
          <div className="bg-gray-50 dark:bg-[#2a2a2a] p-3 rounded-lg">
            <code className="text-xs text-blue-600 dark:text-blue-400">
              Hola <strong className="text-casal">{'{{nombre_completo}}'}</strong>, tu pago de{' '}
              <strong className="text-casal">{'{{monto_total}}'}</strong> ha sido procesado.
            </code>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Las variables se reemplazarán automáticamente con los datos reales del destinatario.
          </p>
        </section>

        <section className="mb-4">
          <h4 className="font-semibold text-casal mb-2">📱 WhatsApp vs Email</h4>
          <div className="space-y-2">
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
              <p className="text-xs font-semibold text-green-800 dark:text-green-300">
                WhatsApp:
              </p>
              <p className="text-xs text-green-700 dark:text-green-400">
                El formato HTML se convierte automáticamente a texto con símbolos (*negrita*, _cursiva_)
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                Email:
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Se mantiene el formato HTML completo con colores y estilos
              </p>
            </div>
          </div>
        </section>

        <section className="mb-4">
          <h4 className="font-semibold text-casal mb-2">✨ Consejos</h4>
          <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <li>✓ Usa encabezados para organizar secciones largas</li>
            <li>✓ Las listas mejoran la legibilidad</li>
            <li>✓ Prueba tu mensaje antes de activar la campaña</li>
            <li>✓ Las variables aparecen en azul y negrita para fácil identificación</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-casal mb-2">🔧 Variables Disponibles</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            El sistema tiene más de 60 variables organizadas en categorías:
          </p>
          <div className="space-y-2 text-xs">
            <div>
              <span className="font-semibold text-blue-600 dark:text-blue-400">📅 Evento:</span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">
                nombre, fecha, hora, lugar, dirección, costo, institución
              </span>
            </div>
            <div>
              <span className="font-semibold text-green-600 dark:text-green-400">👤 Invitado:</span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">
                nombre, apellidos, email, teléfono, edad, licenciatura, escuela
              </span>
            </div>
            <div>
              <span className="font-semibold text-purple-600 dark:text-purple-400">👨‍👩‍👧 Tutor:</span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">
                nombre completo, teléfono, relación
              </span>
            </div>
            <div>
              <span className="font-semibold text-yellow-600 dark:text-yellow-400">💰 Pagos:</span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">
                monto total, pendiente, estado, vencimientos, número de facturas
              </span>
            </div>
            <div>
              <span className="font-semibold text-red-600 dark:text-red-400">📅 Sistema:</span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">
                fecha actual, día, mes, año, fecha de firma
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            ℹ️ Usa los botones arriba del editor para insertar cualquier variable
          </p>
        </section>
      </div>
    </div>
  );
}
