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
  }),
});

module.exports = {
  albumIdParamSchema,
  mediaFileSchema,
};
