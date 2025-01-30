
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface ProjectStore {
  project: any | null;
  setProject: (project: any) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  project: null,
  setProject: (project) => set({ project }),
}));
