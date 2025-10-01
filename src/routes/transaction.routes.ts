import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { validate } from '../middlewares/validate.middleware';
import {
  createTransactionSchema,
  getTransactionSchema,
  updateTransactionSchema,
} from '../schemas/transaction.schemas';

const prisma = new PrismaClient();
const router = Router();

// Crear transacción
router.post('/', validate(createTransactionSchema), async (req, res) => {
  const { type, amount, description, accountId, date, categoryId } = req.body;
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
        categoryId,
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
  const { type, amount, description, date, categoryId } = req.body;
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
        categoryId,
      },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar transacción' });
  }
});

// Listar transacciones de un usuario con paginación
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { month, year, categoryId, accountId, limit, cursor } = req.query;

    // Configurar límite de resultados (default: 20)
    const pageLimit = limit ? parseInt(limit as string) : 20;

    // Validar que el límite sea razonable
    if (pageLimit > 100) {
      return res.status(400).json({ error: 'El límite máximo es 100 transacciones por página' });
    }

    // Construir filtros dinámicamente
    const where: any = { userId };

    // Filtro por cuenta
    if (accountId) {
      where.accountId = accountId as string;
    }

    // Filtro por categoría
    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    // Filtro por mes y año
    if (month || year) {
      const yearNum = year ? parseInt(year as string) : new Date().getFullYear();
      const monthNum = month ? parseInt(month as string) : undefined;

      if (monthNum !== undefined) {
        // Filtrar por mes específico
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

        where.date = {
          gte: startDate,
          lte: endDate,
        };
      } else {
        // Filtrar solo por año
        const startDate = new Date(yearNum, 0, 1);
        const endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999);

        where.date = {
          gte: startDate,
          lte: endDate,
        };
      }
    }

    // Construir query con paginación cursor-based
    const queryOptions: any = {
      where,
      include: {
        account: true,
        category: true,
      },
      orderBy: { date: 'desc' },
      take: pageLimit + 1, // Traer uno extra para saber si hay más
    };

    // Si hay cursor, agregar skip y cursor
    if (cursor) {
      queryOptions.skip = 1; // Saltar el cursor
      queryOptions.cursor = {
        id: cursor as string,
      };
    }

    const transactions = await prisma.transaction.findMany(queryOptions);

    // Verificar si hay más resultados
    const hasMore = transactions.length > pageLimit;

    // Remover el elemento extra si existe
    const data = hasMore ? transactions.slice(0, pageLimit) : transactions;

    // Obtener el cursor para la siguiente página
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    res.json({
      data,
      pagination: {
        nextCursor,
        hasMore,
        limit: pageLimit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

router.get('/:id', validate(getTransactionSchema), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        account: true,
        category: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener transacción' });
  }
});

export default router;
