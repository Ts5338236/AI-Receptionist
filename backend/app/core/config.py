"""Application configuration and environment settings using Pydantic Settings."""

from typing import List, Union

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore")

    # Application
    APP_NAME: str = "AI Receptionist Enterprise"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    SECRET_KEY: str = "default-secret-key-please-replace-in-production-min-32-chars"

    # API
    API_V1_STR: str = "/api/v1"
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return []

    # Database Settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "ai_receptionist"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ai_receptionist"
    SYNC_DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/ai_receptionist"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_ECHO: bool = False

    # Redis Settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0
    REDIS_URL: str = "redis://localhost:6379/0"

    # Qdrant Vector Search
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_API_KEY: str = ""
    QDRANT_COLLECTION_NAME: str = "receptionist_knowledge_base"

    # Voice Gateway & Audio Pipeline Settings
    STT_PROVIDER: str = "deepgram"
    DEEPGRAM_API_KEY: str = ""
    STT_LANGUAGE: str = "en-US"
    STT_SAMPLE_RATE: int = 16000

    TTS_PROVIDER: str = "elevenlabs"
    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_VOICE_ID: str = "21m00Tcm4TlvDq8ikWAM"
    ELEVENLABS_MODEL_ID: str = "eleven_multilingual_v2"
    TTS_LANGUAGE: str = "en"

    VOICE_WS_TIMEOUT_SECONDS: int = 60
    VOICE_SESSION_TIMEOUT_SECONDS: int = 300
    VOICE_MAX_AUDIO_CHUNK_BYTES: int = 262144
    VAD_SILENCE_TIMEOUT_MS: int = 1500
    VAD_MAX_RECORDING_MS: int = 15000
    AUDIO_RETENTION_DAYS: int = 0


settings = Settings()
