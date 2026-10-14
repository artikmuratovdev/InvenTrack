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
      [k]: { contains: f.search },
    })) as Prisma.EquipmentWhereInput[];
  }
  return where;
}

export const equipmentInclude = {
  type: true,
  room: { include: { department: true } },
  responsible: { select: { id: true, fullName: true } },
} satisfies Prisma.EquipmentInclude;
