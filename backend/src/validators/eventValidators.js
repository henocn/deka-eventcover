const { z } = require('zod');

const booleanField = z.union([z.boolean(), z.string()]).optional().transform((value) => {
  if (value === undefined) return undefined;
  if (typeof value === 'boolean') return value;
  return value === 'true';
});

const nullableText = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === null || value === undefined) return null;
    const trimmed = value.trim();
    return trimmed || null;
  });

const dateField = z
  .union([z.string(), z.null()])
  .optional()
  .refine(
    (value) => {
      if (!value) return true;
      return !Number.isNaN(Date.parse(value));
    },
    { message: 'Date invalide' }
  )
  .transform((value) => (value ? new Date(value).toISOString() : null));

const eventBody = z.object({
  title: z.string().trim().min(2, 'Le titre doit contenir au moins 2 caracteres').max(180),
  slug: z.string().trim().max(180).optional(),
  description: nullableText,
  location: nullableText,
  startsAt: dateField,
  endsAt: dateField,
  accessCode: nullableText,
  isPublished: booleanField,
});

const createEventSchema = z.object({
  body: eventBody,
});

const updateEventSchema = z.object({
  params: z.object({
    eventId: z.coerce.number().int().positive(),
  }),
  body: eventBody.partial().refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  }),
});

const eventIdParamSchema = z.object({
  params: z.object({
    eventId: z.coerce.number().int().positive(),
  }),
});

const accessRoleIdParamSchema = z.object({
  params: z.object({
    roleId: z.coerce.number().int().positive(),
  }),
});

const eventAccessRoleParamSchema = z.object({
  params: z.object({
    eventId: z.coerce.number().int().positive(),
    roleId: z.coerce.number().int().positive(),
  }),
});

const albumBody = z.object({
  title: z.string().trim().min(2, 'Le titre doit contenir au moins 2 caracteres').max(180),
  slug: z.string().trim().max(180).optional(),
  description: nullableText,
  coverMediaId: z.coerce.number().int().positive().optional().nullable(),
  sortOrder: z.coerce.number().int().optional(),
  isPublished: booleanField,
  accessRoleIds: z
    .array(z.coerce.number().int().positive())
    .max(100)
    .optional()
    .transform((ids) => (ids ? [...new Set(ids)] : undefined)),
});

const createAlbumSchema = z.object({
  params: z.object({
    eventId: z.coerce.number().int().positive(),
  }),
  body: albumBody,
});

const createAccessRoleSchema = z.object({
  params: z.object({
    eventId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    name: z.string().trim().min(2, 'Le nom du badge doit contenir au moins 2 caracteres').max(120),
    description: nullableText,
    albumIds: z
      .array(z.coerce.number().int().positive())
      .max(100)
      .optional()
      .transform((ids) => (ids ? [...new Set(ids)] : [])),
  }),
});

const updateAlbumSchema = z.object({
  params: z.object({
    albumId: z.coerce.number().int().positive(),
  }),
  body: albumBody.partial().refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  }),
});

module.exports = {
  createEventSchema,
  updateEventSchema,
  eventIdParamSchema,
  accessRoleIdParamSchema,
  eventAccessRoleParamSchema,
  createAlbumSchema,
  updateAlbumSchema,
  createAccessRoleSchema,
};
