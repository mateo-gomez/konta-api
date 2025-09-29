import { z } from 'zod';

export const createAccountSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    balance: z.number().nonnegative('El balance debe ser ≥ 0').optional(),
    type: z.string().optional(),
  }),
});

export const updateAccountSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    balance: z.number().nonnegative().optional(),
    type: z.string().optional(),
  }),
  params: z.object({
    id: z.string().cuid('Id inválido'),
  }),
});
