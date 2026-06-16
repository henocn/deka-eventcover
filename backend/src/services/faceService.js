const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const { Op } = require('sequelize');
const { Album, Event, FaceEmbedding, Media } = require('../models');
const env = require('../config/env');
const httpError = require('../utils/httpError');
const eventService = require('./eventService');

function isImageMedia(media) {
  return media?.type === 'image' && media.mimeType?.startsWith('image/');
}

function safeJoinUploadPath(relativePath) {
  const root = path.resolve(env.mediaRoot);
  const absolutePath = path.resolve(root, relativePath);
  const relativeToRoot = path.relative(root, absolutePath);

  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    throw httpError(400, 'Invalid media path');
  }

  return absolutePath;
}

async function preprocessImage(input) {
  return sharp(input, { failOn: 'none' })
    .autoOrient()
    .resize({
      width: env.faceImageMaxSize,
      height: env.faceImageMaxSize,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 90,
      mozjpeg: true,
    })
    .toBuffer();
}

async function extractFaces(input) {
  const imageBuffer = await preprocessImage(input);
  const formData = new FormData();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.faceServiceTimeoutMs);

  formData.append('file', new Blob([imageBuffer], { type: 'image/jpeg' }), 'image.jpg');

  try {
    const response = await fetch(new URL('/extract', env.faceServiceUrl), {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw httpError(
        response.status >= 500 ? 502 : response.status,
        payload.detail || payload.message || 'Face extraction failed',
      );
    }

    return Array.isArray(payload.faces) ? payload.faces : [];
  } catch (error) {
    if (error.name === 'AbortError') {
      throw httpError(504, 'Le service IA facial a mis trop de temps a repondre.');
    }

    if (error.status) throw error;
    throw httpError(502, `Service IA facial indisponible: ${error.message}`);
  } finally {
    clearTimeout(timeout);
  }
}

function serializeDescriptor(descriptor) {
  return Array.from(descriptor || []).map((value) => Number(Number(value).toFixed(8)));
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

function bboxToColumns(bbox) {
  const [x1, y1, x2, y2] = Array.isArray(bbox) ? bbox : [];

  if (![x1, y1, x2, y2].every(Number.isFinite)) {
    return {
      boxX: null,
      boxY: null,
      boxWidth: null,
      boxHeight: null,
    };
  }

  return {
    boxX: x1,
    boxY: y1,
    boxWidth: Math.max(0, x2 - x1),
    boxHeight: Math.max(0, y2 - y1),
  };
}

async function analyzeMediaFaces(mediaId) {
  const media = await Media.findByPk(mediaId);

  if (!media || !isImageMedia(media)) return;

  await media.update({ faceAnalysisStatus: 'processing', faceAnalysisError: null });
  await FaceEmbedding.destroy({ where: { mediaId: media.id } });

  try {
    const absolutePath = safeJoinUploadPath(media.storagePath);
    await fs.access(absolutePath);
    const faces = await extractFaces(absolutePath);

    if (faces.length === 0) {
      await media.update({ faceAnalysisStatus: 'no_face', faceAnalysisError: null });
      return;
    }

    await FaceEmbedding.bulkCreate(faces.map((face) => ({
      eventId: media.eventId,
      albumId: media.albumId,
      mediaId: media.id,
      embedding: serializeDescriptor(face.embedding),
      ...bboxToColumns(face.bbox),
      confidence: Number.isFinite(face.confidence) ? face.confidence : null,
    })));

    await media.update({ faceAnalysisStatus: 'completed', faceAnalysisError: null });
  } catch (error) {
    await media.update({
      faceAnalysisStatus: 'failed',
      faceAnalysisError: error.message,
    });
    throw error;
  }
}

async function extractSelfieDescriptor(selfieBuffer) {
  const faces = await extractFaces(selfieBuffer);

  if (faces.length === 0) {
    throw httpError(400, 'Aucun visage detecte sur la photo.');
  }

  if (faces.length > 1) {
    throw httpError(400, 'Plusieurs visages detectes. Envoyez une photo avec un seul visage.');
  }

  return serializeDescriptor(faces[0].embedding);
}

function serializeMatch(media, score) {
  return {
    score,
    media: {
      id: media.id,
      eventId: media.eventId,
      albumId: media.albumId,
      type: media.type,
      mimeType: media.mimeType,
      originalName: media.originalName,
      publicUrl: media.publicUrl,
      downloadUrl: `/api/public/media/${media.id}/download`,
      width: media.width,
      height: media.height,
      sortOrder: media.sortOrder,
      createdAt: media.createdAt,
    },
    album: media.album ? {
      id: media.album.id,
      title: media.album.title,
      slug: media.album.slug,
    } : null,
  };
}

async function searchMyPhotos(eventSlug, accessCode, roleToken, selfieBuffer) {
  const publicEvent = await eventService.getPublicEvent(eventSlug, accessCode, roleToken);
  const albumIds = (publicEvent.albums || []).map((album) => album.id);

  if (albumIds.length === 0) {
    return [];
  }

  const selfieDescriptor = await extractSelfieDescriptor(selfieBuffer);
  const embeddings = await FaceEmbedding.findAll({
    where: {
      eventId: publicEvent.id,
      albumId: { [Op.in]: albumIds },
    },
    include: [
      {
        model: Media,
        as: 'media',
        required: true,
        include: [
          {
            model: Album,
            as: 'album',
            required: false,
            attributes: ['id', 'title', 'slug'],
          },
          {
            model: Event,
            as: 'event',
            required: true,
            attributes: ['id', 'slug', 'isPublished'],
          },
        ],
      },
    ],
  });
  const matchesByMedia = new Map();

  embeddings.forEach((embedding) => {
    const score = cosineSimilarity(selfieDescriptor, embedding.embedding);
    if (score < env.faceMatchThreshold) return;

    const existing = matchesByMedia.get(embedding.mediaId);
    if (!existing || score > existing.score) {
      matchesByMedia.set(embedding.mediaId, {
        score,
        media: embedding.media,
      });
    }
  });

  return [...matchesByMedia.values()]
    .sort((a, b) => b.score - a.score)
    .map((match) => serializeMatch(match.media, Number(match.score.toFixed(4))));
}

module.exports = {
  analyzeMediaFaces,
  searchMyPhotos,
};
