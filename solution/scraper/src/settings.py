import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://f1_sgcan:f1_sgcan123456@localhost:5432/scraper_db")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
FILE_STORAGE_PATH = os.getenv("FILE_STORAGE_PATH", "/app/files")