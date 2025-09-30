// src/routes/dashboard.routes.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Resumen general
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const today = new Date();
    const month = Number(req.query.month) || today.getMonth() + 1;
    const year = Number(req.query.year) || today.getFullYear();
    const date = new Date(year, month - 1);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // Obtener cuentas con saldo (sumar ingresos - gastos)
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: { id: true, name: true, balance: true },
    });

    // Obtener las últimas 5 transacciones
    const lastTransactions = await prisma.transaction.findMany({
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
      take: 5,
    });

    // Totales
    const sumIncome = await prisma.transaction.aggregate({
      where: { userId, type: 'INCOME', date: { gte: firstDay, lte: lastDay } },
      _sum: { amount: true },
    });
    const sumExpense = await prisma.transaction.aggregate({
      where: { userId, type: 'EXPENSE', date: { gte: firstDay, lte: lastDay } },
      _sum: { amount: true },
    });
    const income = sumIncome._sum.amount ?? 0;
    const expense = sumExpense._sum.amount ?? 0;
    const balance = income - expense;

    // Agrupar transacciones por categoría y sumar amount
    const transactionsByCategory = await prisma.transaction.groupBy({
      where: { userId, date: { gte: firstDay, lte: lastDay } },
      by: ['categoryId'],
      _sum: { amount: true },
    });

    // IDs de categorías involucradas (excluyendo null)
    const categoryIds = transactionsByCategory
      .map((t) => t.categoryId)
      .filter((id): id is string => id !== null);

    // Obtener nombre y color de las categorías
    const categoriesInfo = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true },
    });

    const categoriesMap = new Map(categoriesInfo.map((c) => [c.id, c]));

    // Resultado final: nombre, color y total por categoría
    const categoryTotals = transactionsByCategory.map((g) => {
      const cat = g.categoryId ? categoriesMap.get(g.categoryId) : undefined;
      return {
        name: cat?.name ?? 'Sin categoría',
        color: cat?.color ?? '#9CA3AF',
        total: Number(g._sum.amount ?? 0),
      };
    });

    return res.json({
      accounts,
      income,
      expense,
      balance,
      categoryTotals,
      lastTransactions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener resumen' });
  }
});

export default router;
