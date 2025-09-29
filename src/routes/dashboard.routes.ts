// src/routes/dashboard.routes.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Resumen general
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).userId;

    // Obtener cuentas con saldo (sumar ingresos - gastos)
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: { id: true, name: true, balance: true },
    });

    // Obtener transacciones del mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      include: {
        category: true,
        account: true,
      },
    });

    // Totales
    let totalIncome = 0;
    let totalExpense = 0;

    // Agrupación por categoría
    const categoryTotals: Record<string, { name: string; total: number }> = {};

    for (const t of transactions) {
      if (t.type === 'INCOME') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }

      if (t.category) {
        console.log(t.category)
        if (!categoryTotals[t.category.id]) {
          categoryTotals[t.category.id] = {
            name: t.category.name,
            total: 0,
          };
        }
        categoryTotals[t.category.id].total += t.amount;
      }
    }

    return res.json({
      accounts,
      totalIncome,
      totalExpense,
      categoryTotals,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener resumen' });
  }
});

export default router;
