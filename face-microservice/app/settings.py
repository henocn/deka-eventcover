import os
from typing import Optional

from dotenv import load_dotenv


load_dotenv()


def _to_int(value: Optional[str], fallback: int) -> int:
    try:
        return int(value) if value is not None else fallback
    except ValueError:
        return fallback


APP_NAME = "deka-face-service"
MODEL_NAME = os.getenv("INSIGHTFACE_MODEL", "buffalo_s")
DET_SIZE = _to_int(os.getenv("INSIGHTFACE_DET_SIZE"), 640)
MAX_CONCURRENCY = max(1, _to_int(os.getenv("FACE_MAX_CONCURRENCY"), 1))
