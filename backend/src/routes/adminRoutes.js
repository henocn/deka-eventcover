const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate');
const { requireAdmin, requireSuperAdmin } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const authController = require('../controllers/authController');
const adminAnalyticsController = require('../controllers/adminAnalyticsController');
const adminEventController = require('../controllers/adminEventController');
const adminMediaController = require('../controllers/adminMediaController');
const adminUserController = require('../controllers/adminUserController');
const { loginSchema, updateProfileSchema } = require('../validators/authValidators');
const { analyticsQuerySchema } = require('../validators/analyticsValidators');
const {
  createEventSchema,
  updateEventSchema,
  eventIdParamSchema,
  accessRoleIdParamSchema,
  eventAccessRoleParamSchema,
  createAlbumSchema,
  updateAlbumSchema,
  createAccessRoleSchema,
  updateAccessRoleSchema,
} = require('../validators/eventValidators');
const { albumIdParamSchema, mediaFileSchema } = require('../validators/mediaValidators');
const { createUserSchema, updateUserSchema, userIdParamSchema } = require('../validators/userValidators');

const router = express.Router();

router.post('/auth/login', validate(loginSchema), asyncHandler(authController.login));

router.use(requireAdmin);

router.get('/profile', asyncHandler(authController.getProfile));
router.patch('/profile', validate(updateProfileSchema), asyncHandler(authController.updateProfile));

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

router.get('/analytics', validate(analyticsQuerySchema), asyncHandler(adminAnalyticsController.getAnalytics));
router.get('/users', requireSuperAdmin, asyncHandler(adminUserController.listUsers));
router.post('/users', requireSuperAdmin, validate(createUserSchema), asyncHandler(adminUserController.createUser));
router.patch('/users/:userId', requireSuperAdmin, validate(updateUserSchema), asyncHandler(adminUserController.updateUser));
router.delete('/users/:userId', requireSuperAdmin, validate(userIdParamSchema), asyncHandler(adminUserController.deleteUser));
router.get('/events', asyncHandler(adminEventController.listEvents));
router.post('/events', validate(createEventSchema), asyncHandler(adminEventController.createEvent));
router.get('/events/:eventId', validate(eventIdParamSchema), asyncHandler(adminEventController.getEvent));
router.patch('/events/:eventId', validate(updateEventSchema), asyncHandler(adminEventController.updateEvent));
router.delete(
  '/events/:eventId',
  validate(eventIdParamSchema),
  asyncHandler(adminEventController.deleteEvent)
);
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
router.get(
  '/events/:eventId/access-roles',
  validate(eventIdParamSchema),
  asyncHandler(adminEventController.listAccessRoles)
);
router.post(
  '/events/:eventId/access-roles',
  validate(createAccessRoleSchema),
  asyncHandler(adminEventController.createAccessRole)
);
router.patch(
  '/access-roles/:roleId',
  validate(updateAccessRoleSchema),
  asyncHandler(adminEventController.updateAccessRole)
);
router.get(
  '/events/:eventId/access-roles/:roleId/qrcode',
  validate(eventAccessRoleParamSchema),
  asyncHandler(adminEventController.getAccessRoleQrCode)
);
router.delete(
  '/access-roles/:roleId',
  validate(accessRoleIdParamSchema),
  asyncHandler(adminEventController.deleteAccessRole)
);
router.post(
  '/events/:eventId/albums',
  validate(createAlbumSchema),
  asyncHandler(adminEventController.createAlbum)
);
router.get(
  '/albums/:albumId',
  validate(albumIdParamSchema),
  asyncHandler(adminEventController.getAlbum)
);
router.patch(
  '/albums/:albumId',
  validate(updateAlbumSchema),
  asyncHandler(adminEventController.updateAlbum)
);
router.delete(
  '/albums/:albumId',
  validate(albumIdParamSchema),
  asyncHandler(adminEventController.deleteAlbum)
);
router.post(
  '/albums/:albumId/media',
  validate(albumIdParamSchema),
  upload.array('files', 100),
  asyncHandler(adminMediaController.uploadAlbumMedia)
);
router.get(
  '/media/:mediaId/file',
  validate(mediaFileSchema),
  asyncHandler(adminMediaController.sendAdminMediaFile)
);

module.exports = router;
