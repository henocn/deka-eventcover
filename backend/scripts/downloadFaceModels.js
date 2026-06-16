const fs = require('fs/promises');
const https = require('https');
const path = require('path');
const env = require('../src/config/env');

const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
const FILES = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
];

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        downloadFile(response.headers.location, destination).then(resolve, reject);
        return;
      }

      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Download failed (${response.statusCode}) for ${url}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', async () => {
        await fs.writeFile(destination, Buffer.concat(chunks));
        resolve();
      });
    });

    request.on('error', reject);
  });
}

async function main() {
  await fs.mkdir(env.faceModelsPath, { recursive: true });

  for (const fileName of FILES) {
    const destination = path.join(env.faceModelsPath, fileName);
    process.stdout.write(`Downloading ${fileName}... `);
    await downloadFile(`${BASE_URL}/${fileName}`, destination);
    process.stdout.write('ok\n');
  }

  console.log(`Face models ready in ${env.faceModelsPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
