const { Op } = require('sequelize');
const { Media, sequelize } = require('../src/models');
const faceService = require('../src/services/faceService');

async function main() {
  const force = process.argv.includes('--force');
  const where = {
    type: 'image',
    mimeType: { [Op.iLike]: 'image/%' },
  };

  if (!force) {
    where.faceAnalysisStatus = { [Op.in]: ['pending', 'failed'] };
  }

  const mediaItems = await Media.findAll({
    where,
    order: [['id', 'ASC']],
  });

  console.log(`Face analysis: ${mediaItems.length} image(s) to process`);

  for (let index = 0; index < mediaItems.length; index += 1) {
    const media = mediaItems[index];
    process.stdout.write(`[${index + 1}/${mediaItems.length}] media #${media.id}... `);

    try {
      await faceService.analyzeMediaFaces(media.id);
      await media.reload();
      process.stdout.write(`${media.faceAnalysisStatus}\n`);
    } catch (error) {
      process.stdout.write(`failed: ${error.message}\n`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
