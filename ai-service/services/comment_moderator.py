"""Comment moderation service — detects spam, toxicity, and sentiment."""


TOXIC_WORDS = {
    "hate", "stupid", "idiot", "spam", "scam", "kill", "die", "dumb",
    "loser", "shut up", "trash", "worthless", "racist", "abuse",
    "fuck", "fucking", "bitch", "bastard", "asshole", "damn", "fuck you",
    "shit", "cunt", "slut", "whore", "dick",
    # common Hindi abusive terms
    "chutiya", "behenchod", "madharchod", "randi", "bhosdike", "madarchod", "sala", "salaam", "kutte",
    "bhenchod", "madar", "suar", "chutiye", "saale", "pagal",
}

POSITIVE_WORDS = {
    "great", "good", "amazing", "thank", "helpful", "excellent",
    "wonderful", "awesome", "love", "best", "perfect", "brilliant",
    "fantastic", "superb", "outstanding",
}

NEGATIVE_WORDS = {
    "bad", "terrible", "worst", "hate", "boring", "useless",
    "waste", "poor", "horrible", "awful", "pathetic", "link",
}

NEGATIVE_REVIEW_TRIGGERS = {
    "do not buy", "dont buy", "don't buy", "do n't buy", "never buy",
    "avoid this course", "not worth", "waste of money", "total waste",
    "ripoff", "rip off", "scam", "not recommended", "never recommend",
    "useless course", "poor course", "terrible course", "not worth it", "do not enroll",
}


def moderate_comment(text: str):
    """Analyze a comment for toxicity, spam, and sentiment."""
    text_lower = text.lower()
    words = set(text_lower.split())

    # Toxicity check
    toxic_matches = {word for word in TOXIC_WORDS if word in text_lower}
    is_toxic = bool(toxic_matches)

    # Spam check
    is_spam = (
        len(text.strip()) < 3 or
        text_lower.count("http") > 1 or
        text_lower.count("www.") > 1 or
        text_lower.count("click here") > 0 or
        text_lower.count("buy now") > 0 or
        text_lower.count("free") > 1 or
        len(set(text_lower.split())) < len(text_lower.split()) * 0.3  # too many repeated words
    )

    # Negative review detection
    negative_review_matches = [phrase for phrase in NEGATIVE_REVIEW_TRIGGERS if phrase in text_lower]
    is_negative_review = bool(negative_review_matches)

    # Sentiment analysis
    positive_count = len(words.intersection(POSITIVE_WORDS))
    negative_count = len(words.intersection(NEGATIVE_WORDS))

    if positive_count > negative_count and not is_negative_review:
        sentiment = "positive"
    elif negative_count > positive_count or is_toxic or is_negative_review:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    # Confidence
    total_signal = positive_count + negative_count + (2 if is_toxic else 0) + (1 if is_negative_review else 0)
    confidence = min(0.95, 0.6 + total_signal * 0.08)

    needs_review = is_toxic or is_spam or is_negative_review

    return {
        "isApproved": not needs_review,
        "isToxic": is_toxic,
        "isSpam": is_spam,
        "sentiment": sentiment,
        "isNegativeReview": is_negative_review,
        "negativeReviewMatches": negative_review_matches,
        "confidence": round(confidence, 2),
        "reason": (
            f"toxic content: {', '.join(toxic_matches)}" if is_toxic
            else "spam detected" if is_spam
            else "negative review detected" if is_negative_review
            else "approved"
        ),
    }
