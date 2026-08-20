from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    AI_API_KEY: str = ""
    AI_BASE_URL: str = "https://api.openai.com/v1"
    AI_MODEL: str = "gpt-4"
    DATABASE_URL: str = "sqlite+aiosqlite:///./devpilot.db"
    PROJECTS_DIR: str = "./projects"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
