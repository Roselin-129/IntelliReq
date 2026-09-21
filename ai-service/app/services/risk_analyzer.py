"""
Phase 3.7 — Risk Analyzer
Evaluates requirements for potential risks using deterministic keyword rules.
Scores are NOT AI-generated.
"""

import re
from typing import List, Tuple

from app.schemas.requirement import RiskAnalysisResult, RiskFactor


# (keyword_pattern, factor_label, description, weight)
RISK_RULES: List[Tuple[str, str, str, float]] = [
    # Security risks
    ("password|credential|authenticat|authoriz|login|logout",
     "Authentication/Authorization",
     "Requirement involves user authentication or access control.",
     0.25),
    ("encrypt|encryptio|ssl|tls|https|hash|token|jwt|oauth|certificate|securely|secure",
     "Cryptography/Secure Transport",
     "Requirement involves cryptographic operations or secure communication.",
     0.25),
    ("personal data|pii|gdpr|private|sensitive|confidential",
     "Personal/Sensitive Data",
     "Requirement involves personal or sensitive user data.",
     0.30),
    ("vulnerab|injection|xss|csrf|attack|breach|exploit",
     "Security Vulnerability",
     "Requirement references known security threats or vulnerabilities.",
     0.35),
    # Financial risks
    ("payment|transaction|billing|invoice|financial|money|bank|credit card",
     "Financial Operations",
     "Requirement involves financial transactions or payment processing.",
     0.30),
    # External dependencies
    ("external|third.party|integration|api|webhook|provider|vendor",
     "External Dependency",
     "Requirement depends on an external system or third-party provider.",
     0.20),
    # Performance risks
    ("real.time|concurrent|high.load|scalab|peak|latency|throughput",
     "Performance/Scalability",
     "Requirement has demanding performance or scalability constraints.",
     0.20),
    # Critical business operations
    ("critical|essential|mandatory|mission.critical|core|production",
     "Critical Business Operation",
     "Requirement is described as critical or essential.",
     0.25),
    # Ambiguity adds risk
    ("quickly|soon|easily|adequate|appropriate|user.friendly",
     "Ambiguous Constraint",
     "Requirement uses vague language which introduces implementation risk.",
     0.15),
    # Missing constraints
    ("deactivate|delete|remove|purge|archive|disable|terminate",
     "Destructive Operation",
     "Requirement involves deletion or deactivation of data/accounts.",
     0.20),
]


class RiskAnalyzer:

    def analyze(self, text: str, requirement_code: str = "REQ-000") -> RiskAnalysisResult:
        if not text or not text.strip():
            raise ValueError("Requirement text cannot be empty.")

        lower = text.lower()
        matched_factors: List[RiskFactor] = []
        total_weight = 0.0

        for pattern, label, description, weight in RISK_RULES:
            if re.search(pattern, lower):
                matched_factors.append(RiskFactor(
                    factor=label,
                    description=description,
                    weight=weight,
                ))
                total_weight += weight

        # Normalise to 0.0–1.0 (max possible raw score ≈ 2.45)
        risk_score = round(min(total_weight / 2.0, 1.0), 2)

        if risk_score < 0.20:
            risk_level = "Low"
            recommendation = "No immediate risk mitigation required. Continue with standard practices."
        elif risk_score < 0.45:
            risk_level = "Medium"
            recommendation = (
                "Apply standard security/quality practices. "
                "Ensure requirement is reviewed by the relevant team."
            )
        elif risk_score < 0.70:
            risk_level = "High"
            recommendation = (
                "Risk review required before implementation. "
                "Engage security/compliance team and add acceptance criteria."
            )
        else:
            risk_level = "Critical"
            recommendation = (
                "Immediate risk assessment required. "
                "Involve security architects, compliance officers, and senior stakeholders."
            )

        if matched_factors:
            factors_summary = ", ".join(f.factor for f in matched_factors[:3])
            explanation = (
                f"Risk score {risk_score} ({risk_level}) based on {len(matched_factors)} "
                f"risk factor(s): {factors_summary}. "
                "Score is deterministic — NOT AI-generated."
            )
        else:
            explanation = "No risk indicators detected. Risk level is Low."

        return RiskAnalysisResult(
            requirement_code=requirement_code,
            text=text,
            risk_score=risk_score,
            risk_level=risk_level,
            risk_factors=matched_factors,
            explanation=explanation,
            recommendation=recommendation,
        )
