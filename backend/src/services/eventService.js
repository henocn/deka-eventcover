const { Op } = require('sequelize');
const { Event, Album, Media, MediaStat, AccessRole } = require('../models');
const env = require('../config/env');
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
  'faceAnalysisStatus',
  'faceAnalysisError',
];

function isProtected(event) {
  return Boolean(event.accessCode);
}

function hasAccess(event, accessCode) {
  return !isProtected(event) || event.accessCode === accessCode;
}

function buildParticipantUrl(event, role) {
  const publicUrl = new URL(`/events/${event.slug}`, env.participantAppUrl.replace(/\/$/, ''));

  if (role?.publicToken) {
    publicUrl.searchParams.set('role', role.publicToken.toUpperCase());
  }

  return publicUrl.toString();
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
    faceAnalysisStatus: media.faceAnalysisStatus,
    faceAnalysisError: media.faceAnalysisError,
    downloadUrl: `/api/public/media/${media.id}/download`,
  };
}

function serializeAlbum(album, includeMedia = false) {
  const media = includeMedia && album.media ? album.media.map(serializeMedia) : undefined;
  const mediaCount = album.media ? album.media.length : undefined;
  const photoCount = album.media ? album.media.filter((item) => item.type === 'image').length : undefined;

  return {
    id: album.id,
    eventId: album.eventId,
    title: album.title,
    slug: album.slug,
    description: album.description,
    coverMediaId: album.coverMediaId,
    coverMedia: serializeMedia(album.coverMedia),
    mediaCount,
    photoCount,
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

function serializeAccessRole(role, event) {
  return {
    id: role.id,
    eventId: role.eventId,
    name: role.name,
    publicToken: role.publicToken,
    badgeCode: role.publicToken,
    description: role.description,
    isActive: role.isActive,
    albums: role.albums ? role.albums.map((album) => serializeAlbum(album)) : [],
    publicUrl: event ? buildParticipantUrl(event, role) : undefined,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
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

function extractAccessRoleIds(payload) {
  const nextPayload = { ...payload };
  const accessRoleIds = nextPayload.accessRoleIds;
  delete nextPayload.accessRoleIds;

  return {
    nextPayload,
    accessRoleIds,
  };
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

async function syncAlbumAccessRoles(album, accessRoleIds) {
  const roles = await AccessRole.findAll({
    where: {
      eventId: album.eventId,
      id: accessRoleIds,
    },
  });

  if (roles.length !== accessRoleIds.length) {
    throw httpError(400, 'Un ou plusieurs badges ne sont pas rattaches a cet evenement.');
  }

  await album.setAccessRoles(roles);
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
        attributes: albumPublicAttributes,
        required: false,
        include: [
          {
            model: Media,
            as: 'coverMedia',
            required: false,
            attributes: mediaPublicAttributes,
          },
          {
            model: Media,
            as: 'media',
            required: false,
            attributes: mediaPublicAttributes,
          },
        ],
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

  const { nextPayload: albumPayload, accessRoleIds } = extractAccessRoleIds(payload);
  const nextPayload = normalizeAlbumPayload(albumPayload);
  nextPayload.eventId = eventId;
  nextPayload.slug = await buildUniqueAlbumSlug(eventId, nextPayload.slug);

  const album = await Album.create(nextPayload);

  if (accessRoleIds) {
    await syncAlbumAccessRoles(album, accessRoleIds);
  }

  return album.reload();
}

async function updateAlbum(albumId, payload) {
  const album = await Album.findByPk(albumId);

  if (!album) {
    throw httpError(404, 'Album not found');
  }

  const { nextPayload: albumPayload, accessRoleIds } = extractAccessRoleIds(payload);
  const nextPayload = normalizeAlbumPayload(albumPayload, album.slug);

  if (nextPayload.coverMediaId) {
    const coverMedia = await Media.findOne({
      where: {
        id: nextPayload.coverMediaId,
        albumId: album.id,
        type: 'image',
      },
    });

    if (!coverMedia) {
      throw httpError(400, "La photo de couverture doit appartenir a cet album.");
    }
  }

  if (nextPayload.slug) {
    nextPayload.slug = await buildUniqueAlbumSlug(album.eventId, nextPayload.slug, album.id);
  }

  await album.update(nextPayload);

  if (accessRoleIds) {
    await syncAlbumAccessRoles(album, accessRoleIds);
  }

  return album.reload();
}

async function getAlbumById(albumId) {
  const album = await Album.findByPk(albumId, {
    include: [
      {
        model: Media,
        as: 'coverMedia',
        required: false,
        attributes: mediaPublicAttributes,
      },
      {
        model: AccessRole,
        as: 'accessRoles',
        required: false,
        attributes: ['id', 'name', 'publicToken', 'isActive'],
        through: { attributes: [] },
      },
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

  return album;
}

async function deleteAlbum(albumId) {
  const album = await Album.findByPk(albumId);

  if (!album) {
    throw httpError(404, 'Album not found');
  }

  await album.destroy();

  return {
    id: album.id,
    eventId: album.eventId,
    deleted: true,
  };
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

function normalizeBadgeCode(code) {
  return String(code || '').trim().toUpperCase();
}

function generateBadgeCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

async function buildUniqueBadgeCode(preferredCode) {
  if (preferredCode) {
    const normalizedCode = normalizeBadgeCode(preferredCode);
    const existing = await AccessRole.findOne({ where: { publicToken: normalizedCode } });

    if (existing) {
      throw httpError(409, 'Ce code badge est deja utilise.');
    }

    return normalizedCode;
  }

  while (true) {
    const candidate = generateBadgeCode();
    const existing = await AccessRole.findOne({ where: { publicToken: candidate } });

    if (!existing) {
      return candidate;
    }
  }
}

async function listAccessRoles(eventId) {
  const event = await getEventById(eventId);
  const roles = await AccessRole.findAll({
    where: { eventId },
    include: [
      {
        model: Album,
        as: 'albums',
        required: false,
        attributes: albumPublicAttributes,
        through: { attributes: [] },
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return roles.map((role) => serializeAccessRole(role, event));
}

async function createAccessRole(eventId, payload) {
  const event = await getEventById(eventId);
  const albumIds = payload.albumIds || [];
  const albums = albumIds.length > 0
    ? await Album.findAll({
      where: {
        eventId,
        id: albumIds,
      },
    })
    : [];

  if (albums.length !== albumIds.length) {
    throw httpError(400, 'Un ou plusieurs albums ne sont pas rattaches a cet evenement.');
  }

  const role = await AccessRole.create({
    eventId,
    name: payload.name,
    description: payload.description,
    publicToken: await buildUniqueBadgeCode(payload.badgeCode),
    isActive: true,
  });

  await role.setAlbums(albums);
  await role.reload({
    include: [
      {
        model: Album,
        as: 'albums',
        required: false,
        attributes: albumPublicAttributes,
        through: { attributes: [] },
      },
    ],
  });

  return serializeAccessRole(role, event);
}

async function updateAccessRole(roleId, payload) {
  const role = await AccessRole.findByPk(roleId, {
    include: [
      {
        model: Album,
        as: 'albums',
        required: false,
        attributes: albumPublicAttributes,
        through: { attributes: [] },
      },
    ],
  });

  if (!role) {
    throw httpError(404, 'Badge not found');
  }

  const updates = {};

  if (payload.name !== undefined) updates.name = payload.name;
  if (payload.description !== undefined) updates.description = payload.description;
  if (payload.isActive !== undefined) updates.isActive = payload.isActive;

  if (payload.badgeCode !== undefined) {
    const normalizedCode = normalizeBadgeCode(payload.badgeCode);
    const existing = await AccessRole.findOne({
      where: {
        publicToken: normalizedCode,
        id: { [Op.ne]: role.id },
      },
    });

    if (existing) {
      throw httpError(409, 'Ce code badge est deja utilise.');
    }

    updates.publicToken = normalizedCode;
  }

  await role.update(updates);
  await role.reload({
    include: [
      {
        model: Album,
        as: 'albums',
        required: false,
        attributes: albumPublicAttributes,
        through: { attributes: [] },
      },
    ],
  });

  const event = await getEventById(role.eventId);
  return serializeAccessRole(role, event);
}

async function deleteAccessRole(roleId) {
  const role = await AccessRole.findByPk(roleId);

  if (!role) {
    throw httpError(404, 'Badge not found');
  }

  await role.destroy();

  return {
    id: role.id,
    deleted: true,
  };
}

async function resolveAccessRole(eventId, publicToken) {
  if (!publicToken) return null;

  const role = await AccessRole.findOne({
    where: {
      eventId,
      publicToken: normalizeBadgeCode(publicToken),
      isActive: true,
    },
    include: [
      {
        model: Album,
        as: 'albums',
        required: false,
        attributes: ['id'],
        through: { attributes: [] },
      },
    ],
  });

  if (!role) {
    const error = httpError(403, 'Badge non reconnu');
    error.invalidBadge = true;
    throw error;
  }

  return role;
}

async function resolveBadgeCode(publicToken) {
  const role = await AccessRole.findOne({
    where: {
      publicToken: normalizeBadgeCode(publicToken),
      isActive: true,
    },
    include: [
      {
        model: Event,
        as: 'event',
        required: true,
        attributes: eventPublicAttributes,
      },
    ],
  });

  if (!role || !role.event?.isPublished) {
    const error = httpError(403, 'Badge non reconnu');
    error.invalidBadge = true;
    throw error;
  }

  return {
    badgeCode: role.publicToken,
    eventSlug: role.event.slug,
    publicUrl: buildParticipantUrl(role.event, role),
  };
}

function getRoleAlbumIds(role) {
  return new Set((role?.albums || []).map((album) => album.id));
}

function albumHasSpecificAccess(album) {
  return (album.accessRoles || []).length > 0;
}

function canAccessAlbum(album, accessRole) {
  if (!albumHasSpecificAccess(album)) return true;
  if (!accessRole) return false;

  return (album.accessRoles || []).some((role) => role.id === accessRole.id);
}

async function getPublicEvent(slug, accessCode, roleToken) {
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
        include: [
          {
            model: Media,
            as: 'coverMedia',
            required: false,
            attributes: mediaPublicAttributes,
          },
          {
            model: Media,
            as: 'media',
            required: false,
            attributes: ['id', 'type'],
          },
          {
            model: AccessRole,
            as: 'accessRoles',
            required: false,
            attributes: ['id'],
            through: { attributes: [] },
          },
        ],
        order: [['sortOrder', 'ASC']],
      },
    ],
  });

  if (!event) {
    throw httpError(404, 'Event not found');
  }

  const accessRole = await resolveAccessRole(event.id, roleToken);

  if (!accessRole && !hasAccess(event, accessCode)) {
    const error = httpError(403, 'Access code required');
    error.requiresAccessCode = true;
    throw error;
  }

  const publicEvent = serializePublicEvent(event);

  publicEvent.albums = (event.albums || [])
    .filter((album) => canAccessAlbum(album, accessRole))
    .map((album) => serializeAlbum(album));

  return publicEvent;
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

async function getPublicAlbum(eventSlug, albumSlug, accessCode, roleToken) {
  const event = await Event.findOne({
    where: { slug: eventSlug, isPublished: true },
    attributes: [...eventPublicAttributes, 'accessCode'],
  });

  if (!event) {
    throw httpError(404, 'Event not found');
  }

  const accessRole = await resolveAccessRole(event.id, roleToken);

  if (!accessRole && !hasAccess(event, accessCode)) {
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
        model: AccessRole,
        as: 'accessRoles',
        required: false,
        attributes: ['id'],
        through: { attributes: [] },
      },
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

  if (!canAccessAlbum(album, accessRole)) {
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
  getAlbumById,
  deleteAlbum,
  listAccessRoles,
  createAccessRole,
  updateAccessRole,
  deleteAccessRole,
  buildParticipantUrl,
  resolveAccessRole,
  resolveBadgeCode,
  getRoleAlbumIds,
  canAccessAlbum,
  getPublicEvent,
  validateEventAccess,
  getPublicAlbum,
};
