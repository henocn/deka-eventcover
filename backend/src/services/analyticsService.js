const { Event, Album, Media, MediaStat, AccessRole } = require('../models');

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

async function getAnalytics({ eventId } = {}) {
  const where = buildWhere(eventId);

  const [
    eventsCount,
    publishedEventsCount,
    albumsCount,
    activeAlbumsCount,
    mediaCount,
    badgesCount,
    stats,
    eventSummaries,
    topAlbums,
  ] = await Promise.all([
    Event.count(eventId ? { where: { id: eventId } } : undefined),
    Event.count(eventId ? { where: { id: eventId, isPublished: true } } : { where: { isPublished: true } }),
    Album.count({ where }),
    Album.count({ where: { ...where, isPublished: true } }),
    Media.count({ where }),
    AccessRole.count({ where }),
    MediaStat.findAll({ where: { ...where, action: ['view', 'download'] }, attributes: ['action'] }),
    getEventSummaries(),
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
      viewsCount: actionCounts.views,
      downloadsCount: actionCounts.downloads,
      interactionsCount: actionCounts.views + actionCounts.downloads,
    },
    eventSummaries,
    topAlbums,
  };
}

module.exports = {
  getAnalytics,
};
