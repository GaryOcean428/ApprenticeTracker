import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
  onFileSelect: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
}

export function FileUploader({
  onFileSelect,
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
  },
  maxSize = 5242880, // 5MB
  maxFiles = 1,
  multiple = false,
}: FileUploaderProps): React.ReactElement {
  const [error, setError] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]): void => {
    try {
      setError(null);
      if (acceptedFiles.length > maxFiles) {
        throw new Error(`Maximum ${maxFiles} files allowed`);
      }
      onFileSelect(acceptedFiles);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    multiple,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
        `}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <p>Drag & drop files here, or click to select files</p>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
