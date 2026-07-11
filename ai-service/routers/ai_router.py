"""
AI Router — Endpoints for test generation, doubt solving, content generation, and moderation.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import json
import random
import os
import re
import time
import httpx
from services.test_generator import generate_questions
try:
    import openai
except Exception:
    openai = None

router = APIRouter()
load_dotenv()


def extract_gemini_text(payload) -> str:
    """Extract a plain-text response from Gemini's JSON payload."""
    if not isinstance(payload, dict):
        return ""

    candidates = payload.get("candidates") or []
    for candidate in candidates:
        if not isinstance(candidate, dict):
            continue
        content = candidate.get("content") or {}
        parts = content.get("parts") or []
        for part in parts:
            if isinstance(part, dict):
                text = part.get("text")
                if isinstance(text, str) and text.strip():
                    return text.strip()
    return ""


def call_gemini(prompt: str) -> Optional[str]:
    """Call the Gemini API directly using the configured API key."""
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("[ERROR] call_gemini: No GEMINI_API_KEY or GOOGLE_API_KEY found in environment")
        return None

    candidate_models = [
        os.getenv("GEMINI_MODEL"),
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.5-mini",
    ]
    candidate_models = [model for model in candidate_models if model]

    max_retries = 2
    for candidate_model in candidate_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{candidate_model}:generateContent?key={api_key}"
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.7, "maxOutputTokens": 4096},
        }

        for attempt in range(1, max_retries + 1):
            try:
                response = httpx.post(url, json=payload, timeout=45)
                response.raise_for_status()
                data = response.json()
                text = extract_gemini_text(data)
                if text:
                    return text
                break
            except httpx.HTTPStatusError as e:
                status_code = e.response.status_code
                print(f"[DEBUG] call_gemini failed for model {candidate_model} (attempt {attempt}/{max_retries}): {repr(e)}")
                if status_code in (429, 503) and attempt < max_retries:
                    time.sleep(2 * attempt)
                    continue
                break
            except Exception as e:
                print(f"[DEBUG] call_gemini failed for model {candidate_model} (attempt {attempt}/{max_retries}): {repr(e)}")
                break

    print("[ERROR] call_gemini: All model attempts failed or returned empty responses")
    return None

def generate_local_questions(topic: str, difficulty: str, num_questions: int, category: str = 'General'):
    return generate_questions(topic or 'General Topic', difficulty, num_questions, category)


def extract_json_payload(text: str):
    """Try to recover a JSON object or array from a Gemini text response."""
    if not text or not isinstance(text, str):
        return None

    text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        pass

    cleaned = text
    # Try to extract any JSON-looking substring from the response
    json_candidates = re.findall(r"(\{[\s\S]*?\}|\[[\s\S]*?\])", cleaned)
    for candidate in json_candidates:
        try:
            return json.loads(candidate)
        except Exception:
            continue

    # If the response includes a named JSON payload, extract it.
    for pattern in [r"questions\s*[:=]\s*(\[[\s\S]*\])", r"payload\s*[:=]\s*(\{[\s\S]*\})"]:
        match = re.search(pattern, cleaned, re.I)
        if match:
            try:
                return json.loads(match.group(1))
            except Exception:
                pass

    return None


