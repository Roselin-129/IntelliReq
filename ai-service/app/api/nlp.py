from fastapi import APIRouter, HTTPException

from app.schemas.nlp import (
    PreprocessRequest,
    PreprocessResponse
)

from app.nlp.preprocessor import NLPPreprocessor


router = APIRouter(
    prefix="/api/ai",
    tags=["NLP"]
)

processor = NLPPreprocessor()


@router.post(
    "/preprocess",
    response_model=PreprocessResponse
)
def preprocess_text(request: PreprocessRequest):

    try:
        return processor.process(request.text)

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )