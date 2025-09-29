import { ZodError, ZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate =
  (schema: ZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err: unknown) {
        if (err instanceof ZodError) {
            // Formatear los errores para que sean más claros
            const formatted = JSON.parse(err.message).map((e: any) => ({
              path: e.path.join('.'),
              message: e.message,
            }));
            return res.status(400).json({ errors: formatted });
          }

          // Para cualquier otro error inesperado
          return res.status(500).json({ error: 'Error interno del servidor' });
  };
}
