from fastapi import FastAPI

from app.api.nlp import router as nlp_router
from app.api.requirements import router as requirements_router


app = FastAPI(
    title="IntelliReq AI Service",
    description="AI and NLP service for IntelliReq — Phases 3.1–3.8",
    version="1.0.0"
)


# ── Existing: NLP preprocessing (Phase 3.1–3.2) ───────────────────────────
app.include_router(nlp_router)

# ── New: Requirement analysis (Phase 3.3–3.8) ─────────────────────────────
app.include_router(requirements_router)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "IntelliReq AI Service"
    }