"""Recommendation engine — generates personalized learning recommendations."""


def get_recommendations(user_id: str):
    """Get AI-powered recommendations for a student."""
    # In production, this would analyze user's watch history, test scores, and weak topics
    return [
        {"type": "video", "title": "Revise Electromagnetic Induction", "reason": "Weak topic detected from recent test", "priority": "high"},
        {"type": "test", "title": "Practice Rotational Mechanics", "reason": "Low score (45%) in recent test", "priority": "high"},
        {"type": "notes", "title": "Review Thermodynamics Notes", "reason": "Not reviewed in 7 days", "priority": "medium"},
        {"type": "course", "title": "Advanced Problem Solving Techniques", "reason": "Based on your progress level", "priority": "medium"},
        {"type": "flashcard", "title": "Organic Chemistry Reactions", "reason": "Spaced repetition due today", "priority": "low"},
        {"type": "pyq", "title": "JEE 2024 Physics Questions", "reason": "Match your current preparation level", "priority": "low"},
    ]
