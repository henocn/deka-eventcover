# Face API models

Place the face-api.js model files in this directory before enabling "Mes photos".

Required files:

- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`
- `face_recognition_model-shard2`

You can download them from the official face-api.js weights repository:

`https://github.com/justadudewhohacks/face-api.js/tree/master/weights`

The backend reads this folder through `FACE_MODELS_PATH`.
