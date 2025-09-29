import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validate } from '../middlewares/validate.middleware';
import { createAccountSchema, updateAccountSchema } from '../schemas/account.schema';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const accounts = await prisma.account.findMany({ where: { userId } });
  res.json(accounts);
});

// Crear cuenta
router.post('/', validate(createAccountSchema), async (req, res) => {
    const { name, balance, description } = req.body;
    const userId = (req as any).userId; // de authMiddleware

    try {
      const account = await prisma.account.create({
        data: { name, balance, description, userId },
      });
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear la cuenta' });
    }
  });

  // Actualizar cuenta
  router.put('/:id', validate(updateAccountSchema), async (req, res) => {
    const { id } = req.params;
    const { name, balance, description } = req.body;
    const userId = (req as any).userId;

    try {
      // Verificar que la cuenta pertenece al usuario
      const account = await prisma.account.findFirst({ where: { id, userId } });
      if (!account) {
        return res.status(404).json({ error: 'Cuenta no encontrada' });
      }

      const updated = await prisma.account.update({
        where: { id },
        data: { name, balance, description },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la cuenta' });
    }
  });

router.delete(
  '/:id',
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { id } = req.params;

    const account = await prisma.account.findFirst({ where: { id, userId } });
    if (!account) return res.status(404).json({ error: 'Cuenta no encontrada' });

    await prisma.account.delete({ where: { id } });
    res.json({ message: 'Cuenta eliminada' });
  }
);

export default router;
