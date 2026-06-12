"""
AI Router — Endpoints for test generation, doubt solving, content generation, and moderation.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import random

router = APIRouter()

# ── Schemas ──────────────────────────────────

class TestGenerationRequest(BaseModel):
    topic: str
    difficulty: str = "Medium"
    num_questions: int = 10
    category: str = "JEE"

class DoubtRequest(BaseModel):
    question: str
    subject: str = "Physics"
    context: str = ""

class ContentRequest(BaseModel):
    topic: str
    type: str = "notes"  # notes, quiz, summary, flashcards
    detail_level: str = "detailed"

class ModerationRequest(BaseModel):
    text: str

class StudyPlanRequest(BaseModel):
    target_exam: str
    subjects: List[str]
    hours_per_day: int = 6
    weeks: int = 12

# ── Test Generation ─────────────────────────

@router.post("/generate-test")
async def generate_test(req: TestGenerationRequest):
    """Generate AI-powered test questions on a given topic."""
    # Placeholder — would use OpenAI/Gemini in production
    sample_questions = []
    templates = [
        {"text": f"Which of the following best describes {req.topic}?", "type": "mcq"},
        {"text": f"Calculate the result when {req.topic} principles are applied:", "type": "mcq"},
        {"text": f"The fundamental concept behind {req.topic} is:", "type": "mcq"},
    ]
    
    for i in range(min(req.num_questions, 10)):
        template = templates[i % len(templates)]
        sample_questions.append({
            "id": i + 1,
            "text": f"Q{i+1}: {template['text']}",
            "type": "mcq",
            "options": [
                {"text": f"Option A for question {i+1}", "isCorrect": i % 4 == 0},
                {"text": f"Option B for question {i+1}", "isCorrect": i % 4 == 1},
                {"text": f"Option C for question {i+1}", "isCorrect": i % 4 == 2},
                {"text": f"Option D for question {i+1}", "isCorrect": i % 4 == 3},
            ],
            "difficulty": req.difficulty,
            "topic": req.topic,
            "explanation": f"Detailed explanation for question {i+1} about {req.topic}.",
        })
    
    return {
        "success": True,
        "test": {
            "title": f"AI Test: {req.topic}",
            "questions": sample_questions,
            "duration": req.num_questions * 3,  # 3 min per question
            "totalMarks": req.num_questions * 4,
            "isAIGenerated": True,
        }
    }

# ── Doubt Solving ────────────────────────────

@router.post("/solve-doubt")
async def solve_doubt(req: DoubtRequest):
    """AI-powered doubt solving with step-by-step explanations."""
    # Placeholder response — would use LangChain RAG in production
    response = f"""**Answer to your question about {req.subject}:**

Your question: "{req.question}"

**Step-by-step explanation:**

1. **Identify the key concepts:** This question involves fundamental principles of {req.subject}.

2. **Apply the relevant formula/theory:** Based on the concepts involved, we need to use the appropriate approach.

3. **Solution:** The detailed solution involves understanding the underlying principles and applying them systematically.

**Key Takeaway:** Make sure to practice similar problems from your textbook and previous year papers.

**Related Topics to Review:**
- Fundamental concepts of {req.subject}
- Practice problems from NCERT
- Previous year JEE/NEET questions on this topic

💡 **Pro Tip:** This is a commonly tested concept. Make sure to understand the derivation as well!
"""
    
    return {
        "success": True,
        "response": response,
        "relatedTopics": [req.subject, "Problem Solving", "Exam Strategy"],
        "confidence": 0.92,
    }

# ── Content Generation ───────────────────────

@router.post("/generate-content")
async def generate_content(req: ContentRequest):
    """Generate educational content — notes, quizzes, summaries, flashcards."""
    
    content_map = {
        "notes": f"# {req.topic}\n\n## Introduction\n{req.topic} is a fundamental concept...\n\n## Key Points\n- Point 1: Important aspect\n- Point 2: Critical detail\n- Point 3: Application\n\n## Summary\nIn conclusion, {req.topic} is essential for exam preparation.",
        "quiz": [
            {"question": f"What is {req.topic}?", "options": ["A", "B", "C", "D"], "correct": 0},
            {"question": f"Which principle applies to {req.topic}?", "options": ["A", "B", "C", "D"], "correct": 1},
        ],
        "summary": f"**{req.topic} — Quick Summary**\n\nThis topic covers the essential concepts needed for competitive exam preparation. Focus on understanding the core principles and practicing numerical problems.",
        "flashcards": [
            {"front": f"Define {req.topic}", "back": f"{req.topic} is a fundamental concept in this subject area."},
            {"front": f"Key formula for {req.topic}", "back": "The relevant formula involves the core variables."},
        ],
    }
    
    return {
        "success": True,
        "content": content_map.get(req.type, content_map["notes"]),
        "type": req.type,
        "topic": req.topic,
    }

# ── Comment Moderation ───────────────────────

@router.post("/moderate-comment")
async def moderate_comment(req: ModerationRequest):
    """AI-powered comment moderation — detect spam, toxicity, and sentiment."""
    text_lower = req.text.lower()
    
    # Simple rule-based checks (would use AI in production)
    toxic_words = ["hate", "stupid", "idiot", "spam", "scam"]
    is_toxic = any(word in text_lower for word in toxic_words)
    is_spam = len(req.text) < 3 or req.text.count("http") > 2
    
    sentiment = "positive" if any(w in text_lower for w in ["great", "good", "amazing", "thank", "helpful"]) else "negative" if is_toxic else "neutral"
    
    return {
        "success": True,
        "moderation": {
            "isApproved": not is_toxic and not is_spam,
            "isToxic": is_toxic,
            "isSpam": is_spam,
            "sentiment": sentiment,
            "confidence": 0.88,
            "reason": "toxic content detected" if is_toxic else "spam detected" if is_spam else "approved",
        }
    }

# ── Study Plan Generation ────────────────────

@router.post("/study-plan")
async def generate_study_plan(req: StudyPlanRequest):
    """Generate a personalized AI study plan."""
    plan = []
    for week in range(1, min(req.weeks + 1, 13)):
        weekly_plan = {
            "week": week,
            "focus": req.subjects[(week - 1) % len(req.subjects)],
            "daily_hours": req.hours_per_day,
            "tasks": [
                f"Study {req.subjects[(week - 1) % len(req.subjects)]} theory (2h)",
                f"Practice problems (2h)",
                f"Mock test + review (1.5h)",
                f"Revision + doubt clearing (0.5h)",
            ],
            "milestone": f"Complete Chapter {week} fundamentals",
        }
        plan.append(weekly_plan)
    
    return {
        "success": True,
        "studyPlan": {
            "targetExam": req.target_exam,
            "totalWeeks": req.weeks,
            "hoursPerDay": req.hours_per_day,
            "plan": plan,
        }
    }

# ── Recommendations ──────────────────────────

@router.get("/recommend/{user_id}")
async def get_recommendations(user_id: str):
    """Get personalized AI recommendations for a student."""
    return {
        "success": True,
        "recommendations": [
            {"type": "video", "title": "Revise Electromagnetic Induction", "reason": "Weak topic detected"},
            {"type": "test", "title": "Practice Rotational Mechanics", "reason": "Low score in recent test"},
            {"type": "notes", "title": "Review Thermodynamics Notes", "reason": "Not reviewed in 7 days"},
            {"type": "course", "title": "Advanced Problem Solving", "reason": "Based on your progress"},
        ]
    }
