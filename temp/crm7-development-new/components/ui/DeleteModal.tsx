import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteModalProps {
  show: boolean;
  onDeleteClick: () => void;
  onCloseClick: () => void;
  itemName?: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ 
  show, 
  onDeleteClick, 
  onCloseClick, 
  itemName 
}) => {
  // Determine the display text based on whether itemName is provided
  let displayText = 'this item';
  if (itemName !== undefined && itemName !== null) {
    const trimmedName = itemName.trim();
    if (trimmedName !== '') {
      displayText = `"${trimmedName}"`;
    }
  }

  return (
    <Dialog open={show} onOpenChange={onCloseClick}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <div className="mt-4 text-center">
          {/* Using Lucide Trash2 icon for deletion */}
          <Trash2 className="mx-auto h-12 w-12 text-destructive" />
          <div className="mt-4 pt-2 text-sm text-muted-foreground">
            <h4>Are you sure?</h4>
            <p className="mt-2 mb-0">
              Are you sure you want to remove {displayText}?
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-4 mb-2">
          <Button variant="outline" onClick={onCloseClick}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDeleteClick}>
            Yes, Delete It!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;
