# Deployment Guide

This guide covers how to deploy the AI Document Analysis Tool to various platforms.

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (optional)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-document-analysis-free
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Manual Setup

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Production Deployment

### Option 1: Railway (Recommended - Free Tier)

#### Backend Deployment
1. Create account at [Railway](https://railway.app)
2. Connect your GitHub repository
3. Create new project from GitHub repo
4. Set environment variables:
   ```
   DATABASE_URL=postgresql://...
   HUGGINGFACE_API_KEY=your_token
   ```
5. Deploy the backend service

#### Frontend Deployment
1. Create new service in Railway
2. Set build command: `cd frontend && npm install && npm run build`
3. Set start command: `cd frontend && npm run preview`
4. Set environment variables:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

### Option 2: Render (Free Tier)

#### Backend Deployment
1. Create account at [Render](https://render.com)
2. Connect your GitHub repository
3. Create new Web Service
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Set environment variables as above

#### Frontend Deployment
1. Create new Static Site service
2. Set build command: `cd frontend && npm install && npm run build`
3. Set publish directory: `frontend/dist`
4. Set environment variables as above

### Option 3: Vercel + Railway

#### Backend (Railway)
Follow the Railway backend deployment steps above.

#### Frontend (Vercel)
1. Create account at [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Set build settings:
   - Framework Preset: Vite
   - Root Directory: frontend
   - Build Command: `npm run build`
   - Output Directory: dist
4. Set environment variables:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

## Environment Variables

### Backend
```bash
DATABASE_URL=postgresql://username:password@host:port/database
HUGGINGFACE_API_KEY=your_huggingface_token
```

### Frontend
```bash
VITE_API_URL=https://your-backend-url.com
```

## Database Setup

### SQLite (Development)
The application uses SQLite by default for development. No additional setup required.

### PostgreSQL (Production)
1. Create a PostgreSQL database
2. Update `DATABASE_URL` environment variable
3. The application will automatically create tables on first run

## AI Model Setup

### Hugging Face
1. Create account at [Hugging Face](https://huggingface.co)
2. Generate an access token
3. Set `HUGGINGFACE_API_KEY` environment variable

## Security Considerations

1. **File Upload Limits**: The application limits file uploads to 10MB
2. **File Type Validation**: Only PDF, DOCX, and TXT files are accepted
3. **CORS Configuration**: Update CORS origins in `backend/app/main.py` for production
4. **Environment Variables**: Never commit sensitive data to version control

## Monitoring and Logs

### Railway
- View logs in the Railway dashboard
- Set up alerts for service health

### Render
- View logs in the Render dashboard
- Set up health checks

### Vercel
- View deployment logs in the Vercel dashboard
- Set up analytics and monitoring

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Update CORS origins in backend configuration
   - Ensure frontend API URL is correct

2. **File Upload Failures**
   - Check file size limits
   - Verify file type is supported
   - Ensure uploads directory has write permissions

3. **AI Analysis Failures**
   - Verify Hugging Face API key is valid
   - Check internet connectivity for model downloads
   - Monitor API rate limits

4. **Database Connection Issues**
   - Verify database URL format
   - Check database credentials
   - Ensure database is accessible from deployment environment

### Performance Optimization

1. **Model Caching**: The AI models are cached after first download
2. **File Storage**: Consider using cloud storage (S3, Cloudinary) for production
3. **Database Indexing**: Add indexes for frequently queried fields
4. **CDN**: Use CDN for static file delivery

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review application logs
3. Create an issue in the GitHub repository 