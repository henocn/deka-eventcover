const fs = require('fs/promises');
const path = require('path');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const { Op } = require('sequelize');
const { Album, Event, FaceEmbedding, Media } = require('../models');
const env = require('../config/env');
const httpError = require('../utils/httpError');
const eventService = require('./eventService');

const { Canvas, Image, ImageData, loadImage } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsPromise = null;

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

async function ensureModelsLoaded() {
  if (!modelsPromise) {
    modelsPromise = (async () => {
      await fs.access(env.faceModelsPath);
      await faceapi.nets.tinyFaceDetector.loadFromDisk(env.faceModelsPath);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(env.faceModelsPath);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(env.faceModelsPath);
    })();
  }

  return modelsPromise;
}

async function detectFacesFromImage(imageLike) {
  await ensureModelsLoaded();

  const image = Buffer.isBuffer(imageLike) ? await loadImage(imageLike) : await loadImage(imageLike);
  const detections = await faceapi
    .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptors();

  return detections;
}

function serializeDescriptor(descriptor) {
  return Array.from(descriptor).map((value) => Number(value.toFixed(8)));
}

function euclideanDistance(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return Number.POSITIVE_INFINITY;

  let sum = 0;
  for (let index = 0; index < a.length; index += 1) {
    const delta = a[index] - b[index];
    sum += delta * delta;
  }

  return Math.sqrt(sum);
}

async function analyzeMediaFaces(mediaId) {
  const media = await Media.findByPk(mediaId);

  if (!media || !isImageMedia(media)) return;

  await media.update({ faceAnalysisStatus: 'processing', faceAnalysisError: null });
  await FaceEmbedding.destroy({ where: { mediaId: media.id } });

  try {
    const absolutePath = safeJoinUploadPath(media.storagePath);
    const detections = await detectFacesFromImage(absolutePath);

    if (detections.length === 0) {
      await media.update({ faceAnalysisStatus: 'no_face', faceAnalysisError: null });
      return;
    }

    await FaceEmbedding.bulkCreate(detections.map((detection) => {
      const box = detection.detection.box;
      return {
        eventId: media.eventId,
        albumId: media.albumId,
        mediaId: media.id,
        embedding: serializeDescriptor(detection.descriptor),
        boxX: box.x,
        boxY: box.y,
        boxWidth: box.width,
        boxHeight: box.height,
        confidence: detection.detection.score,
      };
    }));

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
  const detections = await detectFacesFromImage(selfieBuffer);

  if (detections.length === 0) {
    throw httpError(400, 'Aucun visage detecte sur la photo.');
  }

  if (detections.length > 1) {
    throw httpError(400, 'Plusieurs visages detectes. Envoyez une photo avec un seul visage.');
  }

  return serializeDescriptor(detections[0].descriptor);
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
    const distance = euclideanDistance(selfieDescriptor, embedding.embedding);
    if (distance > env.faceMatchThreshold) return;

    const existing = matchesByMedia.get(embedding.mediaId);
    if (!existing || distance < existing.score) {
      matchesByMedia.set(embedding.mediaId, {
        score: distance,
        media: embedding.media,
      });
    }
  });

  return [...matchesByMedia.values()]
    .sort((a, b) => a.score - b.score)
    .map((match) => serializeMatch(match.media, match.score));
}

module.exports = {
  analyzeMediaFaces,
  searchMyPhotos,
};
