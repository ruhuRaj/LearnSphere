"""Test generation service — generates AI-powered test questions."""

import random

TOPIC_TEMPLATES = {
    "Physics": [
        "A block of mass m is placed on a frictionless surface. {topic} principles suggest that:",
        "In the context of {topic}, which statement is correct?",
        "Calculate the value when {topic} is applied to a system with given parameters:",
        "The dimensional formula related to {topic} is:",
        "Which law/principle directly relates to {topic}?",
    ],
    "Chemistry": [
        "The IUPAC name for the compound formed in {topic} reaction is:",
        "In {topic}, the hybridization state of the central atom is:",
        "The product formed when {topic} principles are applied:",
        "Which reagent is used in {topic}?",
        "The bond order in {topic} context is:",
    ],
    "Mathematics": [
        "Evaluate the integral/derivative related to {topic}:",
        "The general solution of {topic} equation is:",
        "If {topic} conditions are satisfied, then the value of x is:",
        "The area/volume calculated using {topic} is:",
        "The limit as x approaches infinity for {topic} expression:",
    ],
}


def generate_questions(topic: str, difficulty: str, num_questions: int, category: str):
    """Generate test questions (placeholder — would use AI in production)."""
    subject = "Physics"  # default
    if any(kw in topic.lower() for kw in ["chem", "organic", "inorganic", "reaction"]):
        subject = "Chemistry"
    elif any(kw in topic.lower() for kw in ["math", "calcul", "integral", "algebra"]):
        subject = "Mathematics"

    templates = TOPIC_TEMPLATES.get(subject, TOPIC_TEMPLATES["Physics"])
    questions = []

    for i in range(min(num_questions, 20)):
        template = templates[i % len(templates)]
        correct_idx = random.randint(0, 3)
        options = []
        for j in range(4):
            options.append({
                "text": f"Option {'ABCD'[j]} — {'Correct' if j == correct_idx else 'Distractor'} for Q{i+1}",
                "isCorrect": j == correct_idx,
            })

        questions.append({
            "id": i + 1,
            "text": f"Q{i+1}: {template.format(topic=topic)}",
            "type": "mcq",
            "options": options,
            "difficulty": difficulty,
            "topic": topic,
            "explanation": f"The correct answer is Option {'ABCD'[correct_idx]}. This relates to the fundamental principles of {topic} in {subject}.",
            "marks": 4,
            "negativeMarks": 1,
        })

    return {
        "title": f"AI Generated Test: {topic} ({difficulty})",
        "questions": questions,
        "duration": num_questions * 3,
        "totalMarks": num_questions * 4,
        "isAIGenerated": True,
        "category": category,
    }
