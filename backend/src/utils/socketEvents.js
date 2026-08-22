const { Event } = require('../models');

// Emission Socket.IO vers la room publique d'un evenement (clee par slug).
async function emitToEventRoom(io, eventId, eventName, payload) {
  if (!io || !eventId) return;

  const event = await Event.findByPk(eventId, { attributes: ['slug'] });

  if (!event?.slug) return;

  io.to(`event:${event.slug}`).emit(eventName, payload);
}

module.exports = {
  emitToEventRoom,
};
