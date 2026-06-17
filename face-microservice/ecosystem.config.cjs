module.exports = {
  apps: [
    {
      name: 'deka-face-service',
      script: '.venv/bin/uvicorn',
      args: 'app.main:app --host 127.0.0.1 --port 8001',
      cwd: __dirname,
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '1500M',
      env: {
        INSIGHTFACE_MODEL: 'buffalo_l',
        INSIGHTFACE_DET_SIZE: '800',
        FACE_MAX_CONCURRENCY: '1',
        FACE_MIN_SHARPNESS: '35',
        FACE_MIN_SIZE: '18',
        FACE_ENABLE_MULTIPASS: 'true',
        FACE_CROP_OVERLAP: '0.18',
        FACE_DEDUP_IOU: '0.42',
      },
    },
  ],
};
