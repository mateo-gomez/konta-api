import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient, Prisma } from "@prisma/client";
import { authMiddleware } from "./middlewares/authMiddleware.js"; // con .js cuando compilemos

dotenv.config();
const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Registro
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    res.json({ id: user.id, email: user.email });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(400).json({ error: "El usuario ya existe" });
      }
    }
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    },
  );

  res.json({ token, user: { id: user.id, email: user.email } });
});

// Ruta protegida
app.get("/profile", authMiddleware, async (req, res) => {
  const userId = (req as unknown as { user: { userId: string } }).user.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  res.json(user);
});

app.listen(3000, () => console.log("Server running on port 3000"));
