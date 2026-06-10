const { Op } = require('sequelize');
const { Event, Album, Media, MediaStat, AccessRole } = require('../models');

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_DAYS = 14;

function startOfDay(date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function formatDateKey(date) {
  return date.toISOString().slice(0, 10);
}

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

function buildDailySeries(stats) {
  const today = startOfDay(new Date());
  const days = Array.from({ length: RECENT_DAYS }, (_, index) => {
    const date = new Date(today.getTime() - (RECENT_DAYS - 1 - index) * DAY_MS);
    return {
      date: formatDateKey(date),
      label: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      views: 0,
      downloads: 0,
    };
  });
  const byDate = new Map(days.map((day) => [day.date, day]));

  stats.forEach((stat) => {
    const key = formatDateKey(new Date(stat.createdAt));
    const day = byDate.get(key);
    if (!day) return;
    if (stat.action === 'view') day.views += 1;
    if (stat.action === 'download') day.downloads += 1;
  });

  return days;
}

async function getEventSummaries() {
  const events = await Event.findAll({
    attributes: ['id', 'title', 'slug', 'isPublished', 'startsAt', 'createdAt'],
    include: [
      { model: Album, as: 'albums', attributes: ['id'], required: false },
      { model: Media, as: 'media', attributes: ['id'], required: false },
      { model: AccessRole, as: 'accessRoles', attributes: ['id'], required: false },
    ],
    order: [['createdAt', 'DESC']],
  });

  return events.map((event) => ({
    id: event.id,
    title: event.title,
    slug: event.slug,
    isPublished: event.isPublished,
    startsAt: event.startsAt,
    albumsCount: event.albums?.length || 0,
    mediaCount: event.media?.length || 0,
    badgesCount: event.accessRoles?.length || 0,
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
    .slice(0, 8);
}

async function getRecentUploads(eventId) {
  const media = await Media.findAll({
    where: buildWhere(eventId),
    attributes: ['id', 'originalName', 'type', 'mimeType', 'createdAt', 'sizeBytes'],
    include: [
      { model: Album, as: 'album', attributes: ['id', 'title', 'slug'], required: true },
      { model: Event, as: 'event', attributes: ['id', 'title', 'slug'], required: true },
    ],
    order: [['createdAt', 'DESC']],
    limit: 8,
  });

  return media.map((item) => ({
    id: item.id,
    originalName: item.originalName,
    type: item.type,
    mimeType: item.mimeType,
    sizeBytes: Number(item.sizeBytes || 0),
    createdAt: item.createdAt,
    album: item.album,
    event: item.event,
  }));
}

async function getAnalytics({ eventId } = {}) {
  const where = buildWhere(eventId);
  const recentStart = startOfDay(new Date(Date.now() - (RECENT_DAYS - 1) * DAY_MS));

  const [
    eventsCount,
    publishedEventsCount,
    albumsCount,
    activeAlbumsCount,
    mediaCount,
    badgesCount,
    stats,
    recentStats,
    eventSummaries,
    topAlbums,
    recentUploads,
  ] = await Promise.all([
    Event.count(eventId ? { where: { id: eventId } } : undefined),
    Event.count(eventId ? { where: { id: eventId, isPublished: true } } : { where: { isPublished: true } }),
    Album.count({ where }),
    Album.count({ where: { ...where, isPublished: true } }),
    Media.count({ where }),
    AccessRole.count({ where }),
    MediaStat.findAll({ where: { ...where, action: ['view', 'download'] }, attributes: ['action'] }),
    MediaStat.findAll({
      where: {
        ...where,
        action: ['view', 'download'],
        createdAt: { [Op.gte]: recentStart },
      },
      attributes: ['action', 'createdAt'],
    }),
    getEventSummaries(),
    getAlbumLeaderboard(eventId),
    getRecentUploads(eventId),
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
      viewsCount: actionCounts.views,
      downloadsCount: actionCounts.downloads,
      interactionsCount: actionCounts.views + actionCounts.downloads,
    },
    dailySeries: buildDailySeries(recentStats),
    eventSummaries,
    topAlbums,
    recentUploads,
  };
}

module.exports = {
  getAnalytics,
};
