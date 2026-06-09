from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Always resolve .env relative to this file's location (backend/.env)
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    MONGO_URI: str
    DB_NAME: str
    MODEL_NAME: str
    HF_TOKEN: str

    model_config = SettingsConfigDict(env_file=str(ENV_PATH), env_file_encoding="utf-8")


settings = Settings()


settings = Settings()