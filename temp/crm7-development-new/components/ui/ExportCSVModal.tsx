import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { CSVLink } from 'react-csv';

// Generic type for CSV data
type CSVData = Record<string, string | number | boolean | null>[];

interface ExportCSVModalProps {
  show: boolean;
  onCloseClick: () => void;
  data: CSVData;
  fileName?: string;
}

const ExportCSVModal: React.FC<ExportCSVModalProps> = ({ 
  show, 
  onCloseClick, 
  data, 
  fileName = 'export.csv' 
}) => {
  // Styles for the CSV download button to match Button component
  const csvLinkClass = [
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium',
    'transition-colors focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none',
    'disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2'
  ].join(' ');

  return (
    <Dialog open={show} onOpenChange={onCloseClick}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export to CSV</DialogTitle>
        </DialogHeader>
        <div className="mt-4 text-center">
          {/* Using Lucide FileText icon for export */}
          <FileText className="mx-auto h-12 w-12 text-success" />
          <div className="mt-4 pt-2 text-sm text-muted-foreground">
            <h4>Are you sure?</h4>
            <p className="mt-2 mb-0">
              Are you sure you want to export the data to a CSV file?
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-4 mb-2">
          <Button variant="outline" onClick={onCloseClick}>
            Cancel
          </Button>
          <CSVLink
            data={data}
            filename={fileName}
            className={csvLinkClass}
            onClick={onCloseClick}
          >
            Download
          </CSVLink>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportCSVModal;
