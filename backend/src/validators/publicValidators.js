const { z } = require('zod');

const publicEventSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1),
  }),
  query: z.object({
    accessCode: z.string().trim().optional(),
  }),
});

const publicAlbumSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1),
    albumSlug: z.string().trim().min(1),
  }),
  query: z.object({
    accessCode: z.string().trim().optional(),
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

module.exports = {
  publicEventSchema,
  publicAlbumSchema,
  eventAccessSchema,
};
