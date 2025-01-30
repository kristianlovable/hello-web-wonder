
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CardModal } from "@/components/CardModal";

const ProjectBoard = () => {
  const { id: projectId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newListTitle, setNewListTitle] = useState("");
  const [newCardTitle, setNewCardTitle] = useState<Record<string, string>>({});
  const [selectedCard, setSelectedCard] = useState<any>(null);

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
      return data;
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
      const { data, error } = await supabase
        .from("cards")
        .insert([
          {
            list_id: listId,
            title,
            position: 0,
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

  if (!project) return null;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{project.title}</h1>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {lists?.map((list) => (
          <div
            key={list.id}
            className="flex-none w-80 bg-gray-100 rounded-lg p-4"
          >
            <h3 className="font-semibold mb-4">{list.title}</h3>
            
            <div className="space-y-2">
              {list.cards?.map((card) => (
                <div
                  key={card.id}
                  className="bg-white p-3 rounded shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCard(card)}
                >
                  <h4>{card.title}</h4>
                  {card.due_date && (
                    <div className="text-sm text-gray-500 mt-1">
                      Due: {new Date(card.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>

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

      <CardModal
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
};

export default ProjectBoard;
