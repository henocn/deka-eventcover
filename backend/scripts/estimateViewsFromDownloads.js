/**
 * Estime les vues a partir des telechargements (ratio 2 telechargements / 10 vues).
 * Conserve les telechargements existants, remplace les vues.
 *
 * Usage: node scripts/estimateViewsFromDownloads.js
 */
const { sequelize, MediaStat } = require('../src/models');

const VIEWS_PER_DOWNLOAD = 5; // 10 vues pour 2 telechargements

function randomOffsetMs() {
  return Math.floor(Math.random() * 12 * 60 * 1000) - 6 * 60 * 1000;
}

async function estimateViewsFromDownloads() {
  const downloads = await MediaStat.findAll({
    where: { action: 'download' },
    order: [['createdAt', 'ASC']],
  });

  const deletedViews = await MediaStat.destroy({ where: { action: 'view' } });
  console.log(`Vues existantes supprimees: ${deletedViews}`);
  console.log(`Telechargements conserves: ${downloads.length}`);

  const viewRows = [];

  downloads.forEach((download) => {
    const baseTime = new Date(download.createdAt).getTime();

    for (let index = 0; index < VIEWS_PER_DOWNLOAD; index += 1) {
      viewRows.push({
        eventId: download.eventId,
        albumId: download.albumId,
        mediaId: download.mediaId,
        action: 'view',
        ipHash: download.ipHash || null,
        userAgent: download.userAgent || null,
        createdAt: new Date(baseTime + randomOffsetMs() - index * 45_000),
      });
    }
  });

  const chunkSize = 500;
  let inserted = 0;

  for (let index = 0; index < viewRows.length; index += chunkSize) {
    const chunk = viewRows.slice(index, index + chunkSize);
    await MediaStat.bulkCreate(chunk);
    inserted += chunk.length;
    console.log(`Vues creees: ${inserted}/${viewRows.length}`);
  }

  console.log(`Done. Ratio applique: ${VIEWS_PER_DOWNLOAD} vues / telechargement (${downloads.length * VIEWS_PER_DOWNLOAD} vues).`);
}

estimateViewsFromDownloads()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
