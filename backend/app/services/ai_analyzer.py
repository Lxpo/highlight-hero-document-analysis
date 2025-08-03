from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
from typing import List, Dict, Any
import re
import os

class AIAnalyzer:
    def __init__(self):
        # Initialize models for different analysis tasks
        self.sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
            device=0 if torch.cuda.is_available() else -1
        )
        
        self.text_classifier = pipeline(
            "text-classification",
            model="facebook/bart-large-mnli",
            device=0 if torch.cuda.is_available() else -1
        )
        
        # Categories for document analysis
        self.categories = [
            "financial information",
            "personal information", 
            "legal information",
            "technical information",
            "contact information",
            "dates and deadlines",
            "important numbers",
            "key decisions",
            "action items"
        ]

    def analyze_document(self, text: str) -> Dict[str, Any]:
        """Analyze document and return insights"""
        if not text or len(text.strip()) < 50:
            return {
                "highlights": [],
                "summary": "Document too short for meaningful analysis",
                "key_insights": []
            }

        # Split text into sentences for analysis
        sentences = self._split_into_sentences(text)
        
        highlights = []
        key_insights = []
        
        # Analyze each sentence
        for i, sentence in enumerate(sentences):
            if len(sentence.strip()) < 10:
                continue
                
            # Check for important patterns
            importance_score = self._calculate_importance_score(sentence)
            
            if importance_score > 0.6:  # Threshold for highlighting
                category = self._categorize_text(sentence)
                explanation = self._generate_explanation(sentence, category)
                
                # Find position in original text
                start_pos = text.find(sentence)
                end_pos = start_pos + len(sentence) if start_pos != -1 else 0
                
                highlights.append({
                    "text": sentence,
                    "importance_score": importance_score,
                    "category": category,
                    "explanation": explanation,
                    "start_position": start_pos,
                    "end_position": end_pos
                })
                
                key_insights.append(f"{category}: {sentence[:100]}...")

        # Generate summary
        summary = self._generate_summary(text, highlights)
        
        return {
            "highlights": highlights,
            "summary": summary,
            "key_insights": key_insights[:10]  # Limit to top 10 insights
        }

    def _split_into_sentences(self, text: str) -> List[str]:
        """Split text into sentences"""
        # Simple sentence splitting - can be improved with NLTK
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]

    def _calculate_importance_score(self, text: str) -> float:
        """Calculate importance score for text"""
        score = 0.0
        
        # Check for financial patterns
        if re.search(r'\$[\d,]+\.?\d*|\d+%|\d+\s*(dollars?|euros?|pounds?)', text, re.IGNORECASE):
            score += 0.3
            
        # Check for dates and deadlines
        if re.search(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2}|(january|february|march|april|may|june|july|august|september|october|november|december)', text, re.IGNORECASE):
            score += 0.2
            
        # Check for contact information
        if re.search(r'@|phone|email|contact|address', text, re.IGNORECASE):
            score += 0.2
            
        # Check for legal terms
        if re.search(r'contract|agreement|terms|conditions|legal|law|court|judge|attorney', text, re.IGNORECASE):
            score += 0.3
            
        # Check for action words
        if re.search(r'must|should|will|shall|required|obligated|deadline|urgent|important', text, re.IGNORECASE):
            score += 0.2
            
        # Check for numbers (potential amounts, quantities)
        if re.search(r'\b\d+\b', text):
            score += 0.1
            
        # Sentiment analysis
        try:
            sentiment_result = self.sentiment_analyzer(text[:512])[0]  # Limit text length
            if sentiment_result['label'] in ['LABEL_2', 'LABEL_1']:  # Positive or neutral
                score += 0.1
        except:
            pass
            
        return min(score, 1.0)

    def _categorize_text(self, text: str) -> str:
        """Categorize text into predefined categories"""
        try:
            # Use zero-shot classification
            result = self.text_classifier(
                text[:512],  # Limit text length
                candidate_labels=self.categories,
                hypothesis_template="This text contains {}."
            )
            return result['labels'][0]
        except:
            return "general information"

    def _generate_explanation(self, text: str, category: str) -> str:
        """Generate explanation for highlighted text"""
        explanations = {
            "financial information": "Contains important financial data, amounts, or monetary values",
            "personal information": "Contains personal details, names, or private information",
            "legal information": "Contains legal terms, contracts, or legal obligations",
            "technical information": "Contains technical specifications or technical details",
            "contact information": "Contains contact details, emails, or phone numbers",
            "dates and deadlines": "Contains important dates, deadlines, or time-sensitive information",
            "important numbers": "Contains significant numerical data or quantities",
            "key decisions": "Contains important decisions or conclusions",
            "action items": "Contains required actions or tasks to be completed"
        }
        
        return explanations.get(category, "Contains important information that requires attention")

    def _generate_summary(self, text: str, highlights: List[Dict]) -> str:
        """Generate a summary of the document"""
        if not highlights:
            return "No significant highlights found in the document."
            
        # Create summary based on highlights
        categories = {}
        for highlight in highlights:
            cat = highlight['category']
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(highlight['text'][:50] + "...")
        
        summary_parts = []
        for category, texts in categories.items():
            summary_parts.append(f"Found {len(texts)} items related to {category}")
            
        return "Document analysis complete. " + ". ".join(summary_parts) 