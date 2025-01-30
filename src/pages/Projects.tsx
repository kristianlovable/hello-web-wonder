
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Projects = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
  });

  const { data: projects, isLoading: isLoadingProjects, error: projectsError } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        throw new Error("No session");
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq('owner_id', session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: typeof newProject) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const { data, error } = await supabase
        .from("projects")
        .insert([{
          ...projectData,
          owner_id: session.user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsDialogOpen(false);
      setNewProject({ title: "", description: "" });
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
      console.error("Error creating project:", error);
    },
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;
    createProjectMutation.mutate(newProject);
  };

  const handleProjectClick = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Prevent navigation if we're still loading or have an error
    if (isLoadingProjects || projectsError) return;
    navigate(`/projects/${projectId}`);
  };

  if (isLoadingProjects) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (projectsError) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-red-500">Error loading projects. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Project title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Project description"
                />
              </div>
              <Button type="submit" className="w-full">
                Create Project
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project) => (
          <Card
            key={project.id}
            onClick={(e) => handleProjectClick(e, project.id)}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          >
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {project.description || "No description"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Projects;