def parse_plaintext_questions(text: str, topic: str, num_questions: int, difficulty: str):
    """Parse a natural-language Gemini response into a question list when JSON extraction fails."""
    if not text:
        return []

    questions = []
    current_question = None
    current_options = []

    def normalize_line(line: str) -> str:
        cleaned = line.strip()
        cleaned = re.sub(r"^\s*[*#>\-•]+\s*", "", cleaned)
        cleaned = re.sub(r"^\*\*(.+?)\*\*$", r"\1", cleaned)
        cleaned = re.sub(r"^\*(.+?)\*$", r"\1", cleaned)
        return cleaned.strip()

    for raw_line in text.splitlines():
        cleaned = normalize_line(raw_line)
        if not cleaned:
            continue

        question_match = re.match(r"^(?:Q(?:uestion)?\s*)?(\d+)(?:[\):\.\-]|\s+)(.+)$", cleaned, re.I)
        if question_match:
            if current_question is not None:
                questions.append({
                    "text": current_question,
                    "options": current_options or ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": 0,
                    "difficulty": difficulty or "Medium",
                    "marks": 4,
                    "topic": topic,
                })
            current_question = question_match.group(2).strip("-: ")
            current_options = []
            continue

        if re.match(r"^\*\*\d+\.", cleaned) or re.match(r"^\d+\.", cleaned):
            if current_question is not None:
                questions.append({
                    "text": current_question,
                    "options": current_options or ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": 0,
                    "difficulty": difficulty or "Medium",
                    "marks": 4,
                    "topic": topic,
                })
            current_question = cleaned
            current_options = []
            continue

        option_match = re.match(r"^([A-D])(?:[\).:-]|\s+)(.+)$", cleaned)
        if option_match and current_question is not None:
            current_options.append(option_match.group(2).strip())
            continue

        if current_question is not None and not re.match(r"^(?:A|B|C|D)\)", cleaned, re.I):
            current_question = f"{current_question} {cleaned}".strip()

    if current_question is not None:
        questions.append({
            "text": current_question,
            "options": current_options or ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0,
            "difficulty": difficulty or "Medium",
            "marks": 4,
            "topic": topic,
        })

    if questions:
        return questions[:max(1, min(num_questions, len(questions)))]

    return []


def _extract_question_text(question: dict):
    for field in ("text", "question", "question_text", "questionText", "prompt", "statement", "stem"):
        value = question.get(field)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return None


def _normalize_options(options, correct_answer=None):
    formatted_options = []
    for option_index, option in enumerate(options[:4]):
        if isinstance(option, dict):
            option_text = (
                option.get("text")
                or option.get("option")
                or option.get("choice")
                or option.get("optionText")
                or option.get("value")
                or ""
            )
            is_correct = bool(option.get("isCorrect", False))
            if not is_correct and isinstance(correct_answer, int):
                is_correct = option_index == correct_answer
            elif not is_correct and isinstance(correct_answer, str):
                option_id = option.get("id") or option.get("optionId") or option.get("key")
                is_correct = str(option_id) == str(correct_answer)
            if option_text:
                formatted_options.append({"text": option_text, "isCorrect": is_correct})
        elif isinstance(option, str) and option.strip():
            formatted_options.append({"text": option.strip(), "isCorrect": False})

    if not formatted_options:
        return [
            {"text": "A. Option A", "isCorrect": False},
            {"text": "B. Option B", "isCorrect": False},
            {"text": "C. Option C", "isCorrect": False},
            {"text": "D. Option D", "isCorrect": False},
        ]

    while len(formatted_options) < 4:
        formatted_options.append({"text": f"Option {len(formatted_options) + 1}", "isCorrect": False})

    return formatted_options


def normalize_generated_test(parsed, topic: str, num_questions: int, difficulty: str):
    """Normalize Gemini output into the app's expected mock-test schema."""
    if isinstance(parsed, list):
        questions = parsed
        normalized = {
            "title": f"AI Test: {topic}",
            "questions": [],
            "duration": max(10, num_questions * 3),
            "totalMarks": max(4, num_questions * 4),
            "isAIGenerated": True,
        }
    elif isinstance(parsed, dict):
        questions = parsed.get("questions") if isinstance(parsed.get("questions"), list) else parsed.get("items")
        if not isinstance(questions, list):
            questions = []
        normalized = dict(parsed)
        normalized.setdefault("title", f"AI Test: {topic}")
        normalized.setdefault("duration", max(10, num_questions * 3))
        normalized.setdefault("totalMarks", max(4, num_questions * 4))
        normalized.setdefault("isAIGenerated", True)
    else:
        raise ValueError("Unsupported Gemini payload")

    if not isinstance(questions, list) or not questions:
        raise ValueError("No questions were returned")

    formatted_questions = []
    for index, question in enumerate(questions, start=1):
        if not isinstance(question, dict):
            continue

        question_text = _extract_question_text(question)
        if not question_text:
            continue

        options = []
        for field in ("options", "choices", "answers"):
            if isinstance(question.get(field), list):
                options = question.get(field)
                break

        if not options:
            option_matches = re.findall(r"([A-D])\.\s*(.+)", question_text)
            if option_matches:
                options = [opt for _, opt in option_matches]

        correct_answer = None
        for field in ("correctAnswer", "correct_answer", "correct_answer_id", "correctOption", "correctOptionIndex", "answer"):
            if field in question and question.get(field) is not None:
                correct_answer = question.get(field)
                break

        if not options and isinstance(question.get("optionSet"), list):
            options = question.get("optionSet")

        formatted_options = _normalize_options(options, correct_answer)

        if isinstance(correct_answer, str) and formatted_options:
            for option_item in formatted_options:
                if option_item.get("text") == correct_answer:
                    option_item["isCorrect"] = True
                    break

        formatted_questions.append({
            "id": index,
            "text": question_text,
            "type": "mcq",
            "options": formatted_options,
            "difficulty": question.get("difficulty") or difficulty or "Medium",
            "marks": question.get("marks") or 4,
            "topic": question.get("topic") or topic,
            "explanation": question.get("explanation") or "",
        })

    if not formatted_questions:
        raise ValueError("No valid questions were returned")

    normalized["questions"] = formatted_questions
    return normalized


