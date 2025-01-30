
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useListStore } from "@/stores/list-store";
import { useCardStore } from "@/stores/card-store";
import { ProjectDescription } from "@/components/ProjectDescription";
import { BoardSection } from "@/components/ProjectBoard/BoardSection";

export default function ProjectBoard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { reorderList } = useListStore();
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
        
        if (!project) {
          toast({
            title: "Project not found",
            description: "The requested project could not be found.",
            variant: "destructive",
          });
          navigate('/projects');
          return;
        }

        if (project.description) {
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
    const { destination, source, type } = result;

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
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full p-4 space-y-4">
      <ProjectDescription
        initialDescription={description}
        projectId={projectId || ""}
        onGenerateTasks={generateTasks}
        isGenerating={isGenerating}
      />
      <BoardSection onDragEnd={onDragEnd} />
    </div>
  );
}
