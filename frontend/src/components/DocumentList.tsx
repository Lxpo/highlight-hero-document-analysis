import React from 'react';
import { Document } from '../types';
import { FileText, Trash2, Eye, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

interface DocumentListProps {
  documents: Document[];
  onSelectDocument: (document: Document) => void;
  onDeleteDocument: (id: number) => void;
  onAnalyzeDocument: (id: number) => void;
  selectedDocumentId?: number;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onSelectDocument,
  onDeleteDocument,
  onAnalyzeDocument,
  selectedDocumentId,
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (fileType: string) => {
    const icons: { [key: string]: string } = {
      pdf: '📄',
      docx: '📝',
      txt: '📄',
    };
    return icons[fileType] || '📄';
  };

  const handleDelete = async (id: number, filename: string) => {
    if (window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      try {
        await onDeleteDocument(id);
        toast.success('Document deleted successfully');
      } catch (error) {
        toast.error('Failed to delete document');
      }
    }
  };

  const handleAnalyze = async (id: number, filename: string) => {
    try {
      await onAnalyzeDocument(id);
      toast.success(`Analysis started for "${filename}"`);
    } catch (error) {
      toast.error('Failed to start analysis');
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
        <p className="text-gray-500">Upload your first document to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Your Documents</h3>
      
      {documents.map((document) => (
        <div
          key={document.id}
          className={`
            bg-white border rounded-lg p-4 cursor-pointer transition-all duration-200
            ${selectedDocumentId === document.id
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }
          `}
          onClick={() => onSelectDocument(document)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <span className="text-2xl">{getFileIcon(document.file_type)}</span>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {document.original_filename}
                </h4>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{formatFileSize(document.file_size)}</span>
                  <span>•</span>
                  <span className="uppercase">{document.file_type}</span>
                  <span>•</span>
                  <span>{formatDate(document.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {document.analysis_results ? (
                <div className="flex items-center space-x-1 text-green-600 text-sm">
                  <Brain className="w-4 h-4" />
                  <span>Analyzed</span>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnalyze(document.id, document.original_filename);
                  }}
                  className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100 transition-colors"
                >
                  <Brain className="w-3 h-3" />
                  <span>Analyze</span>
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDocument(document);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="View document"
              >
                <Eye className="w-4 h-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(document.id, document.original_filename);
                }}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {document.analysis_results && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {document.analysis_results.highlights.length} highlights found
                </span>
                <span className="text-gray-500">
                  {document.analysis_results.key_insights.length} key insights
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DocumentList; 