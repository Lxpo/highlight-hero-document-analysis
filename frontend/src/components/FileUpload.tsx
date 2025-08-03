import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, File, FileImage } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading = false }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF, DOCX, or TXT file');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  const getFileIcon = () => {
    return (
      <div className="flex flex-col items-center justify-center w-16 h-16 mb-4 text-gray-400">
        <FileText className="w-8 h-8" />
      </div>
    );
  };

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
        ${isDragActive 
          ? 'border-primary-500 bg-primary-50' 
          : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} disabled={isLoading} />
      
      {getFileIcon()}
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900">
          {isDragActive ? 'Drop your document here' : 'Upload your document'}
        </h3>
        
        <p className="text-sm text-gray-500">
          Drag and drop a PDF, DOCX, or TXT file here, or click to browse
        </p>
        
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <File className="w-4 h-4" />
            <span>PDF</span>
          </div>
          <div className="flex items-center space-x-1">
            <FileText className="w-4 h-4" />
            <span>DOCX</span>
          </div>
          <div className="flex items-center space-x-1">
            <FileText className="w-4 h-4" />
            <span>TXT</span>
          </div>
        </div>
        
        {isLoading && (
          <div className="mt-4">
            <div className="inline-flex items-center space-x-2 text-primary-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              <span>Processing document...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload; 