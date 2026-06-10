const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caracteres').max(160).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caracteres').optional(),
  }).refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  }),
});

module.exports = {
  loginSchema,
  updateProfileSchema,
};
