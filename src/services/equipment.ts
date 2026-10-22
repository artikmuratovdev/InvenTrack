import type { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { HttpError } from "../middleware.js";

type Tx = Prisma.TransactionClient;

const TRACKED = [
  "name", "typeId", "brand", "model", "serialNumber", "purchaseDate", "price",
  "roomId", "responsibleUserId", "condition", "usageStatus", "notes",
] as const;
type Tracked = (typeof TRACKED)[number];

const ACTION_BY_FIELD: Partial<Record<Tracked, string>> = {
  roomId: "MOVED",
  responsibleUserId: "RESPONSIBLE_CHANGED",
  condition: "CONDITION_CHANGED",
};

export async function writeHistory(
  tx: Tx,
  equipmentId: number,
  action: string,
  changedById: number | null,
  field?: string,
  oldValue?: string | null,
  newValue?: string | null,
) {
  await tx.equipmentHistory.create({
    data: { equipmentId, action, field, oldValue, newValue, changedById },
  });
}

// ID o'rniga tarixda odam o'qiy oladigan nom yoziladi
async function labelFor(tx: Tx, field: Tracked, value: unknown): Promise<string | null> {
  if (value === null || value === undefined) return null;
  if (field === "roomId") return (await tx.room.findUnique({ where: { id: value as number } }))?.name ?? String(value);
  if (field === "responsibleUserId")
    return (await tx.user.findUnique({ where: { id: value as number } }))?.fullName ?? String(value);
  if (field === "typeId")
    return (await tx.equipmentType.findUnique({ where: { id: value as number } }))?.name ?? String(value);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

async function nextInventoryNumber(tx: Tx, year: number) {
  // Tranzaksiya ichida oshiriladi: ikki so'rov bir xil raqam olmaydi
  const c = await tx.inventoryCounter.upsert({
    where: { year },
    create: { year, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });
  return `INV-${year}-${String(c.lastNumber).padStart(4, "0")}`;
}

async function assertRefs(tx: Tx, d: { typeId?: number; roomId?: number | null; responsibleUserId?: number | null }) {
  if (d.typeId && !(await tx.equipmentType.findUnique({ where: { id: d.typeId } })))
    throw new HttpError(400, "Jihoz turi topilmadi");
  if (d.roomId && !(await tx.room.findUnique({ where: { id: d.roomId } }))) throw new HttpError(400, "Xona topilmadi");
  if (d.responsibleUserId) {
    const u = await tx.user.findUnique({ where: { id: d.responsibleUserId } });
    if (!u || !u.isActive) throw new HttpError(400, "Mas'ul shaxs topilmadi");
  }
}

export async function createEquipment(data: Omit<Prisma.EquipmentUncheckedCreateInput, "inventoryNumber">, userId: number | null) {
  return prisma.$transaction(async (tx) => {
    await assertRefs(tx, data);
    const year = new Date().getFullYear();
    const inventoryNumber = await nextInventoryNumber(tx, year);
    const written = data.condition === "WRITTEN_OFF";
    const eq = await tx.equipment.create({
      data: { ...data, inventoryNumber, usageStatus: written ? "WRITTEN_OFF" : data.usageStatus },
    });
    await writeHistory(tx, eq.id, "CREATED", userId, undefined, undefined, inventoryNumber);
    return eq;
  });
}

export async function updateEquipment(
  id: number,
  patch: Partial<Record<Tracked, any>>,
  userId: number,
) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.equipment.findUnique({ where: { id } });
    if (!current) throw new HttpError(404, "Jihoz topilmadi");
    if (current.isArchived) throw new HttpError(400, "Arxivdagi jihozni tahrirlab bo'lmaydi");

    if (patch.condition === "WRITTEN_OFF") patch.usageStatus = "WRITTEN_OFF";
    if (patch.usageStatus && patch.usageStatus !== current.usageStatus) {
      if (patch.usageStatus === "IN_REPAIR")
        throw new HttpError(400, "Ta'mirga yuborish uchun ta'mir qaydini yarating");
      if (current.usageStatus === "IN_REPAIR")
        throw new HttpError(400, "Jihoz ta'mirda: avval ta'mirni yakunlang");
    }
    await assertRefs(tx, patch);

    const changes: { field: Tracked; oldV: unknown; newV: unknown }[] = [];
    const data: Record<string, unknown> = {};
    for (const f of TRACKED) {
      if (!(f in patch)) continue;
      const oldV = (current as any)[f];
      const newV = patch[f] ?? null;
      const same = oldV instanceof Date && newV instanceof Date ? oldV.getTime() === newV.getTime() : oldV === newV;
      if (same || (oldV === null && newV === null)) continue;
      changes.push({ field: f, oldV, newV });
      data[f] = newV;
    }
    if (changes.length === 0) return current;

    const updated = await tx.equipment.update({ where: { id }, data });
    for (const c of changes) {
      await writeHistory(
        tx, id, ACTION_BY_FIELD[c.field] ?? "UPDATED", userId, c.field,
        await labelFor(tx, c.field, c.oldV), await labelFor(tx, c.field, c.newV),
      );
    }
    return updated;
  });
}

export async function setArchived(id: number, archived: boolean, userId: number) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.equipment.findUnique({ where: { id } });
    if (!current) throw new HttpError(404, "Jihoz topilmadi");
    if (current.isArchived === archived) return current;
    const updated = await tx.equipment.update({ where: { id }, data: { isArchived: archived } });
    await writeHistory(tx, id, archived ? "ARCHIVED" : "RESTORED", userId);
    return updated;
  });
}
