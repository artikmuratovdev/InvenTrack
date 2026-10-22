import { Router } from "express";
import type { ZodTypeAny } from "zod";
import { prisma } from "../db.js";
import { HttpError, requireRole, validate, wrap } from "../middleware.js";
import { departmentSchema, roomListQuerySchema, roomSchema, searchQuerySchema, typeSchema } from "../schemas.js";
import { contains, paginate } from "../services/query.js";

// Ma'lumotnomalar: o'qish hamma uchun, yozish faqat Administrator uchun
function crud(model: "department" | "room" | "equipmentType", schema: ZodTypeAny, listQuery: ZodTypeAny, include?: object) {
  const r = Router();
  const m = prisma[model] as any;
  const idOf = (v: string) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, "Noto'g'ri identifikator");
    return n;
  };
  r.get(
    "/",
    validate(listQuery, "query"),
    wrap(async (req, res) => {
      const { search, departmentId, ...page } = req.query as any;
      const where: any = {};
      if (search) where.name = contains(search);
      if (departmentId) where.departmentId = departmentId;
      res.json(await paginate(m, { where, include, orderBy: { id: "asc" } }, page));
    }),
  );
  r.post("/", requireRole("ADMIN"), validate(schema), wrap(async (req, res) => res.status(201).json(await m.create({ data: req.body }))));
  r.patch(
    "/:id",
    requireRole("ADMIN"),
    validate((schema as any).partial()),
    wrap(async (req, res) => res.json(await m.update({ where: { id: idOf(req.params.id) }, data: req.body }))),
  );
  return r;
}

export const departmentsRouter = crud("department", departmentSchema, searchQuerySchema);
export const roomsRouter = crud("room", roomSchema, roomListQuerySchema, { department: true });
export const typesRouter = crud("equipmentType", typeSchema, searchQuerySchema);
