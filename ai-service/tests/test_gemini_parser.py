import unittest

from routers.ai_router import extract_gemini_text, build_fallback_response


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


if __name__ == "__main__":
    unittest.main()
