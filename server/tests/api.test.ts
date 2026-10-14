import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";

const app = createApp();
const PASS = "Test12345!";
let admin = "", resp = "", other = "", employee = "";
let typeId = 0, roomId = 0, respId = 0;

const login = async (email: string) => (await request(app).post("/api/auth/login").send({ email, password: PASS })).body.token as string;
const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

beforeAll(async () => {
  const passwordHash = await bcrypt.hash(PASS, 4);
  const mk = (email: string, role: string) => prisma.user.create({ data: { fullName: email, email, role, passwordHash } });
  await mk("admin@t.uz", "ADMIN");
  respId = (await mk("resp@t.uz", "RESPONSIBLE")).id;
  await mk("other@t.uz", "RESPONSIBLE");
  await mk("emp@t.uz", "EMPLOYEE");
  typeId = (await prisma.equipmentType.create({ data: { name: "Kompyuter" } })).id;
  roomId = (await prisma.room.create({ data: { name: "101", floor: 1 } })).id;
  admin = await login("admin@t.uz");
  resp = await login("resp@t.uz");
  other = await login("other@t.uz");
  employee = await login("emp@t.uz");
});

describe("auth", () => {
  it("noto'g'ri parolda 401", async () => {
    const r = await request(app).post("/api/auth/login").send({ email: "admin@t.uz", password: "x" });
    expect(r.status).toBe(401);
  });
  it("tokensiz 401", async () => {
    expect((await request(app).get("/api/equipment")).status).toBe(401);
  });
  it("noto'g'ri email formatida o'zbekcha xabar", async () => {
    const r = await request(app).post("/api/auth/login").send({ email: "abc", password: "x" });
    expect(r.status).toBe(400);
    expect(r.body.errors[0].message).toBe("Email formati noto'g'ri");
  });
});

describe("jihoz", () => {
  let id = 0;
  it("admin yaratadi, inventar raqam ketma-ket beriladi", async () => {
    const body = { name: "Dell kompyuter", typeId, roomId, responsibleUserId: respId, condition: "GOOD", usageStatus: "IN_USE" };
    const a = await request(app).post("/api/equipment").set(auth(admin)).send(body);
    const b = await request(app).post("/api/equipment").set(auth(admin)).send({ ...body, name: "Ikkinchi" });
    expect(a.status).toBe(201);
    const year = new Date().getFullYear();
    expect(a.body.inventoryNumber).toBe(`INV-${year}-0001`);
    expect(b.body.inventoryNumber).toBe(`INV-${year}-0002`);
    id = a.body.id;
  });
  it("xodim yarata olmaydi (403)", async () => {
    const r = await request(app).post("/api/equipment").set(auth(employee)).send({ name: "X1", typeId });
    expect(r.status).toBe(403);
  });
  it("validatsiya xabari o'zbekcha", async () => {
    const r = await request(app).post("/api/equipment").set(auth(admin)).send({ typeId });
    expect(r.status).toBe(400);
    expect(r.body.errors[0].message).toBe("Maydon to'ldirilishi shart");
  });
  it("xona o'zgarsa tarixga MOVED yoziladi", async () => {
    const room2 = await prisma.room.create({ data: { name: "202", floor: 2 } });
    const r = await request(app).patch(`/api/equipment/${id}`).set(auth(admin)).send({ roomId: room2.id });
    expect(r.status).toBe(200);
    const h = await request(app).get(`/api/equipment/${id}/history`).set(auth(admin));
    const moved = h.body.find((x: any) => x.action === "MOVED");
    expect(moved).toMatchObject({ oldValue: "101", newValue: "202" });
  });
  it("mas'ul faqat o'z jihozining holatini o'zgartiradi", async () => {
    const ok = await request(app).patch(`/api/equipment/${id}`).set(auth(resp)).send({ condition: "FAIR" });
    expect(ok.status).toBe(200);
    const noRoom = await request(app).patch(`/api/equipment/${id}`).set(auth(resp)).send({ roomId });
    expect(noRoom.status).toBe(403);
    const stranger = await request(app).patch(`/api/equipment/${id}`).set(auth(other)).send({ condition: "GOOD" });
    expect(stranger.status).toBe(403);
  });
  it("mas'ul ro'yxatda faqat o'z jihozlarini ko'radi", async () => {
    const mine = await request(app).get("/api/equipment").set(auth(resp));
    const theirs = await request(app).get("/api/equipment").set(auth(other));
    expect(mine.body.total).toBe(2);
    expect(theirs.body.total).toBe(0);
  });
  it("filtr va qidiruv ishlaydi", async () => {
    const r = await request(app).get("/api/equipment?search=Ikkinchi&condition=GOOD").set(auth(admin));
    expect(r.body.total).toBe(1);
  });
});

