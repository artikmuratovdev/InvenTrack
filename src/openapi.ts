import { CONDITIONS, ROLES, USAGE_STATUSES } from "./constants.js";

const ref = (n: string) => ({ $ref: `#/components/schemas/${n}` });
const json = (schema: object) => ({ "application/json": { schema } });
const body = (schema: object) => ({ required: true, content: json(schema) });
const ok = (description: string, schema?: object) => ({ description, ...(schema && { content: json(schema) }) });
const err = { $ref: "#/components/responses/Error" };
const idPath = { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } };
const q = (name: string, schema: object, description?: string) => ({ name, in: "query", schema, ...(description && { description }) });
const page = [q("page", { type: "integer", minimum: 1, default: 1 }), q("pageSize", { type: "integer", minimum: 1, maximum: 100, default: 20 })];
const list = (item: string) => ({
  type: "object",
  properties: { items: { type: "array", items: ref(item) }, total: { type: "integer" }, page: { type: "integer" }, pageSize: { type: "integer" } },
});
const eqFilters = [
  q("search", { type: "string", maxLength: 100 }),
  q("typeId", { type: "integer" }), q("roomId", { type: "integer" }),
  q("departmentId", { type: "integer" }), q("responsibleId", { type: "integer" }),
  q("condition", ref("Condition")), q("usageStatus", ref("UsageStatus")),
  q("archived", { type: "boolean" }), ...page,
];
const admin = "Faqat ADMIN.";
const adminOrResp = "ADMIN yoki RESPONSIBLE (RESPONSIBLE faqat o'z jihozlari).";

// Ma'lumotnoma (departments / rooms / equipment-types) CRUD
const reference = (path: string, tag: string, schema: string, extra: object[] = []) => ({
  [path]: {
    get: { tags: [tag], summary: `${tag} ro'yxati`, parameters: [q("search", { type: "string", maxLength: 100 }, "Nom bo'yicha qidiruv"), ...extra, ...page], responses: { 200: ok("Sahifa", ref(schema + "List")) } },
    post: { tags: [tag], summary: `${tag} qo'shish. ${admin}`, requestBody: body(ref(schema + "Input")), responses: { 201: ok("Yaratildi", ref(schema)), 403: err } },
  },
  [`${path}/{id}`]: {
    patch: {
      tags: [tag], summary: `${tag} tahrirlash. ${admin}`, parameters: [idPath],
      requestBody: body(ref(schema + "Input")), responses: { 200: ok("Yangilandi", ref(schema)), 403: err },
    },
  },
});

