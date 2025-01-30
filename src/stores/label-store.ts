
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface LabelStore {
  labels: any[];
}

export const useLabelStore = create<LabelStore>(() => ({
  labels: [],
}));
