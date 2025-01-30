
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProjectDescriptionProps {
  initialDescription: string;
  projectId: string;
  onGenerateTasks: () => Promise<void>;
  isGenerating: boolean;
}

export function ProjectDescription({
  initialDescription,
  projectId,
  onGenerateTasks,
  isGenerating,
}: ProjectDescriptionProps) {
  const [description, setDescription] = useState(initialDescription);
  const { toast } = useToast();

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

  return (
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
          onClick={onGenerateTasks} 
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
  );
}
