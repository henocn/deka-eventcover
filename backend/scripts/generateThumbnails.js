const path = require('path');
const fs = require('fs/promises');
const { Op } = require('sequelize');
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

// Regenere les vignettes manquantes pour les images deja stockees.
async function generateMissingThumbnails() {
  const images = await Media.findAll({
    where: {
      type: 'image',
      [Op.or]: [
        { thumbnailPath: null },
        { thumbnailPath: '' },
      ],
    },
    order: [['id', 'ASC']],
  });

  let generated = 0;
  let failed = 0;

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
      const dimensions = await generateImageThumbnail(sourcePath, thumbnailAbsolutePath);
      await media.update({
        thumbnailPath: thumbnailRelativePath,
        width: dimensions.width,
        height: dimensions.height,
      });
      generated += 1;
      console.log(`Thumbnail generated for media ${media.id}`);
    } catch (error) {
      failed += 1;
      console.error(`Thumbnail failed for media ${media.id}: ${error.message}`);
    }
  }

  console.log(`Done. Generated=${generated}, failed=${failed}, scanned=${images.length}`);
}

generateMissingThumbnails()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
