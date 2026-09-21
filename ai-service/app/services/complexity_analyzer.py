"""
Phase 3.8 — Complexity Analyzer
Evaluates requirement complexity using deterministic NLP-based metrics.
Scores are NOT AI-generated.
"""

import re
import spacy
from typing import List

from app.schemas.requirement import ComplexityAnalysisResult, ComplexityFactor


TECHNICAL_TERMS = [
    "api", "database", "server", "authentication", "authorization", "encryption",
    "protocol", "interface", "microservice", "middleware", "cache", "queue",
    "thread", "async", "concurren", "algorithm", "framework", "sdk", "rest",
    "graphql", "oauth", "jwt", "ssl", "tls", "webhook", "payload",
]

CONDITION_WORDS = [
    "if", "when", "unless", "until", "while", "except", "only if",
    "provided that", "in case", "given that",
]

CONJUNCTION_WORDS = ["and", "or", "but", "however", "moreover", "furthermore"]

ACTOR_WORDS = [
    "user", "admin", "administrator", "system", "application", "service",
    "manager", "client", "customer", "operator",
]


class ComplexityAnalyzer:

    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")

    def analyze(self, text: str, requirement_code: str = "REQ-000") -> ComplexityAnalysisResult:
        if not text or not text.strip():
            raise ValueError("Requirement text cannot be empty.")

        lower = text.lower()
        doc = self.nlp(text)
        factors: List[ComplexityFactor] = []
        raw_score = 0.0

        # ── Word count ────────────────────────────────────────────────────
        word_count = len([t for t in doc if not t.is_space and not t.is_punct])
        factors.append(ComplexityFactor(factor="Word Count", value=str(word_count)))
        if word_count > 30:
            raw_score += 0.30
        elif word_count > 15:
            raw_score += 0.15

        # ── Number of clauses (approximated by verb count) ────────────────
        verb_count = len([t for t in doc if t.pos_ == "VERB"])
        factors.append(ComplexityFactor(factor="Verb/Action Count", value=str(verb_count)))
        if verb_count >= 4:
            raw_score += 0.25
        elif verb_count >= 2:
            raw_score += 0.10

        # ── Conditions ────────────────────────────────────────────────────
        condition_count = sum(1 for w in CONDITION_WORDS if re.search(r"\b" + re.escape(w) + r"\b", lower))
        factors.append(ComplexityFactor(factor="Conditions", value=str(condition_count)))
        raw_score += min(condition_count * 0.15, 0.30)

        # ── Conjunctions ──────────────────────────────────────────────────
        conjunction_count = sum(1 for w in CONJUNCTION_WORDS if re.search(r"\b" + re.escape(w) + r"\b", lower))
        factors.append(ComplexityFactor(factor="Conjunctions", value=str(conjunction_count)))
        raw_score += min(conjunction_count * 0.10, 0.20)

        # ── Technical terms ────────────────────────────────────────────────
        tech_matches = [t for t in TECHNICAL_TERMS if t in lower]
        factors.append(ComplexityFactor(factor="Technical Terms", value=", ".join(tech_matches) if tech_matches else "None"))
        raw_score += min(len(tech_matches) * 0.10, 0.25)

        # ── Multiple actors ────────────────────────────────────────────────
        actor_matches = [a for a in ACTOR_WORDS if re.search(r"\b" + re.escape(a) + r"\b", lower)]
        unique_actors = list(set(actor_matches))
        factors.append(ComplexityFactor(factor="Actors Mentioned", value=str(len(unique_actors))))
        if len(unique_actors) >= 2:
            raw_score += 0.15

        # ── Normalise score ────────────────────────────────────────────────
        complexity_score = round(min(raw_score, 1.0), 2)

        if complexity_score < 0.30:
            complexity_level = "Low"
            explanation = "Requirement is straightforward with a single action and clear scope."
        elif complexity_score < 0.60:
            complexity_level = "Medium"
            explanation = "Requirement has moderate complexity — multiple conditions or actors involved."
        else:
            complexity_level = "High"
            explanation = "Requirement is complex — many conditions, actions, or technical constraints. Consider decomposing."

        return ComplexityAnalysisResult(
            requirement_code=requirement_code,
            text=text,
            complexity_score=complexity_score,
            complexity_level=complexity_level,
            complexity_factors=factors,
            explanation=explanation,
        )
