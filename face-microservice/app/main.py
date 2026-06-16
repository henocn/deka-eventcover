import asyncio
from typing import Annotated

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from insightface.app import FaceAnalysis
from starlette.concurrency import run_in_threadpool

from .settings import APP_NAME, DET_SIZE, MAX_CONCURRENCY, MODEL_NAME


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


def _extract_faces(contents: bytes) -> dict:
    image = _decode_image(contents)
    faces = face_app.get(image)

    return {
        "image": {
            "width": int(image.shape[1]),
            "height": int(image.shape[0]),
        },
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
