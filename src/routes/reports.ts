import { Router } from "express";
import { prisma } from "../db.js";
import { validate, wrap } from "../middleware.js";
import { equipmentQuerySchema, exportQuerySchema } from "../schemas.js";
import { buildWhere, equipmentInclude } from "../services/query.js";
import { sendPdf, sendXlsx } from "../services/exportReport.js";

export const reportsRouter = Router();

reportsRouter.get(
  "/dashboard",
  wrap(async (req, res) => {
    const where = buildWhere({}, req.user!);
    const eqIds = req.user!.role === "RESPONSIBLE" ? { equipment: { responsibleUserId: req.user!.id } } : {};
    const [total, byCondition, byUsage, openRepairs, recent] = await Promise.all([
      prisma.equipment.count({ where }),
      prisma.equipment.groupBy({ by: ["condition"], where, _count: { _all: true } }),
      prisma.equipment.groupBy({ by: ["usageStatus"], where, _count: { _all: true } }),
      prisma.repair.count({ where: { returnedDate: null, ...eqIds } }),
      prisma.equipmentHistory.findMany({
        where: eqIds,
        orderBy: [{ changedAt: "desc" }, { id: "desc" }],
        take: 10,
        include: {
          equipment: { select: { id: true, inventoryNumber: true, name: true } },
          changedBy: { select: { fullName: true } },
        },
      }),
    ]);
    res.json({
      total,
      openRepairs,
      byCondition: byCondition.map((r) => ({ key: r.condition, count: r._count._all })),
      byUsageStatus: byUsage.map((r) => ({ key: r.usageStatus, count: r._count._all })),
      recent,
    });
  }),
);

reportsRouter.get(
  "/inventory",
  validate(equipmentQuerySchema, "query"),
  wrap(async (req, res) => {
    const q = req.query as any;
    const where = buildWhere(q, req.user!);
    const [total, items] = await Promise.all([
      prisma.equipment.count({ where }),
      prisma.equipment.findMany({
        where,
        include: equipmentInclude,
        orderBy: [{ roomId: "asc" }, { inventoryNumber: "asc" }],
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    res.json({ items, total, page: q.page, pageSize: q.pageSize });
  }),
);

reportsRouter.get(
  "/inventory/export",
  validate(exportQuerySchema, "query"),
  wrap(async (req, res) => {
    const q = req.query as any;
    const rows = await prisma.equipment.findMany({
      where: buildWhere(q, req.user!),
      include: equipmentInclude,
      orderBy: [{ roomId: "asc" }, { inventoryNumber: "asc" }],
    });
    if (q.format === "pdf") return sendPdf(res, rows as any);
    await sendXlsx(res, rows as any);
  }),
);
