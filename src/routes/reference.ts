import { Router } from "express";
import type { ZodTypeAny } from "zod";
import { prisma } from "../db.js";
import { HttpError, requireRole, validate, wrap } from "../middleware.js";
import { departmentSchema, roomSchema, typeSchema } from "../schemas.js";

// Ma'lumotnomalar: o'qish hamma uchun, yozish faqat Administrator uchun
function crud(model: "department" | "room" | "equipmentType", schema: ZodTypeAny, include?: object) {
  const r = Router();
  const m = prisma[model] as any;
  const idOf = (v: string) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, "Noto'g'ri identifikator");
    return n;
  };
  r.get("/", wrap(async (_req, res) => res.json(await m.findMany({ include, orderBy: { id: "asc" } }))));
  r.post("/", requireRole("ADMIN"), validate(schema), wrap(async (req, res) => res.status(201).json(await m.create({ data: req.body }))));
  r.patch(
    "/:id",
    requireRole("ADMIN"),
    validate((schema as any).partial()),
    wrap(async (req, res) => res.json(await m.update({ where: { id: idOf(req.params.id) }, data: req.body }))),
  );
  return r;
}

export const departmentsRouter = crud("department", departmentSchema);
export const roomsRouter = crud("room", roomSchema, { department: true });
export const typesRouter = crud("equipmentType", typeSchema);
