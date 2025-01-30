import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CardModal } from "@/components/CardModal";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Card {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  position: number;
  list_id: string;
}

interface List {
  id: string;
  title: string;
  cards: Card[];
}

interface DraggableItemData {
  type: 'card';
  item: Card;
}

function DraggableCard({ card, onClick }: { card: Card; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      item: card,
    } as DraggableItemData,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded shadow-sm hover:shadow-md transition-shadow cursor-move mb-2"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      <h4>{card.title}</h4>
      {card.due_date && (
        <div className="text-sm text-gray-500 mt-1">
          Due: {new Date(card.due_date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

const ProjectBoard = () => {
  const { id: projectId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newListTitle, setNewListTitle] = useState("");
  const [newCardTitle, setNewCardTitle] = useState<Record<string, string>>({});
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  // Fetch project details
  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch lists and cards
  const { data: lists } = useQuery({
    queryKey: ["lists", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lists")
        .select(`
          *,
          cards (*)
        `)
        .eq("project_id", projectId)
        .order("position");

      if (error) throw error;
      return data as List[];
    },
  });

  // Update card position mutation
  const updateCardPositionMutation = useMutation({
    mutationFn: async ({ cardId, listId, position }: { cardId: string, listId: string, position: number }) => {
      // First, update positions of other cards in the target list
      const targetList = lists?.find(list => list.id === listId);
      if (targetList) {
        const cardsInTargetList = targetList.cards || [];
        const updates = cardsInTargetList
          .filter(c => c.id !== cardId && c.position >= position)
          .map(c => ({
            id: c.id,
            position: c.position + 1,
            list_id: c.list_id,
            title: c.title,
            description: c.description,
            due_date: c.due_date
          }));

        if (updates.length > 0) {
          await supabase.from("cards").upsert(updates);
        }
      }

      // Then update the dragged card
      const { data, error } = await supabase
        .from("cards")
        .update({ list_id: listId, position })
        .eq("id", cardId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      toast({
        title: "Success",
        description: "Card position updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update card position",
        variant: "destructive",
      });
      console.error("Error updating card position:", error);
    },
  });

  // Add new list mutation
  const addListMutation = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await supabase
        .from("lists")
        .insert([
          {
            project_id: projectId,
            title,
            position: lists?.length || 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      setNewListTitle("");
      toast({
        title: "Success",
        description: "List created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create list",
        variant: "destructive",
      });
      console.error("Error creating list:", error);
    },
  });

  // Add new card mutation
  const addCardMutation = useMutation({
    mutationFn: async ({ listId, title }: { listId: string; title: string }) => {
      const targetList = lists?.find(list => list.id === listId);
      const maxPosition = targetList?.cards?.length || 0;

      const { data, error } = await supabase
        .from("cards")
        .insert([
          {
            list_id: listId,
            title,
            position: maxPosition,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      setNewCardTitle({});
      toast({
        title: "Success",
        description: "Card created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create card",
        variant: "destructive",
      });
      console.error("Error creating card:", error);
    },
  });

  const handleAddList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    addListMutation.mutate(newListTitle);
  };

  const handleAddCard = async (listId: string) => {
    const title = newCardTitle[listId];
    if (!title?.trim()) return;
    addCardMutation.mutate({ listId, title });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeCard = lists?.flatMap(list => list.cards || []).find(card => card.id === active.id);
    setActiveCard(activeCard || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !lists) return;
    
    const activeData = active.data.current as DraggableItemData;
    if (!activeData || activeData.type !== 'card') return;

    const activeCard = activeData.item;
    const sourceList = lists.find(list => list.id === activeCard.list_id);
    if (!sourceList) return;

    let targetListId: string;
    let newPosition: number;

    // Check if we're dropping on a card or directly on a list
    const overData = over.data.current as DraggableItemData | undefined;
    
    if (overData?.type === 'card') {
      // Dropping on another card
      const overCard = overData.item;
      targetListId = overCard.list_id;
      const targetList = lists.find(list => list.id === targetListId);
      if (!targetList) return;

      if (targetListId === sourceList.id) {
        // Same list movement
        newPosition = overCard.position;
        if (activeCard.position < overCard.position) {
          newPosition -= 0.5;
        } else {
          newPosition += 0.5;
        }
      } else {
        // Different list movement
        newPosition = overCard.position - 0.5;
      }
    } else {
      // Dropping directly on a list
      targetListId = over.id.toString();
      const targetList = lists.find(list => list.id === targetListId);
      if (!targetList) return;
      
      if (targetListId === sourceList.id) {
        // Same list, append to end
        const maxPosition = Math.max(...(targetList.cards || []).map(c => c.position), -1);
        newPosition = maxPosition + 1;
      } else {
        // Different list, append to end
        newPosition = (targetList.cards || []).length;
      }
    }

    // Round the position to ensure we have whole numbers
    newPosition = Math.round(newPosition);

    updateCardPositionMutation.mutate({
      cardId: activeCard.id,
      listId: targetListId,
      position: newPosition,
    });
    
    setActiveCard(null);
  };

  if (!project) return null;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{project.title}</h1>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {lists?.map((list) => (
            <div
              key={list.id}
              id={list.id}
              className="flex-none w-80 bg-gray-100 rounded-lg p-4"
              data-type="list"
            >
              <h3 className="font-semibold mb-4">{list.title}</h3>
              
              <SortableContext
                items={list.cards || []}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {list.cards?.map((card) => (
                    <DraggableCard
                      key={card.id}
                      card={card}
                      onClick={() => setSelectedCard(card)}
                    />
                  ))}
                </div>
              </SortableContext>

              <div className="mt-4">
                <Input
                  placeholder="Add a card..."
                  value={newCardTitle[list.id] || ""}
                  onChange={(e) =>
                    setNewCardTitle((prev) => ({
                      ...prev,
                      [list.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddCard(list.id);
                    }
                  }}
                />
                <Button
                  className="w-full mt-2"
                  variant="ghost"
                  onClick={() => handleAddCard(list.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Card
                </Button>
              </div>
            </div>
          ))}

          <div className="flex-none w-80">
            <form onSubmit={handleAddList} className="space-y-2">
              <Input
                placeholder="Add a list..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
              />
              <Button className="w-full" type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Add List
              </Button>
            </form>
          </div>
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="bg-white p-3 rounded shadow-lg">
              <h4>{activeCard.title}</h4>
              {activeCard.due_date && (
                <div className="text-sm text-gray-500 mt-1">
                  Due: {new Date(activeCard.due_date).toLocaleDateString()}
                </div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CardModal
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
};

export default ProjectBoard;
