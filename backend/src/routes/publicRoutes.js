const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate');
const publicEventController = require('../controllers/publicEventController');
const {
  publicEventSchema,
  publicAlbumSchema,
  eventAccessSchema,
} = require('../validators/publicValidators');

const router = express.Router();

router.get('/events/:slug', validate(publicEventSchema), asyncHandler(publicEventController.getEvent));
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

module.exports = router;
