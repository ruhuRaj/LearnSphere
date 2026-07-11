import os
import sys
sys.path.insert(0, '.')
from routers.ai_router import call_gemini, extract_json_payload, normalize_generated_test

prompt = (
    "Create 10 high-quality multiple-choice questions based on this prompt: Create 10 questions on topic Integration for Class 12 NCERT. "
    "Topic context: Create 10 questions on topic Integration for Class 12 NCERT. Difficulty: Medium. "
    "Make the questions educational, specific, and realistic for students. Use content-rich question stems and provide four meaningful options for each question. "
    "Return ONLY valid JSON in this exact shape:\n"
    "{\"title\": \"Test title\", \"questions\": [{\"text\": \"Question stem\", \"options\": [\"Option 1\", \"Option 2\", \"Option 3\", \"Option 4\"], \"correctAnswer\": 1, \"difficulty\": \"Medium\", \"marks\": 4, \"topic\": \"Topic\"}]}\n"
    "Rules: no markdown, no extra text, exactly four options per question, and correctAnswer must be the index of the correct option."
)

response = call_gemini(prompt)
print('response_len', len(response or ''))
print(response[:4000] if response else '<none>')
parsed = extract_json_payload(response)
print('parsed_type', type(parsed).__name__)
print(parsed)
if isinstance(parsed, dict):
    normalized = normalize_generated_test(parsed, 'Integration', 10, 'Medium')
    print('first_question', normalized['questions'][0])
