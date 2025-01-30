
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface ListStore {
  lists: string[];
  reorderList: (startIndex: number, endIndex: number) => void;
}

export const useListStore = create<ListStore>((set) => ({
  lists: [],
  reorderList: (startIndex, endIndex) => set((state) => {
    const newLists = Array.from(state.lists);
    const [removed] = newLists.splice(startIndex, 1);
    newLists.splice(endIndex, 0, removed);
    return { lists: newLists };
  }),
}));
