import axios from 'axios';
import { Document, DocumentAnalysis, UploadResponse, AnalysisResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const documentService = {
  // Upload document
  async uploadDocument(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/v1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        document: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Upload failed',
      };
    }
  },

  // Get all documents
  async getDocuments(): Promise<Document[]> {
    const response = await api.get('/api/v1/documents');
    return response.data;
  },

  // Get single document
  async getDocument(id: number): Promise<Document> {
    const response = await api.get(`/api/v1/documents/${id}`);
    return response.data;
  },

  // Delete document
  async deleteDocument(id: number): Promise<void> {
    await api.delete(`/api/v1/documents/${id}`);
  },

  // Analyze document
  async analyzeDocument(id: number): Promise<AnalysisResponse> {
    try {
      const response = await api.post(`/api/v1/analyze/${id}`);
      return {
        success: true,
        analysis: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Analysis failed',
      };
    }
  },

  // Get analysis results
  async getAnalysisResults(id: number): Promise<AnalysisResponse> {
    try {
      const response = await api.get(`/api/v1/analyze/${id}`);
      return {
        success: true,
        analysis: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to get analysis results',
      };
    }
  },
}; 