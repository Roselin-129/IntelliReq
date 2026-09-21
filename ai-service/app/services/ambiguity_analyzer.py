"""
Phase 3.6 — Ambiguity Analyzer
Detects potential ambiguities in a requirement using deterministic rules.
Scores are NOT AI-generated.
"""

import re
from typing import List, Optional

from app.schemas.requirement import AmbiguityAnalysisResult, AmbiguityIndicator


VAGUE_WORDS = [
    ("quickly", "Subjective speed — no measurable time constraint"),
    ("easily", "Subjective ease — unmeasurable"),
    ("user-friendly", "Subjective usability — no objective criteria"),
    ("appropriate", "Unclear what 'appropriate' means without context"),
    ("soon", "No specific time constraint"),
    ("adequate", "No measurable standard for 'adequate'"),
    ("efficient", "No measurable definition of efficiency"),
    ("effective", "No measurable definition of effectiveness"),
    ("simple", "Subjective complexity judgment"),
    ("reasonable", "No standard for what is 'reasonable'"),
    ("flexible", "No criteria for flexibility"),
    ("robust", "Vague quality attribute without measurable definition"),
    ("intuitive", "Subjective usability term"),
    ("etc.", "Incomplete — leaves requirements open-ended"),
    ("and so on", "Incomplete — open-ended list"),
    ("various", "Unclear scope — how many / which ones?"),
    ("some", "Unclear quantity"),
    ("as needed", "No defined trigger or condition"),
    ("if necessary", "Unclear when this is necessary"),
    ("where applicable", "Undefined applicability scope"),
]

UNCLEAR_PRONOUNS = [
    ("it ", "Unclear referent — specify what 'it' refers to"),
    ("they ", "Unclear referent — specify who/what 'they' refers to"),
    ("this ", "Unclear referent — specify what 'this' refers to"),
    ("that ", "Unclear referent — specify what 'that' refers to"),
    ("them ", "Unclear referent — specify who/what 'them' refers to"),
]

AMBIGUOUS_MODALS = [
    ("may", "Modal 'may' implies optionality — clarify if mandatory or optional"),
    ("might", "Modal 'might' implies uncertainty — clarify if this is a requirement"),
    ("could", "Modal 'could' is ambiguous about obligation"),
]

UNCLEAR_QUANTITIES = [
    ("large number", "Unclear quantity"),
    ("small number", "Unclear quantity"),
    ("many", "Unclear how many"),
    ("few", "Unclear how few"),
    ("several", "Unclear quantity — specify exact number or range"),
    ("a lot", "Unclear quantity"),
]


class AmbiguityAnalyzer:

    def analyze(self, text: str, requirement_code: str = "REQ-000") -> AmbiguityAnalysisResult:
        if not text or not text.strip():
            raise ValueError("Requirement text cannot be empty.")

        lower = text.lower()
        indicators: List[AmbiguityIndicator] = []

        # Check vague words
        for term, reason in VAGUE_WORDS:
            if re.search(r"\b" + re.escape(term) + r"\b", lower):
                indicators.append(AmbiguityIndicator(term=term, reason=reason))

        # Check unclear pronouns
        for term, reason in UNCLEAR_PRONOUNS:
            if term in lower:
                indicators.append(AmbiguityIndicator(term=term.strip(), reason=reason))

        # Check ambiguous modals
        for term, reason in AMBIGUOUS_MODALS:
            if re.search(r"\b" + re.escape(term) + r"\b", lower):
                indicators.append(AmbiguityIndicator(term=term, reason=reason))

        # Check unclear quantities
        for term, reason in UNCLEAR_QUANTITIES:
            if term in lower:
                indicators.append(AmbiguityIndicator(term=term, reason=reason))

        # Scoring: each indicator contributes 0.20, capped at 1.0
        ambiguity_score = round(min(len(indicators) * 0.20, 1.0), 2)
        is_ambiguous = ambiguity_score > 0.0

        if ambiguity_score == 0.0:
            ambiguity_level = "None"
        elif ambiguity_score <= 0.30:
            ambiguity_level = "Low"
        elif ambiguity_score <= 0.60:
            ambiguity_level = "Medium"
        else:
            ambiguity_level = "High"

        if not is_ambiguous:
            explanation = "No significant ambiguity indicators detected."
            clarification: Optional[str] = None
        else:
            terms = [i.term for i in indicators[:3]]
            explanation = (
                f"Found {len(indicators)} ambiguity indicator(s): "
                f"{', '.join(terms)}{'...' if len(indicators) > 3 else ''}."
            )
            clarification = (
                "Consider replacing vague/subjective terms with specific, measurable criteria. "
                "Clarify unclear pronouns and quantify any undefined quantities."
            )

        return AmbiguityAnalysisResult(
            requirement_code=requirement_code,
            text=text,
            ambiguity_score=ambiguity_score,
            ambiguity_level=ambiguity_level,
            is_ambiguous=is_ambiguous,
            ambiguity_indicators=indicators,
            explanation=explanation,
            suggested_clarification=clarification,
        )
