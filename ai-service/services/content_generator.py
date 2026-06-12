"""Content generation service — generates notes, quizzes, summaries, and flashcards."""


def generate_content(topic: str, content_type: str = "notes", detail_level: str = "detailed"):
    """Generate educational content based on type."""

    generators = {
        "notes": _generate_notes,
        "quiz": _generate_quiz,
        "summary": _generate_summary,
        "flashcards": _generate_flashcards,
    }

    generator = generators.get(content_type, _generate_notes)
    return generator(topic, detail_level)


def _generate_notes(topic, detail_level):
    return f"""# {topic}

## Introduction
{topic} is a fundamental concept that forms the backbone of understanding in this subject area. It is extensively tested in competitive exams like JEE and NEET.

## Key Concepts

### 1. Definition & Basics
- {topic} can be defined as a systematic study of the underlying principles
- It was first introduced and developed through various experiments and theoretical work
- The concept has wide applications in both theoretical and applied sciences

### 2. Important Formulas
- **Formula 1:** The primary equation governing {topic}
- **Formula 2:** The derived relationship for special cases
- **Formula 3:** The general form applicable to all scenarios

### 3. Important Properties
- Property 1: Conservation principles apply
- Property 2: Symmetry considerations
- Property 3: Boundary conditions

## Solved Examples

**Example 1:** A standard textbook problem involving {topic}
- Given: Standard parameters
- To Find: The required quantity
- Solution: Apply the relevant formula step by step

## Common Mistakes to Avoid
1. Confusing the sign conventions
2. Forgetting to check units and dimensions
3. Not considering special/limiting cases

## Summary
{topic} is a crucial topic for exam preparation. Focus on understanding the derivations and practice numerical problems regularly.

## Practice Questions
1. Derive the fundamental equation for {topic}
2. Solve a numerical problem using the key formula
3. Compare and contrast with related concepts
"""


def _generate_quiz(topic, detail_level):
    return [
        {"question": f"What is the fundamental principle behind {topic}?", "options": ["Principle A", "Principle B", "Principle C", "Principle D"], "correct": 0, "explanation": f"The fundamental principle of {topic} is Principle A."},
        {"question": f"Which formula is most relevant to {topic}?", "options": ["Formula X", "Formula Y", "Formula Z", "Formula W"], "correct": 1, "explanation": "Formula Y directly relates to this concept."},
        {"question": f"In which year was {topic} first discovered/formulated?", "options": ["Before 1900", "1900-1950", "1950-2000", "After 2000"], "correct": 0, "explanation": "Most fundamental concepts were established before 1900."},
        {"question": f"What is the SI unit associated with {topic}?", "options": ["Unit A", "Unit B", "Unit C", "Dimensionless"], "correct": 2, "explanation": "The SI unit for this quantity is Unit C."},
        {"question": f"Which scientist is most associated with {topic}?", "options": ["Scientist 1", "Scientist 2", "Scientist 3", "Scientist 4"], "correct": 0, "explanation": "Scientist 1 made the primary contributions to this field."},
    ]


def _generate_summary(topic, detail_level):
    return f"""**{topic} — Quick Revision Summary**

📌 **Key Points:**
• Definition: {topic} deals with the fundamental principles of this subject area
• Main formula: Apply the primary equation for standard problems
• Special cases: Remember the boundary conditions and limiting cases
• Units: Always verify dimensional consistency

📝 **Important for Exams:**
• This topic typically carries 8-12 marks in JEE/NEET
• Focus on numerical problem solving
• Understand the graphical representation
• Practice previous year questions (3-4 questions appear every year)

⚡ **Quick Formulas:**
1. Primary equation of {topic}
2. Derived formula for special cases
3. Relation with other concepts

🎯 **Exam Tips:**
• Start with understanding the derivation
• Practice 10-15 numericals daily
• Time yourself while solving
"""


def _generate_flashcards(topic, detail_level):
    return [
        {"front": f"Define {topic}", "back": f"{topic} is a fundamental concept dealing with the systematic study of underlying principles in this subject."},
        {"front": f"Key formula for {topic}", "back": "The primary equation involves the relationship between key variables."},
        {"front": f"SI Unit of {topic}", "back": "The standard SI unit depends on the specific quantity being measured."},
        {"front": f"Who discovered {topic}?", "back": "The concept was developed by multiple scientists over centuries of research."},
        {"front": f"Applications of {topic}", "back": "Used in engineering, technology, research, and everyday phenomena."},
        {"front": f"Common exam questions on {topic}", "back": "Numerical problems, derivations, and conceptual MCQs are frequently tested."},
        {"front": f"Dimensional formula for {topic}", "back": "Can be derived from the fundamental dimensions [M], [L], [T]."},
        {"front": f"Graph for {topic}", "back": "The typical graph shows a characteristic curve based on the relationship between variables."},
    ]
