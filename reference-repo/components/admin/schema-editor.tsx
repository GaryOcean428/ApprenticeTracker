'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Schema } from '@/lib/types/schema';
import { validateSchema } from '@/lib/utils/schemaValidator';

interface SchemaEditorProps {
  initialSchema: Schema;
  onSave: (schema: Schema) => Promise<void>;
}

export function SchemaEditor({ initialSchema, onSave }: SchemaEditorProps): React.ReactElement {
  const [editedSchema, setEditedSchema] = useState<Schema>(initialSchema);

  const handleSave = async (): Promise<void> => {
    const validationResult = validateSchema(editedSchema);
    if (!validationResult.isValid) {
      // Here you could show the errors
      console.error('Schema validation failed', validationResult.errors);
      return;
    }
    try {
      await onSave(editedSchema);
    } catch (error) {
      console.error('Failed to save schema:', error);
    }
  };

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Schema</DialogTitle>
        </DialogHeader>
        {/* Render your schema editor form here */}
        <Button onClick={handleSave}>Save Schema</Button>
      </DialogContent>
    </Dialog>
  );
}
