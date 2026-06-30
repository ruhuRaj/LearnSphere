"""
AI Router — Endpoints for test generation, doubt solving, content generation, and moderation.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import random
import os
try:
    import openai
except Exception:
    openai = None

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
async def generate_test(req: TestGenerationRequest, debug: bool = False):
    """Generate AI-powered test questions on a given topic."""
    # Try OpenAI if configured, otherwise use the local generator
    openai_key = os.getenv("OPENAI_API_KEY")
    difficulty = (req.difficulty or "Mixed").lower()
    num_questions = max(1, int(req.num_questions or 10))

    def local_generate(topic, difficulty_mode, n):
        questions = []

        def make_mcq(i, text, diff):
            correct_idx = i % 4
            options = [
                {"text": f"Option A for question {i+1}", "isCorrect": correct_idx == 0},
                {"text": f"Option B for question {i+1}", "isCorrect": correct_idx == 1},
                {"text": f"Option C for question {i+1}", "isCorrect": correct_idx == 2},
                {"text": f"Option D for question {i+1}", "isCorrect": correct_idx == 3},
            ]
            return {
                "id": i + 1,
                "text": text,
                "type": "mcq",
                "options": options,
                "correctAnswer": str(correct_idx),
                "difficulty": diff,
                "topic": topic,
                "marks": 4,
            }

        # Distribution handling
        if difficulty_mode in ("easy", "medium", "advanced"):
            for i in range(n):
                qtext = f"Q{i+1}: {difficulty_mode.title()} level question about {topic}."
                questions.append(make_mcq(i, qtext, difficulty_mode.title()))
        else:
            # mixed or scholarship: 40% easy, 40% medium, 20% hard
            easy_count = max(1, int(n * 0.4))
            med_count = max(1, int(n * 0.4))
            hard_count = max(0, n - easy_count - med_count)
            idx = 0
            for i in range(easy_count):
                questions.append(make_mcq(idx, f"Q{idx+1}: Easy question on {topic}", "Easy"))
                idx += 1
            for i in range(med_count):
                questions.append(make_mcq(idx, f"Q{idx+1}: Medium question on {topic}", "Medium"))
                idx += 1
            for i in range(hard_count):
                questions.append(make_mcq(idx, f"Q{idx+1}: Advanced question on {topic}", "Hard"))
                idx += 1

            # Add a few general aptitude/judgement questions to help scholarship decisions
            general_count = min(5, max(3, int(num_questions * 0.15)))
            general_templates = [
                "Logical reasoning: Which option completes the series?",
                "Numerical aptitude: Find the missing number.",
                "Verbal ability: Choose the word most similar in meaning.",
                "General knowledge: Which of the following is true about basic science?",
                "Problem solving: Which step is best to start solving the problem?",
            ]
            for g in range(general_count):
                if idx >= n:
                    # append but keep unique ids
                    qid = idx + 1
                else:
                    qid = idx + 1
                questions.append(make_mcq(idx, f"Q{qid}: {general_templates[g % len(general_templates)]} {topic}", "General"))
                idx += 1

        # Trim to requested size
        return questions[:n]

    def realistic_physics_generate(topic, n):
        # Simple deterministic physics/kinematics question generator
        qs = []
        import math
        for i in range(n):
            qid = i + 1
            if i % 3 == 0:
                # acceleration from rest
                v = random.choice([10, 15, 20, 30])
                t = random.choice([2, 3, 4, 5])
                a = round(v / t, 2)
                text = f"A body starts from rest and reaches {v} m/s in {t} s. What is its acceleration (m/s^2)?"
                options = [
                    {"text": f"{a} m/s^2", "isCorrect": True},
                    {"text": f"{round(a*0.5,2)} m/s^2", "isCorrect": False},
                    {"text": f"{round(a*2,2)} m/s^2", "isCorrect": False},
                    {"text": f"{round(a+1,2)} m/s^2", "isCorrect": False},
                ]
                difficulty = "Easy"
            elif i % 3 == 1:
                # distance covered under constant acceleration
                u = random.choice([0, 2, 3])
                a = random.choice([2, 3, 4])
                t = random.choice([2, 3, 4])
                s = round(u * t + 0.5 * a * t * t, 2)
                text = f"A particle moves with initial velocity {u} m/s and acceleration {a} m/s^2 for {t} s. What distance does it cover?"
                options = [
                    {"text": f"{s} m", "isCorrect": True},
                    {"text": f"{round(s*0.5,2)} m", "isCorrect": False},
                    {"text": f"{round(s+5,2)} m", "isCorrect": False},
                    {"text": f"{round(s-2,2)} m", "isCorrect": False},
                ]
                difficulty = "Medium"
            else:
                # relative speed / collision simple
                u1 = random.choice([5, 10, 12])
                u2 = random.choice([2, 4, 6])
                rel = abs(u1 - u2)
                text = f"Two cars move in the same direction with speeds {u1} m/s and {u2} m/s. What is their relative speed?"
                options = [
                    {"text": f"{rel} m/s", "isCorrect": True},
                    {"text": f"{u1+u2} m/s", "isCorrect": False},
                    {"text": f"{max(u1,u2)} m/s", "isCorrect": False},
                    {"text": f"{min(u1,u2)} m/s", "isCorrect": False},
                ]
                difficulty = "Easy"

            qs.append({
                "id": qid,
                "text": text,
                "type": "mcq",
                "options": options,
                "difficulty": difficulty,
                "topic": topic,
                "marks": 4,
            })
        return qs

    # If OpenAI key is provided, attempt to use it for richer generation
    ai_debug = None
    if openai_key and openai is not None:
        try:
            openai.api_key = openai_key
            model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            # Stronger prompt with example to encourage high-quality, exam-style questions
            # Require concrete option texts (no placeholders) and at least two numeric calculation questions when topic is quantitative.
            prompt = (
                f"You are an expert exam question writer. Generate {num_questions} high-quality multiple-choice questions about '{req.topic}'. "
                "Mix difficulties according to the requested mode (Easy/Medium/Hard or mixed). Include about 40% Easy, 40% Medium, 20% Hard for mixed. "
                "Each question must be realistic, non-trivial, and appropriate for competitive exam preparation — include calculations or specific facts where relevant. "
                "Return ONLY valid JSON that exactly matches this schema:\n"
                "{\n  \"title\": string,\n  \"questions\": [\n    {\n      \"id\": number,\n      \"text\": string,\n      \"type\": \"mcq\",\n      \"options\": [ { \"text\": string, \"isCorrect\": boolean } , ... 4 items ],\n      \"difficulty\": \"Easy\"|\"Medium\"|\"Hard\",\n      \"marks\": number,\n      \"topic\": string,\n      \"explanation\": string (optional)\n    }\n  ],\n  \"duration\": number,\n  \"totalMarks\": number\n}\n"
                "Example question object:\n{ \"id\":1, \"text\":\"A 2 kg block is pushed with 4 N of force; what is acceleration?\", \"type\":\"mcq\", \"options\": [ { \"text\":\"1 m/s^2\", \"isCorrect\": true }, { \"text\":\"2 m/s^2\", \"isCorrect\": false }, { \"text\":\"0.5 m/s^2\", \"isCorrect\": false }, { \"text\":\"4 m/s^2\", \"isCorrect\": false } ], \"difficulty\":\"Easy\", \"marks\":4, \"topic\":\"Physics Mechanics\", \"explanation\":\"Use F=ma...\" }\n"
                "\nImportant constraints:\n- Do NOT use placeholder option texts like 'Option A for question x'.\n- Provide realistic option texts (values, phrases, equations).\n- For quantitative topics include at least 2 numeric calculation questions with units and show correct numeric options.\n- Keep JSON strictly parseable (no surrounding markdown).\n"
            )

            # Use Gemini / Responses API when model indicates Gemini (newer OpenAI models use Responses)
            content = None
            try:
                if "gemini" in model_name.lower():
                    # Prefer using the installed client Responses API when available
                    if hasattr(openai, "Responses"):
                        resp = openai.Responses.create(
                            model=model_name,
                            input=prompt,
                            max_output_tokens=1200,
                            temperature=0.7,
                        )
                        # Try common response fields
                        if hasattr(resp, "output_text") and resp.output_text:
                            content = resp.output_text
                        else:
                            out = getattr(resp, "output", None)
                            if out and len(out) > 0:
                                parts = out[0].get("content", []) if isinstance(out[0], dict) else []
                                if parts:
                                    for p in parts:
                                        if isinstance(p, dict) and p.get("type") == "output_text":
                                            content = p.get("text")
                                            break
                    else:
                        # Fallback to direct HTTP call to OpenAI Responses endpoint (helps when openai client is older)
                        try:
                            import requests
                            headers = {
                                "Authorization": f"Bearer {openai_key}",
                                "Content-Type": "application/json",
                            }
                            body = {
                                "model": model_name,
                                "input": prompt,
                                "max_output_tokens": 1200,
                                "temperature": 0.7,
                            }
                            r = requests.post("https://api.openai.com/v1/responses", headers=headers, json=body, timeout=30)
                            if r.status_code == 200:
                                jr = r.json()
                                # try output_text first
                                if jr.get("output_text"):
                                    content = jr.get("output_text")
                                else:
                                    out = jr.get("output", [])
                                    if out and isinstance(out, list) and len(out) > 0:
                                        parts = out[0].get("content", []) if isinstance(out[0], dict) else []
                                        for p in parts:
                                            if isinstance(p, dict) and p.get("type") == "output_text":
                                                content = p.get("text")
                                                break
                        except Exception:
                            content = None
                else:
                    # Older ChatCompletion style (for non-Gemini models)
                    resp = openai.ChatCompletion.create(
                        model=model_name,
                        messages=[{"role": "user", "content": prompt}],
                        max_tokens=1200,
                        temperature=0.7,
                    )
                    content = resp.choices[0].message.content
            except Exception:
                content = None

            # Try to parse JSON; if it fails fall back to local generator
            import json
            if content:
                try:
                    parsed = json.loads(content)
                    # Validate parsed content: detect placeholder option texts
                    bad_placeholder = False
                    for q in parsed.get("questions", []) if isinstance(parsed, dict) else []:
                        for opt in q.get("options", []):
                            txt = opt.get("text", "") if isinstance(opt, dict) else str(opt)
                            if isinstance(txt, str) and ("Option A for question" in txt or txt.strip().startswith("Option ")):
                                bad_placeholder = True
                                break
                        if bad_placeholder:
                            break
                    if bad_placeholder:
                        ai_debug = "LLM returned placeholder option texts; using deterministic fallback."
                    else:
                        # For quantitative topics prefer deterministic physics generator to ensure numeric correctness
                        if req.topic and any(k in req.topic.lower() for k in ["physics", "mechanics", "kinematics", "motion", "dynamics"]):
                            ai_debug = "Skipping LLM output for physics topic; using deterministic physics generator."
                        else:
                            return {"success": True, "test": parsed}
                except Exception as e:
                    ai_debug = f"JSON parse error: {str(e)}"
                    # Allow fallback below
                    pass
        except Exception as e:
            ai_debug = str(e)
        except Exception:
            # OpenAI call failed — fall back to local generator
            pass

    # Local deterministic generator — prefer realistic physics generator for quantitative topics
    if req.topic and any(k in req.topic.lower() for k in ["physics", "mechanics", "kinematics", "motion", "dynamics"]):
        questions = realistic_physics_generate(req.topic, num_questions)
    else:
        questions = local_generate(req.topic, difficulty, num_questions)

    test_obj = {
        "title": f"AI Test: {req.topic}",
        "questions": questions,
        "duration": num_questions * 3,
        "totalMarks": num_questions * 4,
        "isAIGenerated": True,
    }
    resp = {"success": True, "test": test_obj}
    if debug and ai_debug:
        resp["aiDebug"] = ai_debug
    return resp

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