def build_generation_prompt(user_prompt: str, topic_value: str, num_questions: int, difficulty: str) -> str:
    """Use the user-provided prompt as the primary instruction for Gemini."""
    base_prompt = (user_prompt or topic_value or "").strip()
    if not base_prompt:
        return f"Generate {num_questions} multiple-choice questions on {topic_value or 'this topic'} at {difficulty} difficulty."

    return (
        f"{base_prompt}\n\nCreate exactly {num_questions} multiple-choice questions from this request. "
        f"Difficulty: {difficulty}. Keep each question concise and complete, and return them as a numbered list with four options labeled A, B, C, and D."
    )


def build_fallback_response(question: str, subject: str) -> str:
    """Create a helpful educational explanation when AI is unavailable."""
    q = (question or "").strip().lower()
    subject_name = (subject or "General").strip()

    if any(word in q for word in ["deeper", "deeply"]):
        return (
            f"Here is a deeper explanation for {subject_name}: force is the cause of a change in motion, and acceleration is how quickly that motion changes. "
            "Newton's second law states that the net force acting on an object is equal to its mass multiplied by its acceleration, F = ma. "
            "This means a stronger force causes a larger acceleration, while a larger mass resists motion more and therefore accelerates less for the same force. "
            "A simple example is pushing a light trolley and a heavy truck with the same force: the trolley speeds up much more quickly because it has less mass."
        )

    if "newton" in q and "second" in q:
        return (
            "Newton's second law is one of the most important laws of motion. It states that the acceleration of an object depends on the net force acting on it and its mass. "
            "The relationship is written as F = ma, where F is the net force, m is the mass, and a is the acceleration. "
            "This means a larger force produces a larger acceleration, while a larger mass produces a smaller acceleration for the same force. "
            "Example: if a 2 kg box is pushed with a net force of 6 N, then a = F/m = 6/2 = 3 m/s². "
            "So the box speeds up at 3 meters per second every second. "
            "A deeper way to think about it is that force changes motion, and the amount of change depends on how much matter is resisting that change."
        )

    if any(word in q for word in ["explain", "meaning", "why", "concept"]):
        if "newton" in q or "force" in q or "acceleration" in q:
            return (
                f"For {subject_name}, the important idea is that force is what changes motion, and acceleration is the rate at which that motion changes. "
                "The law tells us that the same force will cause a smaller mass to accelerate more than a larger mass. "
                "In everyday life, this is why a light push moves a shopping cart easily, but the same push does not move a heavy truck as quickly."
            )

    if "force" in q or "acceleration" in q:
        return (
            f"For {subject_name}, the key idea is to identify the given values, choose the correct formula, and then solve step by step. "
            f"If you share the exact problem, I can explain it in a clearer way with a worked example."
        )

    return (
        f"Here is a deeper explanation for your question in {subject_name}: first identify the main idea, then break it into smaller steps, "
        "and connect each step to the concept being tested. If you want, I can also turn this into a short example or a solved problem."
    )

# ── Schemas ──────────────────────────────────

class TestGenerationRequest(BaseModel):
    topic: str = ""
    prompt: str = ""
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

class MockTestEvaluationRequest(BaseModel):
    topic: str = ""
    difficulty: str = "Medium"
    questions: List[dict]
    answers: List[dict]

# ── Test Generation ─────────────────────────

