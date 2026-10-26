import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { HttpError, idParam as idOf, requireRole, validate, wrap } from "../middleware.js";
import { passwordResetSchema, searchQuerySchema, userCreateSchema, userListQuerySchema, userUpdateSchema } from "../schemas.js";
import { contains, paginate } from "../services/query.js";

export const usersRouter = Router();

const PUBLIC = { id: true, fullName: true, email: true, role: true, isActive: true, departmentId: true, createdAt: true };

// Mas'ul shaxsni tanlash uchun ro'yxat hamma rolga ochiq, faqat ism (email/rolsiz)
usersRouter.get(
  "/options",
  validate(searchQuerySchema, "query"),
  wrap(async (req, res) => {
    const { search, ...page } = req.query as any;
    const where: any = { isActive: true };
    if (search) where.fullName = contains(search);
    res.json(await paginate(prisma.user, { where, select: { id: true, fullName: true }, orderBy: { fullName: "asc" } }, page));
  }),
);

usersRouter.use(requireRole("ADMIN"));

usersRouter.get(
  "/",
  validate(userListQuerySchema, "query"),
  wrap(async (req, res) => {
    const { search, ...rest } = req.query as any;
    const { page, pageSize, ...filters } = rest;
    const where: any = { ...filters };
    if (search) where.OR = [{ fullName: contains(search) }, { email: contains(search) }];
    res.json(await paginate(prisma.user, { where, select: PUBLIC, orderBy: { id: "asc" } }, { page, pageSize }));
  }),
);

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
