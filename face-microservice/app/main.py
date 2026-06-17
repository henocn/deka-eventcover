import asyncio
from typing import Annotated

import logging
import time

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from insightface.app import FaceAnalysis
from starlette.concurrency import run_in_threadpool

from .settings import (
    APP_NAME,
    CROP_OVERLAP,
    DEDUP_IOU,
    DET_SIZE,
    ENABLE_MULTIPASS,
    MAX_CONCURRENCY,
    MIN_FACE_SIZE,
    MIN_SHARPNESS,
    MODEL_NAME,
)


logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(APP_NAME)


face_app = FaceAnalysis(
    name=MODEL_NAME,
    allowed_modules=["detection", "recognition"],
    providers=["CPUExecutionProvider"],
)
face_app.prepare(ctx_id=-1, det_size=(DET_SIZE, DET_SIZE))

inference_lock = asyncio.Semaphore(MAX_CONCURRENCY)
app = FastAPI(title=APP_NAME)


def _normalize_embedding(embedding: np.ndarray) -> list[float]:
    norm = float(np.linalg.norm(embedding))
    if norm == 0:
        return embedding.astype(float).tolist()
    return (embedding / norm).astype(float).tolist()


def _decode_image(contents: bytes) -> np.ndarray:
    image_array = np.frombuffer(contents, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Invalid image")
    return image


def _image_quality(image: np.ndarray) -> dict:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    sharpness = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    brightness = float(np.mean(gray))

    return {
        "sharpness": round(sharpness, 2),
        "brightness": round(brightness, 2),
    }


def _face_area(face: dict) -> float:
    x1, y1, x2, y2 = face["bbox"]
    return max(0.0, x2 - x1) * max(0.0, y2 - y1)


def _bbox_iou(a: list[float], b: list[float]) -> float:
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b
    ix1 = max(ax1, bx1)
    iy1 = max(ay1, by1)
    ix2 = min(ax2, bx2)
    iy2 = min(ay2, by2)
    intersection = max(0.0, ix2 - ix1) * max(0.0, iy2 - iy1)
    union = ((ax2 - ax1) * (ay2 - ay1)) + ((bx2 - bx1) * (by2 - by1)) - intersection
    return 0.0 if union <= 0 else intersection / union


def _face_warnings(image: np.ndarray, faces: list[dict]) -> list[str]:
    warnings = []
    quality = _image_quality(image)

    if quality["sharpness"] < MIN_SHARPNESS:
        warnings.append("Image probablement floue.")

    if quality["brightness"] < 45:
        warnings.append("Image probablement trop sombre.")

    if quality["brightness"] > 215:
        warnings.append("Image probablement trop claire.")

    if not faces:
        warnings.append("Aucun visage detecte.")

    small_faces = 0
    for face in faces:
        x1, y1, x2, y2 = face["bbox"]
        if min(x2 - x1, y2 - y1) < MIN_FACE_SIZE:
            small_faces += 1

    if small_faces:
        warnings.append(f"{small_faces} visage(s) tres petit(s), reconnaissance moins fiable.")

    return warnings


def _face_to_payload(face, offset_x: int = 0, offset_y: int = 0, source: str = "full") -> dict:
    x1, y1, x2, y2 = face.bbox.tolist()
    return {
        "bbox": [
            float(x1 + offset_x),
            float(y1 + offset_y),
            float(x2 + offset_x),
            float(y2 + offset_y),
        ],
        "confidence": float(face.det_score),
        "source": source,
        "embedding": _normalize_embedding(
            getattr(face, "normed_embedding", None)
            if getattr(face, "normed_embedding", None) is not None
            else face.embedding
        ),
    }


def _crop_windows(width: int, height: int) -> list[tuple[int, int, int, int, str]]:
    if not ENABLE_MULTIPASS or min(width, height) < 900:
        return []

    overlap_x = int(width * CROP_OVERLAP)
    overlap_y = int(height * CROP_OVERLAP)
    half_width = width // 2
    half_height = height // 2

    windows = [
        (0, 0, min(width, half_width + overlap_x), min(height, half_height + overlap_y), "tile-top-left"),
        (max(0, half_width - overlap_x), 0, width, min(height, half_height + overlap_y), "tile-top-right"),
        (0, max(0, half_height - overlap_y), min(width, half_width + overlap_x), height, "tile-bottom-left"),
        (max(0, half_width - overlap_x), max(0, half_height - overlap_y), width, height, "tile-bottom-right"),
    ]

    if min(width, height) >= 1200:
        margin_x = width // 5
        margin_y = height // 5
        windows.append((margin_x, margin_y, width - margin_x, height - margin_y, "tile-center"))

    return windows


def _dedupe_faces(faces: list[dict]) -> list[dict]:
    ordered = sorted(faces, key=lambda item: (item["confidence"], _face_area(item)), reverse=True)
    deduped = []

    for face in ordered:
        if all(_bbox_iou(face["bbox"], existing["bbox"]) < DEDUP_IOU for existing in deduped):
            deduped.append(face)

    return sorted(deduped, key=lambda item: item["bbox"][0])


def _detect_faces_multipass(image: np.ndarray) -> tuple[list[dict], int]:
    faces = [_face_to_payload(face) for face in face_app.get(image)]

    for x1, y1, x2, y2, source in _crop_windows(image.shape[1], image.shape[0]):
        crop = image[y1:y2, x1:x2]
        if crop.size == 0:
            continue
        faces.extend(_face_to_payload(face, x1, y1, source) for face in face_app.get(crop))

    return _dedupe_faces(faces), len(faces)


def _extract_faces(contents: bytes) -> dict:
    started_at = time.perf_counter()
    image = _decode_image(contents)
    faces, raw_face_count = _detect_faces_multipass(image)
    quality = _image_quality(image)
    duration_ms = round((time.perf_counter() - started_at) * 1000, 2)

    logger.info(
        "extract width=%s height=%s faces=%s raw_faces=%s sharpness=%s brightness=%s duration_ms=%s",
        image.shape[1],
        image.shape[0],
        len(faces),
        raw_face_count,
        quality["sharpness"],
        quality["brightness"],
        duration_ms,
    )

    return {
        "image": {
            "width": int(image.shape[1]),
            "height": int(image.shape[0]),
        },
        "quality": quality,
        "warnings": _face_warnings(image, faces),
        "durationMs": duration_ms,
        "rawFaces": raw_face_count,
        "faces": faces,
    }


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "model": MODEL_NAME,
        "provider": "CPUExecutionProvider",
        "ctxId": -1,
        "detSize": DET_SIZE,
        "maxConcurrency": MAX_CONCURRENCY,
        "minSharpness": MIN_SHARPNESS,
        "minFaceSize": MIN_FACE_SIZE,
        "multiPass": ENABLE_MULTIPASS,
        "cropOverlap": CROP_OVERLAP,
        "dedupIou": DEDUP_IOU,
    }


@app.post("/extract")
async def extract(file: Annotated[UploadFile, File()]) -> dict:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Image file required")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty image")

    try:
        async with inference_lock:
            return await run_in_threadpool(_extract_faces, contents)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Face extraction failed: {error}") from error
