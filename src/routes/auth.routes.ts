import { Router, Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginInput, RegisterInput, SafeUser } from '../types/user';

const router = Router();
const prisma = new PrismaClient();


/**
 * REGISTER
 */
router.post(
  '/register',
  async (req: Request, res: Response) => {
    const { email, password, name } = req.body as RegisterInput;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { email, password: hashedPassword, name },
      });

      // Ocultamos el password al responder
      const { password: _, ...safeUser } = user;

      res.json(safeUser as SafeUser);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return res.status(400).json({ error: "El usuario ya existe" });
        }
      }
      res.status(500).json({ error: "Error al registrar usuario", errorObject: error });
    }
  }
);

/**
 * LOGIN
 */
router.post(
  '/login',
  async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginInput;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generamos token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    const { password: _, ...safeUser } = user;

    res.json({ token, user: safeUser as SafeUser });
  }
);

export default router;
