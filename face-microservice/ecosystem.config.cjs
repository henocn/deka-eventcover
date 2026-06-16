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
        INSIGHTFACE_MODEL: 'buffalo_s',
        INSIGHTFACE_DET_SIZE: '640',
        FACE_MAX_CONCURRENCY: '1',
      },
    },
  ],
};
