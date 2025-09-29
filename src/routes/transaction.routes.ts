import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { validate } from '../middlewares/validate.middleware';
import {
  createTransactionSchema,
  updateTransactionSchema,
} from '../schemas/transaction.schemas';

const prisma = new PrismaClient();
const router = Router();

// Crear transacción
router.post('/', validate(createTransactionSchema), async (req, res) => {
  const { type, amount, description, accountId, date } = req.body;
  const userId = (req as any).userId;
    console.log({userId})
  try {
    // verificar que la cuenta pertenece al usuario
    const account = await prisma.account.findFirst({ where: { id: accountId, userId } });
    if (!account) {
      return res.status(404).json({ error: 'Cuenta no encontrada o no pertenece al usuario' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount,
        description,
        accountId,
        userId,
        date: date ? new Date(date) : undefined,
      },
    });
    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear transacción' });
  }
});

// Actualizar transacción
router.put('/:id', validate(updateTransactionSchema), async (req, res) => {
  const { id } = req.params;
  const { type, amount, description, date } = req.body;
  const userId = (req as any).userId;

  try {
    // verificar que la transacción pertenece al usuario
    const transaction = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!transaction) {
      return res.status(404).json({ error: 'Transacción no encontrada o no pertenece al usuario' });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        type,
        amount,
        description,
        date: date ? new Date(date) : undefined,
      },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar transacción' });
  }
});

// Listar transacciones de un usuario
router.get('/', async (req, res) => {
  const userId = (req as any).userId;
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

export default router;
