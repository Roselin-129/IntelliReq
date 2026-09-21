"""
Phase 3.5 — Quality Analyzer
Evaluates requirement quality using deterministic rules.
Scores are NOT AI-generated.
"""

import re
from typing import List, Tuple

from app.schemas.requirement import QualityAnalysisResult, QualityIssue


# Vague terms that reduce quality
VAGUE_TERMS = [
    "quickly", "easily", "user-friendly", "appropriate", "soon",
    "adequate", "efficient", "effective", "simple", "fast", "friendly",
    "reasonable", "flexible", "robust", "intuitive", "seamless",
    "etc.", "and so on", "and more", "various", "many", "some",
    "often", "usually", "typically", "generally", "normally",
]

# Measurability keywords that boost quality
MEASURABLE_TERMS = [
    "within", "seconds", "milliseconds", "percent", "%", "99", "95",
    "at least", "at most", "maximum", "minimum", "exactly", "between",
    "per second", "per minute", "per hour",
]

# Actor indicators
ACTOR_TERMS = [
    "user", "admin", "administrator", "system", "application", "service",
    "manager", "client", "customer", "operator", "developer",
]


def _check_vague_terms(text_lower: str) -> List[Tuple[str, str]]:
    found = []
    for term in VAGUE_TERMS:
        if re.search(r"\b" + re.escape(term) + r"\b", text_lower):
            found.append((term, f"'{term}' is vague and unmeasurable"))
    return found


def _has_measurable_criteria(text_lower: str) -> bool:
    return any(term in text_lower for term in MEASURABLE_TERMS)


def _has_actor(text_lower: str) -> bool:
    return any(term in text_lower for term in ACTOR_TERMS)


def _has_action(text_lower: str) -> bool:
    """Check for at least one verb-like action word."""
    action_words = [
        "shall", "must", "should", "will", "allow", "enable", "provide",
        "display", "create", "update", "delete", "process", "manage",
        "validate", "send", "receive", "store", "generate", "calculate",
    ]
    return any(w in text_lower for w in action_words)


def _word_count(text: str) -> int:
    return len(text.split())


class QualityAnalyzer:

    def analyze(self, text: str, requirement_code: str = "REQ-000") -> QualityAnalysisResult:
        if not text or not text.strip():
            raise ValueError("Requirement text cannot be empty.")

        lower = text.lower()
        issues: List[QualityIssue] = []
        recommendations: List[str] = []

        # ── Completeness (has actor + action + condition?) ─────────────────
        has_actor = _has_actor(lower)
        has_action = _has_action(lower)
        completeness = 1.0

        if not has_actor:
            completeness -= 0.30
            issues.append(QualityIssue(
                issue="Missing actor",
                severity="high",
                suggestion="Specify who performs this action (e.g., 'The user', 'The system')."
            ))
            recommendations.append("Add a clear actor/subject to the requirement.")

        if not has_action:
            completeness -= 0.30
            issues.append(QualityIssue(
                issue="Missing action",
                severity="high",
                suggestion="Specify what action is required using a modal verb (shall/must/should)."
            ))
            recommendations.append("Include a clear action verb.")

        completeness = max(round(completeness, 2), 0.0)

        # ── Clarity (vague terms) ──────────────────────────────────────────
        vague = _check_vague_terms(lower)
        clarity = max(round(1.0 - len(vague) * 0.20, 2), 0.0)
        for term, reason in vague:
            issues.append(QualityIssue(
                issue=f"Vague term: '{term}'",
                severity="medium",
                suggestion=f"Replace '{term}' with a measurable criterion."
            ))
        if vague:
            recommendations.append(
                f"Replace vague term(s) [{', '.join(t for t, _ in vague[:3])}] with measurable criteria."
            )

        # ── Testability (measurable criteria) ─────────────────────────────
        is_measurable = _has_measurable_criteria(lower)
        testability = 0.90 if is_measurable else 0.45
        if not is_measurable:
            issues.append(QualityIssue(
                issue="No measurable criteria",
                severity="medium",
                suggestion="Add specific, measurable values (e.g., 'within 2 seconds', '99% uptime')."
            ))
            recommendations.append("Add quantitative, measurable acceptance criteria.")

        # ── Specificity (length check) ────────────────────────────────────
        wc = _word_count(text)
        if wc < 5:
            specificity = 0.30
            issues.append(QualityIssue(
                issue="Requirement too short",
                severity="high",
                suggestion="Expand the requirement to include subject, action, and conditions."
            ))
            recommendations.append("Expand the requirement — it is too brief to be testable.")
        elif wc > 50:
            specificity = 0.60
            issues.append(QualityIssue(
                issue="Requirement too long / complex",
                severity="low",
                suggestion="Consider splitting into multiple focused requirements."
            ))
            recommendations.append("Consider splitting this into smaller, focused requirements.")
        else:
            specificity = 0.90

        # ── Overall quality score (weighted average) ──────────────────────
        quality_score = round(
            (completeness * 0.30 + clarity * 0.25 + testability * 0.25 + specificity * 0.20),
            2
        )

        if quality_score >= 0.85:
            quality_level = "Excellent"
        elif quality_score >= 0.65:
            quality_level = "Good"
        elif quality_score >= 0.45:
            quality_level = "Fair"
        else:
            quality_level = "Poor"

        if not recommendations:
            recommendations.append("Requirement quality is acceptable.")

        return QualityAnalysisResult(
            requirement_code=requirement_code,
            text=text,
            quality_score=quality_score,
            quality_level=quality_level,
            completeness_score=completeness,
            clarity_score=clarity,
            testability_score=testability,
            specificity_score=specificity,
            detected_issues=issues,
            recommendations=recommendations,
        )
