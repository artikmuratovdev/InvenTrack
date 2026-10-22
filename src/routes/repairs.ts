import { Router } from "express";
import { prisma } from "../db.js";
import { HttpError, requireRole, validate, wrap } from "../middleware.js";
import { repairListQuerySchema, repairReturnSchema } from "../schemas.js";
import { returnFromRepair } from "../services/repairs.js";

export const repairsRouter = Router();

repairsRouter.get(
  "/",
  requireRole("ADMIN", "RESPONSIBLE"),
  validate(repairListQuerySchema, "query"),
  wrap(async (req, res) => {
    const q = req.query as any;
    const where: any = {};
    if (q.open !== undefined) where.returnedDate = q.open ? null : { not: null };
    if (req.user!.role === "RESPONSIBLE") where.equipment = { responsibleUserId: req.user!.id };
    const [total, items] = await Promise.all([
      prisma.repair.count({ where }),
      prisma.repair.findMany({
        where,
        include: { equipment: { select: { id: true, inventoryNumber: true, name: true } } },
        orderBy: { sentDate: "desc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    res.json({ items, total, page: q.page, pageSize: q.pageSize });
  }),
);

repairsRouter.patch(
  "/:id",
  requireRole("ADMIN", "RESPONSIBLE"),
  validate(repairReturnSchema),
  wrap(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "Noto'g'ri identifikator");
    if (req.user!.role === "RESPONSIBLE") {
      const r = await prisma.repair.findUnique({ where: { id }, include: { equipment: true } });
      if (!r) throw new HttpError(404, "Ta'mir yozuvi topilmadi");
      if (r.equipment.responsibleUserId !== req.user!.id) throw new HttpError(403, "Bu jihoz sizga biriktirilmagan");
    }
    res.json(await returnFromRepair(id, req.body, req.user!.id));
  }),
);
