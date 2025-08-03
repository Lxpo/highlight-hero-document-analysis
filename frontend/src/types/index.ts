export interface Document {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  content: string | null;
  file_type: string;
  analysis_results: AnalysisResults | null;
  created_at: string;
  updated_at: string | null;
}

export interface AnalysisResults {
  highlights: Highlight[];
  summary: string;
  key_insights: string[];
}

export interface Highlight {
  text: string;
  importance_score: number;
  category: string;
  explanation: string;
  start_position: number;
  end_position: number;
}

export interface DocumentAnalysis {
  document_id: number;
  highlights: Highlight[];
  summary: string;
  key_insights: string[];
}

export interface UploadResponse {
  success: boolean;
  document?: Document;
  error?: string;
}

export interface AnalysisResponse {
  success: boolean;
  analysis?: DocumentAnalysis;
  error?: string;
} 