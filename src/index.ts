import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "./middlewares/authMiddleware.js"; // con .js cuando compilemos
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Rutas
app.use('/auth', authRoutes);

// Middleware de autenticación
app.use(authMiddleware);

// Ruta protegida
app.get("/profile", async (req, res) => {
  const userId = (req as unknown as { user: { userId: string } }).user.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  res.json(user);
});

app.listen(3000, () => console.log("Server running on port 3000"));
