const { Op } = require('sequelize');
const { Event, Album, Media, MediaStat, AccessRole, FaceEmbedding } = require('../models');
const env = require('../config/env');

function buildWhere(eventId) {
  return eventId ? { eventId } : {};
}

function countByAction(stats) {
  return stats.reduce(
    (acc, stat) => {
      if (stat.action === 'view') acc.views += 1;
      if (stat.action === 'download') acc.downloads += 1;
      return acc;
    },
    { views: 0, downloads: 0 }
  );
}

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return -1;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }

  if (!normA || !normB) return -1;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Compte les visages detectes et estime le nombre de personnes uniques.
async function getFaceStats(eventId) {
  const faces = await FaceEmbedding.findAll({
    where: buildWhere(eventId),
    attributes: ['embedding'],
  });

  const facesCount = faces.length;
  if (facesCount === 0) {
    return { facesCount: 0, peopleEstimate: 0 };
  }

  const representatives = [];
  const threshold = env.faceMatchThreshold;

  for (const face of faces) {
    const embedding = Array.isArray(face.embedding) ? face.embedding : null;
    if (!embedding) continue;

    const alreadySeen = representatives.some(
      (representative) => cosineSimilarity(representative, embedding) >= threshold,
    );

    if (!alreadySeen) {
      representatives.push(embedding);
    }
  }

  return {
    facesCount,
    peopleEstimate: representatives.length,
  };
}

function toDayKey(dateValue) {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Construit la courbe journaliere des vues et telechargements.
async function getActivityTimeline(eventId) {
  const stats = await MediaStat.findAll({
    where: {
      ...buildWhere(eventId),
      action: { [Op.in]: ['view', 'download'] },
    },
    attributes: ['action', 'createdAt'],
    order: [['createdAt', 'ASC']],
  });

  if (stats.length === 0) {
    return [];
  }

  const byDay = new Map();

  stats.forEach((stat) => {
    const day = toDayKey(stat.createdAt);
    const current = byDay.get(day) || { date: day, views: 0, downloads: 0 };
    if (stat.action === 'view') current.views += 1;
    if (stat.action === 'download') current.downloads += 1;
    byDay.set(day, current);
  });

  const days = [...byDay.keys()].sort();
  const first = new Date(`${days[0]}T12:00:00`);
  const last = new Date(`${days[days.length - 1]}T12:00:00`);
  const timeline = [];

  for (let cursor = new Date(first); cursor <= last; cursor.setDate(cursor.getDate() + 1)) {
    const key = toDayKey(cursor);
    timeline.push(byDay.get(key) || { date: key, views: 0, downloads: 0 });
  }

  return timeline;
}

async function getAlbumLeaderboard(eventId) {
  const albums = await Album.findAll({
    where: buildWhere(eventId),
    attributes: ['id', 'title', 'slug', 'eventId', 'isPublished'],
    include: [
      { model: Event, as: 'event', attributes: ['id', 'title', 'slug'], required: true },
      { model: Media, as: 'media', attributes: ['id'], required: false },
    ],
    order: [['createdAt', 'DESC']],
  });
  const albumIds = albums.map((album) => album.id);
  const stats = albumIds.length > 0
    ? await MediaStat.findAll({
      where: {
        albumId: albumIds,
        action: ['view', 'download'],
      },
      attributes: ['albumId', 'action'],
    })
    : [];
  const statMap = new Map();

  stats.forEach((stat) => {
    const current = statMap.get(stat.albumId) || { views: 0, downloads: 0 };
    if (stat.action === 'view') current.views += 1;
    if (stat.action === 'download') current.downloads += 1;
    statMap.set(stat.albumId, current);
  });

  return albums
    .map((album) => {
      const counts = statMap.get(album.id) || { views: 0, downloads: 0 };
      return {
        id: album.id,
        title: album.title,
        slug: album.slug,
        isPublished: album.isPublished,
        event: album.event ? {
          id: album.event.id,
          title: album.event.title,
          slug: album.event.slug,
        } : null,
        mediaCount: album.media?.length || 0,
        views: counts.views,
        downloads: counts.downloads,
        score: counts.views + counts.downloads * 2,
      };
    })
    .sort((a, b) => b.score - a.score || b.mediaCount - a.mediaCount)
    .slice(0, 8);
}

async function getAnalytics({ eventId } = {}) {
  const where = buildWhere(eventId);

  const [
    eventsCount,
    publishedEventsCount,
    albumsCount,
    activeAlbumsCount,
    mediaCount,
    badgesCount,
    faceStats,
    stats,
    activityTimeline,
    topAlbums,
  ] = await Promise.all([
    Event.count(eventId ? { where: { id: eventId } } : undefined),
    Event.count(eventId ? { where: { id: eventId, isPublished: true } } : { where: { isPublished: true } }),
    Album.count({ where }),
    Album.count({ where: { ...where, isPublished: true } }),
    Media.count({ where }),
    AccessRole.count({ where }),
    getFaceStats(eventId),
    MediaStat.findAll({ where: { ...where, action: ['view', 'download'] }, attributes: ['action'] }),
    getActivityTimeline(eventId),
    getAlbumLeaderboard(eventId),
  ]);

  const actionCounts = countByAction(stats);

  return {
    scope: {
      eventId: eventId || null,
      generatedAt: new Date().toISOString(),
    },
    totals: {
      eventsCount,
      publishedEventsCount,
      draftEventsCount: Math.max(eventsCount - publishedEventsCount, 0),
      albumsCount,
      activeAlbumsCount,
      mediaCount,
      badgesCount,
      facesCount: faceStats.facesCount,
      peopleEstimate: faceStats.peopleEstimate,
      viewsCount: actionCounts.views,
      downloadsCount: actionCounts.downloads,
    },
    activityTimeline,
    topAlbums,
  };
}

module.exports = {
  getAnalytics,
};
