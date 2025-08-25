# AI Document Analysis Tool

An intelligent document analysis tool that allows users to upload documents and get AI-powered insights with highlighted important information.

## Features

- 📄 Document upload and display (PDF, DOCX, TXT)
- 🤖 AI-powered document analysis
- 🎯 Automatic highlighting of important information
- 💡 Explanatory tooltips for highlighted content
- 📱 Responsive design
- 🔍 Real-time document viewing

## Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - Database ORM
- **Pydantic** - Data validation
- **Hugging Face Transformers** - AI analysis
- **PyPDF2** - PDF processing
- **python-docx** - DOCX processing

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React PDF** - PDF rendering
- **Axios** - HTTP client

### AI Services
- **Hugging Face** - Free tier for document analysis
- **Tesseract.js** - OCR for image-based documents

### Deployment
- **Backend**: Railway/Render (free tier)
- **Frontend**: Vercel/Netlify (free tier)
- **Database**: SQLite (development) / PostgreSQL (production)

## Quick Start

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `POST /upload` - Upload document
- `GET /documents/{id}` - Get document details
- `POST /analyze/{id}` - Analyze document
- `GET /documents` - List all documents


## License

MIT License 
