module.exports = function errorHandler(error, req, res, next) {
  const multerMessages = {
    LIMIT_FILE_COUNT: 'Vous pouvez uploader 100 fichiers maximum en une seule fois.',
    LIMIT_FILE_SIZE: 'Un fichier depasse la taille maximale autorisee.',
  };
  const status = error.status || (error.code?.startsWith('LIMIT_') ? 400 : 500);
  const message = multerMessages[error.code] || error.message || 'Internal server error';

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    message,
    requiresAccessCode: Boolean(error.requiresAccessCode),
    invalidBadge: Boolean(error.invalidBadge),
    errors: error.errors || undefined,
  });
};
