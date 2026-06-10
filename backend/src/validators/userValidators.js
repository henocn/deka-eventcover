const { z } = require('zod');

const userRole = z.enum(['admin', 'super_admin']);

const userIdParamSchema = z.object({
  params: z.object({
    userId: z.coerce.number().int().positive(),
  }),
});

const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caracteres').max(160),
    email: z.string().trim().email('Email invalide').max(180),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caracteres'),
    role: userRole.default('admin'),
    isActive: z.boolean().optional(),
  }),
});

const updateUserSchema = z.object({
  params: z.object({
    userId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    fullName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caracteres').max(160).optional(),
    email: z.string().trim().email('Email invalide').max(180).optional(),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caracteres').optional(),
    role: userRole.optional(),
    isActive: z.boolean().optional(),
  }).refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  }),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
};
