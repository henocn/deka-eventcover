const env = require('../config/env');
const faceService = require('./faceService');

const queue = [];
const queuedIds = new Set();
let running = 0;

function runNext() {
  if (running >= env.faceQueueConcurrency) return;
  const mediaId = queue.shift();
  if (!mediaId) return;

  queuedIds.delete(mediaId);
  running += 1;
  console.log(`Face analysis started for media ${mediaId}`);

  faceService.analyzeMediaFaces(mediaId)
    .then(() => {
      console.log(`Face analysis completed for media ${mediaId}`);
    })
    .catch((error) => {
      console.error(`Face analysis failed for media ${mediaId}:`, error.message);
    })
    .finally(() => {
      running -= 1;
      runNext();
    });
}

function enqueueMedia(mediaId) {
  if (!mediaId || queuedIds.has(mediaId)) return;

  queuedIds.add(mediaId);
  queue.push(mediaId);
  runNext();
}

function enqueueMediaList(mediaList) {
  (mediaList || []).forEach((media) => {
    if (media?.type === 'image') enqueueMedia(media.id);
  });
}

module.exports = {
  enqueueMedia,
  enqueueMediaList,
};
