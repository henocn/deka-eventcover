const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const env = require('../config/env');

// Construit le chemin relatif de la vignette a partir du fichier original.
function buildThumbnailRelativePath(relativeStoragePath) {
  const parsed = path.parse(relativeStoragePath);
  return path.join(parsed.dir, `${parsed.name}.thumb.webp`);
}

// Genere une vignette WebP et retourne les dimensions de l'original.
async function generateImageThumbnail(sourceAbsolutePath, thumbnailAbsolutePath) {
  const metadata = await sharp(sourceAbsolutePath, { failOn: 'none' }).metadata();

  await sharp(sourceAbsolutePath, { failOn: 'none' })
    .autoOrient()
    .resize({
      width: env.thumbnailMaxSize,
      height: env.thumbnailMaxSize,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality: env.thumbnailQuality,
      effort: 4,
    })
    .toFile(thumbnailAbsolutePath);

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
  buildThumbnailRelativePath,
  deleteThumbnailFile,
  generateImageThumbnail,
};
