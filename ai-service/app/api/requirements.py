"""
API Router — Phases 3.3–3.9
All requirement analysis endpoints under /api/ai/
"""

from fastapi import APIRouter, HTTPException

from app.schemas.requirement import (
    TextRequest,
    ExtractionResponse,
    ClassifyRequest,
    ClassificationResult,
    ClassifyBatchRequest,
    ClassifyBatchResponse,
    QualityAnalysisRequest,
    QualityAnalysisResult,
    AmbiguityAnalysisRequest,
    AmbiguityAnalysisResult,
    RiskAnalysisRequest,
    RiskAnalysisResult,
    ComplexityAnalysisRequest,
    ComplexityAnalysisResult,
    CombinedAnalysisResponse,
    CombinedRequirementAnalysis,
)

from app.services.requirement_extractor import RequirementExtractor
from app.services.classifier import RequirementClassifier
from app.services.quality_analyzer import QualityAnalyzer
from app.services.ambiguity_analyzer import AmbiguityAnalyzer
from app.services.risk_analyzer import RiskAnalyzer
from app.services.complexity_analyzer import ComplexityAnalyzer


router = APIRouter(
    prefix="/api/ai",
    tags=["Requirement Analysis"],
)


# Singleton service instances
_extractor = RequirementExtractor()
_classifier = RequirementClassifier()
_quality = QualityAnalyzer()
_ambiguity = AmbiguityAnalyzer()
_risk = RiskAnalyzer()
_complexity = ComplexityAnalyzer()


# ── Phase 3.3 — Requirement Extraction ───────────────────────────────────────

@router.post(
    "/extract-requirements",
    response_model=ExtractionResponse,
    summary="Extract requirements from raw SRS text",
    description=(
        "Splits text into sentences and identifies those containing "
        "requirement indicators (shall, must, should, will, etc.). "
        "Returns requirement codes, text, and deterministic confidence scores."
    ),
)
def extract_requirements(request: TextRequest):
    try:
        return _extractor.extract(request.text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Phase 3.4 — Classification ───────────────────────────────────────────────

@router.post(
    "/classify-requirement",
    response_model=ClassificationResult,
    summary="Classify a single requirement",
    description=(
        "Classifies a requirement into: Functional, NonFunctional, Business, "
        "Technical, Security, or Performance using deterministic keyword rules. "
        "NOT AI-generated."
    ),
)
def classify_requirement(request: ClassifyRequest):
    try:
        return _classifier.classify(
            request.text,
            request.requirement_code or "REQ-000"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Phase 3.5 — Quality Analysis ─────────────────────────────────────────────

@router.post(
    "/analyze-quality",
    response_model=QualityAnalysisResult,
    summary="Analyze requirement quality",
    description=(
        "Evaluates completeness, clarity, testability, and specificity. "
        "Detects vague terms, missing actors, missing measurable criteria. "
        "Returns quality score (0–1) and improvement recommendations."
    ),
)
def analyze_quality(request: QualityAnalysisRequest):
    try:
        return _quality.analyze(
            request.text,
            request.requirement_code or "REQ-000"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Phase 3.6 — Ambiguity Detection ──────────────────────────────────────────

@router.post(
    "/analyze-ambiguity",
    response_model=AmbiguityAnalysisResult,
    summary="Detect ambiguity in a requirement",
    description=(
        "Identifies vague words, subjective terms, unclear pronouns, "
        "ambiguous modals, and unclear quantities. "
        "Returns ambiguity score (0–1) and suggested clarifications."
    ),
)
def analyze_ambiguity(request: AmbiguityAnalysisRequest):
    try:
        return _ambiguity.analyze(
            request.text,
            request.requirement_code or "REQ-000"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Phase 3.7 — Risk Analysis ────────────────────────────────────────────────

@router.post(
    "/analyze-risk",
    response_model=RiskAnalysisResult,
    summary="Analyze requirement risk",
    description=(
        "Evaluates security, financial, dependency, and operational risks. "
        "Returns risk score (0–1), risk level (Low/Medium/High/Critical), "
        "and mitigation recommendations. NOT AI-generated."
    ),
)
def analyze_risk(request: RiskAnalysisRequest):
    try:
        return _risk.analyze(
            request.text,
            request.requirement_code or "REQ-000"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Phase 3.8 — Complexity Analysis ─────────────────────────────────────────

@router.post(
    "/analyze-complexity",
    response_model=ComplexityAnalysisResult,
    summary="Analyze requirement complexity",
    description=(
        "Evaluates sentence length, verb/action count, conditions, conjunctions, "
        "technical terms, and number of actors. "
        "Returns complexity score (0–1) and level (Low/Medium/High)."
    ),
)
def analyze_complexity(request: ComplexityAnalysisRequest):
    try:
        return _complexity.analyze(
            request.text,
            request.requirement_code or "REQ-000"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Phase 3.9 — Batch / Combined Analysis ────────────────────────────────────

@router.post(
    "/analyze",
    response_model=CombinedAnalysisResponse,
    summary="Analyze all requirements in raw SRS text",
    description=(
        "Extracts requirements from raw SRS text and performs classification, "
        "quality, ambiguity, risk, and complexity analysis for each requirement. "
        "All current analysis methods are deterministic."
    ),
)
def analyze_all(request: TextRequest):
    try:
        # Step 1: Extract requirements from the raw SRS text
        extraction = _extractor.extract(request.text)

        results = []

        # Step 2: Run all analysis modules for every extracted requirement
        for requirement in extraction.requirements:
            code = requirement.requirement_code
            text = requirement.text

            classification = _classifier.classify(text, code)
            quality = _quality.analyze(text, code)
            ambiguity = _ambiguity.analyze(text, code)
            risk = _risk.analyze(text, code)
            complexity = _complexity.analyze(text, code)

            # Step 3: Combine all analysis results
            results.append(
                CombinedRequirementAnalysis(
                    requirement_code=code,
                    text=text,
                    classification=classification,
                    quality=quality,
                    ambiguity=ambiguity,
                    risk=risk,
                    complexity=complexity,
                )
            )

        # Step 4: Return the complete batch analysis
        return CombinedAnalysisResponse(
            requirement_count=len(results),
            requirements=results,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))