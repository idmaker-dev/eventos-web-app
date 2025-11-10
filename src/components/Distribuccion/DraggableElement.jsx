import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export default function DraggableElement({ id, children, data, style = {}, zoom = 1 }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: id,
    data: data,
  });

  const draggableStyle = {
    ...style,
    transform: transform ? `translate3d(${transform.x / zoom}px, ${transform.y / zoom}px, 0)` : undefined,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : style.zIndex || 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={draggableStyle}
      {...listeners}
      {...attributes}
      className="transition-opacity duration-200"
    >
      {children}
    </div>
  );
}