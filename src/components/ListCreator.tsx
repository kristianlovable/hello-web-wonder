
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const ListCreator: React.FC = () => {
  return (
    <Button
      variant="outline"
      className="h-fit w-80 justify-start px-4 py-8"
      onClick={() => {
        // List creation logic will be added later
      }}
    >
      <Plus className="mr-2 h-4 w-4" />
      Add List
    </Button>
  );
};
