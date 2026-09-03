const path = require('path');
const fs = require('fs/promises');
const { sequelize, Media } = require('../src/models');
const env = require('../src/config/env');
const {
  buildThumbnailRelativePath,
  generateImageThumbnail,
} = require('../src/services/thumbnailService');

function safeJoinUploadPath(relativePath) {
  const root = path.resolve(env.mediaRoot);
  const absolutePath = path.resolve(root, relativePath);
  const relativeToRoot = path.relative(root, absolutePath);

  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    throw new Error(`Invalid media path: ${relativePath}`);
  }

  return absolutePath;
}

// Regenere les vignettes WebP pour toutes les images (affichage uniquement, pas les originaux).
async function generateAllThumbnails() {
  const images = await Media.findAll({
    where: { type: 'image' },
    order: [['id', 'ASC']],
  });

  let generated = 0;
  let failed = 0;

  console.log(`Thumbnail size=${env.thumbnailMaxSize}px quality=${env.thumbnailQuality}`);
  console.log(`Scanning ${images.length} image(s)...`);

  for (const media of images) {
    const sourcePath = safeJoinUploadPath(media.storagePath);

    try {
      await fs.access(sourcePath);
    } catch {
      console.warn(`Source missing for media ${media.id}, skipped`);
      failed += 1;
      continue;
    }

    const thumbnailRelativePath = buildThumbnailRelativePath(media.storagePath);
    const thumbnailAbsolutePath = safeJoinUploadPath(thumbnailRelativePath);

    try {
      await fs.mkdir(path.dirname(thumbnailAbsolutePath), { recursive: true });
      const dimensions = await generateImageThumbnail(sourcePath, thumbnailAbsolutePath);
      await media.update({
        thumbnailPath: thumbnailRelativePath,
        width: dimensions.width,
        height: dimensions.height,
      });
      generated += 1;
      console.log(`OK media ${media.id}`);
    } catch (error) {
      failed += 1;
      console.error(`FAIL media ${media.id}: ${error.message}`);
    }
  }

  console.log(`Done. Generated=${generated}, failed=${failed}, scanned=${images.length}`);
}

generateAllThumbnails()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
