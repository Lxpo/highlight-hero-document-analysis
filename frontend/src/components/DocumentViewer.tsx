import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Highlight, DocumentAnalysis } from '../types';
import { FileText, Eye, EyeOff } from 'lucide-react';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerProps {
  document: Document;
  analysis: DocumentAnalysis | null;
  isLoading?: boolean;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  document, 
  analysis, 
  isLoading = false 
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [showHighlights, setShowHighlights] = useState(true);
  const [hoveredHighlight, setHoveredHighlight] = useState<Highlight | null>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Function to render highlighted text
  const renderHighlightedText = (text: string, highlights: Highlight[]) => {
    if (!showHighlights || !highlights.length) {
      return <div className="whitespace-pre-wrap">{text}</div>;
    }

    // Sort highlights by start position
    const sortedHighlights = [...highlights].sort((a, b) => a.start_position - b.start_position);
    
    const parts: JSX.Element[] = [];
    let lastIndex = 0;

    sortedHighlights.forEach((highlight, index) => {
      // Add text before highlight
      if (highlight.start_position > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, highlight.start_position)}
          </span>
        );
      }

      // Add highlighted text
      parts.push(
        <span
          key={`highlight-${index}`}
          className="bg-yellow-200 cursor-pointer hover:bg-yellow-300 transition-colors duration-200"
          onMouseEnter={() => setHoveredHighlight(highlight)}
          onMouseLeave={() => setHoveredHighlight(null)}
          style={{
            backgroundColor: getHighlightColor(highlight.importance_score),
          }}
        >
          {text.slice(highlight.start_position, highlight.end_position)}
        </span>
      );

      lastIndex = highlight.end_position;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return <div className="whitespace-pre-wrap">{parts}</div>;
  };

  const getHighlightColor = (importanceScore: number) => {
    if (importanceScore >= 0.8) return '#fef3c7'; // Yellow for high importance
    if (importanceScore >= 0.6) return '#dbeafe'; // Blue for medium importance
    return '#f3e8ff'; // Purple for low importance
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'financial information': '💰',
      'personal information': '👤',
      'legal information': '⚖️',
      'technical information': '🔧',
      'contact information': '📞',
      'dates and deadlines': '📅',
      'important numbers': '🔢',
      'key decisions': '✅',
      'action items': '📋',
    };
    return icons[category] || '📄';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Document Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-gray-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {document.original_filename}
              </h2>
              <p className="text-sm text-gray-500">
                {formatFileSize(document.file_size)} • {document.file_type.toUpperCase()}
              </p>
            </div>
          </div>
          
          {analysis && (
            <button
              onClick={() => setShowHighlights(!showHighlights)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              {showHighlights ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showHighlights ? 'Hide' : 'Show'} Highlights</span>
            </button>
          )}
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing document...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-6">
            {document.file_type === 'pdf' ? (
              <div className="bg-white rounded-lg shadow-sm border">
                <Document
                  file={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/uploads/${document.filename}`}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  }
                >
                  <Page 
                    pageNumber={pageNumber} 
                    width={Math.min(window.innerWidth - 100, 800)}
                    loading={
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                      </div>
                    }
                  />
                </Document>
                
                {numPages && (
                  <div className="flex items-center justify-center space-x-4 p-4 border-t">
                    <button
                      onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                      disabled={pageNumber <= 1}
                      className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {pageNumber} of {numPages}
                    </span>
                    <button
                      onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                      disabled={pageNumber >= numPages}
                      className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <div ref={textRef} className="prose max-w-none">
                  {document.content ? (
                    renderHighlightedText(document.content, analysis?.highlights || [])
                  ) : (
                    <p className="text-gray-500">No content available</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Highlight Tooltip */}
      {hoveredHighlight && (
        <div className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-start space-x-2">
            <span className="text-lg">{getCategoryIcon(hoveredHighlight.category)}</span>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 capitalize">
                {hoveredHighlight.category}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {hoveredHighlight.explanation}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Importance: {Math.round(hoveredHighlight.importance_score * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Summary */}
      {analysis && (
        <div className="bg-white border-t border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-2">Analysis Summary</h3>
          <p className="text-sm text-gray-600 mb-3">{analysis.summary}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {analysis.highlights.slice(0, 6).map((highlight, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-2 bg-gray-50 rounded text-xs"
                onMouseEnter={() => setHoveredHighlight(highlight)}
                onMouseLeave={() => setHoveredHighlight(null)}
              >
                <span>{getCategoryIcon(highlight.category)}</span>
                <span className="truncate">{highlight.text.substring(0, 30)}...</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer; 