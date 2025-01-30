
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface CardStore {
  reorderCard: (listId: string, startIndex: number, endIndex: number) => void;
  moveCard: (sourceListId: string, targetListId: string, sourceIndex: number, targetIndex: number) => void;
}

export const useCardStore = create<CardStore>((set) => ({
  reorderCard: (listId, startIndex, endIndex) => {
    // Implementation will be added later when we handle card operations
  },
  moveCard: (sourceListId, targetListId, sourceIndex, targetIndex) => {
    // Implementation will be added later when we handle card operations
  },
}));
