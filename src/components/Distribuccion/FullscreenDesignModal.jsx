import React, { useRef } from "react";
import { Minus, Plus, RotateCcw, Save } from "lucide-react";
import { Button } from "@headlessui/react";

export default function FullscreenDesignModal({
  isOpen,
  onClose,
  allElements = [],
  invitadosSinAsignar = [],
  InvitadoDraggable,
  renderElementoEstatico,
  zoom = 1,
  offset = { x: 0, y: 0 },
  handleWheel = () => {},
  handleMouseDownCanvas = () => {},
  handleMouseMoveCanvas = () => {},
  handleMouseUpCanvas = () => {},
  CANVAS_WIDTH = 3000,
  CANVAS_HEIGHT = 1800,
  TotalPersonasSinAsignar = 0,
  zoomIn = () => {},
  zoomOut = () => {},
  fitToView = () => {},
  guardarDistribucion = () => {},
  guardando = false,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/60"
      role="dialog"
      aria-modal="true"
    >
      {/* Left panel: invitados */}
      <aside className="w-64 min-w-[18rem] bg-fondoVs dark:bg-slate-900 border-r h-full overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Invitados sin Asignar</h3>
          <div className="text-sm text-gray-500">({TotalPersonasSinAsignar})</div>
        </div>

        <div className="space-y-3">
          {invitadosSinAsignar.length === 0 ? (
            <div className="text-gray-500">No hay invitados sin asignar</div>
          ) : (
            invitadosSinAsignar.map((inv) => (
              <div key={inv.id} className="cursor-move">
                {InvitadoDraggable ? (
                  <InvitadoDraggable invitado={inv} />
                ) : (
                  <div
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData("text/plain", JSON.stringify(inv))
                    }
                    className="bg-white p-3 rounded-lg border hover:shadow"
                  >
                    <div className="font-medium">{inv.nombre}</div>
                    <div className="text-sm text-gray-500">({inv.cantidad})</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Right panel: canvas */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        {/* header sticky para que los botones siempre sean visibles */}
        <div className="sticky top-0 z-40 bg-fondoVs dark:bg-slate-800/95 border-b">
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 ml-2">
                <Button
                  onClick={zoomOut}
                  className="px-2 py-1 bg-white border rounded hover:bg-gray-100"
                  title="Zoom out"
                >
                  <Minus className="w-4 h-4" />
                </Button>

                <div className="px-3 py-1 bg-white border rounded text-sm">
                  {Math.round(zoom * 100)}%
                </div>

                <Button
                  onClick={zoomIn}
                  className="px-2 py-1 bg-white border rounded hover:bg-gray-100"
                  title="Zoom in"
                >
                  <Plus className="w-4 h-4" />
                </Button>

                <Button
                  onClick={fitToView}
                  className="ml-2 px-2 py-1 bg-white border rounded hover:bg-gray-100"
                  title="Ajustar vista"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={guardarDistribucion}
                disabled={guardando}
                className={`flex items-center shadow-sm gap-2 px-3 py-1 rounded ${
                  guardando
                    ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                    : "bg-lime-600 text-white hover:bg-lime-700"
                }`}
              >
                <Save className={`w-4 h-4 ${guardando ? "animate-pulse" : ""}`} />
                {guardando ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                onClick={onClose}
                className="px-3 py-1 rounded border shadow-md bg-white hover:bg-gray-700 hover:text-white"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>

        {/* canvas area ocupa todo el espacio restante */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto bg-gray-50 dark:bg-[#0f172a] p-4"
          // onWheel={handleWheel}
          onMouseDown={handleMouseDownCanvas}
          onMouseMove={handleMouseMoveCanvas}
          onMouseUp={handleMouseUpCanvas}
          onMouseLeave={handleMouseUpCanvas}
        >
          <div
            className="relative"
            style={{
              width: `${CANVAS_WIDTH}px`,
              height: `${CANVAS_HEIGHT}px`,
              minWidth: "100%", // permitir scroll horizontal si hace falta, pero evitar centrar que deja blanco
              minHeight: `${CANVAS_HEIGHT}px`,
            }}
          >
            <div
              ref={canvasRef}
              className="absolute left-0 top-0 origin-top-left"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
                width: `${CANVAS_WIDTH}px`,
                height: `${CANVAS_HEIGHT}px`,
              }}
            >
              {allElements.map((element) => (
                <div
                  key={element.id}
                  style={{
                    position: "absolute",
                    left: `${element.position?.x || 0}px`,
                    top: `${element.position?.y || 0}px`,
                    userSelect: "none",
                  }}
                >
                  {renderElementoEstatico ? renderElementoEstatico(element) : null}
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}