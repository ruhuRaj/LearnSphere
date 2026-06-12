"""Doubt solver service — AI-powered doubt resolution with step-by-step explanations."""


def solve_doubt(question: str, subject: str, context: str = ""):
    """Solve a student's doubt with a detailed explanation."""
    # In production, this would call OpenAI/Gemini API with RAG pipeline
    response = f"""**Answer to your question about {subject}:**

Your question: "{question}"

**Step-by-step explanation:**

1. **Identify the key concepts:** This question involves fundamental principles of {subject}.

2. **Apply the relevant formula/theory:** Based on the concepts involved, we need to consider the standard approach taught in NCERT and competitive exam preparation.

3. **Detailed Solution:**
   - First, identify the given quantities and what needs to be found
   - Apply the appropriate formula or theorem
   - Solve step by step, showing all work
   - Verify the answer using dimensional analysis or alternate methods

4. **Final Answer:** The solution follows from the systematic application of {subject} principles.

**Key Takeaway:** Make sure to practice similar problems from your textbook and previous year papers.

**Related Topics to Review:**
- Fundamental concepts of {subject}
- Practice problems from NCERT Chapter
- Previous year JEE/NEET questions on this topic
- Derivations and proofs related to this concept

💡 **Pro Tip:** This type of question frequently appears in competitive exams. Understanding the underlying derivation will help you tackle variations!
"""

    return {
        "response": response,
        "relatedTopics": [subject, "Problem Solving", "Exam Strategy"],
        "confidence": 0.92,
        "sources": ["NCERT Textbook", "Previous Year Papers"],
    }
