import { Router } from "express";
import QRCode from "qrcode";
import { prisma } from "../db.js";
import { HttpError, requireRole, validate, wrap } from "../middleware.js";
import {
  equipmentCreateSchema, equipmentQuerySchema, equipmentUpdateSchema,
  repairCreateSchema,
} from "../schemas.js";
import { createEquipment, setArchived, updateEquipment } from "../services/equipment.js";
import { buildWhere, equipmentInclude } from "../services/query.js";
import { sendToRepair } from "../services/repairs.js";

export const equipmentRouter = Router();

const idParam = (v: string) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, "Noto'g'ri identifikator");
  return n;
};

// Mas'ul shaxs faqat o'z jihozini ko'ra/o'zgartira oladi
async function loadVisible(req: any, id: number) {
  const eq = await prisma.equipment.findUnique({ where: { id }, include: equipmentInclude });
  if (!eq) throw new HttpError(404, "Jihoz topilmadi");
  if (req.user.role === "RESPONSIBLE" && eq.responsibleUserId !== req.user.id)
    throw new HttpError(403, "Bu jihoz sizga biriktirilmagan");
  return eq;
}

equipmentRouter.get(
  "/",
  validate(equipmentQuerySchema, "query"),
  wrap(async (req, res) => {
    const q = req.query as any;
    const where = buildWhere(q, req.user!);
    const [total, items] = await Promise.all([
      prisma.equipment.count({ where }),
      prisma.equipment.findMany({
        where,
        include: equipmentInclude,
        orderBy: { inventoryNumber: "asc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    res.json({ items, total, page: q.page, pageSize: q.pageSize });
  }),
);

equipmentRouter.post(
  "/",
  requireRole("ADMIN"),
  validate(equipmentCreateSchema),
  wrap(async (req, res) => {
    const eq = await createEquipment(req.body, req.user!.id);
    res.status(201).json(eq);
  }),
);

equipmentRouter.get("/:id", wrap(async (req, res) => res.json(await loadVisible(req, idParam(req.params.id)))));

const RESPONSIBLE_FIELDS = ["condition", "usageStatus", "notes"];

equipmentRouter.patch(
  "/:id",
  requireRole("ADMIN", "RESPONSIBLE"),
  validate(equipmentUpdateSchema),
  wrap(async (req, res) => {
    const id = idParam(req.params.id);
    if (req.user!.role === "RESPONSIBLE") {
      await loadVisible(req, id);
      const forbidden = Object.keys(req.body).filter((k) => !RESPONSIBLE_FIELDS.includes(k));
      if (forbidden.length) throw new HttpError(403, "Mas'ul faqat holat, foydalanish holati va izohni o'zgartira oladi");
    }
    res.json(await updateEquipment(id, req.body, req.user!.id));
  }),
);

equipmentRouter.post(
  "/:id/archive",
  requireRole("ADMIN"),
  wrap(async (req, res) => res.json(await setArchived(idParam(req.params.id), true, req.user!.id))),
);
equipmentRouter.post(
  "/:id/restore",
  requireRole("ADMIN"),
  wrap(async (req, res) => res.json(await setArchived(idParam(req.params.id), false, req.user!.id))),
);

equipmentRouter.get(
  "/:id/history",
  wrap(async (req, res) => {
    const id = idParam(req.params.id);
    await loadVisible(req, id);
    const items = await prisma.equipmentHistory.findMany({
      where: { equipmentId: id },
      include: { changedBy: { select: { id: true, fullName: true } } },
      orderBy: [{ changedAt: "desc" }, { id: "desc" }],
    });
    res.json(items);
  }),
);

equipmentRouter.get(
  "/:id/repairs",
  wrap(async (req, res) => {
    const id = idParam(req.params.id);
    await loadVisible(req, id);
    res.json(await prisma.repair.findMany({ where: { equipmentId: id }, orderBy: { sentDate: "desc" } }));
  }),
);

equipmentRouter.post(
  "/:id/repairs",
  requireRole("ADMIN", "RESPONSIBLE"),
  validate(repairCreateSchema),
  wrap(async (req, res) => {
    const id = idParam(req.params.id);
    await loadVisible(req, id);
    res.status(201).json(await sendToRepair(id, req.body, req.user!.id));
  }),
);

equipmentRouter.get(
  "/:id/qr",
  wrap(async (req, res) => {
    const eq = await loadVisible(req, idParam(req.params.id));
    const png = await QRCode.toBuffer(eq.inventoryNumber, { width: 300, margin: 1 });
    res.type("png").send(png);
  }),
);
