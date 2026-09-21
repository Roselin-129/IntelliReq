from pydantic import BaseModel
from typing import List, Optional


# ── Shared ──────────────────────────────────────────────────────────────────

class TextRequest(BaseModel):
    """Generic single-text input reused across multiple endpoints."""
    text: str


# ── Phase 3.3 — Requirement Extraction ──────────────────────────────────────

class ExtractedRequirement(BaseModel):
    requirement_code: str
    text: str
    source_sentence: str
    confidence: float
    indicator: str


class ExtractionResponse(BaseModel):
    requirement_count: int
    requirements: List[ExtractedRequirement]


# ── Phase 3.4 — Classification ───────────────────────────────────────────────

class ClassifyRequest(BaseModel):
    text: str
    requirement_code: Optional[str] = "REQ-000"


class ClassificationResult(BaseModel):
    requirement_code: str
    text: str
    predicted_type: str
    confidence: float
    explanation: str


class ClassifyBatchRequest(BaseModel):
    text: str


class ClassifyBatchResponse(BaseModel):
    requirement_count: int
    requirements: List[ClassificationResult]


# ── Phase 3.5 — Quality Analysis ─────────────────────────────────────────────

class QualityIssue(BaseModel):
    issue: str
    severity: str
    suggestion: str


class QualityAnalysisRequest(BaseModel):
    text: str
    requirement_code: Optional[str] = "REQ-000"


class QualityAnalysisResult(BaseModel):
    requirement_code: str
    text: str
    quality_score: float
    quality_level: str
    completeness_score: float
    clarity_score: float
    testability_score: float
    specificity_score: float
    detected_issues: List[QualityIssue]
    recommendations: List[str]


# ── Phase 3.6 — Ambiguity Detection ──────────────────────────────────────────

class AmbiguityIndicator(BaseModel):
    term: str
    reason: str


class AmbiguityAnalysisRequest(BaseModel):
    text: str
    requirement_code: Optional[str] = "REQ-000"


class AmbiguityAnalysisResult(BaseModel):
    requirement_code: str
    text: str
    ambiguity_score: float
    ambiguity_level: str
    is_ambiguous: bool
    ambiguity_indicators: List[AmbiguityIndicator]
    explanation: str
    suggested_clarification: Optional[str] = None


# ── Phase 3.7 — Risk Analysis ────────────────────────────────────────────────

class RiskFactor(BaseModel):
    factor: str
    description: str
    weight: float


class RiskAnalysisRequest(BaseModel):
    text: str
    requirement_code: Optional[str] = "REQ-000"


class RiskAnalysisResult(BaseModel):
    requirement_code: str
    text: str
    risk_score: float
    risk_level: str
    risk_factors: List[RiskFactor]
    explanation: str
    recommendation: str


# ── Phase 3.8 — Complexity Analysis ──────────────────────────────────────────

class ComplexityFactor(BaseModel):
    factor: str
    value: str


class ComplexityAnalysisRequest(BaseModel):
    text: str
    requirement_code: Optional[str] = "REQ-000"


class ComplexityAnalysisResult(BaseModel):
    requirement_code: str
    text: str
    complexity_score: float
    complexity_level: str
    complexity_factors: List[ComplexityFactor]
    explanation: str


# ── Phase 3.9 — Combined Analysis ────────────────────────────────────────────

class CombinedRequirementAnalysis(BaseModel):
    requirement_code: str
    text: str
    classification: ClassificationResult
    quality: QualityAnalysisResult
    ambiguity: AmbiguityAnalysisResult
    risk: RiskAnalysisResult
    complexity: ComplexityAnalysisResult


class CombinedAnalysisResponse(BaseModel):
    requirement_count: int
    requirements: List[CombinedRequirementAnalysis]