describe("ta'mir", () => {
  let eqId = 0, repairId = 0;
  it("yuborilsa holat Ta'mirda bo'ladi, takroriy 409", async () => {
    eqId = (await request(app).post("/api/equipment").set(auth(admin)).send({ name: "Printer HP", typeId, usageStatus: "IN_USE" })).body.id;
    const r = await request(app).post(`/api/equipment/${eqId}/repairs`).set(auth(admin)).send({ reason: "Qog'oz tiqiladi", repairer: "Servis", cost: 100000 });
    expect(r.status).toBe(201);
    repairId = r.body.id;
    expect((await prisma.equipment.findUniqueOrThrow({ where: { id: eqId } })).usageStatus).toBe("IN_REPAIR");
    const dup = await request(app).post(`/api/equipment/${eqId}/repairs`).set(auth(admin)).send({ reason: "Yana bir sabab" });
    expect(dup.status).toBe(409);
  });
  it("qaytarilsa holat yangilanadi va tarixga yoziladi", async () => {
    const r = await request(app).patch(`/api/repairs/${repairId}`).set(auth(admin)).send({ result: "Tuzatildi", usageStatus: "IN_USE", condition: "GOOD" });
    expect(r.status).toBe(200);
    const eq = await prisma.equipment.findUniqueOrThrow({ where: { id: eqId } });
    expect(eq).toMatchObject({ usageStatus: "IN_USE", condition: "GOOD" });
    const actions = (await prisma.equipmentHistory.findMany({ where: { equipmentId: eqId } })).map((h) => h.action);
    expect(actions).toEqual(expect.arrayContaining(["CREATED", "REPAIR_SENT", "REPAIR_RETURNED"]));
  });
});

describe("hisobot va foydalanuvchilar", () => {
  it("dashboard jami sonni qaytaradi", async () => {
    const r = await request(app).get("/api/reports/dashboard").set(auth(admin));
    expect(r.status).toBe(200);
    expect(r.body.total).toBeGreaterThan(0);
  });
  it("xlsx eksport", async () => {
    const r = await request(app).get("/api/reports/inventory/export?format=xlsx").set(auth(admin)).buffer().parse((res, cb) => {
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => cb(null, Buffer.concat(chunks)));
    });
    expect(r.status).toBe(200);
    expect(r.headers["content-type"]).toContain("spreadsheetml");
    expect((r.body as Buffer).subarray(0, 2).toString()).toBe("PK");
  });
  it("foydalanuvchilar boshqaruvi faqat admin uchun", async () => {
    expect((await request(app).get("/api/users").set(auth(resp))).status).toBe(403);
    expect((await request(app).get("/api/users").set(auth(admin))).status).toBe(200);
  });
  it("bloklangan foydalanuvchi tokeni ishlamaydi", async () => {
    const u = await prisma.user.findUniqueOrThrow({ where: { email: "emp@t.uz" } });
    await prisma.user.update({ where: { id: u.id }, data: { isActive: false } });
    expect((await request(app).get("/api/equipment").set(auth(employee))).status).toBe(401);
  });
});
