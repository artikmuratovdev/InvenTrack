import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { prisma } from "../db.js";
import { env } from "../env.js";
import { authenticate, signToken, validate, wrap, HttpError } from "../middleware.js";
import { loginSchema } from "../schemas.js";

export const authRouter = Router();

// Parol tanlash hujumidan himoya: IP bo'yicha 15 daqiqada 10 urinish
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.isTest ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Juda ko'p urinish. 15 daqiqadan keyin qayta urinib ko'ring" },
});

// Foydalanuvchi topilmaganda ham bcrypt ishlaydi: javob vaqti bo'yicha email aniqlanmaydi
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 12);

authRouter.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  wrap(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok || !user.isActive) throw new HttpError(401, "Email yoki parol noto'g'ri");
    const token = signToken({ id: user.id, role: user.role as any });
    res.json({
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  }),
);

authRouter.get(
  "/me",
  authenticate,
  wrap(async (req, res) => {
    const u = await prisma.user.findUniqueOrThrow({
      where: { id: req.user!.id },
      select: { id: true, fullName: true, email: true, role: true, departmentId: true },
    });
    res.json(u);
  }),
);
