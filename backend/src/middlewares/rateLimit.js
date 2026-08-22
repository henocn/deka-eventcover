const rateLimit = require('express-rate-limit');

// Limite generale sur les routes publiques participant.
const publicApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de requetes. Reessayez dans une minute.' },
});

// Limite stricte sur la recherche faciale (endpoint couteux).
const myPhotosLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de recherches faciales. Reessayez dans une minute.' },
});

// Limite sur le telechargement et l'affichage des medias.
const mediaFileLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 180,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de telechargements. Reessayez dans une minute.' },
});

// Limite sur les tentatives de connexion admin.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives de connexion. Reessayez plus tard.' },
});

module.exports = {
  publicApiLimiter,
  myPhotosLimiter,
  mediaFileLimiter,
  loginLimiter,
};
