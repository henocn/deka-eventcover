const QRCode = require('qrcode');
const env = require('../config/env');
const eventService = require('../services/eventService');

async function listEvents(req, res) {
  const events = await eventService.listEvents();
  res.json({ data: events });
}

async function getEvent(req, res) {
  const event = await eventService.getEventById(req.validated.params.eventId);
  res.json({ data: event });
}

async function createEvent(req, res) {
  const event = await eventService.createEvent(req.validated.body, req.user);
  res.status(201).json({ data: event });
}

async function updateEvent(req, res) {
  const event = await eventService.updateEvent(req.validated.params.eventId, req.validated.body);
  res.json({ data: event });
}

async function deleteEvent(req, res) {
  const result = await eventService.deleteEvent(req.validated.params.eventId);
  res.json({ data: result });
}

async function createAlbum(req, res) {
  const album = await eventService.createAlbum(req.validated.params.eventId, req.validated.body);
  const io = req.app.get('io');

  if (io) {
    io.to(`event:${album.eventId}`).emit('album:updated', { albumId: album.id });
  }

  res.status(201).json({ data: album });
}

async function updateAlbum(req, res) {
  const album = await eventService.updateAlbum(req.validated.params.albumId, req.validated.body);
  const io = req.app.get('io');

  if (io) {
    io.to(`event:${album.eventId}`).emit('album:updated', { albumId: album.id });
  }

  res.json({ data: album });
}

async function getEventQrCode(req, res) {
  const event = await eventService.getEventById(req.validated.params.eventId);
  const publicUrl = `${env.publicAppUrl.replace(/\/$/, '')}/events/${event.slug}`;
  const dataUrl = await QRCode.toDataURL(publicUrl, {
    margin: 1,
    width: 512,
  });

  res.json({
    data: {
      publicUrl,
      qrCodeDataUrl: dataUrl,
    },
  });
}

async function getEventStats(req, res) {
  const stats = await eventService.getEventStats(req.validated.params.eventId);
  res.json({ data: stats });
}

module.exports = {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  createAlbum,
  updateAlbum,
  getEventQrCode,
  getEventStats,
};
