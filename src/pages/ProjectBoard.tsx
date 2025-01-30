import { useEffect, useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { List } from "@/components/List";
import { useProjectStore } from "@/stores/project-store";
import { useListStore } from "@/stores/list-store";
import { useCardStore } from "@/stores/card-store";
import { useLabelStore } from "@/stores/label-store";
import { ListCreator } from "@/components/ListCreator";

export default function ProjectBoard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { lists, reorderList } = useListStore();
  const { reorderCard, moveCard } = useCardStore();
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) {
        navigate('/projects');
        return;
      }

      try {
        setIsLoading(true);
        const { data: project, error } = await supabase
          .from('projects')
          .select('description')
          .eq('id', projectId)
          .single();

        if (error) throw error;

        if (project?.description) {
          setDescription(project.description);
        }
      } catch (error: any) {
        toast({
          title: "Error loading project",
          description: error.message,
          variant: "destructive",
        });
        navigate('/projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, navigate, toast]);

  const handleDescriptionSave = async () => {
    if (!projectId) return;

    const { error } = await supabase
      .from('projects')
      .update({ description })
      .eq('id', projectId);

    if (error) {
      toast({
        title: "Error saving description",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Description saved",
        description: "Project description has been updated.",
      });
    }
  };

  const generateTasks = async () => {
    if (!projectId) return;
    
    if (!description) {
      toast({
        title: "Description required",
        description: "Please add a project description first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/functions/v1/generate-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          projectId,
          description,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate tasks');

      const { tasks } = await response.json();
      toast({
        title: "Tasks generated",
        description: `Successfully created ${tasks.length} new tasks.`,
      });
      
      // Refresh the board to show new tasks
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error generating tasks",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "list") {
      reorderList(source.index, destination.index);
      return;
    }

    if (type === "card") {
      if (destination.droppableId === source.droppableId) {
        reorderCard(source.droppableId, source.index, destination.index);
      } else {
        moveCard(
          source.droppableId,
          destination.droppableId,
          source.index,
          destination.index
        );
      }
      return;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full p-4 space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Describe your project to generate tasks..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex space-x-2">
          <Button onClick={handleDescriptionSave}>
            Save Description
          </Button>
          <Button 
            onClick={generateTasks} 
            disabled={isGenerating}
            variant="secondary"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Tasks...
              </>
            ) : (
              'Generate Tasks'
            )}
          </Button>
        </div>
      </div>

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
    </div>
  );
}
