import os
from typing import Dict
import httpx
from dotenv import load_dotenv
from services.comment_moderator import moderate_comment as local_moderation

load_dotenv()

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
MODERATION_MODEL = os.getenv('OPENAI_MODERATION_MODEL', 'omni-moderation-latest')
SPAM_TRIGGERS = [
    'buy now', 'click here', 'free access', 'visit', 'cheap', 'discount',
    'limited time', 'earn money', 'make money', 'subscribe', 'winner',
    'congratulations', 'work from home', 'act now', 'risk free', 'offer expires',
]


def _score_spam(text: str) -> float:
    lower_text = text.lower()
    matches = [phrase for phrase in SPAM_TRIGGERS if phrase in lower_text]
    if not matches:
        return 0.0
    return min(1.0, 0.15 * len(matches) + 0.1)


def moderate_comment(text: str) -> Dict:
    """Run spam and toxicity detection using OpenAI moderation API.

    Returns:
        {
            "flagged": bool,
            "is_spam": bool,
            "is_toxic": bool,
            "toxicity_score": float,
            "spam_score": float,
        }
    """
    if not text or not isinstance(text, str):
        return {"flagged": False, "is_spam": False, "is_toxic": False, "toxicity_score": 0.0, "spam_score": 0.0}

    is_spam = False
    spam_score = _score_spam(text)
    if spam_score > 0.5:
        is_spam = True

    local = local_moderation(text)
    local_is_toxic = bool(local.get('isToxic'))
    local_is_negative_review = bool(local.get('isNegativeReview'))

    headers = {
        'Content-Type': 'application/json',
    }
    if OPENAI_API_KEY:
        headers['Authorization'] = f'Bearer {OPENAI_API_KEY}'

    payload = {
        'model': MODERATION_MODEL,
        'input': text[:1000],
    }

    is_toxic = local_is_toxic
    is_negative_review = local_is_negative_review
    toxicity_score = 1.0 if local_is_toxic else 0.0

    if OPENAI_API_KEY:
        try:
            response = httpx.post('https://api.openai.com/v1/moderations', json=payload, headers=headers, timeout=20)
            response.raise_for_status()
            data = response.json()
            results = data.get('results') or []
            if results:
                result = results[0]
                api_toxic = bool(result.get('flagged', False))
                categories = result.get('categories', {}) or {}
                category_scores = result.get('category_scores', {}) or {}
                api_toxicity_score = max(
                    float(category_scores.get(key, 0.0) or 0.0)
                    for key in ['sexual', 'sexual/minors', 'violence', 'violence/graphic', 'hate', 'hate/threatening', 'self-harm', 'harassment']
                )
                api_toxic = api_toxic or any(categories.get(key) for key in categories)
                is_toxic = is_toxic or api_toxic
                toxicity_score = max(toxicity_score, api_toxicity_score)
            else:
                is_toxic = is_toxic or False
        except Exception:
            # keep local toxicity result if OpenAI fails
            is_toxic = is_toxic or local_is_toxic
            toxicity_score = max(toxicity_score, 1.0 if local_is_toxic else 0.0)

    is_reviewable = bool(is_spam or is_toxic or is_negative_review)
    return {
        'flagged': is_reviewable,
        'is_spam': is_spam,
        'is_toxic': is_toxic,
        'is_negative_review': is_negative_review,
        'toxicity_score': float(toxicity_score),
        'spam_score': float(spam_score),
    }
