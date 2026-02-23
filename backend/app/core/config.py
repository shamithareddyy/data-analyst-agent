from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    gemini_api_key: str = ""
    max_file_size_mb: int = 50
    allowed_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    app_name: str = "DataInsight AI"
    debug: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
