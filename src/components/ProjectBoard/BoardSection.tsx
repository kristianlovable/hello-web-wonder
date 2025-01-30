
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { List } from "@/components/List";
import { ListCreator } from "@/components/ListCreator";
import { useListStore } from "@/stores/list-store";
import { useCardStore } from "@/stores/card-store";

interface BoardSectionProps {
  onDragEnd: (result: any) => void;
}

export function BoardSection({ onDragEnd }: BoardSectionProps) {
  const { lists } = useListStore();

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-lists" direction="horizontal" type="list">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex gap-3"
          >
            {lists.map((listId, index) => (
              <List key={listId} id={listId} index={index} />
            ))}
            {provided.placeholder}
            <ListCreator />
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
