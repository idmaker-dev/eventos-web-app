
import React, { useRef, useState } from "react";
import { QrCode } from "lucide-react";

function MovibleQR({ onChange, initialPos = { x: 100, y: 100 }, initialSize = 120 }) {
  const boxRef = useRef();
  const [pos, setPos] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Notifica cambios al padre
  React.useEffect(() => {
    if (onChange) onChange({ pos, size });
  }, [pos, size, onChange]);

  const handleMouseDown = (e) => {
    setDragging(true);
    setOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    });
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setPos({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    }
  };

  const handleMouseUp = () => setDragging(false);

  // Para mobile/touch
  const handleTouchStart = (e) => {
    setDragging(true);
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - pos.x,
      y: touch.clientY - pos.y,
    });
  };
  const handleTouchMove = (e) => {
    if (dragging) {
      const touch = e.touches[0];
      setPos({
        x: touch.clientX - offset.x,
        y: touch.clientY - offset.y,
      });
    }
  };
  const handleTouchEnd = () => setDragging(false);

  React.useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragging]);

  // Botones para cambiar tamaño
  const handleSizeChange = (delta) => {
    setSize((prev) => Math.max(60, Math.min(200, prev + delta)));
  };

  return (
    <div
      ref={boxRef}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: size,
        height: size,
        border: "3px dashed #0a9d8c",
        borderRadius: "1rem",
        background: "rgba(255,255,255,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "grab",
        zIndex: 10,
        transition: dragging ? "none" : "box-shadow 0.2s",
        boxShadow: dragging ? "0 0 0 2px #0a9d8c" : "0 2px 8px rgba(0,0,0,0.08)",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <QrCode className="w-12 h-12 text-casal" />
      {/* Controles de tamaño */}
      <div style={{
        position: "absolute",
        bottom: -36,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 8,
      }}>
        <button
          onClick={() => handleSizeChange(-20)}
          className="bg-casal text-white rounded-full px-2 py-1 text-xs shadow"
          type="button"
        >-</button>
        <button
          onClick={() => handleSizeChange(20)}
          className="bg-casal text-white rounded-full px-2 py-1 text-xs shadow"
          type="button"
        >+</button>
      </div>
    </div>
  );
}

export default MovibleQR;