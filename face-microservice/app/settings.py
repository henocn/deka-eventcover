import os
from typing import Optional

from dotenv import load_dotenv


load_dotenv()


def _to_int(value: Optional[str], fallback: int) -> int:
    try:
        return int(value) if value is not None else fallback
    except ValueError:
        return fallback


def _to_float(value: Optional[str], fallback: float) -> float:
    try:
        return float(value) if value is not None else fallback
    except ValueError:
        return fallback


def _to_bool(value: Optional[str], fallback: bool) -> bool:
    if value is None:
        return fallback
    return value.lower() in {"1", "true", "yes", "on"}


APP_NAME = "deka-face-service"
MODEL_NAME = os.getenv("INSIGHTFACE_MODEL", "buffalo_l")
DET_SIZE = _to_int(os.getenv("INSIGHTFACE_DET_SIZE"), 800)
MAX_CONCURRENCY = max(1, _to_int(os.getenv("FACE_MAX_CONCURRENCY"), 1))
MIN_SHARPNESS = _to_int(os.getenv("FACE_MIN_SHARPNESS"), 35)
MIN_FACE_SIZE = _to_int(os.getenv("FACE_MIN_SIZE"), 18)
ENABLE_MULTIPASS = _to_bool(os.getenv("FACE_ENABLE_MULTIPASS"), True)
CROP_OVERLAP = min(0.35, max(0.0, _to_float(os.getenv("FACE_CROP_OVERLAP"), 0.18)))
DEDUP_IOU = min(0.95, max(0.1, _to_float(os.getenv("FACE_DEDUP_IOU"), 0.42)))
