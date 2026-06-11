import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Slug : minuscules, chiffres et tirets uniquement'),
  description: z.string().max(500).optional(),
  category: z.enum([
    'ERP_BBS',
    'TRAVELIA_ERP',
    'TRAVELIA_API',
    'TRAVELIA_WEB',
    'ECHO_CHALLENGE',
    'OTHER',
  ]),
  baseUrl: z.string().url().optional().or(z.literal('')),
  healthUrl: z.string().url('URL health check invalide'),
  isEnabled: z.boolean().default(true),
  degradedMs: z.coerce.number().int().min(100).max(60_000).default(2000),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
