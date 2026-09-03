const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const env = require('../config/env');

const MAX_THUMB_BYTES = 400 * 1024;

// Construit le chemin relatif de la vignette a partir du fichier original.
function buildThumbnailRelativePath(relativeStoragePath) {
  const parsed = path.parse(relativeStoragePath);
  return path.join(parsed.dir, `${parsed.name}.thumb.webp`);
}

// Encode une vignette WebP a une qualite donnee.
async function encodeWebp(sourceAbsolutePath, size, quality) {
  return sharp(sourceAbsolutePath, { failOn: 'none' })
    .autoOrient()
    .resize({
      width: size,
      height: size,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality,
      effort: 4,
    })
    .toBuffer();
}

// Genere une vignette WebP (<= 400 Ko) et retourne les dimensions de l'original.
async function generateImageThumbnail(sourceAbsolutePath, thumbnailAbsolutePath) {
  const metadata = await sharp(sourceAbsolutePath, { failOn: 'none' }).metadata();
  const size = env.thumbnailMaxSize;
  let quality = env.thumbnailQuality;
  let buffer = await encodeWebp(sourceAbsolutePath, size, quality);

  // Si trop lourd, baisse la qualite par paliers jusqu'au plafond 400 Ko.
  while (buffer.length > MAX_THUMB_BYTES && quality > 60) {
    quality -= 4;
    buffer = await encodeWebp(sourceAbsolutePath, size, quality);
  }

  // Dernier recours : reduire la resolution si toujours trop lourd.
  let currentSize = size;
  while (buffer.length > MAX_THUMB_BYTES && currentSize > 1280) {
    currentSize = Math.max(1280, currentSize - 160);
    buffer = await encodeWebp(sourceAbsolutePath, currentSize, Math.min(quality, 80));
  }

  await fs.mkdir(path.dirname(thumbnailAbsolutePath), { recursive: true });
  await fs.writeFile(thumbnailAbsolutePath, buffer);

  return {
    width: metadata.width || null,
    height: metadata.height || null,
  };
}

// Supprime la vignette associee si elle existe sur le disque.
async function deleteThumbnailFile(thumbnailAbsolutePath) {
  await fs.unlink(thumbnailAbsolutePath).catch((error) => {
    if (error.code !== 'ENOENT') {
      console.warn(`Unable to delete thumbnail ${thumbnailAbsolutePath}: ${error.message}`);
    }
  });
}

module.exports = {
  MAX_THUMB_BYTES,
  buildThumbnailRelativePath,
  deleteThumbnailFile,
  generateImageThumbnail,
};
