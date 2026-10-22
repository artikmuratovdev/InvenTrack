import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { HttpError, requireRole, validate, wrap } from "../middleware.js";
import { passwordResetSchema, userCreateSchema, userUpdateSchema } from "../schemas.js";

export const usersRouter = Router();

const PUBLIC = { id: true, fullName: true, email: true, role: true, isActive: true, departmentId: true, createdAt: true };
const idOf = (v: string) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, "Noto'g'ri identifikator");
  return n;
};

// Mas'ul shaxsni tanlash uchun ro'yxat hamma rolga ochiq, faqat ism (email/rolsiz)
usersRouter.get(
  "/options",
  wrap(async (_req, res) =>
    res.json(
      await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true, fullName: true },
        orderBy: { fullName: "asc" },
      }),
    ),
  ),
);

usersRouter.use(requireRole("ADMIN"));

usersRouter.get("/", wrap(async (_req, res) => res.json(await prisma.user.findMany({ select: PUBLIC, orderBy: { id: "asc" } }))));

usersRouter.post(
  "/",
  validate(userCreateSchema),
  wrap(async (req, res) => {
    const { password, ...rest } = req.body;
    const user = await prisma.user.create({
      data: { ...rest, passwordHash: await bcrypt.hash(password, 12) },
      select: PUBLIC,
    });
    res.status(201).json(user);
  }),
);

usersRouter.patch(
  "/:id",
  validate(userUpdateSchema),
  wrap(async (req, res) => {
    const id = idOf(req.params.id);
    // Administrator o'zini bloklay yoki rolini tushira olmaydi
    if (id === req.user!.id && (req.body.isActive === false || (req.body.role && req.body.role !== "ADMIN")))
      throw new HttpError(400, "O'zingizning rolingiz yoki faolligingizni o'zgartira olmaysiz");
    res.json(await prisma.user.update({ where: { id }, data: req.body, select: PUBLIC }));
  }),
);

usersRouter.post(
  "/:id/reset-password",
  validate(passwordResetSchema),
  wrap(async (req, res) => {
    await prisma.user.update({
      where: { id: idOf(req.params.id) },
      data: { passwordHash: await bcrypt.hash(req.body.password, 12) },
    });
    res.json({ message: "Parol yangilandi" });
  }),
);
