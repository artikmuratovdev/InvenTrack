import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/db.js";
import { createEquipment, updateEquipment } from "../src/services/equipment.js";
import { returnFromRepair, sendToRepair } from "../src/services/repairs.js";

const password = process.env.SEED_PASSWORD;
if (!password) throw new Error("SEED_PASSWORD .env faylida berilishi shart");

async function main() {
  if ((await prisma.user.count()) > 0) {
    console.log("Baza bo'sh emas, seed o'tkazib yuborildi");
    return;
  }
  const passwordHash = await bcrypt.hash(password!, 12);

  const [admin, it, acc, hr] = await Promise.all(
    ["Axborot texnologiyalari", "Buxgalteriya", "Kadrlar bo'limi"].map((name) => prisma.department.create({ data: { name } })),
  ).then((d) => [null, ...d] as const);
  void admin;

  const rooms = await Promise.all(
    [
      ["101-xona", 1, it.id], ["102-xona", 1, it.id], ["201-xona", 2, acc.id],
      ["202-xona", 2, hr.id], ["Ombor", 0, null],
    ].map(([name, floor, departmentId]) =>
      prisma.room.create({ data: { name: name as string, floor: floor as number, departmentId: departmentId as number | null } }),
    ),
  );

  const types = await Promise.all(
    [
      ["Kompyuter", "desktop"], ["Monitor", "monitor"], ["Printer", "printer"], ["Proyektor", "projector"],
      ["Router", "router"], ["UPS", "battery"], ["Noutbuk", "laptop"],
    ].map(([name, icon]) => prisma.equipmentType.create({ data: { name, icon } })),
  );

  const mk = (fullName: string, email: string, role: string, departmentId: number) =>
    prisma.user.create({ data: { fullName, email, role, departmentId, passwordHash } });
  const adminUser = await mk("Administrator", "admin@inventrack.uz", "ADMIN", it.id);
  const resp1 = await mk("Aziz Karimov", "aziz@inventrack.uz", "RESPONSIBLE", it.id);
  const resp2 = await mk("Dilnoza Tosheva", "dilnoza@inventrack.uz", "RESPONSIBLE", acc.id);
  await mk("Bobur Yusupov", "bobur@inventrack.uz", "EMPLOYEE", hr.id);

  const brands: Record<string, [string, string][]> = {
    Kompyuter: [["Dell", "OptiPlex 7090"], ["HP", "ProDesk 400"], ["Lenovo", "ThinkCentre M70"]],
    Monitor: [["Samsung", "S24R350"], ["LG", "24MK430H"], ["Dell", "P2422H"]],
    Printer: [["HP", "LaserJet M404"], ["Canon", "i-SENSYS MF445"], ["Epson", "L3250"]],
    Proyektor: [["Epson", "EB-X06"], ["BenQ", "MX550"]],
    Router: [["MikroTik", "hAP ac2"], ["TP-Link", "Archer C6"]],
    UPS: [["APC", "Back-UPS 650"], ["Ippon", "Back Power 800"]],
    Noutbuk: [["Lenovo", "ThinkPad E14"], ["Asus", "VivoBook 15"], ["HP", "ProBook 450"]],
  };
  const conditions = ["NEW", "GOOD", "GOOD", "FAIR", "GOOD", "NEW"];
  const usage = ["IN_USE", "IN_USE", "IN_STORAGE", "IN_USE"];
  const staff = [resp1, resp2];

  const created = [];
  for (let i = 0; i < 32; i++) {
    const type = types[i % types.length];
    const options = brands[type.name];
    const [brand, model] = options[i % options.length];
    const room = rooms[i % rooms.length];
    const inStorage = room.name === "Ombor";
    created.push(
      await createEquipment(
        {
          name: `${type.name} ${brand} ${model}`,
          typeId: type.id,
          brand,
          model,
          serialNumber: `SN${String(100000 + i * 37)}`,
          purchaseDate: new Date(2023 + (i % 3), (i * 5) % 12, 10),
          price: 1500000 + i * 250000,
          roomId: room.id,
          responsibleUserId: staff[i % 2].id,
          condition: conditions[i % conditions.length],
          usageStatus: inStorage ? "IN_STORAGE" : usage[i % usage.length],
          notes: null,
        },
        adminUser.id,
      ),
    );
  }

  // Ta'mir yozuvlari: 3 tasi yakunlangan, 2 tasi ochiq
  const repairs: [number, string, string, number][] = [
    [0, "Quvvat bloki ishlamayapti", "TechService", 350000],
    [4, "Ekran miltillaydi", "DisplayFix", 420000],
    [8, "Qog'oz tiqilib qolishi", "PrintPro", 180000],
    [12, "Yoqilmaydi", "TechService", 0],
    [17, "Batareya almashtirish", "PowerLab", 260000],
  ];
  for (const [idx, reason, repairer, cost] of repairs) {
    const eq = created[idx];
    if (eq.usageStatus === "IN_STORAGE") await updateEquipment(eq.id, { usageStatus: "IN_USE" }, adminUser.id);
    const r = await sendToRepair(eq.id, { reason, repairer, cost, sentDate: new Date(Date.now() - 20 * 864e5) }, adminUser.id);
    if (idx < 10) {
      await returnFromRepair(
        r.id,
        { result: "Muvaffaqiyatli ta'mirlandi", usageStatus: "IN_USE", condition: "GOOD", returnedDate: new Date(Date.now() - 5 * 864e5) },
        adminUser.id,
      );
    }
  }

  console.log("Seed tayyor: 32 jihoz, 5 xona, 3 bo'lim, 4 foydalanuvchi, 5 ta'mir");
}

main().finally(() => prisma.$disconnect());