@router.post("/evaluate-mock-test")
async def evaluate_mock_test(req: MockTestEvaluationRequest):
    """Evaluate student answers for a generated mock test using the AI service fallback logic."""
    total = max(1, len(req.questions or []))
    correct = 0
    wrong_topics = []

    for index, question in enumerate(req.questions or []):
        selected_value = None
        if index < len(req.answers or []):
            selected_value = (req.answers[index] or {}).get("selectedOption")

        is_correct = False
        options = question.get("options") or []
        correct_answer = question.get("correctAnswer")

        if selected_value is not None and selected_value >= 0:
            if correct_answer is not None:
                try:
                    is_correct = str(selected_value) == str(correct_answer)
                except Exception:
                    is_correct = False
            else:
                for option_index, option in enumerate(options):
                    if isinstance(option, dict) and option.get("isCorrect"):
                        is_correct = selected_value == option_index
                        break

        if is_correct:
            correct += 1
        else:
            topic_name = question.get("topic") or req.topic or "this topic"
            if topic_name not in wrong_topics:
                wrong_topics.append(topic_name)

    score = round((correct / total) * 100)
    percentage = max(0, min(100, score))
    strengths = []
    weaknesses = []
    tips = []

    if percentage >= 80:
        strengths.append("Strong grasp of the topic")
        tips.append("Review the few missed concepts to stay sharp")
    elif percentage >= 50:
        strengths.append("Good progress with the topic")
        weaknesses.extend(wrong_topics[:2])
        tips.append("Revise the weak areas and practice similar questions")
    else:
        weaknesses.extend(wrong_topics[:3])
        tips.append("Go through the fundamentals again before attempting more questions")
        tips.append(f"Practice more {req.difficulty.lower()} level problems on {req.topic or 'the selected topic'}")

    if not weaknesses:
        weaknesses.append("Keep practicing to improve consistency")

    feedback = (
        f"You scored {percentage}% on this {req.difficulty.lower()} mock test. "
        f"You answered {correct} out of {total} questions correctly."
    )

    return {
        "success": True,
        "score": percentage,
        "correct": correct,
        "total": total,
        "feedback": feedback,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "tips": tips,
    }


@router.post("/generate-test")
async def generate_test(req: TestGenerationRequest):
    """Generate mock test questions directly from Gemini."""
    difficulty = req.difficulty or "Medium"
    num_questions = max(1, int(req.num_questions or 10))
    user_prompt = (req.prompt or req.topic or "").strip()
    topic_value = user_prompt or "General topic"

    prompt = build_generation_prompt(user_prompt, topic_value, num_questions, difficulty)

    gemini_response = call_gemini(prompt)
    if gemini_response:
        try:
            parsed = extract_json_payload(gemini_response)
            if parsed is None:
                plain_questions = parse_plaintext_questions(gemini_response, user_prompt or topic_value or req.topic, num_questions, difficulty)
                if plain_questions:
                    parsed = {"questions": plain_questions}
                else:
                    raise ValueError("No JSON payload found")
            normalized = normalize_generated_test(parsed, req.topic or user_prompt or topic_value, num_questions, difficulty)
            return {"success": True, "questions": normalized["questions"], "test": normalized}
        except Exception as exc:
            print(f"[WARN] Gemini response parse failed, falling back to local generation: {repr(exc)}")

    # Gemini failed or returned invalid data; fallback to local topic-aware generation
    fallback_questions = generate_local_questions(user_prompt or topic_value or req.topic, difficulty, num_questions, req.category)
    return {"success": True, "questions": fallback_questions["questions"], "test": fallback_questions}

# ── Doubt Solving ────────────────────────────

@router.post("/solve-doubt")
async def solve_doubt(req: DoubtRequest):
    """AI-powered doubt solving with step-by-step explanations."""
    prompt = (
        f"You are a helpful study assistant for students. Answer the following question clearly and use a friendly tone. "
        f"Subject: {req.subject or 'General'}. "
        f"Question: {req.question}. "
        "If the question is mathematical or scientific, show the reasoning step by step. "
        "Keep the answer concise but useful for learning."
    )

    gemini_response = call_gemini(prompt)
    if gemini_response:
        return {
            "success": True,
            "response": gemini_response,
            "provider": "gemini",
        }

    raise HTTPException(status_code=502, detail="Gemini API is unavailable. Please set a valid GEMINI_API_KEY.")

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
