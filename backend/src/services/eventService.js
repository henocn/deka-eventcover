const { Op } = require('sequelize');
const { Event, Album, Media, MediaStat } = require('../models');
const httpError = require('../utils/httpError');
const makeSlug = require('../utils/slug');

const eventPublicAttributes = [
  'id',
  'title',
  'slug',
  'description',
  'location',
  'startsAt',
  'endsAt',
  'coverMediaId',
  'isPublished',
];

const albumPublicAttributes = [
  'id',
  'eventId',
  'title',
  'slug',
  'description',
  'coverMediaId',
  'sortOrder',
  'isPublished',
];

const mediaPublicAttributes = [
  'id',
  'albumId',
  'type',
  'mimeType',
  'originalName',
  'publicUrl',
  'width',
  'height',
  'sortOrder',
];

function isProtected(event) {
  return Boolean(event.accessCode);
}

function hasAccess(event, accessCode) {
  return !isProtected(event) || event.accessCode === accessCode;
}

function serializeMedia(media) {
  if (!media) return null;

  return {
    id: media.id,
    albumId: media.albumId,
    type: media.type,
    mimeType: media.mimeType,
    originalName: media.originalName,
    publicUrl: media.publicUrl,
    width: media.width,
    height: media.height,
    sortOrder: media.sortOrder,
    downloadUrl: `/api/public/media/${media.id}/download`,
  };
}

function serializeAlbum(album, includeMedia = false) {
  const media = includeMedia && album.media ? album.media.map(serializeMedia) : undefined;

  return {
    id: album.id,
    eventId: album.eventId,
    title: album.title,
    slug: album.slug,
    description: album.description,
    coverMediaId: album.coverMediaId,
    sortOrder: album.sortOrder,
    isPublished: album.isPublished,
    media,
  };
}

function serializePublicEvent(event) {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description,
    location: event.location,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    coverMediaId: event.coverMediaId,
    isProtected: isProtected(event),
    albums: event.albums ? event.albums.map((album) => serializeAlbum(album)) : [],
  };
}

function normalizeEventPayload(payload, fallbackSlug) {
  const nextPayload = { ...payload };

  if (nextPayload.title && !nextPayload.slug) {
    nextPayload.slug = makeSlug(fallbackSlug || nextPayload.title);
  } else if (nextPayload.slug) {
    nextPayload.slug = makeSlug(nextPayload.slug);
  }

  return nextPayload;
}

function normalizeAlbumPayload(payload, fallbackSlug) {
  const nextPayload = { ...payload };

  if (nextPayload.title && !nextPayload.slug) {
    nextPayload.slug = makeSlug(fallbackSlug || nextPayload.title);
  } else if (nextPayload.slug) {
    nextPayload.slug = makeSlug(nextPayload.slug);
  }

  return nextPayload;
}

async function buildUniqueEventSlug(baseSlug, ignoreId) {
  const normalizedBase = makeSlug(baseSlug) || 'event';
  let candidate = normalizedBase;
  let suffix = 2;

  while (true) {
    const where = { slug: candidate };

    if (ignoreId) {
      where.id = { [Op.ne]: ignoreId };
    }

    const existing = await Event.findOne({ where });

    if (!existing) {
      return candidate;
    }

    candidate = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }
}

async function buildUniqueAlbumSlug(eventId, baseSlug, ignoreId) {
  const normalizedBase = makeSlug(baseSlug) || 'album';
  let candidate = normalizedBase;
  let suffix = 2;

  while (true) {
    const where = { eventId, slug: candidate };

    if (ignoreId) {
      where.id = { [Op.ne]: ignoreId };
    }

    const existing = await Album.findOne({ where });

    if (!existing) {
      return candidate;
    }

    candidate = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }
}

async function listEvents() {
  return Event.findAll({
    order: [
      ['startsAt', 'DESC'],
      ['createdAt', 'DESC'],
    ],
    include: [
      {
        model: Album,
        as: 'albums',
        attributes: ['id', 'title', 'slug', 'isPublished', 'sortOrder'],
        required: false,
      },
    ],
  });
}

async function getEventById(eventId) {
  const event = await Event.findByPk(eventId, {
    include: [
      {
        model: Album,
        as: 'albums',
        required: false,
        order: [['sortOrder', 'ASC']],
      },
    ],
  });

  if (!event) {
    throw httpError(404, 'Event not found');
  }

  return event;
}

