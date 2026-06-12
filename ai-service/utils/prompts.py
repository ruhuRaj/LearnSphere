"""Prompt templates for AI service."""

TEST_GENERATION_PROMPT = """Generate {num_questions} multiple choice questions on the topic "{topic}" for {category} exam preparation.
Difficulty level: {difficulty}

For each question, provide:
1. Question text
2. Four options (A, B, C, D)
3. The correct answer
4. A brief explanation

Format as JSON array."""

DOUBT_SOLVING_PROMPT = """You are an expert {subject} tutor for Indian competitive exams (JEE/NEET).

Student's question: {question}

Additional context: {context}

Provide a detailed, step-by-step explanation. Include:
1. Key concepts involved
2. Relevant formulas or theories
3. Step-by-step solution
4. Key takeaways
5. Related topics to review

Use clear formatting with headers and bullet points."""

CONTENT_GENERATION_PROMPT = """Generate {type} on the topic "{topic}" for competitive exam preparation.

Detail level: {detail_level}

If notes: Include introduction, key points, formulas, examples, and summary.
If quiz: Generate 5 quick-fire questions with answers.
If summary: Create a concise revision-ready summary.
If flashcards: Create 10 front/back flashcard pairs."""

COMMENT_MODERATION_PROMPT = """Analyze the following comment for:
1. Toxicity (hate speech, bullying, harassment)
2. Spam (promotional, repetitive, irrelevant)
3. Sentiment (positive, neutral, negative)

Comment: "{text}"

Return JSON with: isApproved, isToxic, isSpam, sentiment, confidence, reason"""

STUDY_PLAN_PROMPT = """Create a {weeks}-week personalized study plan for {target_exam} preparation.
Subjects: {subjects}
Available hours per day: {hours_per_day}

For each week, provide:
1. Primary focus subject
2. Daily schedule breakdown
3. Specific topics to cover
4. Practice activities
5. Weekly milestone/goal"""
