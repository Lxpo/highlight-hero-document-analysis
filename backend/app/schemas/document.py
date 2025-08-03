from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class DocumentBase(BaseModel):
    filename: str
    original_filename: str
    file_size: int
    file_type: str

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: int
    file_path: str
    content: Optional[str] = None
    analysis_results: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AnalysisResult(BaseModel):
    text: str
    importance_score: float
    category: str
    explanation: str
    start_position: int
    end_position: int

class DocumentAnalysis(BaseModel):
    document_id: int
    highlights: List[AnalysisResult]
    summary: str
    key_insights: List[str] 