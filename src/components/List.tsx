
import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface ListProps {
  id: string;
  index: number;
}

export const List: React.FC<ListProps> = ({ id, index }) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-background w-80 rounded-lg p-4"
        >
          <Droppable droppableId={id} type="card">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-2"
              >
                {/* Card components will be added here */}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
};
