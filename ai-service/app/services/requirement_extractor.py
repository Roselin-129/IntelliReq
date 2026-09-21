"""
Phase 3.3 — Requirement Extractor
Detects requirement sentences from raw SRS text using modal/indicator keywords.
All logic is deterministic and rule-based. NOT AI-generated.
"""

import re
import spacy
from typing import List

from app.schemas.requirement import ExtractedRequirement, ExtractionResponse


# Modal verbs / phrases that indicate a requirement
REQUIREMENT_INDICATORS = [
    "is required to",
    "are required to",
    "needs to",
    "need to",
    "has to",
    "have to",
    "shall",
    "must",
    "should",
    "will",
    "may",
]

STRONG_INDICATORS = {
    "shall", "must", "is required to", "are required to",
    "has to", "have to", "needs to", "need to"
}
WEAK_INDICATORS = {"should", "will", "may"}


def _find_indicator(sentence_lower: str) -> str | None:
    """Return the first matching requirement indicator found in the sentence."""
    for phrase in REQUIREMENT_INDICATORS:
        pattern = r"\b" + re.escape(phrase) + r"\b"
        if re.search(pattern, sentence_lower):
            return phrase
    return None


def _confidence(indicator: str, sentence: str) -> float:
    """
    Deterministic confidence score (0.0–1.0).
    Based on indicator strength and sentence length.
    NOT AI-generated.
    """
    base = 0.90 if indicator in STRONG_INDICATORS else 0.65
    word_count = len(sentence.split())
    if 5 <= word_count <= 30:
        base = min(base + 0.05, 0.99)
    elif word_count < 4:
        base = max(base - 0.15, 0.40)
    return round(base, 2)


class RequirementExtractor:

    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")

    def extract(self, text: str) -> ExtractionResponse:
        if not text or not text.strip():
            raise ValueError("Text cannot be empty.")

        doc = self.nlp(text)
        sentences = [s.text.strip() for s in doc.sents if s.text.strip()]

        requirements: List[ExtractedRequirement] = []
        counter = 1

        for sentence in sentences:
            indicator = _find_indicator(sentence.lower())
            if indicator is None:
                continue

            code = f"REQ-{counter:03d}"
            conf = _confidence(indicator, sentence)

            requirements.append(ExtractedRequirement(
                requirement_code=code,
                text=sentence,
                source_sentence=sentence,
                confidence=conf,
                indicator=indicator,
            ))
            counter += 1

        return ExtractionResponse(
            requirement_count=len(requirements),
            requirements=requirements,
        )
