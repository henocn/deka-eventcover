# Deka Face Microservice

FastAPI service dedicated to face detection and 512-dimensional face embeddings.

## Stack

- FastAPI
- InsightFace `buffalo_s`
- ONNX Runtime CPU only
- OpenCV headless

## Setup

```bash
cd face-microservice
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

On Linux:

```bash
cd face-microservice
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Start

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Keep it bound to `127.0.0.1`; only the Node backend should call it.

## PM2 on Linux

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

## Environment

```bash
INSIGHTFACE_MODEL=buffalo_s
INSIGHTFACE_DET_SIZE=640
FACE_MAX_CONCURRENCY=1
FACE_MIN_SHARPNESS=35
FACE_MIN_SIZE=24
```

`buffalo_s` is the CPU-friendly model. If the model is not already available,
InsightFace may need to download it on first startup. In production, start the
service once during deployment so the model is cached before the event.

## Quick checks

```bash
curl http://127.0.0.1:8001/health
curl -F "file=@test.jpg" http://127.0.0.1:8001/extract
```

The response includes `quality`, `warnings`, `durationMs`, and detected faces.

## API

```bash
GET /health
POST /extract
```

`POST /extract` receives one image file as multipart form-data field `file` and
returns detected faces with `bbox`, `confidence`, and normalized `embedding`.
