import React, { useState, useEffect } from 'react';
import { Brain, Upload, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

import FileUpload from './components/FileUpload';
import DocumentViewer from './components/DocumentViewer';
import DocumentList from './components/DocumentList';
import { documentService } from './services/api';
import { Document, DocumentAnalysis } from './types';

function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Load analysis when document is selected
  useEffect(() => {
    if (selectedDocument?.analysis_results) {
      setAnalysis(selectedDocument.analysis_results);
    } else {
      setAnalysis(null);
    }
  }, [selectedDocument]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await documentService.getDocuments();
      setDocuments(docs);
    } catch (error) {
      toast.error('Failed to load documents');
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const result = await documentService.uploadDocument(file);
      
      if (result.success && result.document) {
        setDocuments(prev => [result.document!, ...prev]);
        setSelectedDocument(result.document);
        toast.success('Document uploaded successfully!');
      } else {
        toast.error(result.error || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload failed');
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyzeDocument = async (documentId: number) => {
    try {
      setIsAnalyzing(true);
      const result = await documentService.analyzeDocument(documentId);
      
      if (result.success && result.analysis) {
        setAnalysis(result.analysis);
        
        // Update document in list with analysis results
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, analysis_results: result.analysis }
            : doc
        ));
        
        // Update selected document if it's the one being analyzed
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(prev => prev ? { ...prev, analysis_results: result.analysis } : null);
        }
        
        toast.success('Analysis completed!');
      } else {
        toast.error(result.error || 'Analysis failed');
      }
    } catch (error) {
      toast.error('Analysis failed');
      console.error('Error analyzing document:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await documentService.deleteDocument(documentId);
      
      // Remove from documents list
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      // Clear selection if deleted document was selected
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
        setAnalysis(null);
      }
      
      toast.success('Document deleted successfully');
    } catch (error) {
      toast.error('Failed to delete document');
      console.error('Error deleting document:', error);
    }
  };

  const handleSelectDocument = (document: Document) => {
    setSelectedDocument(document);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                AI Document Analysis
              </h1>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{documents.length} documents</span>
              {documents.filter(d => d.analysis_results).length > 0 && (
                <span>• {documents.filter(d => d.analysis_results).length} analyzed</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Document List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <DocumentList
                  documents={documents}
                  onSelectDocument={handleSelectDocument}
                  onDeleteDocument={handleDeleteDocument}
                  onAnalyzeDocument={handleAnalyzeDocument}
                  selectedDocumentId={selectedDocument?.id}
                />
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {selectedDocument ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-200px)]">
                <DocumentViewer
                  document={selectedDocument}
                  analysis={analysis}
                  isLoading={isAnalyzing}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4">
                    <FileText className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Welcome to AI Document Analysis
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Upload your documents to get AI-powered insights. Our tool will highlight important information and provide explanations for key content.
                  </p>
                  
                  <FileUpload
                    onFileUpload={handleFileUpload}
                    isLoading={isUploading}
                  />
                  
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Upload className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">Upload</h4>
                      <p>Upload PDF, DOCX, or TXT files</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Brain className="w-4 h-4 text-green-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">Analyze</h4>
                      <p>AI analyzes and highlights important content</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">Review</h4>
                      <p>Review highlights and insights</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 