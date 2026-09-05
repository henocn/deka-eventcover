const { Op } = require('sequelize');
const { Event, Album, Media, MediaStat, AccessRole, FaceEmbedding } = require('../models');

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

// Compte uniquement les visages detectes (embeddings indexes).
async function getFaceStats(eventId) {
  const facesCount = await FaceEmbedding.count({ where: buildWhere(eventId) });
  return { facesCount };
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function toDayKey(dateValue) {
  const date = new Date(dateValue);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toHourKey(dateValue) {
  const date = new Date(dateValue);
  return `${toDayKey(date)}T${pad(date.getHours())}:00`;
}

function toWeekKey(dateValue) {
  const date = new Date(dateValue);
  const day = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((day - yearStart) / 86400000) + 1) / 7);
  return `${day.getUTCFullYear()}-W${pad(week)}`;
}

function startOfPeriod(period) {
  const now = new Date();
  if (period === 'day') return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (period === 'week') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (period === 'month') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return null;
}

function fillBuckets(keys, byBucket, period) {
  if (period === 'day') {
    const timeline = [];
    const end = new Date();
    end.setMinutes(0, 0, 0);
    const start = new Date(end.getTime() - 23 * 60 * 60 * 1000);

    for (let cursor = new Date(start); cursor <= end; cursor.setHours(cursor.getHours() + 1)) {
      const key = toHourKey(cursor);
      timeline.push(byBucket.get(key) || { date: key, views: 0, downloads: 0 });
    }
    return timeline;
  }

  if (period === 'week' || period === 'month') {
    const timeline = [];
    const end = new Date();
    end.setHours(12, 0, 0, 0);
    const dayCount = period === 'week' ? 6 : 29;
    const start = new Date(end);
    start.setDate(end.getDate() - dayCount);

    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      const key = toDayKey(cursor);
      timeline.push(byBucket.get(key) || { date: key, views: 0, downloads: 0 });
    }
    return timeline;
  }

  if (keys.length === 0) return [];

  if (keys[0].includes('-W')) {
    return keys.map((key) => byBucket.get(key) || { date: key, views: 0, downloads: 0 });
  }

  const first = new Date(`${keys[0].slice(0, 10)}T12:00:00`);
  const last = new Date(`${keys[keys.length - 1].slice(0, 10)}T12:00:00`);
  const timeline = [];

  for (let cursor = new Date(first); cursor <= last; cursor.setDate(cursor.getDate() + 1)) {
    const key = toDayKey(cursor);
    timeline.push(byBucket.get(key) || { date: key, views: 0, downloads: 0 });
  }

  return timeline;
}

// Construit la courbe d'activite selon la periode demandee.
async function getActivityTimeline(eventId, period = 'month') {
  const start = startOfPeriod(period);
  const where = {
    ...buildWhere(eventId),
    action: { [Op.in]: ['view', 'download'] },
  };

  if (start) {
    where.createdAt = { [Op.gte]: start };
  }

  const stats = await MediaStat.findAll({
    where,
    attributes: ['action', 'createdAt'],
    order: [['createdAt', 'ASC']],
  });

  if (stats.length === 0) {
    if (period === 'day' || period === 'week' || period === 'month') {
      return fillBuckets([], new Map(), period);
    }
    return [];
  }

  const spanDays = (() => {
    const first = new Date(stats[0].createdAt).getTime();
    const last = new Date(stats[stats.length - 1].createdAt).getTime();
    return Math.max(1, Math.ceil((last - first) / (24 * 60 * 60 * 1000)));
  })();

  const useWeeks = period === 'all' && spanDays > 60;
  const byBucket = new Map();

  stats.forEach((stat) => {
    let key;
    if (period === 'day') key = toHourKey(stat.createdAt);
    else if (useWeeks) key = toWeekKey(stat.createdAt);
    else key = toDayKey(stat.createdAt);

    const current = byBucket.get(key) || { date: key, views: 0, downloads: 0 };
    if (stat.action === 'view') current.views += 1;
    if (stat.action === 'download') current.downloads += 1;
    byBucket.set(key, current);
  });

  const keys = [...byBucket.keys()].sort();
  return fillBuckets(keys, byBucket, useWeeks ? 'all' : period).map((point) => ({
    ...point,
    period,
  }));
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
    .slice(0, 10);
}

async function getAnalytics({ eventId, period = 'day' } = {}) {
  const where = buildWhere(eventId);
  const safePeriod = ['day', 'week', 'month', 'all'].includes(period) ? period : 'month';

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
    getActivityTimeline(eventId, safePeriod),
    getAlbumLeaderboard(eventId),
  ]);

  const actionCounts = countByAction(stats);

  return {
    scope: {
      eventId: eventId || null,
      period: safePeriod,
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
