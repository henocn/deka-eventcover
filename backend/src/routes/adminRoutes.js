const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate');
const { requireAdmin } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const authController = require('../controllers/authController');
const adminEventController = require('../controllers/adminEventController');
const adminMediaController = require('../controllers/adminMediaController');
const { loginSchema } = require('../validators/authValidators');
const {
  createEventSchema,
  updateEventSchema,
  eventIdParamSchema,
  createAlbumSchema,
  updateAlbumSchema,
} = require('../validators/eventValidators');
const { albumIdParamSchema } = require('../validators/mediaValidators');

const router = express.Router();

router.post('/auth/login', validate(loginSchema), asyncHandler(authController.login));

router.use(requireAdmin);

router.get('/overview', (req, res) => {
  res.json({
    message: 'Back-office API ready',
    user: {
      id: req.user.id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

router.get('/events', asyncHandler(adminEventController.listEvents));
router.post('/events', validate(createEventSchema), asyncHandler(adminEventController.createEvent));
router.get('/events/:eventId', validate(eventIdParamSchema), asyncHandler(adminEventController.getEvent));
router.patch('/events/:eventId', validate(updateEventSchema), asyncHandler(adminEventController.updateEvent));
router.get(
  '/events/:eventId/qrcode',
  validate(eventIdParamSchema),
  asyncHandler(adminEventController.getEventQrCode)
);
router.get(
  '/events/:eventId/stats',
  validate(eventIdParamSchema),
  asyncHandler(adminEventController.getEventStats)
);
router.post(
  '/events/:eventId/albums',
  validate(createAlbumSchema),
  asyncHandler(adminEventController.createAlbum)
);
router.patch(
  '/albums/:albumId',
  validate(updateAlbumSchema),
  asyncHandler(adminEventController.updateAlbum)
);
router.post(
  '/albums/:albumId/media',
  validate(albumIdParamSchema),
  upload.array('files', 50),
  asyncHandler(adminMediaController.uploadAlbumMedia)
);

module.exports = router;