async function createEvent(payload, user) {
  const nextPayload = normalizeEventPayload(payload);
  nextPayload.slug = await buildUniqueEventSlug(nextPayload.slug);

  if (user) {
    nextPayload.createdBy = user.id;
  }

  return Event.create(nextPayload);
}

async function updateEvent(eventId, payload) {
  const event = await getEventById(eventId);
  const nextPayload = normalizeEventPayload(payload, event.slug);

  if (nextPayload.slug) {
    nextPayload.slug = await buildUniqueEventSlug(nextPayload.slug, event.id);
  }

  await event.update(nextPayload);
  return getEventById(event.id);
}

async function deleteEvent(eventId) {
  const event = await getEventById(eventId);
  await event.destroy();

  return {
    id: event.id,
    deleted: true,
  };
}

async function createAlbum(eventId, payload) {
  await getEventById(eventId);

  const nextPayload = normalizeAlbumPayload(payload);
  nextPayload.eventId = eventId;
  nextPayload.slug = await buildUniqueAlbumSlug(eventId, nextPayload.slug);

  return Album.create(nextPayload);
}

async function updateAlbum(albumId, payload) {
  const album = await Album.findByPk(albumId);

  if (!album) {
    throw httpError(404, 'Album not found');
  }

  const nextPayload = normalizeAlbumPayload(payload, album.slug);

  if (nextPayload.slug) {
    nextPayload.slug = await buildUniqueAlbumSlug(album.eventId, nextPayload.slug, album.id);
  }

  await album.update(nextPayload);
  return album.reload();
}

async function getEventStats(eventId) {
  await getEventById(eventId);

  const [albumsCount, mediaCount, viewsCount, downloadsCount, latestMedia] = await Promise.all([
    Album.count({ where: { eventId } }),
    Media.count({ where: { eventId } }),
    MediaStat.count({ where: { eventId, action: 'view' } }),
    MediaStat.count({ where: { eventId, action: 'download' } }),
    Media.findAll({
      where: { eventId },
      attributes: ['id', 'type', 'originalName', 'publicUrl', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5,
    }),
  ]);

  return {
    albumsCount,
    mediaCount,
    viewsCount,
    downloadsCount,
    latestMedia,
  };
}

async function getPublicEvent(slug, accessCode) {
  const event = await Event.findOne({
    where: { slug, isPublished: true },
    attributes: [...eventPublicAttributes, 'accessCode'],
    include: [
      {
        model: Album,
        as: 'albums',
        where: { isPublished: true },
        required: false,
        attributes: albumPublicAttributes,
        order: [['sortOrder', 'ASC']],
      },
    ],
  });

  if (!event) {
    throw httpError(404, 'Event not found');
  }

  if (!hasAccess(event, accessCode)) {
    const error = httpError(403, 'Access code required');
    error.requiresAccessCode = true;
    throw error;
  }

  return serializePublicEvent(event);
}

async function validateEventAccess(slug, accessCode) {
  const event = await Event.findOne({
    where: { slug, isPublished: true },
    attributes: ['id', 'slug', 'accessCode'],
  });

  if (!event) {
    throw httpError(404, 'Event not found');
  }

  if (!hasAccess(event, accessCode)) {
    throw httpError(403, 'Invalid access code');
  }

  return {
    ok: true,
    slug: event.slug,
  };
}

async function getPublicAlbum(eventSlug, albumSlug, accessCode) {
  const event = await Event.findOne({
    where: { slug: eventSlug, isPublished: true },
    attributes: [...eventPublicAttributes, 'accessCode'],
  });

  if (!event) {
    throw httpError(404, 'Event not found');
  }

  if (!hasAccess(event, accessCode)) {
    const error = httpError(403, 'Access code required');
    error.requiresAccessCode = true;
    throw error;
  }

  const album = await Album.findOne({
    where: {
      eventId: event.id,
      slug: albumSlug,
      isPublished: true,
    },
    attributes: albumPublicAttributes,
    include: [
      {
        model: Media,
        as: 'media',
        required: false,
        attributes: mediaPublicAttributes,
      },
    ],
    order: [[{ model: Media, as: 'media' }, 'sortOrder', 'ASC']],
  });

  if (!album) {
    throw httpError(404, 'Album not found');
  }

  return {
    event: serializePublicEvent(event),
    album: serializeAlbum(album, true),
  };
}

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventStats,
  createAlbum,
  updateAlbum,
  getPublicEvent,
  validateEventAccess,
  getPublicAlbum,
};
