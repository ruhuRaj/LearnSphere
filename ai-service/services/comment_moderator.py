"""Comment moderation service — detects spam, toxicity, and sentiment."""


TOXIC_WORDS = {"hate", "stupid", "idiot", "spam", "scam", "kill", "die", "dumb",
               "loser", "shut up", "trash", "worthless", "racist", "abuse"}

POSITIVE_WORDS = {"great", "good", "amazing", "thank", "helpful", "excellent",
                  "wonderful", "awesome", "love", "best", "perfect", "brilliant",
                  "fantastic", "superb", "outstanding"}

NEGATIVE_WORDS = {"bad", "terrible", "worst", "hate", "boring", "useless",
                  "waste", "poor", "horrible", "awful", "pathetic"}


def moderate_comment(text: str):
    """Analyze a comment for toxicity, spam, and sentiment."""
    text_lower = text.lower()
    words = set(text_lower.split())

    # Toxicity check
    toxic_matches = words.intersection(TOXIC_WORDS)
    is_toxic = len(toxic_matches) > 0

    # Spam check
    is_spam = (
        len(text) < 3 or
        text.count("http") > 2 or
        text.count("www.") > 1 or
        len(set(text_lower.split())) < len(text_lower.split()) * 0.3  # too many repeated words
    )

    # Sentiment analysis
    positive_count = len(words.intersection(POSITIVE_WORDS))
    negative_count = len(words.intersection(NEGATIVE_WORDS))

    if positive_count > negative_count:
        sentiment = "positive"
    elif negative_count > positive_count or is_toxic:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    # Confidence
    total_signal = positive_count + negative_count + (2 if is_toxic else 0)
    confidence = min(0.95, 0.6 + total_signal * 0.08)

    return {
        "isApproved": not is_toxic and not is_spam,
        "isToxic": is_toxic,
        "isSpam": is_spam,
        "sentiment": sentiment,
        "confidence": round(confidence, 2),
        "reason": (
            f"toxic content: {', '.join(toxic_matches)}" if is_toxic
            else "spam detected" if is_spam
            else "approved"
        ),
    }
