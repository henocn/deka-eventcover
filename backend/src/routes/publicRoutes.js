const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate');
const publicEventController = require('../controllers/publicEventController');
const publicFaceController = require('../controllers/publicFaceController');
const publicMediaController = require('../controllers/publicMediaController');
const { upload } = require('../middlewares/upload');
const {
  badgeCodeSchema,
  publicEventSchema,
  publicAlbumSchema,
  publicMyPhotosSchema,
  eventAccessSchema,
} = require('../validators/publicValidators');
const { mediaFileSchema } = require('../validators/mediaValidators');

const router = express.Router();

router.get('/badges/:badgeCode', validate(badgeCodeSchema), asyncHandler(publicEventController.resolveBadge));
router.get('/events/:slug', validate(publicEventSchema), asyncHandler(publicEventController.getEvent));
router.post(
  '/events/:slug/my-photos',
  validate(publicMyPhotosSchema),
  upload.single('selfie'),
  asyncHandler(publicFaceController.findMyPhotos)
);
router.post(
  '/events/:slug/access',
  validate(eventAccessSchema),
  asyncHandler(publicEventController.validateAccess)
);
router.get(
  '/events/:slug/albums/:albumSlug',
  validate(publicAlbumSchema),
  asyncHandler(publicEventController.getAlbum)
);
router.get(
  '/media/:mediaId/file',
  validate(mediaFileSchema),
  asyncHandler(publicMediaController.sendMediaFile)
);
router.get(
  '/media/:mediaId/download',
  validate(mediaFileSchema),
  asyncHandler(publicMediaController.downloadMediaFile)
);

module.exports = router;
