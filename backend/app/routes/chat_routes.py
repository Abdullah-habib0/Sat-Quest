import base64
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from services.vlm_service import vlm_service
from services.chat_service import chat_service

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat")
async def chat(
    session_id: str = Form(...),
    query: str = Form(...),
    image: Optional[UploadFile] = File(None),
):
    try:
        image_bytes = None
        if image and image.filename:
            image_bytes = await image.read()

        # If a new image was uploaded, save it to the session for future context
        if image_bytes:
            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
            await chat_service.save_image(session_id, image_b64)
            stored_image_b64 = None  # vlm_service will use image_bytes directly
        else:
            # No new image — fetch the stored one for context
            stored_image_b64 = await chat_service.get_image(session_id)

        answer = await vlm_service.generate_answer(
            query=query,
            image_bytes=image_bytes,
            stored_image_b64=stored_image_b64,
        )

        await chat_service.add_message(
            session_id, "user", query, image_included=image_bytes is not None
        )
        await chat_service.add_message(session_id, "assistant", answer)

        messages = await chat_service.get_messages(session_id)

        return JSONResponse(
            content={
                "session_id": session_id,
                "answer": answer,
                "messages": messages,
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{session_id}")
async def get_history(session_id: str):
    try:
        messages = await chat_service.get_messages(session_id)
        return JSONResponse(
            content={"session_id": session_id, "messages": messages}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions")
async def get_sessions():
    try:
        sessions = await chat_service.get_all_sessions()
        return JSONResponse(content={"sessions": sessions})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))