const { z } = require('zod');

const analyticsQuerySchema = z.object({
  query: z.object({
    eventId: z.coerce.number().int().positive().optional(),
    period: z.enum(['day', 'week', 'month', 'all']).optional(),
  }),
});

module.exports = {
  analyticsQuerySchema,
};
