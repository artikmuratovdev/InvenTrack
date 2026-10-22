import { z } from "zod";
import { CONDITIONS, ROLES, USAGE_STATUSES } from "./constants.js";

// Barcha xabarlar o'zbek tilida
z.setErrorMap((issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      return { message: issue.received === "undefined" ? "Maydon to'ldirilishi shart" : "Qiymat turi noto'g'ri" };
    case z.ZodIssueCode.too_small:
      return {
        message:
          issue.type === "string"
            ? `Kamida ${issue.minimum} ta belgi bo'lishi kerak`
            : `Qiymat ${issue.minimum} dan kam bo'lmasligi kerak`,
      };
    case z.ZodIssueCode.too_big:
      return { message: `Qiymat juda katta (eng ko'pi ${issue.maximum})` };
    case z.ZodIssueCode.invalid_enum_value:
      return { message: `Ruxsat etilgan qiymatlar: ${issue.options.join(", ")}` };
    case z.ZodIssueCode.invalid_string:
      return { message: issue.validation === "email" ? "Email formati noto'g'ri" : "Matn formati noto'g'ri" };
    default:
      return { message: ctx.defaultError };
  }
});

const optStr = z.string().trim().max(200).optional().nullable();
const id = z.number().int().positive();
const dateStr = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), "Sana formati noto'g'ri (YYYY-MM-DD)")
  .transform((v) => new Date(v));

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Parolni kiriting"),
});

export const equipmentCreateSchema = z.object({
  name: z.string().trim().min(2).max(200),
  typeId: id,
  brand: optStr,
  model: optStr,
  serialNumber: optStr,
  purchaseDate: dateStr.optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  roomId: id.optional().nullable(),
  responsibleUserId: id.optional().nullable(),
  condition: z.enum(CONDITIONS).default("NEW"),
  usageStatus: z.enum(USAGE_STATUSES).default("IN_STORAGE"),
  notes: z.string().max(2000).optional().nullable(),
});

export const equipmentUpdateSchema = equipmentCreateSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Kamida bitta maydonni o'zgartiring");

const boolStr = z.enum(["true", "false"]).transform((v) => v === "true");
const intQ = z.coerce.number().int().positive();

export const equipmentQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  typeId: intQ.optional(),
  roomId: intQ.optional(),
  departmentId: intQ.optional(),
  responsibleId: intQ.optional(),
  condition: z.enum(CONDITIONS).optional(),
  usageStatus: z.enum(USAGE_STATUSES).optional(),
  archived: boolStr.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const exportQuerySchema = equipmentQuerySchema.extend({
  format: z.enum(["xlsx", "pdf"]).default("xlsx"),
});

export const repairCreateSchema = z.object({
  sentDate: dateStr.optional(),
  reason: z.string().trim().min(3, "Sababni yozing (kamida 3 ta belgi)").max(500),
  repairer: optStr,
  cost: z.number().min(0).optional().nullable(),
});

export const repairReturnSchema = z.object({
  returnedDate: dateStr.optional(),
  result: z.string().trim().min(2, "Natijani yozing").max(500),
  cost: z.number().min(0).optional().nullable(),
  usageStatus: z.enum(["IN_USE", "IN_STORAGE"]).default("IN_STORAGE"),
  condition: z.enum(["GOOD", "FAIR", "BROKEN"]).default("GOOD"),
});

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const repairListQuerySchema = pageQuerySchema.extend({
  open: boolStr.optional(),
  equipmentId: intQ.optional(),
});

const searchQ = z.string().trim().max(100).optional();
export const searchQuerySchema = pageQuerySchema.extend({ search: searchQ });
export const roomListQuerySchema = searchQuerySchema.extend({ departmentId: intQ.optional() });
export const userListQuerySchema = searchQuerySchema.extend({
  role: z.enum(ROLES).optional(),
  departmentId: intQ.optional(),
  isActive: boolStr.optional(),
});

export const userCreateSchema = z.object({
  fullName: z.string().trim().min(3).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak").max(100),
  role: z.enum(ROLES),
  departmentId: id.optional().nullable(),
});

export const userUpdateSchema = z
  .object({
    fullName: z.string().trim().min(3).max(120),
    role: z.enum(ROLES),
    departmentId: id.nullable(),
    isActive: z.boolean(),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Kamida bitta maydonni o'zgartiring");

export const passwordResetSchema = z.object({
  password: z.string().min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak").max(100),
});

export const departmentSchema = z.object({ name: z.string().trim().min(2).max(100) });
export const roomSchema = z.object({
  name: z.string().trim().min(1).max(100),
  floor: z.number().int().min(-2).max(100).default(1),
  departmentId: id.optional().nullable(),
});
export const typeSchema = z.object({
  name: z.string().trim().min(2).max(100),
  icon: z.string().trim().max(40).default("box"),
});
