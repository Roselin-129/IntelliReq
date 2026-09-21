from pydantic import BaseModel
from typing import List


class PreprocessRequest(BaseModel):
    text: str


class Entity(BaseModel):
    text: str
    label: str


class PreprocessResponse(BaseModel):
    text: str
    sentence_count: int
    token_count: int
    sentences: List[str]
    tokens: List[str]
    lemmas: List[str]
    keywords: List[str]
    entities: List[Entity]