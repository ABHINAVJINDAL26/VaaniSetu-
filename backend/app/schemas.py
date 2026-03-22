from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class QAPair(BaseModel):
    intent: str
    question_keywords: List[str]
    answer_text: str
    helpline: Optional[str] = None
    website: Optional[str] = None

class SchemeBase(BaseModel):
    scheme_id: str
    name: str
    description: str
    intent_class: int
    dialects: List[str]
    qa_pairs: List[QAPair]

class SchemeCreate(SchemeBase):
    pass

class SchemeResponse(SchemeBase):
    id: int
    class Config:
        from_attributes = True

class VoiceResponse(BaseModel):
    transcript: str
    intent: str
    matched_scheme: Optional[SchemeResponse]
    answer_text: str
