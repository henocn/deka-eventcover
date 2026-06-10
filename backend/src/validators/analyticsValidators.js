const { z } = require('zod');

const analyticsQuerySchema = z.object({
  query: z.object({
    eventId: z.coerce.number().int().positive().optional(),
  }),
});

module.exports = {
  analyticsQuerySchema,
};
