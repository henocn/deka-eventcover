import asyncio
from typing import Annotated

import logging
import time

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from insightface.app import FaceAnalysis
from starlette.concurrency import run_in_threadpool

from .settings import APP_NAME, DET_SIZE, MAX_CONCURRENCY, MIN_FACE_SIZE, MIN_SHARPNESS, MODEL_NAME


logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(APP_NAME)


face_app = FaceAnalysis(
    name=MODEL_NAME,
    allowed_modules=["detection", "recognition"],
    providers=["CPUExecutionProvider"],
)
face_app.prepare(ctx_id=0, det_size=(DET_SIZE, DET_SIZE))

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


def _face_warnings(image: np.ndarray, faces: list) -> list[str]:
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
        x1, y1, x2, y2 = face.bbox.tolist()
        if min(x2 - x1, y2 - y1) < MIN_FACE_SIZE:
            small_faces += 1

    if small_faces:
        warnings.append(f"{small_faces} visage(s) tres petit(s), reconnaissance moins fiable.")

    return warnings


def _extract_faces(contents: bytes) -> dict:
    started_at = time.perf_counter()
    image = _decode_image(contents)
    faces = face_app.get(image)
    quality = _image_quality(image)
    duration_ms = round((time.perf_counter() - started_at) * 1000, 2)

    logger.info(
        "extract width=%s height=%s faces=%s sharpness=%s brightness=%s duration_ms=%s",
        image.shape[1],
        image.shape[0],
        len(faces),
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
        "faces": [
            {
                "bbox": [float(value) for value in face.bbox.tolist()],
                "confidence": float(face.det_score),
                "embedding": _normalize_embedding(
                    getattr(face, "normed_embedding", None)
                    if getattr(face, "normed_embedding", None) is not None
                    else face.embedding
                ),
            }
            for face in faces
        ],
    }


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "model": MODEL_NAME,
        "provider": "CPUExecutionProvider",
        "detSize": DET_SIZE,
        "maxConcurrency": MAX_CONCURRENCY,
        "minSharpness": MIN_SHARPNESS,
        "minFaceSize": MIN_FACE_SIZE,
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
