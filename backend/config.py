import os

try:
    from pydantic_settings import BaseSettings
    class Settings(BaseSettings):
        PROJECT_NAME: str = "Samooh AI Core Backend"
        VERSION: str = "1.0.0"
        API_PREFIX: str = ""
        FIREBASE_PROJECT_ID: str = "samooh1"
        FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
        USE_MOCK_FIRESTORE: bool = os.getenv("USE_MOCK_FIRESTORE", "true").lower() in ("true", "1", "yes")
        DEFAULT_FORECAST_HORIZON_DAYS: int = 30
        MAX_MATCHING_RADIUS_KM: float = 10.0
        MIN_SIMILARITY_SCORE: float = 0.5

        class Config:
            env_file = ".env"
            extra = "ignore"
except ImportError:
    from pydantic import BaseModel
    class Settings(BaseModel):
        PROJECT_NAME: str = "Samooh AI Core Backend"
        VERSION: str = "1.0.0"
        API_PREFIX: str = ""
        FIREBASE_PROJECT_ID: str = "samooh1"
        FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
        USE_MOCK_FIRESTORE: bool = os.getenv("USE_MOCK_FIRESTORE", "true").lower() in ("true", "1", "yes")
        DEFAULT_FORECAST_HORIZON_DAYS: int = 30
        MAX_MATCHING_RADIUS_KM: float = 10.0
        MIN_SIMILARITY_SCORE: float = 0.5

settings = Settings()
