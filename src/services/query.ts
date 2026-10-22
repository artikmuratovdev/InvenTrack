import type { Prisma } from "@prisma/client";
import type { AuthUser } from "../middleware.js";

export interface EquipmentFilters {
  search?: string;
  typeId?: number;
  roomId?: number;
  departmentId?: number;
  responsibleId?: number;
  condition?: string;
  usageStatus?: string;
  archived?: boolean;
}

// Ro'yxat va hisobot bir xil filtrdan foydalanadi. Mas'ul shaxs faqat o'z jihozlarini ko'radi.
export function buildWhere(f: EquipmentFilters, user: AuthUser): Prisma.EquipmentWhereInput {
  const where: Prisma.EquipmentWhereInput = { isArchived: f.archived ?? false };
  if (f.typeId) where.typeId = f.typeId;
  if (f.roomId) where.roomId = f.roomId;
  if (f.departmentId) where.room = { departmentId: f.departmentId };
  if (f.condition) where.condition = f.condition;
  if (f.usageStatus) where.usageStatus = f.usageStatus;
  if (user.role === "RESPONSIBLE") where.responsibleUserId = user.id;
  else if (f.responsibleId) where.responsibleUserId = f.responsibleId;
  if (f.search) {
    where.OR = ["inventoryNumber", "name", "brand", "model", "serialNumber"].map((k) => ({
      [k]: { contains: f.search, mode: "insensitive" },
    })) as Prisma.EquipmentWhereInput[];
  }
  return where;
}

export const equipmentInclude = {
  type: true,
  room: { include: { department: true } },
  responsible: { select: { id: true, fullName: true } },
} satisfies Prisma.EquipmentInclude;

// Ro'yxat javobi: { items, total, page, pageSize }. count va findMany birga ishlaydi.
export async function paginate<T>(
  model: { count(a: { where?: any }): Promise<number>; findMany(a: any): Promise<T[]> },
  args: { where?: any; include?: any; select?: any; orderBy?: any },
  q: { page: number; pageSize: number },
) {
  const [total, items] = await Promise.all([
    model.count({ where: args.where }),
    model.findMany({ ...args, skip: (q.page - 1) * q.pageSize, take: q.pageSize }),
  ]);
  return { items, total, page: q.page, pageSize: q.pageSize };
}

export const contains = (v: string) => ({ contains: v, mode: "insensitive" as const });
