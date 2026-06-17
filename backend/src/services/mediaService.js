const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { Album, Event, Media, MediaStat, AccessRole } = require('../models');
const env = require('../config/env');
const httpError = require('../utils/httpError');
const { getMediaType } = require('../middlewares/upload');
const { extensionFromName, sanitizeBaseName } = require('../utils/fileNames');
const eventService = require('./eventService');
const faceQueue = require('./faceQueue');

function safeJoinUploadPath(relativePath) {
  const root = path.resolve(env.mediaRoot);
  const absolutePath = path.resolve(root, relativePath);
  const relativeToRoot = path.relative(root, absolutePath);

  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    throw httpError(400, 'Invalid media path');
  }

  return absolutePath;
}

function hasAccess(event, accessCode) {
  return !event.accessCode || event.accessCode === accessCode;
}

function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip).digest('hex');
}

async function getAlbumWithEvent(albumId) {
  const album = await Album.findByPk(albumId, {
    include: [
      {
        model: Event,
        as: 'event',
        required: true,
      },
    ],
  });

  if (!album) {
    throw httpError(404, 'Album not found');
  }

  return album;
}

function serializeMedia(media) {
  return {
    id: media.id,
    eventId: media.eventId,
    albumId: media.albumId,
    type: media.type,
    mimeType: media.mimeType,
    originalName: media.originalName,
    publicUrl: media.publicUrl,
    downloadUrl: `/api/public/media/${media.id}/download`,
    sizeBytes: Number(media.sizeBytes),
    width: media.width,
    height: media.height,
    sortOrder: media.sortOrder,
    faceAnalysisStatus: media.faceAnalysisStatus,
    faceAnalysisError: media.faceAnalysisError,
    createdAt: media.createdAt,
  };
}

async function uploadAlbumMedia(albumId, files, user) {
  if (!files || files.length === 0) {
    throw httpError(400, 'At least one file is required');
  }

  const album = await getAlbumWithEvent(albumId);
  const event = album.event;
  const relativeDir = path.join('events', event.slug, 'albums', album.slug);
  const absoluteDir = safeJoinUploadPath(relativeDir);
  const currentMaxSortOrder = await Media.max('sortOrder', { where: { albumId: album.id } });
  let nextSortOrder = Number.isFinite(currentMaxSortOrder) ? currentMaxSortOrder + 1 : 0;

  await fs.mkdir(absoluteDir, { recursive: true });

  const createdMedia = [];

  for (const file of files) {
    const ext = extensionFromName(file.originalname, file.mimetype);
    const baseName = sanitizeBaseName(file.originalname);
    const fileName = `${Date.now()}-${crypto.randomUUID()}-${baseName || 'media'}${ext}`;
    const relativePath = path.join(relativeDir, fileName);
    const absolutePath = safeJoinUploadPath(relativePath);

    await fs.writeFile(absolutePath, file.buffer);

    const media = await Media.create({
      eventId: event.id,
      albumId: album.id,
      type: getMediaType(file.mimetype),
      mimeType: file.mimetype,
      originalName: file.originalname,
      storagePath: relativePath,
      publicUrl: '',
      sizeBytes: file.size,
      sortOrder: nextSortOrder,
      uploadedBy: user ? user.id : null,
    });

    await media.update({
      publicUrl: `/api/public/media/${media.id}/file`,
    });

    createdMedia.push(media);
    nextSortOrder += 1;
  }

  faceQueue.enqueueMediaList(createdMedia);

  return {
    event,
    album,
    media: createdMedia.map(serializeMedia),
  };
}

async function getPublicMedia(mediaId, accessCode, roleToken) {
  const media = await Media.findByPk(mediaId, {
    include: [
      {
        model: Event,
        as: 'event',
        required: true,
      },
      {
        model: Album,
        as: 'album',
        required: true,
        include: [
          {
            model: AccessRole,
            as: 'accessRoles',
            required: false,
            attributes: ['id'],
            through: { attributes: [] },
          },
        ],
      },
    ],
  });

  if (!media || !media.event.isPublished || !media.album.isPublished) {
    throw httpError(404, 'Media not found');
  }

  const accessRole = await eventService.resolveAccessRole(media.event.id, roleToken);

  if (!accessRole && !hasAccess(media.event, accessCode)) {
    const error = httpError(403, 'Access code required');
    error.requiresAccessCode = true;
    throw error;
  }

  if (!eventService.canAccessAlbum(media.album, accessRole)) {
    throw httpError(404, 'Media not found');
  }

  return media;
}

async function recordMediaStat(media, action, req) {
  await MediaStat.create({
    eventId: media.eventId,
    albumId: media.albumId,
    mediaId: media.id,
    action,
    ipHash: hashIp(req.ip),
    userAgent: req.get('user-agent') || null,
  });
}

async function getMediaFileResponse(mediaId, accessCode, roleToken, req, action) {
  const media = await getPublicMedia(mediaId, accessCode, roleToken);
  await recordMediaStat(media, action, req);

  return {
    media,
    absolutePath: safeJoinUploadPath(media.storagePath),
  };
}

async function getAdminMediaFileResponse(mediaId) {
  const media = await Media.findByPk(mediaId);

  if (!media) {
    throw httpError(404, 'Media not found');
  }

  return {
    media,
    absolutePath: safeJoinUploadPath(media.storagePath),
  };
}

async function deleteAdminMedia(mediaId) {
  const media = await Media.findByPk(mediaId, {
    include: [
      {
        model: Event,
        as: 'event',
        required: true,
        attributes: ['id', 'slug'],
      },
      {
        model: Album,
        as: 'album',
        required: true,
        attributes: ['id'],
      },
    ],
  });

  if (!media) {
    throw httpError(404, 'Media not found');
  }

  const absolutePath = safeJoinUploadPath(media.storagePath);
  const event = media.event;
  const album = media.album;

  await media.destroy();

  await fs.unlink(absolutePath).catch((error) => {
    if (error.code !== 'ENOENT') {
      console.warn(`Unable to delete media file ${absolutePath}: ${error.message}`);
    }
  });

  return {
    event,
    album,
    mediaId: Number(mediaId),
  };
}

module.exports = {
  uploadAlbumMedia,
  getMediaFileResponse,
  getAdminMediaFileResponse,
  deleteAdminMedia,
};
