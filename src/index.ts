import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "./middlewares/authMiddleware.js"; // con .js cuando compilemos
import authRoutes from "./routes/auth.routes.js";
import accountRoutes from "./routes/account.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

dotenv.config();
const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Rutas
app.use('/auth', authRoutes);

// Ruta protegida
app.get("/profile", authMiddleware, async (req, res) => {
  const userId = (req as unknown as { user: { userId: string } }).user.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  res.json(user);
});

app.use('/accounts', authMiddleware, accountRoutes);
app.use('/transactions', authMiddleware, transactionRoutes);
app.use('/categories', authMiddleware, categoryRoutes);
app.use('/dashboard', authMiddleware, dashboardRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));
