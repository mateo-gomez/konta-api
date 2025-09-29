// src/routes/category.routes.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { validate } from "../middlewares/validate.middleware";
import { createCategorySchema, updateCategorySchema } from "../schemas/category.schema";

const prisma = new PrismaClient();
const router = Router();

// Crear categoría
router.post(
  "/",
  validate(createCategorySchema),
  async (req, res) => {
    const { name, type, color } = req.body;
    const userId = (req as any).userId;

    const category = await prisma.category.create({
      data: { name, type, color, userId },
    });
    res.json(category);
  },
);

// Obtener todas las categorías del usuario
router.get("/", async (req, res) => {
  const userId = (req as any).userId;
  const categories = await prisma.category.findMany({
    where: { userId },
  });
  res.json(categories);
});

// Actualizar categoría
router.put(
  "/:id",
  validate(updateCategorySchema),
  async (req, res) => {
    const { id } = req.params;
    const userId = (req as any).userId;

    const existing = await prisma.category.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    const category = await prisma.category.update({
      where: { id },
      data: req.body,
    });
    res.json(category);
  },
);

// Eliminar categoría
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).userId;

  const existing = await prisma.category.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Categoría no encontrada" });
  }

  await prisma.category.delete({ where: { id } });
  res.json({ message: "Categoría eliminada" });
});

export default router;
