"""
Phase 3.4 — Requirement Classifier
Classifies a requirement into one of: Functional, NonFunctional, Business,
Technical, Security, Performance using deterministic keyword rules.
NOT AI-generated. Designed to be replaced by an ML/LLM classifier later.
"""

from app.schemas.requirement import ClassificationResult

# Each category has (keyword_list, base_confidence)
CATEGORY_RULES = [
    (
        "Performance",
        [
            "response time", "latency", "throughput", "within", "seconds",
            "milliseconds", "load time", "fast", "quickly", "speed",
            "performance", "scalab", "concurrent", "requests per second",
            "uptime", "availability", "95%", "99%",
        ],
        0.88,
    ),
    (
        "Security",
        [
            "encrypt", "encryptio", "authenticat", "authoriz", "password",
            "credential", "ssl", "tls", "https", "token", "jwt", "oauth",
            "secure", "security", "access control", "permission", "role",
            "vulnerab", "firewall", "audit", "log", "gdpr", "pii",
            "personal data", "sensitive",
        ],
        0.90,
    ),
    (
        "Technical",
        [
            "api", "database", "server", "infrastructure", "deploy",
            "docker", "kubernetes", "microservice", "framework", "library",
            "architecture", "integration", "interface", "protocol",
            "rest", "graphql", "endpoint", "middleware", "cache",
            "storage", "backup", "migration",
        ],
        0.82,
    ),
    (
        "Business",
        [
            "revenue", "profit", "customer", "market", "business",
            "stakeholder", "compliance", "regulation", "policy", "audit",
            "report", "invoice", "payment", "transaction", "contract",
            "sla", "kpi", "budget", "cost",
        ],
        0.83,
    ),
    (
        "NonFunctional",
        [
            "usability", "maintainab", "reliab", "portab", "compatib",
            "accessib", "interoperab", "scalab", "extensib",
            "user-friendly", "easy to use", "intuitive", "responsive",
            "robust", "fault toleran",
        ],
        0.80,
    ),
    (
        "Functional",
        [
            # Catch-all for action verbs; matched last
            "allow", "enable", "provide", "display", "show", "create",
            "update", "delete", "manage", "register", "login", "logout",
            "search", "filter", "sort", "upload", "download", "send",
            "receive", "notify", "generate", "calculate", "process",
            "validate", "submit", "view", "edit", "assign",
        ],
        0.78,
    ),
]


def _classify(text: str) -> tuple[str, float, str]:
    """
    Returns (predicted_type, confidence, explanation).
    Iterates category rules in priority order; returns first match.
    Defaults to Functional with low confidence if no match.
    """
    lower = text.lower()
    for category, keywords, base_conf in CATEGORY_RULES:
        matched = [kw for kw in keywords if kw in lower]
        if matched:
            # Confidence boost for multiple keyword matches
            boost = min(len(matched) * 0.02, 0.08)
            conf = round(min(base_conf + boost, 0.99), 2)
            explanation = (
                f"Classified as {category} based on keyword(s): "
                f"{', '.join(matched[:3])}."
            )
            return category, conf, explanation

    return "Functional", 0.55, "No specific category keywords found; defaulting to Functional."


class RequirementClassifier:

    def classify(self, text: str, requirement_code: str = "REQ-000") -> ClassificationResult:
        if not text or not text.strip():
            raise ValueError("Requirement text cannot be empty.")

        predicted_type, confidence, explanation = _classify(text)

        return ClassificationResult(
            requirement_code=requirement_code,
            text=text,
            predicted_type=predicted_type,
            confidence=confidence,
            explanation=explanation,
        )
