import unittest

from routers.ai_router import extract_gemini_text, build_fallback_response, normalize_generated_test, build_generation_prompt, parse_plaintext_questions


class GeminiResponseParsingTests(unittest.TestCase):
    def test_extracts_text_from_standard_gemini_payload(self):
        payload = {
            "candidates": [
                {
                    "content": {
                        "parts": [{"text": "Hello from Gemini"}]
                    }
                }
            ]
        }
        self.assertEqual(extract_gemini_text(payload), "Hello from Gemini")

    def test_returns_empty_for_missing_text(self):
        payload = {
            "candidates": [
                {
                    "content": {
                        "parts": [{"inlineData": {}}]
                    }
                }
            ]
        }
        self.assertEqual(extract_gemini_text(payload), "")

    def test_deeper_followup_uses_detailed_explanation(self):
        response = build_fallback_response("explain more deeply", "General")
        self.assertIn("force", response.lower())
        self.assertIn("acceleration", response.lower())
        self.assertIn("f = ma", response.lower())

    def test_build_generation_prompt_uses_user_prompt_directly(self):
        prompt = build_generation_prompt("Create 10 questions on integration for class 12", "Integration", 10, "Medium")
        self.assertIn("Create 10 questions on integration for class 12", prompt)
        self.assertIn("Create exactly 10 multiple-choice questions", prompt)

    def test_parses_markdown_plaintext_questions_from_gemini(self):
        response = """Here are 10 multiple-choice questions on Integration, suitable for Class 12 NCERT.

**1. Basic Integration**
Evaluate $\\int (x^3 + \\sec^2 x) dx$.
A) $\\frac{x^4}{4} + \\tan x + C$
B) $3x^2 + 2 \\tan x + C$
C) $x^4 + \\tan x + C$
D) $\\frac{x^4}{4} + \\tan^2 x + C$"""

        parsed = parse_plaintext_questions(response, "Integration", 1, "Medium")

        self.assertTrue(parsed)
        self.assertIn("Evaluate", parsed[0]["text"])
        self.assertEqual(len(parsed[0]["options"]), 4)

    def test_normalizes_questions_with_alternative_field_names(self):
        parsed = {
            "questions": [
                {
                    "stem": "What is the capital of France?",
                    "options": [
                        {"optionText": "Berlin"},
                        {"optionText": "Paris"},
                        {"optionText": "Madrid"},
                        {"optionText": "Rome"},
                    ],
                    "correctOption": 1,
                }
            ]
        }

        normalized = normalize_generated_test(parsed, "Geography", 1, "Medium")

        self.assertEqual(normalized["questions"][0]["text"], "What is the capital of France?")
        self.assertEqual([option["text"] for option in normalized["questions"][0]["options"]], ["Berlin", "Paris", "Madrid", "Rome"])
        self.assertTrue(normalized["questions"][0]["options"][1]["isCorrect"])


if __name__ == "__main__":
    unittest.main()
