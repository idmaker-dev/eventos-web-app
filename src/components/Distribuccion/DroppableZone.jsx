import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export default function DroppableZone({ id, children, className }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  const style = {
    backgroundColor: isOver ? 'rgba(59, 130, 246, 0.1)' : undefined,
    border: isOver ? '2px dashed #3b82f6' : undefined,
    borderRadius: isOver ? '8px' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${className} transition-all duration-200 min-h-[50px]`}
    >
      {children}
    </div>
  );
}