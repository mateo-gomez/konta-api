import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['INCOME', 'EXPENSE']),
    amount: z.number().positive('El monto debe ser positivo'),
    description: z.string().optional(),
    accountId: z.string().cuid('ID de cuenta inválido'),
    date: z.iso.datetime().optional(),
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().cuid('ID de transacción inválido'),
  }),
  body: z.object({
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    amount: z.number().positive().optional(),
    description: z.string().optional(),
    date: z.iso.datetime().optional(),
  }),
});
