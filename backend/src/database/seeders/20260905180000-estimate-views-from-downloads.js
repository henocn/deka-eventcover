'use strict';

/**
 * Seed: recree les vues a partir des telechargements (2 downloads / 10 vues).
 * Les telechargements restent intacts.
 */
const VIEWS_PER_DOWNLOAD = 5;

function randomOffsetMs() {
  return Math.floor(Math.random() * 12 * 60 * 1000) - 6 * 60 * 1000;
}

module.exports = {
  async up(queryInterface) {
    const [downloads] = await queryInterface.sequelize.query(
      `SELECT id, event_id, album_id, media_id, ip_hash, user_agent, created_at
       FROM media_stats
       WHERE action = 'download'
       ORDER BY created_at ASC`,
    );

    await queryInterface.bulkDelete('media_stats', { action: 'view' });

    if (!downloads.length) {
      console.log('Aucun telechargement: aucune vue estimee.');
      return;
    }

    const viewRows = [];

    downloads.forEach((download) => {
      const baseTime = new Date(download.created_at).getTime();

      for (let index = 0; index < VIEWS_PER_DOWNLOAD; index += 1) {
        viewRows.push({
          event_id: download.event_id,
          album_id: download.album_id,
          media_id: download.media_id,
          action: 'view',
          ip_hash: download.ip_hash || null,
          user_agent: download.user_agent || null,
          created_at: new Date(baseTime + randomOffsetMs() - index * 45_000),
        });
      }
    });

    const chunkSize = 500;
    for (let index = 0; index < viewRows.length; index += chunkSize) {
      await queryInterface.bulkInsert('media_stats', viewRows.slice(index, index + chunkSize));
    }

    console.log(`Vues estimees: ${viewRows.length} (ratio ${VIEWS_PER_DOWNLOAD}x telechargements).`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('media_stats', { action: 'view' });
  },
};