export const openapi = {
  openapi: "3.0.3",
  info: { title: "InvenTrack API", version: "1.0.0", description: "Jihozlar inventarizatsiyasi tizimi. /auth/login orqali token oling va «Authorize» tugmasiga kiriting." },
  servers: [{ description: "Backend url", url: "/api" }],
  security: [{ bearerAuth: [] }],
  tags: ["Auth", "Equipment", "Repairs", "Departments", "Rooms", "Equipment types", "Users", "Reports", "AI"].map((name) => ({ name })),
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
    responses: {
      Error: { description: "Xato (400 validatsiya, 401 token yo'q, 403 ruxsat yo'q, 404 topilmadi)", content: json(ref("Error")) },
    },
    schemas: {
      Role: { type: "string", enum: [...ROLES] },
      Condition: { type: "string", enum: [...CONDITIONS] },
      UsageStatus: { type: "string", enum: [...USAGE_STATUSES] },
      Error: {
        type: "object",
        properties: { message: { type: "string" }, errors: { type: "array", items: { type: "object", properties: { field: { type: "string" }, message: { type: "string" } } } } },
      },
      LoginInput: { type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email", example: "admin@inventrack.uz" }, password: { type: "string" } } },
      UserShort: { type: "object", properties: { id: { type: "integer" }, fullName: { type: "string" }, email: { type: "string" }, role: ref("Role") } },
      User: {
        type: "object",
        properties: { id: { type: "integer" }, fullName: { type: "string" }, email: { type: "string" }, role: ref("Role"), isActive: { type: "boolean" }, departmentId: { type: "integer", nullable: true }, createdAt: { type: "string", format: "date-time" } },
      },
      UserCreate: {
        type: "object", required: ["fullName", "email", "password", "role"],
        properties: { fullName: { type: "string", minLength: 3 }, email: { type: "string", format: "email" }, password: { type: "string", minLength: 8 }, role: ref("Role"), departmentId: { type: "integer", nullable: true } },
      },
      UserUpdate: { type: "object", properties: { fullName: { type: "string" }, role: ref("Role"), departmentId: { type: "integer", nullable: true }, isActive: { type: "boolean" } } },
      Department: { type: "object", properties: { id: { type: "integer" }, name: { type: "string" } } },
      DepartmentInput: { type: "object", required: ["name"], properties: { name: { type: "string", minLength: 2 } } },
      Room: { type: "object", properties: { id: { type: "integer" }, name: { type: "string" }, floor: { type: "integer" }, departmentId: { type: "integer", nullable: true }, department: ref("Department") } },
      RoomInput: { type: "object", required: ["name"], properties: { name: { type: "string" }, floor: { type: "integer", default: 1 }, departmentId: { type: "integer", nullable: true } } },
      EquipmentType: { type: "object", properties: { id: { type: "integer" }, name: { type: "string" }, icon: { type: "string" } } },
      EquipmentTypeInput: { type: "object", required: ["name"], properties: { name: { type: "string", minLength: 2 }, icon: { type: "string", default: "box" } } },
      Equipment: {
        type: "object",
        properties: {
          id: { type: "integer" }, inventoryNumber: { type: "string", example: "INV-2026-0001" }, name: { type: "string" },
          typeId: { type: "integer" }, brand: { type: "string", nullable: true }, model: { type: "string", nullable: true },
          serialNumber: { type: "string", nullable: true }, purchaseDate: { type: "string", format: "date-time", nullable: true },
          price: { type: "number", nullable: true }, roomId: { type: "integer", nullable: true }, responsibleUserId: { type: "integer", nullable: true },
          condition: ref("Condition"), usageStatus: ref("UsageStatus"), notes: { type: "string", nullable: true },
          type: ref("EquipmentType"), room: ref("Room"), responsibleUser: ref("UserShort"),
        },
      },
      EquipmentCreate: {
        type: "object", required: ["name", "typeId"],
        properties: {
          name: { type: "string", minLength: 2 }, typeId: { type: "integer" }, brand: { type: "string", nullable: true }, model: { type: "string", nullable: true },
          serialNumber: { type: "string", nullable: true }, purchaseDate: { type: "string", format: "date", nullable: true }, price: { type: "number", minimum: 0, nullable: true },
          roomId: { type: "integer", nullable: true }, responsibleUserId: { type: "integer", nullable: true },
          condition: { ...ref("Condition"), default: "NEW" }, usageStatus: { ...ref("UsageStatus"), default: "IN_STORAGE" }, notes: { type: "string", nullable: true },
        },
      },
      EquipmentUpdate: {
        type: "object", description: "EquipmentCreate maydonlari, hammasi ixtiyoriy (kamida bittasi). RESPONSIBLE faqat condition, usageStatus, notes.",
        properties: {
          name: { type: "string" }, typeId: { type: "integer" }, brand: { type: "string", nullable: true }, model: { type: "string", nullable: true },
          serialNumber: { type: "string", nullable: true }, purchaseDate: { type: "string", format: "date", nullable: true }, price: { type: "number", nullable: true },
          roomId: { type: "integer", nullable: true }, responsibleUserId: { type: "integer", nullable: true },
          condition: ref("Condition"), usageStatus: ref("UsageStatus"), notes: { type: "string", nullable: true },
        },
      },
      EquipmentList: list("Equipment"),
      HistoryList: list("History"),
      UserList: list("User"),
      DepartmentList: list("Department"),
      RoomList: list("Room"),
      EquipmentTypeList: list("EquipmentType"),
      UserOptionList: list("UserOption"),
      UserOption: { type: "object", properties: { id: { type: "integer" }, fullName: { type: "string" } } },
      History: {
        type: "object",
        properties: { id: { type: "integer" }, equipmentId: { type: "integer" }, action: { type: "string", example: "CREATED" }, field: { type: "string", nullable: true }, oldValue: { type: "string", nullable: true }, newValue: { type: "string", nullable: true }, changedAt: { type: "string", format: "date-time" }, changedBy: { type: "object", properties: { id: { type: "integer" }, fullName: { type: "string" } } } },
      },
      Repair: {
        type: "object",
        properties: { id: { type: "integer" }, equipmentId: { type: "integer" }, sentDate: { type: "string", format: "date-time" }, returnedDate: { type: "string", format: "date-time", nullable: true }, reason: { type: "string" }, repairer: { type: "string", nullable: true }, result: { type: "string", nullable: true }, cost: { type: "number", nullable: true } },
      },
      RepairList: list("Repair"),
      RepairCreate: { type: "object", required: ["reason"], properties: { sentDate: { type: "string", format: "date" }, reason: { type: "string", minLength: 3 }, repairer: { type: "string", nullable: true }, cost: { type: "number", nullable: true } } },
      RepairReturn: {
        type: "object", required: ["result"],
        properties: { returnedDate: { type: "string", format: "date" }, result: { type: "string", minLength: 2 }, cost: { type: "number", nullable: true }, usageStatus: { type: "string", enum: ["IN_USE", "IN_STORAGE"], default: "IN_STORAGE" }, condition: { type: "string", enum: ["GOOD", "FAIR", "BROKEN"], default: "GOOD" } },
      },
      Dashboard: {
        type: "object",
        properties: {
          total: { type: "integer" }, openRepairs: { type: "integer" },
          byCondition: { type: "array", items: { type: "object", properties: { key: ref("Condition"), count: { type: "integer" } } } },
          byUsageStatus: { type: "array", items: { type: "object", properties: { key: ref("UsageStatus"), count: { type: "integer" } } } },
          recent: { type: "array", items: ref("History") },
        },
      },
    },
  },
  paths: {
    "/health": { get: { tags: ["Auth"], summary: "Server ishlayaptimi (token kerak emas)", security: [], responses: { 200: ok("OK", { type: "object", properties: { ok: { type: "boolean" } } }) } } },
    "/auth/login": {
      post: {
        tags: ["Auth"], summary: "Login (15 daqiqada urinishlar cheklangan)", security: [], requestBody: body(ref("LoginInput")),
        responses: { 200: ok("Token va foydalanuvchi", { type: "object", properties: { token: { type: "string" }, user: ref("UserShort") } }), 401: err },
      },
    },
    "/auth/me": { get: { tags: ["Auth"], summary: "Joriy foydalanuvchi", responses: { 200: ok("Foydalanuvchi", ref("UserShort")), 401: err } } },
    "/equipment": {
      get: { tags: ["Equipment"], summary: "Jihozlar ro'yxati (RESPONSIBLE faqat o'zinikini ko'radi)", parameters: eqFilters, responses: { 200: ok("Sahifa", ref("EquipmentList")) } },
      post: { tags: ["Equipment"], summary: `Jihoz qo'shish, inventar raqam avtomatik. ${admin}`, requestBody: body(ref("EquipmentCreate")), responses: { 201: ok("Yaratildi", ref("Equipment")), 400: err, 403: err } },
    },
    "/equipment/{id}": {
      get: { tags: ["Equipment"], summary: "Jihoz kartasi", parameters: [idPath], responses: { 200: ok("Jihoz", ref("Equipment")), 404: err } },
      patch: { tags: ["Equipment"], summary: `Jihozni tahrirlash. ${adminOrResp}`, parameters: [idPath], requestBody: body(ref("EquipmentUpdate")), responses: { 200: ok("Yangilandi", ref("Equipment")), 403: err } },
    },
    "/equipment/{id}/archive": { post: { tags: ["Equipment"], summary: `Arxivlash. ${admin}`, parameters: [idPath], responses: { 200: ok("Arxivlandi", ref("Equipment")) } } },
    "/equipment/{id}/restore": { post: { tags: ["Equipment"], summary: `Arxivdan qaytarish. ${admin}`, parameters: [idPath], responses: { 200: ok("Qaytarildi", ref("Equipment")) } } },
    "/equipment/{id}/history": { get: { tags: ["Equipment"], summary: "O'zgarishlar tarixi", parameters: [idPath, ...page], responses: { 200: ok("Sahifa", ref("HistoryList")) } } },
    "/equipment/{id}/repairs": {
      get: { tags: ["Equipment"], summary: "Jihozning ta'mirlari", parameters: [idPath, ...page], responses: { 200: ok("Sahifa", ref("RepairList")) } },
      post: { tags: ["Equipment"], summary: `Ta'mirga jo'natish (holat IN_REPAIR bo'ladi). ${adminOrResp}`, parameters: [idPath], requestBody: body(ref("RepairCreate")), responses: { 201: ok("Yaratildi", ref("Repair")) } },
    },
    "/equipment/{id}/qr": {
      get: { tags: ["Equipment"], summary: "QR kod (PNG). Ichida inventar raqam (masalan INV-2026-0001)", parameters: [idPath], responses: { 200: { description: "PNG rasm", content: { "image/png": { schema: { type: "string", format: "binary" } } } } } },
    },
    "/repairs": {
      get: { tags: ["Repairs"], summary: `Ta'mirlar ro'yxati. ${adminOrResp}`, parameters: [q("open", { type: "boolean" }, "true: qaytarilmagan, false: qaytarilgan"), q("equipmentId", { type: "integer" }), ...page], responses: { 200: ok("Sahifa", ref("RepairList")) } },
    },
    "/repairs/{id}": {
      patch: { tags: ["Repairs"], summary: `Ta'mirdan qaytarish. ${adminOrResp}`, parameters: [idPath], requestBody: body(ref("RepairReturn")), responses: { 200: ok("Yopildi", ref("Repair")) } },
    },
    ...reference("/departments", "Departments", "Department"),
    ...reference("/rooms", "Rooms", "Room", [q("departmentId", { type: "integer" })]),
    ...reference("/equipment-types", "Equipment types", "EquipmentType"),
    "/users/options": { get: { tags: ["Users"], summary: "Mas'ul tanlash ro'yxati (id, ism). Hamma rol", parameters: [q("search", { type: "string", maxLength: 100 }, "Ism bo'yicha qidiruv"), ...page], responses: { 200: ok("Sahifa", ref("UserOptionList")) } } },
    "/users": {
      get: { tags: ["Users"], summary: `Foydalanuvchilar. ${admin}`, parameters: [q("search", { type: "string", maxLength: 100 }, "Ism yoki email"), q("role", ref("Role")), q("departmentId", { type: "integer" }), q("isActive", { type: "boolean" }), ...page], responses: { 200: ok("Sahifa", ref("UserList")) } },
      post: { tags: ["Users"], summary: `Foydalanuvchi yaratish. ${admin}`, requestBody: body(ref("UserCreate")), responses: { 201: ok("Yaratildi", ref("User")) } },
    },
    "/users/{id}": { patch: { tags: ["Users"], summary: `Tahrirlash / bloklash. ${admin}`, parameters: [idPath], requestBody: body(ref("UserUpdate")), responses: { 200: ok("Yangilandi", ref("User")) } } },
    "/users/{id}/reset-password": {
      post: { tags: ["Users"], summary: `Parolni almashtirish. ${admin}`, parameters: [idPath], requestBody: body({ type: "object", required: ["password"], properties: { password: { type: "string", minLength: 8 } } }), responses: { 200: ok("OK", { type: "object", properties: { message: { type: "string" } } }) } },
    },
    "/reports/dashboard": { get: { tags: ["Reports"], summary: "Dashboard statistikasi", responses: { 200: ok("Statistika", ref("Dashboard")) } } },
    "/reports/inventory": { get: { tags: ["Reports"], summary: "Inventarizatsiya hisoboti (xona bo'yicha)", parameters: eqFilters, responses: { 200: ok("Sahifa", ref("EquipmentList")) } } },
    "/reports/inventory/export": {
      get: {
        tags: ["Reports"], summary: "Excel yoki PDF yuklab olish", parameters: [...eqFilters, q("format", { type: "string", enum: ["xlsx", "pdf"], default: "xlsx" })],
        responses: { 200: { description: "Fayl", content: { "application/octet-stream": { schema: { type: "string", format: "binary" } } } } },
      },
    },
    "/ai/chat": {
      post: {
        tags: ["AI"], summary: "AI yordamchi (faqat o'qish asboblari, rolga mos ma'lumot)",
        requestBody: body({ type: "object", required: ["message"], properties: { message: { type: "string", minLength: 1, maxLength: 1000, example: "Nechta jihoz ta'mirda?" } } }),
        responses: { 200: ok("Javob", { type: "object", properties: { reply: { type: "string" } } }), 502: ok("OpenRouter xatosi"), 503: ok("OPENROUTER_API_KEY o'rnatilmagan") },
      },
    },
  },
};
