"""
LearnSphere AI Microservice
FastAPI-powered AI service for test generation, doubt solving, content generation, and comment moderation.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import ai_router

app = FastAPI(
    title="LearnSphere AI Service",
    description="AI-powered microservice for educational content generation and analysis",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(ai_router.router, prefix="/ai", tags=["AI"])

@app.get("/")
async def root():
    return {"message": "LearnSphere AI Service is running", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "ai-microservice"}
