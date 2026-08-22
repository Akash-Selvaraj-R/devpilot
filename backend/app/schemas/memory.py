from datetime import datetime

from pydantic import BaseModel


class MemoryCreate(BaseModel):
    category: str
    content: str
    source: str = "manual"


class MemoryResponse(BaseModel):
    id: str
    category: str
    content: str
    source: str
    created_at: datetime
    updated_at: datetime


class CodingSessionCreate(BaseModel):
    title: str = "Untitled Session"
    personality_id: str = "senior_engineer"
    language: str = ""


class CodingSessionResponse(BaseModel):
    id: str
    title: str
    personality_id: str
    language: str
    summary: str
    messages_json: str
    created_at: datetime
    updated_at: datetime


class CodingRequest(BaseModel):
    action: str
    code: str = ""
    question: str = ""
    personality_id: str = "senior_engineer"
    language: str = ""
    repo_context: str = ""
    current_file: str = ""
    session_id: str = ""


class CodingResponse(BaseModel):
    response: str
    personality_id: str
    action: str
    context_used: dict
    session_id: str = ""


class PersonalityResponse(BaseModel):
    id: str
    name: str
    icon: str
    description: str
    system_instructions: str
    verbosity: str
    reveal_solutions: bool
    teaching_style: str
