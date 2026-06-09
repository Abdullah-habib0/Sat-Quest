from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone


class MessageModel(BaseModel):
    role: str
    content: str
    image_included: bool = False
    timestamp: str = ""

    def __init__(self, **data):
        if "timestamp" not in data or not data["timestamp"]:
            data["timestamp"] = datetime.now(timezone.utc).isoformat()
        super().__init__(**data)


class ChatSessionModel(BaseModel):
    id: Optional[str] = None
    session_id: str
    messages: List[MessageModel] = []
    created_at: datetime = None
    updated_at: datetime = None

    def __init__(self, **data):
        if "created_at" not in data or data["created_at"] is None:
            data["created_at"] = datetime.now(timezone.utc)
        if "updated_at" not in data or data["updated_at"] is None:
            data["updated_at"] = datetime.now(timezone.utc)
        super().__init__(**data)


class QueryRequest(BaseModel):
    session_id: str
    query: str


class ChatResponse(BaseModel):
    session_id: str
    answer: str
    messages: List[MessageModel]