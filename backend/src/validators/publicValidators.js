const { z } = require('zod');

const publicEventSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1),
  }),
  query: z.object({
    accessCode: z.string().trim().optional(),
    role: z.string().trim().optional(),
  }),
});

const publicAlbumSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1),
    albumSlug: z.string().trim().min(1),
  }),
  query: z.object({
    accessCode: z.string().trim().optional(),
    role: z.string().trim().optional(),
  }),
});

const publicMyPhotosSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1),
  }),
  query: z.object({
    accessCode: z.string().trim().optional(),
    role: z.string().trim().optional(),
  }),
});

const eventAccessSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1),
  }),
  body: z.object({
    accessCode: z.string().trim().min(1),
  }),
});

const badgeCodeSchema = z.object({
  params: z.object({
    badgeCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{6}$/, 'Code badge invalide'),
  }),
});

module.exports = {
  badgeCodeSchema,
  publicEventSchema,
  publicAlbumSchema,
  publicMyPhotosSchema,
  eventAccessSchema,
};
