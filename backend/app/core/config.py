from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/todoc"

    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # OpenAI / GPT
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL: str = "gpt-4o-mini"
    EMBEDDING_MODEL: str = "text-embedding-3-large"

    # RAG paths (Doctor)
    RAG_INDEX_PATH: str = "app/rag/index_doctor.faiss"
    RAG_META_PATH: str = "app/rag/index_doctor.pkl"
    # RAG paths (Mom)
    RAG_INDEX_PATH_MOM: str = "app/rag/index_mom.faiss"
    RAG_META_PATH_MOM: str = "app/rag/index_mom.pkl"
    # RAG paths (Nutritionist)
    RAG_INDEX_PATH_NUTRI: str = "app/rag/index_nutri.faiss"
    RAG_META_PATH_NUTRI: str = "app/rag/index_nutri.pkl"
    # RAG paths (Common)
    RAG_INDEX_PATH_COMMON: str = "app/rag/index_common.faiss"
    RAG_META_PATH_COMMON: str = "app/rag/index_common.pkl"

    # File Upload
    UPLOAD_DIR: str = "static/uploads"
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5MB

    class Config:
        env_file = ".env"


settings = Settings()
