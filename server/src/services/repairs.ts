import { prisma } from "../db.js";
import { HttpError } from "../middleware.js";
import { writeHistory } from "./equipment.js";

export async function sendToRepair(
  equipmentId: number,
  d: { sentDate?: Date; reason: string; repairer?: string | null; cost?: number | null },
  userId: number,
) {
  return prisma.$transaction(async (tx) => {
    const eq = await tx.equipment.findUnique({ where: { id: equipmentId } });
    if (!eq) throw new HttpError(404, "Jihoz topilmadi");
    if (eq.isArchived) throw new HttpError(400, "Arxivdagi jihozni ta'mirga yuborib bo'lmaydi");
    if (eq.usageStatus === "WRITTEN_OFF") throw new HttpError(400, "Hisobdan chiqarilgan jihozni ta'mirga yuborib bo'lmaydi");
    const open = await tx.repair.findFirst({ where: { equipmentId, returnedDate: null } });
    if (open) throw new HttpError(409, "Bu jihoz allaqachon ta'mirda");

    const repair = await tx.repair.create({
      data: {
        equipmentId,
        sentDate: d.sentDate ?? new Date(),
        reason: d.reason,
        repairer: d.repairer ?? null,
        cost: d.cost ?? null,
        createdById: userId,
      },
    });
    await tx.equipment.update({ where: { id: equipmentId }, data: { usageStatus: "IN_REPAIR" } });
    await writeHistory(tx, equipmentId, "REPAIR_SENT", userId, "usageStatus", eq.usageStatus, "IN_REPAIR");
    return repair;
  });
}

export async function returnFromRepair(
  repairId: number,
  d: {
    returnedDate?: Date;
    result: string;
    cost?: number | null;
    usageStatus: "IN_USE" | "IN_STORAGE";
    condition: "GOOD" | "FAIR" | "BROKEN";
  },
  userId: number,
) {
  return prisma.$transaction(async (tx) => {
    const repair = await tx.repair.findUnique({ where: { id: repairId }, include: { equipment: true } });
    if (!repair) throw new HttpError(404, "Ta'mir yozuvi topilmadi");
    if (repair.returnedDate) throw new HttpError(409, "Bu ta'mir allaqachon yakunlangan");
    const returnedDate = d.returnedDate ?? new Date();
    if (returnedDate < repair.sentDate) throw new HttpError(400, "Qaytgan sana yuborilgan sanadan oldin bo'lishi mumkin emas");

    const updated = await tx.repair.update({
      where: { id: repairId },
      data: { returnedDate, result: d.result, cost: d.cost ?? repair.cost },
    });
    const eq = repair.equipment;
    await tx.equipment.update({
      where: { id: eq.id },
      data: { usageStatus: d.usageStatus, condition: d.condition },
    });
    await writeHistory(tx, eq.id, "REPAIR_RETURNED", userId, "usageStatus", "IN_REPAIR", d.usageStatus);
    if (eq.condition !== d.condition)
      await writeHistory(tx, eq.id, "CONDITION_CHANGED", userId, "condition", eq.condition, d.condition);
    return updated;
  });
}
