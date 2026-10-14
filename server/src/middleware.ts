import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { ZodError, type ZodTypeAny } from "zod";
import { env } from "./env.js";
import { prisma } from "./db.js";
import type { Role } from "./constants.js";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export interface AuthUser {
  id: number;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new HttpError(401, "Tizimga kiring");
    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(header.slice(7), env.jwtSecret) as jwt.JwtPayload;
    } catch {
      throw new HttpError(401, "Sessiya muddati tugagan, qayta kiring");
    }
    // Rol va faollik har safar bazadan olinadi: bloklangan foydalanuvchi tokeni darrov kuchini yo'qotadi
    const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } });
    if (!user || !user.isActive) throw new HttpError(401, "Foydalanuvchi faol emas");
    req.user = { id: user.id, role: user.role as Role };
    next();
  } catch (e) {
    next(e);
  }
}

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) =>
    roles.includes(req.user!.role) ? next() : next(new HttpError(403, "Bu amal uchun ruxsat yo'q"));

export const validate =
  (schema: ZodTypeAny, source: "body" | "query" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) return next(parsed.error);
    // Express 4: req.query ni qayta yozish mumkin
    (req as any)[source] = parsed.data;
    next();
  };

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Ma'lumotlar noto'g'ri kiritilgan",
      errors: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }
  if (err instanceof HttpError) return res.status(err.status).json({ message: err.message });
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return res.status(409).json({ message: "Bunday yozuv allaqachon mavjud" });
    if (err.code === "P2025") return res.status(404).json({ message: "Yozuv topilmadi" });
    if (err.code === "P2003") return res.status(400).json({ message: "Bog'langan yozuv topilmadi" });
  }
  if ((err as any)?.type === "entity.parse.failed") {
    return res.status(400).json({ message: "JSON formati noto'g'ri" });
  }
  console.error(err);
  res.status(500).json({ message: "Serverda xatolik yuz berdi" });
}

export const wrap =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);
