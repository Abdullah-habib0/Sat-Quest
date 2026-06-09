from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import connect_db, close_db
from services.vlm_service import vlm_service
from routes.chat_routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()
    # vlm_service.load_model()  # Not needed for ngrok endpoint
    yield
    # Shutdown
    await close_db()


app = FastAPI(title="VLM Chat API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
async def health_check():
    return {"status": "ok", "message": "VLM Chat API is running"}