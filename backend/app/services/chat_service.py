from datetime import datetime, timezone
from database import get_db


def serialize_doc(doc: dict) -> dict:
    """Convert all non-JSON-serializable fields in a MongoDB document."""
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
    doc["_id"] = str(doc["_id"])
    return doc


class ChatService:

    async def get_or_create_session(self, session_id: str) -> dict:
        collection = get_db()["chat_sessions"]
        doc = await collection.find_one({"session_id": session_id})
        if doc:
            return serialize_doc(doc)

        new_session = {
            "session_id": session_id,
            "messages": [],
            "current_image_b64": None,   # stores the latest image as base64 string
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        await collection.insert_one(new_session)
        return serialize_doc(new_session)

    async def save_image(self, session_id: str, image_b64: str) -> None:
        """Persist the latest image for this session so follow-up questions have context."""
        collection = get_db()["chat_sessions"]
        await self.get_or_create_session(session_id)
        await collection.update_one(
            {"session_id": session_id},
            {"$set": {"current_image_b64": image_b64}}
        )

    async def get_image(self, session_id: str) -> str | None:
        """Return the stored base64 image for this session, or None."""
        collection = get_db()["chat_sessions"]
        doc = await collection.find_one(
            {"session_id": session_id},
            {"current_image_b64": 1}
        )
        if doc:
            return doc.get("current_image_b64")
        return None

    async def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        image_included: bool = False,
    ) -> None:
        collection = get_db()["chat_sessions"]
        await self.get_or_create_session(session_id)

        message = {
            "role": role,
            "content": content,
            "image_included": image_included,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        await collection.update_one(
            {"session_id": session_id},
            {
                "$push": {"messages": message},
                "$set": {"updated_at": datetime.now(timezone.utc)},
            },
        )

    async def get_messages(self, session_id: str) -> list:
        collection = get_db()["chat_sessions"]
        doc = await collection.find_one({"session_id": session_id})
        if doc is None:
            return []
        return doc.get("messages", [])

    async def get_all_sessions(self) -> list:
        collection = get_db()["chat_sessions"]
        cursor = collection.find({})
        sessions = await cursor.to_list(length=100)
        return [serialize_doc(session) for session in sessions]


chat_service = ChatService()