from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from app.models.document import Document
from app.services.ai_analyzer import AIAnalyzer
from app.schemas.document import DocumentAnalysis

router = APIRouter()

# Initialize AI analyzer (singleton)
ai_analyzer = AIAnalyzer()

@router.post("/analyze/{document_id}", response_model=DocumentAnalysis)
async def analyze_document(document_id: int, db: Session = Depends(get_db)):
    """Analyze a document and return insights"""
    
    # Get document
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not document.content:
        raise HTTPException(status_code=400, detail="Document has no extractable content")
    
    # Perform AI analysis
    try:
        analysis_results = ai_analyzer.analyze_document(document.content)
        
        # Update document with analysis results
        document.analysis_results = analysis_results
        db.commit()
        
        # Return analysis results
        return DocumentAnalysis(
            document_id=document_id,
            highlights=analysis_results["highlights"],
            summary=analysis_results["summary"],
            key_insights=analysis_results["key_insights"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/analyze/{document_id}")
async def get_analysis_results(document_id: int, db: Session = Depends(get_db)):
    """Get existing analysis results for a document"""
    
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not document.analysis_results:
        raise HTTPException(status_code=404, detail="No analysis results found for this document")
    
    return document.analysis_results 