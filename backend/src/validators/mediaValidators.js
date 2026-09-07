const { z } = require('zod');

const albumIdParamSchema = z.object({
  params: z.object({
    albumId: z.coerce.number().int().positive(),
  }),
});

const mediaFileSchema = z.object({
  params: z.object({
    mediaId: z.coerce.number().int().positive(),
  }),
  query: z.object({
    accessCode: z.string().trim().optional(),
    role: z.string().trim().optional(),
  }),
});

const moveMediaSchema = z.object({
  body: z.object({
    mediaIds: z.array(z.coerce.number().int().positive()).min(1, 'Au moins un media est requis'),
    targetAlbumId: z.coerce.number().int().positive(),
  }),
});

module.exports = {
  albumIdParamSchema,
  mediaFileSchema,
  moveMediaSchema,
};
